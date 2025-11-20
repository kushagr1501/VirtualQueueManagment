import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Users,
  ChevronRight,
  Loader,
  X,
  RefreshCw,
  Trophy,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function QueuePage() {
  const { id } = useParams();
  const [queue, setQueue] = useState([]);
  const [name, setName] = useState("");
  const [queueNames, setQueueNames] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [placeName, setPlaceName] = useState("Loading...");
  const [error, setError] = useState(null);

  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem(`queueUser_${id}`)) || null
  );

  const [forcedExit, setForcedExit] = useState(null); 
  // { reason: "removed" | "queue_deleted"}

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(API, { withCredentials: true });

    socketRef.current.on("connect", () => {
      if (id) socketRef.current.emit("joinPlaceRoom", id);
    });

    socketRef.current.on("queueUpdate", (updatedList) => {
      applyQueueUpdate(updatedList);
    });

    fetchPlaceName();
    fetchQueueNames();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  useEffect(() => {
    fetchQueue();
  }, [selectedQueue]);

  const applyQueueUpdate = (updatedQueue) => {
    setQueue(updatedQueue);
    checkIfUserRemoved(updatedQueue);
  };

  const checkIfUserRemoved = (updatedQueue) => {
    if (!userInfo) return;

    const stillExists = updatedQueue.some((u) => u._id === userInfo._id);

    if (!stillExists) {
      // Find why user is gone
      axios
        .get(`${API}/api/queue/find-by-code/${userInfo.code}`)
        .then((res) => {
          if (res.data.status !== "waiting") {
            if (res.data.status === "served" && res.data.servedReason === "queue_deleted") {
              setForcedExit({ reason: "queue_deleted" });
            } else {
              setForcedExit({ reason: "removed" });
            }
          }
        })
        .catch(() => {
          setForcedExit({ reason: "removed" });
        });
    }
  };

  const fetchPlaceName = async () => {
    try {
      const res = await axios.get(`${API}/api/places/${id}`);
      setPlaceName(res.data?.name || "Unknown Place");
    } catch {
      setPlaceName("Unknown Place");
    }
  };

  const fetchQueueNames = async () => {
    try {
      const res = await axios.get(`${API}/api/places/${id}/queues`);
      setQueueNames(res.data || []);

      if (!selectedQueue && res.data.length > 0) {
        setSelectedQueue(res.data[0]);
      }
    } catch {}
  };

  const fetchQueue = async () => {
    if (!selectedQueue) return;

    setRefreshing(true);
    try {
      const res = await axios.get(`${API}/api/place/${id}`, {
        params: { queueName: selectedQueue },
      });
      applyQueueUpdate(res.data || []);
    } catch (err) {
      setError("Failed to load queue data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const joinQueue = async () => {
    if (!name.trim() || !selectedQueue) return;

    try {
      const res = await axios.post(`${API}/api/place/${id}/join`, {
        userName: name,
        queueName: selectedQueue,
      });

      const info = { _id: res.data._id, code: res.data.verificationCode };
      setUserInfo(info);
      localStorage.setItem(`queueUser_${id}`, JSON.stringify(info));
      toast.success("🎉 You've joined the queue!");
      fetchQueue();
    } catch {
      toast.error("Failed to join queue.");
    }
  };

  const leaveQueue = async () => {
    if (!userInfo?._id) return;

    try {
      await axios.post(`${API}/api/leave/${userInfo._id}`);
    } catch {}

    localStorage.removeItem(`queueUser_${id}`);
    setUserInfo(null);
    setForcedExit(null);
  };

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

  // --------------------------------------------------------------
  // 🚨 IF FORCED EXIT (queue deleted OR user removed)
  // --------------------------------------------------------------
  if (forcedExit) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center bg-red-50 px-6">
        <Toaster />

        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {forcedExit.reason === "queue_deleted"
              ? "Queue Closed"
              : "You Have Been Removed"}
          </h2>

          <p className="text-gray-600 mb-6">
            {forcedExit.reason === "queue_deleted"
              ? "This queue was closed by the business. Sorry for the inconvenience."
              : "You were removed from the queue. Please contact the business if needed."}
          </p>

          <button
            onClick={leaveQueue}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold"
          >
            OK — Leave Queue
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-12 px-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 text-white p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{placeName}</h1>
          <button
            onClick={fetchQueue}
            disabled={refreshing}
            className="p-2"
          >
            <RefreshCw
              size={20}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </div>

        <div className="p-6">
          {!userInfo ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
              <h2 className="text-lg font-semibold mb-3">Join Queue</h2>

              <select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                className="mb-4 w-full px-3 py-2 border rounded-md"
              >
                {queueNames.map((q) => (
                  <option key={q}>{q}</option>
                ))}
              </select>

              <div className="flex items-center gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border px-4 py-3 rounded-lg"
                />

                <button
                  onClick={joinQueue}
                  className="bg-indigo-600 text-white px-4 py-3 rounded-lg"
                >
                  Join <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                You're in the Queue!
              </h2>

              <button
                onClick={leaveQueue}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Leave Queue
              </button>
            </div>
          )}

          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Users size={18} className="text-indigo-600" />
            People in Queue
          </h2>

          {!loading && queue.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No customers in this queue
            </p>
          ) : (
            <div className="bg-gray-50 border rounded-lg max-h-60 overflow-y-auto">
              {queue.map((person, index) => (
                <div
                  key={person._id}
                  className="p-3 border-b flex items-center"
                >
                  <div className="w-8 flex justify-center">
                    {getPositionIcon(index + 1)}
                  </div>
                  <div className="font-medium">{person.userName}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QueuePage;
