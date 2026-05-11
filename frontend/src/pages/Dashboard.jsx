import { useEffect, useMemo, useState } from "react";

import ActivityFeed from "../components/ActivityFeed";
import AnalyticsPanel from "../components/AnalyticsPanel";
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

export default function Dashboard() {
  const [activeView, setActiveView] = useState("Operations");
  const [shipments, setShipments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [finance, setFinance] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
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

  function addToast(title, message) {
    const id = Date.now();

    setToasts((current) => [...current, { id, title, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }

  async function fetchAnalytics() {
    const response = await API.get("/analytics/overview");
    setAnalytics(response.data);
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
        ] = await Promise.all([
          API.get("/shipments"),
          API.get("/activities"),
          API.get("/finance"),
          API.get("/analytics/overview"),
          API.get("/customers"),
          API.get("/notifications"),
          API.get("/profile"),
        ]);

        setShipments(shipmentResponse.data);
        setActivities(activityResponse.data);
        setFinance(financeResponse.data);
        setAnalytics(analyticsResponse.data);
        setCustomers(customerResponse.data);
        setNotifications(notificationResponse.data);
        setProfile(profileResponse.data);
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
      fetchAnalytics();
      fetchCustomers();
    };

    const handleShipmentDeleted = ({ id }) => {
      setShipments((current) => current.filter((shipment) => shipment.id !== id));
      fetchAnalytics();
    };

    const handleFinanceUpdated = (record) => {
      setFinance((current) => upsertById(current, record));
      fetchAnalytics();
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

    socket.on("shipment_updated", handleShipmentUpdated);
    socket.on("shipment_deleted", handleShipmentDeleted);
    socket.on("finance_updated", handleFinanceUpdated);
    socket.on("activity_created", handleActivityCreated);
    socket.on("notification_created", handleNotificationCreated);
    socket.on("customer_updated", handleCustomerUpdated);

    return () => {
      socket.off("shipment_updated", handleShipmentUpdated);
      socket.off("shipment_deleted", handleShipmentDeleted);
      socket.off("finance_updated", handleFinanceUpdated);
      socket.off("activity_created", handleActivityCreated);
      socket.off("notification_created", handleNotificationCreated);
      socket.off("customer_updated", handleCustomerUpdated);
    };
  }, []);

  async function updateShipment(shipmentId, data) {
    await API.put(`/shipments/${shipmentId}`, data);
    setSelectedShipment(null);
    addToast("Shipment updated", "Realtime events are syncing the dashboard.");
  }

  async function deleteShipment(shipmentId) {
    await API.delete(`/shipments/${shipmentId}`);
    setSelectedShipment(null);
    addToast("Shipment deleted", "The shipment was removed from operations.");
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
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1500px] border-x border-slate-200 bg-slate-50">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        <main className="min-w-0 flex-1">
          <TopNavbar
            profile={profile}
            activeView={activeView}
            onViewChange={setActiveView}
            unreadCount={unreadCount}
            onToggleNotifications={() => setNotificationOpen((open) => !open)}
          />

          <div className="space-y-5 p-4 md:p-8">
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
                <KPIcards shipments={shipments} finance={finance} analytics={analytics} />

                {activeView === "Operations" && (
                  <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                    <div className="space-y-5">
                      <ShipmentTable
                        shipments={shipments}
                        onSelectShipment={setSelectedShipment}
                      />
                    </div>
                    <div className="space-y-5">
                      <FinanceOverview finance={finance} />
                      <ActivityFeed activities={activities} />
                    </div>
                  </div>
                )}

                {activeView === "Analytics" && (
                  <AnalyticsPanel analytics={analytics} />
                )}

                {activeView === "Customers" && (
                  <CustomerPanel
                    customers={customers}
                    shipments={shipments}
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
        onClose={() => setSelectedShipment(null)}
        onUpdate={updateShipment}
        onDelete={deleteShipment}
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
