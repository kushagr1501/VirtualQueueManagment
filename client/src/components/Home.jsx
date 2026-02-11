import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Search, Clock, MapPin } from "lucide-react";
import gsap from "gsap";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Home() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const listRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/api/places`).then((res) => {
      setPlaces(res.data);
      setLoading(false);
      if (listRef.current) {
        gsap.fromTo(".place-card",
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );
      }
    });

    gsap.from(".hero-text", { y: "100%", duration: 1, ease: "power4.out" });
  }, []);

  const filtered = places.filter(p => p.name.toLowerCase().includes(term.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-black font-sans selection:bg-black selection:text-white">

      <header className="fixed top-0 w-full bg-[#F2F2F2]/90 backdrop-blur-md z-50 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold tracking-tighter uppercase">QueueBoard</Link>
          <Link to="/my-queues" className="text-sm font-bold border-b-2 border-transparent hover:border-black transition-all">My Tickets</Link>
        </div>
      </header>

      <main className="pt-40 px-6 max-w-7xl mx-auto">
        <div className="mb-24 overflow-hidden">
          <h1 className="hero-text text-6xl md:text-9xl font-bold tracking-tighter leading-none mb-6">
            Find a <br /> Queue.
          </h1>

          <div className="max-w-2xl relative group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-black/20 group-focus-within:text-black transition-colors" />
            <input
              autoFocus
              type="text"
              placeholder="Search clinics, banks, restaurants..."
              className="w-full bg-transparent text-3xl md:text-4xl font-medium border-b-2 border-black/10 py-6 pl-14 focus:outline-none focus:border-black transition-colors placeholder:text-black/10"
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-xl font-mono animate-pulse">LOADING_DATA...</div>
        ) : (
          <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 pb-20">
            {filtered.map((place) => (
              <Link to={`/place/${place._id}`} key={place._id} className="place-card group block">
                <div className="aspect-[4/3] bg-white border border-black/5 rounded-2xl mb-6 relative overflow-hidden transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">

                  <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                    <span className="font-bold text-4xl text-gray-200 uppercase tracking-widest">{place.name.substring(0, 2)}</span>
                  </div>

                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {(place.queueCount || 0) < 5 ? "Low Traffic" : "Busy"}
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold leading-tight mb-1 group-hover:underline decoration-2 underline-offset-4">{place.name}</h3>
                    <p className="text-gray-500 flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3" /> {place.location || "Location N/A"}
                    </p>
                  </div>
                  <ArrowUpRight className="w-6 h-6 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>

                <div className="mt-4 flex items-center gap-6 border-t border-black/5 pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Waiting</span>
                    <span className="text-xl font-mono font-medium">{place.queueCount || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Est. Time</span>
                    <span className="text-xl font-mono font-medium">~{(place.queueCount || 0) * 5}m</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="py-20 text-center text-gray-400">
            <p className="text-2xl font-bold">No places found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;