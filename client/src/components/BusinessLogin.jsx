import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Building2, Shield, TrendingUp, Users } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function BusinessLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, form);
      const { token, businessId } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("businessId", businessId);

      const placesRes = await axios.get(
        `${API}/api/places`,
        { params: { businessId } }
      );

      if (placesRes.data && placesRes.data.length > 0) {
        navigate(`/admin/place/${placesRes.data[0]._id}`);
      } else {
        navigate("/admin/add-place");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center px-4 py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Side: Brand info */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-10 lg:p-14 flex flex-col justify-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="inline-flex p-3 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                  <Shield size={32} />
                </div>
                
                <h2 className="text-4xl font-black mb-4 leading-tight">
                  Welcome Back
                </h2>
                <p className="text-lg text-blue-100 mb-10 leading-relaxed">
                  Continue managing your business with our powerful queue management platform.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Live Analytics</h3>
                      <p className="text-sm text-blue-100">Track queue metrics in real-time</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Customer Management</h3>
                      <p className="text-sm text-blue-100">Verify and serve efficiently</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Secure Access</h3>
                      <p className="text-sm text-blue-100">Enterprise-grade security</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm border-2 border-indigo-600" />
                      ))}
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold">5,000+ businesses</p>
                      <p className="text-blue-100">trust our platform</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Sign In
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Access your business dashboard
                </p>
              </div>

              <div className="space-y-5">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
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
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                  </label>
                  <button className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Forgot password?
                  </button>
                </div>

                <button
                  className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate("/business/signup")}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Create one
                  </button>
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Protected by enterprise-grade security
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessLogin;
