"use client";
export default function SignupError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="bg-white/10 rounded-xl p-8 max-w-sm w-full text-center">
        <h2 className="text-2xl font-semibold text-red-400 mb-4">Something went wrong</h2>
        <p className="text-gray-300 mb-6">
          We couldn't load the signup form. Please try again later.
        </p>
        <a href="/auth/signup" className="underline text-white/80 hover:text-white">
          Back to Signup
        </a>
      </div>
    </div>
  );
}
