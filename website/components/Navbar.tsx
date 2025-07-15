"use client";
import React from "react";

export const Navbar = () => {
  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="backdrop-blur-sm bg-black/60 border border-neutral-800 text-white px-8 py-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.05)] flex items-center space-x-8">
        <a
          href="#home"
          className="text-sm font-medium text-neutral-300 hover:text-white transition"
        >
          Home
        </a>
        <a
          href="#features"
          className="text-sm font-medium text-neutral-300 hover:text-white transition"
        >
          Features
        </a>
        <a
          href="#pricing"
          className="text-sm font-medium text-neutral-300 hover:text-white transition"
        >
          Pricing
        </a>
        <a
          href="#docs"
          className="text-sm font-medium text-neutral-300 hover:text-white transition"
        >
          Docs
        </a>
        <a
          href="#contact"
          className="text-sm font-medium text-neutral-300 hover:text-white transition"
        >
          Contact
        </a>
      </div>
    </nav>
  );
};
