import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Clock, Trash2, ArrowRight, Activity, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { TicketCardSkeleton } from "./Skeleton";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function MyQueues() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  // Fetch real queue data from server
  const fetchQueueStatus = useCallback(async (storedQueues) => {
    if (!storedQueues || storedQueues.length === 0) {
      setQueues([]);
      setLoading(false);
      return;
    }

    try {
      const updatedQueues = await Promise.all(
        storedQueues.map(async (q) => {
          try {
            // Fetch current queue data for this place
            const queueRes = await axios.get(`${API}/api/place/${q.placeId}`, {
              params: { queueName: q.queueName || "default" }
            });

            const queueData = queueRes.data || [];

            // Find user's position in queue
            const userEntry = queueData.find(entry => entry._id === q.ticketId);
            const position = userEntry ? queueData.findIndex(entry => entry._id === q.ticketId) + 1 : null;

            // Determine status
            let status = "completed";
            if (userEntry) {
              status = userEntry.status === "waiting" ? "waiting" : "serving";
            }

            return {
              ...q,
              position: position || "?",
              status,
              queueSize: queueData.length,
              estWait: position ? position * 5 : 0,
              isValid: !!userEntry
            };
          } catch (err) {
            // If fetch fails, mark as potentially completed
            return { ...q, position: "?", status: "completed", isValid: false };
          }
        })
      );

      // Filter out completed queues that are older than 24 hours
      const validQueues = updatedQueues.filter(q => {
        if (q.status === "completed") {
          const startTime = new Date(q.start);
          const hoursSince = (new Date() - startTime) / (1000 * 60 * 60);
          return hoursSince < 24; // Keep completed queues for 24 hours
        }
        return true;
      });

      setQueues(validQueues);

      // Update localStorage with cleaned up data
      localStorage.setItem("myQueues", JSON.stringify(validQueues.map(q => ({
        placeId: q.placeId,
        placeName: q.placeName,
        ticketId: q.ticketId,
        queueName: q.queueName,
        start: q.start,
        verifyCode: q.verifyCode
      }))));
    } catch (err) {
      // Fallback to stored data if fetch fails
      setQueues(storedQueues.map(q => ({ ...q, position: "?", status: "unknown" })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("myQueues") || "[]");
    fetchQueueStatus(stored);

    // Set up polling to refresh queue status every 30 seconds
    const interval = setInterval(() => {
      const current = JSON.parse(localStorage.getItem("myQueues") || "[]");
      fetchQueueStatus(current);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchQueueStatus]);

  useEffect(() => {
    if (queues.length > 0) {
      gsap.fromTo(".queue-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.1 }
      );
    }
  }, [queues]);

  const removeQueue = (placeId, ticketId) => {
    const updated = queues.filter((q) => !(q.placeId === placeId && q.ticketId === ticketId));
    setQueues(updated);
    localStorage.setItem("myQueues", JSON.stringify(updated.map(q => ({
      placeId: q.placeId,
      placeName: q.placeName,
      ticketId: q.ticketId,
      queueName: q.queueName,
      start: q.start,
      verifyCode: q.verifyCode
    }))));
  };

  const getStatusStyle = (status) => {
    if (status === "serving") return { text: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50" };
    if (status === "waiting") return { text: "text-orange-600", border: "border-orange-200", bg: "bg-orange-50" };
    if (status === "completed") return { text: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50" };
    return { text: "text-gray-500", border: "border-gray-200", bg: "bg-gray-50" };
  };

  const getStatusLabel = (status) => {
    if (status === "serving") return "Now Serving";
    if (status === "waiting") return "Waiting";
    return "Completed";
  };

  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "--:--";
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-black font-sans selection:bg-black selection:text-white">

      <header className="fixed top-0 w-full bg-[#F2F2F2]/90 backdrop-blur-md z-50 border-b border-black/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
          <Link to="/" className="text-lg sm:text-xl font-bold tracking-tighter uppercase">QueueBoard</Link>
          <Link to="/home" className="text-sm font-bold border-b-2 border-transparent hover:border-black transition-all">Find Queues</Link>
        </div>
      </header>

      <main className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6 max-w-3xl mx-auto min-h-screen">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-2 sm:mb-4">My Tickets</h1>
          <p className="text-gray-500 font-medium text-base sm:text-lg">Active sessions on this device.</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => <TicketCardSkeleton key={i} />)}
          </div>
        ) : queues.length === 0 ? (
          <div className="bg-white border border-black/5 rounded-3xl p-8 sm:p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 tracking-tight">No active tickets</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">You haven't joined any queues yet. Scan a QR code or find a place to get started.</p>
            <Link to="/home" className="inline-flex items-center gap-2 bg-black text-white font-bold px-8 py-4 rounded-xl hover:bg-orange-500 transition-colors uppercase tracking-wider text-sm">
              Join a Queue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div ref={containerRef} className="space-y-6">
            {queues.map((q, i) => {
              const style = getStatusStyle(q.status);
              return (
                <div key={`${q.placeId}-${q.ticketId}`} className="queue-card group bg-white rounded-3xl border border-black/5 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-5 sm:p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${q.status === 'serving' ? 'bg-emerald-500 animate-pulse' : q.status === 'waiting' ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${style.text}`}>
                            {getStatusLabel(q.status)}
                          </span>
                          {!q.isValid && q.status !== "completed" && (
                            <span className="text-[10px] text-gray-400">(Status Unknown)</span>
                          )}
                        </div>
                        <h3 className="text-xl sm:text-3xl font-black leading-none mb-1 group-hover:text-orange-500 transition-colors">{q.placeName}</h3>
                        <p className="text-gray-400 font-mono text-xs uppercase tracking-wider">{q.queueName || "default"} • ID: {q.placeId?.slice(0, 8)}</p>
                      </div>

                      <div className="bg-gray-50 px-4 py-3 rounded-2xl text-center min-w-[80px]">
                        <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Position</div>
                        <div className="text-3xl font-mono font-bold leading-none text-black">
                          {q.status === "completed" ? "-" : `#${q.position}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-8 py-4 sm:py-6 border-t border-dashed border-gray-200">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Check In</span>
                        <span className="font-mono font-bold">{formatTime(q.start)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Est. Wait</span>
                        <span className={`font-mono font-bold ${q.status === "completed" ? "text-gray-400" : "text-orange-500"}`}>
                          {q.status === "completed" ? "Completed" : `~${q.estWait || (q.position * 5)} min`}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Code</span>
                        <span className="font-mono font-bold bg-black text-white px-2 rounded text-sm">{q.verifyCode || "---"}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Link to={`/place/${q.placeId}`} className="flex-1 bg-black text-white hover:bg-gray-800 font-bold py-4 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">
                        View Ticket <ChevronRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => removeQueue(q.placeId, q.ticketId)}
                        className="px-5 border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-colors"
                        title="Remove from History"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="mt-8 p-6 bg-white/50 border border-black/5 rounded-2xl flex items-start gap-4 backdrop-blur-sm">
              <Activity className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-500 leading-relaxed max-w-md">
                <strong className="text-black block mb-1 uppercase tracking-wider">Live Status Updates</strong>
                Queue positions update automatically every 30 seconds. Active queues show your real-time position.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyQueues;
