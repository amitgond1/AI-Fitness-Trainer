import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MotionPage from "../components/MotionPage";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../services/api";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [reminder, setReminder] = useState({ title: "Daily Workout", time: "18:00", enabled: true });
  const [reminders, setReminders] = useState([]);

  const loadReminders = () => {
    userApi
      .getReminders()
      .then((res) => setReminders(res.data.reminders || []))
      .catch(() => setReminders([]));
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const updatePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await userApi.changePassword(passwordForm);
      setMessage("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (error) {
      setMessage(error?.response?.data?.message || "Could not change password.");
    }
  };

  const saveReminder = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await userApi.saveReminder(reminder);
      setMessage("Reminder saved.");
      loadReminders();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Could not save reminder.");
    }
  };

  const deleteAccount = async () => {
    const yes = window.confirm("Delete your account permanently?");
    if (!yes) return;

    try {
      await userApi.deleteAccount();
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      setMessage("Could not delete account.");
    }
  };

  return (
    <MotionPage>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <p className="mt-2 text-sm text-slate-300">Current mode: {theme}</p>
          <button onClick={toggleTheme} className="mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white">
            Toggle Dark/Light Mode
          </button>
        </section>

        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-xl font-semibold">Change Password</h2>
          <form onSubmit={updatePassword} className="mt-3 space-y-3">
            <input type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2" required />
            <input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2" required />
            <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm text-white">Update Password</button>
          </form>
        </section>

        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-xl font-semibold">Workout Reminders</h2>
          <form onSubmit={saveReminder} className="mt-3 grid gap-3 sm:grid-cols-2">
            <input placeholder="Title" value={reminder.title} onChange={(e) => setReminder((prev) => ({ ...prev, title: e.target.value }))} className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2" />
            <input type="time" value={reminder.time} onChange={(e) => setReminder((prev) => ({ ...prev, time: e.target.value }))} className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2" required />
            <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
              <input type="checkbox" checked={reminder.enabled} onChange={(e) => setReminder((prev) => ({ ...prev, enabled: e.target.checked }))} />
              Enable reminder notification
            </label>
            <button className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white sm:col-span-2">Save Reminder</button>
          </form>
          <div className="mt-4 space-y-2 text-sm">
            {reminders.map((r, i) => (
              <div key={`${r.time}-${i}`} className="rounded-lg bg-slate-900/60 px-3 py-2">
                {r.title} at {r.time} {r.enabled ? "(enabled)" : "(disabled)"}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card rounded-2xl border border-rose-600/40 p-5">
          <h2 className="text-xl font-semibold text-rose-300">Danger Zone</h2>
          <p className="mt-2 text-sm text-slate-300">Delete your account and all workout data.</p>
          <button onClick={deleteAccount} className="mt-4 rounded-lg bg-rose-500 px-4 py-2 text-sm text-white">Delete Account</button>
        </section>
      </div>
      {message && <p className="mt-4 text-sm text-cyan-300">{message}</p>}
    </MotionPage>
  );
};

export default SettingsPage;
