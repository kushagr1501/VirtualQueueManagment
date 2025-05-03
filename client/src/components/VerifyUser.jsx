import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Search, User, CheckCircle, XCircle, Clock, Award, AlertCircle, Check, Loader, RefreshCw } from "lucide-react";

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
    // Focus input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Load verification history from localStorage
    const savedHistory = localStorage.getItem('verificationHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        // If parsing fails, just start with empty history
        localStorage.removeItem('verificationHistory');
      }
    }
  }, []);

  const handleSearch = async () => {
    if (!code.trim()) return;
    
    setError("");
    setLoading(true);
    setSuccess(false);
    
    try {
      const res = await axios.get(`http://localhost:5000/api/queue/find-by-code/${code}`);
      setResult(res.data);
      
      // Add to recent searches if not already in history
      if (!history.some(item => item.code === code)) {
        const newHistory = [{ code, userName: res.data.userName, timestamp: new Date().toISOString() }, ...history].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('verificationHistory', JSON.stringify(newHistory));
      }
    } catch (err) {
      setResult(null);
      setError("Code not found or invalid.");
    } finally {
      setLoading(false);
    }
  };

  const markVerified = async () => {
    if (!result) return;
    
    setVerifying(true);
    try {
      const res = await axios.patch(`http://localhost:5000/api/queue/${result._id}/verify`);
      setResult(res.data);
      setSuccess(true);
      
      // Update history item to show verified
      const updatedHistory = history.map(item => 
        item.code === code ? { ...item, verified: true } : item
      );
      setHistory(updatedHistory);
      localStorage.setItem('verificationHistory', JSON.stringify(updatedHistory));
      
      // Show success animation
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && code.trim()) {
      handleSearch();
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('verificationHistory');
  };

  const loadFromHistory = (historyCode) => {
    setCode(historyCode);
    // Auto-search when clicking on history item
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Success notification */}
        {success && (
          <div className="mb-4 transform transition-all animate-bounce">
            <div className="bg-green-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
              <CheckCircle size={24} />
              <span className="font-medium">Successfully verified!</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-6">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
              <CheckCircle size={24} />
              Verify Customer
            </h2>
            <p className="text-indigo-200 text-center mt-1">Check verification codes and process customers</p>
          </div>

          {/* Main content */}
          <div className="p-6">
            {/* Search input */}
            <div className="relative mb-6">
              <div className="flex shadow-md rounded-lg overflow-hidden">
                <div className="bg-gray-100 flex items-center justify-center px-4">
                  <Search size={20} className="text-gray-500" />
                </div>
                <input
                  ref={inputRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter 6-digit verification code"
                  className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-0 font-mono text-lg"
                  maxLength={6}
                />
                <button
                  onClick={handleSearch}
                  disabled={!code.trim() || loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-medium transition disabled:opacity-50 flex items-center gap-1"
                >
                  {loading ? <Loader size={16} className="animate-spin" /> : "Search"}
                </button>
              </div>
              {error && (
                <div className="mt-2 text-red-500 flex items-center gap-1">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Result Card */}
            {result && (
              <div className={`bg-white border rounded-xl p-5 shadow-md transition-all ${success ? 'bg-green-50 border-green-200' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <User size={18} />
                    Customer Details
                  </h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 
                    result.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <User size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{result.userName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Award size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Verification Code</p>
                      <p className="font-mono font-medium">{result.verificationCode}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Clock size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joined Queue</p>
                      <p className="font-medium">
                        {result.joinedAt ? new Date(result.joinedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className={`p-2 rounded-lg ${result.isVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      {result.isVerified ? 
                        <CheckCircle size={18} className="text-green-600" /> : 
                        <AlertCircle size={18} className="text-yellow-600" />
                      }
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Verification Status</p>
                      <p className={`font-medium ${result.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {result.isVerified ? 'Verified ✓' : 'Not Verified'}
                      </p>
                    </div>
                  </div>
                </div>

                {!result.isVerified ? (
                  <button
                    onClick={markVerified}
                    disabled={verifying}
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                  >
                    {verifying ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Mark as Verified
                      </>
                    )}
                  </button>
                ) : (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-center gap-2 text-green-800">
                    <CheckCircle size={18} />
                    <span className="font-medium">Customer already verified</span>
                  </div>
                )}
              </div>
            )}

            {/* History Section */}
            {history.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Recent verifications</h3>
                  <button 
                    onClick={clearHistory}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Clear history
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                  {history.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-3 flex justify-between items-center hover:bg-gray-100 cursor-pointer"
                      onClick={() => loadFromHistory(item.code)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.verified ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {item.verified ? <Check size={14} /> : item.code[0]}
                        </div>
                        <div>
                          <p className="font-medium truncate">{item.userName}</p>
                          <p className="text-xs text-gray-500 font-mono">{item.code}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{formatTime(item.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 text-center text-gray-500 text-xs">
          <p>Staff verification system • Enter the 6-digit code to verify customers</p>
        </div>
      </div>
    </div>
  );
}

export default VerifyUser;