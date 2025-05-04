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
          <p className="text-gray-500 text-center mt-2 font-mono opacity-80">Sign in to continue</p>
        </div>
      </div>
    </main>
  );
} 