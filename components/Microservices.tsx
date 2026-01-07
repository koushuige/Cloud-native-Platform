
import React, { useState } from 'react';
import { MicroService, TraceSpan, Gateway, ExternalService, ServicePolicy, RateLimit, GrayRelease } from '../types';
import { 
  Zap, Activity, LayoutList, Share2, Plus, ArrowRight, ShieldCheck, 
  AlertTriangle, CheckCircle, Search, Settings, MoreVertical, 
  Clock, GitCommit, Smartphone, Monitor, Database, Terminal, 
  Layers, Sliders, Globe, FastForward, Timer, Bug, Network, 
  Trash2, Copy, Play, Pause, RefreshCw, ChevronRight, BarChart as BarChartIcon,
  LogIn, LogOut, Link2, Filter, ShieldAlert, Rocket, Gauge, History,
  Info, Check, X, Shield, Server, Box, GitPullRequest
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

// --- Mock Data for Traffic Management ---

const mockGateways: Gateway[] = [
  { id: 'gw-1', name: 'ingress-gateway', type: 'Ingress', hosts: ['*.example.com'], ports: [80, 443], status: 'Ready', namespace: 'istio-system' },
  { id: 'gw-2', name: 'egress-gateway', type: 'Egress', hosts: ['api.github.com', 'storage.s3.com'], ports: [443], status: 'Ready', namespace: 'istio-system' },
];

const mockExternalServices: ExternalService[] = [
  { id: 'ext-1', host: 'mysql-rds.aws.com', location: 'MESH_EXTERNAL', resolution: 'DNS', endpoints: ['10.50.1.20'], namespace: 'prod' },
  { id: 'ext-2', host: 'payment-api.stripe.com', location: 'MESH_EXTERNAL', resolution: 'DNS', endpoints: [], namespace: 'prod' },
];

const mockPolicies: ServicePolicy[] = [
  { id: 'pol-1', service: 'order-service', lbPolicy: 'ROUND_ROBIN', circuitBreaker: { maxConnections: 100, errorThreshold: 5, interval: '10s' } },
  { id: 'pol-2', service: 'auth-service', lbPolicy: 'LEAST_CONN', circuitBreaker: { maxConnections: 50, errorThreshold: 3, interval: '30s' } },
];

const mockRateLimits: RateLimit[] = [
  { id: 'rl-1', service: 'api-gateway', limit: 5000, unit: 'rps', status: 'Enabled' },
  { id: 'rl-2', service: 'user-service', limit: 200, unit: 'rps', status: 'Enabled' },
];

const mockGrays: GrayRelease[] = [
  { id: 'gr-1', name: 'Order-Service-V3-Canary', service: 'order-service', baseline: { version: 'v2', weight: 90 }, canary: { version: 'v3', weight: 10, status: 'Testing' }, startTime: '2023-10-30 10:00' },
];

// Added missing mock data for Microservices management and tracing
const mockTraces: TraceSpan[] = [
  { id: 'tr-1', operation: 'GET /api/v1/orders', service: 'order-service', startTime: '10:30:01', duration: 120, status: 'OK', tags: { 'http.status_code': '200' } },
  { id: 'tr-2', operation: 'POST /api/v1/payment', service: 'payment-svc', startTime: '10:30:05', duration: 450, status: 'Error', tags: { 'http.status_code': '500' } },
  { id: 'tr-3', operation: 'GET /auth/verify', service: 'auth-service', startTime: '10:30:10', duration: 45, status: 'OK', tags: { 'http.status_code': '200' } },
  { id: 'tr-4', operation: 'PUT /api/v1/inventory', service: 'inventory-svc', startTime: '10:30:15', duration: 80, status: 'OK', tags: { 'http.status_code': '200' } },
];

const mockServices: MicroService[] = [
  { id: 'ms-1', name: 'order-service', namespace: 'prod', version: 'v3.2.1', instances: 5, status: 'Healthy', healthScore: 98, qps: 1200, latency: '45ms', errorRate: 0.1 },
  { id: 'ms-2', name: 'auth-service', namespace: 'prod', version: 'v2.1.0', instances: 3, status: 'Healthy', healthScore: 100, qps: 850, latency: '20ms', errorRate: 0 },
  { id: 'ms-3', name: 'payment-svc', namespace: 'prod', version: 'v1.5.0', instances: 2, status: 'Warning', healthScore: 82, qps: 450, latency: '150ms', errorRate: 2.5 },
  { id: 'ms-4', name: 'inventory-svc', namespace: 'prod', version: 'v1.1.0', instances: 3, status: 'Healthy', healthScore: 95, qps: 600, latency: '35ms', errorRate: 0.2 },
];

// --- Sub-Components ---

const TrafficManagement: React.FC = () => {
  const [subTab, setSubTab] = useState<'gateways' | 'external' | 'routing' | 'policies' | 'ratelimit' | 'gray'>('gray');
  
  return (
    <div className="flex flex-col h-full bg-slate-50/50 -m-8 animate-in fade-in duration-500">
      {/* Internal Sidebar for Traffic */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r border-slate-200 p-6 space-y-2 shrink-0 h-[calc(100vh-180px)] overflow-y-auto">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">流量治理架构</div>
          {[
            { id: 'gateways', label: '出入口网关', icon: <LogIn size={16}/> },
            { id: 'external', label: '外部服务', icon: <Link2 size={16}/> },
            { id: 'routing', label: '服务路由', icon: <Share2 size={16}/> },
            { id: 'policies', label: '服务策略', icon: <Sliders size={16}/> },
            { id: 'ratelimit', label: '服务限流', icon: <Gauge size={16}/> },
            { id: 'gray', label: '灰度发布', icon: <Rocket size={16}/> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                subTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Traffic Sub-Content Area */}
        <div className="flex-1 p-10 overflow-y-auto h-[calc(100vh-180px)]">
          {subTab === 'gateways' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-end">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">入口与出口网关</h3>
                   <p className="text-sm text-slate-500 mt-1">管理网格边界流量，配置域名监听、端口协议及 TLS 安全策略。</p>
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
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">{gw.namespace}</p>
                      
                      <div className="mt-8 space-y-4">
                         <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-mono text-xs text-slate-600">
                            <Globe size={14} className="text-slate-400"/>
                            {gw.hosts.join(', ')}
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {gw.ports.map(p => (
                               <span key={p} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black">Port: {p}</span>
                            ))}
                         </div>
                      </div>
                      <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center">
                         <button className="text-indigo-600 hover:underline text-xs font-black">查看路由规则</button>
                         <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"><Settings size={18}/></button>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {subTab === 'external' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-end">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">外部服务注册 (Service Entry)</h3>
                   <p className="text-sm text-slate-500 mt-1">将第三方 API 或集群外数据库注册到网格，实现统一的监控、重试及灰度策略。</p>
                </div>
                <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 shadow-xl transition-all"><Plus size={18}/> 注册外部服务</button>
              </div>
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                       <tr>
                          <th className="px-10 py-5">主机名 (Host)</th>
                          <th className="px-6 py-5">位置</th>
                          <th className="px-6 py-5">解析模式</th>
                          <th className="px-6 py-5">端点数量</th>
                          <th className="px-10 py-5 text-right">操作</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {mockExternalServices.map(ext => (
                          <tr key={ext.id} className="hover:bg-slate-50/50 transition-colors group">
                             <td className="px-10 py-6 font-black text-slate-700">{ext.host}</td>
                             <td className="px-6 py-6"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black text-slate-600 uppercase tracking-tighter">{ext.location}</span></td>
                             <td className="px-6 py-6 font-mono text-xs text-indigo-600 font-black">{ext.resolution}</td>
                             <td className="px-6 py-6 text-sm font-bold text-slate-500">{ext.endpoints.length || 'Auto'}</td>
                             <td className="px-10 py-6 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-100"><Settings size={14}/></button>
                                   <button className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-red-600 border border-transparent hover:border-slate-100"><Trash2 size={14}/></button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}

          {subTab === 'routing' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-end">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">服务路由 (Virtual Services)</h3>
                   <p className="text-sm text-slate-500 mt-1">动态管理服务的流量分发，支持基于路径、Header 或权重的高级路由规则。</p>
                </div>
                <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 shadow-xl transition-all"><Plus size={18}/> 新建路由规则</button>
              </div>
              <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center py-20 opacity-50">
                 <div className="p-6 bg-slate-50 rounded-[32px] mb-6 text-slate-300"><GitPullRequest size={64}/></div>
                 <p className="font-black text-slate-400 uppercase tracking-widest text-sm">选择服务以开始编排流量规则</p>
              </div>
            </div>
          )}

          {subTab === 'policies' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-end">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">服务策略 (Destination Rules)</h3>
                   <p className="text-sm text-slate-500 mt-1">配置负载均衡算法、连接池大小及故障熔断阈值。</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {mockPolicies.map(pol => (
                    <div key={pol.id} className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group">
                       <div className="flex justify-between items-center mb-8">
                          <h4 className="text-xl font-black text-slate-800">{pol.service}</h4>
                          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">Active Policy</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                             <div className="text-[10px] font-black text-slate-400 uppercase mb-2">负载均衡</div>
                             <div className="text-sm font-black text-slate-700">{pol.lbPolicy}</div>
                          </div>
                          <div className="p-5 bg-orange-50 rounded-3xl border border-orange-100">
                             <div className="text-[10px] font-black text-orange-400 uppercase mb-2">熔断阈值</div>
                             <div className="text-sm font-black text-orange-700">{pol.circuitBreaker.errorThreshold} Errors</div>
                          </div>
                       </div>
                       <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">更新配置方案</button>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {subTab === 'ratelimit' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-end">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">服务限流 (Global Rate Limit)</h3>
                   <p className="text-sm text-slate-500 mt-1">使用计数器算法限制服务的全局 QPS，保护核心后端不被流量激增冲垮。</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {mockRateLimits.map(rl => (
                    <div key={rl.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Gauge size={80}/></div>
                       <div className="flex justify-between items-start mb-10">
                          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><Activity size={24}/></div>
                          <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1 cursor-pointer transition-all"><div className="w-4 h-4 bg-white rounded-full"></div></div>
                       </div>
                       <h4 className="text-lg font-black text-slate-800">{rl.service}</h4>
                       <div className="mt-4 flex items-end gap-1">
                          <span className="text-4xl font-black text-slate-800">{rl.limit}</span>
                          <span className="text-xs font-bold text-slate-400 uppercase mb-1.5">{rl.unit}</span>
                       </div>
                       <button className="mt-8 text-indigo-600 hover:underline text-xs font-black uppercase">配置具体限流算法 &rarr;</button>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {subTab === 'gray' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
               <div className="flex justify-between items-end px-2">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">灰度发布流水线 (Gray/Canary)</h3>
                   <p className="text-sm text-slate-500 mt-1 font-medium">全自动管理灰度版本生命周期，支持权重切分、线上引流及自动化健康验证。</p>
                </div>
                <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-3 hover:bg-indigo-700 shadow-2xl transition-all">
                  <Rocket size={20} /> 创建灰度发布单
                </button>
              </div>

              {mockGrays.map(gray => (
                <div key={gray.id} className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10 space-y-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><Rocket size={160}/></div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100">
                        <Activity size={32}/>
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-slate-800">{gray.name}</h4>
                        <div className="flex items-center gap-3 mt-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                           <Database size={14}/> {gray.service}
                           <span className="text-slate-200">|</span>
                           <Clock size={14}/> 启动于 {gray.startTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase animate-pulse">状态: {gray.canary.status}</span>
                       <button className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"><MoreVertical size={24}/></button>
                    </div>
                  </div>

                  {/* Weight Control UI */}
                  <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 relative">
                     <div className="flex justify-between items-end mb-10">
                        <div className="text-center w-32">
                           <div className="text-4xl font-black text-slate-800">{gray.baseline.weight}%</div>
                           <div className="text-[10px] font-black text-slate-400 uppercase mt-2">基线版本 ({gray.baseline.version})</div>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-10 gap-4">
                           <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">实时流量切分比例</div>
                           <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex shadow-inner border border-slate-300">
                              <div className="h-full bg-slate-900 transition-all duration-1000" style={{width: `${gray.baseline.weight}%`}}></div>
                              <div className="h-full bg-indigo-600 transition-all duration-1000" style={{width: `${gray.canary.weight}%`}}></div>
                           </div>
                           <div className="flex justify-between w-full mt-2">
                              <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors">自动递增配置 &rarr;</button>
                              <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors">暂停发布</button>
                           </div>
                        </div>
                        <div className="text-center w-32">
                           <div className="text-4xl font-black text-indigo-600">{gray.canary.weight}%</div>
                           <div className="text-[10px] font-black text-indigo-400 uppercase mt-2">灰度版本 ({gray.canary.version})</div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                           { label: '灰度成功率', val: '99.9%', status: 'Pass', icon: <CheckCircle className="text-emerald-500" size={14}/> },
                           { label: '平均响应耗时', val: '45ms', status: 'Warning', icon: <AlertTriangle className="text-amber-500" size={14}/> },
                           { label: '灰度环境副本', val: '3 Nodes', status: 'Pass', icon: <CheckCircle className="text-emerald-500" size={14}/> },
                        ].map(m => (
                           <div key={m.label} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                              <div>
                                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{m.label}</div>
                                 <div className="text-lg font-black text-slate-800 mt-0.5">{m.val}</div>
                              </div>
                              {m.icon}
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <button className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-2">
                        <ArrowRight size={20}/> 流量推进 (+10%)
                     </button>
                     <button className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl flex items-center justify-center gap-2">
                        <Check size={20}/> 完成并全量更新
                     </button>
                     <button className="px-10 py-5 bg-red-50 text-red-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                        <X size={20}/> 紧急回滚
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ObservabilityCenter: React.FC = () => {
  const [obsTab, setObsTab] = useState<'topology' | 'tracing'>('topology');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex gap-10 border-b border-slate-100 px-2">
         {[
           { id: 'topology', label: '服务拓扑图', icon: <Network size={18}/> },
           { id: 'tracing', label: '全链路追踪', icon: <History size={18}/> },
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

      {obsTab === 'topology' ? (
        <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10 h-[600px] relative overflow-hidden">
           <div className="absolute top-10 left-10 z-10 space-y-4">
              <div className="bg-slate-900/5 backdrop-blur-md border border-slate-100 p-4 rounded-[28px] space-y-2">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">全局状态</div>
                 <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                       <span className="text-2xl font-black text-slate-800">4.5k</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">QPS</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex flex-col">
                       <span className="text-2xl font-black text-emerald-500">99.9%</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">Success Rate</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Simulated Topology Graph */}
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full max-w-4xl h-full flex items-center justify-around">
                 
                 {/* Gateway Node */}
                 <div className="flex flex-col items-center gap-3 group">
                    <div className="w-24 h-24 bg-slate-900 text-white rounded-[32px] flex items-center justify-center shadow-2xl relative z-10 group-hover:scale-110 transition-transform cursor-pointer">
                       <Globe size={32}/>
                       <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                    </div>
                    <span className="font-black text-sm text-slate-800 uppercase tracking-widest">api-gateway</span>
                 </div>

                 {/* Connection Lines (SVG) */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <path d="M 280 300 L 450 180" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" fill="none" />
                    <path d="M 280 300 L 450 300" stroke="#6366f1" strokeWidth="2" fill="none" />
                    <path d="M 280 300 L 450 420" stroke="#6366f1" strokeWidth="2" fill="none" />
                 </svg>

                 {/* Business Nodes Column */}
                 <div className="flex flex-col gap-20">
                    {['auth-service', 'order-service', 'payment-svc'].map((name, i) => (
                       <div key={name} className="flex flex-col items-center gap-3 group">
                          <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-xl relative z-10 group-hover:scale-110 transition-transform cursor-pointer border-4 border-white ${i === 1 ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                             {i === 1 ? <AlertTriangle size={28}/> : <ShieldCheck size={28}/>}
                             {i === 1 && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center">1</div>}
                          </div>
                          <span className="font-bold text-xs text-slate-500 uppercase tracking-tighter">{name}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="absolute bottom-10 right-10 flex gap-2">
              <button className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-500"><Plus size={18}/></button>
              <button className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-500"><Sliders size={18}/></button>
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
           <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-800">最新请求追踪 (Traces)</h3>
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
                    <tr>
                       <th className="px-10 py-5">Trace ID / Operation</th>
                       <th className="px-8 py-5">Root Service</th>
                       <th className="px-8 py-5">Start Time</th>
                       <th className="px-8 py-5">Duration</th>
                       <th className="px-8 py-5">Status</th>
                       <th className="px-10 py-5 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {mockTraces.map(trace => (
                       <tr key={trace.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-10 py-6">
                             <div className="font-black text-slate-800 text-sm">{trace.operation}</div>
                             <div className="text-[10px] font-mono text-slate-400 mt-0.5">{trace.id}</div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{trace.service}</span>
                          </td>
                          <td className="px-8 py-6 text-xs text-slate-500 font-bold">{trace.startTime}</td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                   <div className={`h-full ${trace.duration > 200 ? 'bg-orange-500' : 'bg-indigo-500'}`} style={{width: `${(trace.duration/500)*100}%`}}></div>
                                </div>
                                <span className="text-xs font-black text-slate-700">{trace.duration}ms</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${trace.status === 'OK' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {trace.status === 'OK' ? <CheckCircle size={12}/> : <Bug size={12}/>} {trace.status}
                             </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                             <button className="text-indigo-600 hover:underline text-xs font-black flex items-center gap-1 ml-auto">详情 <ChevronRight size={14}/></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

const ServiceManagement: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {mockServices.map(svc => (
            <div key={svc.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-2 h-full ${svc.status === 'Healthy' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
               <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-2xl ${svc.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                     <Database size={24}/>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600 group-hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={18}/></button>
               </div>
               <h4 className="text-xl font-black text-slate-800 truncate">{svc.name}</h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Namespace: {svc.namespace} • v{svc.version}</p>
               
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

               <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                  <div className="flex justify-between text-xs">
                     <span className="text-slate-400 font-bold uppercase tracking-widest">QPS</span>
                     <span className="font-black text-slate-700">{svc.qps}/s</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-slate-400 font-bold uppercase tracking-widest">Latency</span>
                     <span className="font-black text-slate-700">{svc.latency}</span>
                  </div>
               </div>
               
               <button className="mt-10 w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-indigo-100 group-hover:shadow-xl">管理实例</button>
            </div>
         ))}
         <div className="border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center p-8 text-slate-300 hover:border-indigo-200 hover:text-indigo-400 transition-all cursor-pointer min-h-[400px]">
            <Plus size={48} className="mb-4 opacity-20" />
            <span className="font-black uppercase tracking-[0.2em] text-sm">注册新服务</span>
         </div>
      </div>
    </div>
  );
};

// --- Main Module ---

export const Microservices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'management' | 'traffic' | 'observability'>('management');

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div>
           <h2 className="text-4xl font-black text-slate-800 tracking-tighter">微服务治理中心</h2>
           <p className="text-slate-500 text-sm mt-1 font-medium italic">基于 Service Mesh 的全栈治理方案，涵盖流量调控、全链路监控与生命周期管理。</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-1.5 rounded-[20px] border border-slate-200 shadow-sm flex">
              {[
                { id: 'management', label: '服务管理', icon: <LayoutList size={16}/> },
                { id: 'traffic', label: '流量管理', icon: <Zap size={16}/> },
                { id: 'observability', label: '可观测性', icon: <Activity size={16}/> }
              ].map(t => (
                <button
                   key={t.id}
                   onClick={() => setActiveTab(t.id as any)}
                   className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                     activeTab === t.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
                   }`}
                >
                   {t.icon} {t.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="mt-8">
        {activeTab === 'management' && <ServiceManagement />}
        {activeTab === 'traffic' && <TrafficManagement />}
        {activeTab === 'observability' && <ObservabilityCenter />}
      </div>
    </div>
  );
};
