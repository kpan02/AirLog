import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPopup() {
  return (
    <main className="container mx-auto p-4">
      <div className="max-w-md mx-auto text-center">
        <Image
          src="/airlog-logo.png"
          alt="AirLog"
          width={220}
          height={68}
          className="h-17 mx-auto"
        />
        <p className="text-gray-500 text-center mt-2 font-mono opacity-80">Track your flights</p>
        <div className="h-8" />
        <div className="bg-white rounded-xl border p-8 shadow-sm mt-10">
          <h2 className="text-2xl font-bold mb-4">Welcome to AirLog</h2>
          <div className="flex justify-center gap-4">
            <SignInButton mode="modal">
              <button className="rounded-md px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 transition-all">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
                <button className="rounded-md px-4 py-2 text-sm font-medium bg-white text-blue-600 border border-blue-600 hover:bg-blue-100 hover:scale-105 hover:border-blue-500 transition-all">
                  Sign Up
                </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </main>
  );
} 