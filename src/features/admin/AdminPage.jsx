import React from 'react';
import { useTableStore } from '../../stores/useTableStore';
import { LayoutDashboard, DollarSign, ShoppingBag, TrendingUp, Users, ArrowUpRight, Clock } from 'lucide-react';

export default function AdminPage() {
    const { tables } = useTableStore();

    const activeTables = tables.filter(t => t.status === 'occupied');
    const currentActiveRevenue = activeTables.reduce((sum, t) =>
        sum + t.currentBill.reduce((subSum, i) => subSum + (i.price * i.quantity), 0)
        , 0);
    const totalItemsInProgress = activeTables.reduce((sum, t) => sum + t.currentBill.length, 0);

    const salesData = [
        { day: 'จันทร์', value: 12000 }, { day: 'อังคาร', value: 15500 }, { day: 'พุธ', value: 11000 },
        { day: 'พฤหัส', value: 18000 }, { day: 'ศุกร์', value: 25000 }, { day: 'เสาร์', value: 32000 }, { day: 'อาทิตย์', value: 28000 },
    ];
    const maxSale = Math.max(...salesData.map(d => d.value));

    return (
        // แก้ไข: Layout Container
        <div className="h-full bg-gray-50 font-sans text-slate-800 flex flex-col overflow-hidden">

            {/* Top Bar (Fixed) */}
            <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center flex-shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-lg">
                        <LayoutDashboard size={24} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Admin Dashboard</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-gray-400 font-bold uppercase">Current Time</div>
                        <div className="font-bold font-mono text-lg leading-none">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">A</div>
                </div>
            </div>

            {/* Main Content (Scrollable) */}
            <div className="flex-1 p-8 overflow-y-auto min-h-0">
                <div className="max-w-7xl mx-auto space-y-8 pb-10">

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="ยอดขายรอเช็คบิล" value={`฿${currentActiveRevenue.toLocaleString()}`} unit="Live" icon={<DollarSign size={24} className="text-white" />} color="bg-green-500" trend="Active" />
                        <StatCard title="ออเดอร์ในครัว" value={totalItemsInProgress} unit="รายการ" icon={<ShoppingBag size={24} className="text-white" />} color="bg-orange-500" trend="Processing" />
                        <StatCard title="ลูกค้าในร้าน" value={activeTables.length} unit="โต๊ะ" icon={<Users size={24} className="text-white" />} color="bg-blue-500" trend={`${activeTables.length > 5 ? 'Busy' : 'Normal'}`} />
                        <StatCard title="เฉลี่ยต่อโต๊ะ" value={`฿${activeTables.length ? Math.round(currentActiveRevenue / activeTables.length) : 0}`} icon={<TrendingUp size={24} className="text-white" />} color="bg-purple-500" trend="Avg" />
                    </div>

                    {/* Charts & Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sales Chart */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-8">
                                <div><h3 className="text-xl font-bold text-slate-800">ยอดขายรายสัปดาห์</h3><p className="text-sm text-gray-400">เปรียบเทียบยอดขาย 7 วันล่าสุด</p></div>
                            </div>
                            <div className="flex items-end gap-3 sm:gap-6 h-64 w-full">
                                {salesData.map((data, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                                        <div className="w-full bg-gray-50 rounded-t-2xl relative group-hover:bg-orange-50 transition-all overflow-hidden h-full flex items-end">
                                            <div className="w-full bg-slate-800 group-hover:bg-orange-500 transition-all rounded-t-2xl relative" style={{ height: `${(data.value / maxSale) * 100}%` }}>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">฿{data.value.toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 group-hover:text-orange-600">{data.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active Tables List */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 flex-shrink-0">
                                <Clock size={20} className="text-orange-500" /> กำลังใช้งาน ({activeTables.length})
                            </h3>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin min-h-0">
                                {activeTables.length === 0 ? (
                                    <div className="text-center text-gray-400 py-10">ร้านว่างจัง...</div>
                                ) : (
                                    activeTables.map(table => (
                                        <div key={table.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{table.name.replace('T-', '').replace('O-', '')}</div>
                                                <div><div className="font-bold text-slate-800">โต๊ะ {table.name}</div><div className="text-xs text-gray-400">{table.currentBill.length} รายการ</div></div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-orange-600">฿{table.currentBill.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}</div>
                                                <div className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block">Active</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, unit, icon, color, trend }) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div><p className="text-sm font-bold text-gray-400 mb-1">{title}</p><h3 className="text-3xl font-black text-slate-800">{value} <span className="text-sm font-normal text-gray-400">{unit}</span></h3></div>
                <div className={`${color} p-3 rounded-2xl shadow-lg`}>{icon}</div>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-green-500 bg-green-50 w-fit px-2 py-1 rounded-lg"><ArrowUpRight size={16} /> {trend}</div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 ${color} group-hover:scale-150 transition-transform duration-500`} />
        </div>
    );
}