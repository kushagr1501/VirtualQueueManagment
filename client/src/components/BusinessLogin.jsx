import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Terminal } from "lucide-react";
import gsap from "gsap";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function BusinessLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    gsap.from(formRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.2
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, form);
      const { token, businessId } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("businessId", businessId);

      const placesRes = await axios.get(`${API}/api/places`, {
        params: { businessId },
      });

      if (placesRes.data && placesRes.data.length > 0) {
        localStorage.setItem("lastPlaceId", placesRes.data[0]._id);
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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-orange-500 selection:text-white overflow-hidden">

      <div className="hidden md:flex w-1/2 relative items-center justify-center p-12 border-r border-white/10">
        <div className="absolute inset-0 opacity-[0.05] font-mono text-xs leading-5 p-8 pointer-events-none overflow-hidden select-none">
          {Array(50).fill(0).map((_, i) => (
            <div key={i}>{`> SYSTEM_LOG_${3000 + i}: AUTH_REQUEST_INITIATED [${Math.random().toString(36).substring(7)}]`}</div>
          ))}
        </div>
        <div className="relative z-10">
          <h1 className="text-7xl font-serif italic font-medium leading-none mb-6">
            Command <br /> Center
          </h1>
          <p className="text-gray-500 text-lg max-w-sm">
            Access your queue analytics and real-time control panel.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
        <Link to="/" className="absolute top-8 right-8 text-sm font-bold tracking-widest uppercase hover:text-orange-500 transition-colors">
          Exit
        </Link>

        <div ref={formRef} className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-lg">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="font-mono text-sm tracking-widest text-gray-500">ADMIN_PORTAL // v2.0</span>
          </div>

          <h2 className="text-3xl font-bold mb-8">Identify yourself.</h2>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-orange-500 transition-colors">
                Business Email
              </label>
              <input
                autoFocus
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/20 py-4 text-xl focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/10"
                placeholder="admin@company.com"
              />
            </div>

            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-orange-500 transition-colors">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/20 py-4 text-xl focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/10"
                placeholder="••••••••••••"
              />
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-between bg-white text-black px-6 py-5 rounded-lg font-bold hover:bg-orange-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? "AUTHENTICATING..." : "ENTER DASHBOARD"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="text-center pt-4">
              <Link to="/business/signup" className="text-sm text-gray-500 hover:text-white transition-colors">
                No access? <span className="underline decoration-gray-700 underline-offset-4">Request entry token</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BusinessLogin;
