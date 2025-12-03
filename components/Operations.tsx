
import React, { useState } from 'react';
import { Alert, MonitoringDashboard, MonitoringPanel } from '../types';
import { AlertTriangle, CheckCircle, Search, Bot, FileText, Activity, Server, BarChart2, PieChart, Plus, Download, Layout, Upload, RefreshCw, Filter, MoreHorizontal } from 'lucide-react';
import { analyzeLogEntry } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';

const mockAlerts: Alert[] = [
  { id: 'ALT-001', severity: 'critical', message: 'Node k8s-worker-03 disk pressure > 90%', source: 'Monitor/Node', timestamp: '10:23 AM', status: 'active' },
  { id: 'ALT-002', severity: 'warning', message: 'High latency on API Gateway ingress', source: 'Monitor/Ingress', timestamp: '09:45 AM', status: 'active' },
  { id: 'ALT-003', severity: 'info', message: 'Backup job "daily-db-backup" completed', source: 'CronJob', timestamp: '02:00 AM', status: 'resolved' },
];

const mockLog = `E0921 10:23:45.123456    1 kubelet.go:1234] "Failed to start container" err="failed to run Kubelet: failed to create kubelet: misconfiguration: kubelet cgroup driver: \"cgroupfs\" is different from docker cgroup driver: \"systemd\""`;

// Mock Monitoring Data
const mockMetrics = [
  { time: '10:00', value: 45, value2: 30 },
  { time: '10:05', value: 52, value2: 35 },
  { time: '10:10', value: 49, value2: 32 },
  { time: '10:15', value: 62, value2: 45 },
  { time: '10:20', value: 75, value2: 55 },
  { time: '10:25', value: 68, value2: 50 },
  { time: '10:30', value: 55, value2: 40 },
];

const defaultDashboards: MonitoringDashboard[] = [
  {
    id: 'dash-001', name: '集群核心资源 (Cluster Overview)', source: 'System',
    panels: [
      { id: 'p1', title: 'Total CPU Usage', type: 'Area', metric: 'cluster_cpu_usage', unit: '%', color: '#3b82f6', data: mockMetrics },
      { id: 'p2', title: 'Memory Usage', type: 'Area', metric: 'cluster_memory_usage', unit: '%', color: '#8b5cf6', data: mockMetrics },
      { id: 'p3', title: 'Pod Count Trend', type: 'Bar', metric: 'cluster_pod_count', unit: '', color: '#10b981', data: mockMetrics },
    ]
  }
];

