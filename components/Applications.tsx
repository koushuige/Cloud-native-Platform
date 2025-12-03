
import React, { useState, useEffect, useRef } from 'react';
import { Workload, Pod, Application, K8sEvent, AppLogEntry, ApplicationRevision, ApplicationTemplate, ScalingRule, ScheduledScalingRule, ScalingMetricType, Service, Ingress } from '../types';
import { 
  Box, Play, Pause, RefreshCw, Wand2, Copy, Check, Terminal, Cpu, Database, 
  Settings, ArrowLeft, History, RotateCcw, LayoutGrid, List, Activity, 
  Package, Layers, ShieldCheck, GitCommit, AlertTriangle, X, Rocket, 
  LayoutTemplate, Globe, Zap, Network, Scale, GitBranch, ArrowRight,
  Plus, Trash2, Edit, Monitor, FileText, Bell, Search, Clock, Server, Eye,
  TrendingUp, Calendar, Timer, Gauge, Power, Edit2, ShoppingBag, Download, Upload,
  MoreHorizontal, Lock, Filter
} from 'lucide-react';
import { generateK8sManifest } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Mock Data ---
const mockApplications: Application[] = [
  {
    id: 'app-001',
    name: 'Mall Frontend',
    namespace: 'production',
    version: 'v1.2.0',
    status: 'Healthy',
    healthScore: 98,
    description: '电商前台 Web 服务，包含 Nginx 和静态资源。',
    resources: {
      workloads: ['dep-1'],
      services: ['svc-1'],
      ingresses: ['ing-1'],
      configMaps: ['cm-1']
    },
    metrics: { cpu: '450m', memory: '512Mi', requests: '1.2k/s' },
    scalingConfig: {
        enabled: true,
        minReplicas: 2,
        maxReplicas: 10,
        currentReplicas: 3,
        metrics: [
            { id: 'r1', metricType: 'CPU', targetValue: 70, unit: '%' },
            { id: 'r2', metricType: 'NetworkIn', targetValue: 50, unit: 'Mbps' }
        ],
        schedules: [
            { id: 's1', name: '早高峰扩容', schedule: '0 8 * * 1-5', targetReplicas: 6, enabled: true },
            { id: 's2', name: '夜间缩容', schedule: '0 22 * * *', targetReplicas: 2, enabled: true }
        ]
    },
    createdAt: '2023-10-01',
    updatedAt: '2023-10-25'
  },
  {
    id: 'app-002',
    name: 'Auth Service',
    namespace: 'production',
    version: 'v2.1.0',
    status: 'Healthy',
    healthScore: 100,
    description: '统一认证授权服务 (OIDC/OAuth2)。',
    resources: {
      workloads: ['dep-2'],
      services: ['svc-2'],
      ingresses: [],
      configMaps: []
    },
    metrics: { cpu: '200m', memory: '380Mi', requests: '500/s' },
    scalingConfig: {
        enabled: false,
        minReplicas: 1,
        maxReplicas: 5,
        currentReplicas: 1,
        metrics: [],
        schedules: []
    },
    createdAt: '2023-09-15',
    updatedAt: '2023-10-20'
  }
];

const mockPods: Pod[] = [
  { id: 'pod-1', name: 'frontend-service-6789-abcde', namespace: 'production', node: 'k8s-worker-1', status: 'Running', restarts: 0, age: '2d', ip: '10.244.1.5', cpuUsage: '120m', memUsage: '256Mi' },
  { id: 'pod-2', name: 'frontend-service-6789-fghij', namespace: 'production', node: 'k8s-worker-2', status: 'Running', restarts: 1, age: '2d', ip: '10.244.2.8', cpuUsage: '110m', memUsage: '240Mi' },
  { id: 'pod-3', name: 'frontend-service-6789-klmno', namespace: 'production', node: 'k8s-worker-3', status: 'Running', restarts: 0, age: '1h', ip: '10.244.3.12', cpuUsage: '90m', memUsage: '220Mi' },
];

