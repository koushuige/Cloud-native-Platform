import React, { useState } from 'react';
import { Workload, Pod, HPA, ConfigMap } from '../types';
import { Box, Play, Pause, RefreshCw, Wand2, Copy, Check, Terminal, Cpu, Database, Settings, ArrowLeft, History, RotateCcw, LayoutGrid, List, Activity } from 'lucide-react';
import { generateK8sManifest } from '../services/geminiService';

const mockWorkloads: Workload[] = [
  { id: 'dep-1', name: 'frontend-service', type: 'Deployment', namespace: 'production', replicas: 3, availableReplicas: 3, image: 'nginx:alpine', status: 'Healthy', createdAt: '10d ago', cpuRequest: '200m', memRequest: '256Mi' },
  { id: 'dep-2', name: 'auth-api', type: 'Deployment', namespace: 'production', replicas: 2, availableReplicas: 2, image: 'auth-service:v2.1', status: 'Healthy', createdAt: '5d ago', cpuRequest: '500m', memRequest: '512Mi' },
  { id: 'sts-1', name: 'redis-cluster', type: 'StatefulSet', namespace: 'data', replicas: 3, availableReplicas: 3, image: 'redis:7.0', status: 'Healthy', createdAt: '20d ago', cpuRequest: '1000m', memRequest: '2Gi' },
  { id: 'job-1', name: 'daily-report', type: 'CronJob', namespace: 'analytics', replicas: 1, availableReplicas: 0, image: 'report-gen:latest', status: 'Suspended', createdAt: '30d ago' },
];

const mockPods: Pod[] = [
  { id: 'pod-1', name: 'frontend-service-6789-abcde', namespace: 'production', node: 'k8s-worker-1', status: 'Running', restarts: 0, age: '2d', ip: '10.244.1.5' },
  { id: 'pod-2', name: 'frontend-service-6789-fghij', namespace: 'production', node: 'k8s-worker-2', status: 'Running', restarts: 1, age: '2d', ip: '10.244.2.8' },
];

const mockHPAs: HPA[] = [
  { id: 'hpa-1', name: 'frontend-hpa', targetRef: 'Deployment/frontend-service', minReplicas: 2, maxReplicas: 10, currentReplicas: 3, metrics: [{ type: 'CPU', current: '45%', target: '60%' }] },
];

const mockConfigMaps: ConfigMap[] = [
  { id: 'cm-1', name: 'frontend-config', namespace: 'production', keys: ['nginx.conf', 'site.conf'], age: '10d' },
];

