import { useState } from "react";
import { FaPaperPlane, FaRobot } from "react-icons/fa";
import { aiApiClient } from "../services/api";

const ChatbotWidget = () => {
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([
    { role: "assistant", text: "Ask me anything about workouts, recovery, or weight loss." }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    const text = message.trim();
    setItems((prev) => [...prev, { role: "user", text }]);
    setMessage("");
    setLoading(true);

    try {
      const { data } = await aiApiClient.chatbot(text);
      setItems((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (error) {
      setItems((prev) => [...prev, { role: "assistant", text: "Could not reach AI service right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <FaRobot className="text-cyan-300" />
        <h3 className="text-lg font-semibold">AI Trainer Chatbot</h3>
      </div>

      <div className="mb-3 h-56 space-y-2 overflow-y-auto rounded-lg bg-slate-900/40 p-3">
        {items.map((item, index) => (
          <div key={index} className={`rounded-lg px-3 py-2 text-sm ${item.role === "assistant" ? "bg-slate-800 text-slate-100" : "bg-indigo-500/25 text-indigo-100"}`}>
            {item.text}
          </div>
        ))}
        {loading && <p className="text-xs text-slate-400">Thinking...</p>}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Best workout for weight loss?"
          className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        />
        <button type="submit" className="gradient-btn rounded-lg px-4 py-2 text-white">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatbotWidget;
