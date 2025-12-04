import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export const useAuthStore = create((set) => ({
    user: null,
    loading: true, // เอาไว้โชว์ Loading ตอนเข้าเว็บครั้งแรก
    error: null,

    // ฟังก์ชัน Login
    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            set({ user: userCredential.user, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error; // ส่ง error กลับไปให้หน้า UI จัดการต่อ
        }
    },

    // ฟังก์ชัน Logout
    logout: async () => {
        await signOut(auth);
        set({ user: null });
    },

    // ฟังก์ชันเช็คสถานะตอนรีเฟรชหน้าเว็บ (สำคัญมาก ไม่งั้นรีเฟรชแล้วหลุด)
    initAuthListener: () => {
        set({ loading: true });
        onAuthStateChanged(auth, (user) => {
            set({ user, loading: false });
        });
    }
}));