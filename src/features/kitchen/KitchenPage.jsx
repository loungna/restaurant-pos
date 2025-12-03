import React, { useState, useEffect, useMemo } from 'react';
import { useTableStore } from '../../stores/useTableStore';
import { ChefHat, Clock, CheckCircle, Flame, Utensils, Coffee, Filter, Undo2, AlertCircle } from 'lucide-react';

// เสียงเตือน
const ALERT_SOUND = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

export default function KitchenPage() {
    const { tables, updateOrderItemStatus, lastOrderTime } = useTableStore();

    const [activeStation, setActiveStation] = useState('All');
    const [viewFilter, setViewFilter] = useState('Todo'); // 'Todo' | 'History'
    const [currentTime, setCurrentTime] = useState(Date.now());

    // 1. Play Sound
    useEffect(() => {
        if (lastOrderTime > 0) {
            ALERT_SOUND.play().catch(e => console.log('Audio play blocked', e));
        }
    }, [lastOrderTime]);

    // 2. Timer Tick
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 5000);
        return () => clearInterval(timer);
    }, []);

    // 3. Logic รวบรวมออเดอร์
    const allOrders = useMemo(() => {
        let orders = [];
        tables.forEach(table => {
            if (table.currentBill.length > 0) {
                table.currentBill.forEach((item, index) => {

                    const isDrink = item.category === 'Drink' || item.category === 'Alcohol';
                    const isFood = item.category === 'Food' || item.category === 'Appetizer';

                    let matchStation = false;
                    if (activeStation === 'All') matchStation = true;
                    if (activeStation === 'Food' && isFood) matchStation = true;
                    if (activeStation === 'Drink' && isDrink) matchStation = true;

                    let matchView = false;
                    if (viewFilter === 'Todo' && item.status !== 'served') matchView = true;
                    if (viewFilter === 'History' && item.status === 'done') matchView = true;

                    if (matchStation && matchView) {
                        orders.push({
                            ...item,
                            tableId: table.id,
                            tableName: table.name,
                            itemIndex: index,
                            waitMins: Math.floor((currentTime - new Date(item.orderedAt || Date.now()).getTime()) / 60000)
                        });
                    }
                });
            }
        });
        return orders.sort((a, b) => viewFilter === 'Todo' ? b.waitMins - a.waitMins : a.waitMins - b.waitMins);
    }, [tables, activeStation, viewFilter, currentTime]);

    return (
        // แก้ไข: ใช้ h-full แทน min-h-screen และเพิ่ม overflow-hidden เพื่อไม่ให้ scrollbar ซ้อนกัน
        <div className="h-full bg-[#1a1c23] text-gray-100 flex flex-col font-sans overflow-hidden">

            {/* Header Bar (Fixed) */}
            <div className="bg-[#24262d] px-6 py-4 shadow-xl border-b border-gray-800 flex justify-between items-center flex-shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-900/20">
                        <ChefHat size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kitchen Monitor</h1>
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1"><Clock size={14} /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span className="text-orange-500 font-bold">{allOrders.filter(o => o.status === 'waiting').length} รอปรุง</span>
                            <span className="text-blue-400 font-bold">{allOrders.filter(o => o.status === 'cooking').length} กำลังปรุง</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-[#131418] p-1 rounded-xl flex border border-gray-800">
                        {[{ id: 'All', icon: <Filter size={16} />, label: 'รวม' }, { id: 'Food', icon: <Utensils size={16} />, label: 'ครัว' }, { id: 'Drink', icon: <Coffee size={16} />, label: 'บาร์' }].map(tab => (
                            <button key={tab.id} onClick={() => setActiveStation(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeStation === tab.id ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="bg-[#131418] p-1 rounded-xl flex border border-gray-800">
                        <button onClick={() => setViewFilter('Todo')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewFilter === 'Todo' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>ต้องทำ</button>
                        <button onClick={() => setViewFilter('History')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewFilter === 'History' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>ประวัติ</button>
                    </div>
                </div>
            </div>

            {/* Grid Content (Scrollable) */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#1a1c23] min-h-0">
                {allOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-40">
                        <CheckCircle size={80} className="mb-4" />
                        <p className="text-2xl font-bold">ไม่มีรายการค้าง</p>
                        <p>Ready for next order...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
                        {allOrders.map((order) => (
                            <div
                                key={`${order.tableId}-${order.itemIndex}`}
                                className={`
                  rounded-2xl flex flex-col relative border shadow-lg transition-all
                  ${order.status === 'done' ? 'bg-[#1f2128] border-gray-800 opacity-60' : 'bg-[#24262d] border-gray-700 hover:border-gray-600'}
                  ${order.status === 'waiting' && order.waitMins > 15 ? 'ring-2 ring-red-500/50' : ''}
                `}
                            >
                                {/* Card Header */}
                                <div className={`px-4 py-3 flex justify-between items-center rounded-t-2xl ${order.status === 'done' ? 'bg-gray-800' : 'bg-[#2a2d36]'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-white bg-gray-700 w-10 h-10 flex items-center justify-center rounded-lg border border-gray-600">
                                            {order.tableName.replace('T-', '').replace('O-', '')}
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">#{order.tableId}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${order.waitMins < 5 ? 'bg-green-500/20 text-green-400' : order.waitMins < 15 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400 animate-pulse'}`}>
                                        <Clock size={12} /> {order.waitMins}m
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex-1 relative">
                                    {order.status === 'waiting' && order.waitMins < 2 && (
                                        <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce shadow-lg shadow-red-900/50 z-10">NEW!</span>
                                    )}
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-100 leading-snug pr-2">{order.name}</h3>
                                        <span className="text-xl font-black text-orange-500 bg-[#1a1c23] px-2 py-1 rounded border border-gray-800">x{order.quantity}</span>
                                    </div>
                                    {order.note && (
                                        <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded-lg text-sm font-bold flex items-start gap-2">
                                            <AlertCircle size={16} className="mt-0.5 shrink-0" /> "{order.note}"
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="p-3 bg-[#1a1c23]/50 rounded-b-2xl border-t border-gray-800 grid grid-cols-2 gap-3">
                                    {order.status !== 'done' ? (
                                        <>
                                            <button onClick={() => updateOrderItemStatus(order.tableId, order.itemIndex, 'cooking')} className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${order.status === 'cooking' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'bg-[#2a2d36] text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                                                <Flame size={18} /> ปรุง
                                            </button>
                                            <button onClick={() => updateOrderItemStatus(order.tableId, order.itemIndex, 'done')} className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 active:scale-95 transition-all">
                                                <CheckCircle size={18} /> เสร็จ
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => updateOrderItemStatus(order.tableId, order.itemIndex, 'cooking')} className="col-span-2 py-2 text-gray-500 hover:text-gray-300 text-sm flex items-center justify-center gap-2 hover:bg-gray-800 rounded-lg transition-all">
                                            <Undo2 size={16} /> ย้อนกลับ (Undo)
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}