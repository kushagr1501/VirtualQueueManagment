// // AdminPanel.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Users,
//   LogOut,
//   Trash2,
//   RefreshCw,
//   Check,
//   Store,
//   Clock,
//   Settings,
//   Bell,
//   Loader2,
//   Plus,
//   Menu,
//   X,
//   Search,
//   BarChart2,
//   Sparkles,
//   TrendingUp,
//   Activity,
// } from "lucide-react";
// import io from "socket.io-client";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
// // single socket instance (shared)
// const socket = io(API);

// function AdminPanel() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [queue, setQueue] = useState([]);
//   const [place, setPlace] = useState({});
//   const [name, setName] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [newQueueName, setNewQueueName] = useState("");
//   const [queueNames, setQueueNames] = useState([]);
//   const [selectedQueue, setSelectedQueue] = useState("");
//   const [queueCreateMessage, setQueueCreateMessage] = useState("");
//   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
//   const [addUserModalOpen, setAddUserModalOpen] = useState(false);
//   const [createQueueModalOpen, setCreateQueueModalOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   // prevent body scroll when either modal is open
//   useEffect(() => {
//     const anyModalOpen = addUserModalOpen || createQueueModalOpen;
//     if (anyModalOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [addUserModalOpen, createQueueModalOpen]);

//   useEffect(() => {
//     if (!id) return;

//     // join room and set up listener
//     socket.emit("joinPlaceRoom", id);
//     fetchData();

//     socket.on("queueUpdate", fetchData);

//     return () => {
//       socket.off("queueUpdate", fetchData);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, selectedQueue]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [placeRes, queueRes, queueNamesRes] = await Promise.all([
//         axios.get(`${API}/api/places/${id}`),
//         axios.get(`${API}/api/place/${id}`, { params: { queueName: selectedQueue } }),
//         axios.get(`${API}/api/places/${id}/queues`),
//       ]);
//       setPlace(placeRes.data);
//       setQueue(Array.isArray(queueRes.data) ? queueRes.data : []);
//       setQueueNames(Array.isArray(queueNamesRes.data) ? queueNamesRes.data : []);
//       // If selectedQueue is empty, pick first available
//       if (!selectedQueue && queueNamesRes.data && queueNamesRes.data.length > 0) {
//         setSelectedQueue(queueNamesRes.data[0]);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const manualRefresh = async () => {
//     setRefreshing(true);
//     await fetchData();
//     setTimeout(() => setRefreshing(false), 500);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("businessId");
//     navigate("/");
//   };

//   const addToQueue = async () => {
//     if (!name.trim()) return setMessage("Enter a valid name");
//     try {
//       await axios.post(`${API}/api/place/${id}/join`, {
//         userName: name,
//         queueName: selectedQueue,
//       });
//       setName("");
//       setMessage("");
//       setAddUserModalOpen(false);
//       fetchData();
//     } catch (error) {
//       console.error("Error adding to queue:", error);
//       setMessage("Failed to add user to queue");
//     }
//   };

//   const serveUser = async (uid) => {
//     try {
//       await axios.patch(`${API}/api/serve/${uid}`);
//       fetchData();
//     } catch (error) {
//       console.error("Error serving user:", error);
//       alert("Failed to mark user as served. See console for details.");
//     }
//   };

//   // Remove user from queue (tries DELETE endpoint, falls back to leave)
//   const removeUser = async (uid) => {
//     if (!uid) return;
//     if (!window.confirm("Remove this customer from the queue?")) return;

//     try {
//       // Try delete endpoint first (if you have one)
//       await axios.delete(`${API}/api/queue/user/${uid}`);
//     } catch (deleteErr) {
//       // If delete endpoint doesn't exist or failed, try leave endpoint
//       try {
//         await axios.post(`${API}/api/leave/${uid}`);
//       } catch (leaveErr) {
//         console.error("Both delete and leave failed:", { deleteErr, leaveErr });
//         alert("Failed to remove user. See console for details.");
//         return;
//       }
//     }

//     // Re-sync UI
//     try {
//       await fetchData();
//     } catch (err) {
//       console.error("Failed to refresh after removal:", err);
//     }
//   };

//   const deletePlace = async () => {
//     if (window.confirm("Are you sure you want to delete this place?")) {
//       try {
//         await axios.delete(`${API}/api/places/${id}`);
//         navigate("/");
//       } catch (error) {
//         console.error("Error deleting place:", error);
//       }
//     }
//   };

//   // Delete the currently selected queue: mark its waiting entries as served on the backend.
//   // Then remove the queue name from the UI (optimistic) and re-sync.
//   const deleteCurrentQueue = async () => {
//     if (!selectedQueue) return alert("Select a queue first.");
//     if (!window.confirm(`Delete queue "${selectedQueue}"? This cannot be undone.`)) return;

//     const queueToDelete = selectedQueue;

//     try {
//       const encoded = encodeURIComponent(queueToDelete);
//       const resp = await axios.delete(`${API}/api/queue/delete-queue/${id}/${encoded}`);

