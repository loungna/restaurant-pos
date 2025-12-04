import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { useTableStore } from '../../stores/useTableStore';
import { MENU_ITEMS } from '../../data/menu';
import { ZONES } from '../../data/tables';
import {
    ShoppingCart, Plus, Minus, ChefHat, LayoutGrid, UtensilsCrossed,
    IceCream, Coffee, Wine, MapPin, X, Pencil, Receipt, CreditCard,
    Banknote, QrCode, ArrowRight, Trash2, AlertCircle, Utensils, Moon, Sun
} from 'lucide-react';

export default function POSPage() {
    // --- Stores ---
    const { cart, addToCart, decreaseQuantity, removeFromCart, getTotalPrice, selectedTable, setTable, updateItemNote, clearCart, resetOrder } = useCartStore();
    const { tables, occupyTable, appendOrder, clearTable } = useTableStore();

    // --- Local State ---
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showTableModal, setShowTableModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [activeZone, setActiveZone] = useState('indoor');

    // Dark Mode State
    const [darkMode, setDarkMode] = useState(false);

    const [actionTableId, setActionTableId] = useState(null);

    // Helper Data
    const currentTableData = selectedTable ? tables.find(t => t.id === selectedTable.id) : null;
    const actionTableData = actionTableId ? tables.find(t => t.id === actionTableId) : null;

    // --- THEME CONFIGURATION ---
    const theme = {
        bg: darkMode ? 'bg-[#0f172a]' : 'bg-[#F3F4F6]',
        bgSec: darkMode ? 'bg-[#1e293b]' : 'bg-white',
        text: darkMode ? 'text-slate-100' : 'text-slate-800',
        textSec: darkMode ? 'text-slate-400' : 'text-slate-500', // Secondary Text
        border: darkMode ? 'border-slate-700' : 'border-slate-100',
        card: darkMode ? 'bg-[#1e293b] border-slate-700 hover:border-slate-600' : 'bg-white border-slate-100 hover:border-orange-200',
        input: darkMode ? 'bg-slate-900 border-slate-700 text-white focus:ring-orange-900' : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-orange-100',
        modalBg: darkMode ? 'bg-[#1e293b]' : 'bg-white',
        modalOverlay: darkMode ? 'bg-slate-950/80' : 'bg-slate-900/60',
        tabActive: darkMode ? 'bg-orange-600 text-white border-orange-600' : 'bg-slate-900 text-white border-slate-900',
        tabInactive: darkMode ? 'bg-[#0f172a] text-slate-400 border-slate-700 hover:bg-slate-800' : 'bg-white text-slate-500 border-white hover:border-orange-100',
    };

    const categories = [
        { id: 'All', label: 'ทั้งหมด', icon: <LayoutGrid size={18} /> },
        { id: 'Food', label: 'จานหลัก', icon: <UtensilsCrossed size={18} /> },
        { id: 'Appetizer', label: 'ทานเล่น', icon: <IceCream size={18} /> },
        { id: 'Drink', label: 'เครื่องดื่ม', icon: <Coffee size={18} /> },
        { id: 'Alcohol', label: 'แอลกอฮอล์', icon: <Wine size={18} /> },
    ];

    const filteredItems = selectedCategory === 'All' ? MENU_ITEMS : MENU_ITEMS.filter(item => item.category === selectedCategory);

    // --- Handlers ---
    const handleTableClick = (table) => {
        if (table.status === 'occupied') {
            setActionTableId(table.id);
            setShowActionModal(true);
            setShowTableModal(false);
        } else {
            clearCart();
            setTable(table);
            setShowTableModal(false);
        }
    };

    const handleAddMoreOrder = () => {
        const tableToEdit = tables.find(t => t.id === actionTableId);
        if (tableToEdit) {
            clearCart();
            setTable(tableToEdit);
        }
        setShowActionModal(false);
    };

    const handleOpenPayment = () => {
        setShowPaymentModal(true);
        setShowActionModal(false);
    };

    const handleSubmitOrder = () => {
        if (!currentTableData || cart.length === 0) return;
        if (currentTableData.status === 'available') {
            occupyTable(currentTableData.id, cart);
        } else {
            appendOrder(currentTableData.id, cart);
        }
        resetOrder();
        alert(`ส่งออเดอร์เรียบร้อย!`);
    };

    const handlePayment = () => {
        if (!actionTableId) return;
        clearTable(actionTableId);
        setShowPaymentModal(false);
        setActionTableId(null);
        resetOrder();
    };

    return (
        <div className={`flex h-full w-full overflow-hidden font-sans transition-colors duration-300 ${theme.bg} ${theme.text}`}>

            {/* ======================= MODAL: TABLE MAP ======================= */}
            {showTableModal && (
                <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-in fade-in duration-200 ${theme.modalOverlay}`}>
                    <div className={`${theme.modalBg} w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10`}>
                        <div className={`p-6 border-b flex justify-between items-center flex-shrink-0 ${theme.border}`}>
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <span className="p-2 bg-orange-500/20 text-orange-500 rounded-xl"><MapPin size={24} /></span>
                                    เลือกโต๊ะที่นั่ง
                                </h2>
                                <p className={`text-sm ml-14 mt-1 ${theme.textSec}`}>แตะที่โต๊ะเพื่อสั่งอาหาร หรือเช็คบิล</p>
                            </div>
                            <button onClick={() => setShowTableModal(false)} className={`p-3 rounded-full transition-colors ${theme.textSec} hover:bg-white/10`}><X size={28} /></button>
                        </div>

                        <div className={`flex p-4 gap-3 justify-center border-b flex-shrink-0 ${theme.bg} ${theme.border}`}>
                            {ZONES.map(zone => (
                                <button
                                    key={zone.id} onClick={() => setActiveZone(zone.id)}
                                    className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-sm border ${activeZone === zone.id ? (darkMode ? 'bg-orange-600 text-white border-orange-600' : 'bg-slate-800 text-white border-slate-800') : theme.tabInactive}`}
                                >
                                    {zone.name}
                                </button>
                            ))}
                        </div>

                        <div className={`flex-1 p-8 overflow-y-auto min-h-0 ${theme.bg}`}>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {tables.filter(t => t.zone === activeZone).map(table => (
                                    <button
                                        key={table.id}
                                        onClick={() => handleTableClick(table)}
                                        className={`
                      h-44 rounded-[24px] flex flex-col items-center justify-center border transition-all relative group
                      ${table.status === 'occupied'
                                                ? 'bg-red-500/10 border-red-500/50 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                                : `${darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-100'} hover:border-emerald-500 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]`
                                            }
                      ${currentTableData?.id === table.id ? 'ring-4 ring-orange-500/50 border-orange-500' : ''}
                      active:scale-95 duration-200
                    `}
                                    >
                                        <span className={`text-4xl font-black mb-3 ${table.status === 'occupied' ? (darkMode ? 'text-red-400' : 'text-slate-800') : (darkMode ? 'text-slate-200' : 'text-slate-600')}`}>{table.name}</span>
                                        {table.status === 'occupied' ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">Occupied</span>
                                                <span className={`text-sm font-bold ${darkMode ? 'text-red-300' : 'text-slate-700'}`}>฿{table.currentBill.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}</span>
                                            </div>
                                        ) : (
                                            <span className="bg-emerald-500/20 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide group-hover:bg-emerald-500 group-hover:text-white transition-colors">Available</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================= MODAL: ACTION ======================= */}
            {showActionModal && actionTableData && (
                <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 duration-200 ${theme.modalOverlay}`}>
                    <div className={`${theme.modalBg} w-full max-w-md rounded-[32px] shadow-2xl p-8 relative ring-1 ring-white/10`}>
                        <button onClick={() => setShowActionModal(false)} className={`absolute top-6 right-6 p-2 rounded-full ${theme.textSec} hover:bg-white/10 transition-colors`}><X size={24} /></button>
                        <div className="text-center mb-10">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black shadow-inner ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
                                {actionTableData.name}
                            </div>
                            <h2 className="text-2xl font-bold">จัดการโต๊ะ {actionTableData.name}</h2>
                            <p className={`${theme.textSec} mt-2`}>สถานะปัจจุบัน: <span className="text-orange-500 font-bold">ลูกค้ากำลังทาน</span></p>
                        </div>
                        <div className="space-y-4">
                            <button onClick={handleAddMoreOrder} className="w-full flex items-center justify-center gap-4 p-5 bg-orange-600 text-white rounded-2xl hover:bg-orange-500 transition-all font-bold text-lg shadow-lg active:scale-95">
                                <Utensils size={24} /> สั่งอาหารเพิ่ม
                            </button>
                            <button onClick={handleOpenPayment} className={`w-full flex items-center justify-center gap-4 p-5 border rounded-2xl transition-all font-bold text-lg active:scale-95 ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'}`}>
                                <Receipt size={24} /> เช็คบิล / ชำระเงิน
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================= MODAL: PAYMENT ======================= */}
            {showPaymentModal && actionTableData && (
                <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 animate-in slide-in-from-bottom-8 duration-300 ${theme.modalOverlay}`}>
                    <div className={`${theme.modalBg} w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/10`}>
                        <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-900'} text-white p-6 flex justify-between items-center flex-shrink-0`}>
                            <div><h2 className="text-2xl font-bold">ชำระเงิน</h2><p className="text-slate-400 text-sm mt-1">โต๊ะ {actionTableData.name} • {actionTableData.zone}</p></div>
                            <button onClick={() => setShowPaymentModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"><X size={20} /></button>
                        </div>
                        <div className={`flex-1 overflow-y-auto p-6 min-h-0 ${theme.bg}`}>
                            <div className={`${theme.card} p-5 rounded-2xl shadow-sm space-y-4`}>
                                {actionTableData.currentBill.map((item, idx) => (
                                    <div key={idx} className={`flex justify-between border-b border-dashed pb-3 last:border-0 last:pb-0 ${theme.border}`}>
                                        <div><div className="font-bold">{item.name}</div><div className={`text-xs font-medium mt-0.5 ${theme.textSec}`}>จำนวน x {item.quantity}</div></div>
                                        <div className="font-bold">฿{(item.price * item.quantity).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                            <div className={`mt-6 space-y-3 p-5 rounded-2xl border ${theme.card}`}>
                                <div className={`flex justify-between text-sm ${theme.textSec}`}><span>รวมค่าอาหาร</span><span>฿{actionTableData.currentBill.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}</span></div>
                                <div className={`flex justify-between text-sm ${theme.textSec}`}><span>VAT (7%)</span><span>฿{(actionTableData.currentBill.reduce((sum, i) => sum + (i.price * i.quantity), 0) * 0.07).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                <div className={`flex justify-between items-center pt-4 mt-2 border-t ${theme.border}`}>
                                    <span className="text-lg font-bold">ยอดสุทธิ</span>
                                    <span className="text-3xl font-black text-orange-500">฿{(actionTableData.currentBill.reduce((sum, i) => sum + (i.price * i.quantity), 0) * 1.07).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                        </div>
                        <div className={`p-6 border-t space-y-4 flex-shrink-0 ${theme.bgSec} ${theme.border}`}>
                            <div className="grid grid-cols-3 gap-3">
                                {['เงินสด', 'QR Code', 'เครดิต'].map((m, i) => (
                                    <button key={i} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all font-bold text-xs gap-2 active:scale-95 ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-orange-500 hover:text-orange-500' : 'bg-slate-50 hover:bg-orange-50 hover:text-orange-600 border-transparent hover:border-orange-200'}`}>
                                        {i === 0 ? <Banknote size={20} /> : i === 1 ? <QrCode size={20} /> : <CreditCard size={20} />} {m}
                                    </button>
                                ))}
                            </div>
                            <button onClick={handlePayment} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">ยืนยันการรับเงิน</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================= MAIN UI ======================= */}

            {/* LEFT: Menu Selection */}
            <div className={`flex-1 flex flex-col h-full z-0 overflow-hidden relative ${theme.bg}`}>
                {/* Header */}
                <div className={`px-8 py-6 flex items-center justify-between flex-shrink-0 ${theme.bg}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3.5 rounded-2xl shadow-sm ring-1 ring-white/10 ${darkMode ? 'bg-slate-800 text-orange-500' : 'bg-white text-slate-800'}`}>
                            <ChefHat size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">POS System</h1>
                            <p className={`text-sm font-medium ${theme.textSec}`}>ระบบจัดการร้านอาหาร</p>
                        </div>
                    </div>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-3 rounded-full transition-all ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-slate-400 hover:bg-gray-100 shadow-sm'}`}
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="px-8 pb-4 flex-shrink-0">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((cat) => (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap shadow-sm border 
                ${selectedCategory === cat.id ? theme.tabActive : theme.tabInactive}`}>
                                {cat.icon} {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2 scrollbar-thin min-h-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {filteredItems.map((item) => (
                            <button key={item.id} onClick={() => addToCart(item)}
                                className={`relative group overflow-hidden rounded-[28px] p-6 h-48 text-left transition-all duration-300 border ${theme.card} hover:-translate-y-1 active:scale-95 shadow-sm`}>
                                {/* Glow Effect */}
                                <div className={`absolute inset-0 opacity-5 ${item.category === 'Food' ? 'bg-orange-500' : item.category === 'Drink' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>

                                <div className="flex flex-col justify-between h-full relative z-10">
                                    <span className="font-extrabold text-lg leading-snug pr-2">{item.name}</span>
                                    <div className="flex justify-between items-end">
                                        <span className={`backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide ${darkMode ? 'bg-slate-800/50 text-slate-300' : 'bg-white/60 text-slate-600'}`}>{item.category}</span>
                                        <span className={`font-black text-2xl ${darkMode ? 'text-white' : 'text-slate-900'}`}>฿{item.price}</span>
                                    </div>
                                </div>
                                {/* Decoration */}
                                <div className={`absolute -bottom-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-20 transition-transform duration-500 group-hover:scale-150 ${item.category === 'Food' ? 'bg-orange-400' : item.category === 'Drink' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Cart */}
            <div className={`w-[440px] flex flex-col h-full border-l z-10 shadow-2xl overflow-hidden transition-colors duration-300 ${theme.bgSec} ${theme.border}`}>

                {/* Header: Table Info */}
                <div className={`p-6 border-b z-20 flex-shrink-0 ${theme.bgSec} ${theme.border}`}>
                    <button onClick={() => setShowTableModal(true)}
                        className={`w-full py-4 px-5 rounded-2xl border-2 border-dashed flex items-center justify-between transition-all group relative overflow-hidden
            ${currentTableData
                                ? 'border-orange-500 bg-orange-500/5 text-orange-500'
                                : `${theme.border} ${theme.textSec} hover:border-orange-400 hover:text-orange-500`}`}>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`p-2.5 rounded-xl shadow-sm ${currentTableData ? 'bg-orange-500 text-white' : (darkMode ? 'bg-slate-800' : 'bg-slate-100')}`}><MapPin size={22} /></div>
                            <div className="text-left">
                                {currentTableData ? (
                                    <>
                                        <div className={`font-black text-lg leading-none mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>โต๊ะ {currentTableData.name}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
                                            {currentTableData.status === 'occupied' ? <><span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> สั่งอาหารเพิ่ม</> : 'เปิดโต๊ะใหม่'}
                                        </div>
                                    </>
                                ) : <span className="font-bold text-lg">แตะเพื่อเลือกโต๊ะ</span>}
                            </div>
                        </div>
                        {currentTableData && <div className={`p-2 rounded-full shadow-sm text-orange-500 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}><ArrowRight size={18} /></div>}
                    </button>
                </div>

                {/* Cart List */}
                <div className={`flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin min-h-0 ${theme.bgSec}`}>
                    {cart.length === 0 ? (
                        <div className={`h-full flex flex-col items-center justify-center ${theme.textSec} opacity-50`}>
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}><ShoppingCart size={32} /></div>
                            <p className="font-bold text-lg">รายการว่างเปล่า</p>
                            <p className="text-sm">เลือกเมนูทางซ้ายเพื่อเริ่มรายการ</p>
                        </div>
                    ) : (
                        <>
                            {currentTableData?.status === 'occupied' && (
                                <div className="bg-blue-500/10 text-blue-500 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-500/20 shadow-sm animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={16} /> รายการสั่งเพิ่ม (แยกบิลจากรอบก่อน)
                                </div>
                            )}
                            {cart.map((item) => (
                                <div key={item.id} className={`p-2 rounded-2xl group relative transition-colors border border-transparent ${theme.hover} ${theme.bgSec}`}>
                                    <div className="flex gap-4">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-sm flex-shrink-0 ${item.category === 'Food' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                            {item.name.charAt(0)}
                                        </div>

                                        <div className="flex-1 py-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className={`font-bold text-sm leading-tight pr-4 ${theme.text}`}>{item.name}</h4>
                                                <p className={`font-black text-sm ${theme.text}`}>฿{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className={`flex items-center gap-3 rounded-lg p-1 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                                    <button onClick={() => decreaseQuantity(item.id)} className={`w-6 h-6 flex items-center justify-center rounded-md shadow-sm transition-all ${darkMode ? 'bg-slate-700 hover:text-red-400' : 'bg-white hover:text-red-500'} active:scale-90`}><Minus size={14} /></button>
                                                    <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                                                    <button onClick={() => addToCart(item)} className={`w-6 h-6 flex items-center justify-center rounded-md shadow-sm transition-all ${darkMode ? 'bg-slate-700 hover:text-green-400' : 'bg-white hover:text-green-500'} active:scale-90`}><Plus size={14} /></button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-all hover:bg-red-500/10"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2 pl-[76px]">
                                        <div className="relative">
                                            <Pencil size={12} className={`absolute left-3 top-2.5 ${theme.textSec}`} />
                                            <input type="text" placeholder="ระบุหมายเหตุ..." className={`w-full text-xs py-2 pl-8 pr-3 rounded-lg border focus:outline-none transition-all ${theme.input}`} value={item.note || ''} onChange={(e) => updateItemNote(item.id, e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="h-4"></div>
                        </>
                    )}
                </div>

                {/* Footer (Fixed) */}
                <div className={`p-6 border-t shadow-lg z-30 flex-shrink-0 ${theme.bgSec} ${theme.border}`}>
                    <div className="space-y-3 mb-5">
                        <div className={`flex justify-between items-center text-xs font-bold uppercase tracking-wide ${theme.textSec}`}>
                            <span>สรุปรายการ</span>
                            <span>{cart.reduce((acc, i) => acc + i.quantity, 0)} รายการ</span>
                        </div>
                        <div className={`flex justify-between items-center p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-slate-100'}`}>
                            <span className={`text-base font-bold ${theme.text}`}>ยอดรวมสุทธิ</span>
                            <span className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>฿{getTotalPrice().toLocaleString()}</span>
                        </div>
                    </div>
                    <button
                        disabled={cart.length === 0 || !currentTableData}
                        onClick={handleSubmitOrder}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3
              ${cart.length === 0 || !currentTableData
                                ? `${darkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'} cursor-not-allowed shadow-none`
                                : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/30'
                            }
            `}
                    >
                        {currentTableData?.status === 'occupied'
                            ? <><Utensils size={20} /> ยืนยันสั่งเพิ่ม</>
                            : <><Receipt size={20} /> ยืนยันเปิดโต๊ะ</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}