
import React, { useState, useEffect } from 'react';
import { Workload, Pod, Application, K8sEvent, AppLogEntry, ApplicationRevision, ApplicationTemplate } from '../types';
import { 
  Box, Play, Pause, RefreshCw, Wand2, Copy, Check, Terminal, Cpu, Database, 
  Settings, ArrowLeft, History, RotateCcw, LayoutGrid, List, Activity, 
  Package, Layers, ShieldCheck, GitCommit, AlertTriangle, X, Rocket, 
  LayoutTemplate, Globe, Zap, Network, Scale, GitBranch, ArrowRight,
  Plus, Trash2, Edit, Monitor, FileText, Bell, Search, Clock, Server, Eye
} from 'lucide-react';
import { generateK8sManifest } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    createdAt: '2023-09-15',
    updatedAt: '2023-10-20'
  }
];

const mockPods: Pod[] = [
  { id: 'pod-1', name: 'frontend-service-6789-abcde', namespace: 'production', node: 'k8s-worker-1', status: 'Running', restarts: 0, age: '2d', ip: '10.244.1.5' },
  { id: 'pod-2', name: 'frontend-service-6789-fghij', namespace: 'production', node: 'k8s-worker-2', status: 'Running', restarts: 1, age: '2d', ip: '10.244.2.8' },
  { id: 'pod-3', name: 'frontend-service-6789-klmno', namespace: 'production', node: 'k8s-worker-3', status: 'Running', restarts: 0, age: '1h', ip: '10.244.3.12' },
];

const mockEvents: K8sEvent[] = [
  { id: 'evt-1', type: 'Normal', reason: 'Scheduled', message: 'Successfully assigned production/frontend-service-6789-klmno to k8s-worker-3', object: 'Pod/frontend-service-6789-klmno', count: 1, lastSeen: '2m ago' },
  { id: 'evt-2', type: 'Normal', reason: 'Pulling', message: 'Pulling image "nginx:alpine"', object: 'Pod/frontend-service-6789-klmno', count: 1, lastSeen: '2m ago' },
  { id: 'evt-3', type: 'Normal', reason: 'Created', message: 'Created container nginx', object: 'Pod/frontend-service-6789-klmno', count: 1, lastSeen: '1m ago' },
  { id: 'evt-4', type: 'Normal', reason: 'Started', message: 'Started container nginx', object: 'Pod/frontend-service-6789-klmno', count: 1, lastSeen: '1m ago' },
];

const mockLogs: AppLogEntry[] = [
  { timestamp: '2023-10-25 10:00:01', level: 'INFO', message: 'Starting Nginx Server...' },
  { timestamp: '2023-10-25 10:00:02', level: 'INFO', message: 'Listening on 0.0.0.0:80' },
  { timestamp: '2023-10-25 10:00:05', level: 'INFO', message: 'GET /health 200 2ms' },
  { timestamp: '2023-10-25 10:05:00', level: 'WARN', message: 'Connection pool usage high' },
  { timestamp: '2023-10-25 10:05:10', level: 'INFO', message: 'GET /api/v1/products 200 45ms' },
];

const initialRevisions: ApplicationRevision[] = [
  { revision: 3, image: 'nginx:1.25.3-alpine', createdAt: '2023-10-25 10:00:00', current: true, message: 'Update to v1.25.3: Performance improvements' },
  { revision: 2, image: 'nginx:1.25.2-alpine', createdAt: '2023-10-20 09:30:00', current: false, message: 'Security patch fix for CVE-2023-1234' },
  { revision: 1, image: 'nginx:1.24.0', createdAt: '2023-10-15 08:15:00', current: false, message: 'Initial deployment' },
];

const mockAppMetrics = [
  { time: '10:00', requests: 1200, latency: 45 },
  { time: '10:05', requests: 1350, latency: 48 },
  { time: '10:10', requests: 1100, latency: 42 },
  { time: '10:15', requests: 1600, latency: 65 },
  { time: '10:20', requests: 1800, latency: 72 },
  { time: '10:25', requests: 1500, latency: 50 },
];

