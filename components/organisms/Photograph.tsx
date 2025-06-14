"use client"
import { useRef } from "react";
import { Camera } from "lucide-react";

type BuildRoomProps = {
  BuildRoom: (room: {
    roomDimensions: { width: number; depth: number; height: number };
    furnitures: Array<{
      label: string;
      position: { x: number; y: number; z: number };
      dimensions: { width: number; height: number; depth: number };
      rotation: { x: number; y: number; z: number };
      color?: string;
    }>;
  }) => void;
};

const Photograph: React.FC<BuildRoomProps> = ({ BuildRoom }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // カメラアイコン押下時
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // 画像選択時
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!open) return null;
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // 画像をAPIにPOST
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/room-analyze", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        alert("部屋解析APIの呼び出しに失敗しました");
        return;
      }
      const result = await res.json();

      // 親コンポーネントに部屋情報を渡す
      if (result.roomDimensions && result.furnitures) {
        BuildRoom({
          roomDimensions: result.roomDimensions,
          furnitures: result.furnitures,
        });
      }
    } catch (err) {
      alert("部屋解析APIの呼び出し中にエラーが発生しました");
    }
  };

  return (
    <>
      <button
        className="fixed bottom-40 right-6 z-50 bg-white text-blue-500 rounded-full shadow-lg w-12 h-12 flex items-center justify-center hover:bg-blue-100 border border-blue-300"
        onClick={handleCameraClick}
        aria-label="部屋を撮影して解析"
        type="button"
      >
        <Camera className="w-7 h-7" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageChange}
      />
    </>
  );
};

export default Photograph;