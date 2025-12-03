
import React, { useState, useEffect } from 'react';
import { ClusterInspectionReport, ClusterInspectionItem } from '../types';
import { ShieldCheck, PlayCircle, RefreshCw, X, AlertTriangle, CheckCircle, Info, Clock, Download, FileText, ChevronDown, ChevronRight, Activity, Server, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ClusterInspectionProps {
  isOpen: boolean;
  onClose: () => void;
  clusterName?: string;
}

// Mock Inspection Data
const mockInspectionItems: ClusterInspectionItem[] = [
  { id: 'i-01', name: 'Node Disk Pressure', category: 'Infrastructure', status: 'Pass', severity: 'Critical', message: 'All nodes have sufficient disk space.' },
  { id: 'i-02', name: 'API Server Latency', category: 'Component', status: 'Pass', severity: 'High', message: 'API Server latency is within normal range (<100ms).' },
  { id: 'i-03', name: 'Certificate Expiry', category: 'Security', status: 'Warning', severity: 'High', message: 'Kubelet certificate on node-2 expires in 14 days.', recommendation: 'Rotate certificates using kubeadm alpha certs renew.' },
  { id: 'i-04', name: 'CoreDNS Availability', category: 'Component', status: 'Pass', severity: 'Critical', message: 'All CoreDNS replicas are running.' },
  { id: 'i-05', name: 'Deployment Replica Spec', category: 'Workload', status: 'Fail', severity: 'Medium', message: 'Deployment "frontend" has 0 replicas available.', recommendation: 'Check pod events for scheduling errors or image pull backoffs.' },
  { id: 'i-06', name: 'Privileged Containers', category: 'Security', status: 'Pass', severity: 'High', message: 'No privileged containers found in default namespace.' },
  { id: 'i-07', name: 'Etcd Database Size', category: 'Component', status: 'Pass', severity: 'High', message: 'Etcd DB size is healthy (200MB).' },
];

const mockHistoryData = [
  { date: '10/01', score: 98 },
  { date: '10/05', score: 95 },
  { date: '10/10', score: 92 },
  { date: '10/15', score: 88 },
  { date: '10/20', score: 85 },
  { date: '10/25', score: 90 },
  { date: '10/30', score: 82 },
];

export const ClusterInspection: React.FC<ClusterInspectionProps> = ({ isOpen, onClose, clusterName = 'production-k8s' }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [report, setReport] = useState<ClusterInspectionReport | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Simulate initial report load
  useEffect(() => {
    if (isOpen && !report) {
      setReport({
        id: 'rep-init',
        clusterId: clusterName,
        score: 82,
        status: 'Warning',
        riskLevel: 'Medium',
        timestamp: '2023-10-30 02:00:00',
        durationSeconds: 45,
        items: mockInspectionItems
      });
    }
  }, [isOpen]);

  const runInspection = () => {
    setIsRunning(true);
    setProgress(0);
    setReport(null);

    const steps = [
      { p: 10, msg: 'Initializing inspection context...' },
      { p: 30, msg: 'Scanning Infrastructure (Nodes, Disk, Network)...' },
      { p: 50, msg: 'Checking Kubernetes Components (Etcd, API Server)...' },
      { p: 70, msg: 'Analyzing Workloads & Resources...' },
      { p: 90, msg: 'Auditing Security & Certificates...' },
      { p: 100, msg: 'Finalizing report...' },
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setIsRunning(false);
        setReport({
          id: `rep-${Date.now()}`,
          clusterId: clusterName,
          score: 85, // New score
          status: 'Warning',
          riskLevel: 'Low',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          durationSeconds: 52,
          items: mockInspectionItems.map(i => i.status === 'Fail' ? {...i, status: 'Pass', message: 'Fixed: ' + i.message} : i) // Mock fix one issue
        });
      } else {
        setProgress(steps[stepIndex].p);
        setCurrentStep(steps[stepIndex].msg);
        stepIndex++;
      }
    }, 800);
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedItems(newSet);
  };

  if (!isOpen) return null;

  const filteredItems = report?.items.filter(item => filterCategory === 'All' || item.category === filterCategory) || [];
  const warningCount = report?.items.filter(i => i.status === 'Warning').length || 0;
  const failCount = report?.items.filter(i => i.status === 'Fail').length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={24} /> 
              集群健康巡检
            </h3>
            <p className="text-sm text-slate-500 mt-1">Target Cluster: <span className="font-mono font-medium">{clusterName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Panel: Sidebar / History / Actions */}
          <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
             
             {/* Score Card */}
             <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center">
                {isRunning ? (
                   <div className="py-8">
                      <RefreshCw size={48} className="mx-auto text-blue-500 animate-spin mb-4" />
                      <div className="text-2xl font-bold text-slate-700">{progress}%</div>
                      <p className="text-xs text-slate-400 mt-2">{currentStep}</p>
                   </div>
                ) : (
                   <>
                      <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-2">当前健康评分</p>
                      <div className={`text-5xl font-bold mb-2 ${
                        (report?.score || 0) >= 90 ? 'text-green-500' : (report?.score || 0) >= 70 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                         {report?.score || '--'}
                      </div>
                      <div className="flex justify-center gap-4 text-xs mt-4">
                         <span className="flex items-center gap-1 text-red-500 font-medium"><X size={14}/> {failCount} 失败</span>
                         <span className="flex items-center gap-1 text-yellow-600 font-medium"><AlertTriangle size={14}/> {warningCount} 警告</span>
                      </div>
                      <button 
                        onClick={runInspection}
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                         <PlayCircle size={18} /> 立即巡检
                      </button>
                   </>
                )}
             </div>

             {/* Trend Chart */}
             <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                   <Activity size={16}/> 健康度趋势
                </h4>
                <div className="h-32">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockHistoryData}>
                         <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                               <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <XAxis dataKey="date" hide />
                         <YAxis domain={[0, 100]} hide />
                         <Tooltip contentStyle={{fontSize: '12px'}} />
                         <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#colorScore)" strokeWidth={2} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Schedule Info */}
             <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                   <Clock size={16}/> 定时任务
                </h4>
                <div className="flex items-center justify-between text-sm">
                   <span className="text-slate-500">每日 03:00 全量巡检</span>
                   <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">开启</span>
                </div>
             </div>
          </div>

          {/* Right Panel: Detailed Report */}
          <div className="flex-1 flex flex-col bg-white">
             {/* Toolbar */}
             <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex gap-2">
                   {['All', 'Infrastructure', 'Component', 'Workload', 'Security'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                           filterCategory === cat ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                         {cat === 'All' ? '全部' : cat}
                      </button>
                   ))}
                </div>
                <div className="flex gap-2">
                   <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                      <Download size={16} /> 导出 PDF
                   </button>
                </div>
             </div>

             {/* Report List */}
             <div className="flex-1 overflow-y-auto p-6">
                {!report && !isRunning && (
                   <div className="text-center py-20 text-slate-400">
                      <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
                      <p>点击“立即巡检”开始全方位健康检查</p>
                   </div>
                )}

                {isRunning && (
                   <div className="space-y-4">
                      {[1,2,3,4,5].map(i => (
                         <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
                      ))}
                   </div>
                )}

                {report && !isRunning && (
                   <div className="space-y-4">
                      {filteredItems.map(item => (
                         <div key={item.id} className={`border rounded-xl transition-all ${
                            item.status === 'Fail' ? 'border-red-200 bg-red-50/30' : 
                            item.status === 'Warning' ? 'border-yellow-200 bg-yellow-50/30' : 'border-slate-200 hover:bg-slate-50'
                         }`}>
                            <div 
                               className="p-4 flex items-center cursor-pointer"
                               onClick={() => toggleExpand(item.id)}
                            >
                               <div className="mr-4">
                                  {item.status === 'Pass' && <CheckCircle className="text-green-500" size={20} />}
                                  {item.status === 'Warning' && <AlertTriangle className="text-yellow-500" size={20} />}
                                  {item.status === 'Fail' && <X className="text-red-500" size={20} />}
                               </div>
                               <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                     <h4 className="font-bold text-slate-800">{item.name}</h4>
                                     <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500">{item.category}</span>
                                     {item.severity === 'Critical' && <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold">Critical</span>}
                                  </div>
                                  <p className="text-sm text-slate-600 mt-1">{item.message}</p>
                               </div>
                               <div className="ml-4 text-slate-400">
                                  {expandedItems.has(item.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                               </div>
                            </div>
                            
                            {expandedItems.has(item.id) && item.recommendation && (
                               <div className="px-4 pb-4 pl-14 animate-in slide-in-from-top-2">
                                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm">
                                     <h5 className="font-bold text-slate-700 flex items-center gap-2 mb-1">
                                        <Info size={16} className="text-blue-500" /> 修复建议 (Root Cause Analysis)
                                     </h5>
                                     <p className="text-slate-600">{item.recommendation}</p>
                                     <div className="mt-2 flex gap-2">
                                        <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100">自动修复</button>
                                        <button className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-200 hover:bg-slate-100">查看知识库</button>
                                     </div>
                                  </div>
                               </div>
                            )}
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
