"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
// import { fetchFurnitureById } from "@/lib/api";
import { Furniture } from "@/types/furniture";
import * as constants from "@/constants/roomSimulatorConstants";

import Header from "@/components/organisms/Header";
import Footer from "@/components/molecules/Footer";

export const dynamic = 'force-dynamic';

export default function FurnitureDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [furniture, setFurniture] = useState<Furniture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`https://search-product-by-id-404451730547.asia-northeast1.run.app/${params.id}`);
        if (!res.ok) throw new Error('Fetch failed');
        const json = await res.json();
        console.log('Fetched furniture data:', json);
        setFurniture(json)
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(true)
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error || !furniture) {
    // NotFoundの代わりにトップへリダイレクト
    // if (typeof window !== "undefined") router.replace("/");
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-light text-gray-900 mb-4">商品が見つかりませんでした</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            ホームに戻る
          </Link>
        </div>
        <Footer />        
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              ホーム
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{furniture.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 relative overflow-hidden">
            {furniture.id ? (
              <img
                src={`${constants.cdnBaseUrl}/products/${furniture.id}/product.jpg`}
                alt={furniture.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-sm">画像準備中</span>
              </div>
            )}
            {!furniture.stock && (
              <div className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-1 text-xs rounded-full">
                売り切れ
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {furniture.category}
                </span>
                {!furniture.stock && (
                  <span className="text-sm text-white bg-gray-900 px-3 py-1 rounded-full">
                    売り切れ
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-light text-gray-900 mb-4">
                {furniture.name}
              </h1>
              <p className="text-4xl font-light text-gray-900 mb-6">
                ¥{furniture.price.toLocaleString()}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">商品説明</h2>
              <p className="text-gray-600 leading-relaxed">
                {furniture.description}
              </p>
            </div>

            {/* Dimensions */}
            <div>
              <div className="flex justify-between gap-3 mb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">サイズ</h2>
                 <Link
                  href={`/room?itemId=${furniture.id}`}
                  className="block bg-orange-100 w-4/5 py-4 px-6 border border-gray-300 rounded-lg font-medium text-gray-900 text-center hover:bg-gray-50 transition-colors"
                >
                  お部屋シミュレータで試す
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-light text-gray-900 mb-1">
                    {furniture.width * 100}
                  </div>
                  <div className="text-sm text-gray-600">幅 (cm)</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-light text-gray-900 mb-1">
                    {furniture.depth * 100}
                  </div>
                  <div className="text-sm text-gray-600">奥行き (cm)</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-light text-gray-900 mb-1">
                    {furniture.height * 100}
                  </div>
                  <div className="text-sm text-gray-600">高さ (cm)</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                disabled={!furniture.stock}
                className={`w-full py-4 px-6 rounded-lg font-medium transition-colors ${
                  furniture.stock
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => {
                  alert("この機能は実装中です！");
                }}
              >
                {furniture.stock ? "カートに追加" : "売り切れ"}
              </button>
              <Link
                href="/"
                className="block w-full py-4 px-6 border border-gray-300 rounded-lg font-medium text-gray-900 text-center hover:bg-gray-50 transition-colors"
              >
                商品一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}