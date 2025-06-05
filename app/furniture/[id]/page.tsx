import Link from "next/link";
import { notFound } from "next/navigation";
import { furnitureData } from "@/data/furniture";

interface FurnitureDetailProps {
  params: {
    id: string;
  };
}

export default function FurnitureDetail({ params }: FurnitureDetailProps) {
  const furniture = furnitureData.find((item) => item.id === params.id);

  if (!furniture) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-light text-gray-900 tracking-wide hover:text-gray-600 transition-colors">
              FURNITURE COLLECTION
            </Link>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">ソファ</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">テーブル</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">チェア</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">収納</a>
            </nav>
          </div>
        </div>
      </header>

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
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-lg">画像準備中</span>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {furniture.category}
                </span>
                {!furniture.inStock && (
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
              <h2 className="text-lg font-medium text-gray-900 mb-4">サイズ</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-light text-gray-900 mb-1">
                    {furniture.dimensions.width}
                  </div>
                  <div className="text-sm text-gray-600">幅 (cm)</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-light text-gray-900 mb-1">
                    {furniture.dimensions.height}
                  </div>
                  <div className="text-sm text-gray-600">高さ (cm)</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-light text-gray-900 mb-1">
                    {furniture.dimensions.depth}
                  </div>
                  <div className="text-sm text-gray-600">奥行き (cm)</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                disabled={!furniture.inStock}
                className={`w-full py-4 px-6 rounded-lg font-medium transition-colors ${
                  furniture.inStock
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {furniture.inStock ? "カートに追加" : "売り切れ"}
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

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-lg font-light text-gray-900 mb-4">FURNITURE COLLECTION</h3>
            <p className="text-gray-600 text-sm">
              上質な家具で、あなたの暮らしをより豊かに
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
