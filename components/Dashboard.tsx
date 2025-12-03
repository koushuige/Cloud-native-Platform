import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Server, AlertTriangle, Cpu } from 'lucide-react';
import { Cluster } from '../types';

const data = [
  { name: '00:00', cpu: 45, mem: 55 },
  { name: '04:00', cpu: 55, mem: 60 },
  { name: '08:00', cpu: 75, mem: 80 },
  { name: '12:00', cpu: 85, mem: 70 },
  { name: '16:00', cpu: 65, mem: 65 },
  { name: '20:00', cpu: 50, mem: 60 },
  { name: '24:00', cpu: 40, mem: 50 },
];

interface DashboardProps {
  clusters: Cluster[];
}

export const Dashboard: React.FC<DashboardProps> = ({ clusters }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">运行中集群</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">{clusters.length}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Server size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <Activity size={16} className="mr-1" />
            <span>所有系统运行正常</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">总 CPU 核心数</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">1,240</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Cpu size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-500">
            <span>使用率 68%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">活动告警</p>
              <h3 className="text-2xl font-bold text-red-600 mt-2">3</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-500">
            <span>2个严重, 1个警告</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">应用实例</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">342</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Activity size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-500">
            <span>较昨日增长 +5%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">全网资源利用率趋势</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" name="CPU" />
                <Area type="monotone" dataKey="mem" stroke="#10b981" fillOpacity={1} fill="url(#colorMem)" name="Memory" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Pod 分布 (按命名空间)</h4>
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'default', count: 120 },
                { name: 'kube-system', count: 45 },
                { name: 'monitoring', count: 30 },
                { name: 'logging', count: 25 },
                { name: 'app-prod', count: 80 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};