export const Operations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'alerts' | 'logs'>('monitor');
  const [currentCluster, setCurrentCluster] = useState('production-k8s');
  
  // Monitoring State
  const [dashboards, setDashboards] = useState<MonitoringDashboard[]>(defaultDashboards);
  const [activeDashboardId, setActiveDashboardId] = useState<string>(defaultDashboards[0].id);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Logs & AI State
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeLogEntry(mockLog);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleImportGrafana = () => {
    // Simulate import
    const newDash: MonitoringDashboard = {
      id: `dash-${Date.now()}`,
      name: 'Imported: Node Exporter Full',
      source: 'Grafana',
      panels: [
        { id: 'gp1', title: 'Node Load (1m)', type: 'Line', metric: 'node_load1', unit: '', color: '#f59e0b', data: mockMetrics },
        { id: 'gp2', title: 'Disk I/O Latency', type: 'Area', metric: 'disk_io_time', unit: 'ms', color: '#ef4444', data: mockMetrics },
      ]
    };
    setDashboards([...dashboards, newDash]);
    setActiveDashboardId(newDash.id);
    setIsImportModalOpen(false);
  };

  const activeDashboard = dashboards.find(d => d.id === activeDashboardId) || dashboards[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-slate-800">运维观测中心</h2>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
               <Server size={16} className="text-slate-400" />
               <span className="text-xs font-medium text-slate-500">Context:</span>
               <select 
                 className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                 value={currentCluster}
                 onChange={(e) => setCurrentCluster(e.target.value)}
               >
                 <option value="production-k8s">production-k8s</option>
                 <option value="staging-k8s">staging-k8s</option>
               </select>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
         <button 
           onClick={() => setActiveTab('monitor')}
           className={`pb-3 pt-1 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'monitor' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
            <Activity size={16} /> 监控中心
         </button>
         <button 
           onClick={() => setActiveTab('alerts')}
           className={`pb-3 pt-1 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'alerts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
            <AlertTriangle size={16} /> 告警事件
         </button>
         <button 
           onClick={() => setActiveTab('logs')}
           className={`pb-3 pt-1 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'logs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
            <FileText size={16} /> 日志分析
         </button>
      </div>

      {/* MONITORING CONTENT */}
      {activeTab === 'monitor' && (
         <div className="space-y-6 animate-in fade-in">
            {/* Dashboard Toolbar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex gap-2 overflow-x-auto">
                  {dashboards.map(dash => (
                     <button
                       key={dash.id}
                       onClick={() => setActiveDashboardId(dash.id)}
                       className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          activeDashboardId === dash.id ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                       }`}
                     >
                        {dash.name}
                        {dash.source === 'Grafana' && <span className="ml-2 text-[10px] bg-orange-500/20 text-orange-200 px-1 rounded">Grafana</span>}
                     </button>
                  ))}
               </div>
               <div className="flex gap-2 border-l border-slate-100 pl-4 ml-4">
                  <button 
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-sm font-medium transition-colors"
                  >
                     <Upload size={16} /> 导入 Grafana
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors">
                     <Plus size={16} /> 自定义面板
                  </button>
               </div>
            </div>

            {/* Panels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {activeDashboard.panels.map(panel => (
                  <div key={panel.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-700">{panel.title}</h4>
                        <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16}/></button>
                     </div>
                     <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                           {panel.type === 'Area' ? (
                              <AreaChart data={panel.data}>
                                 <defs>
                                    <linearGradient id={`grad-${panel.id}`} x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor={panel.color} stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor={panel.color} stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                 <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                 <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                 <Area type="monotone" dataKey="value" stroke={panel.color} fill={`url(#grad-${panel.id})`} strokeWidth={2} />
                              </AreaChart>
                           ) : panel.type === 'Bar' ? (
                              <BarChart data={panel.data}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                 <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                 <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                 <Bar dataKey="value" fill={panel.color} radius={[4, 4, 0, 0]} />
                              </BarChart>
                           ) : (
                              <LineChart data={panel.data}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                 <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                 <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                 <Line type="monotone" dataKey="value" stroke={panel.color} strokeWidth={2} dot={false} />
                              </LineChart>
                           )}
                        </ResponsiveContainer>
                     </div>
                  </div>
               ))}
               
               <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer min-h-[250px]">
                  <Plus size={32} />
                  <span className="mt-2 text-sm font-medium">添加监控图表</span>
               </div>
            </div>
         </div>
      )}

      {/* ALERTS & LOGS CONTENT (Simplified as they were already there, but keeping structure) */}
      {(activeTab === 'alerts' || activeTab === 'logs') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
           <div className="lg:col-span-2 space-y-4">
             {/* ... Alert List ... */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2">
                   <AlertTriangle size={18} /> 实时告警流
                 </h3>
               </div>
               <div className="divide-y divide-slate-100">
                 {mockAlerts.map(alert => (
                   <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 cursor-pointer" onClick={() => setSelectedLog(mockLog)}>
                      <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-800 text-sm">{alert.message}</span>
                          <span className="text-xs text-slate-400">{alert.timestamp}</span>
                        </div>
                        <div className="mt-1 flex justify-between items-center">
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{alert.source}</span>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* AI Analysis Box */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-slate-700 flex items-center gap-2">
                     <Bot size={20} className="text-purple-600" /> 
                     Gemini 智能日志根因分析
                   </h3>
                   {selectedLog && !isAnalyzing && !aiAnalysis && (
                     <button onClick={handleAnalyze} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                       <Activity size={14} /> 开始分析
                     </button>
                   )}
                </div>
                {selectedLog ? (
                  <div className="space-y-4">
                    <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-700">
                      {selectedLog}
                    </div>
                    {isAnalyzing && <div className="flex items-center gap-2 text-slate-500 text-sm animate-pulse"><Bot size={16} /> Gemini 正在思考解决方案...</div>}
                    {aiAnalysis && (
                      <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg text-sm text-slate-800">
                        <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2"><CheckCircle size={16} /> 分析结果</h4>
                        <p className="whitespace-pre-wrap leading-relaxed">{aiAnalysis}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">点击左侧告警以进行智能分析</div>
                )}
             </div>
           </div>

           <div className="space-y-6">
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                 <h3 className="font-bold text-slate-700 mb-4">事件统计</h3>
                 {/* ... stats ... */}
                 <div className="text-center text-slate-400 text-sm py-4">近 24 小时 3 起告警</div>
               </div>
           </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl p-6 w-[500px]">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Upload size={20}/> 导入 Grafana Dashboard</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dashboard JSON</label>
                    <textarea className="w-full border border-slate-300 rounded-lg h-32 text-xs font-mono p-2 focus:ring-2 focus:ring-orange-500 outline-none" placeholder='Paste JSON here...'></textarea>
                 </div>
                 <div className="flex justify-end gap-2">
                    <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">取消</button>
                    <button onClick={handleImportGrafana} className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg text-sm">确认导入</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
