import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Building2, LogIn, UserPlus, X } from "lucide-react";

function Landing() {
  const navigate = useNavigate();
  const [showBusinessOptions, setShowBusinessOptions] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-gray-900 dark:text-white px-4 flex items-center justify-center overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20 py-16 lg:py-24 relative z-10">
        {/* Left: Hero Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Now Live</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Instant Queues.
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Zero Waiting.</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
            Revolutionize customer flow. Let people join remotely, arrive on time, and skip the chaos. Built for modern businesses.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/home")}
              className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-lg font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/50 hover:scale-105"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Users size={22} className="relative z-10" />
              <span className="relative z-10">Join as User</span>
            </button>

            <button
              onClick={() => setShowBusinessOptions(true)}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-2xl text-lg font-semibold hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Building2 size={22} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              <span>For Business</span>
            </button>
          </div>

          <div className="flex items-center gap-8 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-400 border-2 border-white dark:border-slate-900" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white dark:border-slate-900" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 border-2 border-white dark:border-slate-900" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">5,000+ active users</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-medium">4.9/5</span>
            </div>
          </div>
        </div>

        {/* Right: Feature Card with floating elements */}
        <div className="relative">
          {/* Glowing orbs */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-3xl rounded-full animate-pulse" />
          
          {/* Main card */}
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-600/50 shadow-2xl rounded-3xl p-8 lg:p-10 z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                How it works
              </h3>
            </div>

            <div className="space-y-4">
              {[
                { icon: "📱", title: "Join Virtually", desc: "Customers join queue from anywhere" },
                { icon: "📍", title: "Smart Arrival", desc: "Get verified and tracked in real-time" },
                { icon: "⚡", title: "Instant Service", desc: "No waiting, perfect timing" },
                { icon: "📊", title: "Full Control", desc: "Powerful admin dashboard" }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                >
                  <span className="text-3xl">{feature.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">SOC 2 Certified</span>
              </div>
            </div>
          </div>

          {/* Business options modal */}
          {showBusinessOptions && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200"
              aria-modal="true"
              role="dialog"
            >
              {/* Enhanced backdrop with blur */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowBusinessOptions(false)}
              />

              <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-8 z-10 animate-in zoom-in-95 duration-300">
                <button
                  onClick={() => setShowBusinessOptions(false)}
                  className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} className="text-slate-500" />
                </button>

                <div className="mb-8">
                  <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
                    <Building2 size={28} className="text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Business Owner</h4>
                  <p className="text-slate-600 dark:text-slate-400">Choose an option to get started with your queue management system.</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowBusinessOptions(false);
                      navigate("/business/login");
                    }}
                    className="group w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="p-2 bg-white/20 rounded-lg">
                      <LogIn size={20} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold">Business Login</div>
                      <div className="text-xs text-blue-100">Access your dashboard</div>
                    </div>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => {
                      setShowBusinessOptions(false);
                      navigate("/business/signup");
                    }}
                    className="group w-full flex items-center gap-4 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-lg">
                      <UserPlus size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold">Register New Business</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Start your free trial</div>
                    </div>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={() => setShowBusinessOptions(false)}
                  className="w-full mt-6 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Landing;
