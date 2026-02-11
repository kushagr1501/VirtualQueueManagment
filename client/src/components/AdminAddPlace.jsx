import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Terminal, AlignLeft, Type } from "lucide-react";
import gsap from "gsap";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminAddPlace() {
  const [form, setForm] = useState({ name: "", description: "", location: "" });
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.from(containerRef.current, { y: 20, opacity: 0, duration: 0.8, ease: "power2.out" });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { name, description, location } = form;
    const businessId = localStorage.getItem("businessId");

    if (!name || !location) {
      alert("Name and Location are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API}/api/places`, {
        name,
        description: description || `Welcome to ${name}`,
        location,
        businessId,
      });

      const newPlaceId = res.data._id || (res.data.place && res.data.place._id);

      if (newPlaceId) {
        localStorage.setItem("lastPlaceId", newPlaceId);
        navigate(`/admin/place/${newPlaceId}`);
      } else {
        navigate("/business/login");
      }
    } catch (error) {
      console.error("Add place error:", error);
      alert(error.response?.data?.message || "Failed to create place");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 font-sans selection:bg-orange-500 selection:text-white">
      <div ref={containerRef} className="w-full max-w-lg">

        <div className="mb-10 text-center">
          <div className="w-12 h-12 bg-white text-black mx-auto rounded-lg flex items-center justify-center mb-4">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Configure New Location</h1>
          <p className="text-gray-500 text-sm font-mono">STEP 02: PLACE_INITIALIZATION</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#0a0a0a] p-8 border border-white/10 rounded-xl relative overflow-hidden group">

          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-scan"></div>

          <div className="group/input">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 group-focus-within/input:text-orange-500 transition-colors">
              <Type className="w-3 h-3" /> Place Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-white/10 py-3 text-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/5"
              placeholder="e.g. Central Clinic"
              autoFocus
            />
          </div>

          <div className="group/input">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 group-focus-within/input:text-orange-500 transition-colors">
              <MapPin className="w-3 h-3" /> Location Node
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-white/10 py-3 text-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/5"
              placeholder="e.g. New York, NY"
            />
          </div>

          <div className="group/input">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 group-focus-within/input:text-orange-500 transition-colors">
              <AlignLeft className="w-3 h-3" /> Brief Description (Optional)
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-white/10 py-3 text-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-white/5 resize-none h-24"
              placeholder="Operational details..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-white text-black py-4 rounded font-bold hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
          >
            {loading ? "CONFIGURING..." : "LAUNCH DASHBOARD"}
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => navigate(-1)} className="text-xs font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
            Cancel Operation
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAddPlace;
