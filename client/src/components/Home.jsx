import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  Building2, 
  ArrowRight, 
  Clock, 
  MapPin, 
  ExternalLink, 
  LayoutDashboard, 
  Search,
  Users,
  Bell,
  Settings,
  LogOut
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Home() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const isLoggedIn = !!localStorage.getItem("token");
  const currentBusinessId = localStorage.getItem("businessId");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API}/api/places`)
      .then((res) => {
        setPlaces(res.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching places:", error);
        setLoading(false);
      });
  }, []);

  const getQueueBadgeColor = (count) => {
    if (count >= 5) return "bg-red-500 text-white";
    if (count >= 3) return "bg-amber-500 text-white";
    return "bg-emerald-500 text-white";
  };
  
  const getQueueStatusText = (count) => {
    if (count >= 5) return "High wait time";
    if (count >= 3) return "Moderate wait";
    return "Low wait time";
  };

  const filteredPlaces = places.filter(place => 
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    place.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 md:w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="flex items-center justify-center md:justify-start p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Q</span>
          </div>
          <span className="hidden md:block ml-2 font-bold text-lg">QueueMaster</span>
        </div>
        
        <div className="flex-1 py-6">
          <nav className="px-2">
            <div className="flex flex-col space-y-1">
              <Link to="/home" className="flex items-center px-2 py-3 rounded-lg bg-indigo-50 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300">
                <Users className="h-5 w-5 md:mr-3" />
                <span className="hidden md:block">Explore Places</span>
              </Link>
              <Link to="/my-queues" className="flex items-center px-2 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Clock className="h-5 w-5 md:mr-3" />
                <span className="hidden md:block">My Queues</span>
              </Link>
              <Link to="/popular" className="flex items-center px-2 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <MapPin className="h-5 w-5 md:mr-3" />
                <span className="hidden md:block">Popular Places (soon)</span>
              </Link>
              {isLoggedIn && (
                <Link to="/business/dashboard" className="flex items-center px-2 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <LayoutDashboard className="h-5 w-5 md:mr-3" />
                  <span className="hidden md:block">Business Dashboard</span>
                </Link>
              )}
              <Link to="/settings" className="flex items-center px-2 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Settings className="h-5 w-5 md:mr-3" />
                <span className="hidden md:block">Settings</span>
              </Link>
            </div>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          {isLoggedIn ? (
            <button className="flex items-center w-full px-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:block">Logout</span>
            </button>
          ) : (
            <Link to="/login" className="flex items-center w-full px-2 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <ExternalLink className="h-4 w-4 md:mr-2" />
              <span className="hidden md:block">Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="ml-16 md:ml-64 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Explore Places</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Find and join queues at your favorite places
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              {isLoggedIn && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">2</span>
              )}
            </button>
            {!isLoggedIn && (
              <Link to="/business/signup">
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 text-sm">
                  <Building2 size={16} /> Register Business
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search places by name, location or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Featured Categories */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {["Restaurants", "Retail", "Healthcare", "Government"].map((category) => (
            <div 
              key={category}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
            >
              <span className="text-lg mb-1">{category === "Restaurants" ? "🍽️" : category === "Retail" ? "🛍️" : category === "Healthcare" ? "🏥" : "🏛️"}</span>
              <h3 className="font-medium">{category}</h3>
            </div>
          ))}
        </div>

        {/* Places List */}
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full"></div>
          </div>
        ) : places.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-medium mb-1">No businesses registered yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
              Be the first to register your business and start managing your queues efficiently.
            </p>
            <Link to="/business/signup" className="mt-4">
              <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 text-sm">
                <Building2 size={16} /> Register Business
              </button>
            </Link>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-medium mb-1">No results found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
              We couldn't find any places matching "{searchTerm}". Try a different search term.
            </p>
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <div
                key={place._id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span className="text-3xl">
                      {place.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold">{place.name}</h2>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getQueueBadgeColor(
                        place.queueCount || 0
                      )}`}
                    >
                      {place.queueCount || 0} in queue
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{place.description}</p>
                  
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{place.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm mb-5">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      place.queueCount >= 5 ? "bg-red-500" : 
                      place.queueCount >= 3 ? "bg-amber-500" : "bg-emerald-500"
                    }`}></div>
                    <span>{getQueueStatusText(place.queueCount || 0)}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/place/${place._id}`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                        Join Queue <ArrowRight size={14} />
                      </button>
                    </Link>
                    {isLoggedIn && currentBusinessId && place.businessId === currentBusinessId && (
                      <Link to={`/admin/place/${place._id}`}>
                        <button className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">
                          <LayoutDashboard size={16} />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer for larger screens */}
        <div className="hidden md:block mt-16">
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Q</span>
                  </div>
                  <span className="ml-2 font-bold text-lg">QueueMaster</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Making queuing seamless and efficient
                </p>
              </div>
              <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">About</a>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">FAQ</a>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Contact</a>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Terms</a>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
