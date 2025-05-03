import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminAddPlace() {
  const [form, setForm] = useState({ name: "", description: "", location: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { name, description, location } = form;
    const businessId = localStorage.getItem("businessId");
  
    if (!name || !description || !location) {
      setMessage("All fields are required.");
      return;
    }
  
    try {
      await axios.post("http://localhost:5000/api/places", {
        name,
        description,
        location,
        businessId 
      });
      setMessage("Place created successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setMessage("Something went wrong.");
    }
  };
  
  return (
    <div style={{ padding: 20 }}>
      <h2>🏢 Add Your Place</h2>

      <input
        name="name"
        placeholder="Place Name"
        onChange={handleChange}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <input
        name="description"
        placeholder="Description"
        onChange={handleChange}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <input
        name="location"
        placeholder="Location"
        onChange={handleChange}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <button onClick={handleSubmit}>Submit</button>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}

export default AdminAddPlace;
