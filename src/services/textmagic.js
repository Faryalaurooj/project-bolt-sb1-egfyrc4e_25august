import { useState } from "react";
import { sendTextMessage } from "../services/textmagic";

export default function TextingPage() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    try {
      const result = await sendTextMessage(phone, message);
      setStatus(`Message sent! ID: ${result.id}`);
    } catch {
      setStatus("Failed to send message.");
    }
  };

  return (
    <div className="p-4">
      <h2>Send SMS</h2>
      <input
        type="text"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 mr-2"
      />
      <input
        type="text"
        placeholder="Enter your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-2 mr-2"
      />
      <button onClick={handleSend} className="bg-blue-500 text-white p-2">
        Send
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}
