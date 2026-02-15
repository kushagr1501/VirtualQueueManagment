import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Users,
  LogOut,
  Trash2,
  RefreshCw,
  Check,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Activity,
  Terminal,
  X,
  Menu,
  QrCode,
  ShieldCheck,
  Download
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { logout } from "../utils/auth";
import { useSocket } from "../utils/socket";
import gsap from "gsap";
import { AdminQueueSkeleton } from "./Skeleton";


const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminPanel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { joinPlace, leavePlace, onQueueUpdate } = useSocket();
  const [queue, setQueue] = useState([]);
  const [place, setPlace] = useState({});
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newQueueName, setNewQueueName] = useState("");
  const [queueNames, setQueueNames] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [createQueueModalOpen, setCreateQueueModalOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const qrRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [editPlaceModalOpen, setEditPlaceModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [placeRes, queueRes, queueNamesRes] = await Promise.all([
        axios.get(`${API}/api/places/${id}`),
        axios.get(`${API}/api/place/${id}`, { params: { queueName: selectedQueue } }),
        axios.get(`${API}/api/places/${id}/queues`),
      ]);
      setPlace(placeRes.data);
      setEditName(placeRes.data.name);
      setEditDescription(placeRes.data.description);
      setEditLocation(placeRes.data.location);

      setQueue(Array.isArray(queueRes.data) ? queueRes.data : []);
      setQueueNames(Array.isArray(queueNamesRes.data) ? queueNamesRes.data : []);
      if (!selectedQueue && queueNamesRes.data?.length > 0) {
        setSelectedQueue(queueNamesRes.data[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [id, selectedQueue]);

  useEffect(() => {
    if (!id) return;

    localStorage.setItem("lastPlaceId", id);

    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    joinPlace(id);
    fetchData();

    const handleQueueUpdate = (payload) => {
      if (payload && !Array.isArray(payload) && payload.queueName) {
        if (payload.queueName === selectedQueue) {
          setQueue(payload.data);
        }
      } else if (Array.isArray(payload)) {
        fetchData();
      }
    };

    const unsubscribe = onQueueUpdate(handleQueueUpdate);

    return () => {
      unsubscribe();
      leavePlace(id);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [id, selectedQueue, joinPlace, leavePlace, onQueueUpdate, fetchData]);

  useEffect(() => {
    if (queue.length > 0) {
      gsap.fromTo(".queue-row",
        { opacity: 0, y: 5 },
        { opacity: 1, y: 0, stagger: 0.03, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [queue]);

  useEffect(() => {
    gsap.fromTo(".stats-card",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "back.out(1.2)", delay: 0.1 }
    );
  }, []);

  const manualRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 500);
  };

  /* logout function imported from utils */

  const addToQueue = async () => {
    if (!name.trim()) return;
    try {
      await axios.post(`${API}/api/place/${id}/join`, { userName: name, queueName: selectedQueue });
      setName("");
      setAddUserModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Failed to add user");
    }
  };

  const serveUser = async (uid) => {
    try {
      await axios.patch(`${API}/api/serve/${uid}`);
      fetchData();
    } catch (error) {
      alert("Failed to serve user");
    }
  };

  const removeUser = async (uid) => {
    if (!window.confirm("Remove this customer?")) return;
    try {
      await axios.post(`${API}/api/leave/${uid}`);
      fetchData();
    } catch (error) {
      alert("Failed to remove user");
    }
  };

  const deletePlace = async () => {
    if (window.confirm("Delete this place entirely? This cannot be undone.")) {
      try {
        await axios.delete(`${API}/api/places/${id}`);
        localStorage.removeItem("lastPlaceId");
        window.location.replace(`${window.location.origin}/`);
      } catch (error) {
        alert("Failed to delete place");
      }
    }
  };

  const deleteCurrentQueue = async () => {
    if (!selectedQueue || !window.confirm(`Delete queue "${selectedQueue}"?`)) return;
    try {
      const encoded = encodeURIComponent(selectedQueue);
      await axios.delete(`${API}/api/queue/delete-queue/${id}/${encoded}`);
      const updated = queueNames.filter(q => q !== selectedQueue);
      setQueueNames(updated);
      setSelectedQueue(updated[0] || "");
      fetchData();
    } catch (error) {
      alert("Failed to delete queue");
    }
  };

  const createQueue = async () => {
    if (!newQueueName.trim()) return;
    try {
      await axios.post(`${API}/api/places/${id}/queues`, { queueName: newQueueName });
      setNewQueueName("");
      setCreateQueueModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Failed to create queue");
    }
  };

  const updatePlace = async () => {
    if (!editName.trim()) return;
    try {
      await axios.put(`${API}/api/places/${id}`, {
        name: editName,
        description: editDescription,
        location: editLocation
      });
      setEditPlaceModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Failed to update place");
    }
  };

  const filteredQueue = searchQuery
    ? queue.filter(u => (u.userName || "").toLowerCase().includes(searchQuery.toLowerCase()))
    : queue;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row font-sans selection:bg-orange-500 selection:text-white">


      <div className="md:hidden p-4 border-b border-gray-200 flex justify-between items-center bg-white z-50 relative shadow-sm">
        <div className="flex items-center gap-2 font-bold tracking-tight text-slate-900">
          <div className="w-6 h-6 bg-slate-900 text-white rounded flex items-center justify-center text-xs">Q</div>
          QueueBoard
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="w-6 h-6 text-slate-900" />
        </button>
      </div>


      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
        <div className="p-8 border-b border-gray-100 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold shadow-lg shadow-slate-900/20">Q</div>
            <div>
              <div className="text-sm font-bold tracking-wider uppercase text-slate-900">QueueBoard</div>
              <div className="text-[10px] text-slate-400 font-bold font-mono">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setSidebarOpen(false)} className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 text-slate-900 rounded-xl font-bold transition-all border border-slate-100 shadow-sm">
            <Users className="w-4 h-4 text-orange-600" /> Queue Manager
          </button>
          <button
            onClick={() => window.open(`${window.location.origin}/#/admin/verify?place=${id}`, "_blank")}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-gray-50 rounded-xl transition-colors font-medium hover:shadow-sm"
          >
            <Check className="w-4 h-4" /> Verify Tokens
          </button>
          <Link
            to={`/admin/place/${id}/analytics`}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-gray-50 rounded-xl transition-colors font-medium hover:shadow-sm"
          >
            <Activity className="w-4 h-4" /> Analytics
          </Link>
        </nav>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="mb-4">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Place</div>
            <div className="text-sm font-bold text-slate-900 truncate">{place.name || "Loading..."}</div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 bg-white text-slate-500 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm hover:shadow">
            <LogOut className="w-3 h-3" /> SIGN OUT
          </button>
        </div>
      </aside>


      <main className="flex-1 flex flex-col h-[calc(100vh-60px)] md:h-screen overflow-hidden bg-[#F8FAFC]">


        <div className="absolute inset-0 bg-[linear-gradient(#00000005_1px,transparent_1px),linear-gradient(90deg,#00000005_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>


        <header className="py-4 sm:py-8 px-4 sm:px-8 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 bg-white/80 backdrop-blur-md gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">STATUS: {loading ? 'SYNCING...' : 'ONLINE'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-none">Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQRModal(true)}
              className="p-2.5 sm:p-3 text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm flex items-center gap-2 group"
              title="Show QR Code"
            >
              <QrCode className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Share</span>
            </button>
            <button onClick={manualRefresh} className="p-2.5 sm:p-3 text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-xl transition-colors bg-white border border-gray-200 shadow-sm">
              <RefreshCw className={`w-4 sm:w-5 h-4 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setEditPlaceModalOpen(true)}
              className="p-2.5 sm:p-3 text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-xl transition-colors bg-white border border-gray-200 shadow-sm"
              title="Edit Place"
            >
              <span className="text-xs font-bold uppercase tracking-wider">Edit</span>
            </button>
            <button onClick={deletePlace} className="px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors uppercase tracking-wider">
              Delete
            </button>
          </div>
        </header>


        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10 scroll-smooth text-slate-900">


          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
            <div className="stats-card bg-white border border-gray-200 p-5 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-orange-500/50 transition-all shadow-sm hover:shadow-md cursor-default group transform hover:-translate-y-1">
              <div className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 group-hover:text-orange-600 transition-colors">Total Waiting</div>
              <div className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">{queue.length}</div>
            </div>
            <div className="stats-card bg-white border border-gray-200 p-5 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-orange-500/50 transition-all shadow-sm hover:shadow-md cursor-default group transform hover:-translate-y-1">
              <div className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 group-hover:text-orange-600 transition-colors">Est. Wait Time</div>
              <div className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">~{queue.length * 5}<span className="text-xl sm:text-2xl text-gray-400 align-top ml-1 font-medium group-hover:text-orange-400">m</span></div>
            </div>
            <div className="stats-card bg-white border border-gray-200 p-5 sm:p-8 rounded-2xl sm:rounded-3xl col-span-2 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">

              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors"></div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Active Queue</div>
                  <div className="text-3xl font-bold flex items-center gap-3 text-slate-900 tracking-tight">
                    {selectedQueue || "None"}
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">LIVE</span>
                  </div>
                </div>
                <select
                  className="bg-gray-50 border border-gray-200 text-slate-900 text-sm font-medium rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition-all cursor-pointer min-w-[180px]"
                  value={selectedQueue}
                  onChange={(e) => setSelectedQueue(e.target.value)}
                >
                  {queueNames.map(q => <option key={q} value={q}>{q}</option>)}
                  {queueNames.length === 0 && <option disabled>Create a queue</option>}
                </select>
              </div>
              <div className="flex gap-3 relative z-10">
                <button onClick={() => setCreateQueueModalOpen(true)} className="px-5 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20 uppercase tracking-wider">
                  <Plus className="w-4 h-4" /> New Queue
                </button>
                <button onClick={deleteCurrentQueue} disabled={!selectedQueue} className="px-4 py-3 border border-gray-200 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 hover:text-red-500 hover:border-red-500/30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>


          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-[480px] group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-14 pr-4 py-4 text-base text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-gray-300 font-medium shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button onClick={() => setAddUserModalOpen(true)} className="w-full md:w-auto px-8 py-4 bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 uppercase tracking-wide">
              <Plus className="w-4 h-4" /> Add Walk-In
            </button>
          </div>


          {/* Queue Table — Desktop: table grid, Mobile: card list */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-12 gap-6 p-6 border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <div className="col-span-1 text-center font-mono">#</div>
              <div className="col-span-4 pl-2">Customer</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2">Time Estimate</div>
              <div className="col-span-2 text-right">Manage</div>
            </div>

            {loading ? (
              <div className="p-6"><AdminQueueSkeleton /></div>
            ) : filteredQueue.length === 0 ? (
              <div className="py-16 sm:py-32 text-center flex flex-col items-center px-4">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <Terminal className="w-6 sm:w-8 h-6 sm:h-8 text-gray-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Queue is empty</h3>
                <p className="text-gray-500 max-w-sm mb-6 sm:mb-8 text-sm leading-relaxed">There are no customers currently waiting in this queue.</p>
                <button onClick={() => setAddUserModalOpen(true)} className="text-sm font-bold text-orange-600 hover:text-orange-500 border-b border-orange-500/30 pb-0.5 transition-colors uppercase tracking-wider">Add first customer</button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredQueue.map((user, i) => (
                  <div key={user._id} className="queue-row">
                    {/* Desktop row */}
                    <div className="hidden md:grid grid-cols-12 gap-6 p-6 items-center hover:bg-gray-50 transition-colors group">
                      <div className="col-span-1 text-center font-mono font-bold text-gray-400 text-sm">{(i + 1).toString().padStart(2, '0')}</div>
                      <div className="col-span-4 pl-2">
                        <div className="font-bold text-slate-900 text-lg leading-tight mb-1.5">{user.userName}</div>
                        <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase flex items-center gap-2">
                          ID: <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 border border-gray-200">{user._id.slice(-8)}</span>
                        </div>
                      </div>
                      <div className="col-span-3">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase border border-emerald-100 tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-600 text-[10px] font-bold uppercase border border-yellow-100 tracking-wider">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 font-mono text-sm font-medium text-slate-500">
                        ~{(i + 1) * 5} min
                      </div>
                      <div className="col-span-2 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {user.isVerified && (
                          <button onClick={() => serveUser(user._id)} className="p-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform hover:scale-105" title="Mark Served">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => removeUser(user._id)} className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-lg transition-all" title="Remove">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile card */}
                    <div className="md:hidden p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-mono font-bold text-sm text-gray-500">{(i + 1).toString().padStart(2, '0')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{user.userName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {user.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-yellow-600 text-[10px] font-bold uppercase"><Clock className="w-3 h-3" /> Pending</span>
                          )}
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-400 text-[10px] font-mono">~{(i + 1) * 5}m</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {user.isVerified && (
                          <button onClick={() => serveUser(user._id)} className="p-2 bg-emerald-500 text-white rounded-lg" title="Serve">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => removeUser(user._id)} className="p-2 border border-gray-200 text-gray-400 rounded-lg" title="Remove">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>


      {
        (addUserModalOpen || createQueueModalOpen || showQRModal || editPlaceModalOpen) && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => {
                setAddUserModalOpen(false);
                setCreateQueueModalOpen(false);
                setShowQRModal(false);
                setEditPlaceModalOpen(false);
              }}
            ></div>

            {/* Content for Add User / Create Queue Modal */}
            {(addUserModalOpen || createQueueModalOpen) && (
              <div className="relative bg-white border border-gray-100 w-full max-w-md p-8 rounded-3xl shadow-2xl transform scale-100 transition-transform">
                <h3 className="text-2xl font-bold mb-2 text-slate-900">{addUserModalOpen ? "New Customer" : "New Queue"}</h3>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">Enter the details below to proceed.</p>

                <div className="mb-8">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                    {addUserModalOpen ? "Customer Full Name" : "Queue Name"}
                  </label>
                  <input
                    autoFocus
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-slate-900 outline-none focus:border-orange-500 focus:bg-white text-lg transition-all placeholder:text-gray-400 shadow-inner"
                    placeholder={addUserModalOpen ? "e.g. Michael Scott" : "e.g. Priority Ops"}
                    value={addUserModalOpen ? name : newQueueName}
                    onChange={(e) => addUserModalOpen ? setName(e.target.value) : setNewQueueName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addUserModalOpen ? addToQueue() : createQueue();
                      }
                    }}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button onClick={() => { setAddUserModalOpen(false); setCreateQueueModalOpen(false); }} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-gray-100 transition-all">Cancel</button>
                  <button onClick={addUserModalOpen ? addToQueue : createQueue} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/20">Confirm</button>
                </div>
              </div>
            )}

            {/* Content for Edit Place Modal */}
            {editPlaceModalOpen && (
              <div className="relative bg-white border border-gray-100 w-full max-w-md p-8 rounded-3xl shadow-2xl transform scale-100 transition-transform">
                <h3 className="text-2xl font-bold mb-2 text-slate-900">Edit Place</h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed">Update your business details.</p>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Name</label>
                    <input
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Description</label>
                    <textarea
                      rows={2}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all resize-none"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Location</label>
                    <input
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button onClick={() => setEditPlaceModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-gray-100 transition-all">Cancel</button>
                  <button onClick={updatePlace} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/20">Save Changes</button>
                </div>
              </div>
            )}

            {/* Content for QR Code Modal */}
            {showQRModal && (
              <div className="relative bg-white border border-gray-100 w-full max-w-sm p-6 rounded-3xl shadow-2xl transform scale-100 transition-transform text-center">
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-900/20">
                  <QrCode className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold mb-1 text-slate-900">Scan to Join</h3>
                <p className="text-slate-500 mb-6 text-xs leading-relaxed max-w-[240px] mx-auto">
                  Display this at your entrance to let customers join instantly.
                </p>

                <div
                  className="bg-white p-3 border border-gray-200 rounded-xl inline-block mb-6 shadow-inner"
                  ref={qrRef}
                >
                  <QRCodeCanvas
                    value={`${window.location.origin}/place/${id}${selectedQueue ? `?queueName=${encodeURIComponent(selectedQueue)}` : ''}`}
                    size={160}
                    level={"H"}
                    includeMargin={true}
                  />
                  <div className="mt-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest">{place.name || "QueueBoard"}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-2 mb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                      <div className="text-[10px] font-bold uppercase text-orange-700 tracking-wider">Ghost Prevention</div>
                    </div>
                    <p className="text-[10px] text-orange-800/70 leading-relaxed font-medium">
                      Rate limiting is active (30 joins/5min) to stop bots. Verify physical presence.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-600" />
                      <div className="text-[10px] font-bold uppercase text-gray-700 tracking-wider">Device Limits</div>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                      Restricts users to one active ticket per device to prevent queue spamming.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-gray-100 transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const canvas = qrRef.current?.querySelector('canvas');
                      if (canvas) {
                        const url = canvas.toDataURL("image/png");
                        const link = document.createElement('a');
                        link.download = `${place.name || 'queue'}-qr.png`;
                        link.href = url;
                        link.click();
                      }
                    }}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Save Image
                  </button>
                </div>
              </div>
            )}

          </div>
        )
      }


    </div >
  );
}

export default AdminPanel;
