import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Building2 } from "lucide-react";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#e6fbff] dark:from-[#0f172a] dark:to-[#1e293b] text-gray-900 dark:text-white px-4 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-16 py-20">
        {/* Left: Hero Content */}
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Instant Queues.<br />
            No Waiting.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
            Let customers join from home. Let businesses focus on serving — not shouting. Your queue, redesigned.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-lg font-medium hover:bg-green-700 transition"
            >
              <Users size={20} /> Enter as User
            </button>
            <button
              onClick={() => navigate("/business/login")}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-lg font-medium hover:bg-blue-700 transition"
            >
              <Building2 size={20} /> Business Login
            </button>
          </div>
        </div>

        {/* Right: Glowing Card Display */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-blue-400 opacity-50 blur-3xl rounded-3xl animate-pulse" />
          <div className="relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-2xl rounded-3xl p-8 max-w-md mx-auto z-10">
            <h3 className="text-2xl font-bold mb-2">🚀 How it works</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
              <li>📱 User joins queue virtually</li>
              <li>📍 Arrives and gets verified</li>
              <li>🎯 Business serves on time</li>
              <li>📊 Admin dashboard manages flow</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
