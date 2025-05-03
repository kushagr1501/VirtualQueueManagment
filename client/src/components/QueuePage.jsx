import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import {
  Clock, User, Users, Check, ChevronRight,
  Loader, X, RefreshCw, Award, Trophy
} from "lucide-react";

const socket = io("http://localhost:5000");

function QueuePage() {
  const { id } = useParams();
  const [queue, setQueue] = useState([]);
  const [name, setName] = useState("");
  const [queueNames, setQueueNames] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [placeName, setPlaceName] = useState("Loading...");
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem(`queueUser_${id}`)) || null
  );

  useEffect(() => {
    socket.emit("joinPlaceRoom", id);
    fetchPlaceName();
    fetchQueueNames();
    fetchQueue();
    socket.on("queueUpdate", fetchQueue);
    const interval = setInterval(() => {
      if (userInfo) calculateWaitTime();
    }, 60000);
    return () => {
      socket.off("queueUpdate");
      clearInterval(interval);
    };
  }, [id, userInfo, selectedQueue]);

  const fetchPlaceName = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/places/${id}`);
      setPlaceName(res.data.name || "Unknown Place");
    } catch (err) {
      console.error("Failed to fetch place:", err);
    }
  };

  const fetchQueueNames = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/places/${id}/queues`);
      setQueueNames(res.data || []);
      if (!selectedQueue && res.data.length > 0) {
        setSelectedQueue(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch queue names", err);
    }
  };

  const fetchQueue = async () => {
    if (!selectedQueue) return;
    setRefreshing(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/place/${id}?queueName=${selectedQueue}`);
      setQueue(res.data);
      if (userInfo) calculateWaitTime();
    } catch (err) {
      console.error("Queue fetch failed:", err);
      setError("Failed to load queue data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateWaitTime = () => {
    if (!queue.length || !userInfo) return;
    const position = queue.findIndex(person => person._id === userInfo._id);
    if (position === -1) return;
    setEstimatedWaitTime(position * 5);
  };

  const joinQueue = async () => {
    if (!name.trim() || !selectedQueue) return;
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/place/${id}/join`, {
        userName: name,
        queueName: selectedQueue
      });
      const info = { _id: res.data._id, code: res.data.verificationCode };
      setUserInfo(info);
      localStorage.setItem(`queueUser_${id}`, JSON.stringify(info));
      setName("");
      toast.success("🎉 You've joined the queue!");
    } catch (err) {
      console.error("Join failed:", err);
      setError("Failed to join queue. Please try again.");
      toast.error("❌ Failed to join the queue.");
    } finally {
      setLoading(false);
    }
  };

  const leaveQueue = async () => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/leave/${userInfo._id}`);
      localStorage.removeItem(`queueUser_${id}`);
      setUserInfo(null);
      toast("👋 You've left the queue.");
    } catch (err) {
      console.error("Leave failed:", err);
      toast.error("Failed to leave queue.");
    } finally {
      setLoading(false);
    }
  };

  const getUserPosition = () => {
    if (!userInfo || !queue.length) return null;
    return queue.findIndex(person => person._id === userInfo._id) + 1;
  };

  const userPosition = getUserPosition();

  // Helper function to get medal icon for top 3 positions
  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy size={16} className="text-yellow-500" />;
      case 2:
        return <Trophy size={16} className="text-gray-400" />;
      case 3:
        return <Trophy size={16} className="text-amber-600" />;
      default:
        return <span className="w-4 inline-block text-center">{position}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-12 px-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 text-white p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{placeName}</h1>
          <button onClick={fetchQueue} disabled={refreshing} className="p-2">
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-700"><X size={16} /></button>
            </div>
          )}

          {!userInfo ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
              <h2 className="text-lg font-semibold mb-3">Join the Queue</h2>
              <select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                className="mb-4 w-full px-3 py-2 border rounded-md"
              >
                <option value="" disabled>Select a queue</option>
                {queueNames.map((qName) => (
                  <option key={qName} value={qName}>{qName}</option>
                ))}
              </select>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg"
                  />
                </div>
                <button
                  onClick={joinQueue}
                  disabled={!name.trim() || !selectedQueue || loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg"
                >
                  {loading ? <Loader size={16} className="animate-spin" /> : <>Join <ChevronRight size={16} /></>}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
              <h2 className="text-lg font-semibold text-green-800 mb-2">You're in the Queue!</h2>
              <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
                <p className="text-gray-500 text-sm mb-1">Your code</p>
                <div className="font-mono text-lg font-bold tracking-wider text-green-800">{userInfo.code}</div>
              </div>
              {userPosition && (
                <div className="mb-3 text-sm text-indigo-700">
                  🏆 You are currently <strong>#{userPosition}</strong> in the queue
                </div>
              )}
              <button
                onClick={leaveQueue}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                {loading ? <Loader size={16} className="animate-spin mx-auto" /> : "Leave Queue"}
              </button>
            </div>
          )}

          {/* Queue Leaderboard */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-indigo-600" />
              <h2 className="text-lg font-semibold">Queue Leaderboard</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-10">
                <Loader size={24} className="animate-spin text-indigo-600" />
              </div>
            ) : queue.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                No one is in the queue right now
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-3 bg-indigo-50 border-b border-gray-200 text-xs font-semibold text-indigo-800 grid grid-cols-12">
                  <div className="col-span-2 text-center">#</div>
                  <div className="col-span-10">Name</div>
                </div>
                
                <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                  {queue.map((person, index) => (
                    <div 
                      key={person._id} 
                      className={`p-3 grid grid-cols-12 items-center ${person._id === userInfo?._id ? 'bg-indigo-50' : ''}`}
                    >
                      <div className="col-span-2 flex justify-center">
                        {getPositionIcon(index + 1)}
                      </div>
                      <div className="col-span-10 font-medium truncate flex items-center">
                        {person.userName}
                        {person._id === userInfo?._id && (
                          <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">You</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueuePage;