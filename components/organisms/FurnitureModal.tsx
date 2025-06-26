"use client"
import React from "react";
import { furnitureCatalog } from "@/constants/roomSimulatorConstants";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (furnitureName: string) => void;
};

const FurnitureModal: React.FC<ModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex lg:items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-4/5 max-w-2xl max-h-screen overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">家具を選択してください</h3>
        <div className="grid lg:grid-cols-2 gap-4">
          {furnitureCatalog.map((furniture, index) => (
            <div
              key={index}
              className="p-4 bg-gray-100 rounded shadow cursor-pointer hover:bg-gray-200"
              onClick={() => {
                onSelect(furniture.name);
                onClose();
              }}
            >
              <span className="text-sm font-medium text-gray-700">{furniture.name}</span>
            </div>
          ))}
        </div>
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default FurnitureModal;