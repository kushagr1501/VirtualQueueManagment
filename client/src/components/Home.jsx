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
  LogOut,
  TrendingUp,
  Sparkles
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
    if (count >= 5) return "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30";
    if (count >= 3) return "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30";
    return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 md:w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col shadow-xl z-50">
        <div className="flex items-center justify-center md:justify-start p-6 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/50 relative">
            <span className="text-white font-bold text-xl">Q</span>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
          <div className="hidden md:block ml-3">
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">QueueMaster</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pro Edition</p>
          </div>
        </div>
        
        <div className="flex-1 py-8 overflow-y-auto">
          <nav className="px-3 space-y-2">
            <Link to="/home" className="group flex items-center px-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 transition-all duration-200">
              <Users className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
              <span className="hidden md:block font-medium">Explore Places</span>
            </Link>
            <Link to="/my-queues" className="group flex items-center px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:shadow-md">
              <Clock className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
              <span className="hidden md:block font-medium">My Queues</span>
            </Link>
            <Link to="/popular" className="group flex items-center px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:shadow-md">
              <TrendingUp className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
              <span className="hidden md:block font-medium">Popular Places</span>
              <span className="hidden md:block ml-auto text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">Soon</span>
            </Link>
            {isLoggedIn && (
              <Link to="/business/dashboard" className="group flex items-center px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:shadow-md">
                <LayoutDashboard className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
                <span className="hidden md:block font-medium">Dashboard</span>
              </Link>
            )}
            <Link to="/settings" className="group flex items-center px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:shadow-md">
              <Settings className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
              <span className="hidden md:block font-medium">Settings</span>
            </Link>
          </nav>

          {/* Quick Stats - Mobile Hidden */}
          <div className="hidden md:block px-3 mt-8">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl p-4 border border-indigo-100 dark:border-slate-700">
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Active Places</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{places.length}</p>
                </div>
              </div>
              <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60">
          {isLoggedIn ? (
            <button className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200">
              <LogOut className="h-4 w-4 md:mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden md:block">Logout</span>
            </button>
          ) : (
            <Link to="/login" className="group flex items-center w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30">
              <ExternalLink className="h-4 w-4 md:mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden md:block">Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="ml-16 md:ml-72 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                Explore Places
              </h1>
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold rounded-full shadow-lg shadow-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Find and join queues at your favorite places instantly
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              {isLoggedIn && (
                <>
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-rose-600 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-lg shadow-red-500/50">2</span>
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full animate-ping opacity-75"></span>
                </>
              )}
            </button>
            {!isLoggedIn && (
              <Link to="/business/signup">
                <button className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-200 hover:scale-105">
                  <Building2 size={18} className="group-hover:rotate-12 transition-transform" /> 
                  <span>Register Business</span>
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-14 pr-4 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400 shadow-lg"
                placeholder="Search places by name, location or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { name: "Restaurants", icon: "🍽️", gradient: "from-orange-500 to-red-600" },
            { name: "Retail", icon: "🛍️", gradient: "from-pink-500 to-rose-600" },
            { name: "Healthcare", icon: "🏥", gradient: "from-blue-500 to-cyan-600" },
            { name: "Government", icon: "🏛️", gradient: "from-purple-500 to-indigo-600" }
          ].map((category) => (
            <div 
              key={category.name}
              className="group relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <span className="text-4xl mb-3 transform group-hover:scale-125 transition-transform duration-300">{category.icon}</span>
              <h3 className="font-semibold text-slate-800 dark:text-white relative z-10">{category.name}</h3>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Places List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="h-16 w-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 h-16 w-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium">Loading amazing places...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="h-24 w-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center shadow-2xl">
                <Building2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">No businesses yet</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
              Be the first to register your business and revolutionize your queue management.
            </p>
            <Link to="/business/signup">
              <button className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-200 hover:scale-105">
                <Building2 size={20} className="group-hover:rotate-12 transition-transform" /> 
                <span>Register Your Business</span>
              </button>
            </Link>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="h-24 w-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
              <Search className="h-12 w-12 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">No results found</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
              We couldn't find any places matching <span className="font-semibold text-indigo-600 dark:text-indigo-400">"{searchTerm}"</span>
            </p>
            <button 
              onClick={() => setSearchTerm("")}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Clear search and show all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <div
                key={place._id}
                className="group bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:scale-105"
              >
                <div className="relative h-40 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
                  </div>
                  <div className="relative h-20 w-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-5xl font-bold text-white">
                      {place.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1.5 text-xs font-bold rounded-full backdrop-blur-xl ${getQueueBadgeColor(
                        place.queueCount || 0
                      )}`}
                    >
                      {place.queueCount || 0} in queue
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {place.name}
                  </h2>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {place.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                    <MapPin className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-medium">{place.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm mb-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 p-3 rounded-xl">
                    <div className={`h-2.5 w-2.5 rounded-full mr-2 shadow-lg ${
                      place.queueCount >= 5 ? "bg-red-500 shadow-red-500/50" : 
                      place.queueCount >= 3 ? "bg-amber-500 shadow-amber-500/50" : "bg-emerald-500 shadow-emerald-500/50"
                    }`}></div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{getQueueStatusText(place.queueCount || 0)}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link to={`/place/${place._id}`} className="flex-1">
                      <button className="w-full group/btn flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-indigo-500/50">
                        <span>Join Queue</span>
                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                    {isLoggedIn && currentBusinessId && place.businessId === currentBusinessId && (
                      <Link to={`/admin/place/${place._id}`}>
                        <button className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105">
                          <LayoutDashboard size={18} />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="hidden md:block mt-20">
          <div className="pt-8 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                    <span className="text-white font-bold text-xl">Q</span>
                  </div>
                  <div className="ml-3">
                    <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">QueueMaster</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pro Edition</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Making queuing seamless, efficient, and delightful
                </p>
              </div>
              <div className="flex gap-6 text-sm">
                {["About", "FAQ", "Contact", "Terms", "Privacy"].map((item) => (
                  <a 
                    key={item}
                    href="#" 
                    className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
