"use client"
import React, { useState, useEffect } from "react";

// Animated Bifrost Logo Component
export const AnimatedBifrostLogo = ({ size = 400 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size * 0.6}
        viewBox="0 0 800 480"
        className={`transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
      >
        <defs>
          <radialGradient id="globeGradient" cx="0.3" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#4338ca" />
            <stop offset="60%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </radialGradient>
          
          <radialGradient id="innerSphereGradient" cx="0.3" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
          
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#0e7490" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="innerGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle cx="240" cy="240" r="140" fill="none" stroke="#4338ca" strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values="140;160;140" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="4s" repeatCount="indefinite" />
        </circle>
        
        <circle cx="240" cy="240" r="160" fill="none" stroke="#4338ca" strokeWidth="1" opacity="0.2">
          <animate attributeName="r" values="160;180;160" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.05;0.2" dur="6s" repeatCount="indefinite" />
        </circle>
        
        <circle 
          cx="240" 
          cy="240" 
          r="120" 
          fill="url(#globeGradient)"
          filter="url(#glow)"
          className="animate-pulse"
          style={{ animationDuration: '3s', animationDelay: '0.5s' }}
        />
        
        <g stroke="#6366f1" strokeWidth="1.5" fill="none" opacity="0.6">
          <ellipse cx="240" cy="240" rx="120" ry="40" />
          <ellipse cx="240" cy="240" rx="120" ry="80" />
          <ellipse cx="240" cy="240" rx="120" ry="120" />
          <ellipse cx="240" cy="240" rx="40" ry="120" />
          <ellipse cx="240" cy="240" rx="80" ry="120" />
          <line x1="120" y1="240" x2="360" y2="240" />
        </g>
        
        <circle 
          cx="240" 
          cy="240" 
          r="60" 
          fill="url(#innerSphereGradient)"
          filter="url(#innerGlow)"
        >
          <animate attributeName="r" values="60;65;60" dur="2s" repeatCount="indefinite" />
        </circle>
        
        <g stroke="#fbbf24" strokeWidth="1" fill="none" opacity="0.7">
          <ellipse cx="240" cy="240" rx="60" ry="20" />
          <ellipse cx="240" cy="240" rx="60" ry="40" />
          <ellipse cx="240" cy="240" rx="60" ry="60" />
          <ellipse cx="240" cy="240" rx="20" ry="60" />
          <ellipse cx="240" cy="240" rx="40" ry="60" />
          <line x1="180" y1="240" x2="300" y2="240" />
        </g>
        
        <g>
          <polygon 
            points="360,240 800,220 800,260" 
            fill="url(#beamGradient)"
            filter="url(#glow)"
            opacity="0.9"
          >
            <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite" />
          </polygon>
          
          <circle cx="400" cy="240" r="2" fill="#06b6d4" opacity="0.8">
            <animate attributeName="cx" values="400;700;400" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" />
          </circle>
          
          <circle cx="450" cy="235" r="1.5" fill="#0891b2" opacity="0.6">
            <animate attributeName="cx" values="450;750;450" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
          </circle>
          
          <circle cx="420" cy="245" r="1" fill="#67e8f9" opacity="0.7">
            <animate attributeName="cx" values="420;720;420" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3.5s" repeatCount="indefinite" />
          </circle>
          
          <polygon 
            points="360,240 800,220 800,260" 
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            opacity="0.5"
          >
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="1.5s" repeatCount="indefinite" />
          </polygon>
        </g>
        
        <circle cx="240" cy="240" r="15" fill="#fbbf24" opacity="0.8">
          <animate attributeName="r" values="15;25;15" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite" />
        </circle>
        
        <g>
          <circle cx="180" cy="200" r="1" fill="#67e8f9" opacity="0.6">
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              values="0 240 240;360 240 240" 
              dur="8s" 
              repeatCount="indefinite"
            />
          </circle>
          
          <circle cx="300" cy="180" r="1.5" fill="#06b6d4" opacity="0.7">
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              values="0 240 240;-360 240 240" 
              dur="12s" 
              repeatCount="indefinite"
            />
          </circle>
          
          <circle cx="160" cy="280" r="1" fill="#0891b2" opacity="0.5">
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              values="0 240 240;360 240 240" 
              dur="10s" 
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>
    </div>
  );
};
