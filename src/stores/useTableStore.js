import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, doc, updateDoc, onSnapshot, writeBatch, addDoc } from 'firebase/firestore';

const INITIAL_TABLES_DATA = [
    { id: 'T-01', name: 'T-01', zone: 'indoor', status: 'available', currentBill: [] },
    { id: 'T-02', name: 'T-02', zone: 'indoor', status: 'available', currentBill: [] },
    { id: 'T-03', name: 'T-03', zone: 'indoor', status: 'available', currentBill: [] },
    { id: 'T-04', name: 'T-04', zone: 'indoor', status: 'available', currentBill: [] },
    { id: 'T-05', name: 'T-05', zone: 'indoor', status: 'available', currentBill: [] },
    { id: 'T-06', name: 'T-06', zone: 'indoor', status: 'available', currentBill: [] },
    { id: 'O-01', name: 'O-01', zone: 'outdoor', status: 'available', currentBill: [] },
    { id: 'O-02', name: 'O-02', zone: 'outdoor', status: 'available', currentBill: [] },
    { id: 'O-03', name: 'O-03', zone: 'outdoor', status: 'available', currentBill: [] },
    { id: 'O-04', name: 'O-04', zone: 'outdoor', status: 'available', currentBill: [] },
];

export const useTableStore = create((set, get) => ({
    tables: [],
    loading: true,
    lastOrderTime: 0,
    unsubscribe: null,

    // 1. Subscribe
    subscribeToTables: () => {
        if (get().unsubscribe) get().unsubscribe();
        const q = collection(db, "tables");
        const unsub = onSnapshot(q, (snapshot) => {
            const tablesData = [];
            let maxTime = get().lastOrderTime;
            snapshot.forEach((doc) => {
                const data = doc.data();
                tablesData.push({ id: doc.id, ...data });
                if (data.currentBill) {
                    data.currentBill.forEach(item => {
                        // เช็คเฉพาะที่ยังไม่เสร็จและไม่ยกเลิก
                        if (item.status !== 'cancelled' && item.status !== 'served') {
                            const time = new Date(item.orderedAt).getTime();
                            if (time > maxTime) maxTime = time;
                        }
                    });
                }
            });
            tablesData.sort((a, b) => a.id.localeCompare(b.id));
            set({ tables: tablesData, loading: false, lastOrderTime: maxTime });
        });
        set({ unsubscribe: unsub });
    },

    // 2. Reset DB
    resetDatabase: async () => {
        if (!confirm('ยืนยันรีเซ็ตข้อมูลโต๊ะ?')) return;
        set({ loading: true });
        try {
            const batch = writeBatch(db);
            INITIAL_TABLES_DATA.forEach((table) => {
                const docRef = doc(db, "tables", table.id);
                batch.set(docRef, table);
            });
            await batch.commit();
            alert("รีเซ็ตเรียบร้อย!");
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            set({ loading: false });
        }
    },

    // 3. Occupy
    occupyTable: async (tableId, orderItems) => {
        const tableRef = doc(db, "tables", tableId);
        const newItems = orderItems.map(item => ({
            ...item, status: 'waiting', orderedAt: new Date().toISOString()
        }));
        await updateDoc(tableRef, { status: 'occupied', currentBill: newItems });
    },

    // 4. Append
    appendOrder: async (tableId, newItems) => {
        const currentTable = get().tables.find(t => t.id === tableId);
        if (!currentTable) return;
        const itemsToAdd = newItems.map(item => ({
            ...item, status: 'waiting', orderedAt: new Date().toISOString()
        }));
        const tableRef = doc(db, "tables", tableId);
        await updateDoc(tableRef, { currentBill: [...currentTable.currentBill, ...itemsToAdd] });
    },

    // 5. Update Status
    updateOrderItemStatus: async (tableId, itemIndex, newStatus) => {
        const currentTable = get().tables.find(t => t.id === tableId);
        if (!currentTable) return;
        const updatedBill = [...currentTable.currentBill];
        updatedBill[itemIndex] = { ...updatedBill[itemIndex], status: newStatus };
        const tableRef = doc(db, "tables", tableId);
        await updateDoc(tableRef, { currentBill: updatedBill });
    },

    // *** 6. ยกเลิกออเดอร์ (NEW Feature) ***
    cancelOrderItem: async (tableId, itemIndex) => {
        if (!confirm('ยืนยันยกเลิกรายการนี้?')) return;

        const currentTable = get().tables.find(t => t.id === tableId);
        if (!currentTable) return;

        const updatedBill = [...currentTable.currentBill];
        // เปลี่ยนสถานะเป็น cancelled
        updatedBill[itemIndex] = { ...updatedBill[itemIndex], status: 'cancelled' };

        const tableRef = doc(db, "tables", tableId);
        await updateDoc(tableRef, { currentBill: updatedBill });
    },

    // 7. Clear Table (คิดเงินเฉพาะรายการที่ไม่ใช่ cancelled)
    clearTable: async (tableId) => {
        const tableRef = doc(db, "tables", tableId);
        const currentTable = get().tables.find(t => t.id === tableId);

        if (currentTable && currentTable.currentBill.length > 0) {
            // กรองรายการที่ถูกยกเลิกออกจากการคำนวณเงิน
            const validItems = currentTable.currentBill.filter(item => item.status !== 'cancelled');

            if (validItems.length > 0) {
                try {
                    const totalAmount = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    await addDoc(collection(db, "bills"), {
                        tableId: currentTable.id,
                        tableName: currentTable.name,
                        items: validItems,
                        totalAmount: totalAmount,
                        timestamp: new Date().toISOString(),
                    });
                } catch (error) {
                    console.error("Error saving history:", error);
                }
            }
        }
        await updateDoc(tableRef, { status: 'available', currentBill: [] });
    }
}));