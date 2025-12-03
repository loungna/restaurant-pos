import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Monitor, ChefHat, LayoutDashboard } from 'lucide-react';

// Import Pages
import POSPage from './features/pos/POSPage';
import KitchenPage from './features/kitchen/KitchenPage';
import AdminPage from './features/admin/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen bg-gray-100">

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Navigate to="/pos" replace />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>

        {/* Bottom Navigation Bar (For Switching Systems) */}
        <div className="bg-slate-900 text-slate-400 p-2 flex justify-center gap-6 border-t border-slate-800 z-50 flex-shrink-0">
          <NavLink
            to="/pos"
            className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:text-white transition-all ${isActive ? 'text-orange-500 bg-slate-800' : ''}`}
          >
            <Monitor size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">POS หน้าร้าน</span>
          </NavLink>

          <NavLink
            to="/kitchen"
            className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:text-white transition-all ${isActive ? 'text-orange-500 bg-slate-800' : ''}`}
          >
            <ChefHat size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Kitchen ครัว</span>
          </NavLink>

          <NavLink
            to="/admin"
            className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:text-white transition-all ${isActive ? 'text-orange-500 bg-slate-800' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Admin หลังบ้าน</span>
          </NavLink>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;