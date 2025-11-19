import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, Lock, MapPin, FileText, User, ArrowRight, Check } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function BusinessSignup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    description: "",
    location: ""
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/signup`, form);
      const { token, businessId, placeId } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("businessId", businessId);

      if (placeId) {
        navigate(`/admin/place/${placeId}`);
      } else {
        navigate("/admin/add-place");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center px-4 py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left: Brand Panel */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-10 lg:p-14 flex flex-col justify-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="inline-flex p-3 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                  <Building2 size={32} />
                </div>
                
                <h2 className="text-4xl font-black mb-4 leading-tight">
                  Start Your Journey
                </h2>
                <p className="text-lg text-indigo-100 mb-8 leading-relaxed">
                  Join thousands of businesses revolutionizing customer experience with intelligent queue management.
                </p>
                
                <div className="space-y-4">
                  {[
                    "Real-time queue analytics",
                    "Smart customer notifications",
                    "Seamless verification system",
                    "Advanced admin dashboard",
                    "24/7 dedicated support"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-indigo-50">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-white/20">
                  <p className="text-sm text-indigo-100 mb-3">Trusted by industry leaders</p>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30" />
                    ))}
                    <span className="ml-2 text-xs text-indigo-100">+2,500 businesses</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form Panel */}
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Create Account
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Get started with your 30-day free trial
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      name="name"
                      placeholder="Your Name"
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      name="companyName"
                      placeholder="Company Name"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    name="email"
                    type="email"
                    placeholder="Business Email"
                    onChange={handleChange}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    name="password"
                    placeholder="Create Password"
                    onChange={handleChange}
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    name="location"
                    placeholder="Business Location"
                    onChange={handleChange}
                  />
                </div>

                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
                  <textarea
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                    name="description"
                    placeholder="Brief Description"
                    rows="3"
                    onChange={handleChange}
                  />
                </div>

                <button
                  className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/business/login")}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-8 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">256-bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessSignup;
