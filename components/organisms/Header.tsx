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
            <Link href="/room" className="text-gray-600 hover:text-gray-900 transition-colors">3Dシミュレーター</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}