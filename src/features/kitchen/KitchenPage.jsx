import React, { useState, useEffect, useMemo } from 'react';
import { useTableStore } from '../../stores/useTableStore';
import { ChefHat, Clock, CheckCircle, Flame, Utensils, Coffee, Filter, XCircle, Trash2, AlertTriangle } from 'lucide-react';

const ALERT_SOUND = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

export default function KitchenPage() {
    const { tables, updateOrderItemStatus, cancelOrderItem, lastOrderTime } = useTableStore();

    const [activeStation, setActiveStation] = useState('All');
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Sound Effect
    useEffect(() => {
        if (lastOrderTime > 0) ALERT_SOUND.play().catch(() => { });
    }, [lastOrderTime]);

    // Timer Tick
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 5000);
        return () => clearInterval(timer);
    }, []);

    // Filter Logic
    const allOrders = useMemo(() => {
        let orders = [];
        tables.forEach(table => {
            if (table.currentBill.length > 0) {
                table.currentBill.forEach((item, index) => {
                    // ไม่แสดงรายการที่ "เสร็จแล้ว" หรือ "ยกเลิก" ในหน้าหลัก (เพื่อให้ครัวโล่ง)
                    if (item.status === 'done' || item.status === 'cancelled') return;

                    const isDrink = item.category === 'Drink' || item.category === 'Alcohol';
                    const isFood = item.category === 'Food' || item.category === 'Appetizer';

                    let matchStation = false;
                    if (activeStation === 'All') matchStation = true;
                    if (activeStation === 'Food' && isFood) matchStation = true;
                    if (activeStation === 'Drink' && isDrink) matchStation = true;

                    if (matchStation) {
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
        // เรียงลำดับ: รอนานสุดขึ้นก่อน (FIFO)
        return orders.sort((a, b) => b.waitMins - a.waitMins);
    }, [tables, activeStation, currentTime]);

    return (
        <div className="h-full bg-[#1a1c23] text-gray-100 flex flex-col font-sans overflow-hidden">

            {/* Header */}
            <div className="bg-[#24262d] px-6 py-4 shadow-xl border-b border-gray-800 flex justify-between items-center flex-shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-900/20"><ChefHat size={32} /></div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kitchen Monitor</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded"><Clock size={14} /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-orange-500 font-bold">{allOrders.filter(o => o.status === 'waiting').length} รอปรุง</span>
                            <span className="text-blue-400 font-bold">{allOrders.filter(o => o.status === 'cooking').length} กำลังปรุง</span>
                        </div>
                    </div>
                </div>

                {/* Station Filters */}
                <div className="bg-[#131418] p-1 rounded-xl flex border border-gray-800">
                    {[{ id: 'All', icon: <Filter size={16} />, label: 'รวม' }, { id: 'Food', icon: <Utensils size={16} />, label: 'ครัว' }, { id: 'Drink', icon: <Coffee size={16} />, label: 'บาร์' }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveStation(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeStation === tab.id ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#1a1c23] min-h-0">
                {allOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-30">
                        <CheckCircle size={80} className="mb-4" />
                        <p className="text-2xl font-bold">ไม่มีรายการค้าง</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
                        {allOrders.map((order) => (
                            <div key={`${order.tableId}-${order.itemIndex}`} className={`rounded-2xl flex flex-col relative border shadow-lg transition-all overflow-hidden ${order.status === 'cooking' ? 'bg-[#2a2d36] border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-[#24262d] border-gray-700 hover:border-gray-600'}`}>

                                {/* Card Header */}
                                <div className="px-4 py-3 flex justify-between items-center bg-black/20 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-black text-white bg-white/10 w-10 h-10 flex items-center justify-center rounded-lg">{order.tableName.replace(/[^0-9]/g, '')}</span>
                                        <span className="text-xs text-gray-400 font-mono tracking-wider opacity-70">#{order.tableId}</span>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${order.waitMins < 10 ? 'bg-green-500/10 text-green-400' : order.waitMins < 20 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400 animate-pulse'}`}>
                                        <Clock size={12} /> {order.waitMins}m
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex-1 relative">
                                    {order.status === 'waiting' && order.waitMins < 2 && <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/40">NEW</span>}

                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="text-lg font-bold text-gray-100 leading-snug">{order.name}</h3>
                                        <span className="text-xl font-black text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">x{order.quantity}</span>
                                    </div>

                                    {order.note && (
                                        <div className="mt-3 bg-red-500/10 border border-red-500/20 text-red-300 p-2.5 rounded-lg text-sm font-medium flex items-start gap-2">
                                            <AlertTriangle size={14} className="mt-0.5 shrink-0" /> "{order.note}"
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="p-3 bg-black/20 border-t border-white/5 grid grid-cols-4 gap-2">
                                    {/* Cancel Button */}
                                    <button
                                        onClick={() => cancelOrderItem(order.tableId, order.itemIndex)}
                                        className="col-span-1 bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 rounded-xl flex items-center justify-center transition-colors"
                                        title="ยกเลิกเมนูนี้"
                                    >
                                        <XCircle size={20} />
                                    </button>

                                    {/* Cooking / Done Buttons */}
                                    {order.status === 'waiting' ? (
                                        <button onClick={() => updateOrderItemStatus(order.tableId, order.itemIndex, 'cooking')} className="col-span-3 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
                                            <Flame size={18} /> เริ่มปรุง
                                        </button>
                                    ) : (
                                        <button onClick={() => updateOrderItemStatus(order.tableId, order.itemIndex, 'done')} className="col-span-3 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all">
                                            <CheckCircle size={18} /> เสร็จแล้ว
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