//       // optimistic UI update: remove the queue name locally
//       const updatedQueueNames = queueNames.filter((q) => q !== queueToDelete);
//       setQueueNames(updatedQueueNames);

//       if (updatedQueueNames.length > 0) {
//         setSelectedQueue(updatedQueueNames[0]);
//       } else {
//         setSelectedQueue("");
//         setQueue([]); // clear visible queue since queue is deleted
//       }

//       // Console/log success message from server if present
//       console.log(resp.data?.message || `Queue "${queueToDelete}" deleted`);

//       // re-sync with server to get canonical state and emit updates to socket listeners
//       await fetchData();
//     } catch (err) {
//       console.error("Failed to delete queue:", err);
//       if (err.response) {
//         console.error("Server response:", err.response.status, err.response.data);
//         alert(`Failed to delete queue (${err.response.status}): ${err.response.data?.message || JSON.stringify(err.response.data)}`);
//       } else {
//         alert("Failed to delete queue. See console for details.");
//       }
//       // fallback: try to re-sync UI with latest server state
//       fetchData();
//     }
//   };

//   const createQueue = async () => {
//     if (!newQueueName.trim()) return;
//     try {
//       await axios.post(`${API}/api/places/${id}/queues`, {
//         queueName: newQueueName,
//       });
//       setQueueCreateMessage(`Queue "${newQueueName}" created.`);
//       setNewQueueName("");
//       setCreateQueueModalOpen(false);
//       fetchData();
//       setTimeout(() => setQueueCreateMessage(""), 3000);
//     } catch (err) {
//       console.error("Queue creation failed", err);
//       setQueueCreateMessage("Failed to create queue.");
//     }
//   };

//   const getWaitEstimate = (position) => `~${position * 8} min`;

//   // Single verify button action (opens your verify page in a new tab)
//   const openVerifyPage = () => {
//     const verifyUrl = `https://virtual-queue-managment.vercel.app/#/admin/verify?place=${encodeURIComponent(
//       id
//     )}`;
//     window.open(verifyUrl, "_blank");
//   };

//   const filteredQueue = searchQuery
//     ? queue.filter((user) =>
//         (user.userName || "").toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     : queue;

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/30">
//       {/* Sidebar - desktop */}
//       <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-50">
//         <div className="flex flex-col flex-grow bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 backdrop-blur-xl shadow-2xl overflow-y-auto">
//           <div className="flex items-center justify-center flex-shrink-0 px-6 py-6 border-b border-white/10">
//             <div className="flex items-center space-x-3">
//               <div className="relative h-11 w-11 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/30">
//                 <Users className="h-6 w-6 text-white" />
//                 <div className="absolute -top-1 -right-1">
//                   <Sparkles className="h-4 w-4 text-yellow-300" />
//                 </div>
//               </div>
//               <div>
//                 <h1 className="text-white text-2xl font-bold tracking-tight">QueueMaster</h1>
//                 <p className="text-white/70 text-xs font-medium">Business Pro</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="mt-6 flex-1 flex flex-col px-4">
//             <nav className="flex-1 space-y-2">
//               <a
//                 href="#"
//                 className="group flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl bg-white/20 backdrop-blur-xl text-white shadow-lg border border-white/30 transition-all duration-200"
//               >
//                 <Users className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
//                 Queue Management
//               </a>
//               {/* Verify Customers single button */}
//               <button
//                 onClick={openVerifyPage}
//                 className="w-full text-left flex items-center px-4 py-3.5 text-sm font-medium rounded-xl text-white/90 hover:bg-white/10 hover:backdrop-blur-xl transition-all duration-200"
//               >
//                 <Check className="mr-3 h-5 w-5" />
//                 Verify Customers
//               </button>

//               <a
//                 href="#"
//                 className="group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl text-white/90 hover:bg-white/10 hover:backdrop-blur-xl transition-all duration-200"
//               >
//                 <BarChart2 className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
//                 Analytics
//               </a>

//               <a
//                 href="#"
//                 className="group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl text-white/90 hover:bg-white/10 hover:backdrop-blur-xl transition-all duration-200"
//               >
//                 <Store className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
//                 Business Profile
//               </a>

//               <a
//                 href="#"
//                 className="group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl text-white/90 hover:bg-white/10 hover:backdrop-blur-xl transition-all duration-200"
//               >
//                 <Bell className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
//                 Notifications
//                 <span className="ml-auto h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold shadow-lg">3</span>
//               </a>

//               <a
//                 href="#"
//                 className="group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl text-white/90 hover:bg-white/10 hover:backdrop-blur-xl transition-all duration-200"
//               >
//                 <Settings className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
//                 Settings
//               </a>
//             </nav>

