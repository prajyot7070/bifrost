
"use client";
import React from "react";
import { Github, Twitter, Mail } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full bg-gradient-to-b from-transparent to-black text-neutral-400 text-sm sm:text-base overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-10 py-20 px-6">
        {/* Top Content */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          
          {/* Brand */}
          <div className="text-center sm:text-left">
            <p className="font-semibold text-white text-lg">Bifrost</p>
            <p className="text-sm text-muted-foreground">
              Building seamless tunnels for developers.
            </p>
          </div>
          {/* Socials */}
          <div className="flex gap-6 items-center justify-center text-muted-foreground">
            <a
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href="https://twitter.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a
              href="mailto:hello@bifrost.dev"
              className="hover:text-white transition"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
        {/* Bottom Content */}
        <div className="relative flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Bifrost. All rights reserved.</p>
          <div className="mt-2 sm:mt-0 flex items-center gap-2">
            <span>Made by</span>
            <span className="text-white font-medium">Prajyot Mane</span>
          </div>
          <div className="absolute right-0 bottom-0 pr-4 pb-2 text-muted-foreground text-xs">
            © Aceternity
          </div>
        </div>
      </div>
    </footer>
  );
};
