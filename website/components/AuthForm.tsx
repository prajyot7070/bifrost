
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Input } from "./Input"
import { Eye, EyeOff } from "lucide-react";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (!validateEmail(value)) {
      setEmailError("Enter a valid email");
    } else {
      setEmailError("");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-xl relative z-20">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </h1>

        <form className="space-y-5">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Full Name"
              className="bg-zinc-800 text-white placeholder:text-zinc-400"
            />
          )}

          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              className={cn(
                "bg-zinc-800 text-white placeholder:text-zinc-400",
                emailError && "border-red-500"
              )}
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="bg-zinc-800 text-white placeholder:text-zinc-400 pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-white text-black hover:bg-zinc-200 transition font-semibold"
          >
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="text-white underline hover:text-sky-400 transition"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
