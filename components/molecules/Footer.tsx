"use client";
import {HomePageTitle} from "@/constants/roomSimulatorConstants";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h3 className="text-lg font-light text-gray-900 mb-4">{HomePageTitle}</h3>
          <p className="text-gray-400 text-xs mt-6">
            © {new Date().getFullYear()} Yuma Mori All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}