
import React, { useState, useEffect, useRef } from 'react';
import { Workload, Pod, Application, K8sEvent, AppLogEntry, ApplicationRevision, ApplicationTemplate, ScalingRule, ScheduledScalingRule, ScalingMetricType, Service, Ingress, ApplicationScalingConfig } from '../types';
import { 
  Box, Play, Pause, RefreshCw, Wand2, Copy, Check, Terminal, Cpu, Database, 
  Settings, ArrowLeft, History, RotateCcw, LayoutGrid, List, Activity, 
  Package, Layers, ShieldCheck, GitCommit, AlertTriangle, X, Rocket, 
  LayoutTemplate, Globe, Zap, Network, Scale, GitBranch, ArrowRight,
  Plus, Trash2, Edit, Monitor, FileText, Bell, Search, Clock, Server, Eye,
  TrendingUp, Calendar, Timer, Gauge, Power, Edit2, ShoppingBag, Download, Upload,
  MoreHorizontal, Lock, Filter, ArrowRight as ArrowRightIcon
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
  const [scalingConfig, setScalingConfig] = useState<ApplicationScalingConfig | undefined>(undefined);

  // Wizards & Modals
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [isDeployTemplateOpen, setIsDeployTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ApplicationTemplate | null>(null);

  // Sync scaling config when app is selected
  useEffect(() => {
    if (selectedApp) {
      setScalingConfig(selectedApp.scalingConfig || {
        enabled: false,
        minReplicas: 1,
        maxReplicas: 1,
        currentReplicas: 1,
        metrics: [],
        schedules: []
      });
    }
  }, [selectedApp]);

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

  // --- Render Functions ---

  const renderScaling = () => {
    if (!scalingConfig) return <div>No scaling config available</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Basic Config */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">弹性伸缩配置 (HPA)</h3>
                        <p className="text-sm text-slate-500">自动调整 Pod 副本数量以应对流量波动。</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${scalingConfig.enabled ? 'text-blue-600' : 'text-slate-500'}`}>{scalingConfig.enabled ? '已启用' : '已禁用'}</span>
                        <button 
                            onClick={() => setScalingConfig({...scalingConfig, enabled: !scalingConfig.enabled})}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${scalingConfig.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${scalingConfig.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">最小副本数 (Min)</label>
                        <input type="number" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={scalingConfig.minReplicas} onChange={e => setScalingConfig({...scalingConfig, minReplicas: parseInt(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">最大副本数 (Max)</label>
                        <input type="number" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={scalingConfig.maxReplicas} onChange={e => setScalingConfig({...scalingConfig, maxReplicas: parseInt(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">当前副本数</label>
                        <div className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 flex items-center gap-2">
                           <Box size={16} className="text-blue-600"/>
                           {scalingConfig.currentReplicas} Pods
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                       <h4 className="font-bold text-slate-700 flex items-center gap-2"><Activity size={18}/> 指标规则 (Metrics)</h4>
                       <p className="text-xs text-slate-500 mt-1">当指标超过目标值时触发扩容。</p>
                    </div>
                    <button className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1 transition-colors">
                        <Plus size={14}/> 添加指标
                    </button>
                </div>
                
                {scalingConfig.metrics.length > 0 ? (
                    <div className="space-y-3">
                        {scalingConfig.metrics.map(metric => (
                            <div key={metric.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white transition-colors">
                                <div className="p-3 bg-white border border-slate-200 rounded-lg text-blue-600 shadow-sm">
                                    {metric.metricType === 'CPU' ? <Cpu size={20}/> : metric.metricType === 'Memory' ? <Database size={20}/> : <Network size={20}/>}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                       {metric.metricType} 利用率
                                       {metric.metricType === 'Custom' && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Custom</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">Target Average: <span className="font-mono font-medium text-slate-700">{metric.targetValue}{metric.unit}</span></div>
                                </div>
                                <button className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <Scale size={32} className="mx-auto mb-2 opacity-20"/>
                        暂无指标规则，请添加
                    </div>
                )}
            </div>

            {/* Cron Schedules */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                       <h4 className="font-bold text-slate-700 flex items-center gap-2"><Clock size={18}/> 定时扩缩容 (CronHPA)</h4>
                       <p className="text-xs text-slate-500 mt-1">适用于有规律的业务高峰期，提前准备资源。</p>
                    </div>
                    <button className="text-sm bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 flex items-center gap-1 transition-colors">
                        <Plus size={14}/> 添加计划
                    </button>
                </div>

                {scalingConfig.schedules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scalingConfig.schedules.map(schedule => (
                            <div key={schedule.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow relative overflow-hidden bg-white group">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${schedule.enabled ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                <div className="flex justify-between items-start mb-3 pl-3">
                                    <div>
                                       <div className="font-bold text-slate-800">{schedule.name}</div>
                                       <div className="text-xs text-slate-400 font-mono mt-0.5">{schedule.schedule}</div>
                                    </div>
                                    <div className={`relative inline-block w-8 h-4 rounded-full cursor-pointer transition-colors ${schedule.enabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                                        <span className={`absolute top-1 left-1 bg-white w-2 h-2 rounded-full transition-transform ${schedule.enabled ? 'translate-x-4' : ''}`} />
                                    </div>
                                </div>
                                <div className="pl-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                       <TrendingUp size={16} className="text-blue-500"/> 
                                       Target: <span className="font-bold text-slate-800">{schedule.targetReplicas}</span> Replicas
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                       <button className="text-slate-400 hover:text-blue-600"><Edit size={14}/></button>
                                       <button className="text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <Calendar size={32} className="mx-auto mb-2 opacity-20"/>
                        暂无定时任务
                    </div>
                )}
            </div>
            
            {/* Action Bar */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
               <button className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-white text-sm font-medium transition-colors">取消更改</button>
               <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                  <Settings size={16}/> 保存策略
               </button>
            </div>
        </div>
    );
  };
  
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
                   <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-4