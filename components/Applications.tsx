
import React, { useState, useEffect } from 'react';
import { Workload, Pod, Application, ApplicationTemplate, ApplicationScalingConfig, ApplicationRevision } from '../types';
import { 
  Box, Play, Pause, RefreshCw, Copy, Check, Terminal, Cpu, Database, 
  Settings, ArrowLeft, History, RotateCcw, LayoutGrid, Activity, 
  Layers, GitCommit, AlertTriangle, X, Rocket, 
  Globe, Zap, Network, Scale, Plus, Trash2, Edit, FileText, 
  Search, Clock, Eye, Download, Upload, Save, ChevronDown, ChevronRight, FileCode, Terminal as TerminalIcon,
  LayoutTemplate, ShoppingBag, Server, MoreVertical, Smartphone, Monitor, Bug, Lock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Mock Data ---

const mockApplications: Application[] = [
  {
    id: 'app-001', name: 'Mall Frontend', namespace: 'production', version: 'v1.2.0', status: 'Healthy', healthScore: 98,
    description: '电商前台 Web 服务，包含 Nginx 和静态资源。',
    resources: { workloads: ['dep-1'], services: ['svc-1'], ingresses: ['ing-1'], configMaps: ['cm-1'] },
    metrics: { cpu: '450m', memory: '512Mi', requests: '1.2k/s' },
    scalingConfig: {
        enabled: true, minReplicas: 2, maxReplicas: 10, currentReplicas: 3,
        metrics: [{ id: 'r1', metricType: 'CPU', targetValue: 70, unit: '%' }],
        schedules: [{ id: 's1', name: '早高峰扩容', schedule: '0 8 * * 1-5', targetReplicas: 6, enabled: true }]
    },
    createdAt: '2023-10-01', updatedAt: '2023-10-25'
  },
  {
    id: 'app-002', name: 'Auth Service', namespace: 'production', version: 'v2.1.0', status: 'Healthy', healthScore: 100,
    description: '统一认证授权服务 (OIDC/OAuth2)。',
    resources: { workloads: ['dep-2'], services: ['svc-2'], ingresses: [], configMaps: [] },
    metrics: { cpu: '200m', memory: '380Mi', requests: '500/s' },
    scalingConfig: {
        enabled: false, minReplicas: 1, maxReplicas: 5, currentReplicas: 1, metrics: [], schedules: []
    },
    createdAt: '2023-09-15', updatedAt: '2023-10-20'
  }
];

const mockRevisions: ApplicationRevision[] = [
    { revision: 3, image: 'nginx:1.21.3', message: 'Update to v1.21.3', createdAt: '2023-10-25 10:00', current: true },
    { revision: 2, image: 'nginx:1.21.1', message: 'Fix config map mount', createdAt: '2023-10-24 14:20', current: false },
    { revision: 1, image: 'nginx:1.21.0', message: 'Initial deployment', createdAt: '2023-10-01 09:00', current: false },
];

const mockPods: Pod[] = [
  { id: 'pod-1', name: 'frontend-6789-abcde', namespace: 'production', node: 'k8s-worker-1', status: 'Running', restarts: 0, age: '2d', ip: '10.244.1.5', cpuUsage: '120m', memUsage: '256Mi' },
  { id: 'pod-2', name: 'frontend-6789-fghij', namespace: 'production', node: 'k8s-worker-2', status: 'Running', restarts: 1, age: '2d', ip: '10.244.2.8', cpuUsage: '110m', memUsage: '240Mi' },
  { id: 'pod-3', name: 'frontend-6789-klmno', namespace: 'production', node: 'k8s-worker-3', status: 'Running', restarts: 0, age: '1h', ip: '10.244.3.12', cpuUsage: '90m', memUsage: '220Mi' },
];

const mockTemplates: ApplicationTemplate[] = [
  { id: 'tpl-1', name: 'Nginx Web Server', description: 'High performance web server and reverse proxy server.', version: '1.25.3', category: 'Web Server', maintainer: 'Bitnami', icon: 'server' },
  { id: 'tpl-2', name: 'Redis Cluster', description: 'In-memory data structure store, used as a database, cache and message broker.', version: '7.2.1', category: 'Database', maintainer: 'Redis Labs', icon: 'database' },
  { id: 'tpl-3', name: 'MySQL Database', description: 'The world\'s most popular open source database.', version: '8.1.0', category: 'Database', maintainer: 'Oracle', icon: 'database' },
  { id: 'tpl-4', name: 'Jenkins', description: 'The leading open source automation server.', version: '2.414', category: 'DevOps', maintainer: 'Jenkins Project', icon: 'settings' },
];

const mockWorkloads: Workload[] = [
  { id: 'wl-1', name: 'frontend-deployment', type: 'Deployment', namespace: 'production', replicas: 3, availableReplicas: 3, image: 'nginx:alpine', status: 'Healthy', cpuRequest: '200m', memRequest: '256Mi', createdAt: '2023-10-01' },
  { id: 'wl-2', name: 'auth-service', type: 'Deployment', namespace: 'production', replicas: 2, availableReplicas: 2, image: 'auth-svc:v2', status: 'Healthy', cpuRequest: '500m', memRequest: '512Mi', createdAt: '2023-09-15' },
  { id: 'wl-3', name: 'data-processor', type: 'StatefulSet', namespace: 'data', replicas: 3, availableReplicas: 3, image: 'processor:v1', status: 'Progressing', cpuRequest: '1000m', memRequest: '2Gi', createdAt: '2023-10-20' },
  { id: 'wl-4', name: 'log-collector', type: 'DaemonSet', namespace: 'kube-system', replicas: 5, availableReplicas: 5, image: 'fluentd:latest', status: 'Healthy', cpuRequest: '100m', memRequest: '128Mi', createdAt: '2023-01-10' },
];

const mockMonitorData = [
    { time: '10:00', cpu: 45, memory: 55 }, { time: '10:05', cpu: 48, memory: 56 },
    { time: '10:10', cpu: 52, memory: 58 }, { time: '10:15', cpu: 65, memory: 60 },
    { time: '10:20', cpu: 58, memory: 59 }, { time: '10:25', cpu: 45, memory: 55 },
];

// --- Main Component ---

export const Applications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'native' | 'templates' | 'workloads'>('native');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  // App Detail View State
  const [appDetailTab, setAppDetailTab] = useState<'overview' | 'pods' | 'revisions' | 'observability' | 'scaling'>('overview');
  const [scalingConfig, setScalingConfig] = useState<ApplicationScalingConfig | undefined>(undefined);

  // Wizards & Modals
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [isYamlMode, setIsYamlMode] = useState(false);
  
  // Terminal State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalMode, setTerminalMode] = useState<'exec' | 'debug'>('exec');
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  
  // Helpers
  const handleOpenTerminal = (pod: Pod, mode: 'exec' | 'debug' = 'exec') => {
    setSelectedPod(pod);
    setTerminalMode(mode);
    setIsTerminalOpen(true);
  };

  useEffect(() => {
    if (selectedApp) {
        setScalingConfig(selectedApp.scalingConfig);
        setAppDetailTab('overview');
    }
  }, [selectedApp]);

  // --- Renderers ---

  const renderCreateWizard = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <div>
               <h3 className="text-xl font-bold text-slate-800">创建原生应用</h3>
               <p className="text-sm text-slate-500 mt-1">定义应用模型、工作负载、网络与配置。</p>
             </div>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                  <button 
                    onClick={() => setIsYamlMode(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${!isYamlMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    向导模式
                  </button>
                  <button 
                    onClick={() => setIsYamlMode(true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isYamlMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    YAML 模式
                  </button>
               </div>
               <button onClick={() => { setIsCreateWizardOpen(false); setCreateStep(1); }}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
             </div>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
             {isYamlMode ? (
                <div className="w-full h-full bg-[#1e1e1e] p-6 overflow-auto">
                    <textarea 
                        className="w-full h-full bg-transparent text-slate-300 font-mono text-sm outline-none resize-none"
                        defaultValue={`apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: nginx:latest
        ports:
        - containerPort: 80`}
                    />
                </div>
             ) : (
             <>
             {/* Wizard Steps Sidebar */}
             <div className="w-64 bg-slate-50 border-r border-slate-200 p-6 space-y-2">
                {[
                  { step: 1, label: '基础信息', desc: '名称与命名空间', icon: <FileText size={18}/> },
                  { step: 2, label: '工作负载', desc: 'Deployment/StatefulSet', icon: <Box size={18}/> },
                  { step: 3, label: '网络与服务', desc: 'Service & Ingress', icon: <Network size={18}/> },
                  { step: 4, label: '配置挂载', desc: 'ConfigMap & Secret', icon: <Settings size={18}/> },
                ].map(item => (
                   <div key={item.step} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${createStep === item.step ? 'bg-white shadow-sm ring-1 ring-blue-100' : 'text-slate-500'}`}>
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${createStep === item.step ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-500'}`}>
                         {createStep > item.step ? <Check size={14}/> : item.step}
                      </div>
                      <div>
                          <div className={`text-sm font-medium ${createStep === item.step ? 'text-blue-700' : 'text-slate-700'}`}>{item.label}</div>
                          <div className="text-xs text-slate-400">{item.desc}</div>
                      </div>
                   </div>
                ))}
             </div>

             {/* Wizard Content */}
             <div className="flex-1 p-8 overflow-y-auto bg-white">
                {createStep === 1 && (
                   <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-right-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <span className="w-1 h-6 bg-blue-600 rounded-full"></span> 应用基本定义
                      </h4>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">应用名称 <span className="text-red-500">*</span></label>
                            <input className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. mall-backend" />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">项目 / 命名空间 <span className="text-red-500">*</span></label>
                            <select className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                               <option>production</option>
                               <option>staging</option>
                               <option>default</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">负责人</label>
                            <input className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-50 text-slate-500" value="Admin" disabled />
                         </div>
                         <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">描述信息</label>
                            <textarea className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={3} placeholder="描述该应用的功能及用途..." />
                         </div>
                      </div>
                   </div>
                )}

                {createStep === 2 && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full"></span> 容器工作负载
                          </h4>
                          <button className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-1">
                              <Plus size={16}/> 添加负载
                          </button>
                      </div>
                      
                      {/* Workload Item */}
                      <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow relative group">
                         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                             <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600"><Edit size={16}/></button>
                             <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                         </div>
                         <div className="grid grid-cols-12 gap-4">
                             <div className="col-span-3">
                                <label className="block text-xs font-bold text-slate-500 mb-1">负载名称</label>
                                <input className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" placeholder="web-server" defaultValue="main-deployment" />
                             </div>
                             <div className="col-span-3">
                                <label className="block text-xs font-bold text-slate-500 mb-1">类型</label>
                                <select className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm bg-white">
                                    <option>Deployment (Stateless)</option>
                                    <option>StatefulSet (Stateful)</option>
                                    <option>DaemonSet</option>
                                    <option>CronJob</option>
                                </select>
                             </div>
                             <div className="col-span-4">
                                <label className="block text-xs font-bold text-slate-500 mb-1">镜像地址</label>
                                <input className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm font-mono" placeholder="nginx:latest" />
                             </div>
                             <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">副本数</label>
                                <input type="number" className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" defaultValue={1} />
                             </div>
                         </div>
                         
                         {/* Resources Toggle */}
                         <div className="mt-4 pt-3 border-t border-slate-100">
                             <div className="text-xs font-bold text-slate-500 mb-2">资源规格 (Resources)</div>
                             <div className="flex gap-4 items-center">
                                 <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                                     <Cpu size={14} className="text-slate-400"/>
                                     <span className="text-sm font-mono text-slate-700">CPU: 0.5 Core</span>
                                 </div>
                                 <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                                     <Database size={14} className="text-slate-400"/>
                                     <span className="text-sm font-mono text-slate-700">Mem: 512 MiB</span>
                                 </div>
                                 <button className="text-xs text-blue-600 hover:underline">修改规格</button>
                             </div>
                         </div>
                      </div>
                   </div>
                )}

                {createStep === 3 && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <span className="w-1 h-6 bg-blue-600 rounded-full"></span> 网络暴露与访问
                      </h4>
                      
                      {/* Service Section */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                         <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-white border border-slate-200 rounded-lg"><Layers size={20} className="text-blue-600"/></div>
                                 <div>
                                     <div className="font-bold text-slate-700">Service (四层负载均衡)</div>
                                     <div className="text-xs text-slate-500">自动创建 ClusterIP / NodePort</div>
                                 </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked/>
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                             </label>
                         </div>
                         <div className="grid grid-cols-3 gap-4 pl-14">
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">类型</label>
                                 <select className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm bg-white"><option>ClusterIP</option><option>NodePort</option><option>LoadBalancer</option></select>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">服务端口</label>
                                 <input className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" placeholder="80" />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">容器端口</label>
                                 <input className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" placeholder="8080" />
                             </div>
                         </div>
                      </div>

                      {/* Ingress Section */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                         <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-white border border-slate-200 rounded-lg"><Globe size={20} className="text-purple-600"/></div>
                                 <div>
                                     <div className="font-bold text-slate-700">Ingress (七层路由)</div>
                                     <div className="text-xs text-slate-500">配置 HTTP/HTTPS 域名访问规则</div>
                                 </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer"/>
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                             </label>
                         </div>
                      </div>
                   </div>
                )}

                {createStep === 4 && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <span className="w-1 h-6 bg-blue-600 rounded-full"></span> 配置与保密
                      </h4>
                      
                      <div className="border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                          <Settings size={48} className="mb-4 opacity-20"/>
                          <p className="mb-4 text-sm font-medium">暂无配置挂载</p>
                          <div className="flex gap-3">
                              <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                                  <FileText size={16}/> 挂载 ConfigMap
                              </button>
                              <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                                  <Lock size={16}/> 挂载 Secret
                              </button>
                          </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 flex gap-3">
                          <Zap size={18} className="flex-shrink-0"/>
                          <div>
                              <div className="font-bold">支持配置热更新</div>
                              <p className="mt-1 opacity-80">当 ConfigMap 内容变更时，系统将自动触发滚动更新以加载最新配置。</p>
                          </div>
                      </div>
                   </div>
                )}
             </div>
             </>
             )}
          </div>

          <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
             <button className="text-slate-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1" onClick={() => alert('Save as draft')}>
                 <Save size={16}/> 保存草稿
             </button>
             <div className="flex gap-3">
                {createStep > 1 && !isYamlMode && (
                    <button onClick={() => setCreateStep(s => s-1)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors">上一步</button>
                )}
                {createStep < 4 && !isYamlMode ? (
                    <button onClick={() => setCreateStep(s => s+1)} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">下一步</button>
                ) : (
                    <button onClick={() => { setIsCreateWizardOpen(false); alert('应用创建成功！'); }} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                       <Rocket size={18}/> 立即部署
                    </button>
                )}
             </div>
          </div>
       </div>
    </div>
  );

  const renderTerminal = () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
       <div className="bg-[#1e1e1e] w-full max-w-5xl h-[600px] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-700">
          <div className="px-4 py-2 bg-[#2d2d2d] flex justify-between items-center border-b border-black">
             <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-slate-300 text-sm font-mono">
                    {terminalMode === 'debug' ? <Bug size={14} className="text-orange-500"/> : <TerminalIcon size={14} className="text-green-500"/>}
                    {terminalMode === 'debug' ? `[DEBUG MODE] ephem-debug-${selectedPod?.name}` : `root@${selectedPod?.name}`}
                 </div>
                 {/* File Transfer Toolbar */}
                 <div className="h-4 w-px bg-slate-600"></div>
                 <div className="flex items-center gap-2">
                    <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors" title="Upload File">
                        <Upload size={12}/> Upload
                    </button>
                    <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors" title="Download File">
                        <Download size={12}/> Download
                    </button>
                 </div>
             </div>
             <button onClick={() => setIsTerminalOpen(false)}><X size={16} className="text-slate-400 hover:text-white"/></button>
          </div>
          
          <div className="flex-1 p-4 font-mono text-sm text-slate-300 overflow-y-auto font-medium">
             <div className="opacity-50 mb-4 text-xs">
                {terminalMode === 'debug' 
                    ? "Targeting ephemeral container 'debugger' in pod '" + selectedPod?.name + "'..." 
                    : "Connecting to container 'main'..."}
                <br/>
                Connected.
             </div>

             {terminalMode === 'exec' ? (
                 <>
                    <div className="text-green-500">root@{selectedPod?.name}:/# <span className="text-slate-300">ls -la</span></div>
                    <div className="opacity-80 mt-1">
                        total 64<br/>
                        drwxr-xr-x   1 root root 4096 Oct 25 10:00 .<br/>
                        drwxr-xr-x   1 root root 4096 Oct 25 10:00 ..<br/>
                        -rw-r--r--   1 root root  512 Oct 25 09:55 app.conf<br/>
                        drwxr-xr-x   2 root root 4096 Oct 25 09:55 bin<br/>
                    </div>
                    <div className="text-green-500 mt-2">root@{selectedPod?.name}:/# <span className="animate-pulse">_</span></div>
                 </>
             ) : (
                 <>
                    <div className="text-orange-500">debugger:/# <span className="text-slate-300">apk add curl bind-tools</span></div>
                    <div className="opacity-80 mt-1">
                        (1/2) Installing bind-tools (9.16.20-r1)<br/>
                        (2/2) Installing curl (7.79.1-r0)<br/>
                        Executing busybox-1.33.1-r6.trigger<br/>
                        OK: 18 MiB in 24 packages
                    </div>
                    <div className="text-orange-500 mt-2">debugger:/# <span className="text-slate-300">netstat -tulpn</span></div>
                    <div className="opacity-80 mt-1">
                        Active Internet connections (only servers)<br/>
                        Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name<br/>
                        tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1/nginx
                    </div>
                    <div className="text-orange-500 mt-2">debugger:/# <span className="animate-pulse">_</span></div>
                 </>
             )}
          </div>
       </div>
    </div>
  );

  const renderAppDetail = () => {
      if (!selectedApp) return null;
      return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Detail Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            {selectedApp.name}
                            <span className={`text-sm px-2 py-0.5 rounded-full border flex items-center gap-1 ${selectedApp.status === 'Healthy' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${selectedApp.status === 'Healthy' ? 'bg-green-600' : 'bg-yellow-600'}`}></span>
                                {selectedApp.status}
                            </span>
                        </h2>
                        <div className="flex gap-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><Layers size={14}/> NS: {selectedApp.namespace}</span>
                            <span className="flex items-center gap-1"><GitCommit size={14}/> {selectedApp.version}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                        <FileCode size={16}/> 查看 YAML
                    </button>
                    <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                        <RefreshCw size={16}/> 滚动重启
                    </button>
                    <button className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                        <Trash2 size={16}/> 删除应用
                    </button>
                </div>
            </div>

            {/* Detail Tabs */}
            <div className="border-b border-slate-200 flex gap-6">
                {[
                  { id: 'overview', label: '应用总览 (Topology)', icon: <LayoutGrid size={16}/> },
                  { id: 'pods', label: '容器组 (Pods)', icon: <Box size={16}/> },
                  { id: 'revisions', label: '版本快照', icon: <History size={16}/> },
                  { id: 'observability', label: '可观测性', icon: <Activity size={16}/> },
                  { id: 'scaling', label: '弹性伸缩', icon: <Scale size={16}/> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setAppDetailTab(tab.id as any)}
                        className={`pb-3 pt-1 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                            appDetailTab === tab.id 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* 1. Overview / Topology */}
                {appDetailTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Topology Visualization (Simplified) */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Network size={18}/> 资源拓扑图</h3>
                            <div className="flex items-center justify-center gap-16 py-8 relative">
                                {/* Ingress */}
                                <div className="flex flex-col items-center gap-2 relative z-10">
                                    <div className="w-14 h-14 bg-purple-50 text-purple-600 border border-purple-200 rounded-xl flex items-center justify-center shadow-sm">
                                        <Globe size={24}/>
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">Ingress</span>
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">mall.com</span>
                                </div>
                                {/* Connector */}
                                <div className="w-16 h-0.5 bg-slate-300 absolute left-[calc(50%-120px)] top-[50%] -translate-y-[20px]"></div>

                                {/* Service */}
                                <div className="flex flex-col items-center gap-2 relative z-10">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                                        <Layers size={24}/>
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">Service</span>
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">ClusterIP</span>
                                </div>
                                {/* Connector */}
                                <div className="w-16 h-0.5 bg-slate-300 absolute right-[calc(50%-120px)] top-[50%] -translate-y-[20px]"></div>

                                {/* Workload */}
                                <div className="flex flex-col items-center gap-2 relative z-10">
                                    <div className="w-14 h-14 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl flex items-center justify-center shadow-sm relative">
                                        <Box size={24}/>
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">3</div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">Workload</span>
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">Deployment</span>
                                </div>
                            </div>
                        </div>

                        {/* Resource Details Grid */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2"><Cpu size={16}/> 计算资源</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1"><span>CPU Usage</span><span className="font-bold">1.2 / 2 Cores</span></div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full"><div className="bg-blue-500 w-[60%] h-full rounded-full"></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1"><span>Mem Usage</span><span className="font-bold">450 / 1024 MiB</span></div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full"><div className="bg-purple-500 w-[45%] h-full rounded-full"></div></div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2"><Activity size={16}/> 实时状态</h4>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex justify-between"><span>Health Score:</span> <span className="text-green-600 font-bold">98/100</span></div>
                                    <div className="flex justify-between"><span>Restarts (24h):</span> <span>0</span></div>
                                    <div className="flex justify-between"><span>Last Update:</span> <span>10 mins ago</span></div>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2"><Globe size={16}/> 访问入口</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center gap-2 truncate">
                                        <Globe size={12} className="text-slate-400 flex-shrink-0"/>
                                        <a href="#" className="text-blue-600 hover:underline truncate">https://mall.example.com</a>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center gap-2 truncate">
                                        <Network size={12} className="text-slate-400 flex-shrink-0"/>
                                        <span className="text-slate-600 truncate">10.96.0.10:80 (ClusterIP)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Pod List */}
                {appDetailTab === 'pods' && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Pod 名称</th>
                                    <th className="px-6 py-3">状态</th>
                                    <th className="px-6 py-3">节点</th>
                                    <th className="px-6 py-3">IP 地址</th>
                                    <th className="px-6 py-3">重启次数</th>
                                    <th className="px-6 py-3">资源使用</th>
                                    <th className="px-6 py-3 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {mockPods.map(pod => (
                                    <tr key={pod.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono font-medium text-slate-700">{pod.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {pod.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{pod.node}</td>
                                        <td className="px-6 py-4 text-slate-600">{pod.ip}</td>
                                        <td className="px-6 py-4 text-slate-600">{pod.restarts}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            <div>CPU: {pod.cpuUsage}</div>
                                            <div>Mem: {pod.memUsage}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                                            <div className="flex items-center bg-slate-100 rounded-md border border-slate-200 overflow-hidden">
                                                <button onClick={() => handleOpenTerminal(pod, 'exec')} className="text-xs text-slate-700 px-3 py-1.5 hover:bg-white hover:text-blue-600 transition-colors flex items-center gap-1 border-r border-slate-200">
                                                    <TerminalIcon size={12}/> Exec
                                                </button>
                                                <button onClick={() => handleOpenTerminal(pod, 'debug')} className="text-xs text-slate-700 px-3 py-1.5 hover:bg-white hover:text-orange-600 transition-colors flex items-center gap-1">
                                                    <Bug size={12}/> Debug
                                                </button>
                                            </div>
                                            <button className="text-xs bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-50 flex items-center gap-1">
                                                <FileText size={12}/> 日志
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 3. Revisions */}
                {appDetailTab === 'revisions' && (
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm items-center">
                            <History size={20} />
                            系统会自动记录每次应用变更配置。您可以随时回滚到任一历史版本。
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Revision</th>
                                        <th className="px-6 py-3">镜像版本</th>
                                        <th className="px-6 py-3">变更说明</th>
                                        <th className="px-6 py-3">变更时间</th>
                                        <th className="px-6 py-3 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {mockRevisions.map(rev => (
                                        <tr key={rev.revision} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">{rev.revision}</div>
                                                {rev.current && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Current</span>}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-600">{rev.image}</td>
                                            <td className="px-6 py-4 text-slate-600">{rev.message}</td>
                                            <td className="px-6 py-4 text-slate-500">{rev.createdAt}</td>
                                            <td className="px-6 py-4 text-right">
                                                {!rev.current && (
                                                    <button className="text-xs bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-50 hover:text-blue-600 flex items-center gap-1 ml-auto">
                                                        <RotateCcw size={12}/> 回滚至此版本
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 4. Observability */}
                {appDetailTab === 'observability' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><Cpu size={16}/> CPU Usage</h4>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockMonitorData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                                            <Tooltip />
                                            <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><Database size={16}/> Memory Usage</h4>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockMonitorData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                                            <Tooltip />
                                            <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fillOpacity={0.1} fill="#8b5cf6" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-sm overflow-hidden">
                             <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                                 <h4 className="text-slate-200 text-sm font-bold flex items-center gap-2"><TerminalIcon size={14}/> 实时日志流</h4>
                                 <div className="flex gap-2">
                                     <button className="text-xs text-slate-400 hover:text-white bg-slate-700 px-2 py-1 rounded">暂停滚动</button>
                                     <button className="text-xs text-slate-400 hover:text-white bg-slate-700 px-2 py-1 rounded">下载日志</button>
                                 </div>
                             </div>
                             <div className="p-4 font-mono text-xs text-slate-400 h-48 overflow-y-auto space-y-1">
                                 <div>[INFO] 2023-10-25 10:25:01 Initializing application context...</div>
                                 <div>[INFO] 2023-10-25 10:25:02 Connection to database established.</div>
                                 <div className="text-yellow-500">[WARN] 2023-10-25 10:25:05 Cache warmup took longer than expected (150ms).</div>
                                 <div>[INFO] 2023-10-25 10:25:06 Server started on port 8080.</div>
                                 <div>[INFO] 2023-10-25 10:25:10 Incoming request GET /health 200 OK</div>
                                 <div>[INFO] 2023-10-25 10:25:12 Incoming request GET /api/v1/products 200 OK</div>
                             </div>
                        </div>
                    </div>
                )}

                {/* 5. Scaling */}
                {appDetailTab === 'scaling' && scalingConfig && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                             <div>
                                 <h4 className="font-bold text-slate-800">弹性伸缩 (HPA)</h4>
                                 <p className="text-sm text-slate-500 mt-1">根据 CPU/Memory 或自定义指标自动调整副本数。</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={scalingConfig.enabled} readOnly/>
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                             </label>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-700 mb-4 text-sm">副本数范围</h4>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">最小副本 (Min)</label>
                                        <input type="number" className="border border-slate-300 rounded px-3 py-2 w-24 text-center font-bold" value={scalingConfig.minReplicas} readOnly/>
                                    </div>
                                    <div className="h-px bg-slate-300 w-8"></div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">最大副本 (Max)</label>
                                        <input type="number" className="border border-slate-300 rounded px-3 py-2 w-24 text-center font-bold" value={scalingConfig.maxReplicas} readOnly/>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-700 mb-4 text-sm">当前策略</h4>
                                <div className="space-y-2">
                                    {scalingConfig.metrics.map((m, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                            <Activity size={14} className="text-blue-500"/>
                                            <span>当 <b>{m.metricType}</b> 利用率超过 <b>{m.targetValue}{m.unit}</b> 时扩容</span>
                                        </div>
                                    ))}
                                    {scalingConfig.schedules.map((s, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                            <Clock size={14} className="text-purple-500"/>
                                            <span>{s.name}: <b>{s.schedule}</b> 调整至 <b>{s.targetReplicas}</b> 副本</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">应用交付中心</h2>
           <p className="text-slate-500 text-sm mt-1">管理原生应用、应用商店模板及工作负载。</p>
        </div>
        <button 
           onClick={() => setIsCreateWizardOpen(true)}
           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={18} />
          <span>创建原生应用</span>
        </button>
      </div>

      <div className="border-b border-slate-200 flex gap-6">
         {[
           { id: 'native', label: '原生应用 (Native Apps)', icon: <LayoutTemplate size={16} /> },
           { id: 'templates', label: '应用商店 (Template Center)', icon: <ShoppingBag size={16} /> },
           { id: 'workloads', label: '全局负载 (Workloads)', icon: <Server size={16} /> },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`pb-3 pt-1 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
               activeTab === tab.id 
               ? 'border-blue-500 text-blue-600' 
               : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
             }`}
           >
             {tab.icon}
             {tab.label}
           </button>
         ))}
      </div>

      {activeTab === 'native' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {mockApplications.map(app => (
               <div 
                 key={app.id} 
                 onClick={() => setSelectedApp(app)}
                 className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
               >
                  <div className={`absolute top-0 left-0 w-1 h-full ${app.status === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div className="flex justify-between items-start mb-4 pl-2">
                     <div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{app.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{app.namespace}</p>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-xs font-medium ${app.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {app.status}
                     </span>
                  </div>

                  <div className="space-y-4 pl-2">
                     <p className="text-sm text-slate-600 line-clamp-2 h-10">{app.description}</p>
                     <div className="flex items-center gap-4 text-xs text-slate-500">
                         <div className="flex items-center gap-1"><Box size={14}/> {app.resources.workloads.length} Workloads</div>
                         <div className="flex items-center gap-1"><Globe size={14}/> {app.resources.ingresses.length} Ingress</div>
                     </div>
                  </div>

                  <div className="mt-6 pl-2 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                     <span>Updated: {app.updatedAt}</span>
                     <button className="text-blue-600 hover:underline">Manage &rarr;</button>
                  </div>
               </div>
            ))}
         </div>
      )}

      {activeTab === 'templates' && (
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in">
            {mockTemplates.map(tpl => (
                <div key={tpl.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${tpl.icon === 'database' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                           {tpl.icon === 'database' ? <Database size={24}/> : tpl.icon === 'server' ? <Server size={24}/> : <Settings size={24}/>}
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{tpl.version}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">{tpl.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 flex-1 line-clamp-3">{tpl.description}</p>
                    <div className="mt-auto pt-4 border-t border-slate-100">
                        <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-sm py-2 rounded-lg transition-colors">
                           Deploy
                        </button>
                    </div>
                </div>
            ))}
         </div>
      )}

      {activeTab === 'workloads' && (
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
             <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-500 font-medium">
                     <tr>
                         <th className="px-6 py-3">Name</th>
                         <th className="px-6 py-3">Type</th>
                         <th className="px-6 py-3">Namespace</th>
                         <th className="px-6 py-3">Pods</th>
                         <th className="px-6 py-3">Image</th>
                         <th className="px-6 py-3 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {mockWorkloads.map(wl => (
                         <tr key={wl.id} className="hover:bg-slate-50">
                             <td className="px-6 py-4 font-medium text-slate-800">{wl.name}</td>
                             <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{wl.type}</span></td>
                             <td className="px-6 py-4 text-slate-500">{wl.namespace}</td>
                             <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                     <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                         <div className="bg-green-500 h-full" style={{width: `${(wl.availableReplicas/wl.replicas)*100}%`}}></div>
                                     </div>
                                     <span className="text-xs">{wl.availableReplicas}/{wl.replicas}</span>
                                 </div>
                             </td>
                             <td className="px-6 py-4 font-mono text-xs text-slate-600">{wl.image}</td>
                             <td className="px-6 py-4 text-right flex justify-end gap-2 text-slate-400">
                                 <button className="hover:text-blue-600"><Edit size={16}/></button>
                                 <button className="hover:text-red-600"><Trash2 size={16}/></button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      )}

      {isTerminalOpen && renderTerminal()}
      {isCreateWizardOpen && renderCreateWizard()}
      {selectedApp && !isCreateWizardOpen && renderAppDetail()}
    </div>
  );
};
