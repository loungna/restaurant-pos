import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuthStore();

    if (loading) {
        // แสดงหน้าโหลดระหว่างเช็คว่าล็อกอินหรือยัง
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (!user) {
        // ถ้าไม่มี user ให้เด้งไปหน้า login
        return <Navigate to="/login" replace />;
    }

    // ถ้าผ่านหมด ให้แสดงเนื้อหาข้างใน (POS/Kitchen/Admin)
    return children;
}