// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import { 
//   Building2, 
//   ArrowRight, 
//   Clock, 
//   MapPin, 
//   ExternalLink, 
//   LayoutDashboard, 
//   Search,
//   Users,
//   Bell,
//   Settings,
//   LogOut,
//   TrendingUp,
//   Sparkles
// } from "lucide-react";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// function Home() {
//   const [places, setPlaces] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const isLoggedIn = !!localStorage.getItem("token");
//   const currentBusinessId = localStorage.getItem("businessId");

//   useEffect(() => {
//     setLoading(true);
//     axios
//       .get(`${API}/api/places`)
//       .then((res) => {
//         setPlaces(res.data);
//         setLoading(false);
//       })
//       .catch(error => {
//         console.error("Error fetching places:", error);
//         setLoading(false);
//       });
//   }, []);

//   const getQueueBadgeColor = (count) => {
//     if (count >= 5) return "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30";
//     if (count >= 3) return "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30";
//     return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30";
//   };
  
//   const getQueueStatusText = (count) => {
//     if (count >= 5) return "High wait time";
//     if (count >= 3) return "Moderate wait";
//     return "Low wait time";
//   };

//   const filteredPlaces = places.filter(place => 
//     place.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
//     place.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     place.description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
//       {/* Sidebar */}
//       <div className="fixed left-0 top-0 h-full w-16 md:w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col shadow-xl z-50">
//         <div className="flex items-center justify-center md:justify-start p-6 border-b border-slate-200/60 dark:border-slate-700/60">
//           <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/50 relative">
//             <span className="text-white font-bold text-xl">Q</span>
//             <div className="absolute -top-1 -right-1">
//               <Sparkles className="h-4 w-4 text-yellow-400" />
//             </div>
//           </div>
//           <div className="hidden md:block ml-3">
//             <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">QueueMaster</span>
//             <p className="text-xs text-slate-500 dark:text-slate-400">Pro Edition</p>
//           </div>
//         </div>
        
//         <div className="flex-1 py-8 overflow-y-auto">
//           <nav className="px-3 space-y-2">
//             <Link to="/home" className="group flex items-center px-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 transition-all duration-200">
//               <Users className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
//               <span className="hidden md:block font-medium">Explore Places</span>
//             </Link>
//             <Link to="/my-queues" className="group flex items-center px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:shadow-md">
//               <Clock className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
//               <span className="hidden md:block font-medium">My Queues</span>
//             </Link>
//             <Link to="/popular" className="group flex items-center px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:shadow-md">
//               <TrendingUp className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
//               <span className="hidden md:block font-medium">Popular Places</span>
//               <span className="hidden md:block ml-auto text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">Soon</span>
//             </Link>
//             {isLoggedIn && (
//               <Link to="/business/dashboard" className="group flex items-center px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:shadow-md">
//                 <LayoutDashboard className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
//                 <span className="hidden md:block font-medium">Dashboard</span>
//               </Link>
//             )}
//             <Link to="/settings" className="group flex items-center px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:shadow-md">
//               <Settings className="h-5 w-5 md:mr-3 group-hover:scale-110 transition-transform" />
//               <span className="hidden md:block font-medium">Settings</span>
//             </Link>
//           </nav>

//           {/* Quick Stats - Mobile Hidden */}
//           <div className="hidden md:block px-3 mt-8">
//             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl p-4 border border-indigo-100 dark:border-slate-700">
//               <div className="flex items-center mb-3">
//                 <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
//                   <Building2 className="h-4 w-4 text-white" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-xs text-slate-600 dark:text-slate-400">Active Places</p>
//                   <p className="text-xl font-bold text-slate-800 dark:text-white">{places.length}</p>
//                 </div>
//               </div>
//               <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
//                 <div className="h-full w-2/3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60">
//           {isLoggedIn ? (
//             <button className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200">
//               <LogOut className="h-4 w-4 md:mr-2 group-hover:scale-110 transition-transform" />
//               <span className="hidden md:block">Logout</span>
//             </button>
//           ) : (
//             <Link to="/login" className="group flex items-center w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30">
//               <ExternalLink className="h-4 w-4 md:mr-2 group-hover:scale-110 transition-transform" />
//               <span className="hidden md:block">Login</span>
//             </Link>
//           )}
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="ml-16 md:ml-72 p-4 md:p-8">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//           <div>
//             <div className="flex items-center gap-3 mb-2">
//               <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
//                 Explore Places
//               </h1>
//               <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold rounded-full shadow-lg shadow-emerald-500/30">
//                 LIVE
//               </span>
//             </div>
//             <p className="text-slate-600 dark:text-slate-400">
//               Find and join queues at your favorite places instantly
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <button className="relative p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
//               <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
//               {isLoggedIn && (
//                 <>
//                   <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-rose-600 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-lg shadow-red-500/50">2</span>
//                   <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full animate-ping opacity-75"></span>
//                 </>
//               )}
//             </button>
//             {!isLoggedIn && (
//               <Link to="/business/signup">
//                 <button className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-200 hover:scale-105">
//                   <Building2 size={18} className="group-hover:rotate-12 transition-transform" /> 
//                   <span>Register Business</span>
//                 </button>
//               </Link>
//             )}
//           </div>
//         </div>

