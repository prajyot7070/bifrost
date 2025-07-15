
"use client";
import React from "react";
import { CanvasRevealEffect } from "./CanvasRevealEffect";

interface FlipCardProps {
  title: string;
  description: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({ title, description }) => {
  return (
    <div className="w-[300px] h-[450px] [perspective:1200px] group cursor-pointer">
      <div className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700 ease-in-out group-hover:[transform:rotateY(180deg)]">

        {/* Front of Card */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden border border-neutral-700 shadow-xl [backface-visibility:hidden] z-10">
          {/* Particle effect background */}
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-black"
            colors={[
              [236, 72, 153],
              [232, 121, 249],
            ]}
            dotSize={2}
          />
          <div className="absolute inset-0 flex items-end justify-center p-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-white text-center z-10 leading-tight">
              {title}
            </h3>
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute inset-0 bg-neutral-900 border border-neutral-700 rounded-2xl px-6 py-8 shadow-lg text-white flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] z-20">
          <p className="text-base sm:text-lg text-neutral-300 text-center leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

