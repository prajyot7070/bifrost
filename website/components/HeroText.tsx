
"use client";

import React from "react";
import { TextHoverEffect } from "./TextHoverEffect";

export const HeroText = () => {
  return (
    <div className="absolute inset-0 z-10 flex items-start justify-center pt-[12vh] px-6 text-center">
      <div className="max-w-5xl space-y-5">
        {/* Animated Title */}
        <div className="h-[140px] sm:h-[160px] md:h-[180px] flex items-center justify-center">
          <TextHoverEffect text="Bifrost" />
        </div>

        {/* Subheading */}
        <h2 className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium">
          Your Localhost, Globally Accessible
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
Instantly share your local development environment with secure, public HTTPS tunnels – no deployments needed.
        </p>

        {/* CTA Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button className="px-5 py-2 text-black bg-white hover:bg-gray-200 rounded-full text-sm font-medium transition">
            🚀 Get Started
          </button>
          <button className="px-5 py-2 border border-gray-600 text-white hover:bg-gray-800 rounded-full text-sm font-medium transition">
            Learn More
          </button>
        </div>

      </div>
    </div>
  );
};

