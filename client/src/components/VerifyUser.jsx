// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { Search, User, CheckCircle, XCircle, Clock, Award, AlertCircle, Check, Loader } from "lucide-react";

// const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// function VerifyUser() {
//   const [code, setCode] = useState("");
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [history, setHistory] = useState([]);
//   const inputRef = useRef(null);

//   useEffect(() => {
//     // Focus input on mount
//     if (inputRef.current) inputRef.current.focus();

//     // Load verification history from localStorage
//     const savedHistory = localStorage.getItem("verificationHistory");
//     if (savedHistory) {
//       try {
//         setHistory(JSON.parse(savedHistory));
//       } catch (e) {
//         localStorage.removeItem("verificationHistory");
//       }
//     }
//   }, []);

//   const handleSearch = async () => {
//     const trimmed = code.trim();
//     if (!trimmed) return;

//     setError("");
//     setLoading(true);
//     setSuccess(false);

//     try {
//       const res = await axios.get(`${API}/api/queue/find-by-code/${trimmed}`);
//       setResult(res.data);

//       // Add to recent searches if not already present
//       if (!history.some((item) => item.code === trimmed)) {
//         const newHistory = [
//           { code: trimmed, userName: res.data.userName || "Unknown", timestamp: new Date().toISOString(), verified: !!res.data.isVerified },
//           ...history,
//         ].slice(0, 5);
//         setHistory(newHistory);
//         localStorage.setItem("verificationHistory", JSON.stringify(newHistory));
//       }
//     } catch (err) {
//       setResult(null);
//       setError("Code not found or invalid.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const markVerified = async () => {
//     if (!result) return;

//     setVerifying(true);
//     setError("");

//     try {
//       const res = await axios.patch(`${API}/api/queue/${result._id}/verify`);
//       setResult(res.data);
//       setSuccess(true);

//       // Update history to mark verified
//       const updatedHistory = history.map((item) =>
//         item.code === code ? { ...item, verified: true } : item
//       );
//       setHistory(updatedHistory);
//       localStorage.setItem("verificationHistory", JSON.stringify(updatedHistory));

//       setTimeout(() => setSuccess(false), 3000);
//     } catch (err) {
//       console.error("Verification error:", err);
//       setError("Verification failed. Please try again.");
//     } finally {
//       setVerifying(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && code.trim()) handleSearch();
//   };

//   const clearHistory = () => {
//     setHistory([]);
//     localStorage.removeItem("verificationHistory");
//   };

//   const loadFromHistory = (historyCode) => {
//     setCode(historyCode);
//     setTimeout(() => handleSearch(), 100);
//   };

//   const formatTime = (timestamp) => {
//     try {
//       const date = new Date(timestamp);
//       return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//     } catch {
//       return "";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center px-4 py-12">
//       <div className="w-full max-w-md">
//         {/* Success notification */}
//         {success && (
//           <div className="mb-4 transform transition-all animate-bounce">
//             <div className="bg-green-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
//               <CheckCircle size={24} />
//               <span className="font-medium">Successfully verified!</span>
//             </div>
//           </div>
//         )}

//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           {/* Header */}
//           <div className="bg-indigo-600 text-white p-6">
//             <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
//               <CheckCircle size={24} />
//               Verify Customer
//             </h2>
//             <p className="text-indigo-200 text-center mt-1">Check verification codes and process customers</p>
//           </div>

//           {/* Main content */}
//           <div className="p-6">
//             {/* Search input */}
//             <div className="relative mb-6">
//               <div className="flex shadow-md rounded-lg overflow-hidden">
//                 <div className="bg-gray-100 flex items-center justify-center px-4">
//                   <Search size={20} className="text-gray-500" />
//                 </div>
//                 <input
//                   ref={inputRef}
//                   value={code}
//                   onChange={(e) => setCode(e.target.value.toUpperCase())}
//                   onKeyPress={handleKeyPress}
//                   placeholder="Enter 6-digit verification code"
//                   className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-0 font-mono text-lg"
//                   maxLength={6}
//                 />
//                 <button
//                   onClick={handleSearch}
//                   disabled={!code.trim() || loading}
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-medium transition disabled:opacity-50 flex items-center gap-1"
//                 >
//                   {loading ? <Loader size={16} className="animate-spin" /> : "Search"}
//                 </button>
//               </div>

