
import React, { useState } from 'react';
import { MicroService, TraceSpan, Gateway, ExternalService, ServicePolicy, RateLimit, GrayRelease, Alert } from '../types';
import { 
  Zap, Activity, LayoutList, Share2, Plus, ArrowRight, ShieldCheck, 
  AlertTriangle, CheckCircle, Search, Settings, MoreVertical, 
  Clock, GitCommit, Smartphone, Monitor, Database, Terminal, 
  Layers, Sliders, Globe, FastForward, Timer, Bug, Network, 
  Trash2, Copy, Play, Pause, RefreshCw, ChevronRight, BarChart as BarChartIcon,
  LogIn, LogOut, Link2, Filter, ShieldAlert, Rocket, Gauge, History,
  Info, Check, X, Shield, Server, Box, GitPullRequest, ChevronDown, ListFilter,
  Code, FileCode, MousePointer2, MoveRight, GitFork, ArrowLeft, ShieldX,
  Lock, ZapOff, ActivitySquare, Fingerprint, Layers3, FlameKindling,
  Save, Beaker, Wand2, ArrowUpCircle, Split, Cpu, GanttChartSquare, 
  TerminalSquare, MousePointerClick, Map, TrendingUp, AlertOctagon,
  Waves, ActivitySquare as Pulse, LineChart as ChartIcon, BellRing,
  Settings2, ShieldQuestion, Construction, Radio, HardDrive, Unplug
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar, Cell, PieChart, Pie, ComposedChart } from 'recharts';

// --- Missing Mock Data Definitions ---

// Fix: Added missing mockServices
const mockServices: MicroService[] = [
  { id: 'svc-1', name: 'order-service', namespace: 'production', version: 'v1.2.0', instances: 3, status: 'Healthy', healthScore: 98, qps: 450, latency: '45ms', errorRate: 0.01 },
  { id: 'svc-2', name: 'auth-service', namespace: 'production', version: 'v2.1.0', instances: 2, status: 'Healthy', healthScore: 100, qps: 200, latency: '15ms', errorRate: 0 },
  { id: 'svc-3', name: 'payment-svc', namespace: 'production', version: 'v1.0.5', instances: 4, status: 'Warning', healthScore: 85, qps: 850, latency: '450ms', errorRate: 0.15 },
];

// Fix: Added missing mockMetricData
const mockMetricData = [
  { time: '10:00', qps: 1200, latency: 45, error: 2 },
  { time: '10:05', qps: 1500, latency: 52, error: 5 },
  { time: '10:10', qps: 1100, latency: 48, error: 3 },
  { time: '10:15', qps: 2200, latency: 120, error: 15 },
  { time: '10:20', qps: 1800, latency: 90, error: 8 },
  { time: '10:25', qps: 1400, latency: 60, error: 4 },
];

// Fix: Added missing mockGateways
const mockGateways: Gateway[] = [
  { id: 'gw-1', name: 'ingress-gateway', type: 'Ingress', hosts: ['*.example.com'], ports: [80, 443], status: 'Ready', namespace: 'istio-system' },
  { id: 'gw-2', name: 'egress-gateway', type: 'Egress', hosts: ['api.external.com'], ports: [443], status: 'Ready', namespace: 'istio-system' },
];

// Fix: Added missing mockGrays
const mockGrays: GrayRelease[] = [
  { id: 'gray-1', name: 'order-service-canary', service: 'order-service', baseline: { version: 'v2', weight: 90 }, canary: { version: 'v3', weight: 10, status: 'Testing' }, startTime: '10-30 10:00' },
];

// Fix: Added missing mockRateLimits
const mockRateLimits: RateLimit[] = [
  { id: 'rl-1', service: 'order-service', limit: 1000, unit: 'rps', status: 'Enabled' },
  { id: 'rl-2', service: 'auth-service', limit: 500, unit: 'rps', status: 'Enabled' },
];

// Fix: Added missing mockTraces
const mockTraces: TraceSpan[] = [
  { id: 'trace-1', operation: 'GET /api/v1/orders', service: 'ingress-gateway', startTime: '10-30 16:20:01', duration: 120, status: 'OK', tags: { 'http.method': 'GET', 'http.status': '200' } },
  { id: 'trace-2', operation: 'POST /api/v1/login', service: 'ingress-gateway', startTime: '10-30 16:20:05', duration: 45, status: 'OK', tags: { 'http.method': 'POST', 'http.status': '200' } },
  { id: 'trace-3', operation: 'GET /api/v1/products', service: 'ingress-gateway', startTime: '10-30 16:21:12', duration: 450, status: 'Error', tags: { 'http.method': 'GET', 'http.status': '500' } },
];

// Fix: Added missing mockDetailSpans
const mockDetailSpans = [
  { id: 'span-1', service: 'ingress-gateway', operation: 'GET /api/v1/orders', startOffset: 0, duration: 120 },
  { id: 'span-2', service: 'auth-service', operation: 'POST /verify', startOffset: 10, duration: 30 },
  { id: 'span-3', service: 'order-service', operation: 'GET /orders', startOffset: 45, duration: 75 },
  { id: 'span-4', service: 'order-db', operation: 'SELECT * FROM orders', startOffset: 60, duration: 40 },
];

// Fix: Added missing mockMicroAlerts
const mockMicroAlerts: Alert[] = [
  { id: 'alert-1', severity: 'critical', message: 'High 5xx error rate on order-service', source: 'Envoy/Filter', timestamp: '10-30 16:35', status: 'active' },
  { id: 'alert-2', severity: 'warning', message: 'Latency spike detected on auth-service', source: 'Envoy/Cluster', timestamp: '10-30 16:30', status: 'active' },
];

// --- Additional Mock Data for Service Management ---

const mockMeshInfra = {
  version: '1.18.2',
  status: 'Healthy',
  components: [
    { name: 'istiod', status: 'Running', cpu: '0.45 Core', mem: '512 MiB', restarts: 0 },
    { name: 'istio-ingressgateway', status: 'Running', cpu: '0.2 Core', mem: '256 MiB', restarts: 0 },
    { name: 'istio-egressgateway', status: 'Running', cpu: '0.1 Core', mem: '128 MiB', restarts: 0 },
  ],
  upgradeAvailable: '1.19.0'
};

const mockCrossClusters = [
  { id: 'cls-hk-1', name: 'Cluster-HK-Prod', status: 'Connected', endpoints: 142, syncTime: '2s ago' },
  { id: 'cls-sh-2', name: 'Cluster-SH-Backup', status: 'Connected', endpoints: 85, syncTime: '5s ago' },
];

const mockExpansionWorkloads = [
  { id: 'vm-01', name: 'legacy-inventory-vm', type: 'Virtual Machine', ip: '10.50.2.14', status: 'Ready', labels: { env: 'prod' } },
];

// --- Sub-Components ---

