import Link from "next/link";
import { furnitureData } from "@/data/furniture";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-light text-gray-900 tracking-wide">
              FURNITURE COLLECTION
            </h1>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">ソファ</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">テーブル</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">チェア</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">収納</a>
            </nav>
          </div>
        </div>
      </header>

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

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {furnitureData.map((furniture) => (
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
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100">
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