const mockTemplates: ApplicationTemplate[] = [
  { id: 'tpl-1', name: 'Nginx Web Server', description: 'High performance web server and reverse proxy server.', version: '1.25.3', category: 'Web Server', maintainer: 'Bitnami' },
  { id: 'tpl-2', name: 'Redis Cluster', description: 'In-memory data structure store, used as a database, cache and message broker.', version: '7.2.1', category: 'Database', maintainer: 'Redis Labs' },
  { id: 'tpl-3', name: 'MySQL Database', description: 'The world\'s most popular open source database.', version: '8.1.0', category: 'Database', maintainer: 'Oracle' },
  { id: 'tpl-4', name: 'Jenkins', description: 'The leading open source automation server.', version: '2.414', category: 'DevOps', maintainer: 'Jenkins Project' },
  { id: 'tpl-5', name: 'WordPress', description: 'Web software you can use to create a beautiful website, blog, or app.', version: '6.3.1', category: 'CMS', maintainer: 'Automattic' },
  { id: 'tpl-6', name: 'MongoDB', description: 'The most popular database for modern apps.', version: '6.0.8', category: 'Database', maintainer: 'MongoDB Inc.' },
];

const mockWorkloads: Workload[] = [
  { id: 'wl-1', name: 'frontend-service', type: 'Deployment', namespace: 'production', replicas: 3, availableReplicas: 3, image: 'nginx:alpine', status: 'Healthy', cpuRequest: '200m', memRequest: '256Mi', createdAt: '2023-10-01' },
  { id: 'wl-2', name: 'auth-service', type: 'Deployment', namespace: 'production', replicas: 2, availableReplicas: 2, image: 'auth-svc:v2', status: 'Healthy', cpuRequest: '500m', memRequest: '512Mi', createdAt: '2023-09-15' },
  { id: 'wl-3', name: 'data-processor', type: 'StatefulSet', namespace: 'data', replicas: 3, availableReplicas: 3, image: 'processor:v1', status: 'Progressing', cpuRequest: '1000m', memRequest: '2Gi', createdAt: '2023-10-20' },
  { id: 'wl-4', name: 'log-collector', type: 'DaemonSet', namespace: 'kube-system', replicas: 5, availableReplicas: 5, image: 'fluentd:latest', status: 'Healthy', cpuRequest: '100m', memRequest: '128Mi', createdAt: '2023-01-10' },
];

const mockServices: Service[] = [
  { id: 'svc-1', name: 'frontend', namespace: 'production', type: 'LoadBalancer', clusterIP: '10.96.0.10', ports: ['80:30080/TCP'], selector: { app: 'frontend' }, protocol: 'TCP' },
  { id: 'svc-2', name: 'auth-svc', namespace: 'production', type: 'ClusterIP', clusterIP: '10.96.0.11', ports: ['8080/TCP'], selector: { app: 'auth' }, protocol: 'TCP' },
];

const mockIngresses: Ingress[] = [
  { id: 'ing-1', name: 'frontend-ingress', namespace: 'production', loadBalancerIP: '203.0.113.10', rules: [{ host: 'www.mall.com', path: '/', backend: 'frontend:80' }], tls: true, certificate: 'wildcard-mall-com' },
];

