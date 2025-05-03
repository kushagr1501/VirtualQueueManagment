import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BusinessSignup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    description: "",
    location: ""
  });

  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", form);
      const { token, businessId, placeId } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("businessId", businessId);

      navigate(`/admin/place/${placeId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        {/* Left: Brand Panel */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">🚀 Get Started with QTrack</h2>
          <p className="text-lg mb-6">Create your business account and start managing queues like a pro.</p>
          <ul className="space-y-2 text-sm">
            <li>✅ Add your place</li>
            <li>✅ Track real-time queues</li>
            <li>✅ Verify users easily</li>
            <li>✅ Improve customer experience</li>
          </ul>
        </div>

        {/* Right: Form Panel */}
        <div className="p-10 bg-white flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🧾 Business Sign Up</h2>
          <div className="space-y-4">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              name="name"
              placeholder="Your Name"
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              name="email"
              placeholder="Business Email"
              onChange={handleChange}
            />
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              name="companyName"
              placeholder="Company Name"
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              name="description"
              placeholder="Short Description"
              onChange={handleChange}
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              name="location"
              placeholder="Location"
              onChange={handleChange}
            />

            <button
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={handleSubmit}
            >
              Create Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BusinessSignup;
