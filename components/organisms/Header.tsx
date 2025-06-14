"use client";
import Link from "next/link";

export default function Header() {
  return (
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
  );
}