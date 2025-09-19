"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StoreManagement() {
  return (
    <div className="bg-neutral-900 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Store management</h3>
          <p className="text-sm text-gray-400">
            Setup a store and manage transactions
          </p>
        </div>

        <Link
          href="/store"
          className="text-xl hover:translate-x-1 transition-transform">
          <ArrowRight />
        </Link>
      </div>

      <div className="mt-4 w-full flex justify-center">
        <img
          src="/assets/e9243be0b3ade6de587540fa09033d222fd0929e.png"
          alt="Store"
          className="w-36 h-auto object-contain"
        />
      </div>
    </div>
  );
}
