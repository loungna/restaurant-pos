import { create } from 'zustand';

// Mock Data
const INITIAL_TABLES = [
    { id: 'T-01', name: 'T-01', zone: 'indoor', status: 'available', currentBill: [] },
    {
        id: 'T-02', name: 'T-02', zone: 'indoor', status: 'occupied', currentBill: [
            { id: 101, name: 'ข้าวกะเพราเนื้อวากิว', price: 189, quantity: 1, status: 'served', orderedAt: new Date().toISOString() },
        ]
    },
    { id: 'T-03', name: 'T-03', zone: 'indoor', status: 'available', currentBill: [] },
    { id: 'T-04', name: 'T-04', zone: 'indoor', status: 'available', currentBill: [] },
    { id: 'O-01', name: 'O-01', zone: 'outdoor', status: 'available', currentBill: [] },
    { id: 'O-02', name: 'O-02', zone: 'outdoor', status: 'available', currentBill: [] },
];

export const useTableStore = create((set, get) => ({
    tables: INITIAL_TABLES,
    lastOrderTime: 0,

    // 1. เปิดโต๊ะใหม่ (ต้องเป็นโต๊ะว่างเท่านั้น)
    occupyTable: (tableId, orderItems) => set((state) => ({
        tables: state.tables.map(t =>
            t.id === tableId
                ? {
                    ...t,
                    status: 'occupied',
                    currentBill: orderItems.map(item => ({
                        ...item,
                        status: 'waiting',
                        orderedAt: new Date().toISOString()
                    }))
                }
                : t
        ),
        lastOrderTime: Date.now()
    })),

    // 2. สั่งเพิ่ม (Append ต่อท้ายบิลเดิม)
    appendOrder: (tableId, newItems) => set((state) => ({
        tables: state.tables.map(t =>
            t.id === tableId
                ? {
                    ...t,
                    currentBill: [
                        ...t.currentBill, // ของเก่าเก็บไว้
                        ...newItems.map(item => ({ // ของใหม่ต่อท้าย
                            ...item,
                            status: 'waiting',
                            orderedAt: new Date().toISOString()
                        }))
                    ]
                }
                : t
        ),
        lastOrderTime: Date.now()
    })),

    // 3. เช็คบิล (เคลียร์โต๊ะ)
    clearTable: (tableId) => set((state) => ({
        tables: state.tables.map(t =>
            t.id === tableId ? { ...t, status: 'available', currentBill: [] } : t
        )
    })),

    // 4. อัปเดตสถานะ (สำหรับครัว)
    updateOrderItemStatus: (tableId, itemIndex, newStatus) => set((state) => ({
        tables: state.tables.map(t =>
            t.id === tableId
                ? {
                    ...t,
                    currentBill: t.currentBill.map((item, idx) =>
                        idx === itemIndex ? { ...item, status: newStatus } : item
                    )
                }
                : t
        )
    })),
}));