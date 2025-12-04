import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { ChefHat, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/pos'); // ล็อกอินผ่านให้ไปหน้า POS
        } catch (err) {
            console.error("Login failed:", err);
            // Error message จะถูกจัดการใน Store และแสดงผลด้านล่าง
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="bg-orange-600 p-8 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <ChefHat size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">POS System</h1>
                    <p className="text-orange-100 mt-2 font-medium">เข้าสู่ระบบจัดการร้านอาหาร</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start gap-2 text-sm font-bold animate-pulse">
                                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                                <span>อีเมลหรือรหัสผ่านไม่ถูกต้อง</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">อีเมลผู้ใช้งาน</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@restaurant.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-slate-800"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">รหัสผ่าน</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-slate-800"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-pulse">กำลังตรวจสอบ...</span>
                            ) : (
                                <>เข้าสู่ระบบ <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                            ลืมรหัสผ่าน? กรุณาติดต่อผู้ดูแลระบบ (IT Support)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}