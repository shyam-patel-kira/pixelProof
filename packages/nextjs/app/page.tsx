"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useEffect } from "react";

const Home: NextPage = () => {
  const { isConnected } = useAccount();
  const router = useRouter();

  return (
    <div className="flex items-center flex-col">
      <div className="px-5">
        {!isConnected && (
          <div>
            <p className="text-center text-lg">Get started by connecting your wallet!</p>
          </div>
        )}
        {isConnected && (
          <div className="flex flex-col items-center justify-center gap-5 mt-5">
            <button
              onClick={() => router.push("/capture")}
              className="relative bg-white text-gray-800 border-none rounded-full py-2 px-4 text-lg cursor-pointer shadow-md transition duration-300 hover:bg-gray-200"
            >
              Capture New Image
            </button>
            <button
              onClick={() => router.push("/verify")}
              className="relative bg-white text-gray-800 border-none rounded-full py-2 px-4 text-lg cursor-pointer shadow-md transition duration-300 hover:bg-gray-200"
            >
              Upload Image to Verify
            </button>
            <button
              onClick={() => router.push("/gallery")}
              className="relative bg-white text-gray-800 border-none rounded-full py-2 px-4 text-lg cursor-pointer shadow-md transition duration-300 hover:bg-gray-200"
            >
              View Gallery
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
