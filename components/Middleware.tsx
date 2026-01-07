import React, { useState } from 'react';
import { 
  KafkaInstance, RedisInstance, RabbitMQInstance, MiddlewareBackup,
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
  /* Added missing icons based on usage in the component */
  CheckCircle, XCircle, GitBranch, UserPlus, Cloud, Box
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

// --- Global Mock Data ---

const mockMiddlewareStats = [
  { name: 'Redis', running: 12, warning: 1, error: 0 },
  { name: 'Kafka', running: 5, warning: 2, error: 1 },
  { name: 'RabbitMQ', running: 8, warning: 0, error: 0 },
];

const mockBackupResults = [
  { id: 'b1', component: 'Redis', instance: 'cache-main', time: '10:00', status: 'Success', size: '1.2GB' },
  { id: 'b2', component: 'Kafka', instance: 'msg-bus', time: '09:30', status: 'Success', size: '15.5GB' },
  { id: 'b3', component: 'Redis', instance: 'session-store', time: '09:00', status: 'Failed', size: '-' },
];

const mockResourceRanking = [
  { name: 'kafka-prod-01', value: 85, type: 'CPU' },
  { name: 'redis-cluster-v2', value: 72, type: 'Mem' },
  { name: 'rabbitmq-core', value: 65, type: 'CPU' },
  { name: 'redis-session', value: 45, type: 'Mem' },
];

// --- Redis Specific Data ---

const mockRedisInstances: RedisInstance[] = [
  { id: 'redis-prod-01', name: 'user-session-store', version: '7.0.5', architecture: 'Cluster', status: 'Running', endpoint: 'redis-cluster.prod.local:6379', nodes: 6, cpu: '4 Core', memory: '16GB', storage: '100GB' },
  { id: 'redis-dev-01', name: 'app-cache-standalone', version: '6.2.7', architecture: 'Sentinel', status: 'Running', endpoint: 'redis-sentinel.dev.local:6379', nodes: 3, cpu: '1 Core', memory: '2GB', storage: '20GB' },
];

const mockRedisParams = [
  { key: 'maxmemory', value: '12gb', default: '0', description: '最大使用内存' },
  { key: 'maxmemory-policy', value: 'allkeys-lru', default: 'noeviction', description: '内存淘汰策略' },
  { key: 'appendonly', value: 'yes', default: 'no', description: 'AOF持久化开关' },
  { key: 'timeout', value: '300', default: '0', description: '客户端连接超时' },
  { key: 'maxclients', value: '10000', default: '10000', description: '最大客户端数' },
];

const mockInspections = [
  { id: 'insp-1', time: '2023-10-30 08:00', status: 'Pass', healthy: 18, risk: 2, error: 0 },
  { id: 'insp-2', time: '2023-10-29 08:00', status: 'Warning', healthy: 15, risk: 4, error: 1 },
];

// --- Sub-Components ---

const MiddlewareOverview: React.FC = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2"><LayoutDashboard size={20} className="text-blue-600"/> 组件实例运行状态</h3>
        <div className="grid grid-cols-3 gap-8">
           {mockMiddlewareStats.map(stat => (
             <div key={stat.name} className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={[{value: stat.running}, {value: stat.warning}, {value: stat.error}]} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                            <Cell fill="#10b981" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#ef4444" />
                         </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-2xl font-black text-slate-800">{stat.running + stat.warning + stat.error}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{stat.name}</div>
                   </div>
                </div>
                <div className="flex gap-4 text-[10px] font-black uppercase">
                   <span className="text-emerald-500">运行: {stat.running}</span>
                   <span className="text-amber-500">告警: {stat.warning}</span>
                   <span className="text-rose-500">异常: {stat.error}</span>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-8 text-white shadow-xl flex flex-col justify-between overflow-hidden relative">
         <div className="absolute top-0 right-0 p-4 opacity-10"><BellRing size={80}/></div>
         <div>
            <h3 className="text-lg font-black mb-1">活跃告警统计</h3>
            <p className="text-indigo-100/60 text-xs">当前集群活跃风险概览</p>
         </div>
         <div className="space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
               <span className="text-sm font-bold">严重 (Critical)</span>
               <span className="text-2xl font-black text-rose-300">3</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
               <span className="text-sm font-bold">警告 (Warning)</span>
               <span className="text-2xl font-black text-amber-300">12</span>
            </div>
         </div>
         <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-black backdrop-blur-md transition-all">查看全部告警 &rarr;</button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><HardDrive size={20} className="text-purple-600"/> 备份执行历史 (近24小时)</h3>
          <div className="space-y-3">
             {mockBackupResults.map(res => (
               <div key={res.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-lg ${res.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {res.status === 'Success' ? <CheckCircle size={20}/> : <XCircle size={20}/>}
                     </div>
                     <div>
                        <div className="text-sm font-black text-slate-800">{res.instance} <span className="text-xs text-slate-400 font-bold ml-1">({res.component})</span></div>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">{res.time} • Size: {res.size}</div>
                     </div>
                  </div>
                  <button className="text-indigo-600 text-xs font-black hover:underline">详情</button>
               </div>
             ))}
          </div>
       </div>

       <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><Gauge size={20} className="text-indigo-600"/> 资源消耗 TOP5 (实例维度)</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockResourceRanking} layout="vertical">
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={120} tickLine={false} axisLine={false} />
                   <Tooltip cursor={{fill: '#f1f5f9'}} />
                   <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {mockResourceRanking.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.type === 'CPU' ? '#3b82f6' : '#8b5cf6'} />
                      ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  </div>
);

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
          <button className="text-blue-700 hover:underline font-black text-sm pr-2">立即处理 &rarr;</button>
       </div>

       {/* Navigation Tabs */}
       <div className="border-b border-slate-200 flex gap-10 overflow-x-auto scrollbar-hide px-2">
          {[
            { id: 'overview', label: '概览', icon: <Database size={16}/> },
            { id: 'params', label: '参数配置', icon: <Settings size={16}/> },
            { id: 'users', label: '用户管理', icon: <Users size={16}/> },
            { id: 'backup', label: '备份恢复', icon: <Archive size={16}/> },
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
                         <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                            <div>
                               <div className="text-[10px] font-black text-slate-400 uppercase mb-1">从节点只读 (Slave RO)</div>
                               <div className="text-sm font-mono text-slate-700 font-black">redis-ro.cluster.local:6379</div>
                            </div>
                            <button className="p-2 text-slate-300 hover:text-indigo-600 group-hover:bg-white rounded-lg transition-all"><Copy size={16}/></button>
                         </div>
                      </div>
                   </div>
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><Cpu size={18}/> 资源规格</h3>
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <div className="flex justify-between text-sm font-bold"><span>CPU 配额</span><span className="text-slate-800">{redis.cpu}</span></div>
                            <div className="flex justify-between text-sm font-bold"><span>内存 配额</span><span className="text-slate-800">{redis.memory}</span></div>
                         </div>
                         <div className="space-y-4">
                            <div className="flex justify-between text-sm font-bold"><span>存储 容量</span><span className="text-slate-800">{redis.storage}</span></div>
                            <div className="flex justify-between text-sm font-bold"><span>节点 数量</span><span className="text-slate-800">{redis.nodes} Nodes</span></div>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                   <div className="w-32 h-32 bg-indigo-50 text-indigo-600 rounded-[40px] flex items-center justify-center mb-6 shadow-inner">
                      <Layers size={56}/>
                   </div>
                   <h4 className="text-xl font-black text-slate-800">{redis.architecture} 架构</h4>
                   <p className="text-xs text-slate-500 font-bold mt-2 leading-relaxed">当前实例运行于 3 Master + 3 Slave 模式，支持自动分片与故障平滑切换。</p>
                   <button className="mt-8 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-black transition-all">查看拓扑详情</button>
                </div>
             </div>
          )}

          {tab === 'params' && (
             <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                   <h3 className="font-black text-slate-800">参数列表</h3>
                   <div className="flex gap-2">
                      <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-50"><LayoutTemplate size={16}/> 从模板应用</button>
                      <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-50"><FileOutput size={16}/> 导出模板</button>
                   </div>
                </div>
                <table className="w-full text-left">
                   <thead className="bg-white text-slate-400 font-black uppercase tracking-widest text-[10px]">
                      <tr>
                         <th className="px-8 py-4">参数名称</th>
                         <th className="px-8 py-4">当前运行值</th>
                         <th className="px-8 py-4">默认值</th>
                         <th className="px-8 py-4">说明</th>
                         <th className="px-8 py-4 text-right">操作</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 font-bold text-slate-600 text-sm">
                      {mockRedisParams.map(p => (
                        <tr key={p.key} className="hover:bg-slate-50/50 group">
                           <td className="px-8 py-5 font-mono text-slate-800">{p.key}</td>
                           <td className="px-8 py-5">
                              <input className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 w-40 text-sm font-black focus:ring-2 focus:ring-indigo-200 outline-none" defaultValue={p.value}/>
                           </td>
                           <td className="px-8 py-5 text-slate-400 font-mono">{p.default}</td>
                           <td className="px-8 py-5 text-xs text-slate-500 font-medium">{p.description}</td>
                           <td className="px-8 py-5 text-right">
                              <button className="text-indigo-600 hover:underline">保存</button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}

          {tab === 'users' && (
             <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                   <h3 className="font-black text-slate-800">ACL 用户权限管理</h3>
                   <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-xl hover:bg-indigo-700 flex items-center gap-2"><UserPlus size={16}/> 创建用户</button>
                </div>
                <div className="p-20 text-center text-slate-300">
                   <Users size={64} className="mx-auto mb-4 opacity-10"/>
                   <p className="font-black uppercase tracking-widest text-xs">用户管理模块建设中</p>
                </div>
             </div>
          )}

          {tab === 'backup' && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><Clock size={18}/> 自动备份策略 (Cron)</h3>
                      <div className="space-y-4">
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">定时周期表达式</label>
                            <div className="flex gap-2">
                               <input className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono font-black" defaultValue="0 2 * * *"/>
                               <button className="bg-slate-800 text-white px-4 rounded-xl text-xs font-black">更新</button>
                            </div>
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">备份存储目标</label>
                            <div className="flex gap-3">
                               <button className="flex-1 py-3 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 rounded-2xl text-xs font-black flex items-center justify-center gap-2"><HardDrive size={16}/> 本地 PVC</button>
                               <button className="flex-1 py-3 border-2 border-slate-100 text-slate-500 rounded-2xl text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-50"><Cloud size={16}/> 外部 S3</button>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col justify-between shadow-xl">
                      <div>
                         <h3 className="font-black text-lg mb-2">即时手动备份</h3>
                         <p className="text-slate-400 text-xs leading-relaxed">触发一次全量 RDB 备份。备份文件将根据当前策略上传至指定存储位置。</p>
                      </div>
                      <button className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-sm backdrop-blur-md transition-all border border-white/10 flex items-center justify-center gap-2">
                         <Activity size={18} className="text-emerald-400"/> 立即执行手动备份
                      </button>
                   </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                   <div className="px-8 py-5 border-b border-slate-50 font-black text-slate-800">备份记录列表</div>
                   <table className="w-full text-left text-sm font-bold text-slate-600">
                      <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                         <tr>
                            <th className="px-8 py-4">备份时间</th>
                            <th className="px-8 py-4">文件大小</th>
                            <th className="px-8 py-4">存储目标</th>
                            <th className="px-8 py-4">状态</th>
                            <th className="px-8 py-4 text-right">操作</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {mockBackupResults.filter(b=>b.component==='Redis').map(b => (
                           <tr key={b.id} className="hover:bg-slate-50/50">
                              <td className="px-8 py-5 font-mono">{b.time}</td>
                              <td className="px-8 py-5">{b.size}</td>
                              <td className="px-8 py-5">S3 (Bucket: redis-bkp)</td>
                              <td className="px-8 py-5">
                                 <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black ${b.status==='Success'?'bg-emerald-50 text-emerald-600':'bg-rose-50 text-rose-600'}`}>{b.status}</span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <button className="text-indigo-600 hover:underline flex items-center gap-1 ml-auto"><RotateCcw size={14}/> 从此恢复</button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {tab === 'monitor' && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex justify-between">
                         <span>连接数与命中率 (Stats)</span>
                         <Activity size={16} className="text-indigo-600"/>
                      </h4>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[{t:'10:00', c:120, h:98}, {t:'10:05', c:145, h:96}, {t:'10:10', c:110, h:99}, {t:'10:15', c:160, h:95}]}>
                               <defs>
                                  <linearGradient id="gradConn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                               </defs>
                               <XAxis dataKey="t" hide />
                               <YAxis fontSize={10} axisLine={false} />
                               <Tooltip />
                               <Area type="monotone" dataKey="c" stroke="#3b82f6" fill="url(#gradConn)" name="Connections" strokeWidth={3} />
                               <Area type="monotone" dataKey="h" stroke="#10b981" fillOpacity={0} name="Hit Rate %" strokeWidth={3} />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex justify-between">
                         <span>内存使用趋势 (MB)</span>
                         <Database size={16} className="text-purple-600"/>
                      </h4>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[{t:'10:00', m:4200}, {t:'10:05', m:4250}, {t:'10:10', m:4300}, {t:'10:15', m:4100}]}>
                               <XAxis dataKey="t" hide />
                               <YAxis fontSize={10} axisLine={false} />
                               <Tooltip />
                               <Line type="monotone" dataKey="m" stroke="#8b5cf6" strokeWidth={4} dot={{r: 4, fill: '#8b5cf6'}} name="Used Memory" />
                            </LineChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                   <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Clock size={18}/> 慢查询日志 (Slow Log)</h3>
                   <div className="text-center py-10 text-slate-400 font-bold text-sm">当前无超过阈值 (10ms) 的慢查询记录</div>
                </div>
             </div>
          )}

          {tab === 'logs' && (
             <div className="bg-slate-900 rounded-[32px] overflow-hidden flex flex-col h-[600px] border border-slate-800 shadow-2xl">
                <div className="px-6 py-4 bg-slate-800/50 border-b border-white/5 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300 font-black">
                         <Calendar size={14}/> 1小时
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300 font-black">
                         <Box size={14}/> redis-master-0
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-black">
                         <RefreshCw size={14}/> 实时滚动
                         <div className="w-10 h-5 bg-indigo-600 rounded-full flex items-center justify-end px-1 cursor-pointer"><div className="w-3 h-3 bg-white rounded-full"></div></div>
                      </div>
                      <div className="h-4 w-px bg-white/10"></div>
                      <button className="text-slate-400 hover:text-white"><Download size={18}/></button>
                   </div>
                </div>
                <div className="flex-1 p-6 font-mono text-[11px] text-slate-400 overflow-y-auto space-y-1">
                   <div className="flex gap-4"><span className="text-slate-600">10:45:01.123</span> <span className="text-emerald-500 font-black">INFO</span> [system] DB loaded from disk: 2.152 seconds</div>
                   <div className="flex gap-4"><span className="text-slate-600">10:45:02.456</span> <span className="text-emerald-500 font-black">INFO</span> [system] Ready to accept connections tcp</div>
                   <div className="flex gap-4"><span className="text-slate-600">10:45:10.789</span> <span className="text-indigo-500 font-black">DEBUG</span> [client] Client connected: 10.244.1.5:45672</div>
                   <div className="flex gap-4"><span className="text-slate-600">10:46:05.111</span> <span className="text-amber-500 font-black">WARN</span> [memory] Memory fragmented (ratio: 1.55)</div>
                   <div className="animate-pulse text-indigo-400">_</div>
                </div>
             </div>
          )}

          {tab === 'alerts' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
                   <div>
                      <h4 className="font-black text-slate-800">告警策略库</h4>
                      <p className="text-xs text-slate-500 font-bold mt-1">已启用 12 项预置指标监控，支持主从切换、Key 命中率、连接数激增告警。</p>
                   </div>
                   <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-xl hover:bg-indigo-700 flex items-center gap-2"><Plus size={16}/> 创建自定义策略</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-rose-600"><AlertOctagon size={18}/> 实时告警信息</h3>
                      <div className="space-y-4">
                         <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-4">
                            <div className="mt-1 text-rose-500"><AlertTriangle size={18}/></div>
                            <div>
                               <div className="text-sm font-black text-rose-800">主从切换事件发生 (Master-Slave Switch)</div>
                               <div className="text-[10px] text-rose-600 font-bold mt-1">2023-10-30 10:42 • Instance: redis-master-1</div>
                            </div>
                         </div>
                         <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                            <div className="mt-1 text-amber-500"><AlertTriangle size={18}/></div>
                            <div>
                               <div className="text-sm font-black text-amber-800">Key 命中率低于阈值 (75%)</div>
                               <div className="text-[10px] text-amber-600 font-bold mt-1">2023-10-30 09:15 • Current: 62%</div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col justify-center items-center text-slate-300">
                      <History size={64} className="opacity-10 mb-4"/>
                      <p className="text-xs font-black uppercase tracking-widest">告警历史查询</p>
                   </div>
                </div>
             </div>
          )}

          {tab === 'inspection' && (
             <div className="space-y-8">
                <div className="grid grid-cols-3 gap-6">
                   <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm text-center">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">上次巡检得分</div>
                      <div className="text-4xl font-black text-emerald-600">92</div>
                   </div>
                   <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm text-center">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">健康/风险项</div>
                      <div className="text-4xl font-black text-slate-800">18 <span className="text-sm text-amber-500">/ 2</span></div>
                   </div>
                   <div className="bg-indigo-600 rounded-[32px] p-6 text-white text-center cursor-pointer hover:bg-indigo-700 transition-all flex flex-col items-center justify-center gap-1 shadow-xl shadow-indigo-100">
                      <RefreshCw size={24}/>
                      <span className="text-xs font-black uppercase">立即手动巡检</span>
                   </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                   <div className="px-8 py-5 border-b border-slate-50 font-black text-slate-800">历史巡检报告</div>
                   <table className="w-full text-left font-bold text-slate-600">
                      <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                         <tr>
                            <th className="px-8 py-4">巡检时间</th>
                            <th className="px-8 py-4">状态</th>
                            <th className="px-8 py-4">风险详情</th>
                            <th className="px-8 py-4 text-right">报告操作</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {mockInspections.map(insp => (
                           <tr key={insp.id} className="hover:bg-slate-50/50">
                              <td className="px-8 py-5 font-mono">{insp.time}</td>
                              <td className="px-8 py-5">
                                 <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black ${insp.status==='Pass'?'bg-emerald-50 text-emerald-600':'bg-amber-50 text-amber-600'}`}>{insp.status}</span>
                              </td>
                              <td className="px-8 py-5 text-xs">
                                 <span className="text-slate-400 mr-2">健康: {insp.healthy}</span>
                                 <span className="text-amber-500 mr-2">风险: {insp.risk}</span>
                                 <span className="text-rose-500">错误: {insp.error}</span>
                              </td>
                              <td className="px-8 py-5 text-right flex justify-end gap-3">
                                 <button className="text-indigo-600 hover:underline flex items-center gap-1"><Eye size={14}/> 查看</button>
                                 <button className="text-slate-400 hover:text-slate-600 flex items-center gap-1"><Download size={14}/> 导出</button>
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

// --- Main Component ---

export const Middleware: React.FC = () => {
  const [activeService, setActiveService] = useState<'overview' | 'kafka' | 'redis' | 'rabbitmq'>('overview');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Instance Renderers
  const renderRedisList = () => (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
      {mockRedisInstances.map(redis => (
        <div key={redis.id} onClick={() => setSelectedInstanceId(redis.id)} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="p-6 bg-rose-50 text-rose-600 rounded-[28px] group-hover:bg-rose-100 transition-colors shadow-inner"><Database size={40}/></div>
            <div>
               <h3 className="text-xl font-black text-slate-800 group-hover:text-rose-600 transition-colors">{redis.name}</h3>
               <div className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest flex items-center gap-3">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">{redis.architecture}</span>
                  <span>v{redis.version}</span>
               </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-10 px-10 border-x border-slate-50">
             <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">连接地址</div>
                <div className="text-sm font-mono text-slate-600 truncate max-w-[150px]">{redis.endpoint}</div>
             </div>
             <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">资源规格</div>
                <div className="text-sm font-black text-slate-700">{redis.cpu} / {redis.memory}</div>
             </div>
             <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">运行状态</div>
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

  const renderServiceList = (type: 'kafka' | 'rabbitmq') => (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[32px] p-20 text-center border border-dashed border-slate-200">
         <div className={`p-8 w-fit mx-auto rounded-[40px] mb-8 ${type==='kafka'?'bg-orange-50 text-orange-600':'bg-blue-50 text-blue-600'}`}>
            {type === 'kafka' ? <Database size={64}/> : <MessageSquare size={64}/>}
         </div>
         <h3 className="text-2xl font-black text-slate-800">暂无 {type.toUpperCase()} 实例</h3>
         <p className="text-slate-400 text-sm mt-2 font-bold">立即点击右上角按钮创建一个新的生产级实例。</p>
         <button onClick={()=>setIsWizardOpen(true)} className={`mt-10 px-8 py-3 rounded-2xl text-sm font-black text-white shadow-xl transition-all ${type==='kafka'?'bg-orange-600 hover:bg-orange-700 shadow-orange-100':'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}>创建首个实例</button>
      </div>
    </div>
  );

  if (selectedInstanceId) {
    return <RedisDetail instanceId={selectedInstanceId} onBack={() => setSelectedInstanceId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div>
           <h2 className="text-4xl font-black text-slate-800 tracking-tighter">云原生技术组件</h2>
           <p className="text-slate-500 text-sm mt-1 font-medium italic">全生命周期托管的 Kafka、Redis、RabbitMQ 企业级服务。</p>
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
                   onClick={() => setActiveService(t.id as any)}
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
        {activeService === 'kafka' && renderServiceList('kafka')}
        {activeService === 'rabbitmq' && renderServiceList('rabbitmq')}
      </div>

      {/* Wizard Modal (Minimalist Implementation) */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-2xl font-black text-slate-800">创建 {activeService.toUpperCase()} 实例</h3>
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
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">第一步：基础配置</label>
                          <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all" placeholder="实例名称 (e.g. prod-cache-cluster)"/>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-6 border-2 border-indigo-600 bg-indigo-50/50 rounded-[32px] cursor-pointer relative shadow-lg shadow-indigo-100">
                                <div className="font-black text-indigo-700">Cluster 架构</div>
                                <p className="text-[10px] text-indigo-500 font-bold mt-1">高性能、高可用、动态水平扩展</p>
                                <div className="absolute top-4 right-4 text-indigo-600"><CheckCircle size={20}/></div>
                             </div>
                             <div className="p-6 border-2 border-slate-100 rounded-[32px] cursor-pointer hover:border-indigo-300 transition-all">
                                <div className="font-black text-slate-700">Sentinel 架构</div>
                                <p className="text-[10px] text-slate-500 font-bold mt-1">主从热备、自动故障切换、稳定可靠</p>
                             </div>
                          </div>
                       </section>
                    </div>
                 )}
                 {wizardStep === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                       <section className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">第二步：规格配置</label>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <span className="text-xs font-black text-slate-600">CPU 核心数</span>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black outline-none bg-white"><option>1 Core</option><option>2 Cores</option><option>4 Cores</option></select>
                             </div>
                             <div className="space-y-2">
                                <span className="text-xs font-black text-slate-600">内存 容量 (GB)</span>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black outline-none bg-white"><option>2 GB</option><option>4 GB</option><option>8 GB</option></select>
                             </div>
                          </div>
                          <div className="space-y-4 pt-4">
                             <span className="text-xs font-black text-slate-600 flex justify-between">存储容量 (SSD) <span>20 GB</span></span>
                             <input type="range" className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"/>
                          </div>
                       </section>
                    </div>
                 )}
                 {wizardStep === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                       <section className="space-y-6">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">第三步：高级配置</label>
                          <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white rounded-2xl shadow-sm"><Sliders size={24} className="text-indigo-600"/></div>
                                <div>
                                   <div className="font-black text-slate-800">参数模板预置</div>
                                   <p className="text-[10px] text-slate-400 font-bold mt-0.5">选择专为生产环境优化的参数配置集合</p>
                                </div>
                             </div>
                             <select className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none shadow-sm mb-4">
                                <option>预置：生产高性能型模板</option>
                                <option>预置：高稳定性优化模板</option>
                                <option>预置：默认默认模板</option>
                                <option>+ 导入自定义模板 (JSON/YAML)</option>
                             </select>
                          </div>
                          <div className="bg-indigo-50/50 p-8 rounded-[32px] border border-indigo-100 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm"><Shield size={24} className="text-emerald-600"/></div>
                                <div>
                                   <div className="font-black text-indigo-900">安全合规审计</div>
                                   <p className="text-[10px] text-indigo-700/60 font-bold mt-0.5">自动创建管理账户并开启连接加密</p>
                                </div>
                             </div>
                             <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center justify-end px-1 cursor-pointer"><div className="w-4 h-4 bg-white rounded-full"></div></div>
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