const ServiceManagement: React.FC = () => {
  const [smTab, setSmTab] = useState<'workloads' | 'infra' | 'expansion' | 'cross-cluster'>('workloads');
  const [selectedService, setSelectedService] = useState<MicroService | null>(null);
  
  // Sidecar Config State
  const [isSidecarPanelOpen, setIsSidecarPanelOpen] = useState(false);
  const [sidecarConfig, setSidecarConfig] = useState({
    cpuLimit: 0.5,
    memLimit: 512,
    logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',
    autoInject: true
  });

  // Upgrade Wizard State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState(1);
  const [upgradeMode, setUpgradeMode] = useState<'inplace' | 'canary'>('canary');

  const handleOpenSidecarConfig = (svc: MicroService) => {
    setSelectedService(svc);
    setIsSidecarPanelOpen(true);
  };

  const renderSidecarDrawer = () => (
    <div className={`fixed inset-y-0 right-0 z-50 w-[450px] bg-white shadow-2xl border-l border-slate-100 transition-transform duration-500 ease-in-out transform ${isSidecarPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="px-8 py-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Settings2 size={24}/></div>
             <div>
                <h3 className="text-xl font-black text-slate-800">Sidecar 深度治理</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Service: {selectedService?.name}</p>
             </div>
          </div>
          <button onClick={() => setIsSidecarPanelOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
           <section className="space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Zap size={16} className="text-indigo-600"/> 自动化注入策略
                 </h4>
                 <div className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-all ${sidecarConfig.autoInject ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'}`} onClick={() => setSidecarConfig({...sidecarConfig, autoInject: !sidecarConfig.autoInject})}>
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                 </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">开启后，Pod 启动时将自动注入 Envoy 代理容器。修改此项后需要重启应用副本生效。</p>
           </section>

           <section className="space-y-6">
              <h4 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                 <Cpu size={16} className="text-indigo-600"/> 资源配额限制 (Resource Quotas)
              </h4>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                       <span className="text-slate-500">CPU Limit</span>
                       <span className="text-indigo-600">{sidecarConfig.cpuLimit} Core</span>
                    </div>
                    <input type="range" min="0.1" max="2" step="0.1" className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-indigo-600" value={sidecarConfig.cpuLimit} onChange={e => setSidecarConfig({...sidecarConfig, cpuLimit: parseFloat(e.target.value)})}/>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                       <span className="text-slate-500">Memory Limit</span>
                       <span className="text-indigo-600">{sidecarConfig.memLimit} MiB</span>
                    </div>
                    <input type="range" min="64" max="2048" step="64" className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-indigo-600" value={sidecarConfig.memLimit} onChange={e => setSidecarConfig({...sidecarConfig, memLimit: parseInt(e.target.value)})}/>
                 </div>
              </div>
           </section>

           <section className="space-y-6">
              <h4 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                 <Terminal size={16} className="text-indigo-600"/> Envoy 日志级别
              </h4>
              <div className="grid grid-cols-4 gap-2">
                 {['debug', 'info', 'warn', 'error'].map(level => (
                    <button 
                       key={level}
                       onClick={() => setSidecarConfig({...sidecarConfig, logLevel: level as any})}
                       className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${sidecarConfig.logLevel === level ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'border-slate-100 text-slate-400 hover:border-indigo-100'}`}
                    >
                       {level}
                    </button>
                 ))}
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                 <AlertTriangle size={16} className="text-amber-600 shrink-0"/>
                 <p className="text-[10px] font-bold text-amber-800 leading-relaxed">开启 `debug` 级别会显著增加日志量并可能导致轻微性能下降，建议仅在排障时短暂开启。</p>
              </div>
           </section>
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-3">
           <button onClick={() => setIsSidecarPanelOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-500 hover:bg-slate-100 transition-all">放弃修改</button>
           <button onClick={() => { alert('Sidecar 配置已更新，正在下发中...'); setIsSidecarPanelOpen(false); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">应用并保存</button>
        </div>
      </div>
    </div>
  );

  const renderUpgradeWizard = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-white/20">
          <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-100"><ArrowUpCircle size={24}/></div>
                <div>
                   <h3 className="text-xl font-black text-slate-800">服务网格版本升级</h3>
                   <div className="flex gap-2 mt-2">
                      {[1, 2, 3].map(s => <div key={s} className={`w-10 h-1 rounded-full ${s <= upgradeStep ? 'bg-rose-600' : 'bg-slate-200'}`}></div>)}
                   </div>
                </div>
             </div>
             <button onClick={() => { setIsUpgradeModalOpen(false); setUpgradeStep(1); }}><X size={24} className="text-slate-400"/></button>
          </div>
          <div className="flex-1 p-10 bg-white overflow-y-auto min-h-[400px]">
             {upgradeStep === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                   <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                      <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">当前版本</div>
                         <div className="text-2xl font-black text-slate-800">{mockMeshInfra.version}</div>
                      </div>
                      <ArrowRight className="text-slate-200" size={32}/>
                      <div className="text-right">
                         <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest font-black">目标版本 (Stable)</div>
                         <div className="text-2xl font-black text-rose-600">{mockMeshInfra.upgradeAvailable}</div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">选择升级策略</label>
                      <div className="grid grid-cols-2 gap-4">
                         <div onClick={() => setUpgradeMode('canary')} className={`p-6 border-2 rounded-3xl cursor-pointer transition-all ${upgradeMode === 'canary' ? 'border-rose-600 bg-rose-50/30 ring-4 ring-rose-50' : 'border-slate-100 hover:border-rose-200'}`}>
                            <div className="font-black text-slate-800 text-sm">灰度升级 (Canary)</div>
                            <p className="text-[10px] text-slate-400 mt-2 font-bold leading-relaxed">安装新版本控制平面，按命名空间逐步切流，风险极低。</p>
                         </div>
                         <div onClick={() => setUpgradeMode('inplace')} className={`p-6 border-2 rounded-3xl cursor-pointer transition-all ${upgradeMode === 'inplace' ? 'border-rose-600 bg-rose-50/30 ring-4 ring-rose-50' : 'border-slate-100 hover:border-rose-200'}`}>
                            <div className="font-black text-slate-800 text-sm">原地升级 (In-place)</div>
                            <p className="text-[10px] text-slate-400 mt-2 font-bold leading-relaxed">直接覆盖现有控制平面镜像。可能会有短暂的配置下发延迟。</p>
                         </div>
                      </div>
                   </div>
                </div>
             )}
             {upgradeStep === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                   <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100 flex items-start gap-4">
                      <ShieldQuestion size={24} className="text-rose-600 shrink-0 mt-1"/>
                      <div>
                         <h4 className="font-black text-rose-900">健康度前置预检</h4>
                         <p className="text-xs font-bold text-rose-800/60 mt-1 leading-relaxed">系统将检查所有 Sidecar 的就绪状态及 API 兼容性，确保升级环境安全。</p>
                      </div>
                   </div>
                   <div className="space-y-3">
                      {['API 兼容性校验', 'Sidecar 冲突检测', '控制平面负载评估'].map(check => (
                         <div key={check} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                            <span className="text-sm font-black text-slate-700">{check}</span>
                            <CheckCircle size={18} className="text-emerald-500"/>
                         </div>
                      ))}
                   </div>
                </div>
             )}
             {upgradeStep === 3 && (
                <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in-95">
                   <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shadow-xl">
                      <RefreshCw size={40} className="animate-spin duration-[3s]"/>
                   </div>
                   <div className="text-center">
                      <h4 className="text-xl font-black text-slate-800">确认启动升级程序</h4>
                      <p className="text-sm text-slate-400 font-bold mt-2">点击下方按钮，系统将开始下发 {upgradeMode === 'canary' ? '双控制平面' : '原地滚动'} 升级任务。</p>
                   </div>
                </div>
             )}
          </div>
          <div className="px-10 py-8 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
             <button onClick={() => setUpgradeStep(s => Math.max(1, s-1))} className={`text-slate-400 font-black text-xs uppercase tracking-widest hover:text-rose-600 transition-colors ${upgradeStep === 1 ? 'invisible' : ''}`}>返回</button>
             <div className="flex gap-4">
                <button onClick={() => { setIsUpgradeModalOpen(false); setUpgradeStep(1); }} className="px-8 py-3 text-slate-500 font-black text-sm hover:bg-slate-100 rounded-2xl transition-all">取消</button>
                <button onClick={() => { if(upgradeStep < 3) setUpgradeStep(s => s+1); else { alert('升级任务已开始，请在“网格基础设施”页签关注进度。'); setIsUpgradeModalOpen(false); setUpgradeStep(1); } }} className="px-12 py-3 bg-rose-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all">
                   {upgradeStep === 3 ? '开始升级' : '下一步'}
                </button>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex gap-10 border-b border-slate-100 px-2 overflow-x-auto scrollbar-hide shrink-0">
         {[
           { id: 'workloads', label: '服务负载 (K8s)', icon: <Layers size={18}/> },
           { id: 'infra', label: '网格基础设施', icon: <Radio size={18}/> },
           { id: 'expansion', label: '计算外延 (Expansion)', icon: <Monitor size={18}/> },
           { id: 'cross-cluster', label: '多集群互联', icon: <Network size={18}/> },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setSmTab(tab.id as any)}
             className={`pb-4 pt-1 px-1 text-sm font-black flex items-center gap-3 border-b-4 transition-all uppercase tracking-widest ${
               smTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'
             }`}
           >
             {tab.icon} {tab.label}
           </button>
         ))}
      </div>

      {smTab === 'workloads' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {mockServices.map(svc => (
              <div key={svc.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between">
                 <div className={`absolute top-0 left-0 w-2 h-full ${svc.status === 'Healthy' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                 <div>
                    <div className="flex justify-between items-start mb-8">
                       <div className={`p-4 rounded-2xl ${svc.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                          <Database size={24}/>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => handleOpenSidecarConfig(svc)} className="p-2 text-slate-300 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all shadow-inner" title="Sidecar 治理"><Settings2 size={18}/></button>
                          <button className="p-2 text-slate-300 hover:text-slate-600 bg-slate-50 rounded-xl transition-all"><MoreVertical size={18}/></button>
                       </div>
                    </div>
                    <h4 className="text-xl font-black text-slate-800 truncate">{svc.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">v{svc.version} • Sidecar: <span className="text-emerald-500">v1.18.2</span></p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-10">
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Health</div>
                          <div className={`text-2xl font-black ${svc.healthScore >= 90 ? 'text-emerald-500' : 'text-orange-500'}`}>{svc.healthScore}</div>
                       </div>
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Instances</div>
                          <div className="text-2xl font-black text-slate-800">{svc.instances}</div>
                       </div>
                    </div>
                 </div>
                 
                 <button className="mt-10 w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-indigo-100 hover:shadow-xl">实例精细化观测</button>
              </div>
           ))}
           <div className="border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center p-8 text-slate-300 hover:border-indigo-200 hover:text-indigo-400 transition-all cursor-pointer min-h-[400px]">
              <Plus size={48} className="mb-4 opacity-20" />
              <span className="font-black uppercase tracking-[0.2em] text-sm text-center">接入现有 K8s<br/>工作负载</span>
           </div>
        </div>
      )}

      {smTab === 'infra' && (
         <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Control Plane Health */}
               <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-10">
                     <div>
                        <h3 className="text-2xl font-black text-slate-800">控制平面 (Istiod)</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase mt-1 tracking-widest">Namespace: istio-system</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black uppercase">{mockMeshInfra.status}</span>
                        <div className="h-4 w-px bg-slate-100"></div>
                        <span className="text-xs font-black text-slate-400">Ver: {mockMeshInfra.version}</span>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                     {mockMeshInfra.components.map(comp => (
                        <div key={comp.name} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-indigo-200 transition-all">
                           <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black text-slate-400 uppercase">{comp.name}</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-glow shadow-emerald-500/20"></div>
                           </div>
                           <div className="text-sm font-black text-slate-700">{comp.cpu}</div>
                           <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{comp.mem}</div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Version Management */}
               <div className="bg-slate-900 rounded-[40px] p-10 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"></div>
                  <div>
                     <div className="p-4 bg-white/10 w-fit rounded-[24px] mb-8"><ArrowUpCircle size={32} className="text-rose-400"/></div>
                     <h3 className="text-2xl font-black mb-2">网格生命周期</h3>
                     <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">发现可用更新版本: <span className="text-rose-400 font-black">{mockMeshInfra.upgradeAvailable}</span>。建议通过灰度升级方式平滑迁移业务流量。</p>
                  </div>
                  <button 
                     onClick={() => setIsUpgradeModalOpen(true)}
                     className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-900/20 flex items-center justify-center gap-2 active:scale-95"
                  >
                     <Rocket size={18}/> 启动安全升级程序
                  </button>
               </div>
            </div>

            {/* Health Overview Chart */}
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
               <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <Activity size={24} className="text-indigo-600"/> 控制平面性能监控
               </h3>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={mockMetricData}>
                        <defs>
                           <linearGradient id="infraCpu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" hide />
                        <YAxis axisLine={false} tickLine={false} fontSize={10} stroke="#94a3b8" />
                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="qps" stroke="#6366f1" fill="url(#infraCpu)" strokeWidth={3} name="Configuration Push Rate" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>
      )}

      {smTab === 'cross-cluster' && (
         <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
               <div className="absolute -right-10 top-0 p-8 opacity-10"><Globe size={160}/></div>
               <div className="relative z-10 max-w-xl">
                  <h3 className="text-3xl font-black tracking-tight">跨集群服务发现与互联</h3>
                  <p className="text-indigo-100/70 mt-3 font-bold">已启用 Multi-Primary 网格架构。支持异地多活集群间的服务发现同步与双向 TLS 加密通讯。</p>
               </div>
               <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-2">
                  <Plus size={18}/> 纳管新集群
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {mockCrossClusters.map(cls => (
                  <div key={cls.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 hover:shadow-xl transition-all group">
                     <div className="flex justify-between items-start mb-10">
                        <div className="p-5 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all rounded-[24px]">
                           <Server size={32}/>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">连接状态</div>
                           <span className="text-emerald-500 font-black text-sm uppercase flex items-center gap-2 justify-end mt-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                              {cls.status}
                           </span>
                        </div>
                     </div>
                     <h4 className="text-xl font-black text-slate-800">{cls.name}</h4>
                     <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                        <div>
                           <div className="text-[10px] font-black text-slate-400 uppercase">同步端点数</div>
                           <div className="text-2xl font-black text-slate-800">{cls.endpoints}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] font-black text-slate-400 uppercase">最后同步</div>
                           <div className="text-2xl font-black text-slate-600">{cls.syncTime}</div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {smTab === 'expansion' && (
         <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-end px-2">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">非 K8s 负载接入 (Expansion)</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium italic">将部署在虚拟机或物理机上的应用接入服务网格，统一治理策略与全链路追踪。</p>
               </div>
               <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95">
                  <Plus size={20}/> 接入非 K8s 工作负载
               </button>
            </div>

            {mockExpansionWorkloads.length > 0 ? (
               <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                        <tr>
                           <th className="px-10 py-5">负载名称</th>
                           <th className="px-6 py-5">类型</th>
                           <th className="px-6 py-5">IP 地址</th>
                           <th className="px-6 py-5">状态</th>
                           <th className="px-6 py-5">元数据/标签</th>
                           <th className="px-10 py-5 text-right">操作</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 font-bold text-slate-700 text-sm">
                        {mockExpansionWorkloads.map(vm => (
                           <tr key={vm.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-10 py-6 font-black text-slate-800">{vm.name}</td>
                              <td className="px-6 py-6"><span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{vm.type}</span></td>
                              <td className="px-6 py-6 font-mono text-xs text-slate-500">{vm.ip}</td>
                              <td className="px-6 py-6">
                                 <span className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    {vm.status}
                                 </span>
                              </td>
                              <td className="px-6 py-6">
                                 <div className="flex gap-2">
                                    {Object.entries(vm.labels).map(([k, v]) => (
                                       <span key={k} className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{k}={v}</span>
                                    ))}
                                 </div>
                              </td>
                              <td className="px-10 py-6 text-right">
                                 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-100 transition-all shadow-sm"><Terminal size={16}/></button>
                                    <button className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-red-600 border border-transparent hover:border-slate-100 transition-all shadow-sm"><Unplug size={16}/></button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            ) : (
               <div className="bg-white rounded-[48px] border-2 border-dashed border-slate-100 p-20 flex flex-col items-center justify-center text-center opacity-50">
                  <div className="p-6 bg-slate-50 rounded-[32px] mb-6"><Radio size={64} className="text-slate-300"/></div>
                  <p className="font-black text-slate-400 uppercase tracking-widest text-sm">暂无非 K8s 负载接入，点击右上角开始编排</p>
               </div>
            )}
         </div>
      )}

      {renderSidecarDrawer()}
      {isUpgradeModalOpen && renderUpgradeWizard()}
    </div>
  );
};

const TrafficManagement: React.FC = () => {
  const [subTab, setSubTab] = useState<'gateways' | 'external' | 'routing' | 'policies' | 'ratelimit' | 'gray'>('gray');
  const [isRoutingWizardOpen, setIsRoutingWizardOpen] = useState(false);
  const [routingStep, setRoutingStep] = useState(1);
  const [newRoute, setNewRoute] = useState({
    name: '', hosts: ['*'], namespace: 'default',
    matches: [{ type: 'URI', value: '/api/v1', exact: false }],
    destinations: [{ service: '', subset: 'v1', weight: 100 }]
  });
  const [isPolicyEditorOpen, setIsPolicyEditorOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<ServicePolicy | null>(null);
  const [activePolicySubTab, setActivePolicySubTab] = useState<'lb' | 'pool' | 'breaker'>('lb');
  const [isRateLimitModalOpen, setIsRateLimitModalOpen] = useState(false);
  const [selectedRateLimit, setSelectedRateLimit] = useState<RateLimit | null>(null);
  const [limitDimension, setLimitDimension] = useState<'Global' | 'IP' | 'Header'>('Global');
  const [isGrayWizardOpen, setIsGrayWizardOpen] = useState(false);
  const [grayStep, setGrayStep] = useState(1);
  const [newGray, setNewGray] = useState({
    name: '', service: 'order-service', baselineVersion: 'v2', canaryVersion: 'v3', strategy: 'Weight', weight: 10, healthCheck: true
  });

  const handleOpenGrayWizard = () => { setIsGrayWizardOpen(true); setGrayStep(1); };
  const renderGrayWizard = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-4xl h-[78vh] flex flex-col overflow-hidden border border-white/20">
        <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-600 rounded-[24px] text-white shadow-2xl shadow-indigo-100"><Rocket size={32}/></div>
            <div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">灰度发布流水线设计</h3>
              <div className="flex items-center gap-4 mt-2">
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${grayStep >= step ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>{step}</div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${grayStep === step ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {step === 1 ? '版本定义' : step === 2 ? '流量策略' : '观测指标'}
                    </span>
                    {step < 3 && <div className="w-8 h-0.5 bg-slate-100 ml-2"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => setIsGrayWizardOpen(false)} className="p-4 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-all group">
             <X size={32} className="group-hover:rotate-90 transition-all duration-300"/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/30">
          {grayStep === 1 && (
             <div className="max-w-2xl mx-auto space-y-10 animate-in slide-in-from-right-4">
                <section className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">发布单名称</label>
                   <input className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm" placeholder="e.g. order-service-oct-canary" value={newGray.name} onChange={e => setNewGray({...newGray, name: e.target.value})}/>
                </section>
                <div className="grid grid-cols-2 gap-8">
                   <section className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">目标微服务</label>
                      <select className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-100 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat" value={newGray.service} onChange={e => setNewGray({...newGray, service: e.target.value})}>
                         <option value="order-service">order-service</option>
                         <option value="auth-service">auth-service</option>
                         <option value="payment-svc">payment-svc</option>
                      </select>
                   </section>
                   <section className="space-y-4"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">发布环境</label><div className="flex items-center gap-3 bg-slate-100/50 p-4 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm"><Globe size={18}/> Production (Istio Mesh)</div></section>
                </div>
                <div className="bg-indigo-600 rounded-[32px] p-8 text-white flex items-center justify-between relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Wand2 size={80}/></div>
                   <div className="flex gap-10 items-center relative z-10">
                      <div><div className="text-[8px] font-black uppercase text-indigo-200 tracking-[0.2em] mb-1">Baseline</div><div className="text-3xl font-black">{newGray.baselineVersion}</div></div>
                      <div className="h-10 w-px bg-white/20"></div><ArrowRight size={32} className="text-indigo-300"/><div className="h-10 w-px bg-white/20"></div>
                      <div><div className="text-[8px] font-black uppercase text-indigo-200 tracking-[0.2em] mb-1">Canary</div><input className="bg-transparent border-b-2 border-white/40 text-3xl font-black w-24 outline-none focus:border-white transition-all" value={newGray.canaryVersion} onChange={e => setNewGray({...newGray, canaryVersion: e.target.value})}/></div>
                   </div>
                   <span className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-sm">镜像就绪</span>
                </div>
             </div>
          )}
          {grayStep === 2 && (
             <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-right-4">
                <section className="space-y-6"><div className="flex justify-between items-center px-2"><h4 className="text-xl font-black text-slate-800">引流模式选择</h4><span className="text-[10px] font-black text-slate-400 uppercase">Traffic Split</span></div>
                   <div className="grid grid-cols-2 gap-6">
                      <div onClick={() => setNewGray({...newGray, strategy: 'Weight'})} className={`p-8 border-2 rounded-[40px] cursor-pointer transition-all ${newGray.strategy === 'Weight' ? 'border-indigo-600 bg-white shadow-xl ring-4 ring-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}><div className={`p-3 rounded-2xl w-fit mb-4 ${newGray.strategy === 'Weight' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Split size={24}/></div><h5 className="font-black text-slate-800 text-lg">权重切分</h5><p className="text-xs text-slate-400 mt-2 leading-relaxed">按指定比例将生产流量导入灰度版本。</p></div>
                      <div onClick={() => setNewGray({...newGray, strategy: 'Header'})} className={`p-8 border-2 rounded-[40px] cursor-pointer transition-all ${newGray.strategy === 'Header' ? 'border-indigo-600 bg-white shadow-xl ring-4 ring-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}><div className={`p-3 rounded-2xl w-fit mb-4 ${newGray.strategy === 'Header' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Fingerprint size={24}/></div><h5 className="font-black text-slate-800 text-lg">内容匹配 (Headers)</h5><p className="text-xs text-slate-400 mt-2 leading-relaxed">基于 HTTP Header、Cookie 或用户 ID 精准路由。</p></div>
                   </div>
                </section>
                {newGray.strategy === 'Weight' && (
                   <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8 animate-in zoom-in-95"><div className="flex justify-between items-end"><div className="space-y-1"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">灰度流量配额</div><div className="text-5xl font-black text-indigo-600">{newGray.weight}%</div></div><div className="text-right space-y-1"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">基线版本</div><div className="text-5xl font-black text-slate-300">{100 - newGray.weight}%</div></div></div><input type="range" className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600" min="1" max="100" value={newGray.weight} onChange={e => setNewGray({...newGray, weight: parseInt(e.target.value)})}/></section>
                )}
             </div>
          )}
          {grayStep === 3 && (
             <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-right-4"><section className="bg-indigo-50/50 p-10 rounded-[40px] border border-indigo-100 mb-10"><div className="flex items-start gap-6"><div className="p-4 bg-indigo-600 text-white rounded-[24px] shadow-xl"><ShieldCheck size={32}/></div><div><h4 className="text-xl font-black text-indigo-900">自动化观测指标</h4><p className="text-sm font-bold text-indigo-800/60 mt-1 leading-relaxed">灰度发布期间持续监测，异常则自动回滚。</p></div></div></section>
                <div className="space-y-4">
                   {[ { id: 'err', label: 'HTTP 5xx 错误率', threshold: '< 0.5%', icon: <Bug size={18}/> }, { id: 'lat', label: 'P99 响应耗时激增', threshold: '< 200ms', icon: <Timer size={18}/> }, { id: 'cpu', label: 'CPU 利用率异常', threshold: '< 80%', icon: <Cpu size={18}/> } ].map(metric => (
                      <div key={metric.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-all group"><div className="flex items-center gap-6"><div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">{metric.icon}</div><div><div className="font-black text-slate-800">{metric.label}</div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Prometheus Realtime</div></div></div><div className="text-right"><div className="text-sm font-black text-indigo-600">{metric.threshold}</div><div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Threshold</div></div></div>
                   ))}
                </div>
             </div>
          )}
        </div>
        <div className="px-12 py-10 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
          <button onClick={() => setGrayStep(s => Math.max(1, s-1))} className={`flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-black text-xs uppercase ${grayStep === 1 ? 'invisible' : ''}`}><ArrowLeft size={16}/> 上一步</button>
          <div className="flex gap-4"><button onClick={() => setIsGrayWizardOpen(false)} className="px-10 py-5 border-2 border-slate-100 text-slate-500 rounded-[24px] hover:bg-slate-50 font-black text-sm">取消</button>
             {grayStep < 3 ? ( <button onClick={() => setGrayStep(s => s + 1)} disabled={grayStep === 1 && !newGray.name} className="px-16 py-5 bg-indigo-600 text-white rounded-[24px] hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 font-black text-sm flex items-center gap-3 transition-all shadow-xl shadow-indigo-100 active:scale-95">下一步 <ChevronRight size={18}/></button> ) : ( <button onClick={() => { alert('灰度发布单已成功下发！'); setIsGrayWizardOpen(false); }} className="px-16 py-5 bg-slate-900 text-white rounded-[24px] hover:bg-black font-black text-sm flex items-center gap-3 transition-all shadow-2xl active:scale-95"><CheckCircle size={22}/> 启动灰度发布</button> )}
          </div>
        </div>
      </div>
    </div>
  );

  const handleOpenRateLimitModal = (rl: RateLimit) => { setSelectedRateLimit(rl); setIsRateLimitModalOpen(true); };
  const handleOpenPolicyEditor = (policy: ServicePolicy) => { setEditingPolicy(policy); setIsPolicyEditorOpen(true); };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-3xl border border-slate-200 overflow-hidden animate-in fade-in duration-500 shadow-sm">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r border-slate-200 p-6 space-y-2 shrink-0 h-[calc(100vh-280px)] overflow-y-auto">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">流量治理架构</div>
          {[ { id: 'gateways', label: '出入口网关', icon: <LogIn size={16}/> }, { id: 'external', label: '外部服务', icon: <Link2 size={16}/> }, { id: 'routing', label: '服务路由', icon: <Share2 size={16}/> }, { id: 'policies', label: '服务策略', icon: <Sliders size={16}/> }, { id: 'ratelimit', label: '服务限流', icon: <Gauge size={16}/> }, { id: 'gray', label: '灰度发布', icon: <Rocket size={16}/> }, ].map(item => (
            <button key={item.id} onClick={() => setSubTab(item.id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all ${subTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>{item.icon} {item.label}</button>
          ))}
        </div>
        <div className="flex-1 p-10 overflow-y-auto h-[calc(100vh-280px)]">
           {subTab === 'gateways' && (
              <div className="space-y-8 animate-in slide-in-from-right-4">
                 <div className="flex justify-between items-end">
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 tracking-tight">入口与出口网关</h3>
                       <p className="text-sm text-slate-500 mt-1">管理网格边界流量，配置域名监听与 TLS 安全策略。</p>
                    </div>
                    <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 shadow-xl transition-all"><Plus size={18}/> 配置新网关</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockGateways.map(gw => (
                       <div key={gw.id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all group">
                          <div className="flex justify-between items-start mb-6">
                             <div className={`p-4 rounded-2xl ${gw.type === 'Ingress' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                {gw.type === 'Ingress' ? <LogIn size={28}/> : <LogOut size={28}/>}
                             </div>
                             <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">{gw.status}</span>
                          </div>
                          <h4 className="text-xl font-black text-slate-800">{gw.name}</h4>
                          <div className="mt-8 space-y-4">
                             <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-mono text-xs text-slate-600">
                                <Globe size={14} className="text-slate-400"/> {gw.hosts.join(', ')}
                             </div>
                          </div>
                          <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center">
                             <button className="text-indigo-600 hover:underline text-xs font-black">查看路由规则</button>
                             <button className="p-2 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100"><Settings size={18}/></button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}
          {subTab === 'gray' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
               <div className="flex justify-between items-end px-2"><div><h3 className="text-2xl font-black text-slate-800 tracking-tight">灰度发布流水线 (Gray/Canary)</h3><p className="text-sm text-slate-500 mt-1 font-medium">全自动管理灰度版本生命周期，支持权重切分、自动验证。</p></div>
                <button onClick={handleOpenGrayWizard} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-3 hover:bg-indigo-700 shadow-2xl transition-all active:scale-95"><Rocket size={20} /> 创建灰度发布单</button>
              </div>
              {mockGrays.map(gray => (
                <div key={gray.id} className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10 space-y-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><Rocket size={160}/></div>
                  <div className="flex justify-between items-start relative z-10"><div className="flex items-center gap-6"><div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100"><Activity size={32}/></div><div><h4 className="text-2xl font-black text-slate-800">{gray.name}</h4><div className="flex items-center gap-3 mt-2 text-xs font-black text-slate-400 uppercase tracking-widest"><Database size={14}/> {gray.service}<span className="text-slate-200">|</span><Clock size={14}/> 启动于 {gray.startTime}</div></div></div><div className="flex items-center gap-2"><span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase animate-pulse">状态: {gray.canary.status}</span><button className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"><MoreVertical size={24}/></button></div></div>
                  <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 relative"><div className="flex justify-between items-end mb-10"><div className="text-center w-32"><div className="text-4xl font-black text-slate-800">{gray.baseline.weight}%</div><div className="text-[10px] font-black text-slate-400 uppercase mt-2">基线版本 ({gray.baseline.version})</div></div><div className="flex-1 flex flex-col items-center px-10 gap-4"><div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">实时流量切分比例</div><div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex shadow-inner border border-slate-300"><div className="h-full bg-slate-900 transition-all duration-1000" style={{width: `${gray.baseline.weight}%`}}></div><div className="h-full bg-indigo-600 transition-all duration-1000" style={{width: `${gray.canary.weight}%`}}></div></div><div className="flex justify-between w-full mt-2"><button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors">自动递增配置 &rarr;</button><button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors">暂停发布</button></div></div><div className="text-center w-32"><div className="text-4xl font-black text-indigo-600">{gray.canary.weight}%</div><div className="text-[10px] font-black text-slate-400 uppercase mt-2">灰度版本 ({gray.canary.version})</div></div></div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[ { label: '灰度成功率', val: '99.9%', status: 'Pass', icon: <CheckCircle className="text-emerald-500" size={14}/> }, { label: '平均响应耗时', val: '45ms', status: 'Warning', icon: <AlertTriangle className="text-amber-500" size={14}/> }, { label: '灰度环境副本', val: '3 Nodes', status: 'Pass', icon: <CheckCircle className="text-emerald-500" size={14}/> }, ].map(m => ( <div key={m.label} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"><div><div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{m.label}</div><div className="text-lg font-black text-slate-800 mt-0.5">{m.val}</div></div>{m.icon}</div> ))}</div>
                  </div>
                  <div className="flex gap-4"><button className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-2"><ArrowRight size={20}/> 流量推进 (+10%)</button><button className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl flex items-center justify-center gap-2"><Check size={20}/> 完成并全量更新</button><button className="px-10 py-5 bg-red-50 text-red-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"><X size={20}/> 紧急回滚</button></div>
                </div>
              ))}
            </div>
          )}
          {subTab === 'ratelimit' && (
            <div className="space-y-8 animate-in slide-in-from-right-4"><div className="flex justify-between items-end"><div><h3 className="text-2xl font-black text-slate-800 tracking-tight">服务限流</h3><p className="text-sm text-slate-500 mt-1">使用分布式计数器保护核心后端不被流量冲垮。</p></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{mockRateLimits.map(rl => (
                <div key={rl.id} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all"><div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform group-hover:text-indigo-600"><Gauge size={120}/></div><div className="flex justify-between items-start mb-12"><div className="p-6 bg-indigo-50 text-indigo-600 rounded-[28px] shadow-inner"><Activity size={32}/></div><div className="w-16 h-8 bg-emerald-500 rounded-full flex items-center justify-end px-1.5 cursor-pointer transition-all shadow-lg shadow-emerald-100"><div className="w-5 h-5 bg-white rounded-full shadow-sm"></div></div></div><h4 className="text-2xl font-black text-slate-800 tracking-tighter">{rl.service}</h4><div className="mt-6 flex items-end gap-2"><span className="text-6xl font-black text-slate-800 tracking-tighter">{rl.limit}</span><span className="text-sm font-black text-slate-400 uppercase mb-2 tracking-widest">{rl.unit}</span></div><div className="mt-10 pt-10 border-t border-slate-50"><button onClick={() => handleOpenRateLimitModal(rl)} className="w-full py-4 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.1em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl">配置限流策略 <ArrowRight size={18}/></button></div></div>
              ))}</div>
            </div>
          )}
        </div>
      </div>
      {isGrayWizardOpen && renderGrayWizard()}
    </div>
  );
};

const ObservabilityCenter: React.FC = () => {
  const [obsTab, setObsTab] = useState<'topology' | 'tracing' | 'metrics' | 'alerts'>('topology');
  const [selectedTrace, setSelectedTrace] = useState<TraceSpan | null>(null);

  const renderTraceDetailModal = () => {
    if (!selectedTrace) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
        <div className="bg-[#0f172a] rounded-[48px] shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-white/10">
           <div className="px-12 py-10 border-b border-white/5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-8"><div className="p-5 bg-indigo-600 text-white rounded-[28px] shadow-2xl shadow-indigo-500/20"><GanttChartSquare size={36}/></div><div><h3 className="text-3xl font-black text-white tracking-tighter">{selectedTrace.operation}</h3><div className="flex items-center gap-6 mt-2"><div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest"><Fingerprint size={14}/> ID: {selectedTrace.id}</div><div className="h-4 w-px bg-white/10"></div><div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest"><Timer size={14}/> Duration: {selectedTrace.duration}ms</div></div></div></div>
              <button onClick={() => setSelectedTrace(null)} className="p-4 bg-white/5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-all group"><X size={32} className="group-hover:rotate-90 transition-all duration-300"/></button>
           </div>
           <div className="flex-1 flex overflow-hidden"><div className="flex-1 flex flex-col overflow-hidden"><div className="flex-1 overflow-y-auto p-12 bg-slate-900/30"><div className="space-y-8"><div className="flex justify-between items-center px-4"><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Execution Timeline</h4><span className="text-[10px] text-slate-600 font-bold">120ms Scale</span></div><div className="space-y-3 relative"><div className="absolute inset-y-0 left-[240px] right-0 flex justify-between opacity-5 pointer-events-none">{[0, 25, 50, 75, 100].map(p => <div key={p} className="w-px h-full bg-white"></div>)}</div>
                          {mockDetailSpans.map(span => (
                             <div key={span.id} className="flex items-center gap-6 group cursor-pointer hover:bg-white/5 p-4 rounded-3xl transition-all border border-transparent hover:border-white/5"><div className="w-[200px] shrink-0"><div className="text-xs font-black text-white truncate">{span.service}</div><div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{span.operation}</div></div><div className="flex-1 relative h-6"><div className="absolute h-full rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/20 group-hover:brightness-125 transition-all flex items-center px-3 text-[9px] font-black text-white" style={{ left: `${(span.startOffset/120)*100}%`, width: `${(span.duration/120)*100}%` }}>{span.duration}ms</div></div></div>
                          ))}
                       </div></div></div><div className="h-48 bg-[#0a0f1c] border-t border-white/5 p-8 shrink-0"><h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><TerminalSquare size={14}/> Selected Span Metadata</h5><div className="grid grid-cols-4 gap-4">{Object.entries(selectedTrace.tags).map(([k, v]) => ( <div key={k} className="bg-white/5 p-3 rounded-2xl border border-white/5"><div className="text-[8px] font-black text-slate-500 uppercase">{k}</div><div className="text-xs font-bold text-slate-300 mt-0.5 truncate">{v}</div></div> ))}</div></div></div>
              <div className="w-80 bg-slate-900 border-l border-white/5 p-10 space-y-10 shrink-0"><section><h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">Trace Insights</h4><div className="space-y-4"><div className="p-6 bg-emerald-500/10 rounded-[32px] border border-emerald-500/20"><div className="flex items-center gap-3 text-emerald-400 mb-2"><Shield size={18}/><span className="text-xs font-black">Security Pass</span></div><p className="text-[10px] text-slate-400 font-medium">链路符合加密传输策略。</p></div><div className="p-6 bg-amber-500/10 rounded-[32px] border border-amber-500/20"><div className="flex items-center gap-3 text-amber-400 mb-2"><FastForward size={18}/><span className="text-xs font-black">Slow Path</span></div><p className="text-[10px] text-slate-400 font-medium">`order-service` SQL 查询耗时占比 66%。</p></div></div></section><button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"><Map size={18}/> 拓扑依赖流</button></div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex gap-10 border-b border-slate-100 px-2">
         {[
           { id: 'topology', label: '服务拓扑图', icon: <Network size={18}/> },
           { id: 'tracing', label: '链路跟踪', icon: <History size={18}/> },
           { id: 'metrics', label: '指标分析', icon: <ChartIcon size={18}/> },
           { id: 'alerts', label: '监控告警', icon: <BellRing size={18}/> },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setObsTab(tab.id as any)}
             className={`pb-4 pt-1 px-1 text-sm font-black flex items-center gap-3 border-b-4 transition-all uppercase tracking-widest ${
               obsTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'
             }`}
           >
             {tab.icon} {tab.label}
           </button>
         ))}
      </div>

      {obsTab === 'topology' && (
        <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10 h-[650px] relative overflow-hidden group">
           <div className="absolute top-10 left-10 z-10 space-y-4">
              <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-6 rounded-[32px] shadow-xl space-y-4">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">网格实时质量</div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="flex flex-col"><span className="text-2xl font-black text-slate-800">4.5k</span><span className="text-[9px] font-bold text-slate-400 uppercase">QPS</span></div>
                    <div className="flex flex-col"><span className="text-2xl font-black text-emerald-500">99.9%</span><span className="text-[9px] font-bold text-slate-400 uppercase">Succeed</span></div>
                 </div>
                 <div className="pt-4 border-t border-slate-50 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div><span className="text-[10px] font-black text-slate-500">流量自动采样中...</span></div>
              </div>
           </div>

           <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full max-w-4xl h-full flex items-center justify-around">
                 <div className="flex flex-col items-center gap-3 group/node relative">
                    <div className="w-24 h-24 bg-slate-900 text-white rounded-[32px] flex items-center justify-center shadow-2xl relative z-10 hover:scale-110 transition-transform cursor-pointer">
                       <Globe size={32}/>
                       <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                    </div>
                    <span className="font-black text-sm text-slate-800 uppercase tracking-widest">ingress-gateway</span>
                    <div className="absolute -bottom-8 bg-white border border-slate-100 px-3 py-1 rounded-xl shadow-lg opacity-0 group-hover/node:opacity-100 transition-all text-[10px] font-bold">Latency: 2ms</div>
                 </div>

                 <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <path d="M 280 325 L 450 205" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" fill="none" className="opacity-40" />
                    <path d="M 280 325 L 450 325" stroke="#ef4444" strokeWidth="3" fill="none" className="opacity-60" />
                    <path d="M 280 325 L 450 445" stroke="#10b981" strokeWidth="2" fill="none" className="opacity-40" />
                    <circle r="4" fill="#3b82f6"><animateMotion path="M 280 325 L 450 205" dur="3s" repeatCount="indefinite" /></circle>
                    <circle r="4" fill="#ef4444"><animateMotion path="M 280 325 L 450 325" dur="2s" repeatCount="indefinite" /></circle>
                 </svg>

                 <div className="flex flex-col gap-20">
                    {[
                      { name: 'auth-service', status: 'Healthy', icon: <ShieldCheck size={28}/>, metrics: '15ms | 0%' },
                      { name: 'order-service', status: 'Warning', icon: <AlertTriangle size={28}/>, metrics: '450ms | 15%' },
                      { name: 'payment-svc', status: 'Healthy', icon: <ShieldCheck size={28}/>, metrics: '12ms | 0%' }
                    ].map((svc, i) => (
                       <div key={svc.name} className="flex flex-col items-center gap-3 group/node relative">
                          <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-xl relative z-10 group-hover:scale-110 transition-transform cursor-pointer border-4 border-white ${svc.status === 'Warning' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                             {svc.icon}
                             {svc.status === 'Warning' && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">!</div>}
                          </div>
                          <span className="font-bold text-xs text-slate-500 uppercase tracking-tighter">{svc.name}</span>
                          <div className="absolute -right-24 bg-white/80 backdrop-blur-sm border border-slate-100 p-2 rounded-xl text-[8px] font-black text-slate-400 group-hover/node:opacity-100 opacity-0 transition-all uppercase whitespace-nowrap">{svc.metrics}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
           <div className="absolute bottom-10 right-10 flex flex-col gap-3">
              <div className="flex items-center gap-4 bg-slate-900/5 px-4 py-2 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> 正常</div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 bg-rose-500 rounded-full"></div> 异常流量</div>
              </div>
           </div>
        </div>
      )}

      {obsTab === 'tracing' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[650px] animate-in slide-in-from-right-4">
           <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-800">全链路请求追踪 (Distributed Tracing)</h3>
              <div className="flex gap-3">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                    <input placeholder="Trace ID / Service..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs w-64 outline-none focus:ring-2 focus:ring-indigo-100" />
                 </div>
              </div>
           </div>
           <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <tr><th className="px-10 py-5">Operation</th><th className="px-8 py-5">Root Service</th><th className="px-8 py-5">Start Time</th><th className="px-8 py-5">Duration</th><th className="px-8 py-5">Status</th><th className="px-10 py-5 text-right">Actions</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {mockTraces.map(trace => (
                       <tr key={trace.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedTrace(trace)}>
                          <td className="px-10 py-6"><div className="font-black text-slate-800 text-sm">{trace.operation}</div><div className="text-[10px] font-mono text-slate-400 mt-0.5">{trace.id}</div></td>
                          <td className="px-8 py-6"><span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{trace.service}</span></td>
                          <td className="px-8 py-6 text-xs text-slate-500 font-bold">{trace.startTime}</td>
                          <td className="px-8 py-6"><div className="flex items-center gap-3"><div className="flex-1 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${trace.duration > 200 ? 'bg-orange-50' : 'bg-indigo-50'}`} style={{width: `${(trace.duration/500)*100}%`}}></div></div><span className="text-xs font-black text-slate-700">{trace.duration}ms</span></div></td>
                          <td className="px-8 py-6"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${trace.status === 'OK' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{trace.status === 'OK' ? <CheckCircle size={12}/> : <Bug size={12}/>} {trace.status}</span></td>
                          <td className="px-10 py-6 text-right"><button className="text-indigo-600 hover:underline text-xs font-black flex items-center gap-1 ml-auto">详情 <ChevronRight size={14}/></button></td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {obsTab === 'metrics' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
           {/* Top Filter Bar */}
           <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3"><span className="text-[10px] font-black text-slate-400 uppercase">目标服务:</span><select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-black text-slate-700 outline-none"><option>order-service</option><option>auth-service</option></select></div>
                 <div className="flex items-center gap-3"><span className="text-[10px] font-black text-slate-400 uppercase">时间范围:</span><div className="flex bg-slate-100 p-1 rounded-xl">{['1h', '6h', '24h'].map(t => <button key={t} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${t==='1h'?'bg-white text-indigo-600 shadow-sm':'text-slate-400'}`}>{t}</button>)}</div></div>
              </div>
              <button className="p-3 hover:bg-slate-50 text-indigo-600 transition-all"><RefreshCw size={20}/></button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 flex justify-between"><span>Throughput (Requests / Second)</span><TrendingUp size={16}/></h4>
                 <div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={mockMetricData}><defs><linearGradient id="colorQps" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="time" axisLine={false} tickLine={false} fontSize={10} stroke="#94a3b8"/><YAxis axisLine={false} tickLine={false} fontSize={10} stroke="#94a3b8"/><Tooltip contentStyle={{borderRadius: '16px', border: 'none'}}/><Area type="monotone" dataKey="qps" stroke="#6366f1" fill="url(#colorQps)" strokeWidth={4}/></AreaChart></ResponsiveContainer></div>
              </div>
              <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 flex justify-between"><span>Success Rate & Latency (ms)</span><Pulse size={16}/></h4>
                 <div className="h-64"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={mockMetricData}><XAxis dataKey="time" hide/><YAxis yAxisId="left" hide/><YAxis yAxisId="right" hide/><Tooltip/><Bar yAxisId="left" dataKey="latency" fill="#f59e0b" radius={[4,4,0,0]} barSize={20}/><Line yAxisId="right" type="step" dataKey="error" stroke="#ef4444" strokeWidth={3} dot={false}/></ComposedChart></ResponsiveContainer></div>
              </div>
           </div>
        </div>
      )}

      {obsTab === 'alerts' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center"><h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><BellRing size={24} className="text-rose-500" /> 活跃告警通知</h3></div>
                    <div className="divide-y divide-slate-50">
                       {mockMicroAlerts.map(alert => (
                          <div key={alert.id} className="p-8 hover:bg-rose-50/30 transition-colors flex items-start gap-6 group cursor-pointer">
                             <div className={`p-4 rounded-2xl ${alert.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}><AlertOctagon size={28}/></div>
                             <div className="flex-1">
                                <div className="flex justify-between items-center mb-1"><h4 className="font-black text-slate-800 text-lg">{alert.message}</h4><span className="text-[10px] font-black text-slate-400 uppercase">{alert.timestamp}</span></div>
                                <div className="flex items-center gap-4"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Source: {alert.source}</span><span className={`text-[10px] font-black uppercase ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>{alert.severity}</span></div>
                             </div>
                             <button className="text-indigo-600 p-2 hover:bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"><ChevronRight/></button>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-xl flex flex-col justify-between h-full min-h-[400px]">
                    <div>
                       <div className="p-4 bg-white/20 w-fit rounded-[24px] mb-8"><Shield size={32}/></div>
                       <h3 className="text-2xl font-black mb-4">智能告警策略</h3>
                       <p className="text-indigo-100/70 text-sm leading-relaxed mb-10">基于 Envoy Access Log 进行机器学习建模，自动识别非正常的流量激增或潜在的暴力攻击。目前已启用 8 项微隔离保护规则。</p>
                       <div className="space-y-3">
                          {['延迟离群检测', '错误率环比监控', '5xx 根因探测'].map(rule => (
                             <div key={rule} className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glow"></div><span className="text-xs font-bold">{rule}</span></div>
                          ))}
                       </div>
                    </div>
                    <button className="mt-10 w-full py-4 bg-white text-indigo-600 rounded-2xl font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-lg">管理所有规则 <ArrowRight size={20}/></button>
                 </div>
              </div>
           </div>
        </div>
      )}
      {renderTraceDetailModal()}
    </div>
  );
};

// --- Main Module ---

export const Microservices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'management' | 'traffic' | 'observability'>('management');

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-4">
        <div className="space-y-3"><h2 className="text-5xl font-black text-slate-800 tracking-tighter">微服务治理中心</h2><p className="text-slate-500 text-base font-medium">基于 Service Mesh 的全栈治理方案，涵盖流量调控、全链路监控与生命周期管理。</p></div>
        <div className="flex gap-4 shrink-0"><div className="bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-1">
              {[ { id: 'management', label: '服务管理', icon: <LayoutList size={16}/> }, { id: 'traffic', label: '流量管理', icon: <Zap size={16}/> }, { id: 'observability', label: '可观测性', icon: <Activity size={16}/> } ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3 ${ activeTab === t.id ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-500 hover:bg-slate-50' }`}>{t.icon} {t.label}</button>
              ))}
           </div>
        </div>
      </div>
      <div className="px-4">
        {activeTab === 'management' && <ServiceManagement />}
        {activeTab === 'traffic' && <TrafficManagement />}
        {activeTab === 'observability' && <ObservabilityCenter />}
      </div>
    </div>
  );
};