//             {/* Stats Card */}
//             <div className="mt-6 mb-4 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
//               <div className="flex items-center justify-between mb-3">
//                 <div className="flex items-center">
//                   <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
//                     <Activity className="h-5 w-5 text-white" />
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-xs text-white/70 font-medium">Total Today</p>
//                     <p className="text-2xl font-bold text-white">{queue.length}</p>
//                   </div>
//                 </div>
//                 <TrendingUp className="h-8 w-8 text-emerald-300" />
//               </div>
//               <div className="h-2 bg-white/20 rounded-full overflow-hidden">
//                 <div className="h-full w-3/4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-lg"></div>
//               </div>
//             </div>
//           </div>
          
//           <div className="px-4 pb-6 border-t border-white/10 pt-4">
//             <button
//               onClick={logout}
//               className="group w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl transition-all duration-200 border border-white/20"
//             >
//               <LogOut className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile sidebar */}
//       {mobileSidebarOpen && (
//         <div className="md:hidden fixed inset-0 flex z-50">
//           <div
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm"
//             onClick={() => setMobileSidebarOpen(false)}
//           ></div>
//           <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
//             <div className="absolute top-0 right-0 -mr-12 pt-2">
//               <button
//                 type="button"
//                 className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/20 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-white"
//                 onClick={() => setMobileSidebarOpen(false)}
//               >
//                 <X className="h-6 w-6 text-white" />
//               </button>
//             </div>
//             <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
//               <div className="flex items-center justify-center px-4 mb-6 border-b border-white/10 pb-6">
//                 <div className="flex items-center space-x-3">
//                   <div className="relative h-11 w-11 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/30">
//                     <Users className="h-6 w-6 text-white" />
//                     <div className="absolute -top-1 -right-1">
//                       <Sparkles className="h-4 w-4 text-yellow-300" />
//                     </div>
//                   </div>
//                   <div>
//                     <h1 className="text-white text-xl font-bold">QueueMaster</h1>
//                     <p className="text-white/70 text-xs font-medium">Business Pro</p>
//                   </div>
//                 </div>
//               </div>
//               <nav className="mt-6 flex-1 px-4 space-y-2">
//                 <a
//                   href="#"
//                   className="group flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl bg-white/20 backdrop-blur-xl text-white shadow-lg border border-white/30"
//                 >
//                   <Users className="mr-3 h-5 w-5" />
//                   Queue Management
//                 </a>
//                 <a
//                   href="#"
//                   className="group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl text-white/90 hover:bg-white/10"
//                 >
//                   <BarChart2 className="mr-3 h-5 w-5" />
//                   Analytics
//                 </a>
//                 <button
//                   onClick={openVerifyPage}
//                   className="w-full text-left flex items-center px-4 py-3.5 text-sm font-medium rounded-xl text-white/90 hover:bg-white/10 transition-all duration-200"
//                 >
//                   <Check className="mr-3 h-5 w-5" />
//                   Verify Customers
//                 </button>
//                 <a
//                   href="#"
//                   className="group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl text-white/90 hover:bg-white/10"
//                 >
//                   <Store className="mr-3 h-5 w-5" />
//                   Business Profile
//                 </a>
//                 <a
//                   href="#"
//                   className="group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl text-white/90 hover:bg-white/10"
//                 >
//                   <Bell className="mr-3 h-5 w-5" />
//                   Notifications
//                 </a>
//                 <a
//                   href="#"
//                   className="group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl text-white/90 hover:bg-white/10"
//                 >
//                   <Settings className="mr-3 h-5 w-5" />
//                   Settings
//                 </a>
//               </nav>
//             </div>
//             <div className="flex-shrink-0 border-t border-white/10 p-4">
//               <button
//                 onClick={logout}
//                 className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl"
//               >
//                 <LogOut className="mr-2 h-5 w-5" />
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main content */}
//       <div className="md:pl-72 flex flex-col flex-1">
//         {/* Top navigation */}
//         <div className="sticky top-0 z-10 md:hidden pl-2 pt-2 sm:pl-3 sm:pt-3 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/30">
//           <button
//             type="button"
//             className="h-12 w-12 inline-flex items-center justify-center rounded-xl text-slate-600 bg-white shadow-lg border border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             onClick={() => setMobileSidebarOpen(true)}
//           >
//             <Menu className="h-6 w-6" />
//           </button>
//         </div>

