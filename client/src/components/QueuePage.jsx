import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { MapPin, Scissors, QrCode, User, AlertCircle, CheckCircle, PartyPopper, Home, RotateCcw, AlertTriangle } from "lucide-react";
import { useSocket } from "../utils/socket";
import gsap from "gsap";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * QueuePage Component
 * 
 * Handles user queue joining, position tracking, and notifications
 * when served or removed by business admin.
 */
function QueuePage() {
  const { id } = useParams();
  const { joinPlace, leavePlace, onQueueUpdate } = useSocket();
  
  // State management
  const [place, setPlace] = useState(null);
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [queueData, setQueueData] = useState([]);
  const [userName, setUserName] = useState("");
  const [joined, setJoined] = useState(false);
  const [myTicket, setMyTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [error, setError] = useState(null);
  const [isServed, setIsServed] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  // Refs for GSAP animations
  const ticketContainerRef = useRef(null);
  const leftPartRef = useRef(null);
  const rightStubRef = useRef(null);
  const codeContentRef = useRef(null);
  const buttonContentRef = useRef(null);
  const leaderboardRef = useRef(null);

  /**
   * Verify existing ticket on page load
   * Checks if user already has a ticket and if they're still in the queue
   */
  useEffect(() => {
    const verifyAndLoad = async () => {
      const storedQueues = JSON.parse(localStorage.getItem("myQueues") || "[]");
      const existingEntry = storedQueues.find(q => 
        q.placeId === id && q.queueName === (selectedQueue || "default")
      );
      
      if (existingEntry) {
        try {
          const res = await axios.get(`${API}/api/place/${id}`, { params: { queueName: selectedQueue } });
          const queueData = res.data;
          const userStillInQueue = queueData.find(u => u._id === existingEntry.ticketId);
          
          if (userStillInQueue) {
            setAlreadyJoined(true);
            setMyTicket({ _id: existingEntry.ticketId, verificationCode: existingEntry.verifyCode });
            setUserName(existingEntry.userName || "");
            setJoined(true);
          } else {
            // User was served/removed - clear from localStorage
            const updatedQueues = storedQueues.filter(q => q.ticketId !== existingEntry.ticketId);
            localStorage.setItem("myQueues", JSON.stringify(updatedQueues));
            resetTicketState();
          }
        } catch (err) {
          const updatedQueues = storedQueues.filter(q => q.ticketId !== existingEntry.ticketId);
          localStorage.setItem("myQueues", JSON.stringify(updatedQueues));
          resetTicketState();
        }
      } else {
        resetTicketState();
      }
    };
    
    const resetTicketState = () => {
      setAlreadyJoined(false);
      setMyTicket(null);
      setUserName("");
      setJoined(false);
      setIsServed(false);
      setIsRemoved(false);
      setHasAcknowledged(false);
    };
    
    if (id && selectedQueue) {
      verifyAndLoad();
    }
  }, [id, selectedQueue]);

  /**
   * Load place data and available queues
   */
  useEffect(() => {
    joinPlace(id);

    const loadData = async () => {
      try {
        setLoading(true);
        const [pRes, qNamesRes] = await Promise.all([
          axios.get(`${API}/api/places/${id}`),
          axios.get(`${API}/api/places/${id}/queues`),
        ]);
        setPlace(pRes.data);
        setQueues(qNamesRes.data || []);
        if (qNamesRes.data?.length > 0 && !selectedQueue) {
          setSelectedQueue(qNamesRes.data[0]);
        }
      } catch (err) {
        setError("Failed to load queue data");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      leavePlace(id);
    };
  }, [id, joinPlace, leavePlace, selectedQueue]);

  /**
   * Monitor queue updates via Socket.IO
   * Detects when user is served or removed from queue
   */
  useEffect(() => {
    if (!selectedQueue) return;
    
    const fetchQueue = async () => {
      try {
        const res = await axios.get(`${API}/api/place/${id}`, { params: { queueName: selectedQueue } });
        setQueueData(res.data);
        
        // Check if current user is no longer in queue
        if (myTicket && myTicket._id && !hasAcknowledged && !isServed && !isRemoved) {
          const userEntry = res.data.find(u => u._id === myTicket._id);
          if (!userEntry) {
            // User removed from queue - check status to determine if served or cancelled
            try {
              const statusRes = await axios.get(`${API}/api/queue/status/${myTicket._id}`);
              if (statusRes.data.status === "served") {
                setIsServed(true);
              } else if (statusRes.data.status === "cancelled") {
                setIsRemoved(true);
              }
            } catch (err) {
              setIsServed(true);
            }
          }
        }
      } catch (err) {
        // Silent fail on fetch error
      }
    };
    
    fetchQueue();
    const unsubscribe = onQueueUpdate(fetchQueue);
    
    return () => unsubscribe();
  }, [id, selectedQueue, onQueueUpdate, myTicket, hasAcknowledged]);

  // GSAP entrance animation for ticket
  useEffect(() => {
    if (ticketContainerRef.current && !loading && !alreadyJoined) {
      gsap.fromTo(ticketContainerRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, [loading, alreadyJoined]);

  /**
   * Handle user joining the queue
   */
  const handleJoin = async (e) => {
    e.preventDefault();
    if (!userName.trim()) return;
    
    if (alreadyJoined) {
      setError("You have already joined this queue!");
      return;
    }

    try {
      const res = await axios.post(`${API}/api/place/${id}/join`, {
        userName,
        queueName: selectedQueue,
      });

      const ticketData = res.data;
      setMyTicket(ticketData);

      const history = JSON.parse(localStorage.getItem("myQueues") || "[]");
      history.push({
        placeId: id,
        placeName: place.name,
        ticketId: ticketData._id,
        queueName: selectedQueue,
        userName,
        verifyCode: ticketData.verificationCode,
        start: new Date()
      });
      localStorage.setItem("myQueues", JSON.stringify(history));

      setJoined(true);
      setAlreadyJoined(true);

      // Ticket tear animation
      const tl = gsap.timeline();
      tl.to(rightStubRef.current, { rotate: 2, duration: 0.1, repeat: 5, yoyo: true })
        .to(rightStubRef.current, { x: 40, rotation: 5, duration: 0.3, ease: "power2.in" })
        .to(rightStubRef.current, { x: 60, rotation: 0, scale: 1.05, duration: 0.5, ease: "back.out(1.2)" })
        .to(buttonContentRef.current, { opacity: 0, duration: 0.1 }, "-=0.4")
        .to(codeContentRef.current, { opacity: 1, scale: 1, duration: 0.4 }, "-=0.2")
        .fromTo(leaderboardRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");

    } catch (err) {
      if (err.response?.status === 409) {
        setError("You have already joined this queue!");
        setAlreadyJoined(true);
      } else {
        setError(err.response?.data?.message || "Failed to join queue");
      }
    }
  };

  /**
   * Get current position in queue
   */
  const getMyPosition = () => {
    if (!myTicket) return "?";
    const idx = queueData.findIndex(u => u._id === myTicket._id);
    return idx !== -1 ? idx + 1 : "...";
  };

  /**
   * Handle acknowledgment when served or removed
   * Clears ticket from localStorage and resets state
   */
  const handleAcknowledgeServed = async () => {
    try {
      if (myTicket && myTicket._id) {
        await axios.post(`${API}/api/queue/${myTicket._id}/acknowledge`);
      }
    } catch (err) {
      // Silent fail - still reset state
    } finally {
      setHasAcknowledged(true);
      setIsServed(false);
      setIsRemoved(false);
      
      const storedQueues = JSON.parse(localStorage.getItem("myQueues") || "[]");
      const updatedQueues = storedQueues.filter(q => q.ticketId !== myTicket?._id);
      localStorage.setItem("myQueues", JSON.stringify(updatedQueues));
      
      setJoined(false);
      setAlreadyJoined(false);
      setMyTicket(null);
      setUserName("");
    }
  };

  /**
   * Reset ticket state manually (for rejoining)
   */
  const resetTicket = () => {
    if (myTicket && myTicket._id) {
      const storedQueues = JSON.parse(localStorage.getItem("myQueues") || "[]");
      const updatedQueues = storedQueues.filter(q => q.ticketId !== myTicket._id);
      localStorage.setItem("myQueues", JSON.stringify(updatedQueues));
    }
    
    setJoined(false);
    setAlreadyJoined(false);
    setMyTicket(null);
    setUserName("");
    setIsServed(false);
    setIsRemoved(false);
    setHasAcknowledged(false);
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex flex-col items-center justify-center font-sans px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!place) return <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center font-mono text-xs">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-black font-sans flex flex-col items-center py-12 px-4 overflow-x-hidden relative">

      <div className="absolute inset-0 bg-[#F2F2F2] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(90deg,#000_1px,transparent_1px),linear-gradient(0deg,#000_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase">{place.name}</h1>
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-gray-500 shadow-sm">
            <MapPin className="w-3 h-3" /> {place.location}
          </div>
        </div>

        {alreadyJoined && !joined && !isServed && !isRemoved && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 text-center">
            <p className="text-orange-700 font-medium">You have already joined this queue!</p>
            <button 
              onClick={() => setJoined(true)} 
              className="mt-2 text-orange-600 font-bold underline"
            >
              View Your Ticket
            </button>
          </div>
        )}

        {/* Removed by admin notification */}
        {isRemoved && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 mb-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-black mb-2 text-red-600">REMOVED FROM QUEUE</h2>
            <p className="text-gray-600 mb-6">You have been removed from the queue by the business. Please contact them for assistance.</p>
            
            <div className="bg-white rounded-2xl p-6 mb-6 inline-block">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Verification Code</div>
              <div className="text-4xl font-mono font-bold text-black tracking-widest">
                {myTicket?.verificationCode || "---"}
              </div>
            </div>

            <Link 
              to="/home"
              onClick={handleAcknowledgeServed}
              className="bg-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-colors inline-flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </div>
        )}

        {/* Served notification */}
        {(isServed || hasAcknowledged) && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 mb-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black mb-2 text-emerald-600">YOU HAVE BEEN SERVED!</h2>
            <p className="text-gray-600 mb-6">Thank you for waiting. Please proceed to the counter.</p>
            
            <div className="bg-white rounded-2xl p-6 mb-6 inline-block">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Verification Code</div>
              <div className="text-4xl font-mono font-bold text-black tracking-widest">
                {myTicket?.verificationCode || "---"}
              </div>
            </div>

            <Link 
              to="/home"
              onClick={handleAcknowledgeServed}
              className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-colors inline-flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </div>
        )}

        {/* Completed state */}
        {hasAcknowledged && (
          <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-gray-800">COMPLETED</h2>
            <p className="text-gray-500 mb-6">Your queue session has been completed successfully.</p>
            
            <Link 
              to="/home"
              className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Browse Queues
            </Link>
          </div>
        )}

        {/* Ticket card - only shown when not served/removed/acknowledged */}
        {!hasAcknowledged && !isServed && !isRemoved && (
        <div ref={ticketContainerRef} className="flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl relative mb-12">

          <div ref={leftPartRef} className="bg-white flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-between min-h-[340px] rounded-l-3xl rounded-r-3xl md:rounded-r-none">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F2F2F2] rounded-full"></div>

            <div>
              <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Queue Ticket</div>
                  <div className="text-2xl font-black uppercase tracking-tight">Standard Admission</div>
                </div>
                {joined && (
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Position</div>
                    <div className="text-5xl font-mono font-bold text-black leading-none mt-1">#{getMyPosition()}</div>
                  </div>
                )}
              </div>

              <div className="space-y-8 max-w-md">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{joined ? "Service Selected" : "Select Service"}</label>
                  {joined ? (
                    <div className="text-2xl font-bold">{selectedQueue}</div>
                  ) : (
                    <select
                      className="w-full bg-gray-50 border-b-2 border-gray-200 hover:border-black p-4 text-lg rounded-t-lg outline-none font-bold appearance-none cursor-pointer transition-colors"
                      value={selectedQueue}
                      onChange={(e) => setSelectedQueue(e.target.value)}
                    >
                      {queues.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{joined ? "Passenger Name" : "Enter Name"}</label>
                  {joined ? (
                    <div className="text-2xl font-bold truncate">{userName}</div>
                  ) : (
                    <input
                      type="text"
                      className="w-full bg-transparent border-b-2 border-gray-200 hover:border-black p-4 text-lg rounded-none outline-none font-bold placeholder:text-gray-300 transition-colors"
                      placeholder="e.g. John Doe"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 flex justify-between items-end opacity-50">
              <div className="font-mono text-[10px] uppercase tracking-widest">ID: {id.slice(0, 8)}</div>
              <div className="w-8 h-8 opacity-20"><QrCode /></div>
            </div>
          </div>

          <div className="relative w-0 z-20 hidden md:block">
            <div className="absolute inset-y-4 left-0 w-[2px] border-l-2 border-dashed border-gray-300"></div>
            <div className="absolute -top-3 left-0 -translate-x-1/2 w-6 h-6 bg-[#F2F2F2] rounded-full shadow-inner"></div>
            <div className="absolute -bottom-3 left-0 -translate-x-1-1/2 w-6 h-6 bg-[#F2F2F2] rounded-full shadow-inner"></div>
          </div>

          <div ref={rightStubRef} className="w-full md:w-96 bg-black text-white p-8 md:p-10 relative flex flex-col justify-center items-center z-10 origin-left border-t md:border-t-0 md:border-l border-white/10 rounded-b-3xl md:rounded-l-none md:rounded-r-3xl">

            <div ref={buttonContentRef} className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-opacity z-20 ${joined ? 'pointer-events-none' : ''}`}>
              <div className="text-center mb-10">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Step 2 of 2</span>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  Ready to join? Click below to tear your ticket stub.
                </p>
              </div>
              <button
                onClick={handleJoin}
                disabled={alreadyJoined}
                className={`w-full bg-white text-black py-5 rounded-xl font-black uppercase tracking-wider hover:bg-gray-100 transform active:scale-95 transition-all flex items-center justify-center gap-3 group cursor-pointer shadow-[0_10px_20px_rgba(255,255,255,0.1)] relative z-30 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Scissors className="w-5 h-5 transform -rotate-90 group-hover:-translate-x-1 transition-transform" />
                {alreadyJoined ? "Already Joined" : "Get Ticket"}
              </button>
            </div>

            <div ref={codeContentRef} className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-opacity z-10 ${joined ? 'opacity-100' : 'opacity-0'} ${joined ? '' : 'pointer-events-none'}`}>
              {isServed ? (
                <>
                  <div className="w-12 h-1 bg-emerald-500 rounded-full mb-6 animate-pulse"></div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2 animate-pulse">NOW SERVING</div>
                  <div className="text-5xl font-mono font-bold tracking-widest text-emerald-400 mb-4 drop-shadow-2xl animate-pulse">
                    {myTicket ? myTicket.verificationCode : "---"}
                  </div>
                  <div className="text-sm text-emerald-300 font-medium mb-4">Proceed to counter!</div>
                </>
              ) : (
                <>
                  <div className="w-12 h-1 bg-gray-800 rounded-full mb-8"></div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Verification Code</div>

                  <div className="text-6xl font-mono font-bold tracking-widest text-white mb-2 drop-shadow-2xl">
                    {myTicket ? myTicket.verificationCode : "---"}
                  </div>
                </>
              )}

              <div className="h-px w-full bg-gray-800 my-8"></div>

              <div className="w-full flex justify-between items-center text-sm">
                <div className="text-left">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Queue Size</div>
                  <div className="font-bold text-white">{queueData.length} People</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Est. Wait</div>
                  <div className="font-bold text-orange-400">~{queueData.length * 5} Min</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Live Queue Board - only shown when user is in queue */}
        {!hasAcknowledged && !isServed && !isRemoved && (
        <div ref={leaderboardRef} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto transition-opacity ${joined ? 'opacity-100' : 'opacity-90 hover:opacity-100'}`}>
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="font-bold text-lg text-black">Live Queue Board</h3>
              <p className="text-xs text-gray-500 font-medium">Real-time waiting list for {selectedQueue}</p>
            </div>
            <div className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
              {queueData.length} Waiting
            </div>
          </div>

          <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
            <div className="col-span-2">Pos</div>
            <div className="col-span-6">Customer</div>
            <div className="col-span-4 text-right">Estimated Wait</div>
          </div>

          {queueData.length === 0 ? (
            <div className="p-10 text-center text-gray-400 flex flex-col items-center">
              <User className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">LIST IS EMPTY</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {queueData.map((u, i) => (
                <div key={u._id} className={`grid grid-cols-12 px-6 py-4 items-center transition-colors ${u._id === myTicket?._id ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}`}>
                  <div className={`col-span-2 font-mono font-bold text-sm ${u._id === myTicket?._id ? 'text-gray-400' : 'text-gray-300'}`}>
                    {(i + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="col-span-6 font-bold text-sm flex items-center gap-2">
                    {u.userName}
                    {u._id === myTicket?._id && <span className="text-[9px] bg-white text-black px-2 py-0.5 rounded font-bold uppercase">You</span>}
                  </div>
                  <div className={`col-span-4 text-right font-mono text-xs font-medium ${u._id === myTicket?._id ? 'text-orange-400' : 'text-gray-400'}`}>
                    ~{i * 5} min
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

      </div>
    </div>
  );
}

export default QueuePage;
