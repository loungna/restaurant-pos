import React, { useState } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { useTableStore } from '../../stores/useTableStore';
import { MENU_ITEMS } from '../../data/menu';
import { ZONES } from '../../data/tables';
import {
    ShoppingCart, Plus, Minus, ChefHat, LayoutGrid, UtensilsCrossed,
    IceCream, Coffee, Wine, MapPin, X, Pencil, Receipt, CreditCard,
    Banknote, QrCode, ArrowRight, Trash2, AlertCircle
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

    // State สำหรับเก็บ ID โต๊ะที่จะทำรายการ Action/Payment
    const [actionTableId, setActionTableId] = useState(null);

    // Helper Data
    const currentTableData = selectedTable ? tables.find(t => t.id === selectedTable.id) : null;
    const actionTableData = actionTableId ? tables.find(t => t.id === actionTableId) : null;

    // --- DEFINITIONS (ส่วนที่เพิ่มกลับมาครับ) ---
    const categories = [
        { id: 'All', label: 'ทั้งหมด', icon: <LayoutGrid size={18} /> },
        { id: 'Food', label: 'จานหลัก', icon: <UtensilsCrossed size={18} /> },
        { id: 'Appetizer', label: 'ทานเล่น', icon: <IceCream size={18} /> },
        { id: 'Drink', label: 'เครื่องดื่ม', icon: <Coffee size={18} /> },
        { id: 'Alcohol', label: 'แอลกอฮอล์', icon: <Wine size={18} /> },
    ];

    const filteredItems = selectedCategory === 'All' ? MENU_ITEMS : MENU_ITEMS.filter(item => item.category === selectedCategory);

    // --- Handlers ---

    // 1. กดเลือกโต๊ะ
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

    // 2. สั่งเพิ่ม
    const handleAddMoreOrder = () => {
        const tableToEdit = tables.find(t => t.id === actionTableId);
        if (tableToEdit) {
            clearCart();
            setTable(tableToEdit);
        }
        setShowActionModal(false);
    };

    // 3. จ่ายเงิน
    const handleOpenPayment = () => {
        setShowPaymentModal(true);
        setShowActionModal(false);
    };

    // 4. ยืนยันส่งออเดอร์
    const handleSubmitOrder = () => {
        if (!currentTableData || cart.length === 0) return;

        if (currentTableData.status === 'available') {
            occupyTable(currentTableData.id, cart); // เปิดโต๊ะ
        } else {
            appendOrder(currentTableData.id, cart); // สั่งเพิ่ม
        }

        resetOrder();
        alert(`ส่งออเดอร์เรียบร้อย!`);
    };

    // 5. รับเงิน
    const handlePayment = () => {
        if (!actionTableId) return;
        clearTable(actionTableId);
        setShowPaymentModal(false);
        setActionTableId(null);
        resetOrder();
    };

    return (
        <div className="flex h-full w-full overflow-hidden bg-gray-100 font-sans text-slate-800">

            {/* ======================= MODAL: TABLE MAP ======================= */}
            {showTableModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b flex justify-between items-center bg-white flex-shrink-0">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <MapPin className="text-orange-600" /> เลือกโต๊ะที่นั่ง
                            </h2>
                            <button onClick={() => setShowTableModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={28} /></button>
                        </div>

                        <div className="flex p-4 gap-3 justify-center bg-slate-50 border-b flex-shrink-0">
                            {ZONES.map(zone => (
                                <button
                                    key={zone.id} onClick={() => setActiveZone(zone.id)}
                                    className={`px-6 py-2 rounded-xl font-bold transition-all border-2 ${activeZone === zone.id ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-transparent text-slate-500 hover:bg-slate-200'}`}
                                >
                                    {zone.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 p-8 bg-slate-100 overflow-y-auto min-h-0">
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {tables.filter(t => t.zone === activeZone).map(table => (
                                    <button
                                        key={table.id}
                                        onClick={() => handleTableClick(table)}
                                        className={`
                      h-40 rounded-3xl flex flex-col items-center justify-center border-4 transition-all relative shadow-sm hover:-translate-y-1 hover:shadow-lg
                      ${table.status === 'occupied'
                                                ? 'bg-white border-red-500 text-red-600'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-green-500 hover:text-green-600'
                                            }
                      ${currentTableData?.id === table.id ? 'ring-4 ring-orange-400 scale-105 shadow-xl' : ''}
                    `}
                                    >
                                        <span className="text-4xl font-black mb-2">{table.name}</span>
                                        {table.status === 'occupied' ? (
                                            <div className="flex flex-col items-center">
                                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold mb-1">ไม่ว่าง</span>
                                                <span className="text-sm font-bold text-slate-800">฿{table.currentBill.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}</span>
                                            </div>
                                        ) : (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">ว่าง</span>
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
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative">
                        <button onClick={() => setShowActionModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
                        <div className="text-center mb-8">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-black text-slate-700 border-4 border-white shadow-xl">
                                {actionTableData.name}
                            </div>
                            <h2 className="text-2xl font-bold">จัดการโต๊ะ {actionTableData.name}</h2>
                            <p className="text-slate-500">สถานะ: <span className="text-red-500 font-bold">ลูกค้ากำลังทาน</span></p>
                        </div>
                        <div className="space-y-4">
                            <button onClick={handleAddMoreOrder} className="w-full flex items-center justify-center gap-3 p-5 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all font-bold text-lg shadow-lg hover:shadow-orange-200">
                                <ChefHat size={24} /> สั่งอาหารเพิ่ม
                            </button>
                            <button onClick={handleOpenPayment} className="w-full flex items-center justify-center gap-3 p-5 bg-slate-100 text-slate-800 rounded-2xl hover:bg-slate-200 transition-all font-bold text-lg">
                                <Receipt size={24} /> เช็คบิล
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================= MODAL: PAYMENT ======================= */}
            {showPaymentModal && actionTableData && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-slate-900 text-white p-6 flex justify-between items-center flex-shrink-0">
                            <div><h2 className="text-2xl font-bold">ชำระเงิน</h2><p className="text-slate-400">โต๊ะ: {actionTableData.name}</p></div>
                            <button onClick={() => setShowPaymentModal(false)} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 min-h-0">
                            <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                                {actionTableData.currentBill.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-slate-700 border-b border-dashed border-slate-100 pb-2 last:border-0">
                                        <div><div className="font-bold">{item.name}</div><div className="text-xs text-slate-400">x {item.quantity}</div></div>
                                        <div className="font-bold">฿{item.price * item.quantity}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 space-y-2">
                                <div className="flex justify-between text-slate-500"><span>รวมค่าอาหาร</span><span>฿{actionTableData.currentBill.reduce((sum, i) => sum + (i.price * i.quantity), 0)}</span></div>
                                <div className="flex justify-between text-slate-500"><span>VAT (7%)</span><span>฿{(actionTableData.currentBill.reduce((sum, i) => sum + (i.price * i.quantity), 0) * 0.07).toFixed(2)}</span></div>
                                <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-200">
                                    <span className="text-xl font-bold">ยอดสุทธิ</span>
                                    <span className="text-4xl font-black text-orange-600">฿{(actionTableData.currentBill.reduce((sum, i) => sum + (i.price * i.quantity), 0) * 1.07).toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-white border-t border-slate-100 space-y-4 flex-shrink-0">
                            <div className="grid grid-cols-3 gap-3">
                                {['เงินสด', 'QR Code', 'บัตรเครดิต'].map((m, i) => (
                                    <button key={i} className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl hover:bg-orange-50 hover:text-orange-600 border border-transparent hover:border-orange-200 transition-all font-bold text-xs gap-2">
                                        {i === 0 ? <Banknote /> : i === 1 ? <QrCode /> : <CreditCard />} {m}
                                    </button>
                                ))}
                            </div>
                            <button onClick={handlePayment} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 shadow-lg">ยืนยันรับเงิน</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================= MAIN UI ======================= */}

            {/* LEFT: Menu Selection */}
            <div className="flex-1 flex flex-col h-full bg-white shadow-xl z-0 overflow-hidden">
                <div className="px-6 py-4 flex items-center gap-4 bg-white border-b border-slate-100 flex-shrink-0">
                    <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg"><ChefHat size={28} /></div>
                    <div><h1 className="text-2xl font-extrabold text-slate-800">POS System</h1></div>
                </div>

                {/* Category Tabs */}
                <div className="px-6 py-4 flex-shrink-0">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((cat) => (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap shadow-sm border 
                ${selectedCategory === cat.id ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-105' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                {cat.icon} {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 scrollbar-thin min-h-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredItems.map((item) => (
                            <button key={item.id} onClick={() => addToCart(item)}
                                className={`relative group overflow-hidden rounded-3xl p-5 h-44 text-left transition-all duration-300 ${item.color} hover:shadow-xl hover:-translate-y-1 active:scale-95 border-4 border-white ring-1 ring-slate-100`}>
                                <div className="flex flex-col justify-between h-full relative z-10">
                                    <span className="font-extrabold text-slate-800 text-lg leading-tight pr-4">{item.name}</span>
                                    <div className="flex justify-between items-end">
                                        <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-slate-600">{item.category}</span>
                                        <span className="font-black text-slate-900 text-xl bg-white/60 px-3 py-1 rounded-xl">฿{item.price}</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Cart & Footer */}
            <div className="w-[420px] bg-slate-50 flex flex-col h-full border-l border-slate-200 z-10 shadow-2xl overflow-hidden relative">

                {/* 1. Header (Fixed Top) */}
                <div className="p-4 bg-white border-b border-slate-100 shadow-sm z-20 flex-shrink-0">
                    <button onClick={() => setShowTableModal(true)}
                        className={`w-full py-3 px-4 rounded-xl border-2 border-dashed flex items-center justify-between transition-all group relative overflow-hidden
            ${currentTableData ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-slate-300 text-slate-400 hover:border-orange-400 hover:text-orange-500'}`}>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className={`p-2 rounded-full ${currentTableData ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}><MapPin size={20} /></div>
                            <div className="text-left">
                                {currentTableData ? (
                                    <>
                                        <div className="font-black text-base">โต๊ะ {currentTableData.name}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                                            {currentTableData.status === 'occupied' ? 'สั่งอาหารเพิ่ม' : 'เปิดโต๊ะใหม่'}
                                        </div>
                                    </>
                                ) : <span className="font-bold text-base">แตะเพื่อเลือกโต๊ะ</span>}
                            </div>
                        </div>
                        {currentTableData && <ArrowRight size={18} className="text-orange-500" />}
                    </button>
                </div>

                {/* 2. Cart List (Flexible Height + Scroll) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin min-h-0 bg-slate-50">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                            <ShoppingCart size={64} className="mb-4 text-slate-300" />
                            <p className="font-bold text-lg">ตะกร้าว่างเปล่า</p>
                            <p className="text-sm">เลือกรายการเพื่อเริ่มสั่ง</p>
                        </div>
                    ) : (
                        <>
                            {currentTableData?.status === 'occupied' && (
                                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100 mb-2">
                                    <AlertCircle size={14} /> รายการสั่งเพิ่ม (แยกบิล)
                                </div>
                            )}
                            {cart.map((item) => (
                                <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 group relative">
                                    <button onClick={() => removeFromCart(item.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 pr-6">
                                            <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.name}</h4>
                                            <p className="text-orange-600 font-bold mt-1 text-sm">฿{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
                                            <button onClick={() => decreaseQuantity(item.id)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-red-600"><Minus size={14} /></button>
                                            <span className="font-bold w-6 text-center text-slate-800 text-sm">{item.quantity}</span>
                                            <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center bg-orange-600 rounded-md shadow-sm text-white hover:bg-orange-700"><Plus size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="relative mt-1">
                                        <Pencil size={12} className="absolute left-3 top-2.5 text-slate-400" />
                                        <input type="text" placeholder="หมายเหตุ..." className="w-full bg-slate-50 text-xs py-2 pl-8 pr-3 rounded-lg border border-slate-200 focus:outline-none focus:border-orange-400 text-slate-700" value={item.note || ''} onChange={(e) => updateItemNote(item.id, e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            {/* พื้นที่ว่างกันชนด้านล่าง เพื่อไม่ให้รายการสุดท้ายโดนบัง */}
                            <div className="h-2"></div>
                        </>
                    )}
                </div>

                {/* 3. Footer (Fixed Bottom & Compact) */}
                <div className="bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30 flex-shrink-0">
                    <div className="p-4 space-y-3">
                        {/* Summary Rows */}
                        <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
                            <span>จำนวน {cart.reduce((acc, i) => acc + i.quantity, 0)} รายการ</span>
                            <span>VAT 7% รวมในราคาแล้ว</span>
                        </div>

                        {/* Total Price Row */}
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-base font-bold text-slate-700">ยอดรวมสุทธิ</span>
                            <span className="text-2xl font-black text-orange-600">฿{getTotalPrice().toLocaleString()}</span>
                        </div>

                        {/* Action Button */}
                        <button
                            disabled={cart.length === 0 || !currentTableData}
                            onClick={handleSubmitOrder}
                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {currentTableData?.status === 'occupied' ? (
                                <> <Plus size={20} /> ยืนยันสั่งเพิ่ม </>
                            ) : (
                                <> <Receipt size={20} /> ยืนยันเปิดโต๊ะ </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}