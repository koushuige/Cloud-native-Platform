import React, { useState, useEffect } from 'react';
import { 
  StorageClass, PersistentVolumeClaim, CsiDriver, VolumeSnapshot, PersistentVolume, 
  CephPool, MinioBucket, CephOsd, TopolvmNode, MinioUser, CephDeploymentConfig, 
  CephCrushNode, CephAlertPolicy, TopolvmLogicalVolume, TopolvmDeviceClass, MinioTenant 
} from '../types';
import { 
  HardDrive, Database, Server, Plus, Activity, Save, Layers, Cloud, Settings, 
  CheckCircle, AlertTriangle, ArrowUpRight, Copy, Trash2, Edit3, X, 
  ChevronRight, Check, Zap, Network, Key, BarChart as BarChartIcon, Cpu, RefreshCw,
  LayoutDashboard, PieChart, Camera, Monitor, PlayCircle, ShieldCheck, Box, User, Lock, Globe,
  MoreVertical, FileText, Search, Clock, Filter, AlertOctagon, Download, Share2,
  ArrowLeft, Maximize2, Gauge, ActivitySquare, Terminal, Info, History, TrendingUp, AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

// --- Mock Data ---

const initialPVCs: PersistentVolumeClaim[] = [
  { id: 'pvc-1', name: 'mysql-data', namespace: 'default', status: 'Bound', capacity: '100Gi', storageClass: 'ceph-block', accessModes: ['RWO'], age: '10d', usedPercentage: 75, volumeName: 'pvc-7a8b9c' },
  { id: 'pvc-2', name: 'redis-data', namespace: 'default', status: 'Bound', capacity: '20Gi', storageClass: 'local-path', accessModes: ['RWO'], age: '5d', usedPercentage: 45, volumeName: 'pvc-1x2y3z' },
  { id: 'pvc-3', name: 'shared-files', namespace: 'web', status: 'Pending', capacity: '500Gi', storageClass: 'ceph-filesystem', accessModes: ['RWX'], age: '1m', usedPercentage: 0 },
];

const initialPVs: PersistentVolume[] = [
  { id: 'pv-1', name: 'pvc-7a8b9c', capacity: '100Gi', accessModes: ['RWO'], reclaimPolicy: 'Delete', status: 'Bound', claimRef: 'default/mysql-data', storageClass: 'ceph-block', age: '10d' },
  { id: 'pv-2', name: 'pvc-1x2y3z', capacity: '20Gi', accessModes: ['RWO'], reclaimPolicy: 'Delete', status: 'Bound', claimRef: 'default/redis-data', storageClass: 'local-path', age: '5d' },
];

const initialSCs: StorageClass[] = [
  { id: 'sc-1', name: 'ceph-block', provisioner: 'rook-ceph.rbd.csi.ceph.com', reclaimPolicy: 'Delete', volumeBindingMode: 'Immediate', allowVolumeExpansion: true },
  { id: 'sc-2', name: 'ceph-filesystem', provisioner: 'rook-ceph.cephfs.csi.ceph.com', reclaimPolicy: 'Retain', volumeBindingMode: 'Immediate', allowVolumeExpansion: true },
  { id: 'sc-3', name: 'local-path', provisioner: 'topolvm.io/lvm', reclaimPolicy: 'Delete', volumeBindingMode: 'WaitForFirstConsumer', allowVolumeExpansion: true },
];

const storageMetrics = [
  { time: '00:00', iops: 1200, throughput: 150, recovery: 20 },
  { time: '04:00', iops: 800, throughput: 100, recovery: 15 },
  { time: '08:00', iops: 2500, throughput: 350, recovery: 40 },
  { time: '12:00', iops: 3200, throughput: 450, recovery: 100 },
  { time: '16:00', iops: 2800, throughput: 380, recovery: 50 },
  { time: '20:00', iops: 1500, throughput: 200, recovery: 30 },
];

export const Storage: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'resources' | 'sc' | 'ceph' | 'topolvm' | 'minio' | 'snapshots' | 'ops'>('dashboard');
  const [resourceTab, setResourceTab] = useState<'pvc' | 'pv'>('pvc');
  const [pvcs, setPvcs] = useState(initialPVCs);
  const [pvs, setPvs] = useState(initialPVs);
  const [scs, setSCs] = useState(initialSCs);
  
  const [selectedPvcId, setSelectedPvcId] = useState<string | null>(null);
  const [isExpandModalOpen, setIsExpandModalOpen] = useState(false);
  const [newSize, setNewSize] = useState<number>(100);

  // --- Actions ---

  const handleExpandPvc = () => {
    if (!selectedPvcId) return;
    
    // Step 1: Set to Resizing status
    setPvcs(prev => prev.map(p => {
      if (p.id === selectedPvcId) {
        return { ...p, status: 'Resizing', capacity: `${newSize}Gi` };
      }
      return p;
    }));
    
    setIsExpandModalOpen(false);
    
    // Step 2: Simulate Kubernetes Controller finishing expansion
    setTimeout(() => {
      setPvcs(prev => prev.map(p => {
        if (p.id === selectedPvcId) {
          return { ...p, status: 'Bound' };
        }
        return p;
      }));
    }, 2500);
  };

  const NavItem = ({ id, label, icon }: { id: typeof activeView, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => { setActiveView(id); setSelectedPvcId(null); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
        activeView === id && !selectedPvcId
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  // --- Sub-Views ---

  const renderPvcDetail = () => {
    const pvc = pvcs.find(p => p.id === selectedPvcId);
    if (!pvc) return (
      <div className="p-10 text-center text-slate-400">
         <AlertCircle size={48} className="mx-auto mb-4 opacity-20"/>
         未找到指定的 PVC 资源
         <button onClick={() => setSelectedPvcId(null)} className="block mx-auto mt-4 text-blue-600 font-bold">返回列表</button>
      </div>
    );

    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedPvcId(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800">{pvc.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${
                  pvc.status === 'Bound' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                  pvc.status === 'Resizing' ? 'bg-blue-50 border-blue-100 text-blue-600 animate-pulse' : 
                  'bg-orange-50 border-orange-100 text-orange-600'
                }`}>
                  {pvc.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">Namespace: {pvc.namespace} • StorageClass: {pvc.storageClass}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setNewSize(parseInt(pvc.capacity)); setIsExpandModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-blue-100"
            >
              <Maximize2 size={18} />
              <span>在线扩容</span>
            </button>
            <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50">
              <Camera size={18} />
              <span>快照备份</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={20}/></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-8 flex items-center gap-2 text-sm uppercase tracking-widest">
                <Info size={16} className="text-blue-500"/> 卷元数据 (Metadata)
              </h3>
              <div className="grid grid-cols-2 gap-y-8">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">关联 PV 实例</div>
                  <div className="text-sm font-mono text-blue-600 font-bold hover:underline cursor-pointer">{pvc.volumeName || 'Waiting For Binding...'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">已分配容量 (Provisioned)</div>
                  <div className="text-xl font-black text-slate-800">{pvc.capacity}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">访问模式 (Access Modes)</div>
                  <div className="flex gap-2">
                    {pvc.accessModes.map(m => (
                      <span key={m} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-600 border border-slate-200">{m}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">存活时长 (Age)</div>
                  <div className="text-sm text-slate-700 font-bold">{pvc.age}</div>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-50">
                <div className="flex justify-between items-end mb-4">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">磁盘使用空间 (Used)</div>
                  <div className="text-sm font-black text-slate-800">{pvc.usedPercentage}%</div>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex shadow-inner border border-slate-200">
                  <div 
                    className={`h-full transition-all duration-1000 ${pvc.usedPercentage > 85 ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${pvc.usedPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest">
                <History size={16} className="text-orange-400"/> 控制面事件 (Recent Events)
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <CheckCircle size={18} className="text-emerald-500 mt-1 shrink-0"/>
                  <div>
                    <div className="font-bold text-slate-800">Normal: ProvisioningSucceeded</div>
                    <div className="text-xs text-slate-500 mt-1">Successfully provisioned volume using rook-ceph provisioner.</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-bold">10d ago • Source: PersistentVolumeController</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl flex flex-col justify-between min-h-[450px]">
              <div>
                <div className="p-4 bg-white/10 w-fit rounded-2xl mb-8 backdrop-blur-md">
                   <ActivitySquare size={32} className="text-blue-400"/>
                </div>
                <h3 className="text-xl font-black mb-2">IO 性能观测</h3>
                <p className="text-slate-400 text-xs mb-8">正在监测挂载 Pod 的实时读写吞吐。</p>
                
                <div className="space-y-10">
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">IOPS Trend</div>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={storageMetrics}>
                          <Line type="monotone" dataKey="iops" stroke="#3b82f6" strokeWidth={3} dot={false}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">Throughput (MB/s)</div>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={storageMetrics}>
                          <defs>
                            <linearGradient id="pvcGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="throughput" stroke="#10b981" fill="url(#pvcGrad)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
              <button className="mt-10 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all">全量指标审计</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'PVC 总数', value: pvcs.length, sub: 'Active: ' + pvcs.filter(p=>p.status==='Bound').length, icon: <Layers className="text-blue-600"/>, bg: 'bg-blue-50' },
          { label: '总存储量', value: '12.5 TB', sub: 'Used: 4.2 TB', icon: <Database className="text-indigo-600"/>, bg: 'bg-indigo-50' },
          { label: '服务状态', value: 'OK', sub: 'Drivers Healthy', icon: <Activity className="text-emerald-600"/>, bg: 'bg-emerald-50' },
          { label: '活跃告警', value: '0', sub: 'All Normal', icon: <AlertOctagon className="text-orange-600"/>, bg: 'bg-orange-50' }
        ].map(card => (
          <div key={card.label} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 ${card.bg} rounded-2xl`}>{card.icon}</div>
              <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">{card.label}</h4>
            </div>
            <div className="text-4xl font-black text-slate-800 tracking-tighter">{card.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-2">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-10 flex items-center gap-3">
          <Monitor size={24} className="text-blue-600" /> 全集群存储压力趋势
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={storageMetrics}>
              <defs>
                <linearGradient id="dashIOPS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)'}} />
              <Area type="monotone" dataKey="iops" stroke="#3b82f6" fill="url(#dashIOPS)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      {selectedPvcId ? renderPvcDetail() : (
        <div className="animate-in fade-in">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-10 border-b border-slate-200 px-2">
              <button onClick={() => setResourceTab('pvc')} className={`pb-3 pt-1 px-1 text-sm font-black border-b-4 transition-all uppercase tracking-widest ${resourceTab === 'pvc' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>持久卷声明 (PVC)</button>
              <button onClick={() => setResourceTab('pv')} className={`pb-3 pt-1 px-1 text-sm font-black border-b-4 transition-all uppercase tracking-widest ${resourceTab === 'pv' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>持久卷 (PV)</button>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"><Plus size={16}/> 创建资源</button>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-8 py-5">名称</th>
                  <th className="px-6 py-5">命名空间</th>
                  <th className="px-6 py-5">状态</th>
                  <th className="px-6 py-5">容量</th>
                  <th className="px-6 py-5">存储类</th>
                  <th className="px-6 py-5">使用率</th>
                  <th className="px-8 py-5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(resourceTab === 'pvc' ? pvcs : pvs).map((item: any) => (
                  <tr key={item.id} onClick={() => resourceTab === 'pvc' && setSelectedPvcId(item.id)} className={`group transition-colors ${resourceTab === 'pvc' ? 'hover:bg-blue-50/50 cursor-pointer' : 'hover:bg-slate-50'}`}>
                    <td className="px-8 py-6 font-black text-slate-700 group-hover:text-blue-600">{item.name}</td>
                    <td className="px-6 py-6 text-slate-500 font-bold">{item.namespace || '-'}</td>
                    <td className="px-6 py-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${
                        item.status === 'Bound' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                        item.status === 'Resizing' ? 'bg-blue-50 border-blue-100 text-blue-600 animate-pulse' : 
                        'bg-orange-50 border-orange-100 text-orange-600'
                      }`}>{item.status}</span>
                    </td>
                    <td className="px-6 py-6 font-black text-slate-700">{item.capacity}</td>
                    <td className="px-6 py-6 font-bold text-slate-400">{item.storageClass}</td>
                    <td className="px-6 py-6 w-32">
                      {resourceTab === 'pvc' ? (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${item.usedPercentage > 85 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${item.usedPercentage}%`}}></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-400">{item.usedPercentage}%</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {resourceTab === 'pvc' && <ChevronRight className="text-slate-300 group-hover:text-blue-600 ml-auto" />}
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

  const renderStorageClasses = () => (
    <div className="space-y-8 animate-in fade-in">
       <div className="flex justify-between items-end px-2">
         <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">存储类 (StorageClass)</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">定义卷的动态配置、供应策略与底层协议映射。</p>
         </div>
         <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-xl shadow-blue-100 transition-all hover:bg-blue-700">
           <Plus size={16}/> 创建 StorageClass
         </button>
       </div>
       <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm">
           <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <tr>
               <th className="px-8 py-5">Name</th>
               <th className="px-6 py-5">Provisioner</th>
               <th className="px-6 py-5">Reclaim Policy</th>
               <th className="px-6 py-5">Binding Mode</th>
               <th className="px-6 py-5">Expansion</th>
               <th className="px-8 py-5 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
             {scs.map(sc => (
               <tr key={sc.id} className="hover:bg-slate-50/80 transition-colors">
                 <td className="px-8 py-6 font-black text-slate-800">{sc.name}</td>
                 <td className="px-6 py-6 font-mono text-xs text-slate-400">{sc.provisioner}</td>
                 <td className="px-6 py-6"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black uppercase">{sc.reclaimPolicy}</span></td>
                 <td className="px-6 py-6 text-[10px] uppercase font-black">{sc.volumeBindingMode}</td>
                 <td className="px-6 py-6">
                    {sc.allowVolumeExpansion ? (
                        <span className="flex items-center gap-1 text-emerald-500 text-[10px] uppercase font-black"><CheckCircle size={14}/> Supported</span>
                    ) : (
                        <span className="flex items-center gap-1 text-slate-300 text-[10px] uppercase font-black"><AlertOctagon size={14}/> Not Supported</span>
                    )}
                 </td>
                 <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-300 hover:text-blue-600"><Settings size={18}/></button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );

  return (
    <div className="flex h-full bg-slate-50/50 -m-8">
      <div className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col h-[calc(100vh-64px)] overflow-y-auto shrink-0">
         <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Core Storage</div>
         <div className="space-y-1">
            <NavItem id="dashboard" label="概览" icon={<LayoutDashboard size={18} />} />
            <NavItem id="resources" label="资源管理 (PV/PVC)" icon={<Database size={18} />} />
            <NavItem id="sc" label="存储类 (SC)" icon={<Layers size={18} />} />
         </div>
         <div className="my-10 border-t border-slate-100"></div>
         <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Storage Providers</div>
         <div className="space-y-1">
            <NavItem id="ceph" label="Rook Ceph" icon={<HardDrive size={18} className="text-red-500" />} />
            <NavItem id="topolvm" label="Topolvm 本地盘" icon={<Server size={18} className="text-green-500" />} />
            <NavItem id="minio" label="Minio 对象存储" icon={<Cloud size={18} className="text-pink-500" />} />
         </div>
      </div>

      <div className="flex-1 p-10 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
         <div className="max-w-7xl mx-auto">
            {activeView === 'dashboard' && renderDashboard()}
            {activeView === 'resources' && renderResources()}
            {activeView === 'sc' && renderStorageClasses()}
            {['ceph', 'topolvm', 'minio', 'snapshots', 'ops'].includes(activeView) && (
              <div className="flex flex-col items-center justify-center py-40 text-slate-300">
                <Settings size={80} className="opacity-10 mb-4 animate-spin duration-[10s]" />
                <p className="font-black uppercase tracking-widest text-xs">{activeView} 模块深度功能开发中...</p>
              </div>
            )}
         </div>
      </div>

      {isExpandModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 border border-white/20">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Maximize2 size={24}/></div>
                <h3 className="text-xl font-black text-slate-800">在线扩容存储卷</h3>
              </div>
              <button onClick={() => setIsExpandModalOpen(false)} className="text-slate-400"><X size={24}/></button>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest"><span>当前容量</span><span>目标容量</span></div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-400">{pvcs.find(p=>p.id===selectedPvcId)?.capacity}</span>
                  <ChevronRight className="text-slate-300" size={32}/>
                  <div className="flex items-end gap-1">
                    <input type="number" className="w-24 bg-white border-b-4 border-blue-600 text-3xl font-black text-blue-600 outline-none p-1 text-center" value={newSize} onChange={e => setNewSize(Math.max(parseInt(e.target.value)||0, 1))}/>
                    <span className="text-lg font-black text-blue-600 pb-1">Gi</span>
                  </div>
                </div>
              </div>
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 items-start text-xs font-bold text-amber-800 leading-relaxed">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                存储卷容量只能增加不能减少，扩容后系统将自动调整文件系统大小。
              </div>
            </div>
            <div className="mt-10 flex gap-3">
              <button onClick={() => setIsExpandModalOpen(false)} className="flex-1 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-500">取消</button>
              <button onClick={handleExpandPvc} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-xl">确认扩容</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};