//               {error && (
//                 <div className="mt-2 text-red-500 flex items-center gap-1">
//                   <AlertCircle size={16} />
//                   <span className="text-sm">{error}</span>
//                 </div>
//               )}
//             </div>

//             {/* Result Card */}
//             {result && (
//               <div className={`bg-white border rounded-xl p-5 shadow-md transition-all ${success ? "bg-green-50 border-green-200" : ""}`}>
//                 <div className="flex justify-between items-start mb-4">
//                   <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//                     <User size={18} />
//                     Customer Details
//                   </h3>
//                   <div
//                     className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       result.status === "waiting"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : result.status === "active"
//                         ? "bg-green-100 text-green-800"
//                         : "bg-gray-100 text-gray-800"
//                     }`}
//                   >
//                     {String(result.status || "Unknown").charAt(0).toUpperCase() +
//                       String(result.status || "Unknown").slice(1)}
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <div className="flex items-start gap-2">
//                     <div className="bg-indigo-100 p-2 rounded-lg">
//                       <User size={18} className="text-indigo-600" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Name</p>
//                       <p className="font-medium">{result.userName || "—"}</p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-2">
//                     <div className="bg-indigo-100 p-2 rounded-lg">
//                       <Award size={18} className="text-indigo-600" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Verification Code</p>
//                       <p className="font-mono font-medium">{result.verificationCode || "—"}</p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-2">
//                     <div className="bg-indigo-100 p-2 rounded-lg">
//                       <Clock size={18} className="text-indigo-600" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Joined Queue</p>
//                       <p className="font-medium">
//                         {result.joinedAt ? new Date(result.joinedAt).toLocaleString() : "N/A"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-2">
//                     <div className={`p-2 rounded-lg ${result.isVerified ? "bg-green-100" : "bg-yellow-100"}`}>
//                       {result.isVerified ? <CheckCircle size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-yellow-600" />}
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Verification Status</p>
//                       <p className={`font-medium ${result.isVerified ? "text-green-600" : "text-yellow-600"}`}>
//                         {result.isVerified ? "Verified ✓" : "Not Verified"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {!result.isVerified ? (
//                   <button
//                     onClick={markVerified}
//                     disabled={verifying}
//                     className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition flex items-center justify-center gap-2 font-medium disabled:opacity-50"
//                   >
//                     {verifying ? (
//                       <>
//                         <Loader size={18} className="animate-spin" />
//                         Processing...
//                       </>
//                     ) : (
//                       <>
//                         <CheckCircle size={18} />
//                         Mark as Verified
//                       </>
//                     )}
//                   </button>
//                 ) : (
//                   <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-center gap-2 text-green-800">
//                     <CheckCircle size={18} />
//                     <span className="font-medium">Customer already verified</span>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* History Section */}
//             {history.length > 0 && (
//               <div className="mt-6">
//                 <div className="flex justify-between items-center mb-2">
//                   <h3 className="text-sm font-medium text-gray-500">Recent verifications</h3>
//                   <button onClick={clearHistory} className="text-xs text-indigo-600 hover:text-indigo-800">
//                     Clear history
//                   </button>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
//                   {history.map((item, index) => (
//                     <div
//                       key={index}
//                       className="p-3 flex justify-between items-center hover:bg-gray-100 cursor-pointer"
//                       onClick={() => loadFromHistory(item.code)}
//                     >
//                       <div className="flex items-center gap-2">
//                         <div
//                           className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                             item.verified ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
//                           }`}
//                         >
//                           {item.verified ? <Check size={14} /> : item.code?.[0] || "?"}
//                         </div>
//                         <div>
//                           <p className="font-medium truncate">{item.userName}</p>
//                           <p className="text-xs text-gray-500 font-mono">{item.code}</p>
//                         </div>
//                       </div>
//                       <span className="text-xs text-gray-500">{formatTime(item.timestamp)}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer Info */}
//         <div className="mt-4 text-center text-gray-500 text-xs">
//           <p>Staff verification system • Enter the 6-digit code to verify customers</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default VerifyUser;

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Search,
  User,
  CheckCircle,
  Clock,
  Award,
  AlertCircle,
  Check,
  Loader,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function VerifyUser() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();

    const savedHistory = localStorage.getItem("verificationHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        localStorage.removeItem("verificationHistory");
      }
    }
  }, []);

  const handleSearch = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setError("");
    setLoading(true);
    setSuccess(false);

    try {
      const res = await axios.get(`${API}/api/queue/find-by-code/${trimmed}`);
      setResult(res.data);

      if (!history.some((item) => item.code === trimmed)) {
        const newHistory = [
          {
            code: trimmed,
            userName: res.data.userName || "Unknown",
            timestamp: new Date().toISOString(),
            verified: !!res.data.isVerified,
          },
          ...history,
        ].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem("verificationHistory", JSON.stringify(newHistory));
      }
    } catch {
      setResult(null);
      setError("Code not found or invalid.");
    } finally {
      setLoading(false);
    }
  };

  const markVerified = async () => {
    if (!result) return;

    setVerifying(true);
    setError("");

    try {
      const res = await axios.patch(`${API}/api/queue/${result._id}/verify`);
      setResult(res.data);
      setSuccess(true);

      const updatedHistory = history.map((item) =>
        item.code === code ? { ...item, verified: true } : item
      );
      setHistory(updatedHistory);
      localStorage.setItem("verificationHistory", JSON.stringify(updatedHistory));

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Verification error:", err);
      setError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && code.trim()) handleSearch();
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("verificationHistory");
  };

  const loadFromHistory = (historyCode) => {
    setCode(historyCode);
    setTimeout(() => handleSearch(), 100);
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-100 to-emerald-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        {/* little brand strip */}
        <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-800">
          <div className="h-7 w-7 bg-black text-[#FFF5D9] flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.12em]">
            Q
          </div>
          <div className="leading-tight">
            <div className="font-semibold">QueueBoard · Staff</div>
            <div>Verification screen – code se hi entry</div>
          </div>
        </div>

        {/* success toast */}
        {success && (
          <div className="mb-4">
            <div className="border-[3px] border-black bg-[#BBF7D0] text-slate-900 px-4 py-3 flex items-center gap-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.4)]">
              <CheckCircle size={20} className="text-green-700" />
              <span className="text-sm font-semibold">
                Customer verified – aage bhej sakte ho ✅
              </span>
            </div>
          </div>
        )}

        {/* main card */}
        <div className="bg-[#FFF8E5] border-[3px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.4)]">
          {/* header */}
          <div className="px-4 py-3 border-b-[3px] border-black bg-[#FFD966] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight">
                Verify customer code
              </h2>
              <p className="text-[11px] text-slate-800">
                6-digit code bolo, yahan type karo, phir verify karo.
              </p>
            </div>
          </div>

          {/* body */}
          <div className="p-4 space-y-4">
            {/* search input */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                Verification code
              </label>
              <div className="flex border-[2px] border-black bg-white">
                <div className="px-3 flex items-center border-r-[2px] border-black bg-[#FFF5D0]">
                  <Search size={16} className="text-slate-800" />
                </div>
                <input
                  ref={inputRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 text-lg font-mono outline-none placeholder:text-slate-400"
                  maxLength={6}
                />
                <button
                  onClick={handleSearch}
                  disabled={!code.trim() || loading}
                  className="px-4 py-2 text-sm font-semibold border-l-[2px] border-black bg-[#FB923C] hover:bg-[#F97316] disabled:opacity-60 flex items-center gap-1"
                >
                  {loading ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-1 text-[12px] text-red-700 mt-1">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* result */}
            {result && (
              <div className="mt-2 border-[2px] border-black bg-white p-3 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <User size={16} />
                    Customer details
                  </h3>
                  <div
                    className={`px-2 py-1 text-[10px] font-semibold rounded-full border-[2px] border-black ${
                      result.status === "waiting"
                        ? "bg-[#FEF3C7]"
                        : result.status === "active"
                        ? "bg-[#BBF7D0]"
                        : "bg-[#E5E7EB]"
                    }`}
                  >
                    {String(result.status || "Unknown")
                      .charAt(0)
                      .toUpperCase() +
                      String(result.status || "Unknown").slice(1)}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-2">
                    <div className="h-8 w-8 border-[2px] border-black bg-[#E0ECFF] flex items-center justify-center">
                      <User size={16} className="text-indigo-700" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Name</p>
                      <p className="text-sm font-semibold">
                        {result.userName || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="h-8 w-8 border-[2px] border-black bg-[#E0ECFF] flex items-center justify-center">
                      <Award size={16} className="text-indigo-700" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">
                        Verification code
                      </p>
                      <p className="text-sm font-mono font-semibold">
                        {result.verificationCode || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="h-8 w-8 border-[2px] border-black bg-[#E0ECFF] flex items-center justify-center">
                      <Clock size={16} className="text-indigo-700" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Joined queue</p>
                      <p className="text-sm font-semibold">
                        {result.joinedAt
                          ? new Date(result.joinedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div
                      className={`h-8 w-8 border-[2px] border-black flex items-center justify-center ${
                        result.isVerified ? "bg-[#BBF7D0]" : "bg-[#FEF3C7]"
                      }`}
                    >
                      {result.isVerified ? (
                        <CheckCircle size={16} className="text-green-700" />
                      ) : (
                        <AlertCircle size={16} className="text-yellow-700" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">
                        Verification status
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          result.isVerified ? "text-green-700" : "text-yellow-700"
                        }`}
                      >
                        {result.isVerified ? "Verified ✓" : "Not verified yet"}
                      </p>
                    </div>
                  </div>
                </div>

                {!result.isVerified ? (
                  <button
                    onClick={markVerified}
                    disabled={verifying}
                    className="mt-3 w-full border-[2px] border-black bg-[#22C55E] py-2 text-sm font-semibold flex items-center justify-center gap-2 hover:-translate-y-[1px] transition-transform disabled:opacity-60"
                  >
                    {verifying ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Mark as verified
                      </>
                    )}
                  </button>
                ) : (
                  <div className="mt-3 border-[2px] border-black bg-[#BBF7D0] px-3 py-2 text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle size={16} />
                    Already verified
                  </div>
                )}
              </div>
            )}

            {/* history */}
            {history.length > 0 && (
              <div className="pt-2 border-t-[2px] border-dashed border-slate-400 mt-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                    Recent checks
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-[11px] underline underline-offset-2"
                  >
                    Clear
                  </button>
                </div>
                <div className="border-[2px] border-black bg-white divide-y-[2px] divide-black/20">
                  {history.map((item, index) => (
                    <button
                      type="button"
                      key={index}
                      className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[#FFF5D0]"
                      onClick={() => loadFromHistory(item.code)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-7 w-7 border-[2px] border-black rounded-full flex items-center justify-center text-[11px] ${
                            item.verified
                              ? "bg-[#BBF7D0] text-green-800"
                              : "bg-[#E5E7EB] text-slate-700"
                          }`}
                        >
                          {item.verified ? <Check size={13} /> : item.code?.[0] || "?"}
                        </div>
                        <div className="leading-tight">
                          <p className="text-xs font-semibold truncate">
                            {item.userName}
                          </p>
                          <p className="text-[10px] font-mono text-slate-600">
                            {item.code}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-600">
                        {formatTime(item.timestamp)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 text-center text-[11px] text-slate-700">
          Staff-only screen · QueueBoard verification tool
        </div>
      </div>
    </div>
  );
}

export default VerifyUser;
