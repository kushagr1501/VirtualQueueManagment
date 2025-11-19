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
  Sparkles,
  TrendingUp,
  Zap,
  ChevronRight,
  Star
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
    if (count >= 5) return "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20";
    if (count >= 3) return "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20";
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
      <div className="fixed left-0 top-0 h-full w-16 md:w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col z-50">
        <div className="flex items-center justify-center md:justify-start p-6 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
          <span className="hidden md:block ml-3 font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">QueueMaster</span>
        </div>
        
        <div className="flex-1 py-6 px-3">
          <nav>
            <div className="flex flex-col space-y-2">
              <Link to="/home" className="group flex items-center px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40">
                <Users className="h-5 w-5 md:mr-3" />
                <span className="hidden md:block font-medium">Explore Places</span>
              </Link>
              <Link to="/my-queues" className="group flex items-center px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all">
                <Clock className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
                <span className="hidden md:block">My Queues</span>
              </Link>
              <Link to="/popular" className="group flex items-center px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all">
                <TrendingUp className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
                <span className="hidden md:block">Popular Places</span>
                <span className="hidden md:block ml-auto text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">Soon</span>
              </Link>
              {isLoggedIn && (
                <Link to="/business/dashboard" className="group flex items-center px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all">
                  <LayoutDashboard className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
                  <span className="hidden md:block">Business Dashboard</span>
                </Link>
              )}
              <Link to="/settings" className="group flex items-center px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all">
                <Settings className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
                <span className="hidden md:block">Settings</span>
              </Link>
            </div>
          </nav>

          {/* Quick Stats Card */}
          <div className="hidden md:block mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Pro Tip</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Join queues remotely and get notified when it's your turn!
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
          {isLoggedIn ? (
            <button className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all group">
              <LogOut className="h-4 w-4 md:mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden md:block font-medium">Logout</span>
            </button>
          ) : (
            <Link to="/login" className="flex items-center w-full px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all group">
              <ExternalLink className="h-4 w-4 md:mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden md:block font-medium">Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="ml-16 md:ml-72 p-8">
        {/* Header with glassmorphism */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Explore Places
              </h1>
              <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Find and join queues at your favorite places — skip the wait, save your time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-md group">
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform" />
              {isLoggedIn && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-lg">2</span>
              )}
            </button>
            {!isLoggedIn && (
              <Link to="/business/signup">
                <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all hover:scale-105 group">
                  <Building2 size={18} className="group-hover:rotate-12 transition-transform" /> 
                  <span>Register Business</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Search with enhanced design */}
        <div className="mb-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm focus:shadow-lg transition-all placeholder:text-slate-400"
              placeholder="Search places by name, location or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Featured Categories with gradient cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { name: "Restaurants", icon: "🍽️", gradient: "from-orange-500 to-red-500" },
            { name: "Retail", icon: "🛍️", gradient: "from-pink-500 to-rose-500" },
            { name: "Healthcare", icon: "🏥", gradient: "from-blue-500 to-cyan-500" },
            { name: "Government", icon: "🏛️", gradient: "from-purple-500 to-indigo-500" }
          ].map((category) => (
            <div 
              key={category.name}
              className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition-all overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{category.icon}</span>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 relative z-10">{category.name}</h3>
            </div>
          ))}
        </div>

        {/* Places List with enhanced cards */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="animate-spin h-12 w-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Loading amazing places...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="h-24 w-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <Building2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-200">No businesses registered yet</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
              Be the first to register your business and start managing your queues efficiently with our powerful platform.
            </p>
            <Link to="/business/signup">
              <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-105 group">
                <Building2 size={20} className="group-hover:rotate-12 transition-transform" /> 
                <span>Register Your Business</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="h-24 w-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <Search className="h-12 w-12 text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-200">No results found</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
              We couldn't find any places matching "<span className="font-semibold text-indigo-600 dark:text-indigo-400">{searchTerm}</span>". Try a different search term.
            </p>
            <button 
              onClick={() => setSearchTerm("")}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Clear search and see all places
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <div
                key={place._id}
                className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02]"
              >
                <div className="relative h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative h-20 w-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform border border-white/30">
                    <span className="text-5xl font-bold text-white">
                      {place.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {place.name}
                    </h2>
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap ${getQueueBadgeColor(place.queueCount || 0)}`}>
                      {place.queueCount || 0} in queue
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{place.description}</p>
                  
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <MapPin className="h-4 w-4 mr-1.5 text-indigo-500" />
                    <span className="font-medium">{place.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm mb-6 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className={`h-2.5 w-2.5 rounded-full mr-2 animate-pulse ${
                      place.queueCount >= 5 ? "bg-rose-500" : 
                      place.queueCount >= 3 ? "bg-amber-500" : "bg-emerald-500"
                    }`}></div>
                    <span className="font-medium">{getQueueStatusText(place.queueCount || 0)}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/place/${place._id}`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all group/btn">
                        <span>Join Queue</span>
                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                    {isLoggedIn && currentBusinessId && place.businessId === currentBusinessId && (
                      <Link to={`/admin/place/${place._id}`}>
                        <button className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-3 text-sm rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105">
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

        {/* Enhanced Footer */}
        <div className="hidden md:block mt-20">
          <div className="pt-12 border-t border-slate-200/50 dark:border-slate-800/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">Q</span>
                  </div>
                  <span className="ml-3 font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">QueueMaster</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                  Making queuing seamless and efficient. Save time, skip the line, live better.
                </p>
              </div>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">About</a>
                <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">FAQ</a>
                <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Contact</a>
                <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Terms</a>
                <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Privacy</a>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 text-center text-sm text-slate-500 dark:text-slate-500">
              © 2024 QueueMaster. Built with ❤️ for better experiences.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
