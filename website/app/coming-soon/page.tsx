"use client"

import Image from "next/image";
import React, { useState } from "react";
import { AnimatedBifrostLogo } from "@/components/BifrostAnimatedLogo";
export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      setMessage('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    // Simulate API call (replace with actual API endpoint later)
    try {
      console.log('Submitting email:', email);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      setMessage('Thanks for your interest! We\'ll notify you soon.');
      setEmail(''); // Clear email field
    } catch (error) {
      console.error('Submission error:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center font-inter relative overflow-hidden">
    {/* Background lines/texture - Sharp edges, high contrast lines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        {/* Top-left corner lines */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-slate-100 translate-x-8 translate-y-8"></div>

        {/* Top-right corner lines */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-slate-100 -translate-x-8 translate-y-8"></div>

        {/* Bottom-left corner lines */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-slate-100 translate-x-8 -translate-y-8"></div>

        {/* Bottom-right corner lines */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-slate-100 -translate-x-8 -translate-y-8"></div>

        {/* Subtle central cross lines */}
        <div className=" absolute top-7/8 left-0 w-full h-px bg-slate-100 opacity-60 transform -translate-y-1/2"></div>
        <div className=" absolute left-1/6 top-0 h-full w-px bg-slate-100 opacity-60 transform -translate-x-1/2"></div>
      </div>
    <div className="z-1">
    <Image 
    src="/logo.png"
    alt="Logo"
    width={500}
    height={300}
    /> 
    </div>
      {/* Content Layer - Centered and clean */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 md:p-8 lg:p-12 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight text-slate-100">
          Bifrost is <br/> Coming Soon.
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-xl">
          Prepare to instantly connect your localhost to the world. We're putting the finishing touches on your ultimate dev tunnel.
        </p>

        {/* Email Capture Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-grow p-3 rounded-sm bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-300 shadow-inner"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-sm bg-gray-100 text-gray-950 font-bold border border-gray-700 shadow-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Notify Me'}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm font-medium text-gray-300">
            {message}
          </p>
        )}
        <p className="mt-6 text-xs text-gray-500">
          We respect your privacy. No spam, just updates.
        </p>
      </div>

      {/* Optional: Footer */}
      <footer className="absolute bottom-4 text-gray-600 text-sm z-10">
        &copy; {new Date().getFullYear()} Bifrost. All rights reserved.
      </footer>
    </div>
  );}

