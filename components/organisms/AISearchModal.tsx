"use client";
import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {cdnBaseUrl, AISearchUrl} from "@/constants/roomSimulatorConstants";

const CATEGORY_LIST = [  
  { value: "table", label: "テーブル" },
  { value: "chair", label: "チェア" },
  { value: "bed", label: "ベッド" },
];

type AISearchModalProps = {
  open: boolean;
  onClose: () => void;
  getCanvasImage: () => string;
  getRoomDimensions: () => { width: number; depth: number; height: number };
  getFurniture: () => any[];
  onProductSelect: (product: {
    id: number;
    name: string;
    imageUrl: string;
    width: number;
    height: number;
    depth: number;
    modelUrl: string;
    price?: number;
  }) => void;
};

const AISearchModal: React.FC<AISearchModalProps> = ({
  open,
  onClose,
  getCanvasImage,
  getRoomDimensions,
  getFurniture,
  onProductSelect,
}) => {
  if (!open) return null;
  const [category, setCategory] = useState(CATEGORY_LIST[0].label);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    id: number;
    name: string;
    imageUrl: string;
    width: number;
    height: number;
    depth: number;
    modelUrl: string;
    price?: number;
  }>(null);

  const handleSearch = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(AISearchUrl, {
        method: "POST",
        body: JSON.stringify({
          category,
          image: getCanvasImage(),
          roomDimensions: getRoomDimensions(),
          furnitureList: getFurniture(),
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log("AI検索結果:", data);

      setResult(data); 
      setLoading(false);
      setAPIFailed(false);
    } catch (error) {
      console.error("AI検索エラー:", error);
      setLoading(false);
      setResult(null);
      setAPIFailed(true);
    }
  };
  const [APIFailed, setAPIFailed] = useState(false);


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold mb-4">AIで商品検索</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-300 hover:bg-red-600">×</button>
          </div>
          {!result && !loading && (
            <div className="mb-4 text-m text-center">このお部屋に最適な商品を提案します。</div>
          )}
          <div className="mb-4">
            <label className="block mb-2 font-medium">カテゴリを選択</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORY_LIST.map(c => (
                <option key={c.label} value={c.label}>{c.label}</option>
              ))}
            </select>
          </div>
          <Button className="w-full mb-4" onClick={handleSearch} disabled={loading}>
            {loading ? "検索中..." : "AIで検索する"}
          </Button>
          {result && (
            <div className="border-t pt-4">
              <div className="flex flex-col items-center">
                <img src={`${cdnBaseUrl}/products/${result.id}/product.jpg`} alt={result.name} className="w-32 h-32 object-contain mb-2" />
                <div className="font-bold">{result.name}</div>
                {result.price && <div className="text-blue-600 font-semibold">¥{result.price.toLocaleString()}</div>}
                <div className="text-xs text-gray-500 mb-2">
                  サイズ: {result.width}×{result.depth}×{result.height} m
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => {
                      onProductSelect(result);
                      onClose();
                    }}
                  >
                    この商品を部屋に追加
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    キャンセル
                  </Button>
                </div>
              </div>
            </div>
          )}  
          {!result && !loading && APIFailed && (
            <div className="text-sm text-red-600 text-center mb-4">
              現在のカタログからは、お部屋に合う商品が見つかりませんでした。<br />
              よろしければ別のカテゴリを選択して再度お試しください。
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default AISearchModal;