export const Applications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workloads' | 'pods' | 'config' | 'hpa'>('workloads');
  const [showWizard, setShowWizard] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedYaml, setGeneratedYaml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    const yaml = await generateK8sManifest(prompt);
    setGeneratedYaml(yaml);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">应用管理</h2>
           <p className="text-slate-500 text-sm mt-1">全生命周期管理：部署、扩缩容、配置与调试</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowWizard(!showWizard)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm font-medium"
          >
            <Wand2 size={16} />
            <span>AI 部署向导</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm font-medium">
            <LayoutGrid size={16} />
            <span>应用模板部署</span>
          </button>
        </div>
      </div>

      {showWizard && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-6 animate-in slide-in-from-top-4 duration-300">
           {/* ... Wizard Content (Same as previous) ... */}
           <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
             <Wand2 className="text-purple-600" size={20}/> 
             Gemini 智能生成器
           </h3>
           <p className="text-sm text-slate-600 mb-4">
             描述您的应用需求，自动生成 Deployment, Service 和 Ingress YAML 配置。
           </p>
           
           <div className="flex gap-4 mb-4">
             <input 
               type="text" 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="例如: 部署一个高可用 Nginx 集群，包含 3 个副本，挂载 ConfigMap，并暴露在 80 端口..."
               className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
             />
             <button 
               onClick={handleGenerate}
               disabled={isGenerating || !prompt}
               className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
             >
               {isGenerating ? '生成中...' : '生成 YAML'}
             </button>
           </div>

           {generatedYaml && (
             <div className="relative">
               <div className="absolute right-2 top-2">
                 <button onClick={handleCopy} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors">
                   {copied ? <Check size={16} /> : <Copy size={16} />}
                 </button>
               </div>
               <pre className="bg-slate-800 text-blue-100 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-slate-700 max-h-80">
                 {generatedYaml}
               </pre>
               <div className="mt-4 flex justify-end gap-3">
                 <button onClick={() => setGeneratedYaml('')} className="px-4 py-2 text-slate-600 hover:bg-white rounded-lg text-sm font-medium">清空</button>
                 <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">应用到集群</button>
               </div>
             </div>
           )}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
         {[
           { id: 'workloads', label: '工作负载 (Workloads)', icon: <Box size={16} /> },
           { id: 'pods', label: '容器组 (Pods)', icon: <LayoutGrid size={16} /> },
           { id: 'config', label: '配置与密钥', icon: <Settings size={16} /> },
           { id: 'hpa', label: '弹性伸缩 (HPA)', icon: <Activity size={16} /> },
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
         {activeTab === 'workloads' && (
           <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-medium">
               <tr>
                 <th className="px-6 py-4">应用名称</th>
                 <th className="px-6 py-4">类型</th>
                 <th className="px-6 py-4">命名空间</th>
                 <th className="px-6 py-4">镜像</th>
                 <th className="px-6 py-4">副本状态</th>
                 <th className="px-6 py-4">资源申请</th>
                 <th className="px-6 py-4 text-right">操作</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
               {mockWorkloads.map(wk => (
                 <tr key={wk.id} className="hover:bg-slate-50 transition-colors">
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                       <span className="font-semibold text-slate-800">{wk.name}</span>
                     </div>
                   </td>
                   <td className="px-6 py-4 text-sm text-slate-600">{wk.type}</td>
                   <td className="px-6 py-4 text-sm text-slate-600">
                     <span className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">{wk.namespace}</span>
                   </td>
                   <td className="px-6 py-4 text-sm font-mono text-slate-600">{wk.image}</td>
                   <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${wk.status === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        <span>{wk.availableReplicas} / {wk.replicas}</span>
                      </div>
                   </td>
                   <td className="px-6 py-4 text-xs text-slate-500">
                      {wk.cpuRequest ? `CPU: ${wk.cpuRequest}` : ''}
                      {wk.memRequest ? ` | MEM: ${wk.memRequest}` : ''}
                   </td>
                   <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                       <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="回滚版本">
                         <History size={16} />
                       </button>
                       <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="伸缩">
                         <RotateCcw size={16} />
                       </button>
                       <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="编辑 YAML">
                         <Settings size={16} />
                       </button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         )}

         {activeTab === 'pods' && (
           <div>
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-end">
                 <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    <RefreshCw size={14}/> 刷新列表
                 </button>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Pod 名称</th>
                    <th className="px-6 py-3">节点</th>
                    <th className="px-6 py-3">状态</th>
                    <th className="px-6 py-3">重启次数</th>
                    <th className="px-6 py-3">IP 地址</th>
                    <th className="px-6 py-3 text-right">调试</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mockPods.map(pod => (
                    <tr key={pod.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-mono text-slate-700 font-medium">{pod.name}</td>
                      <td className="px-6 py-3 text-slate-600">{pod.node}</td>
                      <td className="px-6 py-3">
                         <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium border border-green-100">{pod.status}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">{pod.restarts}</td>
                      <td className="px-6 py-3 font-mono text-slate-600">{pod.ip}</td>
                      <td className="px-6 py-3 text-right">
                         <button 
                           onClick={() => setShowTerminal(true)}
                           className="text-slate-600 hover:text-white hover:bg-black px-3 py-1.5 rounded transition-colors text-xs font-mono flex items-center gap-2 ml-auto border border-slate-200 hover:border-black"
                         >
                            <Terminal size={12} /> Exec
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
         )}

         {activeTab === 'hpa' && (
           <div className="p-6">
              {mockHPAs.map(hpa => (
                 <div key={hpa.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="font-bold text-slate-800">{hpa.name}</h3>
                          <div className="text-sm text-slate-500 mt-1">Target: <span className="font-mono text-slate-700">{hpa.targetRef}</span></div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="text-center">
                             <div className="text-xs text-slate-400">Min</div>
                             <div className="font-bold">{hpa.minReplicas}</div>
                          </div>
                          <div className="h-8 w-px bg-slate-200"></div>
                          <div className="text-center">
                             <div className="text-xs text-slate-400">Max</div>
                             <div className="font-bold">{hpa.maxReplicas}</div>
                          </div>
                          <div className="h-8 w-px bg-slate-200"></div>
                          <div className="text-center">
                             <div className="text-xs text-slate-400">Current</div>
                             <div className="font-bold text-blue-600 text-xl">{hpa.currentReplicas}</div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-6">
                       <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Metrics</h4>
                       {hpa.metrics.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <div className="font-bold text-slate-700 w-16">{m.type}</div>
                             <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1">
                                   <span>Current: {m.current}</span>
                                   <span>Target: {m.target}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                   <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '75%'}}></div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
         )}
         
         {activeTab === 'config' && (
            <div className="p-0">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                     <tr>
                        <th className="px-6 py-3">名称</th>
                        <th className="px-6 py-3">命名空间</th>
                        <th className="px-6 py-3">Keys</th>
                        <th className="px-6 py-3">创建时间</th>
                        <th className="px-6 py-3 text-right">操作</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {mockConfigMaps.map(cm => (
                        <tr key={cm.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 font-medium text-slate-800">{cm.name}</td>
                           <td className="px-6 py-4 text-slate-600">{cm.namespace}</td>
                           <td className="px-6 py-4">
                              <div className="flex gap-1">
                                 {cm.keys.map(k => <span key={k} className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-xs text-slate-600">{k}</span>)}
                              </div>
                           </td>
                           <td className="px-6 py-4 text-slate-500">{cm.age}</td>
                           <td className="px-6 py-4 text-right">
                              <button className="text-blue-600 hover:underline">编辑</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>

      {/* Terminal Modal */}
      {showTerminal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-black rounded-lg shadow-2xl w-[800px] h-[500px] flex flex-col overflow-hidden border border-slate-700">
              <div className="bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-700">
                 <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-green-400" />
                    <span className="text-xs text-slate-300 font-mono">root@frontend-service-6789-abcde:/app</span>
                 </div>
                 <button onClick={() => setShowTerminal(false)} className="text-slate-400 hover:text-white"><ArrowLeft size={16}/></button>
              </div>
              <div className="flex-1 p-4 font-mono text-sm text-green-400 overflow-y-auto">
                 <div>$ export POD_IP=10.244.1.5</div>
                 <div>$ curl localhost:8080/health</div>
                 <div className="text-white">{"{\"status\": \"ok\", \"uptime\": \"48h\"}"}</div>
                 <div>$ top</div>
                 <div className="text-slate-400 text-xs mt-2">
                    PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND<br/>
                    1 root      20   0   12.5m   4.2m   2.1m S   0.3  0.1   0:00.05 nginx<br/>
                    24 root      20   0    8.2m   3.1m   1.8m S   0.0  0.1   0:00.00 bash<br/>
                 </div>
                 <div className="mt-2 flex items-center gap-1">
                    <span>$</span>
                    <span className="w-2 h-4 bg-green-400 animate-pulse block"></span>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};