//         <main className="flex-1 pb-8">
//           <div className="py-6">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//               <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
//                 <div>
//                   <div className="flex items-center gap-3 mb-2">
//                     <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//                       {place.name || "Loading..."}
//                     </h1>
//                     <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-500/30">
//                       LIVE
//                     </span>
//                   </div>
//                   <p className="text-slate-600">Queue Management Dashboard</p>
//                 </div>
//                 <div className="flex space-x-3">
//                   <button
//                     onClick={manualRefresh}
//                     className={`group inline-flex items-center px-5 py-3 border-2 border-slate-200 shadow-lg text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 ${
//                       refreshing ? "animate-spin" : ""
//                     }`}
//                   >
//                     {refreshing ? (
//                       <Loader2 className="h-5 w-5 mr-2" />
//                     ) : (
//                       <RefreshCw className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
//                     )}
//                     Refresh
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//               {/* Queue selection controls */}
//               <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl mb-8 overflow-hidden border-2 border-slate-200/60">
//                 <div className="px-6 py-6">
//                   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
//                     <div className="flex-1">
//                       <label
//                         htmlFor="queue-select"
//                         className="block text-sm font-semibold text-slate-700 mb-2"
//                       >
//                         Active Queue
//                       </label>
//                       <div className="relative">
//                         <select
//                           id="queue-select"
//                           className="block w-full pl-4 pr-10 py-3 text-base font-medium border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl shadow-sm bg-white transition-all"
//                           value={selectedQueue}
//                           onChange={(e) => setSelectedQueue(e.target.value)}
//                         >
//                           {queueNames.map((q) => (
//                             <option key={q} value={q}>
//                               {q}
//                             </option>
//                           ))}
//                           {queueNames.length === 0 && (
//                             <option disabled>No queues available</option>
//                           )}
//                         </select>
//                       </div>
//                     </div>

