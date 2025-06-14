"use client";
import Link from "next/link";
import { fetchFurnitureList } from "@/lib/api";
import { Furniture } from "@/types/furniture";
import { useEffect, useState } from "react";

import Header from "@/components/organisms/Header";
import Footer from "@/components/molecules/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-wide">
            上質な暮らしを<br />
            <span className="text-gray-600">デザインする</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            洗練されたデザインと機能性を兼ね備えた家具で、あなたの空間を特別な場所に変えませんか。
          </p>
        </div>
      </section>

      {/* 商品カード */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FurnitureGrid />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FurnitureGrid() {
  // 商品一覧を取得して表示する
  const [furnitureList, setFurnitureList] = useState<Furniture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 商品一覧をAPIから取得
    fetchFurnitureList()
      .then((response) => {
        if (response.success && response.data) {
          setFurnitureList(response.data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">商品の読み込みに失敗しました</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {furnitureList.map((furniture) => (
        <Link
          key={furniture.id}
          href={`/furniture/${furniture.id}`}
          className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
        >
          <div className="aspect-square bg-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-sm">画像準備中</span>
            </div>
            {!furniture.inStock && (
              <div className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-1 text-xs rounded-full">
                売り切れ
              </div>
            )}
          </div>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
              {furniture.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {furniture.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-light text-gray-900">
                ¥{furniture.price.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                {furniture.category}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}