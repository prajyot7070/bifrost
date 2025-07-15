import React from "react";

interface TerminalImageProps {
  imagePath: string;
  width?: number;
  height?: number;
  alt?: string;
}

export const TerminalImage: React.FC<TerminalImageProps> = ({
  imagePath,
  width = 400,
  height = 300,
  alt = "Terminal display",
}) => {
  return (
    <div className="inline-block p-4 z-40 relative">
      <div
        className="bg-[#0a0a0a] rounded-xl p-5 border border-neutral-800 shadow-[0_0_60px_rgba(255,255,255,0.02)] hover:shadow-[0_0_80px_rgba(255,255,255,0.05)] transition-all duration-300"
        style={{ width: width + 32, height: height + 100 }}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-neutral-700 rounded-full"></div>
            <div className="w-3 h-3 bg-neutral-700 rounded-full"></div>
            <div className="w-3 h-3 bg-neutral-700 rounded-full"></div>
          </div>
          <div className="text-neutral-500 text-xs font-mono tracking-wide">terminal</div>
        </div>

        {/* Terminal Body */}
        <div className="relative">
          {/* Fake command prompt */}
          <div className="text-neutral-400 text-sm font-mono mb-3">
            <span className="text-neutral-600">$</span> launch --demo
          </div>

          {/* Image Preview */}
          <div
            className="relative overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 transition hover:border-neutral-600"
            style={{ width, height }}
          >
            <img
              src={imagePath}
              alt={alt}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              style={{ width, height }}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>

          {/* Terminal Cursor */}
          <div className="flex items-center mt-3 text-neutral-400 text-sm font-mono">
            <span className="text-neutral-600">$</span>
            <span className="ml-2 w-2 h-5 bg-white animate-pulse rounded-sm"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