//                     <div className="flex flex-col sm:flex-row gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setCreateQueueModalOpen(true)}
//                         className="group inline-flex items-center px-5 py-3 border-2 border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
//                       >
//                         <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
//                         New Queue
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => setAddUserModalOpen(true)}
//                         className="group inline-flex items-center px-5 py-3 border-2 border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200"
//                       >
//                         <Users className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
//                         Add Customer
//                       </button>
//                       <button
//                         type="button"
//                         onClick={deleteCurrentQueue}
//                         disabled={!selectedQueue}
//                         className={`group inline-flex items-center px-5 py-3 border-2 ${!selectedQueue ? "border-gray-200 text-gray-400 bg-gray-50" : "border-red-200 text-red-700 bg-red-50"} text-sm font-bold rounded-xl hover:shadow-lg transition-all duration-200`}
//                       >
//                         <Trash2 className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
//                         Delete Queue
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Queue content */}
//               <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border-2 border-slate-200/60">
//                 <div className="px-6 py-6 border-b-2 border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//                   <div>
//                     <h3 className="text-2xl font-bold text-slate-900">
//                       Queue: <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{selectedQueue}</span>
//                     </h3>
//                     <p className="mt-1 text-sm text-slate-600 font-medium">
//                       {queue.length} {queue.length === 1 ? "customer" : "customers"} waiting
//                     </p>
//                   </div>
//                   <div className="relative w-full md:w-72">
//                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                       <Search className="h-5 w-5 text-slate-400" />
//                     </div>
//                     <input
//                       type="text"
//                       className="block w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium shadow-sm transition-all"
//                       placeholder="Search customers..."
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 {loading ? (
//                   <div className="px-4 py-20 sm:px-6 text-center">
//                     <div className="relative inline-block">
//                       <div className="h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
//                       <div className="absolute inset-0 h-16 w-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
//                     </div>
//                     <p className="mt-6 text-base font-medium text-slate-600">Loading queue data...</p>
//                   </div>
//                 ) : filteredQueue.length === 0 ? (
//                   <div className="px-4 py-20 sm:px-6 text-center">
//                     <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8 w-28 h-28 mx-auto flex items-center justify-center shadow-xl border-2 border-indigo-100">
//                       <Users className="h-14 w-14 text-indigo-400" />
//                     </div>
//                     <h3 className="mt-6 text-xl font-bold text-slate-900">No customers</h3>
//                     <p className="mt-2 text-base text-slate-600 max-w-sm mx-auto">
//                       {searchQuery ? "No customers match your search" : "Start by adding customers to the queue"}
//                     </p>
//                     {!searchQuery && (
//                       <div className="mt-8">
//                         <button
//                           type="button"
//                           onClick={() => setAddUserModalOpen(true)}
//                           className="inline-flex items-center px-6 py-3 border-2 border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
//                         >
//                           <Plus className="h-5 w-5 mr-2" />
//                           Add Customer
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y-2 divide-slate-200">
//                       <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
//                         <tr>
//                           <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Position</th>
//                           <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Customer</th>
//                           <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Est. Wait Time</th>
//                           <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-slate-100">
//                         {filteredQueue.map((user, index) => (
//                           <tr key={user._id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200">
//                             <td className="px-6 py-5 whitespace-nowrap">
//                               <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-base font-bold text-white shadow-lg shadow-indigo-500/30">{index + 1}</div>
//                             </td>
//                             <td className="px-6 py-5 whitespace-nowrap">
//                               <div className="flex items-center">
//                                 <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
//                                   <span className="text-base font-bold text-white">{(user.userName || "U").charAt(0).toUpperCase()}</span>
//                                 </div>
//                                 <div className="ml-4">
//                                   <div className="text-base font-bold text-slate-900">{user.userName}</div>
//                                   <div className="text-sm text-slate-500 font-medium">Added {new Date(user.createdAt || Date.now()).toLocaleTimeString()}</div>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="px-6 py-5 whitespace-nowrap">
//                               <div className="flex items-center">
//                                 <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 mr-3 shadow-md">
//                                   <Clock className="h-5 w-5 text-emerald-600" />
//                                 </div>
//                                 <span className="text-sm font-bold text-slate-700">{getWaitEstimate(index + 1)}</span>
//                               </div>
//                             </td>
//                             <td className="px-6 py-5 whitespace-nowrap text-center">
//                               <div className="flex items-center justify-center gap-2">
//                                 {user.isVerified ? (
//                                   <button
//                                     className="group inline-flex items-center px-4 py-2.5 border-2 border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200"
//                                     onClick={() => serveUser(user._id)}
//                                   >
//                                     <Check className="h-4 w-4 mr-2" />
//                                     Serve
//                                   </button>
//                                 ) : (
//                                   <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">Needs Verification</span>
//                                 )}

//                                 <button
//                                   title="Remove customer"
//                                   onClick={() => removeUser(user._id)}
//                                   className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* Add User Modal */}
//       {addUserModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div className="absolute inset-0 bg-black/40" onClick={() => setAddUserModalOpen(false)} />
//           <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
//             <div className="px-6 pt-6 pb-4">
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
//                   <Users className="h-6 w-6 text-indigo-600" />
//                 </div>
//                 <div className="w-full">
//                   <div className="flex items-start justify-between">
//                     <h3 className="text-xl font-semibold text-gray-900">Add Customer to Queue</h3>
//                     <button onClick={() => setAddUserModalOpen(false)} className="p-2 rounded-md hover:bg-slate-100" aria-label="Close">
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>

//                   <div className="mt-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
//                     <input
//                       type="text"
//                       name="name"
//                       id="name"
//                       className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
//                       placeholder="Enter customer name"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                     />
//                     {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
//               <button onClick={() => setAddUserModalOpen(false)} className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
//               <button onClick={addToQueue} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Add to Queue</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Create Queue Modal */}
//       {createQueueModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div className="absolute inset-0 bg-black/40" onClick={() => setCreateQueueModalOpen(false)} />
//           <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
//             <div className="px-6 pt-6 pb-4">
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
//                   <Plus className="h-6 w-6 text-indigo-600" />
//                 </div>
//                 <div className="w-full">
//                   <div className="flex items-start justify-between">
//                     <h3 className="text-xl font-semibold text-gray-900">Create New Queue</h3>
//                     <button onClick={() => setCreateQueueModalOpen(false)} className="p-2 rounded-md hover:bg-slate-100" aria-label="Close">
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>

//                   <div className="mt-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Queue Name</label>
//                     <input
//                       type="text"
//                       name="new-queue"
//                       id="new-queue"
//                       className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
//                       placeholder="Enter queue name"
//                       value={newQueueName}
//                       onChange={(e) => setNewQueueName(e.target.value)}
//                     />
//                     {queueCreateMessage && <p className="mt-2 text-sm text-green-600">{queueCreateMessage}</p>}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
//               <button onClick={() => setCreateQueueModalOpen(false)} className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
//               <button onClick={createQueue} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Create Queue</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AdminPanel;
// AdminPanel.jsx
// AdminPanel.jsx
// AdminPanel.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  LogOut,
  Trash2,
  RefreshCw,
  Check,
  Store,
  Clock,
  Settings,
  Bell,
  Loader2,
  Plus,
  Search,
  BarChart2,
} from "lucide-react";
import io from "socket.io-client";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
// single socket instance (shared)
const socket = io(API);

function AdminPanel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [place, setPlace] = useState({});
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newQueueName, setNewQueueName] = useState("");
  const [queueNames, setQueueNames] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [queueCreateMessage, setQueueCreateMessage] = useState("");
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [createQueueModalOpen, setCreateQueueModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // prevent body scroll when either modal is open
  useEffect(() => {
    const anyModalOpen = addUserModalOpen || createQueueModalOpen;
    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [addUserModalOpen, createQueueModalOpen]);

  useEffect(() => {
    if (!id) return;

    socket.emit("joinPlaceRoom", id);
    fetchData();

    socket.on("queueUpdate", fetchData);

    return () => {
      socket.off("queueUpdate", fetchData);
    };
    
  }, [id, selectedQueue]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [placeRes, queueRes, queueNamesRes] = await Promise.all([
        axios.get(`${API}/api/places/${id}`),
        axios.get(`${API}/api/place/${id}`, {
          params: { queueName: selectedQueue },
        }),
        axios.get(`${API}/api/places/${id}/queues`),
      ]);
      setPlace(placeRes.data);
      setQueue(Array.isArray(queueRes.data) ? queueRes.data : []);
      setQueueNames(Array.isArray(queueNamesRes.data) ? queueNamesRes.data : []);
      if (!selectedQueue && queueNamesRes.data && queueNamesRes.data.length > 0) {
        setSelectedQueue(queueNamesRes.data[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const manualRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("businessId");
    navigate("/");
  };

  const addToQueue = async () => {
    if (!name.trim()) return setMessage("Enter a valid name");
    try {
      await axios.post(`${API}/api/place/${id}/join`, {
        userName: name,
        queueName: selectedQueue,
      });
      setName("");
      setMessage("");
      setAddUserModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error adding to queue:", error);
      setMessage("Failed to add user to queue");
    }
  };

  const serveUser = async (uid) => {
    try {
      await axios.patch(`${API}/api/serve/${uid}`);
      fetchData();
    } catch (error) {
      console.error("Error serving user:", error);
      alert("Failed to mark user as served. See console for details.");
    }
  };

  const removeUser = async (uid) => {
    if (!uid) return;
    if (!window.confirm("Remove this customer from the queue?")) return;

    try {
      await axios.delete(`${API}/api/queue/user/${uid}`);
    } catch (deleteErr) {
      try {
        await axios.post(`${API}/api/leave/${uid}`);
      } catch (leaveErr) {
        console.error("Both delete and leave failed:", { deleteErr, leaveErr });
        alert("Failed to remove user. See console for details.");
        return;
      }
    }

    try {
      await fetchData();
    } catch (err) {
      console.error("Failed to refresh after removal:", err);
    }
  };

  const deletePlace = async () => {
    if (window.confirm("Are you sure you want to delete this place?")) {
      try {
        await axios.delete(`${API}/api/places/${id}`);
        navigate("/");
      } catch (error) {
        console.error("Error deleting place:", error);
      }
    }
  };

  const deleteCurrentQueue = async () => {
    if (!selectedQueue) return alert("Select a queue first.");
    if (!window.confirm(`Delete queue "${selectedQueue}"? This cannot be undone.`))
      return;

    const queueToDelete = selectedQueue;

    try {
      const encoded = encodeURIComponent(queueToDelete);
      const resp = await axios.delete(
        `${API}/api/queue/delete-queue/${id}/${encoded}`
      );

      const updatedQueueNames = queueNames.filter((q) => q !== queueToDelete);
      setQueueNames(updatedQueueNames);

      if (updatedQueueNames.length > 0) {
        setSelectedQueue(updatedQueueNames[0]);
      } else {
        setSelectedQueue("");
        setQueue([]);
      }

      console.log(resp.data?.message || `Queue "${queueToDelete}" deleted`);
      await fetchData();
    } catch (err) {
      console.error("Failed to delete queue:", err);
      if (err.response) {
        alert(
          `Failed to delete queue (${err.response.status}): ${
            err.response.data?.message || JSON.stringify(err.response.data)
          }`
        );
      } else {
        alert("Failed to delete queue. See console for details.");
      }
      fetchData();
    }
  };

  const createQueue = async () => {
    if (!newQueueName.trim()) return;
    try {
      await axios.post(`${API}/api/places/${id}/queues`, {
        queueName: newQueueName,
      });
      setQueueCreateMessage(`Queue "${newQueueName}" created.`);
      setNewQueueName("");
      setCreateQueueModalOpen(false);
      fetchData();
      setTimeout(() => setQueueCreateMessage(""), 3000);
    } catch (err) {
      console.error("Queue creation failed", err);
      setQueueCreateMessage("Failed to create queue.");
    }
  };

  const getWaitEstimate = (position) => `~${position * 8} min`;

  const openVerifyPage = () => {
    const verifyUrl = `https://virtual-queue-managment.vercel.app/#/admin/verify?place=${encodeURIComponent(
      id
    )}`;
    window.open(verifyUrl, "_blank");
  };

  const filteredQueue = searchQuery
    ? queue.filter((user) =>
        (user.userName || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : queue;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-100 to-emerald-100 flex">
      <aside className="w-60 md:w-72 border-r-[3px] border-black bg-[#FFE7B3] flex flex-col">
        {/* Brand */}
        <div className="px-4 py-4 border-b-[3px] border-black flex items-center gap-3 bg-[#FFD966]">
          <div className="h-9 w-9 bg-black text-[#FFF5D9] flex items-center justify-center text-[11px] font-bold uppercase tracking-[0.15em]">
            Q
          </div>
          <div className="leading-tight">
            <div className="text-sm font-black tracking-tight">
              QueueBoard Admin
            </div>
            <div className="text-[11px] text-slate-800">
              {place.name || "Loading..."}
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-3 space-y-2 overflow-y-auto text-[13px]">
          <div className="border-[2px] border-black bg-white px-3 py-2 flex items-center gap-2">
            <Users size={14} />
            <span className="font-semibold">Queue management</span>
          </div>

          <button
            onClick={openVerifyPage}
            className="w-full border-[2px] border-black bg-white px-3 py-2 flex items-center gap-2 hover:-translate-y-[1px] transition-transform"
          >
            <Check size={14} />
            <span>Verify customers</span>
          </button>

          <div className="border-[2px] border-black bg-white px-3 py-2 flex items-center gap-2 opacity-80">
            <BarChart2 size={14} />
            <span>Analytics (soon)</span>
          </div>

          {/* <div className="border-[2px] border-black bg-white px-3 py-2 flex items-center gap-2 opacity-80">
            <Store size={14} />
            <span>Business profile</span>
          </div>

          <div className="border-[2px] border-black bg-white px-3 py-2 flex items-center gap-2 opacity-80">
            <Bell size={14} />
            <span>Notifications</span>
          </div>

          <div className="border-[2px] border-black bg-white px-3 py-2 flex items-center gap-2 opacity-80">
            <Settings size={14} />
            <span>Settings</span>
          </div> */}
        </div>

        <div className="px-3 py-3 border-t-[3px] border-black bg-[#FFF5D0] text-[11px] space-y-2">
          <div className="flex items-center gap-2 border-[2px] border-black bg-white px-2 py-1">
            <Clock size={12} />
            <span>
              Today in queue: <b>{queue.length}</b>
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full border-[2px] border-black bg-[#FECACA] px-3 py-1.5 flex items-center justify-center gap-2 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col bg-[#FFF8E5] border-l-[3px] border-black">
        <header className="px-5 md:px-7 py-4 border-b-[3px] border-black flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-[#FFF5D0]">
          <div>
            <h1 className="text-2xl md:text-3xl font-black leading-snug">
              Live queue dashboard
            </h1>
            <p className="text-[12px] text-slate-800 max-w-md">
              Manage walk-ins and appointments from one place.{" "}
              <span className="font-semibold">No shouting “next!” required.</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={manualRefresh}
              className="flex items-center gap-2 border-[2px] border-black bg-white px-3 py-1.5 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
            >
              {refreshing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              <span>Refresh</span>
            </button>
            {/* <button
              onClick={deletePlace}
              className="flex items-center gap-2 border-[2px] border-black bg-[#FECACA] px-3 py-1.5 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
            >
              <Trash2 size={14} />
              <span>Delete place</span>
            </button> */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 md:px-7 py-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border-[2px] border-black bg-white px-4 py-3 flex items-center gap-3">
              <div className="h-9 w-9 flex items-center justify-center border-[2px] border-black bg-[#FFF8E5]">
                <Users size={16} />
              </div>
              <div className="text-[12px]">
                <div className="font-semibold">Current queue</div>
                <div>{queue.length} waiting</div>
              </div>
            </div>
            <div className="border-[2px] border-black bg-white px-4 py-3 flex items-center gap-3">
              <div className="h-9 w-9 flex items-center justify-center border-[2px] border-black bg-[#FFF8E5]">
                <Store size={16} />
              </div>
              <div className="text-[12px]">
                <div className="font-semibold">Place</div>
                <div className="truncate">
                  {place.location || "(location not set)"}
                </div>
              </div>
            </div>
            <div className="border-[2px] border-black bg-white px-4 py-3 flex items-center gap-3">
              <div className="h-9 w-9 flex items-center justify-center border-[2px] border-black bg-[#FFF8E5]">
                <BarChart2 size={16} />
              </div>
              <div className="text-[12px]">
                <div className="font-semibold">Mode</div>
                <div>Live queue view</div>
              </div>
            </div>
          </div>

          {/* Queue controls */}
          <div className="border-[2px] border-black bg-[#FFE7B3] px-4 py-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                  Active queue
                </label>
                <select
                  className="w-full border-[2px] border-black bg-white px-3 py-2 text-sm font-medium"
                  value={selectedQueue}
                  onChange={(e) => setSelectedQueue(e.target.value)}
                >
                  {queueNames.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                  {queueNames.length === 0 && (
                    <option disabled>No queues available</option>
                  )}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCreateQueueModalOpen(true)}
                  className="inline-flex items-center gap-2 border-[2px] border-black bg-white px-3 py-2 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
                >
                  <Plus size={14} />
                  <span>New queue</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(true)}
                  className="inline-flex items-center gap-2 border-[2px] border-black bg-[#22C55E] px-3 py-2 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
                >
                  <Users size={14} />
                  <span>Add customer</span>
                </button>
                <button
                  type="button"
                  onClick={deleteCurrentQueue}
                  disabled={!selectedQueue}
                  className={`inline-flex items-center gap-2 border-[2px] border-black px-3 py-2 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform ${
                    !selectedQueue
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#FECACA] text-red-700"
                  }`}
                >
                  <Trash2 size={14} />
                  <span>Delete queue</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-[2px] border-black bg-white flex flex-col min-h-[240px]">
            <div className="px-4 py-3 border-b-[2px] border-black flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-[#FFF5D0]">
              <div>
                <h2 className="text-lg font-black">
                  Queue:{" "}
                  <span className="underline underline-offset-2">
                    {selectedQueue || "No queue selected"}
                  </span>
                </h2>
                <p className="text-[12px] text-slate-700">
                  {queue.length}{" "}
                  {queue.length === 1 ? "customer waiting" : "customers waiting"}
                </p>
              </div>
              <div className="w-full md:w-72">
                <div className="flex items-center border-[2px] border-black bg-[#FFF8E5] px-3 py-2">
                  <Search size={14} className="mr-2 text-slate-700" />
                  <input
                    type="text"
                    className="w-full text-sm bg-transparent outline-none placeholder:text-slate-400"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
                <div className="w-10 h-10 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-700">Loading queue data...</p>
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 px-4 text-center">
                <div className="h-20 w-20 border-[3px] border-black bg-[#FFE7B3] flex items-center justify-center">
                  <Users size={32} />
                </div>
                <h3 className="text-lg font-black">No customers</h3>
                <p className="text-[13px] text-slate-700 max-w-sm">
                  {searchQuery
                    ? "No customers match your search."
                    : "Start by adding customers to this queue."}
                </p>
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={() => setAddUserModalOpen(true)}
                    className="mt-1 inline-flex items-center gap-2 border-[2px] border-black bg-[#FB923C] px-4 py-2 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
                  >
                    <Plus size={14} />
                    <span>Add customer</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#FFF5D0] border-b-[2px] border-black">
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">
                        Position
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">
                        Est. wait
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQueue.map((user, index) => (
                      <tr
                        key={user._id}
                        className="border-b border-slate-200 hover:bg-[#FFF8E5]"
                      >
                        <td className="px-4 py-3 align-middle">
                          <div className="inline-flex items-center justify-center h-8 w-8 rounded-xl border-[2px] border-black bg-[#FFE7B3] text-xs font-bold">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl border-[2px] border-black bg-[#FFF5D0] flex items-center justify-center">
                              <span className="text-sm font-bold">
                                {(user.userName || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold">
                                {user.userName}
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Added{" "}
                                {new Date(
                                  user.createdAt || Date.now()
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg border-[2px] border-black bg-[#DCFCE7] flex items-center justify-center">
                              <Clock size={14} />
                            </div>
                            <span className="text-sm font-semibold">
                              {getWaitEstimate(index + 1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center justify-center gap-2">
                            {user.isVerified ? (
                              <button
                                className="inline-flex items-center gap-2 border-[2px] border-black bg-[#22C55E] px-3 py-1.5 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
                                onClick={() => serveUser(user._id)}
                              >
                                <Check size={14} />
                                <span>Serve</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 text-[11px] font-semibold border-[2px] border-black bg-[#FEF3C7] text-yellow-800">
                                Needs verification
                              </span>
                            )}

                            <button
                              title="Remove customer"
                              onClick={() => removeUser(user._id)}
                              className="inline-flex items-center justify-center border-[2px] border-black bg-[#FECACA] px-2.5 py-1.5 text-[12px] hover:-translate-y-[1px] transition-transform"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

      
        
      </div>

      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAddUserModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#FFF8E5] border-[3px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.4)] p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 border-[2px] border-black bg-[#FFE7B3] flex items-center justify-center">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black">Add customer</h3>
                  <p className="text-[12px] text-slate-700">
                    Add someone manually to the current queue.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddUserModalOpen(false)}
                className="text-sm underline underline-offset-2"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                  Customer name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="w-full border-[2px] border-black bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400"
                  placeholder="Enter customer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {message && (
                  <p className="mt-1 text-[12px] text-red-600">{message}</p>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setAddUserModalOpen(false)}
                className="border-[2px] border-black bg-white px-3 py-1.5 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={addToQueue}
                className="border-[2px] border-black bg-[#22C55E] px-4 py-1.5 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
              >
                Add to queue
              </button>
            </div>
          </div>
        </div>
      )}

      {createQueueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCreateQueueModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#FFF8E5] border-[3px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.4)] p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 border-[2px] border-black bg-[#FFE7B3] flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black">Create new queue</h3>
                  <p className="text-[12px] text-slate-700">
                    For example: &quot;General&quot;, &quot;Appointments&quot;,
                    &quot;VIP&quot;.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateQueueModalOpen(false)}
                className="text-sm underline underline-offset-2"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                  Queue name
                </label>
                <input
                  type="text"
                  name="new-queue"
                  id="new-queue"
                  className="w-full border-[2px] border-black bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400"
                  placeholder="Enter queue name"
                  value={newQueueName}
                  onChange={(e) => setNewQueueName(e.target.value)}
                />
                {queueCreateMessage && (
                  <p className="mt-1 text-[12px] text-emerald-600">
                    {queueCreateMessage}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCreateQueueModalOpen(false)}
                className="border-[2px] border-black bg-white px-3 py-1.5 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={createQueue}
                className="border-[2px] border-black bg-[#22C55E] px-4 py-1.5 text-[12px] font-semibold hover:-translate-y-[1px] transition-transform"
              >
                Create queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;

