
import React, { useState } from 'react';
import { 
  KafkaInstance, RedisInstance, RabbitMQInstance, MiddlewareBackup,
  KafkaTopic, KafkaUser, KafkaConsumerGroup, RabbitMQQueue,
  View
} from '../types';
import { 
  Database, Activity, Settings, BarChart2, Plus, X, Check, Server, 
  HardDrive, Cpu, MoreVertical, Play, Pause, RefreshCw, Trash2, 
  ArrowUpCircle, FileJson, Download, Upload, Copy, Save, ArrowLeft, 
  Users, Layers, ShieldCheck, AlertTriangle, FileText, Search, Clock, 
  CheckSquare, Square, Edit, Edit3, Bell, Eye, ArrowRight, ChevronRight, 
  BellRing, Filter, Calendar, Mail, AlertOctagon, Printer, CloudLightning, 
  Archive, PlayCircle, Shield, LayoutDashboard, Globe, Lock, Share2, 
  Rocket, RotateCcw, Monitor, Bug, Info, LayoutTemplate, Zap, TrendingUp, 
  Construction, MessageSquare, Terminal, ChevronDown, ListFilter, Sliders,
  ShieldAlert, ClipboardCheck, FileOutput, Gauge, AlertCircle,
  CheckCircle, XCircle, GitBranch, UserPlus, Cloud, Box, History,
  Split, FastForward, Timer, ShieldQuestion, UserCog,
  ExternalLink,
  BarChart as BarChartIcon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

// --- Mock Data for RabbitMQ ---

const mockRabbitMQInstances: RabbitMQInstance[] = [
  { id: 'rmq-prod-01', name: 'erp-message-bus', version: '3.11.2', status: 'Running', nodes: 3, queues: 12, consumers: 45, endpoint: 'rmq.prod.svc:5672', cpu: '4 Core', memory: '8GB', storage: '100GB' },
  { id: 'rmq-dev-01', name: 'test-mq-standalone', version: '3.10.7', status: 'Stopped', nodes: 1, queues: 2, consumers: 0, endpoint: 'rmq-dev.svc:5672', cpu: '1 Core', memory: '2GB', storage: '20GB' },
];

const mockRabbitMQQueues: RabbitMQQueue[] = [
  { name: 'order.payment.verify', vhost: '/', state: 'running', messages: 1240, ready: 1100, unacked: 140, publishRate: 45.5, deliverRate: 42.8 },
  { name: 'user.notify.email', vhost: '/prod', state: 'running', messages: 0, ready: 0, unacked: 0, publishRate: 12.0, deliverRate: 12.0 },
  { name: 'system.logs.error', vhost: '/', state: 'idle', messages: 45000, ready: 45000, unacked: 0, publishRate: 0.5, deliverRate: 0 },
];

const mockRabbitMQParams = [
  { key: 'vm_memory_high_watermark.relative', value: '0.4', default: '0.4', description: '内存告警水位线（比例）' },
  { key: 'disk_free_limit.relative', value: '1.5', default: '1.0', description: '磁盘低水位线阈值' },
  { key: 'heartbeat', value: '60', default: '60', description: '心跳检测超时时间（秒）' },
  { key: 'queue_index_embed_msgs_below', value: '4096', default: '4096', description: '索引嵌入消息大小限制' },
];

const mockRabbitMQMetrics = [
  { time: '16:00', pubRate: 450, delRate: 440, msgCount: 12000, connections: 85 },
  { time: '16:05', pubRate: 520, delRate: 500, msgCount: 12500, connections: 88 },
  { time: '16:10', pubRate: 850, delRate: 820, msgCount: 14000, connections: 112 },
  { time: '16:15', pubRate: 680, delRate: 700, msgCount: 13800, connections: 95 },
];

// Fix: Added missing mockKafkaInstances for Middleware management
const mockKafkaInstances: KafkaInstance[] = [
  { id: 'kafka-prod-01', name: 'order-events-cluster', version: '3.4.0', topics: 24, partitions: 72, status: 'Running', nodes: 3, memory: '12GB', storage: '500GB', configTemplateId: 'tpl-k-1' },
  { id: 'kafka-dev-01', name: 'testing-kafka', version: '3.3.1', topics: 5, partitions: 5, status: 'Stopped', nodes: 1, memory: '2GB', storage: '20GB', configTemplateId: 'tpl-k-2' },
];

// Fix: Added missing mockRedisInstances for Middleware management
const mockRedisInstances: RedisInstance[] = [
  { id: 'redis-prod-01', name: 'user-session-cache', version: '7.0.5', architecture: 'Cluster', status: 'Running', endpoint: 'redis-cluster.prod.svc:6379', nodes: 6, cpu: '4 Core', memory: '16GB', storage: '50GB' },
  { id: 'redis-staging-01', name: 'staging-redis', version: '6.2.7', architecture: 'Sentinel', status: 'Running', endpoint: 'redis-sentinel.staging.svc:26379', nodes: 3, cpu: '2 Core', memory: '8GB', storage: '20GB' },
];

const mockInspections = [
  { id: 'insp-1', time: '2023-10-30 08:00', status: 'Pass', healthy: 18, risk: 2, error: 0, score: 92 },
  { id: 'insp-2', time: '2023-10-29 08:00', status: 'Warning', healthy: 15, risk: 4, error: 1, score: 78 },
];

// --- Sub-Components ---

const RabbitMQDetail: React.FC<{ instanceId: string, onBack: () => void }> = ({ instanceId, onBack }) => {
  const [tab, setTab] = useState('overview');
  const rmq = mockRabbitMQInstances.find(r => r.id === instanceId) || mockRabbitMQInstances[0];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><ArrowLeft size={24}/></button>
             <div>
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                   {rmq.name}
                   <span className={`text-xs px-2.5 py-1 rounded-full font-black uppercase ${rmq.status==='Running'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{rmq.status}</span>
                </h2>
                <div className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-3">
                   <span>RabbitMQ > Managed Cluster</span>
                   <span className="text-slate-200">|</span>
                   <span className="flex items-center gap-1"><GitBranch size={14}/> v{rmq.version}</span>
                </div>
             </div>
          </div>
          <div className="flex gap-2">
             <div className="group relative">
                <button className="bg-white border border-slate-300 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                   生命周期 <ChevronDown size={14}/>
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 hidden group-hover:block z-50">
                   <button className="w-full text-left px-4 py-2 text-xs font-black hover:bg-slate-50 flex items-center gap-2"><RefreshCw size={14}/> 滚动重启</button>
                   <button className="w-full text-left px-4 py-2 text-xs font-black hover:bg-slate-50 flex items-center gap-2"><Pause size={14}/> 暂停/恢复</button>
                   <button className="w-full text-left px-4 py-2 text-xs font-black hover:bg-slate-50 flex items-center gap-2 text-red-600"><Trash2 size={14}/> 删除实例</button>
                </div>
             </div>
             <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 flex items-center gap-2 shadow-xl">
                <ArrowUpCircle size={16}/> 版本升级
             </button>
          </div>
       </div>

       {/* Tabs */}
       <div className="border-b border-slate-200 flex gap-10 overflow-x-auto scrollbar-hide px-2">
          {[
            { id: 'overview', label: '概览', icon: <LayoutDashboard size={16}/> },
            { id: 'queues', label: '队列管理', icon: <Layers size={16}/> },
            { id: 'params', label: '参数配置', icon: <Settings size={16}/> },
            { id: 'monitor', label: '监控面板', icon: <Activity size={16}/> },
            { id: 'logs', label: '日志查询', icon: <FileText size={16}/> },
            { id: 'alerts', label: '告警策略', icon: <BellRing size={16}/> },
            { id: 'inspection', label: '实例巡检', icon: <ClipboardCheck size={16}/> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-4 pt-1 px-1 text-[11px] font-black flex items-center gap-2 border-b-4 transition-all uppercase tracking-widest ${
                tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
       </div>

       <div className="min-h-[500px]">
          {tab === 'overview' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><Globe size={18}/> 访问端点 (Endpoints)</h3>
                      <div className="space-y-4">
                        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className="text-[10px] font-black text-slate-500 uppercase">AMQP</div>
                              <div className="text-emerald-400 font-mono text-sm truncate">{rmq.endpoint}</div>
                           </div>
                           <button className="p-2 text-slate-500 hover:text-white transition-all"><Copy size={16}/></button>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className="text-[10px] font-black text-slate-400 uppercase">Admin UI</div>
                              <div className="text-slate-700 font-mono text-sm truncate">http://rmq-mgmt.prod.svc:15672</div>
                           </div>
                           <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><ExternalLink size={16}/></button>
                        </div>
                      </div>
                   </div>
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><Cpu size={18}/> 资源统计</h3>
                      <div className="grid grid-cols-3 gap-6">
                         <div className="bg-slate-50 p-4 rounded-2xl">
                            <div className="text-[10px] font-black text-slate-400 uppercase">节点数量</div>
                            <div className="text-xl font-black text-slate-800 mt-1">{rmq.nodes} Nodes</div>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-2xl">
                            <div className="text-[10px] font-black text-slate-400 uppercase">CPU 配额</div>
                            <div className="text-xl font-black text-slate-800 mt-1">{rmq.cpu}</div>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-2xl">
                            <div className="text-[10px] font-black text-slate-400 uppercase">内存容量</div>
                            <div className="text-xl font-black text-slate-800 mt-1">{rmq.memory}</div>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col justify-between shadow-xl">
                   <div>
                      <h4 className="text-xl font-black">集群实时统计</h4>
                      <p className="text-slate-400 text-xs mt-2 italic">汇总全量 VHost 的活跃生产与消费速率。</p>
                   </div>
                   <div className="space-y-6 my-10">
                      <div className="flex justify-between border-b border-white/10 pb-4">
                         <span className="text-sm font-bold">活跃连接</span>
                         <span className="text-2xl font-black text-emerald-400">85</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-4">
                         <span className="text-sm font-bold">活跃 Channel</span>
                         <span className="text-2xl font-black text-blue-400">412</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-sm font-bold">总队列数</span>
                         <span className="text-2xl font-black text-indigo-400">{rmq.queues}</span>
                      </div>
                   </div>
                   <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-xs backdrop-blur-md transition-all border border-white/10">查看详细拓扑图</button>
                </div>
             </div>
          )}

          {tab === 'queues' && (
             <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                   <div className="flex items-center gap-4">
                      <h3 className="font-black text-slate-800">队列列表 (Queues)</h3>
                      <div className="relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                         <input placeholder="搜索 Queue..." className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-100" />
                      </div>
                   </div>
                   <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"><Plus size={14}/> 创建队列</button>
                </div>
                <table className="w-full text-left">
                   <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/20">
                      <tr>
                         <th className="px-8 py-4">队列名称 / VHost</th>
                         <th className="px-6 py-4">状态</th>
                         <th className="px-6 py-4">堆积消息</th>
                         <th className="px-6 py-4">未确认</th>
                         <th className="px-6 py-4">速率 (pub/del)</th>
                         <th className="px-8 py-4 text-right">操作</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 font-bold text-slate-600 text-sm">
                      {mockRabbitMQQueues.map(queue => (
                         <tr key={queue.name} className="hover:bg-slate-50/50 group transition-colors">
                            <td className="px-8 py-5">
                               <div className="font-black text-slate-800">{queue.name}</div>
                               <div className="text-[10px] text-slate-400 font-bold mt-0.5">VHost: {queue.vhost}</div>
                            </td>
                            <td className="px-6 py-5">
                               <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black ${queue.state==='running'?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-400'}`}>{queue.state}</span>
                            </td>
                            <td className="px-6 py-5">
                               <span className={`font-mono ${queue.messages > 10000 ? 'text-red-500 font-black' : 'text-slate-700'}`}>{queue.messages.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-5 font-mono text-orange-500">{queue.unacked}</td>
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-2 text-[10px] font-black">
                                  <span className="text-emerald-500">{queue.publishRate}/s</span>
                                  <span className="text-slate-300">|</span>
                                  <span className="text-blue-500">{queue.deliverRate}/s</span>
                               </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                               <div className="flex justify-end gap-2">
                                  <button className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-100 transition-all"><Settings size={14}/></button>
                                  <button className="p-1.5 hover:bg-white rounded text-slate-400 hover:text-red-600 border border-transparent hover:border-slate-100 transition-all"><Trash2 size={14}/></button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}

          {tab === 'params' && (
             <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><LayoutTemplate size={24}/></div>
                         <div>
                            <h4 className="font-black text-slate-800">参数配置模板</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">预置生产级高稳定性、高性能模板</p>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 transition-all cursor-pointer group">
                            <span className="text-sm font-black text-slate-700">生产：高稳定性队列模式 (Quorum)</span>
                            <CheckCircle size={18} className="text-emerald-500"/>
                         </div>
                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 transition-all cursor-pointer group">
                            <span className="text-sm font-black text-slate-700">生产：高性能镜像队列模式 (Mirror)</span>
                            <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"/>
                         </div>
                      </div>
                      <div className="mt-8 flex gap-3">
                         <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-black transition-all flex items-center justify-center gap-2"><Upload size={14}/> 导入配置</button>
                         <button className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2"><Download size={14}/> 导出模板</button>
                      </div>
                   </div>
                   <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80}/></div>
                      <div>
                         <h4 className="text-xl font-black">运行参数热更新</h4>
                         <p className="text-indigo-100/60 text-xs mt-2 italic">部分核心参数修改后无需重启集群即可在运行时生效。</p>
                      </div>
                      <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/10 text-xs font-bold leading-relaxed">
                         <Info size={16} className="mb-2 text-indigo-300"/>
                         修改 `vm_memory_high_watermark` 可以动态控制 RabbitMQ 的流量限制阈值，防止内存溢出。
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/20">
                         <tr>
                            <th className="px-8 py-4">参数 Key</th>
                            <th className="px-6 py-4">运行值</th>
                            <th className="px-6 py-4">默认值</th>
                            <th className="px-8 py-4">中文说明</th>
                            <th className="px-8 py-4 text-right">操作</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-bold text-slate-600 text-sm">
                         {mockRabbitMQParams.map(p => (
                            <tr key={p.key} className="hover:bg-slate-50/50 group transition-colors">
                               <td className="px-8 py-5 font-mono text-slate-800 text-xs">{p.key}</td>
                               <td className="px-6 py-5">
                                  <input className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 w-32 font-black text-xs outline-none focus:ring-2 focus:ring-indigo-100" defaultValue={p.value}/>
                               </td>
                               <td className="px-6 py-5 font-mono text-slate-400 text-xs">{p.default}</td>
                               <td className="px-8 py-5 text-xs text-slate-500 font-medium">{p.description}</td>
                               <td className="px-8 py-5 text-right">
                                  <button className="text-indigo-600 hover:underline">更新</button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {tab === 'monitor' && (
             <div className="space-y-8 animate-in fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex justify-between">
                         <span>生产与消费吞吐 (msg/s)</span>
                         <FastForward size={16} className="text-indigo-600"/>
                      </h4>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockRabbitMQMetrics}>
                               <defs>
                                  <linearGradient id="rmqPub" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                  <linearGradient id="rmqDel" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                               </defs>
                               <XAxis dataKey="time" hide />
                               <YAxis fontSize={10} axisLine={false} />
                               <Tooltip />
                               <Area type="monotone" dataKey="pubRate" stroke="#10b981" fill="url(#rmqPub)" name="Production Rate" strokeWidth={3} />
                               <Area type="monotone" dataKey="delRate" stroke="#3b82f6" fill="url(#rmqDel)" name="Consumption Rate" strokeWidth={3} />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex justify-between">
                         <span>资源用量与连接数 (Resource Usage)</span>
                         <Activity size={16} className="text-amber-500"/>
                      </h4>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockRabbitMQMetrics}>
                               <XAxis dataKey="time" hide />
                               <YAxis yAxisId="left" fontSize={10} axisLine={false} />
                               <YAxis yAxisId="right" orientation="right" fontSize={10} axisLine={false} />
                               <Tooltip />
                               <Line yAxisId="left" type="monotone" dataKey="msgCount" stroke="#f59e0b" strokeWidth={4} name="Ready Msgs" dot={{r: 4, fill: '#f59e0b'}} />
                               <Line yAxisId="right" type="step" dataKey="connections" stroke="#8b5cf6" strokeWidth={2} name="Active Connections" dot={false} />
                            </LineChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {tab === 'logs' && (
             <div className="bg-slate-900 rounded-[40px] overflow-hidden flex flex-col h-[600px] border border-slate-800 shadow-2xl">
                <div className="px-8 py-5 bg-slate-800/50 border-b border-white/5 flex justify-between items-center">
                   <div className="flex gap-4">
                      <div className="px-4 py-2 bg-slate-900 rounded-xl border border-white/10 text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> 过去 1 小时</div>
                      <div className="px-4 py-2 bg-slate-900 rounded-xl border border-white/10 text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2"><Server size={14}/> rabbitmq-node-0</div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                         <CheckCircle size={14} className="text-emerald-500"/> 日志已持久化至 PVC
                      </div>
                      <div className="h-6 w-px bg-white/10"></div>
                      <button className="text-slate-400 hover:text-white transition-colors"><Download size={20}/></button>
                   </div>
                </div>
                <div className="flex-1 p-8 font-mono text-[11px] text-slate-400 space-y-1.5 overflow-y-auto">
                   <div>[2023-10-30 16:25:01] <span className="text-emerald-400 font-bold">INFO</span> Connection &lt;0.512.0&gt;: accepted 10.244.1.5:45672 &rarr; 10.244.2.10:5672</div>
                   <div>[2023-10-30 16:25:05] <span className="text-emerald-400 font-bold">INFO</span> user 'guest' authenticated and granted access to vhost '/'</div>
                   <div>[2023-10-30 16:30:12] <span className="text-amber-400 font-bold">WARN</span> vm_memory_high_watermark set to 0.4. Current usage: 38%</div>
                   <div>[2023-10-30 16:35:55] <span className="text-rose-400 font-bold">ERROR</span> Queue 'order.payment.verify' consumer timeout detection</div>
                   <div className="animate-pulse text-indigo-400">_</div>
                </div>
             </div>
          )}

          {tab === 'alerts' && (
             <div className="space-y-8 animate-in fade-in">
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex justify-between items-center">
                   <div>
                      <h4 className="text-lg font-black text-slate-800">告警策略配置</h4>
                      <p className="text-xs text-slate-500 font-bold mt-1">预置连接数限制、写入频次激增等核心指标，支持上百项自定义监控告警。</p>
                   </div>
                   <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-xl shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all"><Plus size={18}/> 新建告警策略</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2"><BellRing size={16} className="text-rose-500"/> 实时告警</h4>
                      <div className="space-y-6">
                         <div className="flex items-start gap-4 p-5 bg-rose-50 rounded-3xl border border-red-100">
                            <AlertCircle size={20} className="text-rose-600 mt-1 shrink-0"/>
                            <div>
                               <div className="font-black text-rose-900 text-sm">节点内存占用过高 (Memory High Watermark)</div>
                               <div className="text-[10px] text-rose-600 font-bold uppercase mt-1">Node: rabbitmq-0 • Usage: 42% (Threshold 40%)</div>
                            </div>
                         </div>
                         <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-3xl border border-amber-100">
                            <AlertTriangle size={20} className="text-amber-600 mt-1 shrink-0"/>
                            <div>
                               <div className="font-black text-amber-900 text-sm">写入频次激增告警</div>
                               <div className="text-[10px] text-amber-600 font-bold uppercase mt-1">Queue: order.payment.verify • 16:35:00</div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="bg-slate-50 rounded-[40px] p-10 flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-slate-200">
                      <History size={64} className="text-slate-300 mb-4"/>
                      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">查看完整告警历史</p>
                   </div>
                </div>
             </div>
          )}

          {tab === 'inspection' && (
             <div className="space-y-8 animate-in fade-in">
                <div className="grid grid-cols-3 gap-8">
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm text-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">巡检综合评分</div>
                      <div className="text-6xl font-black text-emerald-500">92</div>
                   </div>
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col justify-center gap-2">
                      <div className="flex justify-between text-xs font-bold"><span className="text-emerald-500">健康项</span><span className="text-slate-700">18</span></div>
                      <div className="flex justify-between text-xs font-bold"><span className="text-amber-500">风险项</span><span className="text-slate-700">2</span></div>
                      <div className="flex justify-between text-xs font-bold"><span className="text-rose-500">错误项</span><span className="text-slate-700">0</span></div>
                   </div>
                   <div className="bg-indigo-600 rounded-[32px] p-8 text-white flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group">
                      <RefreshCw size={32} className="group-hover:rotate-180 transition-transform duration-700"/>
                      <span className="font-black text-xs uppercase tracking-widest">立即执行全量巡检</span>
                   </div>
                </div>
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                   <div className="px-10 py-8 border-b border-slate-50 font-black text-slate-800">巡检记录历史</div>
                   <table className="w-full text-left">
                      <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/20">
                         <tr>
                            <th className="px-10 py-5">巡检时间</th>
                            <th className="px-6 py-5">评分</th>
                            <th className="px-6 py-5">状态</th>
                            <th className="px-10 py-5 text-right">操作</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
                         {mockInspections.map(insp => (
                            <tr key={insp.id} className="hover:bg-slate-50/50">
                               <td className="px-10 py-6 font-mono text-xs">{insp.time}</td>
                               <td className="px-6 py-6"><span className="text-lg font-black">{insp.score}</span></td>
                               <td className="px-6 py-6"><span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black ${insp.status==='Pass'?'bg-emerald-50 text-emerald-600':'bg-amber-50 text-amber-600'}`}>{insp.status}</span></td>
                               <td className="px-10 py-6 text-right">
                                  <button className="text-indigo-600 hover:underline flex items-center gap-1 ml-auto"><Download size={14}/> 导出 PDF 报告</button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

const RedisDetail: React.FC<{ instanceId: string, onBack: () => void }> = ({ instanceId, onBack }) => {
  const [tab, setTab] = useState('overview');
  const redis = mockRedisInstances.find(r => r.id === instanceId) || mockRedisInstances[0];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><ArrowLeft size={24}/></button>
             <div>
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                   {redis.name}
                   <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-black uppercase">Running</span>
                </h2>
                <div className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-3">
                   <span>Redis > {redis.architecture}</span>
                   <span className="text-slate-200">|</span>
                   <span className="flex items-center gap-1"><GitBranch size={14}/> v{redis.version}</span>
                </div>
             </div>
          </div>
          <div className="flex gap-2">
             <button className="bg-white border border-slate-300 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all">
                <RefreshCw size={16}/> 滚动重启
             </button>
             <button className="bg-white border border-slate-300 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all">
                <Pause size={16}/> 暂停实例
             </button>
             <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 flex items-center gap-2 shadow-xl shadow-indigo-100 transition-all">
                <ArrowUpCircle size={16}/> 版本升级
             </button>
          </div>
       </div>

       {/* Banner: Version Upgrade */}
       <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><Info size={20}/></div>
             <p className="text-sm font-bold text-blue-800">可升级至小版本 <span className="font-black">v7.0.12</span>。修复了 3 个已知的 RDB 持久化安全漏洞，建议尽快升级。</p>
          </div>
          <button className="text-blue-700 font-black text-sm pr-2 hover:underline">立即处理 &rarr;</button>
       </div>

       {/* Navigation Tabs */}
       <div className="border-b border-slate-200 flex gap-10 overflow-x-auto scrollbar-hide px-2">
          {[
            { id: 'overview', label: '概览', icon: <Database size={16}/> },
            { id: 'params', label: '参数配置', icon: <Settings size={16}/> },
            { id: 'monitor', label: '监控面板', icon: <Activity size={16}/> },
            { id: 'logs', label: '日志查询', icon: <FileText size={16}/> },
            { id: 'alerts', label: '告警策略', icon: <BellRing size={16}/> },
            { id: 'inspection', label: '实例巡检', icon: <ClipboardCheck size={16}/> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-4 pt-1 px-1 text-sm font-black flex items-center gap-2 border-b-4 transition-all uppercase tracking-widest ${
                tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
       </div>

       <div className="min-h-[500px] animate-in fade-in duration-300">
          {tab === 'overview' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><Globe size={18}/> 访问端点</h3>
                      <div className="space-y-4">
                         <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                            <div>
                               <div className="text-[10px] font-black text-slate-400 uppercase mb-1">主节点读写 (Master RW)</div>
                               <div className="text-sm font-mono text-slate-700 font-black">{redis.endpoint}</div>
                            </div>
                            <button className="p-2 text-slate-300 hover:text-indigo-600 group-hover:bg-white rounded-lg transition-all"><Copy size={16}/></button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

const KafkaDetail: React.FC<{ instanceId: string, onBack: () => void }> = ({ instanceId, onBack }) => {
  const [tab, setTab] = useState('overview');
  const kafka = mockKafkaInstances.find(k => k.id === instanceId) || mockKafkaInstances[0];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><ArrowLeft size={24}/></button>
             <div>
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                   {kafka.name}
                   <span className={`text-xs px-2.5 py-1 rounded-full font-black uppercase ${kafka.status==='Running'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{kafka.status}</span>
                </h2>
                <div className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-3">
                   <span>Kafka > Dedicated Cluster</span>
                   <span className="text-slate-200">|</span>
                   <span className="flex items-center gap-1"><GitBranch size={14}/> v{kafka.version}</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// Fix: Added missing MiddlewareOverview component for general summary view
const MiddlewareOverview: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><Database size={32}/></div>
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Kafka Clusters</span>
          </div>
          <div className="text-4xl font-black text-slate-800">2</div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <CheckCircle size={14}/> 1 Running
          </div>
        </div>
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><Database size={32}/></div>
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Redis Instances</span>
          </div>
          <div className="text-4xl font-black text-slate-800">2</div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <CheckCircle size={14}/> 2 Running
          </div>
        </div>
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><MessageSquare size={32}/></div>
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">RabbitMQ Clusters</span>
          </div>
          <div className="text-4xl font-black text-slate-800">2</div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <CheckCircle size={14}/> 1 Running
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
          <Activity size={24} className="text-indigo-600" />
          全栈组件监控概览
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockRabbitMQMetrics}>
              <defs>
                <linearGradient id="totalTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="pubRate" stroke="#6366f1" fill="url(#totalTraffic)" strokeWidth={3} name="Total throughput" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export const Middleware: React.FC = () => {
  const [activeService, setActiveService] = useState<'overview' | 'kafka' | 'redis' | 'rabbitmq'>('overview');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedArch, setSelectedArch] = useState('cluster');

  const renderKafkaList = () => (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
       {mockKafkaInstances.map(kafka => (
          <div key={kafka.id} onClick={() => setSelectedInstanceId(kafka.id)} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-8">
             <div className="flex items-center gap-8">
                <div className={`p-6 rounded-[28px] shadow-inner ${kafka.status === 'Running' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                   <Database size={40}/>
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">{kafka.name}</h3>
                   <div className="text-[10px] font-black text-slate-400 uppercase mt-1 flex items-center gap-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">v{kafka.version}</span>
                      <span>{kafka.nodes} Nodes</span>
                   </div>
                </div>
             </div>
             <div className="flex gap-2">
                <button className="p-3 text-slate-300 hover:text-orange-600 hover:bg-slate-50 rounded-2xl transition-all"><Settings size={22}/></button>
                <button className="p-3 text-slate-300 hover:text-red-600 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 size={22}/></button>
             </div>
          </div>
       ))}
    </div>
  );

  const renderRedisList = () => (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
      {mockRedisInstances.map(redis => (
        <div key={redis.id} onClick={() => setSelectedInstanceId(redis.id)} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className={`p-6 rounded-[28px] shadow-inner ${redis.status === 'Running' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
               <Database size={40}/>
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-800 group-hover:text-rose-600 transition-colors">{redis.name}</h3>
               <div className="text-[10px] font-black text-slate-400 uppercase mt-1 flex items-center gap-3">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">{redis.architecture}</span>
                  <span>v{redis.version}</span>
               </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-10 px-10 border-x border-slate-50">
             <div>
                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">端点地址</div>
                <div className="text-sm font-mono text-slate-600 truncate max-w-[150px]">{redis.endpoint}</div>
             </div>
             <div>
                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">规格规格</div>
                <div className="text-sm font-black text-slate-700">{redis.cpu} / {redis.memory}</div>
             </div>
             <div>
                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">运行状态</div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span className="text-sm font-black text-emerald-600 uppercase">{redis.status}</span></div>
             </div>
          </div>
          <div className="flex gap-2">
             <button className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all"><Settings size={22}/></button>
             <button className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 size={22}/></button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRabbitMQList = () => (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
       {mockRabbitMQInstances.map(rmq => (
          <div key={rmq.id} onClick={() => setSelectedInstanceId(rmq.id)} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-8">
             <div className="flex items-center gap-8">
                <div className={`p-6 rounded-[28px] shadow-inner ${rmq.status === 'Running' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                   <MessageSquare size={40}/>
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{rmq.name}</h3>
                   <div className="text-[10px] font-black text-slate-400 uppercase mt-1 flex items-center gap-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">v{rmq.version}</span>
                      <span>{rmq.nodes} Nodes</span>
                   </div>
                </div>
             </div>
             <div className="flex-1 grid grid-cols-3 gap-10 px-10 border-x border-slate-50">
                <div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queues / Consumers</div>
                   <div className="text-sm font-black text-slate-700">{rmq.queues} / {rmq.consumers}</div>
                </div>
                <div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">端点地址</div>
                   <div className="text-sm font-mono text-slate-600 truncate max-w-[150px]">{rmq.endpoint}</div>
                </div>
                <div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">运行状态</div>
                   <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${rmq.status === 'Running' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-black uppercase ${rmq.status === 'Running' ? 'text-emerald-600' : 'text-red-600'}`}>{rmq.status}</span>
                   </div>
                </div>
             </div>
             <div className="flex gap-2">
                <button className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all"><Settings size={22}/></button>
                <button className="p-3 text-slate-300 hover:text-red-600 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 size={22}/></button>
             </div>
          </div>
       ))}
    </div>
  );

  if (selectedInstanceId) {
    if (activeService === 'kafka') return <KafkaDetail instanceId={selectedInstanceId} onBack={() => setSelectedInstanceId(null)} />;
    if (activeService === 'redis') return <RedisDetail instanceId={selectedInstanceId} onBack={() => setSelectedInstanceId(null)} />;
    if (activeService === 'rabbitmq') return <RabbitMQDetail instanceId={selectedInstanceId} onBack={() => setSelectedInstanceId(null)} />;
  }

  // Helper for dynamic Wizard Step 1 content
  const getWizardArchOptions = () => {
    switch(activeService) {
      case 'redis':
        return [
          { id: 'cluster', label: '集群架构 (Cluster)', desc: '支持自动分片与横向扩展，适合海量数据场景。' },
          { id: 'sentinel', label: '哨兵架构 (Sentinel)', desc: '主从热备，自动故障切换，适合高可用稳定性场景。' }
        ];
      case 'kafka':
        return [
          { id: 'ha', label: '高可用集群模式', desc: '跨可用区部署，副本自动平衡，金融级可靠性保障。' },
          { id: 'standalone', label: '单节点开发模式', desc: '最小化资源占用，仅建议用于开发测试或轻量级调试。' }
        ];
      case 'rabbitmq':
        return [
          { id: 'classic', label: '标准集群模式', desc: '高可用、动态镜像队列同步，满足通用业务需求。' },
          { id: 'quorum', label: '仲裁队列模式', desc: '基于 Raft 协议，提供极致的数据强一致性保障。' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div>
           <h2 className="text-4xl font-black text-slate-800 tracking-tighter">云原生技术组件</h2>
           <p className="text-slate-500 text-sm mt-1 font-medium italic">集成 Kafka、Redis、RabbitMQ 的企业级全托管中间件服务平台。</p>
        </div>
        <div className="flex gap-4 items-center">
           <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex gap-1">
              {[
                { id: 'overview', label: '概览', icon: <LayoutDashboard size={16}/> },
                { id: 'redis', label: 'Redis', icon: <Database size={16}/> },
                { id: 'kafka', label: 'Kafka', icon: <Database size={16}/> },
                { id: 'rabbitmq', label: 'RabbitMQ', icon: <MessageSquare size={16}/> }
              ].map(t => (
                <button
                   key={t.id}
                   onClick={() => { setActiveService(t.id as any); setSelectedInstanceId(null); }}
                   className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                     activeService === t.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                   }`}
                >
                   {t.icon} {t.label}
                </button>
              ))}
           </div>
           {activeService !== 'overview' && (
              <button onClick={()=>setIsWizardOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                <Plus size={18}/> 创建实例
              </button>
           )}
        </div>
      </div>

      <div className="mt-4">
        {activeService === 'overview' && <MiddlewareOverview />}
        {activeService === 'redis' && renderRedisList()}
        {activeService === 'kafka' && renderKafkaList()}
        {activeService === 'rabbitmq' && renderRabbitMQList()}
      </div>

      {/* Creation Wizard */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-2xl font-black text-slate-800">部署 {activeService.toUpperCase()} 生产实例</h3>
                    <div className="flex gap-2 mt-2">
                       {[1,2,3].map(s => <div key={s} className={`w-12 h-1 rounded-full ${s <= wizardStep ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>)}
                    </div>
                 </div>
                 <button onClick={() => {setIsWizardOpen(false); setWizardStep(1);}}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
              </div>
              <div className="flex-1 p-10 overflow-y-auto">
                 {wizardStep === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                       <section className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-bold">第一步：基础定义与架构</label>
                          <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner" placeholder={`输入 ${activeService.toUpperCase()} 实例名称 (e.g. ${activeService}-prod-01)`}/>
                          
                          <div className="grid grid-cols-1 gap-4 mt-6">
                             {getWizardArchOptions().map((option) => (
                                <div 
                                   key={option.id}
                                   onClick={() => setSelectedArch(option.id)}
                                   className={`p-6 border-2 rounded-[32px] cursor-pointer relative transition-all group hover:shadow-lg ${selectedArch === option.id ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-500' : 'border-slate-100 hover:border-indigo-200 bg-white'}`}
                                >
                                   <div className={`font-black text-lg ${selectedArch === option.id ? 'text-indigo-700' : 'text-slate-700'}`}>{option.label}</div>
                                   <p className={`text-xs font-bold mt-2 leading-relaxed ${selectedArch === option.id ? 'text-indigo-500' : 'text-slate-400'}`}>{option.desc}</p>
                                   {selectedArch === option.id && (
                                      <div className="absolute top-6 right-6 text-indigo-600 bg-white rounded-full shadow-sm">
                                         <CheckCircle size={24} fill="currentColor" className="text-indigo-600" />
                                      </div>
                                   )}
                                </div>
                             ))}
                          </div>
                       </section>
                    </div>
                 )}
                 {wizardStep === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                       <section className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">第二步：计算规格</label>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <span className="text-xs font-black text-slate-600">计算规格 (CPU/Mem)</span>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black outline-none bg-white"><option>2C 4G</option><option>4C 8G</option><option>8C 16G</option></select>
                             </div>
                             <div className="space-y-2">
                                <span className="text-xs font-black text-slate-600">节点数量</span>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black outline-none bg-white"><option>3 Nodes</option><option>5 Nodes</option></select>
                             </div>
                          </div>
                          <div className="space-y-4 pt-4">
                             <span className="text-xs font-black text-slate-600 flex justify-between">单节点 SSD 存储 <span>100 GB</span></span>
                             <input type="range" className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600" defaultValue={20}/>
                          </div>
                       </section>
                    </div>
                 )}
                 {wizardStep === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                       <section className="space-y-6">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">第三步：参数与安全</label>
                          <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white rounded-2xl shadow-sm"><Sliders size={24} className="text-indigo-600"/></div>
                                <div>
                                   <div className="font-black text-slate-800">{activeService.toUpperCase()} 生产参数模板</div>
                                   <p className="text-[10px] text-slate-400 font-bold mt-0.5">选择专为不同业务场景优化的核心配置集</p>
                                </div>
                             </div>
                             <select className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none shadow-sm mb-4">
                                <option>生产：高性能读写型模板</option>
                                <option>生产：高可用均衡型模板</option>
                                <option>+ 导入自定义 YAML 参数配置</option>
                             </select>
                          </div>
                       </section>
                    </div>
                 )}
              </div>
              <div className="px-10 py-8 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                 <button onClick={() => setWizardStep(s => Math.max(1, s-1))} className={`text-slate-400 font-black text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors ${wizardStep === 1 ? 'invisible' : ''}`}>&larr; 返回上一步</button>
                 <div className="flex gap-4">
                    <button onClick={() => {setIsWizardOpen(false); setWizardStep(1);}} className="px-8 py-3 text-slate-500 font-black text-sm hover:bg-slate-100 rounded-2xl transition-all">取消</button>
                    <button onClick={() => {if(wizardStep < 3) setWizardStep(s=>s+1); else {setIsWizardOpen(false); alert('实例创建任务已下发！预计 2 分钟后就绪。');}}} className="px-12 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-black transition-all shadow-xl shadow-slate-200">
                       {wizardStep === 3 ? '确认部署' : '下一步 &rarr;'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
