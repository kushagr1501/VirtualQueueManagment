import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Box } from "lucide-react";
import gsap from "gsap";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CATEGORIES = [
  { label: "Restaurant", value: "restaurant" },
  { label: "Retail / Store", value: "retail" },
  { label: "Hospital / Clinic", value: "hospital" },
  { label: "Government", value: "government" },
  { label: "Other", value: "other" },
];

function BusinessSignup() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", companyName: "", description: "", location: "", category: "other"
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    gsap.from(formRef.current, { y: 30, opacity: 0, duration: 0.8, ease: "power2.out", delay: 0.2 });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/signup`, form);
      const { token, refreshToken, businessId, placeId } = res.data;
      localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("businessId", businessId);
      if (placeId) localStorage.setItem("lastPlaceId", placeId);

      navigate(placeId ? `/admin/place/${placeId}` : "/admin/add-place");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans selection:bg-orange-500 selection:text-white">

      <div className="hidden md:flex w-5/12 relative items-center justify-center p-12 border-r border-white/10 bg-[#080808]">
        <div className="relative z-10 text-right">
          <h1 className="text-6xl font-serif italic font-medium leading-none mb-8 opacity-80">
            Get <br /> Started
          </h1>
          <div className="space-y-6 text-sm font-mono text-gray-500">
            <div className="flex items-center justify-end gap-3">
              <span>Real-time queues</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <span>Customer verification</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <span>Built-in analytics</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-7/12 p-8 md:p-16 overflow-y-auto">
        <div className="max-w-xl mx-auto" ref={formRef}>
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-gray-500">
              <Box className="w-4 h-4" /> CREATE ACCOUNT
            </div>
            <Link to="/" className="text-xs font-bold uppercase tracking-widest hover:text-orange-500">Back</Link>
          </div>

          <h2 className="text-3xl font-bold mb-2">Create your account</h2>
          <p className="text-gray-500 mb-10">Set up your business and start managing queues.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="label-text">Your Name</label>
                <input name="name" onChange={handleChange} className="input-field" placeholder="John Doe" />
              </div>
              <div className="group">
                <label className="label-text">Business Name</label>
                <input name="companyName" onChange={handleChange} className="input-field" placeholder="Acme Corp" />
              </div>
            </div>

            <div className="group">
              <label className="label-text">Email Address</label>
              <input name="email" type="email" onChange={handleChange} className="input-field" placeholder="admin@acme.com" />
            </div>

            <div className="group">
              <label className="label-text">Password</label>
              <input name="password" type="password" onChange={handleChange} className="input-field" placeholder="••••••••" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="label-text">Location</label>
                <input name="location" onChange={handleChange} className="input-field" placeholder="City, Region" />
              </div>
              <div className="group">
                <label className="label-text">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="input-field appearance-none bg-[#050505]">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-8 bg-white text-black py-4 rounded font-bold hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 group">
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Already have an account? <Link to="/business/login" className="text-white border-b border-gray-700 hover:border-white transition-colors">Sign in</Link>
          </div>
        </div>
      </div>

      <style>{`
        .label-text { display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-bottom: 0.5rem; transition: color 0.3s; }
        .group:focus-within .label-text { color: #f97316; }
        .input-field { width: 100%; background: transparent; border-bottom: 1px solid rgba(255,255,255,0.15); padding: 0.75rem 0; font-size: 1.1rem; outline: none; transition: border-color 0.3s; border-radius: 0; }
        .input-field:focus { border-color: #f97316; }
      `}</style>
    </div>
  );
}

export default BusinessSignup;
