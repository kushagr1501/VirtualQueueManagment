import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import {
  Clock, User, Users, Check, ChevronRight,
  Loader, X, RefreshCw, Award, Trophy
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  // userInfo saved when a user joins: { _id, code }
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem(`queueUser_${id}`)) || null
  );

  // served/cancelled flags
  const [servedPending, setServedPending] = useState(false);
  const [servedEntry, setServedEntry] = useState(null);
  const [cancelledPending, setCancelledPending] = useState(false);

  const [ackLoading, setAckLoading] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(API, { withCredentials: true });

    socketRef.current.on("connect", () => {
      if (id) socketRef.current.emit("joinPlaceRoom", id);
    });

    socketRef.current.on("queueUpdate", () => {
      fetchQueue();
    });

    fetchPlaceName();
    fetchQueueNames();

    const interval = setInterval(() => {
      if (userInfo) calculateWaitTime();
    }, 60_000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.off("queueUpdate");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQueue, userInfo]);

  const fetchPlaceName = async () => {
    try {
      const res = await axios.get(`${API}/api/places/${id}`);
      setPlaceName(res.data?.name || "Unknown Place");
    } catch (err) {
      console.error("Failed to fetch place:", err);
    }
  };

  const fetchQueueNames = async () => {
    try {
      const res = await axios.get(`${API}/api/places/${id}/queues`);
      setQueueNames(res.data || []);
      if (!selectedQueue && res.data?.length > 0) {
        setSelectedQueue(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch queue names", err);
    }
  };

  // get entry by verification code
  const fetchUserEntryByCode = async (code) => {
    try {
      const res = await axios.get(`${API}/api/queue/find-by-code/${code}`);
      return res.data;
    } catch (err) {
      return null;
    }
  };

  const fetchQueue = async () => {
    if (!selectedQueue) return;
    setRefreshing(true);

    try {
      const res = await axios.get(`${API}/api/place/${id}`, {
        params: { queueName: selectedQueue },
      });
      const q = res.data || [];
      setQueue(q);

      if (userInfo && userInfo._id) {
        const present = q.some((p) => p._id === userInfo._id);

        if (present) {
          // still waiting
          setServedPending(false);
          setServedEntry(null);
          setCancelledPending(false);
          calculateWaitTime(q);
        } else {
          // not present — check server entry
          const entry = await fetchUserEntryByCode(userInfo.code);
          if (!entry) {
            setServedPending(false);
            setServedEntry(null);
            setCancelledPending(true);
            toast("You are no longer in the queue. Press Leave to continue.");
          } else if (entry.status === "served") {
            // check if server set servedReason === 'queue_deleted'
            if (entry.servedReason === "queue_deleted") {
              // special apology flow
              setServedPending(true);
              setServedEntry(entry);
              setCancelledPending(false);
            } else {
              // normal served-by-staff flow: require voluntary acknowledgment (existing behavior)
              setServedPending(true);
              setServedEntry(entry);
              setCancelledPending(false);
            }
          } else if (entry.status === "cancelled") {
            setCancelledPending(true);
            setServedPending(false);
            setServedEntry(entry);
          } else {
            // other statuses
            setServedPending(false);
            setCancelledPending(false);
            setServedEntry(null);
            if (entry.queueName && entry.queueName !== selectedQueue) {
              toast("Your entry belongs to another queue; clearing local saved entry.");
              localStorage.removeItem(`queueUser_${id}`);
              setUserInfo(null);
            }
          }
        }
      } else {
        // no stored user
        setEstimatedWaitTime(null);
        setServedPending(false);
        setServedEntry(null);
        setCancelledPending(false);
      }
    } catch (err) {
      console.error("Queue fetch failed:", err);
      setError("Failed to load queue data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateWaitTime = (currentQueue = queue) => {
    if (!currentQueue.length || !userInfo) return;
    const position = currentQueue.findIndex((person) => person._id === userInfo._id);
    if (position === -1) {
      setEstimatedWaitTime(null);
      return;
    }
    setEstimatedWaitTime(position * 5);
  };

  const joinQueue = async () => {
    if (!name.trim() || !selectedQueue) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/place/${id}/join`, {
        userName: name,
        queueName: selectedQueue,
      });
      const info = { _id: res.data._id, code: res.data.verificationCode };
      setUserInfo(info);
      localStorage.setItem(`queueUser_${id}`, JSON.stringify(info));
      setName("");
      toast.success("🎉 You've joined the queue!");
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("joinPlaceRoom", id);
      }
      fetchQueue();
    } catch (err) {
      console.error("Join failed:", err);
      setError("Failed to join queue. Please try again.");
      toast.error("❌ Failed to join the queue.");
    } finally {
      setLoading(false);
    }
  };

  // User voluntarily leaves (normal flow)
  const leaveQueue = async () => {
    if (!userInfo?._id) {
      // nothing to do
      localStorage.removeItem(`queueUser_${id}`);
      setUserInfo(null);
      setServedPending(false);
      setServedEntry(null);
      setCancelledPending(false);
      fetchQueue();
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/api/leave/${userInfo._id}`);
      localStorage.removeItem(`queueUser_${id}`);
      setUserInfo(null);
      setServedPending(false);
      setServedEntry(null);
      setCancelledPending(false);
      toast("👋 You've left the queue.");
      fetchQueue();
    } catch (err) {
      console.error("Leave failed:", err);
      // fallback: clear local record anyway
      localStorage.removeItem(`queueUser_${id}`);
      setUserInfo(null);
      setServedPending(false);
      setServedEntry(null);
      setCancelledPending(false);
      toast.error("Failed to call server to leave; local record cleared.");
      fetchQueue();
    } finally {
      setLoading(false);
    }
  };

  // Special flow: admin deleted queue — we show apology and only allow user to leave locally.
  const leaveAfterQueueDeleted = () => {
    // We intentionally DO NOT call acknowledge or change server status here.
    // We'll clear the local queue join record and show a toast apology.
    localStorage.removeItem(`queueUser_${id}`);
    setUserInfo(null);
    setServedPending(false);
    setServedEntry(null);
    setCancelledPending(false);
    toast("We're sorry — the queue was closed. Your local record was cleared. Please contact staff for next steps.");
    fetchQueue();
  };

  // Optional: confirm served + call acknowledge endpoint (keeps previous behavior)
  const confirmServedAndLeave = async () => {
    if (!userInfo?._id) {
      localStorage.removeItem(`queueUser_${id}`);
      setUserInfo(null);
      setServedPending(false);
      setServedEntry(null);
      fetchQueue();
      return;
    }

    setAckLoading(true);
    try {
      await axios.post(`${API}/api/queue/${userInfo._id}/acknowledge`);
      localStorage.removeItem(`queueUser_${id}`);
      setUserInfo(null);
      setServedPending(false);
      setServedEntry(null);
      toast.success("Your acknowledgement was recorded and your record is cleared.");
      fetchQueue();
    } catch (err) {
      console.error("Acknowledge failed:", err);
      toast.error("Failed to acknowledge. Please try again.");
    } finally {
      setAckLoading(false);
    }
  };

  // Acknowledge cancelled / removed entries
  const acknowledgeCancelled = () => {
    localStorage.removeItem(`queueUser_${id}`);
    setUserInfo(null);
    setCancelledPending(false);
    setServedEntry(null);
    toast("Your local queue record was cleared.");
    fetchQueue();
  };

  const getUserPosition = () => {
    if (!userInfo || !queue.length) return null;
    const idx = queue.findIndex((person) => person._id === userInfo._id);
    return idx === -1 ? null : idx + 1;
  };

  const userPosition = getUserPosition();

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
              <button onClick={() => setError(null)} className="text-red-700">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Apology flow: user served due to queue deletion */}
          {servedPending && servedEntry && servedEntry.servedReason === "queue_deleted" && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-red-800 mb-2">We're sorry — Queue closed</h2>
              <p className="text-sm text-red-700 mb-3">
                Unfortunately the queue you joined was closed by the business. We apologise for the inconvenience.
                Please press <strong>Leave Queue</strong> to clear your local record and follow up with the business for next steps.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={leaveAfterQueueDeleted}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Leave Queue
                </button>
              </div>
            </div>
          )}

          {/* Served-by-staff flow (existing ack flow) */}
          {servedPending && servedEntry && servedEntry.servedReason !== "queue_deleted" && (
            <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">You're being served</h2>
              <p className="text-sm text-yellow-700 mb-3">
                Staff has marked your entry as <strong>served</strong>. Please confirm you've been served to clear your local queue record.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmServedAndLeave}
                  disabled={ackLoading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                >
                  {ackLoading ? <Loader size={16} className="animate-spin" /> : "I've been served — Confirm & Leave"}
                </button>
                <button
                  onClick={() => { setServedPending(false); toast("Okay — we'll keep your record until you confirm."); }}
                  className="bg-white border border-yellow-300 text-yellow-700 px-4 py-2 rounded-lg"
                >
                  Not yet / Keep me listed
                </button>
              </div>
            </div>
          )}

          {/* Cancelled / removed prompt */}
          {cancelledPending && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-red-800 mb-2">No longer in queue</h2>
              <p className="text-sm text-red-700 mb-3">
                Your entry appears to have been removed from the queue (cancelled or cleared). Press Acknowledge to remove your local join info.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={acknowledgeCancelled}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Acknowledge & Clear
                </button>
                <button
                  onClick={() => { setCancelledPending(false); toast("Okay — your local record remains."); }}
                  className="bg-white border border-red-200 text-red-700 px-4 py-2 rounded-lg"
                >
                  Keep local record
                </button>
              </div>
            </div>
          )}

          {/* Join UI or "You're in the queue" */}
          {!userInfo ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
              <h2 className="text-lg font-semibold mb-3">Join the Queue</h2>
              <select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                className="mb-4 w-full px-3 py-2 border rounded-md"
              >
                <option value="" disabled>
                  Select a queue
                </option>
                {queueNames.map((qName) => (
                  <option key={qName} value={qName}>
                    {qName}
                  </option>
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
                      className={`p-3 grid grid-cols-12 items-center ${person._id === userInfo?._id ? "bg-indigo-50" : ""}`}
                    >
                      <div className="col-span-2 flex justify-center">{getPositionIcon(index + 1)}</div>
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
