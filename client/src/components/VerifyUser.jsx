import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Search, CheckCircle2, XCircle, ScanLine, ArrowRight } from "lucide-react";
import gsap from "gsap";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function VerifyUser() {
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get("place");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    gsap.from(containerRef.current, { scale: 0.95, opacity: 0, duration: 0.8, ease: "power3.out" });
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      gsap.fromTo(resultRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [result]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code || !placeId) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`${API}/api/queue/verify-token`, {
        placeId,
        verificationCode: code
      });
      setResult({ status: 'success', data: res.data.user });
    } catch (err) {
      setResult({ status: 'error', message: err.response?.data?.message || "Invalid Code" });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCode("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-orange-500 selection:text-white">

      <div ref={containerRef} className="w-full max-w-md">


        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#0a0a0a] border border-white/10 rounded-xl mx-auto flex items-center justify-center mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <ScanLine className="w-8 h-8 text-orange-500 relative z-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Verify Customer</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest">
            Enter the customer's 6-digit code
          </p>
        </div>


        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 relative overflow-hidden shadow-2xl">


          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan pointer-events-none"></div>

          {!result ? (
            <form onSubmit={handleVerify} className="flex flex-col gap-2">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
                <input
                  autoFocus
                  type="text"
                  className="w-full bg-[#111] text-white text-center text-3xl font-mono tracking-[0.5em] py-8 px-4 rounded-xl outline-none border border-transparent focus:border-orange-500/50 transition-all placeholder:text-gray-800 uppercase"
                  placeholder="XXXXXX"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>

              <button
                disabled={loading || code.length < 3}
                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-orange-500 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? "Verifying..." : "Verify"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          ) : (
            <div ref={resultRef} className={`text-center py-12 px-6 rounded-xl ${result.status === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'} border ${result.status === 'success' ? 'border-emerald-500/20' : 'border-red-500/20'}`}>

              <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${result.status === 'success' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'} shadow-lg scale-110`}>
                {result.status === 'success' ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>

              <h2 className={`text-2xl font-bold mb-2 ${result.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                {result.status === 'success' ? "Access Granted" : "Access Denied"}
              </h2>

              {result.status === 'success' ? (
                <div className="bg-[#000] rounded-lg p-6 mt-6 border border-white/10 inline-block text-left w-full max-w-xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Identity Verified</div>
                  <div className="text-2xl font-bold mb-4 text-white">{result.data.userName}</div>

                  <div className="flex justify-between items-end border-t border-white/10 pt-4">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Queue ID</div>
                      <div className="font-mono text-xs text-gray-300">{result.data._id.slice(-8)}</div>
                    </div>
                    <div className="text-emerald-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                      Active
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-red-400 mt-2 font-mono text-sm uppercase tracking-wide">{result.message}</p>
              )}

              <button onClick={reset} className="mt-10 text-xs font-bold uppercase tracking-widest border-b border-white/20 hover:border-white transition-all pb-1 text-gray-400 hover:text-white">
                Scan Next Token
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default VerifyUser;
