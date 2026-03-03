import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { userApi } from "../services/api";
import useReminders from "../hooks/useReminders";

const AppShell = () => {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    userApi
      .getReminders()
      .then((res) => setReminders(res.data.reminders || []))
      .catch(() => setReminders([]));
  }, []);

  useReminders(reminders);

  return (
    <div className="min-h-screen bg-mesh text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:px-8 md:py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