const mockTemplates: ApplicationTemplate[] = [
  { id: 'tpl-1', name: 'Nginx Web Server', description: 'High performance web server and reverse proxy server.', version: '1.25.3', category: 'Web Server' },
  { id: 'tpl-2', name: 'Redis Cluster', description: 'In-memory data structure store, used as a database, cache and message broker.', version: '7.2.1', category: 'Database' },
  { id: 'tpl-3', name: 'MySQL Database', description: 'The world\'s most popular open source database.', version: '8.1.0', category: 'Database' },
  { id: 'tpl-4', name: 'Jenkins', description: 'The leading open source automation server.', version: '2.414', category: 'DevOps' },
  { id: 'tpl-5', name: 'WordPress', description: 'Web software you can use to create a beautiful website, blog, or app.', version: '6.3.1', category: 'CMS' },
  { id: 'tpl-6', name: 'MongoDB', description: 'The most popular database for modern apps.', version: '6.0.8', category: 'Database' },
];

export const Applications: React.FC = () => {
  const [appMode, setAppMode] = useState<'native' | 'template'>('native');
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'pods' | 'logs' | 'events' | 'monitoring' | 'revisions' | 'topology'>('overview');
  const [revisions, setRevisions] = useState<ApplicationRevision[]>(initialRevisions);
  
  // Create App Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [newAppForm, setNewAppForm] = useState({
    name: '',
    namespace: 'default',
    image: 'nginx:latest',
    replicas: 1,
    port: 80,
    serviceType: 'ClusterIP',
    ingressHost: '',
    configMapData: [{key: '', value: ''}]
  });

  // Logs State
  const [isStreamingLogs, setIsStreamingLogs] = useState(false);
  const [logs, setLogs] = useState<AppLogEntry[]>(mockLogs);

  // Wizard AI State
  const [showAiWizard, setShowAiWizard] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedYaml, setGeneratedYaml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreamingLogs && selectedApp && detailTab === 'logs') {
      interval = setInterval(() => {
        const newLog: AppLogEntry = {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          level: 'INFO',
          message: `GET /api/v1/health 200 ${Math.floor(Math.random() * 50)}ms`
        };
        setLogs(prev => [...prev.slice(-19), newLog]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isStreamingLogs, selectedApp, detailTab]);

  const handleCreateApp = () => {
    const newApp: Application = {
      id: `app-${Date.now()}`,
      name: newAppForm.name,
      namespace: newAppForm.namespace,
      version: 'v1.0.0',
      status: 'Healthy',
      healthScore: 100,
      description: `Created via Console. Image: ${newAppForm.image}`,
      resources: {
        workloads: [`dep-${Date.now()}`],
        services: newAppForm.port ? [`svc-${Date.now()}`] : [],
        ingresses: newAppForm.ingressHost ? [`ing-${Date.now()}`] : [],
        configMaps: newAppForm.configMapData[0].key ? [`cm-${Date.now()}`] : []
      },
      metrics: { cpu: '100m', memory: '128Mi', requests: '0/s' },
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setApplications([...applications, newApp]);
    setIsCreateModalOpen(false);
    // Reset form
    setNewAppForm({
      name: '', namespace: 'default', image: 'nginx:latest', replicas: 1,
      port: 80, serviceType: 'ClusterIP', ingressHost: '', configMapData: [{key: '', value: ''}]
    });
    setCreateStep(1);
  };

  const handleDeleteApp = (appId: string) => {
    if (confirm('Are you sure you want to delete this application? This will remove all associated resources.')) {
      setApplications(applications.filter(a => a.id !== appId));
      setSelectedApp(null);
    }
  };

  const handleUpdateApp = () => {
    const newVersion = `v${revisions.length + 1}.0.0`;
    const newRevision: ApplicationRevision = {
        revision: revisions[0].revision + 1,
        image: `nginx:${Math.random().toString(36).substring(7)}`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        current: true,
        message: 'Manual update triggered from console'
    };
    
    // Update revisions list: set old current to false
    const updatedRevisions = revisions.map(r => ({...r, current: false}));
    setRevisions([newRevision, ...updatedRevisions]);
    
    // Update app version display
    if(selectedApp) {
        setSelectedApp({...selectedApp, version: newVersion});
        setApplications(applications.map(a => a.id === selectedApp.id ? {...a, version: newVersion} : a));
    }
    
    alert(`Application updated to ${newVersion}`);
  };

  const handleRollback = (revision: number) => {
    if(confirm(`确定要回滚到版本 #${revision} 吗？这将导致 Pod 重启并恢复旧的配置。`)) {
        const targetRev = revisions.find(r => r.revision === revision);
        if(targetRev) {
            // In a real scenario, this would apply the old config as a new revision
            const newRollbackRev: ApplicationRevision = {
               revision: revisions[0].revision + 1,
               image: targetRev.image,
               createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
               current: true,
               message: `Rollback to revision #${revision}: ${targetRev.message}`
            };

            const updatedRevisions = revisions.map(r => ({
                ...r,
                current: false
            }));
            
            setRevisions([newRollbackRev, ...updatedRevisions]);
            
            if(selectedApp) {
              setSelectedApp({...selectedApp, status: 'Progressing', version: `v${newRollbackRev.revision}.0.0`});
              setTimeout(() => {
                setSelectedApp(prev => prev ? {...prev, status: 'Healthy'} : null);
              }, 2000);
            }
            alert(`已成功回滚至版本 #${revision}`);
        }
    }
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    const yaml = await generateK8sManifest(aiPrompt);
    setGeneratedYaml(yaml);
    setIsGenerating(false);
  };

  // Render Logic
  if (selectedApp) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
         {/* Detail Header */}
         <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedApp(null)}
              className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
               <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-800">{selectedApp.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${
                      selectedApp.status === 'Healthy' ? 'bg-green-100 text-green-700' : 
                      selectedApp.status === 'Progressing' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedApp.status === 'Progressing' && <RefreshCw size={10} className="animate-spin" />}
                    {selectedApp.status}
                  </span>
               </div>
               <p className="text-sm text-slate-500 mt-1 flex gap-4">
                  <span>NS: {selectedApp.namespace}</span>
                  <span>Ver: {selectedApp.version}</span>
                  <span>Age: 25d</span>
               </p>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={handleUpdateApp} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                  <ArrowRight size={16} /> 滚动更新
               </button>
               <button onClick={() => handleDeleteApp(selectedApp.id)} className="bg-white border border-slate-300 hover:bg-red-50 hover:text-red-600 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Trash2 size={16} />
               </button>
            </div>
         </div>

         {/* Tabs */}
         <div className="border-b border-slate-200 flex gap-6 overflow-x-auto">
            {[
              { id: 'overview', label: '概览 Overview', icon: <LayoutGrid size={16} /> },
              { id: 'topology', label: '拓扑结构 Topology', icon: <Network size={16} /> },
              { id: 'pods', label: '实例 Pods', icon: <Box size={16} /> },
              { id: 'monitoring', label: '监控 Monitoring', icon: <Activity size={16} /> },
              { id: 'revisions', label: '版本历史 Revisions', icon: <History size={16} /> },
              { id: 'logs', label: '日志 Logs', icon: <FileText size={16} /> },
              { id: 'events', label: '事件 Events', icon: <Bell size={16} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDetailTab(tab.id as any)}
                className={`pb-3 pt-1 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  detailTab === tab.id 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
         </div>

         {/* Content */}
         <div className="min-h-[500px]">
             {detailTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-2">
                      <h3 className="font-bold text-slate-700 mb-4">应用详情</h3>
                      <div className="grid grid-cols-2 gap-y-4 text-sm">
                         <div className="flex flex-col">
                            <span className="text-slate-500 text-xs">Description</span>
                            <span className="text-slate-800 font-medium mt-1">{selectedApp.description || 'No description'}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-slate-500 text-xs">Health Score</span>
                            <span className="text-green-600 font-bold mt-1 text-lg">{selectedApp.healthScore}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-slate-500 text-xs">Image</span>
                            <span className="text-slate-800 font-mono bg-slate-100 px-2 py-1 rounded w-fit mt-1">{revisions.find(r=>r.current)?.image}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-slate-500 text-xs">Replicas</span>
                            <span className="text-slate-800 font-medium mt-1">3 / 3 Ready</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h3 className="font-bold text-slate-700 mb-4">关联资源</h3>
                       <div className="space-y-3">
                          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                             <div className="p-1.5 bg-blue-100 text-blue-600 rounded"><Globe size={16}/></div>
                             <div className="text-sm">
                                <div className="font-bold text-slate-700">Service</div>
                                <div className="text-xs text-slate-500">ClusterIP: 10.96.x.x</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                             <div className="p-1.5 bg-purple-100 text-purple-600 rounded"><Network size={16}/></div>
                             <div className="text-sm">
                                <div className="font-bold text-slate-700">Ingress</div>
                                <div className="text-xs text-slate-500">app.example.com</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                             <div className="p-1.5 bg-orange-100 text-orange-600 rounded"><Settings size={16}/></div>
                             <div className="text-sm">
                                <div className="font-bold text-slate-700">Config</div>
                                <div className="text-xs text-slate-500">1 ConfigMap, 1 Secret</div>
                             </div>
                          </div>
                       </div>
                   </div>
                </div>
             )}

             {/* Version History / Revisions View */}
             {detailTab === 'revisions' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2"><GitBranch size={20}/> 版本发布历史</h3>
                      <p className="text-xs text-slate-500">支持一键回滚到任意历史版本 (Simulated)</p>
                   </div>
                   
                   <div className="relative pl-4">
                      {/* Vertical Line */}
                      <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-slate-200"></div>

                      <div className="space-y-8">
                         {revisions.map((rev, idx) => (
                            <div key={rev.revision} className="relative flex gap-6 group">
                               {/* Dot */}
                               <div className={`relative z-10 w-10 h-10 rounded-full border-4 flex items-center justify-center shrink-0 bg-white ${rev.current ? 'border-green-500 text-green-600' : 'border-slate-300 text-slate-400'}`}>
                                  {rev.current ? <Check size={20} /> : <span className="font-bold text-sm">#{rev.revision}</span>}
                               </div>

                               {/* Content Card */}
                               <div className={`flex-1 rounded-xl border p-4 transition-all ${rev.current ? 'bg-green-50/50 border-green-200 shadow-sm' : 'bg-white border-slate-200 group-hover:border-blue-300 group-hover:shadow-md'}`}>
                                  <div className="flex justify-between items-start">
                                     <div>
                                        <div className="flex items-center gap-2">
                                           <h4 className="font-bold text-slate-800">Revision #{rev.revision}</h4>
                                           {rev.current && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Current Active</span>}
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">{rev.message}</p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                           <span className="flex items-center gap-1 font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600"><Package size={12}/> {rev.image}</span>
                                           <span className="flex items-center gap-1"><Clock size={12}/> {rev.createdAt}</span>
                                        </div>
                                     </div>
                                     {!rev.current && (
                                        <button 
                                          onClick={() => handleRollback(rev.revision)}
                                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-orange-100 hover:text-orange-700 rounded-lg transition-colors border border-slate-200"
                                        >
                                           <RotateCcw size={14} /> 回滚至此版本
                                        </button>
                                     )}
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             )}

             {/* Topology View */}
             {detailTab === 'topology' && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 h-[600px] relative overflow-hidden flex items-center justify-center">
                    <div className="absolute top-4 right-4 bg-white p-2 rounded shadow text-xs text-slate-500 flex flex-col gap-1 z-10">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></span> Ingress</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></span> Service</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-100 border border-green-300 rounded"></span> Pod</div>
                    </div>
                    
                    {/* Simplified CSS Topology Visualization */}
                    <div className="flex items-center gap-16 scale-110">
                        {/* Internet */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-500">
                                <Globe size={32} />
                            </div>
                            <span className="text-sm font-bold text-slate-600">Internet</span>
                        </div>

                        {/* Arrow */}
                        <div className="h-0.5 w-12 bg-slate-300 relative">
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-300 rotate-45"></div>
                        </div>

                        {/* Ingress */}
                        <div className="flex flex-col items-center gap-2">
                             <div className="w-24 h-24 rounded-xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-purple-600 shadow-sm relative group cursor-pointer hover:shadow-md transition-all">
                                 <Network size={32} />
                                 <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                             </div>
                             <span className="text-sm font-bold text-slate-700">Ingress</span>
                             <span className="text-xs text-slate-400">nginx-ingress</span>
                        </div>

                        {/* Arrow */}
                        <div className="h-0.5 w-12 bg-slate-300 relative">
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-300 rotate-45"></div>
                        </div>

                        {/* Service */}
                        <div className="flex flex-col items-center gap-2">
                             <div className="w-24 h-24 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 shadow-sm relative group cursor-pointer hover:shadow-md transition-all">
                                 <Layers size={32} />
                             </div>
                             <span className="text-sm font-bold text-slate-700">Service</span>
                             <span className="text-xs text-slate-400">ClusterIP</span>
                        </div>

                         {/* Arrow */}
                        <div className="h-0.5 w-12 bg-slate-300 relative">
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-300 rotate-45"></div>
                        </div>

                        {/* Pod Group */}
                        <div className="p-4 border-2 border-dashed border-green-200 bg-green-50/30 rounded-2xl">
                             <div className="text-xs text-green-600 font-bold mb-3 text-center">Deployment: {selectedApp.name}</div>
                             <div className="flex flex-col gap-3">
                                {[1,2,3].map(i => (
                                    <div key={i} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-green-200 shadow-sm w-48">
                                        <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center">
                                            <Box size={16} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-700">pod-xyz-{i}</div>
                                            <div className="text-[10px] text-slate-400">10.244.1.{10+i}</div>
                                        </div>
                                        <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    </div>
                                ))}
                             </div>
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
                                <th className="px-6 py-3">Restarts</th>
                                <th className="px-6 py-3">Age</th>
                                <th className="px-6 py-3">IP</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mockPods.map(pod => (
                                <tr key={pod.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-700">{pod.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{pod.node}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            {pod.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{pod.restarts}</td>
                                    <td className="px-6 py-4 text-slate-500">{pod.age}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono">{pod.ip}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button className="text-slate-400 hover:text-blue-600" title="Logs"><FileText size={16}/></button>
                                        <button className="text-slate-400 hover:text-blue-600" title="Exec"><Terminal size={16}/></button>
                                        <button className="text-slate-400 hover:text-red-600" title="Delete"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             )}

             {detailTab === 'monitoring' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-700 mb-4">Requests / Second</h4>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockAppMetrics}>
                               <defs>
                                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                               <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                               <Tooltip />
                               <Area type="monotone" dataKey="requests" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReq)" />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-700 mb-4">Average Latency (ms)</h4>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockAppMetrics}>
                               <defs>
                                  <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                     <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                               <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                               <Tooltip />
                               <Area type="monotone" dataKey="latency" stroke="#f59e0b" fillOpacity={1} fill="url(#colorLat)" />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>
             )}
             
             {detailTab === 'logs' && (
               <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-sm overflow-hidden h-[600px] flex flex-col font-mono text-sm">
                  <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <span className="text-slate-400">Pod:</span>
                        <select className="bg-slate-700 text-slate-200 border-none rounded text-xs px-2 py-1 outline-none">
                           {mockPods.map(p => <option key={p.id}>{p.name}</option>)}
                        </select>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsStreamingLogs(!isStreamingLogs)}
                          className={`flex items-center gap-2 px-3 py-1 rounded text-xs transition-colors ${isStreamingLogs ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
                        >
                           {isStreamingLogs ? <Pause size={12}/> : <Play size={12}/>}
                           {isStreamingLogs ? 'Stop Stream' : 'Live Stream'}
                        </button>
                        <button className="text-slate-400 hover:text-white p-1"><Download size={14}/></button>
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                     {logs.map((log, i) => (
                        <div key={i} className="flex gap-3 hover:bg-slate-800/50">
                           <span className="text-slate-500 select-none w-36 shrink-0">{log.timestamp}</span>
                           <span className={`w-10 shrink-0 font-bold ${log.level === 'ERROR' ? 'text-red-500' : log.level === 'WARN' ? 'text-yellow-500' : 'text-blue-400'}`}>{log.level}</span>
                           <span className="text-slate-300 break-all">{log.message}</span>
                        </div>
                     ))}
                  </div>
               </div>
             )}

             {detailTab === 'events' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 font-medium">
                         <tr>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Reason</th>
                            <th className="px-6 py-3">Object</th>
                            <th className="px-6 py-3">Message</th>
                            <th className="px-6 py-3">Last Seen</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {mockEvents.map(evt => (
                            <tr key={evt.id} className="hover:bg-slate-50">
                               <td className="px-6 py-4">
                                  <span className={`text-xs px-2 py-0.5 rounded ${evt.type === 'Warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                                     {evt.type}
                                  </span>
                               </td>
                               <td className="px-6 py-4 font-medium text-slate-700">{evt.reason}</td>
                               <td className="px-6 py-4 text-xs text-slate-500">{evt.object}</td>
                               <td className="px-6 py-4 text-slate-600">{evt.message}</td>
                               <td className="px-6 py-4 text-slate-500">{evt.lastSeen}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
         </div>
      </div>
    );
  }

  // --- Main List View ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">应用交付 (App Delivery)</h2>
           <p className="text-slate-500 text-sm mt-1">管理容器化应用生命周期，支持 AI 辅助生成与 GitOps 部署。</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => setShowAiWizard(true)}
             className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
           >
             <Wand2 size={18} /> AI 部署向导
           </button>
           <button 
             onClick={() => setIsCreateModalOpen(true)}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
           >
             <Plus size={18} /> 新建应用
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* App Cards */}
        {applications.map(app => (
           <div 
             key={app.id} 
             onClick={() => setSelectedApp(app)}
             className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group"
           >
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                       <Box size={24} />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{app.name}</h3>
                       <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">{app.namespace}</span>
                          <span>{app.version}</span>
                       </div>
                    </div>
                 </div>
                 <div className={`w-3 h-3 rounded-full ${app.status === 'Healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              
              <div className="space-y-3 mb-6">
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Workloads</span>
                    <span className="font-medium text-slate-700">{app.resources.workloads.length}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Services</span>
                    <span className="font-medium text-slate-700">{app.resources.services.length}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Requests (RPS)</span>
                    <span className="font-medium text-slate-700">{app.metrics?.requests}</span>
                 </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    <Activity size={12} /> Health: {app.healthScore}
                 </div>
                 <div className="text-xs text-slate-400">Updated {app.updatedAt}</div>
              </div>
           </div>
        ))}
      </div>
      
      {/* Create Modal (Existing) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="text-xl font-bold text-slate-800">部署新应用</h3>
                 <button onClick={() => setIsCreateModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
              </div>
              
              <div className="p-8 space-y-6 overflow-y-auto">
                 {createStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">应用名称</label>
                          <input 
                             className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                             value={newAppForm.name}
                             onChange={e => setNewAppForm({...newAppForm, name: e.target.value})}
                             placeholder="e.g. my-web-app"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">镜像地址 (Image)</label>
                          <input 
                             className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                             value={newAppForm.image}
                             onChange={e => setNewAppForm({...newAppForm, image: e.target.value})}
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">副本数 (Replicas)</label>
                             <input 
                                type="number"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newAppForm.replicas}
                                onChange={e => setNewAppForm({...newAppForm, replicas: parseInt(e.target.value)})}
                             />
                          </div>
                          <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">服务端口</label>
                             <input 
                                type="number"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newAppForm.port}
                                onChange={e => setNewAppForm({...newAppForm, port: parseInt(e.target.value)})}
                             />
                          </div>
                       </div>
                    </div>
                 )}
              </div>

              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                 <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors font-medium">取消</button>
                 {createStep === 1 ? (
                    <button onClick={handleCreateApp} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2">
                       <Rocket size={18} /> 立即部署
                    </button>
                 ) : (
                    <button onClick={() => setCreateStep(s => s+1)} className="px-6 py-2 bg-blue-600 text-white rounded-lg">下一步</button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* AI Wizard Modal */}
      {showAiWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 flex justify-between items-center text-white">
                 <div className="flex items-center gap-2">
                    <Wand2 size={24} />
                    <h3 className="text-xl font-bold">AI 智能部署助手</h3>
                 </div>
                 <button onClick={() => setShowAiWizard(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={24}/></button>
              </div>
              
              <div className="flex-1 flex flex-col p-6 overflow-hidden">
                 <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                          <Wand2 size={20} />
                       </div>
                       <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 text-slate-700 text-sm max-w-[80%]">
                          <p>你好！我是云原生 AI 助手。请描述你想部署的应用，我可以为你自动生成 Kubernetes YAML 配置清单。</p>
                          <p className="mt-2 text-xs text-slate-500">例如："部署一个高可用的 Nginx 服务，包含 3 个副本，暴露 80 端口，并配置 Ingress 域名 nginx.example.com"</p>
                       </div>
                    </div>
                    
                    {generatedYaml && (
                       <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                             <Wand2 size={20} />
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 w-full">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase">Generated Manifest</span>
                                <button className="text-xs flex items-center gap-1 text-blue-600 hover:underline"><Copy size={12}/> Copy</button>
                             </div>
                             <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                                {generatedYaml}
                             </pre>
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="relative">
                    <textarea 
                       className="w-full border border-slate-300 rounded-xl p-4 pr-12 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none shadow-sm"
                       rows={3}
                       placeholder="在此输入您的需求..."
                       value={aiPrompt}
                       onChange={e => setAiPrompt(e.target.value)}
                       onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiGenerate(); } }}
                    />
                    <button 
                      onClick={handleAiGenerate}
                      disabled={isGenerating || !aiPrompt}
                      className="absolute right-3 bottom-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white p-2 rounded-lg transition-colors"
                    >
                       {isGenerating ? <RefreshCw size={18} className="animate-spin"/> : <Rocket size={18} />}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
