import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
    cart: [],
    selectedTable: null,

    // เลือกโต๊ะ
    setTable: (table) => set({ selectedTable: table }),

    // เพิ่มของ
    addToCart: (product) => {
        const { cart } = get();
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            set({ cart: cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) });
        } else {
            set({ cart: [...cart, { ...product, quantity: 1, note: '' }] });
        }
    },

    // ลดจำนวน
    decreaseQuantity: (id) => {
        const { cart } = get();
        const existing = cart.find(item => item.id === id);
        if (existing?.quantity > 1) {
            set({ cart: cart.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item) });
        } else {
            set({ cart: cart.filter(item => item.id !== id) });
        }
    },

    // ลบรายการ
    removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(item => item.id !== id)
    })),

    // อัปเดต Note
    updateItemNote: (id, note) => set((state) => ({
        cart: state.cart.map(item => item.id === id ? { ...item, note } : item)
    })),

    // ราคารวม
    getTotalPrice: () => get().cart.reduce((total, item) => total + (item.price * item.quantity), 0),

    // --- ส่วนที่แก้ไขบั๊ก ---

    // 1. ล้างเฉพาะตะกร้า (โต๊ะยังอยู่) -> ใช้ตอนจะสั่งเพิ่ม หรือเปลี่ยนเมนู
    clearCart: () => set({ cart: [] }),

    // 2. ล้างทุกอย่าง (จบงาน) -> ใช้ตอนส่งออเดอร์เสร็จ หรือเช็คบิลเสร็จ
    resetOrder: () => set({ cart: [], selectedTable: null }),
}));