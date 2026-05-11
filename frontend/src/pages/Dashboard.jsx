import { useEffect, useMemo, useState } from "react";

import ActivityFeed from "../components/ActivityFeed";
import AnalyticsPanel from "../components/AnalyticsPanel";
import AuditTrail from "../components/AuditTrail";
import CreateShipmentModal from "../components/CreateShipmentModal";
import CustomerPanel from "../components/CustomerPanel";
import FinanceOverview from "../components/FinanceOverview";
import KPIcards from "../components/KPIcards";
import NotificationPanel from "../components/NotificationPanel";
import ShipmentActionModal from "../components/ShipmentActionModal";
import ShipmentTable from "../components/ShipmentTable";
import Sidebar from "../components/Sidebar";
import ToastHost from "../components/ToastHost";
import TopNavbar from "../components/TopNavbar";
import API from "../services/api";
import socket from "../services/socket";

function upsertById(items, item) {
  if (!item?.id) {
    return items;
  }

  const exists = items.some((current) => current.id === item.id);

  if (!exists) {
    return [item, ...items];
  }

  return items.map((current) => (current.id === item.id ? item : current));
}

function prependUnique(items, item) {
  if (!item?.id) {
    return items;
  }

  return [item, ...items.filter((current) => current.id !== item.id)].slice(0, 50);
}

