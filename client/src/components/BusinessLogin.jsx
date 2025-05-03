import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BusinessLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      const { token, businessId } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("businessId", businessId);

      const places = await axios.get(`http://localhost:5000/api/places?businessId=${businessId}`);
      if (places.data.length > 0) {
        navigate(`/admin/place/${places.data[0]._id}`);
      } else {
        navigate("/admin/add-place");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        {/* Left Side: Brand info */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
          <p className="text-lg mb-6">Log in to manage your business, control queues, and serve smarter.</p>
          <ul className="space-y-2 text-sm">
            <li>📊 Live queue management</li>
            <li>✅ Physical verification tracking</li>
            <li>🔐 Secure access for your team</li>
          </ul>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-10 bg-white flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🔐 Business Login</h2>
          <div className="space-y-4">
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
            <button
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={handleLogin}
            >
              Log In
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BusinessLogin;
