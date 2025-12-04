import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Monitor, ChefHat, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuthStore } from './stores/useAuthStore';
import { useTableStore } from './stores/useTableStore';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './features/auth/LoginPage';
import POSPage from './features/pos/POSPage';
import KitchenPage from './features/kitchen/KitchenPage';
import AdminPage from './features/admin/AdminPage';

function App() {
  const { initAuthListener, user, logout } = useAuthStore();
  const { subscribeToTables } = useTableStore();

  useEffect(() => {
    initAuthListener();
    subscribeToTables(); // เริ่มดึงข้อมูล Real-time
  }, [initAuthListener, subscribeToTables]);

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen bg-gray-100">

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/pos" /> : <LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Navigate to="/pos" replace /></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
            <Route path="/kitchen" element={<ProtectedRoute><KitchenPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          </Routes>
        </div>

        {/* Navigation Bar */}
        {user && (
          <div className="bg-slate-900 text-slate-400 p-2 flex justify-center items-center gap-6 border-t border-slate-800 z-50 flex-shrink-0">
            <NavLink to="/pos" className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:text-white transition-all ${isActive ? 'text-orange-500 bg-slate-800' : ''}`}><Monitor size={20} /><span className="text-[10px] font-bold uppercase tracking-wider">POS</span></NavLink>
            <NavLink to="/kitchen" className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:text-white transition-all ${isActive ? 'text-orange-500 bg-slate-800' : ''}`}><ChefHat size={20} /><span className="text-[10px] font-bold uppercase tracking-wider">Kitchen</span></NavLink>
            <NavLink to="/admin" className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:text-white transition-all ${isActive ? 'text-orange-500 bg-slate-800' : ''}`}><LayoutDashboard size={20} /><span className="text-[10px] font-bold uppercase tracking-wider">Admin</span></NavLink>
            <div className="w-px h-8 bg-slate-700 mx-2"></div>
            <button onClick={() => logout()} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all"><LogOut size={20} /><span className="text-[10px] font-bold uppercase tracking-wider">ออก</span></button>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;