function dayKey(value) {
  if (!value) {
    return "Unscheduled";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function buildOperationalAnalytics(shipments, finance) {
  const statusMap = new Map();
  const paymentMap = new Map();
  const revenueMap = new Map();
  const delayMap = new Map();
  const routeMap = new Map();

  shipments.forEach((shipment) => {
    statusMap.set(shipment.status, (statusMap.get(shipment.status) || 0) + 1);
    paymentMap.set(
      shipment.payment_status,
      (paymentMap.get(shipment.payment_status) || 0) + 1
    );

    const route = `${shipment.origin} to ${shipment.destination}`;
    routeMap.set(route, (routeMap.get(route) || 0) + 1);

    if (shipment.status === "Delayed") {
      const key = dayKey(shipment.updated_at || shipment.created_at);
      delayMap.set(key, (delayMap.get(key) || 0) + 1);
    }
  });

  finance.forEach((item) => {
    const key = dayKey(item.created_at);
    revenueMap.set(key, (revenueMap.get(key) || 0) + (item.revenue_amount || 0));
  });

  const delayed = shipments.filter((shipment) => shipment.status === "Delayed").length;
  const delivered = shipments.filter((shipment) => shipment.status === "Delivered").length;
  const totalRevenue = finance.reduce((sum, item) => sum + (item.revenue_amount || 0), 0);

  return {
    status_counts: Array.from(statusMap, ([name, value]) => ({ name, value })),
    payment_counts: Array.from(paymentMap, ([name, value]) => ({ name, value })),
    revenue_trend: Array.from(revenueMap, ([date, revenue]) => ({ date, revenue })),
    delay_trend: Array.from(delayMap, ([date, delays]) => ({ date, delays })),
    top_routes: Array.from(routeMap, ([route, count]) => ({
      route,
      shipments: count,
    }))
      .sort((a, b) => b.shipments - a.shipments)
      .slice(0, 5),
    insights: {
      total_revenue: totalRevenue,
      delay_rate: shipments.length ? Math.round((delayed / shipments.length) * 1000) / 10 : 0,
      delivery_rate: shipments.length
        ? Math.round((delivered / shipments.length) * 1000) / 10
        : 0,
      active_routes: routeMap.size,
    },
  };
}

export default function Dashboard() {
  const [activeView, setActiveView] = useState("Operations");
  const [shipments, setShipments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [finance, setFinance] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [audits, setAudits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [createShipmentOpen, setCreateShipmentOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const selectedFinance = useMemo(
    () =>
      finance.find(
        (item) =>
          item.shipment_id === selectedShipment?.id ||
          item.shipment_code === selectedShipment?.shipment_code
      ),
    [finance, selectedShipment]
  );

  const unreadCount = notifications.filter((item) => !item.is_read).length;
  const liveAnalytics = useMemo(
    () => buildOperationalAnalytics(shipments, finance),
    [shipments, finance]
  );

  function addToast(title, message) {
    const id = Date.now();

    setToasts((current) => [...current, { id, title, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }

  async function fetchCustomers() {
    const response = await API.get("/customers");
    setCustomers(response.data);
  }

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [
          shipmentResponse,
          activityResponse,
          financeResponse,
          analyticsResponse,
          customerResponse,
          notificationResponse,
          profileResponse,
          auditResponse,
        ] = await Promise.all([
          API.get("/shipments"),
          API.get("/activities"),
          API.get("/finance"),
          API.get("/analytics/overview"),
          API.get("/customers"),
          API.get("/notifications"),
          API.get("/profile"),
          API.get("/audit-logs"),
        ]);

        setShipments(shipmentResponse.data);
        setActivities(activityResponse.data);
        setFinance(financeResponse.data);
        setAnalytics(analyticsResponse.data);
        setCustomers(customerResponse.data);
        setNotifications(notificationResponse.data);
        setProfile(profileResponse.data);
        setAudits(auditResponse.data);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  useEffect(() => {
    const handleShipmentUpdated = (shipment) => {
      setShipments((current) => upsertById(current, shipment));
      setSelectedShipment((current) =>
        current?.id === shipment.id ? { ...current, ...shipment } : current
      );
      fetchCustomers();
    };

    const handleShipmentDeleted = ({ id }) => {
      setShipments((current) => current.filter((shipment) => shipment.id !== id));
      setSelectedShipment((current) => (current?.id === id ? null : current));
    };

    const handleFinanceUpdated = (record) => {
      setFinance((current) => upsertById(current, record));
    };

    const handleActivityCreated = (activity) => {
      setActivities((current) => prependUnique(current, activity));
    };

    const handleNotificationCreated = (notification) => {
      setNotifications((current) => prependUnique(current, notification));
      addToast(notification.title, notification.message);
    };

    const handleCustomerUpdated = (customer) => {
      setCustomers((current) => upsertById(current, customer));
    };

    const handleAuditCreated = (audit) => {
      setAudits((current) => prependUnique(current, audit));
    };

    socket.on("shipment_updated", handleShipmentUpdated);
    socket.on("shipment_deleted", handleShipmentDeleted);
    socket.on("finance_updated", handleFinanceUpdated);
    socket.on("activity_created", handleActivityCreated);
    socket.on("notification_created", handleNotificationCreated);
    socket.on("customer_updated", handleCustomerUpdated);
    socket.on("audit_created", handleAuditCreated);

    return () => {
      socket.off("shipment_updated", handleShipmentUpdated);
      socket.off("shipment_deleted", handleShipmentDeleted);
      socket.off("finance_updated", handleFinanceUpdated);
      socket.off("activity_created", handleActivityCreated);
      socket.off("notification_created", handleNotificationCreated);
      socket.off("customer_updated", handleCustomerUpdated);
      socket.off("audit_created", handleAuditCreated);
    };
  }, []);

  async function performShipmentAction(shipmentId, action, data) {
    try {
      await API.post(`/shipments/${shipmentId}/actions`, {
        action,
        ...data,
      });
      setSelectedShipment(null);
      addToast("Operation applied", "Realtime events synced shipment, finance, and audit state.");
    } catch (error) {
      addToast(
        "Operation blocked",
        error.response?.data?.detail || "The workflow service rejected this action."
      );
    }
  }

  async function deleteShipment(shipmentId) {
    try {
      await API.delete(`/shipments/${shipmentId}`);
      setSelectedShipment(null);
      addToast("Shipment deleted", "The shipment was removed from operations.");
    } catch (error) {
      addToast(
        "Delete blocked",
        error.response?.data?.detail || "Shipment could not be deleted."
      );
    }
  }

  async function createShipment(data) {
    try {
      await API.post("/shipments", data);
      setCreateShipmentOpen(false);
      addToast("Shipment created", "The lifecycle started in Created state.");
      return true;
    } catch (error) {
      addToast(
        "Create shipment failed",
        error.response?.data?.detail || "Check required fields and shipment code."
      );
      return false;
    }
  }

  async function createCustomer(data) {
    const response = await API.post("/customers", data);
    setCustomers((current) => upsertById(current, response.data));
    addToast("Customer created", `${response.data.name} is ready for shipment ownership.`);
  }

  async function markNotificationRead(id) {
    const response = await API.put(`/notifications/${id}/read`);
    setNotifications((current) => upsertById(current, response.data));
  }

  async function markAllNotificationsRead() {
    await API.put("/notifications/read-all");
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] border-x border-slate-200 bg-slate-50">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        <main className="min-w-0 flex-1">
          <TopNavbar
            profile={profile}
            activeView={activeView}
            onViewChange={setActiveView}
            unreadCount={unreadCount}
            onToggleNotifications={() => setNotificationOpen((open) => !open)}
          />

          <div className="min-w-0 space-y-5 p-4 md:p-8">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
                  />
                ))}
              </div>
            ) : (
              <>
                <KPIcards shipments={shipments} finance={finance} analytics={liveAnalytics} />

                {activeView === "Operations" && (
                  <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
                    <div className="min-w-0 space-y-5">
                      <ShipmentTable
                        shipments={shipments}
                        onSelectShipment={setSelectedShipment}
                        onCreateShipment={() => setCreateShipmentOpen(true)}
                      />
                    </div>
                    <div className="min-w-0 space-y-5">
                      <FinanceOverview finance={finance} />
                      <AuditTrail audits={audits} />
                      <ActivityFeed activities={activities} />
                    </div>
                  </div>
                )}

                {activeView === "Analytics" && (
                  <AnalyticsPanel analytics={liveAnalytics || analytics} />
                )}

                {activeView === "Customers" && (
                  <CustomerPanel
                    customers={customers}
                    shipments={shipments}
                    audits={audits}
                    onCreateCustomer={createCustomer}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <ShipmentActionModal
        key={selectedShipment?.id || "shipment-modal"}
        shipment={selectedShipment}
        financeRecord={selectedFinance}
        profile={profile}
        onClose={() => setSelectedShipment(null)}
        onAction={performShipmentAction}
        onDelete={deleteShipment}
      />

      <CreateShipmentModal
        open={createShipmentOpen}
        onClose={() => setCreateShipmentOpen(false)}
        onCreate={createShipment}
      />

      <NotificationPanel
        open={notificationOpen}
        notifications={notifications}
        onClose={() => setNotificationOpen(false)}
        onMarkRead={markNotificationRead}
        onMarkAllRead={markAllNotificationsRead}
      />

      <ToastHost toasts={toasts} />
    </div>
  );
}
