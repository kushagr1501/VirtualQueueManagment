import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { MapPin, Scissors, QrCode, User, AlertCircle, CheckCircle, PartyPopper, Home, RotateCcw, AlertTriangle, LogOut } from "lucide-react";
import { useSocket } from "../utils/socket";
import gsap from "gsap";
import { QueuePageSkeleton } from "./Skeleton";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function QueuePage() {
  const { id } = useParams();
  const { joinPlace, leavePlace, onQueueUpdate } = useSocket();

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

  const ticketContainerRef = useRef(null);
  const leftPartRef = useRef(null);
  const rightStubRef = useRef(null);
  const codeContentRef = useRef(null);
  const buttonContentRef = useRef(null);
  const leaderboardRef = useRef(null);
  const isLeaving = useRef(false);

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

  useEffect(() => {
    if (!selectedQueue) return;

    const fetchQueue = async () => {
      // If we are voluntarily leaving, do not process updates that might mark us as removed
      if (isLeaving.current) return;

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

              if (isLeaving.current) return; // Re-check after async call

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

    // fetchQueue(); // Initial fetch is done by verifyAndLoad or loadData usually?
    // actually fetchQueue calls axios.get which is fine.

    // Handle real-time updates
    const handleQueueUpdate = (payload) => {
      if (payload && payload.queueName === selectedQueue) {
        fetchQueue();
      } else if (Array.isArray(payload)) {
        fetchQueue();
      }
    };

    fetchQueue(); // Do initial fetch
    const unsubscribe = onQueueUpdate(handleQueueUpdate);

    return () => unsubscribe();
  }, [id, selectedQueue, onQueueUpdate, myTicket, hasAcknowledged, isServed, isRemoved]);

  // GSAP entrance animation for ticket
  useEffect(() => {
    if (ticketContainerRef.current && !loading && !alreadyJoined) {
      gsap.fromTo(ticketContainerRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, [loading, alreadyJoined]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!userName.trim()) return;

    if (alreadyJoined) {
      setError("You have already joined this queue!");
      return;
    }

    try {
      isLeaving.current = false; // Reset leaving state
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
      // Ticket tear animation
      const tl = gsap.timeline();
      const isMobile = window.innerWidth < 768; // md breakpoint

      // Ensure start state overrides class change (opacity-0 on button)
      tl.set(buttonContentRef.current, { opacity: 1 });
      tl.set(codeContentRef.current, { opacity: 0 });

      if (isMobile) {
        tl.to(rightStubRef.current, { rotate: 1, duration: 0.1, repeat: 5, yoyo: true })
          .to(rightStubRef.current, { y: 20, rotation: 0, duration: 0.3, ease: "power2.in" })
          .to(rightStubRef.current, { y: 30, rotation: 0, scale: 1.02, duration: 0.5, ease: "back.out(1.2)" });
      } else {
        tl.to(rightStubRef.current, { rotate: 2, duration: 0.1, repeat: 5, yoyo: true })
          .to(rightStubRef.current, { x: 40, rotation: 5, duration: 0.3, ease: "power2.in" })
          .to(rightStubRef.current, { x: 60, rotation: 0, scale: 1.05, duration: 0.5, ease: "back.out(1.2)" });
      }

      tl.to(buttonContentRef.current, { opacity: 0, duration: 0.1 }, "-=0.4")
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

  const getMyPosition = () => {
    if (!myTicket) return "?";
    const idx = queueData.findIndex(u => u._id === myTicket._id);
    return idx !== -1 ? idx + 1 : "...";
  };

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

  const [permission, setPermission] = useState(Notification.permission);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm === 'granted') {
      new Notification("Notifications Enabled", {
        body: "We will notify you when it's almost your turn!",
        icon: "/vite.svg"
      });
    }
  };

  const sendNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/vite.svg" });
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
  };

  useEffect(() => {
    if (joined && myTicket && queueData.length > 0) {
      const pos = getMyPosition();
      if (typeof pos === 'number') {
        const keyPrefix = `notified-${myTicket._id}`;

        // Heads Up (Position 5 or less)
        if (pos <= 5 && pos > 3 && !localStorage.getItem(`${keyPrefix}-5`)) {
          sendNotification("Head's Up!", `You are #${pos} in line. Please get ready.`);
          localStorage.setItem(`${keyPrefix}-5`, "true");
        }
        // Get Ready (Position 3 or less)
        else if (pos <= 3 && pos > 1 && !localStorage.getItem(`${keyPrefix}-3`)) {
          sendNotification("Get Ready!", `You are #${pos} in line. Please move towards the counter.`);
          localStorage.setItem(`${keyPrefix}-3`, "true");
        }
        // You're Next (Position 1)
        else if (pos === 1 && !localStorage.getItem(`${keyPrefix}-1`)) {
          sendNotification("You're Next!", "It's your turn! Please be ready at the counter.");
          localStorage.setItem(`${keyPrefix}-1`, "true");
        }
      }
    }
  }, [queueData, joined, myTicket]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("queueName");
    if (qParam && !selectedQueue && queues.includes(qParam)) {
      setSelectedQueue(qParam);
    }
  }, [queues, selectedQueue]);

  if (!place) return <QueuePageSkeleton />;

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-black font-sans flex flex-col items-center py-6 sm:py-12 px-3 sm:px-4 overflow-x-hidden relative">

      <div className="absolute inset-0 bg-[#F2F2F2] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(90deg,#000_1px,transparent_1px),linear-gradient(0deg,#000_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">

        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter mb-2 uppercase">{place.name}</h1>
          <div className="flex justify-center items-center flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-gray-500 shadow-sm">
              <MapPin className="w-3 h-3" /> {place.location}
            </div>
            <button
              onClick={requestNotificationPermission}
              disabled={permission === 'granted'}
              className={`inline-flex items-center gap-2 border px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm transition-colors ${permission === 'granted'
                ? 'bg-emerald-100 border-emerald-200 text-emerald-600'
                : 'bg-orange-100 border-orange-200 text-orange-600 hover:bg-orange-200'
                }`}
            >
              {permission === 'granted' ? (
                <><CheckCircle className="w-3 h-3" /> Buzz On</>
              ) : (
                <><AlertCircle className="w-3 h-3" /> Buzz Me</>
              )}
            </button>
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

        {isRemoved && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 mb-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl sm:text-3xl font-black mb-2 text-red-600">REMOVED FROM QUEUE</h2>
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

        {(isServed || hasAcknowledged) && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 mb-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl sm:text-3xl font-black mb-2 text-emerald-600">YOU HAVE BEEN SERVED!</h2>
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

        {!hasAcknowledged && !isServed && !isRemoved && (
          <div ref={ticketContainerRef} className="flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl relative mb-12">

            <div ref={leftPartRef} className="bg-white flex-1 p-6 sm:p-8 md:p-12 relative z-10 flex flex-col justify-between min-h-[280px] sm:min-h-[340px] rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F2F2F2] rounded-full hidden md:block"></div>

              <div>
                <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Queue Ticket</div>
                    <div className="text-xl sm:text-2xl font-black uppercase tracking-tight">{place.name}</div>
                  </div>
                  {joined && (
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Position</div>
                      <div className="text-3xl sm:text-5xl font-mono font-bold text-black leading-none mt-1">#{getMyPosition()}</div>
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
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{joined ? "Your Name" : "Enter Name"}</label>
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
            </div>

            <div className="relative w-0 z-20 hidden md:block">
              <div className="absolute inset-y-4 left-0 w-[2px] border-l-2 border-dashed border-gray-300"></div>
              <div className="absolute -top-3 left-0 -translate-x-1/2 w-6 h-6 bg-[#F2F2F2] rounded-full shadow-inner"></div>
              <div className="absolute -bottom-3 left-0 -translate-x-1-1/2 w-6 h-6 bg-[#F2F2F2] rounded-full shadow-inner"></div>
            </div>

            <div ref={rightStubRef} className="w-full md:w-96 bg-black text-white p-6 sm:p-8 md:p-10 relative flex flex-col justify-center items-center z-10 origin-left border-t md:border-t-0 md:border-l border-white/10 rounded-b-3xl md:rounded-l-none md:rounded-r-3xl min-h-[220px] sm:min-h-[280px]">

              <div ref={buttonContentRef} className={`absolute inset-0 flex flex-col items-center justify-center p-8 z-20 ${joined ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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

              <div ref={codeContentRef} className={`absolute inset-0 flex flex-col items-center justify-center p-8 z-10 ${joined ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                  {isServed ? (
                    <>
                      <div className="w-12 h-1 bg-emerald-500 rounded-full mb-6 animate-pulse"></div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2 animate-pulse">NOW SERVING</div>
                      <div className="text-4xl sm:text-7xl font-mono font-bold tracking-wider sm:tracking-widest text-white mb-4 drop-shadow-2xl animate-pulse">
                        {myTicket ? myTicket.verificationCode : "---"}
                      </div>
                      <div className="text-sm text-emerald-300 font-medium">Proceed to counter!</div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-1 bg-gray-800 rounded-full mb-8"></div>
                      <div className="text-4xl sm:text-7xl font-mono font-bold tracking-wider sm:tracking-widest text-white mb-2 drop-shadow-2xl">
                        {myTicket ? myTicket.verificationCode : "---"}
                      </div>
                    </>
                  )}
                </div>

                <div className="w-full mt-auto pt-6 border-t border-white/10">
                  <button
                    onClick={async () => {
                      if (!myTicket || !window.confirm("Are you sure you want to leave the queue? You will lose your spot.")) return;

                      isLeaving.current = true; // Prevent "Removed from queue" flash

                      try {
                        await axios.post(`${API}/api/queue/${myTicket._id}/leave`, {
                          verificationCode: myTicket.verificationCode
                        });
                        // Reset ticket state logic inline to ensure update
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

                        // Reset GSAP animations to initial state
                        if (rightStubRef.current) {
                          gsap.to(rightStubRef.current, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.5, ease: "power2.out" });
                        }
                        if (buttonContentRef.current) {
                          gsap.set(buttonContentRef.current, { opacity: 0 }); // Start hidden (overriding class)
                          gsap.to(buttonContentRef.current, { opacity: 1, duration: 0.3, delay: 0.2 });
                        }
                        if (codeContentRef.current) {
                          gsap.set(codeContentRef.current, { opacity: 1 }); // Start visible (overriding class)
                          gsap.to(codeContentRef.current, { opacity: 0, scale: 0.9, duration: 0.3 });
                        }
                        if (leaderboardRef.current) {
                          gsap.to(leaderboardRef.current, { opacity: 1, y: 0, duration: 0.3 });
                        }
                      } catch (err) {
                        isLeaving.current = false; // Revert if failed
                        alert("Failed to leave queue.");
                      }
                    }}
                    className="w-full py-3 rounded-xl border-2 border-red-500/20 text-red-500 font-bold text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-red-500/20"
                  >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Leave Queue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {
          !hasAcknowledged && !isServed && !isRemoved && (
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

              <div className="grid grid-cols-12 px-4 sm:px-6 py-3 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <div className="col-span-2">Pos</div>
                <div className="col-span-6 sm:col-span-6">Customer</div>
                <div className="col-span-4 sm:col-span-4 text-right">Est. Wait</div>
              </div>

              {queueData.length === 0 ? (
                <div className="p-10 text-center text-gray-400 flex flex-col items-center">
                  <User className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">No one in line yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {queueData.map((u, i) => (
                    <div key={u._id} className={`grid grid-cols-12 px-4 sm:px-6 py-3 sm:py-4 items-center transition-colors ${u._id === myTicket?._id ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}`}>
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
          )
        }

      </div >
    </div >
  );
}

export default QueuePage;
