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
  Menu,
  X,
  Search,
  BarChart2,
} from "lucide-react";
import io from "socket.io-client";


const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

    // join room and set up listener
    socket.emit("joinPlaceRoom", id);
    fetchData();
    socket.on("queueUpdate", fetchData);

    return () => {
      socket.off("queueUpdate", fetchData);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedQueue]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [placeRes, queueRes, queueNamesRes] = await Promise.all([
        axios.get(`${API}/api/places/${id}`),
        axios.get(`${API}/api/place/${id}?queueName=${selectedQueue}`),
        axios.get(`${API}/api/places/${id}/queues`),
      ]);
      setPlace(placeRes.data);
      setQueue(queueRes.data);
      setQueueNames(queueNamesRes.data || []);
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
    if (
      window.confirm(`Delete queue "${selectedQueue}"? This cannot be undone.`)
    ) {
      try {
        await axios.delete(
          `${API}/api/queue/delete-all/${id}?queueName=${selectedQueue}`
        );
        fetchData();
      } catch (err) {
        console.error("Failed to delete queue:", err);
      }
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

  const filteredQueue = searchQuery
    ? queue.filter((user) =>
        user.userName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : queue;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - desktop */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-indigo-800 to-indigo-700 rounded-r-lg shadow-xl pt-6 pb-4 overflow-y-auto">
          <div className="flex items-center justify-center flex-shrink-0 px-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-white rounded-lg p-1.5">
                <Users className="h-6 w-6 text-indigo-700" />
              </div>
              <h1 className="text-white text-2xl font-bold">QueueMaster</h1>
            </div>
          </div>
          <div className="mt-6 flex-1 flex flex-col">
            <nav className="flex-1 px-3 space-y-2">
              <a
                href="#"
                className="bg-indigo-900 text-white group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 shadow-md"
              >
                <Users className="mr-3 h-5 w-5" />
                Queue Management
              </a>
              <a
                href="#"
                className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
              >
                <BarChart2 className="mr-3 h-5 w-5" />
                Analytics
              </a>
              <a
                href="#"
                className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
              >
                <Store className="mr-3 h-5 w-5" />
                Business Profile
              </a>
              <a
                href="#"
                className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
              >
                <Bell className="mr-3 h-5 w-5" />
                Notifications
              </a>
              <a
                href="#"
                className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </a>
            </nav>
          </div>
          <div className="px-3 pt-6 pb-2">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-indigo-100 bg-indigo-800 bg-opacity-50 hover:bg-opacity-70 rounded-xl transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 flex z-40">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-indigo-800 to-indigo-700 rounded-r-lg">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center justify-center px-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="bg-white rounded-lg p-1.5">
                    <Users className="h-6 w-6 text-indigo-700" />
                  </div>
                  <h1 className="text-white text-xl font-bold">QueueMaster</h1>
                </div>
              </div>
              <nav className="mt-6 flex-1 px-3 space-y-2">
                <a
                  href="#"
                  className="bg-indigo-900 text-white group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 shadow-md"
                >
                  <Users className="mr-3 h-5 w-5" />
                  Queue Management
                </a>
                <a
                  href="#"
                  className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                >
                  <BarChart2 className="mr-3 h-5 w-5" />
                  Analytics
                </a>
                <a
                  href="#"
                  className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                >
                  <Store className="mr-3 h-5 w-5" />
                  Business Profile
                </a>
                <a
                  href="#"
                  className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                >
                  <Bell className="mr-3 h-5 w-5" />
                  Notifications
                </a>
                <a
                  href="#"
                  className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </a>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-indigo-100 bg-indigo-800 bg-opacity-50 hover:bg-opacity-70 rounded-xl transition-all duration-200"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-72 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 md:hidden pl-2 pt-2 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 pb-8">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {place.name || "Loading..."}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Queue Management Dashboard
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={manualRefresh}
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  >
                    {refreshing ? (
                      <Loader2 className="h-4 w-4 mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Queue selection controls */}
              <div className="bg-white shadow-lg rounded-xl mb-8 overflow-hidden border border-gray-100">
                <div className="px-6 py-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <label
                        htmlFor="queue-select"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Active Queue
                      </label>
                      <div className="relative">
                        <select
                          id="queue-select"
                          className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm"
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
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"></div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setCreateQueueModalOpen(true)}
                        className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        New Queue
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddUserModalOpen(true)}
                        className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                      >
                        <Users className="h-5 w-5 mr-2" />
                        Add Customer
                      </button>
                      <button
                        type="button"
                        onClick={deleteCurrentQueue}
                        className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                      >
                        <Trash2 className="h-5 w-5 mr-2" />
                        Delete Queue
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Queue content */}
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Queue: {selectedQueue}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {queue.length} {queue.length === 1 ? "customer" : "customers"} waiting
                    </p>
                  </div>
                  <div className="relative w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="px-4 py-16 sm:px-6 text-center">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-indigo-500" />
                    <p className="mt-4 text-base text-gray-500">Loading queue data...</p>
                  </div>
                ) : filteredQueue.length === 0 ? (
                  <div className="px-4 py-16 sm:px-6 text-center">
                    <div className="rounded-full bg-indigo-50 p-6 w-24 h-24 mx-auto flex items-center justify-center">
                      <Users className="h-12 w-12 text-indigo-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No customers</h3>
                    <p className="mt-2 text-base text-gray-500">
                      {searchQuery ? "No customers match your search" : "Start by adding customers to the queue"}
                    </p>
                    {!searchQuery && (
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => setAddUserModalOpen(true)}
                          className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Add Customer
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Wait Time</th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredQueue.map((user, index) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-sm font-medium text-indigo-800">{index + 1}</div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">{user.userName.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-base font-medium text-gray-900">{user.userName}</div>
                                  <div className="text-sm text-gray-500">Added {new Date(user.createdAt || Date.now()).toLocaleTimeString()}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-700">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 mr-2">
                                  <Clock className="h-4 w-4 text-green-600" />
                                </div>
                                {getWaitEstimate(index + 1)}
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-center">
                              {user.isVerified ? (
                                <button
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                                  onClick={() => serveUser(user._id)}
                                >
                                  <Check className="h-5 w-5 mr-2" />
                                  Serve Now
                                </button>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">Needs Verification</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add User Modal (updated centered modal) */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAddUserModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="w-full">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Add Customer to Queue
                    </h3>
                    <button
                      onClick={() => setAddUserModalOpen(false)}
                      className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900"
                      placeholder="Enter customer name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-900 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setAddUserModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addToQueue}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Add to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Queue Modal (updated centered modal) */}
      {createQueueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCreateQueueModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                  <Plus className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="w-full">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Create New Queue
                    </h3>
                    <button
                      onClick={() => setCreateQueueModalOpen(false)}
                      className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Queue Name
                    </label>
                    <input
                      type="text"
                      name="new-queue"
                      id="new-queue"
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-900"
                      placeholder="Enter queue name"
                      value={newQueueName}
                      onChange={(e) => setNewQueueName(e.target.value)}
                    />
                    {queueCreateMessage && <p className="mt-2 text-sm text-green-600">{queueCreateMessage}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-900 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setCreateQueueModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createQueue}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Create Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
