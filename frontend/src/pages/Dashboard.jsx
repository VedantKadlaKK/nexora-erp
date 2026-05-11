import { useEffect, useState } from "react";

import API from "../services/api";

import socket from "../services/socket";

import Sidebar from "../components/Sidebar";

import KPIcards from "../components/KPIcards";

import ShipmentTable from "../components/ShipmentTable";

import ActivityFeed from "../components/ActivityFeed";

import FinanceOverview from "../components/FinanceOverview";

export default function Dashboard() {

  const [shipments, setShipments] = useState([]);

  const [activities, setActivities] = useState([]);

  const [finance, setFinance] = useState([]);

  async function fetchShipments() {

    try {

      const response = await API.get("/shipments");

      setShipments(response.data);

    } catch (error) {

      console.error("Error fetching shipments:", error);

    }
  }

  async function fetchActivities() {

    try {

      const response = await API.get("/activities");

      setActivities(response.data);

    } catch (error) {

      console.error("Error fetching activities:", error);

    }
  }

  async function fetchFinance() {

    try {

      const response = await API.get("/finance");

      setFinance(response.data);

    } catch (error) {

      console.error(error);

    }
  }

  useEffect(() => {

    fetchShipments();

    fetchActivities();

    fetchFinance();

    const handleUpdate = () => {

      fetchShipments();

      fetchActivities();

      fetchFinance();

    };

    socket.on("shipment_updated", handleUpdate);

    return () => {

      socket.off("shipment_updated", handleUpdate);

    };

  }, []);

  return (

    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <div className="flex-1 p-8">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">

          Nexora ERP Dashboard

        </h1>

        <KPIcards shipments={shipments} />

        <FinanceOverview finance={finance} />

        <ShipmentTable shipments={shipments} />

        <div className="mt-6">

          <ActivityFeed activities={activities} />

        </div>

      </div>

    </div>

  );
}