export const Applications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'native' | 'store' | 'workloads' | 'network'>('native');
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  // App Detail View State
  const [detailTab, setDetailTab] = useState<'overview' | 'pods' | 'logs' | 'events' | 'monitoring' | 'revisions' | 'topology' | 'scaling'>('overview');
  
  // Wizards & Modals
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [isDeployTemplateOpen, setIsDeployTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ApplicationTemplate | null>(null);

  // --- Mock Functions for Interactions ---
  const handleTerminal = (pod: Pod) => {
    setSelectedPod(pod);
    setIsTerminalOpen(true);
  };

  const handleFiles = (pod: Pod) => {
    setSelectedPod(pod);
    setIsFilesOpen(true);
  };

  const handleDeployTemplate = (tpl: ApplicationTemplate) => {
    setSelectedTemplate(tpl);
    setIsDeployTemplateOpen(true);
  };

  // --- Render Wizards ---
  
  const renderCreateWizard = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[700px] flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <div>
               <h3 className="text-xl font-bold text-slate-800">创建原生应用</h3>
               <p className="text-sm text-slate-500 mt-1">分步向导：基础信息 -> 工作负载 -> 网络服务 -> 配置挂载</p>
             </div>
             <button onClick={() => { setIsCreateWizardOpen(false); setCreateStep(1); }}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
          </div>
          
          <div className="flex-1 flex">
             {/* Wizard Steps Sidebar */}
             <div className="w-64 bg-slate-50 border-r border-slate-200 p-6 space-y-6">
                {[
                  { step: 1, label: '基础信息', icon: <FileText size={18}/> },
                  { step: 2, label: '工作负载', icon: <Box size={18}/> },
                  { step: 3, label: '网络与服务', icon: <Network size={18}/> },
                  { step: 4, label: '配置与保密', icon: <Settings size={18}/> },
                ].map(item => (
                   <div key={item.step} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${createStep === item.step ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-slate-500'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${createStep === item.step ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-white'}`}>
                         {createStep > item.step ? <Check size={16}/> : item.step}
                      </div>
                      <span className="text-sm">{item.label}</span>
                   </div>
                ))}
             </div>

             {/* Wizard Content */}
             <div className="flex-1 p-8 overflow-y-auto">
                {createStep === 1 && (
                   <div className="space-y-6 animate-in slide-in-from-right-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-4">应用基本定义</h4>
                      <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">应用名称 <span className="text-red-500">*</span></label>
                            <input className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="my-awesome-app" />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">命名空间 <span className="text-red-500">*</span></label>
                            <select className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                               <option>default</option>
                               <option>production</option>
                               <option>staging</option>
                            </select>
                         </div>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">描述信息</label>
                         <textarea className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={3} placeholder="应用用途及维护人信息..." />
                      </div>
                   </div>
                )}

                {createStep === 2 && (
                   <div className="space-y-6 animate-in slide-in-from-right-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-4">容器工作负载配置</h4>
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                         <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                               <label className="block text-sm font-medium text-slate-700 mb-1">负载类型</label>
                               <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                                  <option>Deployment (无状态服务)</option>
                                  <option>StatefulSet (有状态服务)</option>
                                  <option>CronJob (定时任务)</option>
                               </select>
                            </div>
                            <div className="w-32">
                               <label className="block text-sm font-medium text-slate-700 mb-1">副本数</label>
                               <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" defaultValue={1} />
                            </div>
                         </div>
                         <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">容器镜像</label>
                            <div className="flex gap-2">
                               <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. nginx:latest" />
                               <button className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm hover:bg-slate-200">选择镜像</button>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">CPU 请求/限制</label>
                               <div className="flex gap-2 items-center">
                                  <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Req: 100m" />
                                  <span className="text-slate-400">/</span>
                                  <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Lim: 500m" />
                               </div>
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">内存 请求/限制</label>
                               <div className="flex gap-2 items-center">
                                  <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Req: 128Mi" />
                                  <span className="text-slate-400">/</span>
                                  <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Lim: 512Mi" />
                               </div>
                            </div>
                         </div>
                         <button className="mt-4 text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                            <Plus size={14}/> 添加更多容器
                         </button>
                      </div>
                   </div>
                )}

                {createStep === 3 && (
                   <div className="space-y-6 animate-in slide-in-from-right-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-4">网络暴露与访问</h4>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                            <div className="flex items-center gap-3">
                               <div className="bg-white p-2 rounded border border-slate-200"><Layers size={20} className="text-blue-600"/></div>
                               <div>
                                  <div className="font-bold text-slate-700">创建 Service</div>
                                  <div className="text-xs text-slate-500">自动创建 ClusterIP/NodePort 以暴露端口</div>
                               </div>
                            </div>
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                         </div>
                         <div className="pl-4 border-l-2 border-slate-200 space-y-3">
                            <div className="grid grid-cols-3 gap-4">
                               <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"><option>ClusterIP</option><option>NodePort</option><option>LoadBalancer</option></select>
                               <input className="border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Service Port (e.g. 80)" />
                               <input className="border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Target Port (e.g. 8080)" />
                            </div>
                         </div>

                         <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50 mt-6">
                            <div className="flex items-center gap-3">
                               <div className="bg-white p-2 rounded border border-slate-200"><Globe size={20} className="text-purple-600"/></div>
                               <div>
                                  <div className="font-bold text-slate-700">创建 Ingress 路由</div>
                                  <div className="text-xs text-slate-500">配置 HTTP/HTTPS 域名访问规则</div>
                               </div>
                            </div>
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                         </div>
                      </div>
                   </div>
                )}

                {createStep === 4 && (
                   <div className="space-y-6 animate-in slide-in-from-right-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-4">配置与密钥挂载</h4>
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center py-12 text-slate-500">
                         <Settings size={48} className="mb-4 opacity-20"/>
                         <p className="mb-4">暂无配置挂载</p>
                         <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                            <Plus size={16}/> 挂载 ConfigMap / Secret
                         </button>
                      </div>
                   </div>
                )}
             </div>
          </div>

          <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
             {createStep > 1 && (
                <button onClick={() => setCreateStep(s => s-1)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors">上一步</button>
             )}
             {createStep < 4 ? (
                <button onClick={() => setCreateStep(s => s+1)} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">下一步</button>
             ) : (
                <button onClick={() => { setIsCreateWizardOpen(false); alert('应用创建任务已提交'); }} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                   <Rocket size={18}/> 立即部署
                </button>
             )}
          </div>
       </div>
    </div>
  );

  const renderTerminal = () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
       <div className="bg-[#1e1e1e] w-full max-w-5xl h-[600px] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-700">
          <div className="px-4 py-2 bg-[#2d2d2d] flex justify-between items-center border-b border-black">
             <div className="flex items-center gap-2 text-slate-300 text-sm font-mono">
                <Terminal size={14} className="text-green-500"/>
                {selectedPod?.name} @ {selectedPod?.namespace}
             </div>
             <button onClick={() => setIsTerminalOpen(false)}><X size={16} className="text-slate-400 hover:text-white"/></button>
          </div>
          <div className="flex-1 p-4 font-mono text-sm text-slate-300 overflow-y-auto">
             <div className="text-green-500">root@{selectedPod?.name}:/# <span className="text-slate-300">ls -la</span></div>
             <div className="opacity-80 mt-1">
                total 64<br/>
                drwxr-xr-x   1 root root 4096 Oct 25 10:00 .<br/>
                drwxr-xr-x   1 root root 4096 Oct 25 10:00 ..<br/>
                -rw-r--r--   1 root root  512 Oct 25 09:55 app.conf<br/>
                drwxr-xr-x   2 root root 4096 Oct 25 09:55 bin<br/>
             </div>
             <div className="text-green-500 mt-2">root@{selectedPod?.name}:/# <span className="animate-pulse">_</span></div>
          </div>
       </div>
    </div>
  );

  // --- Main View Components ---

  const renderNativeApps = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" placeholder="搜索应用..." />
             </div>
          </div>
          <button onClick={() => setIsCreateWizardOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
             <Plus size={18}/> 创建原生应用
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map(app => (
             <div key={app.id} onClick={() => setSelectedApp(app)} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group hover:border-blue-200">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                         <Box size={24}/>
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{app.name}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{app.namespace}</span>
                            <span className="text-xs text-slate-400">v{app.version}</span>
                         </div>
                      </div>
                   </div>
                   <div className={`w-3 h-3 rounded-full ${app.status === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                </div>
                <div className="space-y-3 text-sm text-slate-600 mb-4">
                   <div className="flex justify-between"><span>Workloads:</span> <span className="font-medium">{app.resources.workloads.length}</span></div>
                   <div className="flex justify-between"><span>Services:</span> <span className="font-medium">{app.resources.services.length}</span></div>
                   <div className="flex justify-between"><span>Health Score:</span> <span className="text-green-600 font-bold">{app.healthScore}</span></div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                   <span>Updated {app.updatedAt}</span>
                   <button className="hover:text-blue-600"><MoreHorizontal size={16}/></button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const renderTemplateStore = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg mb-8">
          <div>
             <h2 className="text-3xl font-bold mb-2">云原生应用市场</h2>
             <p className="text-purple-100">基于 Helm Chart 的一键部署模板，快速构建生产级服务。</p>
          </div>
          <ShoppingBag size={64} className="text-white/20"/>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockTemplates.map(tpl => (
             <div key={tpl.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                   <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                      {tpl.category === 'Database' ? <Database size={24}/> : tpl.category === 'Web Server' ? <Globe size={24}/> : <Package size={24}/>}
                   </div>
                   <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{tpl.category}</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{tpl.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">{tpl.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                   <span className="text-xs text-slate-400">{tpl.maintainer}</span>
                   <button 
                     onClick={() => handleDeployTemplate(tpl)}
                     className="text-sm bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-100 font-medium transition-colors"
                   >
                      一键部署
                   </button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const renderWorkloads = () => (
    <div className="space-y-6">
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="font-bold text-slate-700">工作负载总览 (All Namespaces)</h3>
             <div className="flex gap-2">
                <button className="bg-white border border-slate-300 px-3 py-1.5 rounded text-sm text-slate-600 hover:bg-slate-50"><Filter size={14}/></button>
                <button className="bg-white border border-slate-300 px-3 py-1.5 rounded text-sm text-slate-600 hover:bg-slate-50"><RefreshCw size={14}/></button>
             </div>
          </div>
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                   <th className="px-6 py-3">Name</th>
                   <th className="px-6 py-3">Type</th>
                   <th className="px-6 py-3">Namespace</th>
                   <th className="px-6 py-3">Pods</th>
                   <th className="px-6 py-3">Image</th>
                   <th className="px-6 py-3">Resources</th>
                   <th className="px-6 py-3 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {mockWorkloads.map(wl => (
                   <tr key={wl.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-800">{wl.name}</td>
                      <td className="px-6 py-4"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{wl.type}</span></td>
                      <td className="px-6 py-4 text-slate-500">{wl.namespace}</td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${wl.availableReplicas === wl.replicas ? 'text-green-600' : 'text-orange-600'}`}>{wl.availableReplicas}/{wl.replicas}</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div className={`h-full ${wl.availableReplicas === wl.replicas ? 'bg-green-500' : 'bg-orange-500'}`} style={{width: `${(wl.availableReplicas/wl.replicas)*100}%`}}></div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded w-fit">{wl.image}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{wl.cpuRequest} / {wl.memRequest}</td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-medium border border-transparent hover:border-blue-100 transition-colors">
                            弹性伸缩
                         </button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const renderServicesRoutes = () => (
    <div className="space-y-8">
       {/* Services Table */}
       <div>
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Layers size={20} className="text-blue-600"/> Services</h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                   <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Cluster IP</th>
                      <th className="px-6 py-3">Ports</th>
                      <th className="px-6 py-3">Selector</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {mockServices.map(svc => (
                      <tr key={svc.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium text-slate-800">{svc.name}</td>
                         <td className="px-6 py-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">{svc.type}</span></td>
                         <td className="px-6 py-4 font-mono text-slate-600">{svc.clusterIP}</td>
                         <td className="px-6 py-4 font-mono text-xs">{svc.ports.join(', ')}</td>
                         <td className="px-6 py-4 font-mono text-xs text-slate-500">{JSON.stringify(svc.selector)}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       {/* Ingress Table */}
       <div>
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Globe size={20} className="text-purple-600"/> Ingress Routes</h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                   <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Load Balancer</th>
                      <th className="px-6 py-3">Rules (Host -> Backend)</th>
                      <th className="px-6 py-3">TLS</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {mockIngresses.map(ing => (
                      <tr key={ing.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium text-slate-800">{ing.name}</td>
                         <td className="px-6 py-4 font-mono text-slate-600">{ing.loadBalancerIP}</td>
                         <td className="px-6 py-4">
                            <div className="space-y-1">
                               {ing.rules.map((r, i) => (
                                  <div key={i} className="text-xs font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                     {r.host}{r.path} -> {r.backend}
                                  </div>
                               ))}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            {ing.tls ? <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><Lock size={12}/> Enabled</span> : <span className="text-slate-400 text-xs">Disabled</span>}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  // --- App Detail View ---
  if (selectedApp) {
     return (
       <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-4">
             <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <ArrowLeft size={20}/>
             </button>
             <div className="flex-1">
                <div className="flex items-center gap-3">
                   <h2 className="text-2xl font-bold text-slate-800">{selectedApp.name}</h2>
                   <span className={`px-2 py-0.5 rounded text-xs font-medium ${selectedApp.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedApp.status}
                   </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">Namespace: {selectedApp.namespace} | Version: {selectedApp.version}</p>
             </div>
             <div className="flex gap-3">
                <button className="bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                   <FileText size={16}/> 查看 YAML
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                   <RefreshCw size={16}/> 更新应用
                </button>
                <button className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                   <Trash2 size={16}/>
                </button>
             </div>
          </div>

          <div className="border-b border-slate-200 flex gap-6 overflow-x-auto">
             {[
                { id: 'overview', label: '概览', icon: <LayoutGrid size={16}/> },
                { id: 'topology', label: '拓扑图', icon: <Network size={16}/> },
                { id: 'pods', label: '容器组', icon: <Box size={16}/> },
                { id: 'scaling', label: '弹性伸缩', icon: <Scale size={16}/> },
                { id: 'revisions', label: '版本回滚', icon: <History size={16}/> },
                { id: 'monitoring', label: '监控告警', icon: <Activity size={16}/> },
             ].map(tab => (
                <button key={tab.id} onClick={() => setDetailTab(tab.id as any)} className={`pb-3 pt-1 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${detailTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                   {tab.icon} {tab.label}
                </button>
             ))}
          </div>

          <div className="min-h-[500px]">
             {detailTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <h3 className="font-bold text-slate-700 mb-4">资源拓扑简略</h3>
                         <div className="flex items-center justify-center gap-12 py-8 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="text-center">
                               <div className="w-16 h-16 bg-white border-2 border-purple-200 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600 shadow-sm"><Globe size={32}/></div>
                               <span className="text-sm font-bold text-slate-700">Ingress</span>
                            </div>
                            <div className="h-px w-16 bg-slate-300"></div>
                            <div className="text-center">
                               <div className="w-16 h-16 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600 shadow-sm"><Layers size={32}/></div>
                               <span className="text-sm font-bold text-slate-700">Service</span>
                            </div>
                            <div className="h-px w-16 bg-slate-300"></div>
                            <div className="text-center">
                               <div className="w-16 h-16 bg-white border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600 shadow-sm"><Box size={32}/></div>
                               <span className="text-sm font-bold text-slate-700">Pods (3)</span>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <h3 className="font-bold text-slate-700 mb-4">应用信息</h3>
                         <dl className="space-y-3 text-sm">
                            <div className="flex justify-between"><dt className="text-slate-500">Created</dt><dd className="font-medium">{selectedApp.createdAt}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500">Image</dt><dd className="font-mono bg-slate-100 px-1 rounded">nginx:alpine</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500">Health</dt><dd className="text-green-600 font-bold">{selectedApp.healthScore}</dd></div>
                         </dl>
                      </div>
                   </div>
                </div>
             )}

             {detailTab === 'pods' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 font-medium">
                         <tr>
                            <th className="px-6 py-3">Pod Name</th>
                            <th className="px-6 py-3">Node</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">IP</th>
                            <th className="px-6 py-3">Usage (CPU/Mem)</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {mockPods.map(pod => (
                            <tr key={pod.id} className="hover:bg-slate-50">
                               <td className="px-6 py-4 font-medium text-slate-800">{pod.name}</td>
                               <td className="px-6 py-4 text-slate-600">{pod.node}</td>
                               <td className="px-6 py-4"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{pod.status}</span></td>
                               <td className="px-6 py-4 font-mono text-slate-600">{pod.ip}</td>
                               <td className="px-6 py-4 text-xs text-slate-500">{pod.cpuUsage} / {pod.memUsage}</td>
                               <td className="px-6 py-4 text-right flex justify-end gap-2">
                                  <button onClick={() => handleTerminal(pod)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Terminal"><Terminal size={16}/></button>
                                  <button onClick={() => handleFiles(pod)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Files"><Upload size={16}/></button>
                                  <button className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Logs"><FileText size={16}/></button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
             
             {/* Other tabs can be placeholders or reused from previous implementations */}
             {detailTab === 'monitoring' && (
                <div className="bg-white p-12 text-center text-slate-400 border border-slate-200 rounded-xl">
                   <Activity size={48} className="mx-auto mb-4 opacity-20"/>
                   <p>监控仪表板集成中...</p>
                </div>
             )}
          </div>

          {/* Terminal Modal */}
          {isTerminalOpen && renderTerminal()}
       </div>
     );
  }

  // --- Main Layout ---
  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h2 className="text-2xl font-bold text-slate-800">应用交付中心</h2>
             <p className="text-slate-500 text-sm mt-1">一站式管理应用全生命周期：原生应用、模板商店、工作负载与服务治理。</p>
          </div>
       </div>

       <div className="border-b border-slate-200 flex gap-8">
          {[
             { id: 'native', label: '原生应用 (Native Apps)', icon: <Box size={18}/> },
             { id: 'store', label: '模板商店 (App Store)', icon: <ShoppingBag size={18}/> },
             { id: 'workloads', label: '工作负载 (Workloads)', icon: <Server size={18}/> },
             { id: 'network', label: '服务与路由 (Services)', icon: <Network size={18}/> },
          ].map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 pt-1 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
             >
                {tab.icon} {tab.label}
             </button>
          ))}
       </div>

       <div className="min-h-[600px]">
          {activeTab === 'native' && renderNativeApps()}
          {activeTab === 'store' && renderTemplateStore()}
          {activeTab === 'workloads' && renderWorkloads()}
          {activeTab === 'network' && renderServicesRoutes()}
       </div>

       {isCreateWizardOpen && renderCreateWizard()}
    </div>
  );
};