//         {/* Search */}
//         <div className="mb-8">
//           <div className="relative group">
//             <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
//                 <Search className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
//               </div>
//               <input
//                 type="text"
//                 className="block w-full pl-14 pr-4 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400 shadow-lg"
//                 placeholder="Search places by name, location or description..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Featured Categories */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
//           {[
//             { name: "Restaurants", icon: "🍽️", gradient: "from-orange-500 to-red-600" },
//             { name: "Retail", icon: "🛍️", gradient: "from-pink-500 to-rose-600" },
//             { name: "Healthcare", icon: "🏥", gradient: "from-blue-500 to-cyan-600" },
//             { name: "Government", icon: "🏛️", gradient: "from-purple-500 to-indigo-600" }
//           ].map((category) => (
//             <div 
//               key={category.name}
//               className="group relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
//             >
//               <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
//               <span className="text-4xl mb-3 transform group-hover:scale-125 transition-transform duration-300">{category.icon}</span>
//               <h3 className="font-semibold text-slate-800 dark:text-white relative z-10">{category.name}</h3>
//               <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
//             </div>
//           ))}
//         </div>

//         {/* Places List */}
//         {loading ? (
//           <div className="py-20 flex flex-col items-center justify-center">
//             <div className="relative">
//               <div className="h-16 w-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
//               <div className="absolute inset-0 h-16 w-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
//             </div>
//             <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium">Loading amazing places...</p>
//           </div>
//         ) : places.length === 0 ? (
//           <div className="py-20 flex flex-col items-center justify-center text-center">
//             <div className="relative mb-6">
//               <div className="h-24 w-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center shadow-2xl">
//                 <Building2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
//               </div>
//               <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
//                 <Sparkles className="h-4 w-4 text-white" />
//               </div>
//             </div>
//             <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">No businesses yet</h3>
//             <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
//               Be the first to register your business and revolutionize your queue management.
//             </p>
//             <Link to="/business/signup">
//               <button className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-200 hover:scale-105">
//                 <Building2 size={20} className="group-hover:rotate-12 transition-transform" /> 
//                 <span>Register Your Business</span>
//               </button>
//             </Link>
//           </div>
//         ) : filteredPlaces.length === 0 ? (
//           <div className="py-20 flex flex-col items-center justify-center text-center">
//             <div className="h-24 w-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
//               <Search className="h-12 w-12 text-slate-400 dark:text-slate-500" />
//             </div>
//             <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">No results found</h3>
//             <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
//               We couldn't find any places matching <span className="font-semibold text-indigo-600 dark:text-indigo-400">"{searchTerm}"</span>
//             </p>
//             <button 
//               onClick={() => setSearchTerm("")}
//               className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
//             >
//               Clear search and show all
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredPlaces.map((place) => (
//               <div
//                 key={place._id}
//                 className="group bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:scale-105"
//               >
//                 <div className="relative h-40 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
//                   <div className="absolute inset-0 bg-black/10"></div>
//                   <div className="absolute inset-0 opacity-30">
//                     <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
//                   </div>
//                   <div className="relative h-20 w-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
//                     <span className="text-5xl font-bold text-white">
//                       {place.name.charAt(0).toUpperCase()}
//                     </span>
//                   </div>
//                   <div className="absolute top-4 right-4">
//                     <span
//                       className={`px-3 py-1.5 text-xs font-bold rounded-full backdrop-blur-xl ${getQueueBadgeColor(
//                         place.queueCount || 0
//                       )}`}
//                     >
//                       {place.queueCount || 0} in queue
//                     </span>
//                   </div>
//                 </div>
                
//                 <div className="p-6">
//                   <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
//                     {place.name}
//                   </h2>
                  
//                   <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
//                     {place.description}
//                   </p>
                  
//                   <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
//                     <MapPin className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
//                     <span className="font-medium">{place.location}</span>
//                   </div>
                  
//                   <div className="flex items-center text-sm mb-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 p-3 rounded-xl">
//                     <div className={`h-2.5 w-2.5 rounded-full mr-2 shadow-lg ${
//                       place.queueCount >= 5 ? "bg-red-500 shadow-red-500/50" : 
//                       place.queueCount >= 3 ? "bg-amber-500 shadow-amber-500/50" : "bg-emerald-500 shadow-emerald-500/50"
//                     }`}></div>
//                     <span className="font-semibold text-slate-700 dark:text-slate-300">{getQueueStatusText(place.queueCount || 0)}</span>
//                   </div>
                  
//                   <div className="flex gap-3">
//                     <Link to={`/place/${place._id}`} className="flex-1">
//                       <button className="w-full group/btn flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-indigo-500/50">
//                         <span>Join Queue</span>
//                         <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
//                       </button>
//                     </Link>
//                     {isLoggedIn && currentBusinessId && place.businessId === currentBusinessId && (
//                       <Link to={`/admin/place/${place._id}`}>
//                         <button className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105">
//                           <LayoutDashboard size={18} />
//                         </button>
//                       </Link>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Footer */}
//         <div className="hidden md:block mt-20">
//           <div className="pt-8 border-t border-slate-200/60 dark:border-slate-700/60">
//             <div className="flex justify-between items-center">
//               <div>
//                 <div className="flex items-center mb-3">
//                   <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
//                     <span className="text-white font-bold text-xl">Q</span>
//                   </div>
//                   <div className="ml-3">
//                     <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">QueueMaster</span>
//                     <p className="text-xs text-slate-500 dark:text-slate-400">Pro Edition</p>
//                   </div>
//                 </div>
//                 <p className="text-sm text-slate-600 dark:text-slate-400">
//                   Making queuing seamless, efficient, and delightful
//                 </p>
//               </div>
//               <div className="flex gap-6 text-sm">
//                 {["About", "FAQ", "Contact", "Terms", "Privacy"].map((item) => (
//                   <a 
//                     key={item}
//                     href="#" 
//                     className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
//                   >
//                     {item}
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Home;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  ArrowRight,
  Clock,
  MapPin,
  LayoutDashboard,
  Search,
  Users,
  LogOut,
  TrendingUp,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Home() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const isLoggedIn = !!localStorage.getItem("token");
  const currentBusinessId = localStorage.getItem("businessId");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API}/api/places`)
      .then((res) => {
        setPlaces(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching places:", error);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("businessId");
    navigate("/home");
    window.location.reload();
  };

  const getQueueBadgeColor = (count) => {
    if (count >= 5) return "bg-red-500 text-white";
    if (count >= 3) return "bg-amber-400 text-black";
    return "bg-emerald-400 text-black";
  };

  const getQueueStatusText = (count) => {
    if (count >= 5) return "High wait time";
    if (count >= 3) return "Moderate wait";
    return "Low wait time";
  };

  const filteredPlaces = places.filter((place) =>
    [place.name, place.location, place.description]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF0D7]">
      <header className="border-b-[4px] border-black bg-[#FAF0D7] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border-[3px] border-black bg-black text-white text-xl font-black">
              Q
            </div>
            <div>
              <div className="text-xl font-black">QueueBoard</div>
              <div className="text-[12px] text-gray-600">
                Explore places and join queues
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-[2px] border-black bg-gray-100 px-3 py-1.5 text-[12px] font-semibold text-gray-400 cursor-not-allowed">
              <Clock size={16} /> My queues
              <span className="ml-1 text-[10px] bg-yellow-300 border border-black px-1.5 py-0.5 font-bold">
                SOON
              </span>
            </div>
            {isLoggedIn && currentBusinessId ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 border-[2px] border-black bg-white px-3 py-1.5 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 border-[2px] border-black bg-[#FF6B6B] px-3 py-1.5 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/business/signup")}
                className="flex items-center gap-2 border-[2px] border-black bg-[#22C55E] px-3 py-1.5 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
              >
                <Building2 size={16} /> Register business
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="mb-3 text-5xl font-black">
            Find a place, join the queue.
          </h1>
          {/* <p className="text-base text-gray-700">
            Restaurants, clinics, banks, RTO — join the line from your phone and
            reach when your turn is close.
          </p> */}
        </div>

        <div className="mb-8">
          <label className="mb-2 block text-sm font-bold uppercase tracking-wide">
            Search places
          </label>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Type name, area or service (e.g. bank, lab, RTO)..."
              className="w-full border-[3px] border-black bg-white py-3 pl-12 pr-4 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-black/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-4 gap-4">
          {[
            { label: "Restaurants", icon: "🍽️" },
            { label: "Retail / banks", icon: "🏦" },
            { label: "Hospitals & labs", icon: "🏥" },
            { label: "Govt. offices", icon: "🏛️" },
          ].map((c) => (
            <div
              key={c.label}
              className="flex flex-col items-center gap-2 border-[3px] border-black bg-white p-6 text-center hover:-translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              <div className="text-4xl">{c.icon}</div>
              <div className="text-sm font-bold">{c.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-[4px] border-black border-t-transparent" />
            <p className="text-sm font-semibold text-gray-600">
              Fetching places near you...
            </p>
          </div>
        ) : places.length === 0 ? (
          <div className="mt-10 border-[3px] border-black bg-white p-10 text-center">
            <div className="mb-3 text-5xl">🏪</div>
            <h3 className="mb-2 text-2xl font-bold">No businesses yet</h3>
            <p className="mb-4 text-sm text-gray-600">
              Pehla business aapka ho sakta hai. Register karke apni branch yahan
              list karein.
            </p>
            <button
              onClick={() => navigate("/business/signup")}
              className="mt-1 inline-flex items-center gap-2 border-[3px] border-black bg-[#22C55E] px-4 py-2 text-sm font-semibold hover:-translate-y-[1px] transition-transform"
            >
              <Building2 size={18} /> Register your business
            </button>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="mt-10 border-[3px] border-black bg-white p-10 text-center">
            <div className="mb-3 text-5xl">🔍</div>
            <h3 className="mb-2 text-2xl font-bold">No results found</h3>
            <p className="mb-4 text-sm text-gray-600">
              Couldn't find any place matching{" "}
              <span className="font-semibold">"{searchTerm}"</span>.
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-[12px] underline font-semibold"
            >
              Clear search and show all
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-600">
                Showing {filteredPlaces.length} place
                {filteredPlaces.length > 1 ? "s" : ""}.
              </p>
              <p className="flex items-center gap-1 text-[12px] font-semibold text-gray-500">
                <TrendingUp size={14} /> More categories coming soon
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {filteredPlaces.map((place) => {
                const count = place.queueCount || 0;
                return (
                  <div
                    key={place._id}
                    className="border-[5px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] transition-all duration-200 overflow-hidden"
                  >
                    <div
                      className={`h-3 ${
                        count >= 5
                          ? "bg-red-500"
                          : count >= 3
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      }`}
                    />

                    <div className="p-7">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2">
                            {place.name}
                          </h3>
                          <p className="text-[15px] text-gray-600 leading-relaxed">
                            {place.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                          <div
                            className={`${getQueueBadgeColor(
                              count
                            )} border-[3px] border-black px-4 py-2 text-[16px] font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}
                          >
                            {count} in queue
                          </div>
                          <span className="text-[12px] font-semibold text-gray-500">
                            {getQueueStatusText(count)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-[#FEF3C7] border-[3px] border-black text-[15px] font-medium">
                        <MapPin size={16} className="shrink-0" />
                        <span className="truncate">{place.location}</span>
                      </div>

                      <div className="flex gap-4">
                        <Link
                          to={`/place/${place._id}`}
                          className="flex-1 flex items-center justify-center gap-2 border-[4px] border-black bg-[#FB923C] px-6 py-4 text-[16px] font-bold hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        >
                          Join queue <ArrowRight size={20} />
                        </Link>
                        {isLoggedIn &&
                          currentBusinessId &&
                          place.businessId === currentBusinessId && (
                            <Link
                              to="/dashboard"
                              className="flex items-center gap-1 border-[4px] border-black bg-[#A78BFA] px-5 py-4 text-[16px] font-bold hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                              title="Manage Dashboard"
                            >
                              <LayoutDashboard size={20} />
                            </Link>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      
    </div>
  );
}

export default Home;

