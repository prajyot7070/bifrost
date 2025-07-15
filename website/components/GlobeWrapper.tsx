
"use client";

import dynamic from "next/dynamic";
import React from "react";
import { GlobeConfig } from "./Globe"; // Adjust if needed

// Dynamic import of the actual Globe rendering logic
const World = dynamic(() => import("./Globe").then((mod) => mod.World), {
  ssr: false,
  loading: () => (
    <div className="text-center text-muted text-white">Loading globe...</div>
  ),
});

interface GlobeWrapperProps {
  globeConfig: GlobeConfig;
  data: any[]; // replace with exact type if available
}

export const GlobeWrapper: React.FC<GlobeWrapperProps> = ({
  globeConfig,
  data,
}) => {
  return (
    <div className="relative w-full h-[1200px] overflow-hidden -mb-32 z-10">
      <World globeConfig={globeConfig} data={data} />
    </div>
  );
};
