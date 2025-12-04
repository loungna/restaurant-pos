import React, { useState, useEffect } from 'react';
import { useTableStore } from '../../stores/useTableStore';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import {
    LayoutDashboard, DollarSign, ShoppingBag, TrendingUp, Users, ArrowUpRight,
    Clock, Database, FileText, Calendar, Moon, Sun, Search, Receipt
} from 'lucide-react';

export default function AdminPage() {
    const { tables, resetDatabase, loading } = useTableStore();
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history'
    const [darkMode, setDarkMode] = useState(false); // Dark Mode State

    // Toggle Theme Function
    const toggleTheme = () => setDarkMode(!darkMode);

    // Theme Classes Helper
    const theme = {
        bg: darkMode ? 'bg-[#0f172a]' : 'bg-gray-50',
        text: darkMode ? 'text-slate-100' : 'text-slate-800',
        textSec: darkMode ? 'text-slate-400' : 'text-slate-500',
        card: darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-200',
        border: darkMode ? 'border-slate-700' : 'border-gray-200',
        hover: darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50',
        input: darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200 text-slate-800',
    };

    return (
        <div className={`h-full flex flex-col overflow-hidden transition-colors duration-300 font-sans ${theme.bg} ${theme.text}`}>

            {/* --- Top Bar --- */}
            <div className={`px-8 py-5 flex justify-between items-center flex-shrink-0 z-20 border-b ${darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-200'} shadow-sm transition-colors duration-300`}>
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                        <LayoutDashboard size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Admin Console</h1>
                        <p className={`text-xs font-medium ${theme.textSec}`}>Management & Analytics</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className={`flex p-1.5 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-200'}`}>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? (darkMode ? 'bg-slate-700 text-white shadow' : 'bg-white text-indigo-600 shadow') : theme.textSec}`}
                    >
                        <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? (darkMode ? 'bg-slate-700 text-white shadow' : 'bg-white text-indigo-600 shadow') : theme.textSec}`}
                    >
                        <FileText size={16} /> History
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-full transition-all ${darkMode ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Reset DB Button */}
                    <button
                        onClick={resetDatabase}
                        disabled={loading}
                        className="flex items-center gap-2 bg-red-500/10 text-red-600 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
                    >
                        <Database size={16} /> {loading ? 'Building...' : 'Reset Data'}
                    </button>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center font-bold text-white shadow-md">
                        A
                    </div>
                </div>
            </div>

            {/* --- Content Area --- */}
            <div className="flex-1 p-8 overflow-y-auto min-h-0 custom-scrollbar">
                {activeTab === 'dashboard'
                    ? <DashboardView tables={tables} theme={theme} darkMode={darkMode} />
                    : <HistoryView theme={theme} darkMode={darkMode} />
                }
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// Sub-Component: Dashboard
// ----------------------------------------------------------------------
function DashboardView({ tables, theme, darkMode }) {
    // Logic
    const activeTables = tables.filter(t => t.status === 'occupied');
    const currentActiveRevenue = activeTables.reduce((sum, t) => sum + t.currentBill.reduce((subSum, i) => subSum + (i.price * i.quantity), 0), 0);
    const totalItemsInProgress = activeTables.reduce((sum, t) => sum + t.currentBill.length, 0);

    // Mock Graph Data
    const salesData = [{ d: 'M', v: 12000 }, { d: 'T', v: 15500 }, { d: 'W', v: 11000 }, { d: 'T', v: 18000 }, { d: 'F', v: 25000 }, { d: 'S', v: 32000 }, { d: 'S', v: 28000 }];
    const maxSale = Math.max(...salesData.map(d => d.v));

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="ยอดขายรอเช็คบิล" value={`฿${currentActiveRevenue.toLocaleString()}`} unit="Live" icon={<DollarSign size={24} className="text-white" />} color="bg-emerald-500" trend="Active" theme={theme} />
                <StatCard title="ออเดอร์ในครัว" value={totalItemsInProgress} unit="Items" icon={<ShoppingBag size={24} className="text-white" />} color="bg-orange-500" trend="Cooking" theme={theme} />
                <StatCard title="ลูกค้าในร้าน" value={activeTables.length} unit="Tables" icon={<Users size={24} className="text-white" />} color="bg-blue-500" trend="Now" theme={theme} />
                <StatCard title="เฉลี่ยต่อโต๊ะ" value={`฿${activeTables.length ? Math.round(currentActiveRevenue / activeTables.length) : 0}`} icon={<TrendingUp size={24} className="text-white" />} color="bg-violet-500" trend="Avg" theme={theme} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className={`lg:col-span-2 ${theme.card} p-8 rounded-3xl shadow-sm border transition-colors duration-300`}>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold">ยอดขายรายสัปดาห์</h3>
                            <p className={`text-sm ${theme.textSec}`}>เปรียบเทียบยอดขาย 7 วันล่าสุด</p>
                        </div>
                        <button className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                            <ArrowUpRight size={20} className={darkMode ? 'text-slate-300' : 'text-slate-600'} />
                        </button>
                    </div>
                    <div className="flex items-end gap-3 sm:gap-6 h-64 w-full">
                        {salesData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                                <div className={`w-full rounded-t-2xl relative transition-all overflow-hidden h-full flex items-end ${darkMode ? 'bg-slate-700/50 hover:bg-indigo-500/20' : 'bg-gray-100 hover:bg-indigo-50'}`}>
                                    <div className="w-full bg-indigo-500 group-hover:bg-indigo-400 transition-all rounded-t-2xl relative shadow-lg shadow-indigo-500/30" style={{ height: `${(data.v / maxSale) * 100}%` }}>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">฿{data.v.toLocaleString()}</div>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold ${theme.textSec} group-hover:text-indigo-500`}>{data.d}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Tables List */}
                <div className={`${theme.card} p-8 rounded-3xl shadow-sm border flex flex-col h-[420px] transition-colors duration-300`}>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 flex-shrink-0">
                        <Clock size={20} className="text-orange-500" /> โต๊ะที่กำลังใช้งาน
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin min-h-0">
                        {activeTables.length === 0 ? (
                            <div className={`text-center py-10 ${theme.textSec} opacity-60 flex flex-col items-center`}>
                                <Users size={48} className="mb-2" />
                                <span>ร้านว่างจัง...</span>
                            </div>
                        ) : (
                            activeTables.map(table => (
                                <div key={table.id} className={`flex items-center justify-between p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'} hover:scale-[1.02] transition-transform`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${darkMode ? 'bg-slate-600' : 'bg-slate-800'}`}>
                                            {table.name.replace(/[^\d]/g, '')}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">โต๊ะ {table.name}</div>
                                            <div className={`text-xs ${theme.textSec}`}>{table.currentBill.length} รายการ</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-emerald-500">฿{table.currentBill.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// Sub-Component: History (Improved)
// ----------------------------------------------------------------------
function HistoryView({ theme, darkMode }) {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const q = query(collection(db, "bills"), orderBy("timestamp", "desc"), limit(50));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBills(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Simple Filter
    const filteredBills = bills.filter(bill =>
        bill.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-black mb-2">Transaction History</h2>
                    <p className={theme.textSec}>ตรวจสอบรายการขายย้อนหลัง</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search size={18} className={`absolute left-3 top-3 ${theme.textSec}`} />
                        <input
                            type="text"
                            placeholder="ค้นหาโต๊ะ..."
                            className={`pl-10 pr-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-colors ${theme.input} ${theme.border}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={`px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-2 ${theme.card} ${theme.border}`}>
                        <Calendar size={16} /> {new Date().toLocaleDateString('th-TH')}
                    </div>
                </div>
            </div>

            <div className={`${theme.card} rounded-3xl shadow-sm border overflow-hidden transition-colors duration-300`}>
                {loading ? (
                    <div className="p-20 text-center animate-pulse">กำลังโหลดข้อมูล...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className={`${darkMode ? 'bg-slate-800/80' : 'bg-gray-50/80'} border-b ${theme.border} backdrop-blur-sm sticky top-0`}>
                            <tr>
                                <th className={`px-6 py-5 text-xs font-bold uppercase tracking-wider ${theme.textSec}`}>ID / เวลา</th>
                                <th className={`px-6 py-5 text-xs font-bold uppercase tracking-wider ${theme.textSec}`}>โต๊ะ</th>
                                <th className={`px-6 py-5 text-xs font-bold uppercase tracking-wider ${theme.textSec}`}>รายการอาหาร</th>
                                <th className={`px-6 py-5 text-xs font-bold uppercase tracking-wider ${theme.textSec} text-right`}>ยอดรวม</th>
                                <th className={`px-6 py-5 text-xs font-bold uppercase tracking-wider ${theme.textSec} text-center`}>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme.border}`}>
                            {filteredBills.length === 0 ? (
                                <tr><td colSpan="5" className={`p-10 text-center ${theme.textSec}`}>ไม่พบข้อมูล</td></tr>
                            ) : (
                                filteredBills.map((bill) => (
                                    <tr key={bill.id} className={`${theme.hover} transition-colors group`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-500'}`}>
                                                    <Receipt size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-mono text-xs opacity-50">#{bill.id.slice(0, 6)}</div>
                                                    <div className="text-sm font-bold">{new Date(bill.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                                                {bill.tableName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {bill.items.slice(0, 2).map((item, idx) => (
                                                    <span key={idx} className={`text-sm ${theme.textSec} flex items-center gap-2`}>
                                                        <span className="w-1 h-1 rounded-full bg-indigo-500"></span> {item.quantity}x {item.name}
                                                    </span>
                                                ))}
                                                {bill.items.length > 2 && (
                                                    <span className="text-xs text-indigo-500 font-bold pl-3">+{bill.items.length - 2} รายการอื่นๆ</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-black text-emerald-500 text-lg">฿{bill.totalAmount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                Paid
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// ... StatCard (Adapted for Theme) ...
function StatCard({ title, value, unit, icon, color, trend, theme }) {
    return (
        <div className={`${theme.card} p-6 rounded-3xl shadow-sm border transition-colors duration-300 relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <p className={`text-sm font-bold ${theme.textSec} mb-1`}>{title}</p>
                    <h3 className="text-3xl font-black">{value} <span className={`text-sm font-normal ${theme.textSec}`}>{unit}</span></h3>
                </div>
                <div className={`${color} p-3 rounded-2xl shadow-lg text-white transform group-hover:scale-110 transition-transform`}>{icon}</div>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-emerald-500 bg-emerald-500/10 w-fit px-2 py-1 rounded-lg border border-emerald-500/20">
                <ArrowUpRight size={16} /> {trend}
            </div>
        </div>
    );
}