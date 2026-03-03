import { useEffect, useRef } from "react";

const useReminders = (reminders = []) => {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => null);
    }

    const timer = setInterval(() => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const stamp = `${hh}:${mm}`;

      reminders.forEach((reminder) => {
        if (!reminder.enabled || reminder.time !== stamp) return;
        const key = `${reminder.time}-${now.toDateString()}`;
        if (notifiedRef.current.has(key)) return;

        notifiedRef.current.add(key);
        new Notification(reminder.title || "Workout Reminder", {
          body: "Time to start your training session."
        });
      });
    }, 30000);

    return () => clearInterval(timer);
  }, [reminders]);
};

export default useReminders;
