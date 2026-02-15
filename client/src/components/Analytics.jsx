import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { ArrowLeft, Download, Clock, TrendingUp, Calendar, XCircle, CheckCircle2, BarChart3, PieChart as PieChartIcon, RefreshCw, Activity, UserX, Zap } from "lucide-react";
import { AnalyticsSkeleton } from "./Skeleton";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const COLORS = ["#f97316", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e"];

function Analytics() {
    const { id } = useParams();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [place, setPlace] = useState(null);
    const [days, setDays] = useState(30);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [analyticsRes, placeRes] = await Promise.all([
                axios.get(`${API}/api/places/${id}/analytics?days=${days}`),
                axios.get(`${API}/api/places/${id}`)
            ]);
            setAnalytics(analyticsRes.data);
            setPlace(placeRes.data);
        } catch (err) { console.error("Error:", err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAnalytics(); }, [id, days]);

    const handleRefresh = async () => { setRefreshing(true); await fetchAnalytics(); setTimeout(() => setRefreshing(false), 500); };
    const handleExportCSV = () => {
        const token = localStorage.getItem("token");
        // Open CSV export with auth token as query param (backend also accepts header)
        window.open(`${API}/api/places/${id}/analytics/export?days=${days}&token=${token}`, "_blank");
    };
    const formatHour = (hour) => hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;

    if (loading) {
        return <AnalyticsSkeleton />;
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center max-w-md">
                    <p className="text-xl font-bold text-white mb-4">Failed to load analytics</p>
                    <Link to={`/admin/place/${id}`} className="text-orange-500 font-bold hover:text-white transition-colors">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    const { summary, hourlyData, dailyData, queueData, weekdayData } = analytics;
    const pieData = queueData.map((q, i) => ({ name: q.name, value: q.served + q.cancelled, color: COLORS[i % COLORS.length] })).filter(d => d.value > 0);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-4">
                            <Link to={`/admin/place/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                                    <Activity className="w-5 h-5 text-orange-600" /> Analytics
                                </h1>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{place?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="bg-white border border-gray-200 text-slate-900 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-orange-500 transition-colors cursor-pointer shadow-sm">
                                <option value={7}>Last 7 Days</option>
                                <option value={14}>Last 14 Days</option>
                                <option value={30}>Last 30 Days</option>
                                <option value={90}>Last 3 Months</option>
                            </select>
                            <button onClick={handleRefresh} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                            </button>
                            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-slate-900 text-white font-bold px-5 py-2 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-slate-900/10">
                                <Download className="w-4 h-4" /> CSV Export
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

                {/* Summary Cards — 6 metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {[
                        { icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, label: "Total Served", value: summary.totalServed, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { icon: <XCircle className="w-5 h-5 text-red-600" />, label: "Cancelled", value: summary.totalCancelled, color: "text-red-600", bg: "bg-red-50" },
                        { icon: <Clock className="w-5 h-5 text-blue-600" />, label: "Avg Wait", value: `${summary.avgWaitTime}m`, color: "text-blue-600", bg: "bg-blue-50" },
                        { icon: <TrendingUp className="w-5 h-5 text-orange-600" />, label: "Efficiency", value: `${summary.completionRate}%`, color: "text-orange-600", bg: "bg-orange-50" },
                        { icon: <UserX className="w-5 h-5 text-amber-600" />, label: "No-Show Rate", value: `${summary.noShowRate || 0}%`, color: "text-amber-600", bg: "bg-amber-50" },
                        { icon: <Zap className="w-5 h-5 text-violet-600" />, label: "Served/Day", value: summary.avgServedPerDay || 0, color: "text-violet-600", bg: "bg-violet-50" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-colors cursor-default shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2.5 ${stat.bg} rounded-xl`}>{stat.icon}</div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className={`text-3xl font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Peak Activity & Busiest Day */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-colors"></div>
                        <p className="text-violet-600 text-xs font-bold uppercase tracking-widest mb-2">Peak Activity</p>
                        <p className="text-5xl font-black text-slate-900 mb-2 tracking-tight">{formatHour(summary.peakHour)}</p>
                        <p className="text-slate-500 text-sm font-medium">Highest traffic volume recorded.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors"></div>
                        <p className="text-orange-600 text-xs font-bold uppercase tracking-widest mb-2">High Volume Day</p>
                        <p className="text-5xl font-black text-slate-900 mb-2 tracking-tight">{summary.busiestDay}</p>
                        <p className="text-slate-500 text-sm font-medium">Requires optimal staffing.</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Hourly Distribution */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-orange-600" /> Hourly Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="hour" tickFormatter={(h) => h % 4 === 0 ? formatHour(h) : ""} stroke="#cbd5e1" fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#cbd5e1" fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    labelStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                                    itemStyle={{ fontSize: '12px', color: '#64748b' }}
                                    labelFormatter={(h) => formatHour(h)}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Queue Share Pie */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-violet-600" /> Queue Share
                        </h3>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} stroke="#fff" strokeWidth={4}>
                                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: '#0f172a' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#64748b' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-slate-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">No Data Available</div>
                        )}
                    </div>

                    {/* Daily Traffic */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-600" /> Daily Traffic
                        </h3>
                        {dailyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={dailyData}>
                                    <defs>
                                        <linearGradient id="colorServed" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} stroke="#cbd5e1" fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#cbd5e1" fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                        labelFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                                        itemStyle={{ color: '#64748b' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#64748b' }} />
                                    <Area type="monotone" dataKey="served" stroke="#10b981" fillOpacity={1} fill="url(#colorServed)" name="Served" strokeWidth={3} />
                                    <Area type="monotone" dataKey="cancelled" stroke="#ef4444" fillOpacity={1} fill="url(#colorCancelled)" name="Cancelled" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-slate-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">No Data Available</div>
                        )}
                    </div>

                    {/* Day of Week */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" /> Day of Week
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={weekdayData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" stroke="#cbd5e1" fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={10} tick={{ fill: '#64748b' }} width={30} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                    itemStyle={{ color: '#64748b' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Queue Breakdown Table */}
                {queueData.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Queue Breakdown</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-white border-b border-gray-100">
                                        <th className="text-left px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Queue Name</th>
                                        <th className="text-center px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Served</th>
                                        <th className="text-center px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Cancelled</th>
                                        <th className="text-center px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</th>
                                        <th className="text-center px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Success Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {queueData.map((q, i) => {
                                        const total = q.served + q.cancelled;
                                        const rate = total > 0 ? Math.round((q.served / total) * 100) : 0;
                                        return (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-5 font-bold text-slate-900">{q.name}</td>
                                                <td className="px-8 py-5 text-center font-bold text-emerald-600">{q.served}</td>
                                                <td className="px-8 py-5 text-center font-bold text-red-600">{q.cancelled}</td>
                                                <td className="px-8 py-5 text-center font-bold text-slate-500">{total}</td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${rate >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : rate >= 50 ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                        {rate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Analytics;
