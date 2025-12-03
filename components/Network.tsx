
import React, { useState } from 'react';
import { Service, Ingress, NetworkPolicy, IPPool, IPAllocation, NetworkFlowLog, NetworkAlertRule } from '../types';
import { Network as NetworkIcon, Globe, Shield, Activity, Plus, MoreHorizontal, ArrowUpRight, Search, Settings, X, Check, Server, Share2, Zap, Lock, Router, List, Database, Layers, ArrowRight, ShieldCheck, AlertCircle, Trash2, Box, RefreshCw, Filter, AlertTriangle, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const mockServicesData: Service[] = [
  { id: 'svc-1', name: 'frontend', namespace: 'default', type: 'LoadBalancer', clusterIP: '10.96.0.10', ports: ['80:30080/TCP'], selector: { app: 'frontend' }, protocol: 'TCP', sessionAffinity: 'ClientIP' },
  { id: 'svc-2', name: 'backend-api', namespace: 'default', type: 'ClusterIP', clusterIP: '10.96.0.11', ports: ['8080/TCP'], selector: { app: 'backend' }, protocol: 'TCP' },
  { id: 'svc-3', name: 'redis-db', namespace: 'data', type: 'ClusterIP', clusterIP: '10.96.0.25', ports: ['6379/TCP'], selector: { app: 'redis' }, protocol: 'TCP' },
  { id: 'svc-4', name: 'udp-stream', namespace: 'media', type: 'NodePort', clusterIP: '10.96.0.30', ports: ['5000:30050/UDP'], selector: { app: 'stream' }, protocol: 'UDP' },
];

const mockIngresses: Ingress[] = [
  { id: 'ing-1', name: 'main-ingress', namespace: 'default', loadBalancerIP: '203.0.113.10', rules: [{ host: 'api.example.com', path: '/v1', backend: 'backend-api:8080' }, { host: 'www.example.com', path: '/', backend: 'frontend:80' }], tls: true, certificate: 'wildcard-example-com' },
];

const mockPolicies: NetworkPolicy[] = [
  { id: 'np-1', name: 'deny-all-ingress', namespace: 'default', podSelector: '{}', policyTypes: ['Ingress'], age: '5d', scope: 'Namespace', ingressRules: [] },
  { id: 'np-2', name: 'allow-frontend-to-backend', namespace: 'default', podSelector: 'app=backend', policyTypes: ['Ingress'], ingressRules: [{ from: 'pod:app=frontend', ports: '8080' }], age: '2d', scope: 'Pod' },
  { id: 'np-3', name: 'project-isolation', namespace: 'finance', podSelector: '{}', policyTypes: ['Ingress', 'Egress'], age: '10d', scope: 'Project', ingressRules: [{ from: 'namespace=finance', ports: '*' }] },
];

const mockIPPools: IPPool[] = [
  { id: 'pool-1', name: 'default-ipv4-pool', cidr: '10.244.0.0/16', gateway: '10.244.0.1', vlan: 0, totalIPs: 65534, usedIPs: 1240, status: 'Healthy' },
  { id: 'pool-2', name: 'static-vlan-100', cidr: '192.168.100.0/24', gateway: '192.168.100.1', vlan: 100, totalIPs: 254, usedIPs: 200, namespaceBinding: ['finance', 'payment'], status: 'Healthy' },
];

const mockAllocations: IPAllocation[] = [
  { ip: '192.168.100.10', podName: 'payment-db-0', namespace: 'finance', node: 'node-01', isStatic: true },
  { ip: '192.168.100.11', podName: 'payment-db-1', namespace: 'finance', node: 'node-02', isStatic: true, lastDrift: 'Migrated from node-03 2h ago' },
  { ip: '192.168.100.12', podName: 'payment-api-6d8f', namespace: 'finance', node: 'node-01', isStatic: false },
];

const mockTrafficData = [
  { time: '10:00', ingress: 120, egress: 80, retrans: 0.2, fails: 0 },
  { time: '10:05', ingress: 132, egress: 90, retrans: 0.5, fails: 2 },
  { time: '10:10', ingress: 101, egress: 110, retrans: 0.3, fails: 1 },
  { time: '10:15', ingress: 154, egress: 120, retrans: 1.2, fails: 5 },
  { time: '10:20', ingress: 190, egress: 140, retrans: 0.8, fails: 3 },
  { time: '10:25', ingress: 230, egress: 160, retrans: 0.4, fails: 0 },
  { time: '10:30', ingress: 210, egress: 150, retrans: 0.2, fails: 0 },
];

const mockFlowLogs: NetworkFlowLog[] = [
  { id: 'fl-1', timestamp: '10:25:01', srcIP: '10.244.1.15', srcPod: 'frontend-x8ds', dstIP: '10.244.2.30', dstPod: 'backend-9s8d', dstPort: 8080, protocol: 'TCP', action: 'ALLOW', bytes: 1024, latencyMs: 2 },
  { id: 'fl-2', timestamp: '10:25:02', srcIP: '192.168.1.10', srcPod: 'external-gw', dstIP: '10.244.1.15', dstPod: 'frontend-x8ds', dstPort: 80, protocol: 'TCP', action: 'ALLOW', bytes: 512, latencyMs: 12 },
  { id: 'fl-3', timestamp: '10:25:05', srcIP: '10.244.3.5', srcPod: 'hacker-script', dstIP: '10.244.2.30', dstPod: 'backend-9s8d', dstPort: 22, protocol: 'TCP', action: 'DENY', bytes: 64, latencyMs: 0 },
  { id: 'fl-4', timestamp: '10:25:10', srcIP: '10.244.1.15', srcPod: 'frontend-x8ds', dstIP: '10.244.2.30', dstPod: 'backend-9s8d', dstPort: 8080, protocol: 'TCP', action: 'ALLOW', bytes: 2048, latencyMs: 150 },
];

const mockAlertRules: NetworkAlertRule[] = [
  { id: 'nr-1', name: 'TCP Retransmission Spike', metric: 'Retransmission', operator: '>', threshold: 1, unit: '%', enabled: true },
  { id: 'nr-2', name: 'High Latency (Pod-to-Pod)', metric: 'Latency', operator: '>', threshold: 100, unit: 'ms', enabled: true },
  { id: 'nr-3', name: 'Connection Failure Flood', metric: 'ConnFailure', operator: '>', threshold: 50, unit: 'count/min', enabled: false },
];

export const Network: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ipam' | 'services' | 'policies' | 'monitor'>('ipam');
  const [monitorSubTab, setMonitorSubTab] = useState<'overview' | 'flowlogs' | 'alerts'>('overview');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [flowLogSearch, setFlowLogSearch] = useState('');
  
  // Services State
  const [services, setServices] = useState<Service[]>(mockServicesData);
  
  // Create Service Modal State
  const [isCreateServiceModalOpen, setIsCreateServiceModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    namespace: 'default',
    type: 'ClusterIP' as Service['type'],
    selectors: [{ key: 'app', value: '' }],
    ports: [{ port: 80, targetPort: 80, nodePort: undefined as number | undefined, protocol: 'TCP' as 'TCP' | 'UDP' }]
  });

  // Global Config State
  const [networkMode, setNetworkMode] = useState<'underlay' | 'overlay'>('overlay');
  const [underlayConfig, setUnderlayConfig] = useState({ interface: 'eth0', vlanId: '', cidr: '10.0.0.0/16', gateway: '10.0.0.1' });
  const [overlayConfig, setOverlayConfig] = useState({ protocol: 'VXLAN', cni: 'Calico', mtu: 1450 });
  const [features, setFeatures] = useState({ networkPolicy: true, monitoring: true, autoHealing: false });

  // Policy Builder State
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ name: '', namespace: 'default', type: 'Pod', isolation: false });

  const handleSaveConfig = () => {
    setIsConfigModalOpen(false);
    alert(`网络配置已保存: ${networkMode === 'underlay' ? 'Underlay Mode' : 'Overlay Mode'}`);
  };

  const handleCreateService = () => {
    if (!newService.name) return;
    const formattedPorts = newService.ports.map(p => 
      `${p.port}:${p.targetPort}${p.nodePort ? `:${p.nodePort}` : ''}/${p.protocol}`
    );
    const selectorObj = newService.selectors.reduce((acc, curr) => {
      if(curr.key) acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const svc: Service = {
      id: `svc-${Date.now()}`,
      name: newService.name,
      namespace: newService.namespace,
      type: newService.type,
      clusterIP: newService.type === 'ClusterIP' ? '10.96.x.x' : (newService.type === 'LoadBalancer' ? '10.96.x.x (Pending LB)' : 'None'),
      ports: formattedPorts,
      selector: selectorObj,
      protocol: newService.ports[0].protocol,
      sessionAffinity: 'None'
    };

    setServices([...services, svc]);
    setIsCreateServiceModalOpen(false);
    setNewService({
      name: '',
      namespace: 'default',
      type: 'ClusterIP',
      selectors: [{ key: 'app', value: '' }],
      ports: [{ port: 80, targetPort: 80, nodePort: undefined, protocol: 'TCP' }]
    });
  };

  const addSelector = () => setNewService({...newService, selectors: [...newService.selectors, { key: '', value: '' }]});
  const removeSelector = (idx: number) => {
    const s = [...newService.selectors];
    s.splice(idx, 1);
    setNewService({...newService, selectors: s});
  };
  const updateSelector = (idx: number, field: 'key'|'value', val: string) => {
    const s = [...newService.selectors];
    s[idx][field] = val;
    setNewService({...newService, selectors: s});
  };

  const addPort = () => setNewService({...newService, ports: [...newService.ports, { port: 80, targetPort: 80, nodePort: undefined, protocol: 'TCP' }]});
  const removePort = (idx: number) => {
    const p = [...newService.ports];
    p.splice(idx, 1);
    setNewService({...newService, ports: p});
  };
  const updatePort = (idx: number, field: string, val: any) => {
    const p = [...newService.ports];
    // @ts-ignore
    p[idx][field] = val;
    setNewService({...newService, ports: p});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">网络管理</h2>
           <p className="text-slate-500 text-sm mt-1">Underlay/Overlay 混合网络架构、IPAM 与流量治理</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsConfigModalOpen(true)}
             className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm font-medium shadow-sm"
           >
             <Settings size={16} />
             <span>全局网络配置</span>
           </button>
           <button 
             onClick={() => {
               if(activeTab === 'services') setIsCreateServiceModalOpen(true);
               else alert('请切换到“服务发现”页签创建 Service 或使用其他页签的专属创建按钮。');
             }}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm font-medium shadow-sm"
           >
             <Plus size={16} />
             <span>创建资源</span>
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
         {[
           { id: 'ipam', label: 'IP 地址管理 (IPAM)', icon: <List size={16} /> },
           { id: 'services', label: '服务发现 (Service & LB)', icon: <Globe size={16} /> },
           { id: 'policies', label: '网络策略', icon: <Shield size={16} /> },
           { id: 'monitor', label: '流量监控', icon: <Activity size={16} /> },
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

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
        
        {/* === IPAM TAB === */}
        {activeTab === 'ipam' && (
           <div className="p-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
               {mockIPPools.map(pool => (
                 <div 
                   key={pool.id} 
                   onClick={() => setSelectedPoolId(pool.id)}
                   className={`border rounded-xl p-5 cursor-pointer transition-all ${selectedPoolId === pool.id ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}`}
                 >
                   <div className="flex justify-between items-start mb-3">
                     <div>
                       <h4 className="font-bold text-slate-800">{pool.name}</h4>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">{pool.cidr}</span>
                          {pool.vlan > 0 && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">VLAN {pool.vlan}</span>}
                       </div>
                     </div>
                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pool.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{pool.status}</span>
                   </div>
                   
                   <div className="space-y-2">
                     <div className="flex justify-between text-xs text-slate-500">
                        <span>分配率</span>
                        <span>{pool.usedIPs} / {pool.totalIPs} ({((pool.usedIPs/pool.totalIPs)*100).toFixed(1)}%)</span>
                     </div>
                     <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${pool.usedIPs/pool.totalIPs > 0.8 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{width: `${(pool.usedIPs/pool.totalIPs)*100}%`}}></div>
                     </div>
                   </div>

                   {pool.namespaceBinding && (
                     <div className="mt-3 text-xs text-slate-500">
                        绑定命名空间: {pool.namespaceBinding.join(', ')}
                     </div>
                   )}
                 </div>
               ))}
               
               <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-colors min-h-[160px]">
                  <Plus size={32} />
                  <span className="mt-2 text-sm font-medium">创建 IP 地址池</span>
               </div>
             </div>

             {selectedPoolId && (
               <div className="animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center mb-4 pt-6 border-t border-slate-100">
                     <h3 className="font-bold text-slate-700">地址分配详情 ({mockIPPools.find(p=>p.id===selectedPoolId)?.name})</h3>
                     <div className="flex gap-2">
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                           <input placeholder="搜索 IP 或 Pod..." className="pl-8 pr-4 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                     </div>
                  </div>
                  <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                           <th className="px-6 py-3">IP 地址</th>
                           <th className="px-6 py-3">绑定 Pod</th>
                           <th className="px-6 py-3">命名空间</th>
                           <th className="px-6 py-3">所在节点</th>
                           <th className="px-6 py-3">分配类型</th>
                           <th className="px-6 py-3 text-right">状态信息</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {mockAllocations.map((alloc, i) => (
                           <tr key={i} className="hover:bg-slate-50">
                              <td className="px-6 py-3 font-mono text-slate-700">{alloc.ip}</td>
                              <td className="px-6 py-3 font-medium text-slate-800">{alloc.podName}</td>
                              <td className="px-6 py-3 text-slate-600">{alloc.namespace}</td>
                              <td className="px-6 py-3 text-slate-600">{alloc.node}</td>
                              <td className="px-6 py-3">
                                 {alloc.isStatic ? (
                                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs border border-purple-100">
                                       <Lock size={10} /> 固定 IP
                                    </span>
                                 ) : (
                                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                                       动态分配
                                    </span>
                                 )}
                              </td>
                              <td className="px-6 py-3 text-right">
                                 {alloc.lastDrift ? (
                                    <span className="text-xs text-orange-600 flex items-center justify-end gap-1" title={alloc.lastDrift}>
                                       <Share2 size={12} /> IP 漂移已保护
                                    </span>
                                 ) : (
                                    <span className="text-xs text-green-600">正常</span>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
             )}
           </div>
        )}

        {/* === SERVICES & LB TAB === */}
        {activeTab === 'services' && (
           <div className="p-6 space-y-8">
              {/* L4 Section */}
              <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Layers size={20} className="text-blue-600" /> Service (四层负载均衡 TCP/UDP)
                    </h3>
                    <button 
                      onClick={() => setIsCreateServiceModalOpen(true)}
                      className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 border border-blue-200"
                    >
                        <Plus size={16} /> 新建 Service
                    </button>
                 </div>
                 
                 <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                          <tr>
                             <th className="px-6 py-3">服务名称</th>
                             <th className="px-6 py-3">类型</th>
                             <th className="px-6 py-3">Cluster IP</th>
                             <th className="px-6 py-3">协议/端口</th>
                             <th className="px-6 py-3">Selector</th>
                             <th className="px-6 py-3 text-right">操作</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {services.map(svc => (
                             <tr key={svc.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                   <div className="font-medium text-slate-800">{svc.name}</div>
                                   <div className="text-xs text-slate-500">{svc.namespace}</div>
                                </td>
                                <td className="px-6 py-4">
                                   <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                                      svc.type === 'LoadBalancer' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                      svc.type === 'NodePort' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-slate-100 text-slate-700 border-slate-200'
                                   }`}>
                                      {svc.type}
                                   </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-600">{svc.clusterIP}</td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-bold px-1 rounded ${svc.protocol === 'UDP' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>{svc.protocol}</span>
                                      <span className="font-mono text-slate-600">{svc.ports.join(', ')}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                                   {Object.entries(svc.selector).map(([k,v]) => `${k}=${v}`).join(', ')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <button className="text-slate-400 hover:text-blue-600"><MoreHorizontal size={18} /></button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* L7 Section */}
              <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                       <Globe size={20} className="text-purple-600" /> Ingress (七层负载均衡 HTTP/HTTPS)
                    </h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockIngresses.map(ing => (
                       <div key={ing.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-2">
                             {ing.tls ? (
                                <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-bl-lg font-bold shadow-sm">
                                   <Lock size={10} /> HTTPS / TLS
                                </span>
                             ) : (
                                <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-bl-lg font-bold">HTTP Only</span>
                             )}
                          </div>
                          
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <h4 className="font-bold text-slate-800 text-lg">{ing.name}</h4>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                   <span className="bg-slate-100 px-1.5 py-0.5 rounded">{ing.namespace}</span>
                                   {ing.certificate && <span className="flex items-center gap-1"><ShieldCheck size={10}/> Cert: {ing.certificate}</span>}
                                </div>
                             </div>
                          </div>
                          
                          <div className="space-y-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                             {ing.rules.map((rule, idx) => (
                                <div key={idx} className="flex items-center text-sm">
                                   <div className="flex-1 min-w-0">
                                      <div className="font-medium text-slate-700 truncate" title={rule.host}>{rule.host}</div>
                                      <div className="text-xs text-slate-400 font-mono">{rule.path}</div>
                                   </div>
                                   <div className="mx-2 text-slate-300"><ArrowRight size={14} /></div>
                                   <div className="bg-white text-slate-700 px-2 py-1 rounded text-xs font-mono border border-slate-200 shadow-sm truncate max-w-[120px]" title={rule.backend}>
                                      {rule.backend}
                                   </div>
                                </div>
                             ))}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                              <span className="text-slate-400">LB IP: {ing.loadBalancerIP || 'Pending'}</span>
                              <button className="text-blue-600 hover:underline">配置规则</button>
                          </div>
                       </div>
                    ))}
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-slate-400 min-h-[200px] cursor-pointer hover:bg-slate-50 hover:border-slate-300 hover:text-slate-600 transition-colors">
                       <Plus size={32} />
                       <span className="mt-2 font-medium">添加 Ingress 路由</span>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* === POLICIES TAB === */}
        {activeTab === 'policies' && (
           <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-2">
                    <Shield className="text-green-600" size={24} />
                    <div>
                       <h3 className="font-bold text-slate-800">网络策略可视化</h3>
                       <p className="text-xs text-slate-500">基于 Namespace、Pod 和 IPBlock 的微隔离规则管理。</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setIsPolicyModalOpen(true)}
                   className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 flex items-center gap-2"
                 >
                    <Plus size={16} /> 新建策略
                 </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 {mockPolicies.map(pol => (
                    <div key={pol.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-white">
                       <div className="flex items-start gap-4 mb-4 md:mb-0">
                          <div className={`p-3 rounded-xl ${pol.name.includes('deny') ? 'bg-red-50 text-red-600' : pol.scope === 'Project' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                             {pol.scope === 'Project' ? <Layers size={24} /> : <Shield size={24} />}
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-800 text-lg">{pol.name}</h4>
                             <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">NS: {pol.namespace}</span>
                                <span className="text-slate-300">|</span>
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">Selector: {pol.podSelector}</span>
                                <span className="text-slate-300">|</span>
                                <span className={`px-2 py-0.5 rounded font-bold ${pol.scope === 'Project' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                   Scope: {pol.scope}
                                </span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-col gap-3 min-w-[300px]">
                          {/* Visualization of Rule Flow */}
                          <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-xs flex items-center justify-between">
                             <span className="font-bold text-slate-500">Sources</span>
                             <div className="flex-1 mx-2 h-px bg-slate-300 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-1 text-[10px] text-slate-400">
                                   ALLOW
                                </div>
                             </div>
                             <span className="font-bold text-slate-700">Target Pods</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                             <div className="flex gap-2">
                                {pol.policyTypes.map(t => (
                                   <span key={t} className="font-bold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">{t}</span>
                                ))}
                             </div>
                             <span>Age: {pol.age}</span>
                          </div>
                       </div>

                       <div className="ml-4 md:ml-8 flex items-center">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"><Settings size={20} /></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* === MONITOR TAB (Complete Implementation) === */}
        {activeTab === 'monitor' && (
           <div className="p-6 flex flex-col h-[800px]">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       <Activity size={24} className="text-blue-600" />
                       集群网络监控
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                       实时观测集群流量、连接状态及五元组流日志审计。
                    </p>
                 </div>
                 <div className="flex gap-2">
                     <button 
                       onClick={() => setMonitorSubTab('overview')}
                       className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${monitorSubTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                     >
                        总览视图
                     </button>
                     <button 
                       onClick={() => setMonitorSubTab('flowlogs')}
                       className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${monitorSubTab === 'flowlogs' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                     >
                        流日志 (Flow Logs)
                     </button>
                     <button 
                       onClick={() => setMonitorSubTab('alerts')}
                       className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${monitorSubTab === 'alerts' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                     >
                        智能告警
                     </button>
                 </div>
              </div>

              {/* Sub-Tab Content */}
              {monitorSubTab === 'overview' && (
                 <div className="space-y-6 animate-in fade-in">
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Total Throughput</div>
                          <div className="text-2xl font-bold text-slate-800">1.2 GB/s</div>
                          <div className="text-xs text-green-600 mt-1 flex items-center gap-1"><ArrowUpRight size={12}/> +5% vs 1h ago</div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Retransmission Rate</div>
                          <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                             0.12% 
                             <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-normal">Healthy</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">TCP Packets</div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Conn. Failures</div>
                          <div className="text-2xl font-bold text-slate-800">3</div>
                          <div className="text-xs text-slate-400 mt-1">Events / min</div>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Active Flows</div>
                          <div className="text-2xl font-bold text-slate-800">4,520</div>
                          <div className="text-xs text-slate-400 mt-1">Conntrack Entries</div>
                       </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-700 mb-4">网络吞吐量趋势</h4>
                          <div className="h-64">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockTrafficData}>
                                   <defs>
                                      <linearGradient id="colorIngress" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                         <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                      </linearGradient>
                                      <linearGradient id="colorEgress" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                      </linearGradient>
                                   </defs>
                                   <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                   <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="Mbps" />
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                   <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                                   <Legend wrapperStyle={{paddingTop: '20px'}} />
                                   <Area type="monotone" dataKey="ingress" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIngress)" name="Inbound" />
                                   <Area type="monotone" dataKey="egress" stroke="#10b981" fillOpacity={1} fill="url(#colorEgress)" name="Outbound" />
                                </AreaChart>
                             </ResponsiveContainer>
                          </div>
                       </div>

                       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-700 mb-4">TCP 健康度 (重传与连接失败)</h4>
                          <div className="h-64">
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mockTrafficData}>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                   <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                   <YAxis yAxisId="left" stroke="#f59e0b" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                                   <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={12} tickLine={false} axisLine={false} />
                                   <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                                   <Legend wrapperStyle={{paddingTop: '20px'}} />
                                   <Line yAxisId="left" type="monotone" dataKey="retrans" stroke="#f59e0b" strokeWidth={2} name="Retransmission %" dot={false} />
                                   <Line yAxisId="right" type="monotone" dataKey="fails" stroke="#ef4444" strokeWidth={2} name="Conn Failures" />
                                </LineChart>
                             </ResponsiveContainer>
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              {monitorSubTab === 'flowlogs' && (
                 <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                       <div className="flex items-center gap-3 w-full max-w-lg">
                          <div className="relative flex-1">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                             <input 
                               placeholder="搜索 Source IP, Pod 或 Destination..." 
                               className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                               value={flowLogSearch}
                               onChange={e => setFlowLogSearch(e.target.value)}
                             />
                          </div>
                          <button className="p-2 border border-slate-300 bg-white rounded-lg text-slate-600 hover:bg-slate-50">
                             <Filter size={18} />
                          </button>
                          <button className="p-2 border border-slate-300 bg-white rounded-lg text-slate-600 hover:bg-slate-50">
                             <RefreshCw size={18} />
                          </button>
                       </div>
                       <span className="text-xs text-slate-400">Showing last 4 records</span>
                    </div>
                    <div className="flex-1 overflow-auto">
                       <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                             <tr>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3">Destination</th>
                                <th className="px-6 py-3">Port/Proto</th>
                                <th className="px-6 py-3">Action</th>
                                <th className="px-6 py-3">Stats</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {mockFlowLogs
                               .filter(l => 
                                 l.srcIP.includes(flowLogSearch) || 
                                 l.srcPod?.includes(flowLogSearch) || 
                                 l.dstPod?.includes(flowLogSearch)
                               )
                               .map(log => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                   <td className="px-6 py-3 font-mono text-slate-600">{log.timestamp}</td>
                                   <td className="px-6 py-3">
                                      <div className="font-medium text-slate-700">{log.srcPod || 'External'}</div>
                                      <div className="text-xs text-slate-400 font-mono">{log.srcIP}</div>
                                   </td>
                                   <td className="px-6 py-3">
                                      <div className="font-medium text-slate-700">{log.dstPod || 'External'}</div>
                                      <div className="text-xs text-slate-400 font-mono">{log.dstIP}</div>
                                   </td>
                                   <td className="px-6 py-3">
                                      <div className="font-mono text-slate-600">{log.dstPort}</div>
                                      <div className="text-xs text-slate-400">{log.protocol}</div>
                                   </td>
                                   <td className="px-6 py-3">
                                      {log.action === 'ALLOW' ? (
                                         <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                            <Check size={10} /> ALLOW
                                         </span>
                                      ) : (
                                         <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                            <X size={10} /> DENY
                                         </span>
                                      )}
                                   </td>
                                   <td className="px-6 py-3 text-xs text-slate-500">
                                      <div>{log.bytes} Bytes</div>
                                      <div className={log.latencyMs > 100 ? 'text-orange-500 font-bold' : ''}>{log.latencyMs} ms</div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              )}

              {monitorSubTab === 'alerts' && (
                 <div className="space-y-6 animate-in fade-in">
                    <div className="flex gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm items-center">
                       <AlertTriangle size={20} />
                       智能检测引擎会自动分析网络流量基线，并在检测到重传激增、DDoS 攻击特征或网络分区时触发告警。
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                       <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                          <h3 className="font-bold text-slate-700">告警规则配置</h3>
                          <button className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
                             <Plus size={16} /> 添加规则
                          </button>
                       </div>
                       <div className="divide-y divide-slate-100">
                          {mockAlertRules.map(rule => (
                             <div key={rule.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                   <div className="font-bold text-slate-800 flex items-center gap-2">
                                      {rule.name}
                                      {!rule.enabled && <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Disabled</span>}
                                   </div>
                                   <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">Metric: {rule.metric}</span>
                                      <span>if value {rule.operator} {rule.threshold} {rule.unit}</span>
                                   </div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <button className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                      <Settings size={18} />
                                   </button>
                                   <div className={`relative inline-block w-10 h-6 rounded-full cursor-pointer transition-colors ${rule.enabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                                      <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${rule.enabled ? 'translate-x-4' : ''}`} />
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              )}
           </div>
        )}

        {/* ... (Keep existing Modals: Config, Policy, Service) ... */}
        {/* --- Global Config Modal --- */}
        {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                       <Router size={24} className="text-blue-600" /> 全局网络配置
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">配置集群底层网络架构 (CNI) 及全局路由策略。</p>
                 </div>
                 <button onClick={() => setIsConfigModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-white p-1 rounded-full border border-transparent hover:border-slate-200 transition-colors">
                    <X size={24} />
                 </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                 <div className="space-y-8">
                    {/* Section 1: Architecture Mode */}
                    <div>
                       <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">1. 网络部署模式 (Deployment Mode)</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Underlay Card */}
                          <div 
                             onClick={() => setNetworkMode('underlay')}
                             className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${networkMode === 'underlay' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                          >
                             <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${networkMode === 'underlay' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                   <Server size={24} />
                                </div>
                                <h5 className="font-bold text-lg text-slate-800">Underlay 网络</h5>
                             </div>
                             <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                容器网络直接复用物理网络架构。Pod 直接获取物理网段 IP (如 MacVLAN/IPVLAN)。
                             </p>
                             <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                   <Check size={14} className="text-green-500" /> 极致性能 (低延迟/高吞吐)
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                   <Check size={14} className="text-green-500" /> 适合高性能计算、高频交易
                                </div>
                             </div>
                             {networkMode === 'underlay' && <div className="absolute top-4 right-4 text-blue-600"><Check size={24} /></div>}
                          </div>

                          {/* Overlay Card */}
                          <div 
                             onClick={() => setNetworkMode('overlay')}
                             className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${networkMode === 'overlay' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 bg-white hover:border-purple-300'}`}
                          >
                             <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${networkMode === 'overlay' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                   <Share2 size={24} />
                                </div>
                                <h5 className="font-bold text-lg text-slate-800">Overlay 网络</h5>
                             </div>
                             <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                基于隧道技术 (VXLAN/Geneve) 构建的虚拟逻辑网络。与物理网络解耦，灵活性高。
                             </p>
                             <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                   <Check size={14} className="text-green-500" /> 高灵活性，无视底层架构差异
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                   <Check size={14} className="text-green-500" /> 适合大规模、多租户场景
                                </div>
                             </div>
                             {networkMode === 'overlay' && <div className="absolute top-4 right-4 text-purple-600"><Check size={24} /></div>}
                          </div>
                       </div>
                    </div>

                    {/* Section 2: Detailed Params */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                          <Settings size={16} /> 2. 核心参数配置
                       </h4>
                       
                       {networkMode === 'underlay' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">物理接口 (Interface)</label>
                                <input 
                                   className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                   value={underlayConfig.interface}
                                   onChange={e => setUnderlayConfig({...underlayConfig, interface: e.target.value})}
                                   placeholder="e.g. eth0"
                                />
                                <p className="text-xs text-slate-400 mt-1">宿主机用于桥接的物理网卡名称。</p>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">VLAN ID (Optional)</label>
                                <input 
                                   className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                   value={underlayConfig.vlanId}
                                   onChange={e => setUnderlayConfig({...underlayConfig, vlanId: e.target.value})}
                                   placeholder="e.g. 100"
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Pod CIDR</label>
                                <input 
                                   className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                   value={underlayConfig.cidr}
                                   onChange={e => setUnderlayConfig({...underlayConfig, cidr: e.target.value})}
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Gateway</label>
                                <input 
                                   className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                   value={underlayConfig.gateway}
                                   onChange={e => setUnderlayConfig({...underlayConfig, gateway: e.target.value})}
                                />
                             </div>
                          </div>
                       ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">CNI 插件</label>
                                <select 
                                   className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                   value={overlayConfig.cni}
                                   onChange={e => setOverlayConfig({...overlayConfig, cni: e.target.value})}
                                >
                                   <option value="Calico">Calico (推荐)</option>
                                   <option value="Cilium">Cilium (eBPF)</option>
                                   <option value="Flannel">Flannel</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">隧道协议</label>
                                <select 
                                   className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                   value={overlayConfig.protocol}
                                   onChange={e => setOverlayConfig({...overlayConfig, protocol: e.target.value})}
                                >
                                   <option value="VXLAN">VXLAN</option>
                                   <option value="Geneve">Geneve</option>
                                   <option value="IPIP">IP-in-IP</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">MTU 设置</label>
                                <input 
                                   type="number"
                                   className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                   value={overlayConfig.mtu}
                                   onChange={e => setOverlayConfig({...overlayConfig, mtu: parseInt(e.target.value)})}
                                />
                                <p className="text-xs text-slate-400 mt-1">通常建议设置为 1450 (VXLAN overhead 50 bytes)。</p>
                             </div>
                          </div>
                       )}
                    </div>

                    {/* Section 3: Advanced Features */}
                    <div>
                       <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">3. 高级特性 (Advanced Features)</h4>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer ${features.networkPolicy ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}
                             onClick={() => setFeatures({...features, networkPolicy: !features.networkPolicy})}
                          >
                             <div className="flex items-center gap-3">
                                <Shield size={20} className={features.networkPolicy ? 'text-green-600' : 'text-slate-400'} />
                                <div>
                                   <div className="text-sm font-bold text-slate-800">网络策略隔离</div>
                                   <div className="text-xs text-slate-500">NetworkPolicy</div>
                                </div>
                             </div>
                             <div className={`w-10 h-5 rounded-full relative transition-colors ${features.networkPolicy ? 'bg-green-500' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${features.networkPolicy ? 'left-6' : 'left-1'}`}></div>
                             </div>
                          </div>

                          <div className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer ${features.monitoring ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}
                             onClick={() => setFeatures({...features, monitoring: !features.monitoring})}
                          >
                             <div className="flex items-center gap-3">
                                <Activity size={20} className={features.monitoring ? 'text-green-600' : 'text-slate-400'} />
                                <div>
                                   <div className="text-sm font-bold text-slate-800">全链路监控</div>
                                   <div className="text-xs text-slate-500">Hubble / Flow Logs</div>
                                </div>
                             </div>
                             <div className={`w-10 h-5 rounded-full relative transition-colors ${features.monitoring ? 'bg-green-500' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${features.monitoring ? 'left-6' : 'left-1'}`}></div>
                             </div>
                          </div>

                          <div className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer ${features.autoHealing ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}
                             onClick={() => setFeatures({...features, autoHealing: !features.autoHealing})}
                          >
                             <div className="flex items-center gap-3">
                                <Zap size={20} className={features.autoHealing ? 'text-green-600' : 'text-slate-400'} />
                                <div>
                                   <div className="text-sm font-bold text-slate-800">故障自愈</div>
                                   <div className="text-xs text-slate-500">Auto Healing</div>
                                </div>
                             </div>
                             <div className={`w-10 h-5 rounded-full relative transition-colors ${features.autoHealing ? 'bg-green-500' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${features.autoHealing ? 'left-6' : 'left-1'}`}></div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                 <button 
                   onClick={() => setIsConfigModalOpen(false)}
                   className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors font-medium"
                 >
                   取消
                 </button>
                 <button 
                   onClick={handleSaveConfig}
                   className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-sm"
                 >
                   <Check size={18} /> 保存配置
                 </button>
              </div>
           </div>
        </div>
        )}

        {/* --- Policy Creator Modal --- */}
        {isPolicyModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">新建网络隔离策略</h3>
                    <button onClick={() => setIsPolicyModalOpen(false)}><X size={20} className="text-slate-400"/></button>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">策略名称</label>
                       <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. isolate-db-traffic" />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">生效范围 (Scope)</label>
                       <div className="grid grid-cols-3 gap-3">
                          {['Pod', 'Namespace', 'Project'].map(scope => (
                             <button 
                                key={scope}
                                onClick={() => setNewPolicy({...newPolicy, type: scope})}
                                className={`py-2 text-sm rounded-lg border font-medium ${newPolicy.type === scope ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'}`}
                             >
                                {scope} Level
                             </button>
                          ))}
                       </div>
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                       <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" checked={newPolicy.isolation} onChange={e => setNewPolicy({...newPolicy, isolation: e.target.checked})} />
                          <div>
                             <div className="font-bold text-sm text-slate-800">启用默认隔离 (Default Deny)</div>
                             <p className="text-xs text-slate-500 mt-0.5">拒绝所有未明确允许的入站/出站流量，实现零信任网络。</p>
                          </div>
                       </label>
                    </div>
                 </div>
  
                 <div className="mt-8 flex justify-end gap-3">
                    <button onClick={() => setIsPolicyModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">取消</button>
                    <button onClick={() => { setIsPolicyModalOpen(false); alert('策略已下发'); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">创建策略</button>
                 </div>
              </div>
           </div>
        )}

        {/* --- Create Service Modal --- */}
        {isCreateServiceModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                 <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">创建 Service</h3>
                      <p className="text-sm text-slate-500 mt-1">暴露应用服务，支持集群内访问或外部负载均衡。</p>
                    </div>
                    <button onClick={() => setIsCreateServiceModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                 </div>
                 
                 <div className="p-8 overflow-y-auto space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Service 名称 <span className="text-red-500">*</span></label>
                          <input 
                             className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                             placeholder="my-service"
                             value={newService.name}
                             onChange={e => setNewService({...newService, name: e.target.value})}
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Namespace</label>
                          <select 
                             className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                             value={newService.namespace}
                             onChange={e => setNewService({...newService, namespace: e.target.value})}
                          >
                             <option value="default">default</option>
                             <option value="kube-system">kube-system</option>
                             <option value="finance">finance</option>
                          </select>
                       </div>
                    </div>
  
                    {/* Type Selection */}
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-2">Service 类型</label>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                             { id: 'ClusterIP', label: 'ClusterIP', desc: '仅集群内部访问 (默认)', icon: <Box size={18}/> },
                             { id: 'NodePort', label: 'NodePort', desc: '通过节点端口暴露', icon: <Server size={18}/> },
                             { id: 'LoadBalancer', label: 'LoadBalancer', desc: '对接外部负载均衡器', icon: <Globe size={18}/> },
                          ].map((t) => (
                             <div 
                                key={t.id}
                                onClick={() => setNewService({...newService, type: t.id as any})}
                                className={`p-4 border rounded-xl cursor-pointer transition-all ${newService.type === t.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-slate-300'}`}
                             >
                                <div className="flex items-center gap-2 mb-1">
                                   <div className={newService.type === t.id ? 'text-blue-600' : 'text-slate-400'}>{t.icon}</div>
                                   <span className="font-bold text-sm text-slate-800">{t.label}</span>
                                </div>
                                <p className="text-xs text-slate-500">{t.desc}</p>
                             </div>
                          ))}
                       </div>
                    </div>
  
                    {/* Selector */}
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-2">Selector (关联 Pod)</label>
                       <div className="space-y-2">
                          {newService.selectors.map((sel, idx) => (
                             <div key={idx} className="flex gap-2 items-center">
                                <input 
                                   placeholder="Key (e.g. app)" 
                                   className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-sm"
                                   value={sel.key}
                                   onChange={e => updateSelector(idx, 'key', e.target.value)}
                                />
                                <span className="text-slate-400">=</span>
                                <input 
                                   placeholder="Value (e.g. frontend)" 
                                   className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-sm"
                                   value={sel.value}
                                   onChange={e => updateSelector(idx, 'value', e.target.value)}
                                />
                                <button onClick={() => removeSelector(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                             </div>
                          ))}
                          <button onClick={addSelector} className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium mt-1">
                             <Plus size={12}/> 添加标签
                          </button>
                       </div>
                    </div>
  
                    {/* Ports */}
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-2">端口映射</label>
                       <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                          <div className="grid grid-cols-10 gap-2 text-xs font-bold text-slate-500 mb-1 px-1">
                             <div className="col-span-2">协议</div>
                             <div className="col-span-3">Service Port</div>
                             <div className="col-span-3">Target Port</div>
                             {newService.type !== 'ClusterIP' && <div className="col-span-2">NodePort</div>}
                          </div>
                          {newService.ports.map((p, idx) => (
                             <div key={idx} className="grid grid-cols-10 gap-2 items-center">
                                <div className="col-span-2">
                                   <select 
                                      className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white"
                                      value={p.protocol}
                                      onChange={e => updatePort(idx, 'protocol', e.target.value)}
                                   >
                                      <option>TCP</option>
                                      <option>UDP</option>
                                      <option>SCTP</option>
                                   </select>
                                </div>
                                <div className="col-span-3">
                                   <input 
                                      type="number" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                                      value={p.port} onChange={e => updatePort(idx, 'port', parseInt(e.target.value))}
                                   />
                                </div>
                                <div className="col-span-3">
                                   <input 
                                      type="number" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                                      value={p.targetPort} onChange={e => updatePort(idx, 'targetPort', parseInt(e.target.value))}
                                   />
                                </div>
                                {newService.type !== 'ClusterIP' && (
                                   <div className="col-span-2">
                                      <input 
                                         type="number" placeholder="Auto" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                                         value={p.nodePort || ''} onChange={e => updatePort(idx, 'nodePort', parseInt(e.target.value))}
                                      />
                                   </div>
                                )}
                                <div className="absolute right-12">
                                   {newService.ports.length > 1 && (
                                      <button onClick={() => removePort(idx)} className="text-slate-400 hover:text-red-500 p-1"><X size={14}/></button>
                                   )}
                                </div>
                             </div>
                          ))}
                          <button onClick={addPort} className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium mt-2">
                             <Plus size={12}/> 添加端口
                          </button>
                       </div>
                    </div>
                 </div>
  
                 <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={() => setIsCreateServiceModalOpen(false)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors font-medium">取消</button>
                    <button onClick={handleCreateService} disabled={!newService.name} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg transition-colors font-medium flex items-center gap-2">
                       <Check size={18} /> 创建 Service
                    </button>
                 </div>
              </div>
           </div>
        )}
    </div>
  );
};
