
import React from 'react';
import { View } from '../types';
import { LayoutDashboard, Server, Activity, AppWindow, Database, Settings, Cloud, User, Bell, Network, HardDrive } from 'lucide-react';

interface LayoutProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  children: React.ReactNode;
}

const NavItem: React.FC<{ 
  active: boolean; 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void 
}> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Cloud className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Cloud Native</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 px-4 mb-2 uppercase tracking-wider">Platform</div>
          <NavItem 
            active={currentView === View.DASHBOARD} 
            icon={<LayoutDashboard size={20} />} 
            label="总览 Dashboard" 
            onClick={() => setCurrentView(View.DASHBOARD)} 
          />
          <NavItem 
            active={currentView === View.CLUSTERS} 
            icon={<Server size={20} />} 
            label="集群管理" 
            onClick={() => setCurrentView(View.CLUSTERS)} 
          />
          <NavItem 
            active={currentView === View.OPERATIONS} 
            icon={<Activity size={20} />} 
            label="运维观测" 
            onClick={() => setCurrentView(View.OPERATIONS)} 
          />
          
          <div className="text-xs font-semibold text-slate-400 px-4 mb-2 mt-6 uppercase tracking-wider">Container Resources</div>
           <NavItem 
            active={currentView === View.NETWORK} 
            icon={<Network size={20} />} 
            label="网络管理" 
            onClick={() => setCurrentView(View.NETWORK)} 
          />
           <NavItem 
            active={currentView === View.STORAGE} 
            icon={<HardDrive size={20} />} 
            label="存储管理" 
            onClick={() => setCurrentView(View.STORAGE)} 
          />

          <div className="text-xs font-semibold text-slate-400 px-4 mb-2 mt-6 uppercase tracking-wider">Services</div>
          <NavItem 
            active={currentView === View.APPLICATIONS} 
            icon={<AppWindow size={20} />} 
            label="应用交付" 
            onClick={() => setCurrentView(View.APPLICATIONS)} 
          />
          <NavItem 
            active={currentView === View.MIDDLEWARE} 
            icon={<Database size={20} />} 
            label="中间件/Kafka" 
            onClick={() => setCurrentView(View.MIDDLEWARE)} 
          />
        </nav>

        <div className="p-4 border-t border-slate-200">
           <NavItem 
            active={currentView === View.SETTINGS} 
            icon={<Settings size={20} />} 
            label="系统设置" 
            onClick={() => setCurrentView(View.SETTINGS)} 
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-10">
          <div className="flex items-center text-slate-500 text-sm">
             <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">Project: Default</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800">Admin User</div>
                <div className="text-xs text-slate-500">Platform Admin</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
