"use client";

import { BackgroundBeams } from "@/components/background-beams";
import { Navbar } from "@/components/Navbar";
import { Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const downloads = [
  {
    name: "Windows",
    filename: "/downloads/bifrost.exe",
    description: "64-bit executable for Windows",
    logo: "/os-logos/windows-logo.png",
  },
  {
    name: "Mac (Intel)",
    filename: "/downloads/bifrost-mac",
    description: "Binary for Intel-based Macs",
    logo: "/os-logos/apple-logo.png",
  },
  {
    name: "Mac (M1/M2)",
    filename: "/downloads/bifrost-mac-arm64",
    description: "Optimized for Apple Silicon",
    logo: "/os-logos/apple-logo.png",
  },
  {
    name: "Linux",
    filename: "/downloads/bifrost-linux",
    description: "Compiled binary for most Linux distros",
    logo: "/os-logos/linux-logo.png",
  },
];

export default function DownloadsPage() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0 -z-10">
        <BackgroundBeams />
      </div>

      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-12 mt-10">Downloads</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {downloads.map((item, idx) => (
            <Link
              key={idx}
              href={item.filename}
              download
              className="relative group border border-zinc-800 bg-zinc-900 p-6 rounded-xl shadow-md transition-all hover:shadow-xl hover:border-sky-500 flex items-center justify-between gap-4"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />

              {/* Left side - Text */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-2xl font-semibold mb-2 text-white">
                    {item.name}
                  </h2>
                  <p className="text-zinc-400 text-sm">{item.description}</p>
                </div>

                <div className="mt-4 text-sky-400 group-hover:text-white transition flex items-center gap-2 text-sm font-medium">
                  <Download size={16} />
                  <span>Download</span>
                </div>
              </div>

              {/* Right side - Image */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
                <Image
                  src={item.logo}
                  alt={`${item.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

