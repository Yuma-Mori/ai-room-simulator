"use client";
import Link from "next/link";
import {HomePageTitle} from "@/constants/roomSimulatorConstants";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-light text-gray-900 tracking-wide hover:text-gray-600 transition-colors">
            {HomePageTitle}
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/room" className="px-4 py-2 bg-orange-200 rounded hover:bg-orange-400 transition-colors">お部屋シミュレータ</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}