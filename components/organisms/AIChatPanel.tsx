"use client";
import { useState, useRef, useEffect } from "react";
import { AIChatUrl } from "@/constants/roomSimulatorConstants";

type furnitureInfo = {
  id: string
  label: string
  position: { x: number; y: number; z: number }
  dimensions: { width: number; height: number; depth: number }
  productId?: number 
}

type AIChatPanelProps = {
  onClose: () => void;
  getCanvasImage: () => string;
  getRoomDimensions: () => { width: number; depth: number; height: number };
  getFurniture: () => furnitureInfo[];
};

const AIChatPanel: React.FC<AIChatPanelProps> = ({ onClose, getCanvasImage, getRoomDimensions, getFurniture }) => {
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string; }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(messages)

  const sendMessage = async () => {
    if (!input.trim()) return;
    const image_base64 = getCanvasImage();
    setMessages((prev) => [...prev, { role: "user", text: input}]);
    setLoading(true);

    // ここでAPIに画像とテキストを送信
    try {
      const res = await fetch( AIChatUrl, {
        method: "POST",
        body: JSON.stringify({ text: [...messagesRef.current, { role: "user", text: input}] , image_base64, roomDimensions: getRoomDimensions(), furnitureList: getFurniture() }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "model", text: data.reply.replace(/\*/g, '') }]);
      setInput("");
      setLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
      setMessages((prev) => [...prev, { role: "model", text: "AIとの通信に失敗しました。" }]);
    }
  };

  useEffect(() => {
    // メッセージの更新を監視
    messagesRef.current = messages;
  }, [messages]);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-bold">AIコンシェルジュに相談</h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-300 hover:bg-red-600">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block px-3 py-2 rounded ${msg.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}>
              {msg.text.split('\n').map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx !== msg.text.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-400">応答中...</div>}
      </div>
      <div className="p-4 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="メッセージを入力"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={sendMessage} disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
          送信
        </button>
      </div>
    </div>
  );
};

export default AIChatPanel;