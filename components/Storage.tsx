
import React, { useState } from 'react';
import { StorageClass, PersistentVolumeClaim, CsiDriver, VolumeSnapshot, BucketClaim, PersistentVolume, CephPool, MinioBucket, StorageOperation } from '../types';
import { 
  HardDrive, Database, Server, Plus, MoreHorizontal, PieChart, RefreshCw, 
  Box, Activity, Save, Layers, Cloud, Shield, Settings, FileText, CheckCircle, 
  AlertTriangle, ArrowUpRight, Copy, Search, Trash2, Edit3, X, PlayCircle, Lock,
  ChevronDown, ChevronRight, Download, Check
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';

// --- Mock Data ---

const initialPVCs: PersistentVolumeClaim[] = [
  { id: 'pvc-1', name: 'mysql-data', namespace: 'default', status: 'Bound', capacity: '100Gi', storageClass: 'ceph-block', accessModes: ['RWO'], age: '10d', usedPercentage: 75, volumeName: 'pvc-7a8b9c' },
  { id: 'pvc-2', name: 'redis-data', namespace: 'default', status: 'Bound', capacity: '20Gi', storageClass: 'local-path', accessModes: ['RWO'], age: '5d', usedPercentage: 45, volumeName: 'pvc-1x2y3z' },
  { id: 'pvc-3', name: 'shared-files', namespace: 'web', status: 'Pending', capacity: '500Gi', storageClass: 'ceph-filesystem', accessModes: ['RWX'], age: '1m', usedPercentage: 0 },
  { id: 'pvc-4', name: 'ebs-data', namespace: 'prod', status: 'Bound', capacity: '50Gi', storageClass: 'aws-ebs-gp3', accessModes: ['RWO'], age: '2d', usedPercentage: 20, volumeName: 'pvc-aws-123' },
];

const initialPVs: PersistentVolume[] = [
  { id: 'pv-1', name: 'pvc-7a8b9c', capacity: '100Gi', accessModes: ['RWO'], reclaimPolicy: 'Delete', status: 'Bound', claimRef: 'default/mysql-data', storageClass: 'ceph-block', age: '10d' },
  { id: 'pv-2', name: 'pvc-1x2y3z', capacity: '20Gi', accessModes: ['RWO'], reclaimPolicy: 'Delete', status: 'Bound', claimRef: 'default/redis-data', storageClass: 'local-path', age: '5d' },
  { id: 'pv-3', name: 'pvc-aws-123', capacity: '50Gi', accessModes: ['RWO'], reclaimPolicy: 'Delete', status: 'Bound', claimRef: 'prod/ebs-data', storageClass: 'aws-ebs-gp3', age: '2d' },
];

const initialSCs: StorageClass[] = [
  { id: 'sc-1', name: 'ceph-block', provisioner: 'rook-ceph.rbd.csi.ceph.com', reclaimPolicy: 'Delete', volumeBindingMode: 'Immediate', allowVolumeExpansion: true },
  { id: 'sc-2', name: 'ceph-filesystem', provisioner: 'rook-ceph.cephfs.csi.ceph.com', reclaimPolicy: 'Retain', volumeBindingMode: 'Immediate', allowVolumeExpansion: true },
  { id: 'sc-3', name: 'local-path', provisioner: 'topolvm.io/lvm', reclaimPolicy: 'Delete', volumeBindingMode: 'WaitForFirstConsumer', allowVolumeExpansion: true },
  { id: 'sc-4', name: 'aws-ebs-gp3', provisioner: 'ebs.csi.aws.com', reclaimPolicy: 'Delete', volumeBindingMode: 'WaitForFirstConsumer', allowVolumeExpansion: true },
];

const mockCsiDrivers: CsiDriver[] = [
  { id: 'drv-1', name: 'Rook Ceph', type: 'Ceph', status: 'Healthy', version: 'v1.12.0', nodesRegistered: 5, provisioner: 'rook-ceph.rbd.csi.ceph.com', createdAt: '2023-01-01', components: { controller: 'Healthy', nodePlugin: 'Healthy' } },
  { id: 'drv-2', name: 'Minio Operator', type: 'Minio', status: 'Healthy', version: 'v5.0.10', nodesRegistered: 5, provisioner: 'minio.csi.io', createdAt: '2023-02-15', components: { controller: 'Healthy', nodePlugin: 'Healthy' } },
  { id: 'drv-3', name: 'Topolvm', type: 'Topolvm', status: 'Healthy', version: 'v0.28.0', nodesRegistered: 3, provisioner: 'topolvm.io/lvm', createdAt: '2023-03-10', components: { controller: 'Healthy', nodePlugin: 'Healthy' } },
  { id: 'drv-4', name: 'AWS EBS', type: 'EBS', status: 'Unknown', version: 'v1.20.0', nodesRegistered: 12, provisioner: 'ebs.csi.aws.com', createdAt: '2023-05-20', components: { controller: 'Degraded', nodePlugin: 'Healthy' } },
];

const mockSnapshots: VolumeSnapshot[] = [
  { id: 'snap-1', name: 'mysql-backup-daily', namespace: 'default', sourcePvc: 'mysql-data', status: 'Ready', size: '100Gi', createdAt: '2023-10-25 02:00', restoreSize: '100Gi' },
  { id: 'snap-2', name: 'redis-backup-pre-upgrade', namespace: 'default', sourcePvc: 'redis-data', status: 'Ready', size: '20Gi', createdAt: '2023-10-24 15:30', restoreSize: '20Gi' },
];

const mockBucketClaims: BucketClaim[] = [
  { id: 'bc-1', name: 'log-archive', namespace: 'monitoring', bucketClass: 'minio-standard', protocol: 'S3', status: 'Bound', accessSecret: 'log-archive-creds' },
  { id: 'bc-2', name: 'static-assets', namespace: 'web', bucketClass: 'aws-s3-prod', protocol: 'S3', status: 'Provisioning', accessSecret: '-' },
];

const mockCephPools: CephPool[] = [
  { name: 'rbd-pool', type: 'Replicated', replicas: 3, pgNum: 128, used: '2.5TB', status: 'Healthy' },
  { name: 'cephfs-data', type: 'ErasureCoded', replicas: 0, pgNum: 64, used: '5.1TB', status: 'Healthy' },
];

const mockMinioBuckets: MinioBucket[] = [
  { name: 'app-backups', objects: 15420, size: '450GB', policy: 'Private', createdAt: '2023-01-10' },
  { name: 'public-images', objects: 3400, size: '12GB', policy: 'Public', createdAt: '2023-02-15' },
];

const mockOperations: StorageOperation[] = [
  { id: 'op-1', type: 'Expansion', target: 'mysql-data (PVC)', status: 'Completed', startTime: '2023-10-25 10:00', endTime: '2023-10-25 10:02', message: 'Expanded from 80Gi to 100Gi successfully.' },
  { id: 'op-2', type: 'Snapshot', target: 'mysql-data', status: 'Running', startTime: '2023-10-25 12:00' },
  { id: 'op-3', type: 'HealthCheck', target: 'Ceph Cluster', status: 'Completed', startTime: '2023-10-25 08:00', message: 'All OSDs are up.' },
];

const storageMetrics = [
  { time: '00:00', iops: 1200, throughput: 150 },
  { time: '04:00', iops: 800, throughput: 100 },
  { time: '08:00', iops: 2500, throughput: 350 },
  { time: '12:00', iops: 3200, throughput: 450 },
  { time: '16:00', iops: 2800, throughput: 380 },
  { time: '20:00', iops: 1500, throughput: 200 },
];

const capacityForecast = [
  { month: 'Aug', used: 40, total: 100 },
  { month: 'Sep', used: 45, total: 100 },
  { month: 'Oct', used: 55, total: 100 },
  { month: 'Nov', used: 65, total: 120 }, // Projected expansion
  { month: 'Dec', used: 75, total: 120 },
];

export const Storage: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'resources' | 'providers' | 'snapshots' | 'cosi' | 'ops'>('dashboard');
  const [resourceSubTab, setResourceSubTab] = useState<'pvc' | 'pv' | 'sc'>('pvc');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [providerDetailTab, setProviderDetailTab] = useState<'overview' | 'backend' | 'volumes' | 'monitor'>('overview');
  
  // Data State
  const [drivers, setDrivers] = useState<CsiDriver[]>(mockCsiDrivers);
  const [pvcs, setPvcs] = useState<PersistentVolumeClaim[]>(initialPVCs);
  const [pvs, setPvs] = useState<PersistentVolume[]>(initialPVs);
  const [scs, setSCs] = useState<StorageClass[]>(initialSCs);

  // Action States
  const [isExpandModalOpen, setIsExpandModalOpen] = useState(false);
  const [selectedPvcForExpand, setSelectedPvcForExpand] = useState<PersistentVolumeClaim | null>(null);
  const [expandSize, setExpandSize] = useState('');
  
  // Create Modals
  const [isCreatePvcModalOpen, setIsCreatePvcModalOpen] = useState(false);
  const [isCreatePvModalOpen, setIsCreatePvModalOpen] = useState(false);
  const [isCreateScModalOpen, setIsCreateScModalOpen] = useState(false);
  const [isDeployCsiModalOpen, setIsDeployCsiModalOpen] = useState(false);

  // Forms
  const [newPvc, setNewPvc] = useState<Partial<PersistentVolumeClaim>>({ namespace: 'default', accessModes: ['RWO'], capacity: '10Gi' });
  const [newPv, setNewPv] = useState<Partial<PersistentVolume>>({ accessModes: ['RWO'], capacity: '100Gi', reclaimPolicy: 'Retain' });
  const [newSc, setNewSc] = useState<{name: string, provisioner: string, reclaimPolicy: 'Delete'|'Retain', allowExpansion: boolean, params: {key:string, value:string}[]}>({ 
    name: '', provisioner: 'rook-ceph.rbd.csi.ceph.com', reclaimPolicy: 'Delete', allowExpansion: true, params: [{key: '', value: ''}] 
  });
  
  // Deploy CSI Form
  const [deployDriverForm, setDeployDriverForm] = useState({
    type: 'AWS EBS' as string,
    namespace: 'kube-system',
    autoDiscover: true
  });

  // Handlers
  const handleExpandClick = (pvc: PersistentVolumeClaim) => {
    setSelectedPvcForExpand(pvc);
    setExpandSize('');
    setIsExpandModalOpen(true);
  };

  const handleExpandSubmit = () => {
    if (!selectedPvcForExpand) return;
    alert(`已提交扩容任务：将 ${selectedPvcForExpand.name} 扩容至 ${expandSize}。系统正在执行在线无感扩容...`);
    setIsExpandModalOpen(false);
  };

  const handleDeleteResource = (type: 'pvc' | 'pv' | 'sc', id: string) => {
    if(window.confirm('确认删除该资源吗？此操作不可逆。')) {
      if(type === 'pvc') setPvcs(pvcs.filter(i => i.id !== id));
      if(type === 'pv') setPvs(pvs.filter(i => i.id !== id));
      if(type === 'sc') setSCs(scs.filter(i => i.id !== id));
    }
  };

  const handleCreatePvc = () => {
    if(!newPvc.name) return;
    const item: PersistentVolumeClaim = {
       id: `pvc-${Date.now()}`,
       name: newPvc.name,
       namespace: newPvc.namespace || 'default',
       status: 'Pending',
       capacity: newPvc.capacity || '10Gi',
       storageClass: newPvc.storageClass || 'default',
       accessModes: newPvc.accessModes || ['RWO'],
       age: '0s',
       usedPercentage: 0
    };
    setPvcs([item, ...pvcs]);
    setIsCreatePvcModalOpen(false);
  };

  const handleCreatePv = () => {
    if(!newPv.name) return;
    const item: PersistentVolume = {
       id: `pv-${Date.now()}`,
       name: newPv.name,
       capacity: newPv.capacity || '10Gi',
       accessModes: newPv.accessModes || ['RWO'],
       reclaimPolicy: newPv.reclaimPolicy || 'Retain',
       status: 'Available',
       storageClass: newPv.storageClass || 'manual',
       age: '0s'
    };
    setPvs([item, ...pvs]);
    setIsCreatePvModalOpen(false);
  };

  const handleCreateSc = () => {
    if(!newSc.name) return;
    const item: StorageClass = {
       id: `sc-${Date.now()}`,
       name: newSc.name,
       provisioner: newSc.provisioner,
       reclaimPolicy: newSc.reclaimPolicy,
       volumeBindingMode: 'Immediate',
       allowVolumeExpansion: newSc.allowExpansion
    };
    setSCs([item, ...scs]);
    setIsCreateScModalOpen(false);
  };

  const handleDeployDriver = () => {
    const newDriver: CsiDriver = {
      id: `drv-${Date.now()}`,
      name: deployDriverForm.type,
      type: deployDriverForm.type.includes('AWS') ? 'EBS' : deployDriverForm.type.includes('Azure') ? 'AzureDisk' : 'Generic',
      status: 'Installing',
      version: 'latest',
      nodesRegistered: 0,
      provisioner: deployDriverForm.type.toLowerCase().replace(' ', '.'),
      createdAt: new Date().toISOString().split('T')[0],
      components: { controller: 'Healthy', nodePlugin: 'Healthy' }
    };
    setDrivers([...drivers, newDriver]);
    setIsDeployCsiModalOpen(false);
    setTimeout(() => {
      setDrivers(prev => prev.map(d => d.id === newDriver.id ? { ...d, status: 'Healthy', nodesRegistered: 3 } : d));
    }, 3000);
  };

  return (
    <div className="flex h-full min-h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-1">
         <div className="mb-6 px-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <HardDrive className="text-blue-600" /> 存储管理
            </h2>
            <p className="text-xs text-slate-500 mt-1">Unified Storage Console</p>
         </div>

         {[
            { id: 'dashboard', label: '总览 Dashboard', icon: <Activity size={18}/> },
            { id: 'resources', label: '资源管理 (PV/PVC)', icon: <Database size={18}/> },
            { id: 'providers', label: 'CSI 集成与后端', icon: <Server size={18}/> },
            { id: 'snapshots', label: '快照与备份', icon: <Save size={18}/> },
            { id: 'cosi', label: '对象存储 (COSI)', icon: <Cloud size={18}/> },
            { id: 'ops', label: '运维自动化', icon: <Settings size={18}/> },
         ].map(item => (
            <button
               key={item.id}
               onClick={() => { setActiveView(item.id as any); setSelectedProviderId(null); }}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === item.id ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-200/50'}`}
            >
               {item.icon}
               {item.label}
            </button>
         ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
         {/* === VIEW: DASHBOARD === */}
         {activeView === 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-8 space-y-8 animate-in fade-in">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h4 className="text-sm font-bold text-slate-500 mb-2">总存储容量</h4>
                     <div className="text-3xl font-bold text-slate-800">5.4 TB</div>
                     <p className="text-xs text-slate-500 mt-1">Allocated: 3.2 TB (60%)</p>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-blue-500 h-full w-3/5 rounded-full"></div>
                     </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h4 className="text-sm font-bold text-slate-500 mb-2">IOPS (Real-time)</h4>
                     <div className="text-3xl font-bold text-slate-800">1,240</div>
                     <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><ArrowUpRight size={12}/> Normal Load</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h4 className="text-sm font-bold text-slate-500 mb-2">存储卷总数</h4>
                     <div className="text-3xl font-bold text-slate-800">342</div>
                     <p className="text-xs text-slate-500 mt-1">PVCs: 342 Bound</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h4 className="text-lg font-bold text-slate-800 mb-4">性能监控 (Performance)</h4>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={storageMetrics}>
                              <defs>
                                 <linearGradient id="colorIops" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                              <Tooltip contentStyle={{borderRadius: '8px'}}/>
                              <Area type="monotone" dataKey="iops" stroke="#8884d8" fillOpacity={1} fill="url(#colorIops)" name="IOPS"/>
                              <Area type="monotone" dataKey="throughput" stroke="#82ca9d" fillOpacity={0} name="Throughput (MB/s)"/>
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h4 className="text-lg font-bold text-slate-800 mb-4">容量预测 (Capacity Forecast)</h4>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={capacityForecast}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}}/>
                              <Legend />
                              <Bar dataKey="used" fill="#3b82f6" name="Used (TB)" radius={[4,4,0,0]} barSize={30}/>
                              <Bar dataKey="total" fill="#e2e8f0" name="Total Capacity (TB)" radius={[4,4,0,0]} barSize={30}/>
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* === VIEW: RESOURCES (PVC/PV/SC) === */}
         {activeView === 'resources' && (
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
               <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-2">
                 <div className="flex gap-4">
                    {['pvc', 'pv', 'sc'].map(t => (
                       <button
                          key={t}
                          onClick={() => setResourceSubTab(t as any)}
                          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors uppercase ${resourceSubTab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                       >
                          {t === 'sc' ? 'Storage Classes' : t.toUpperCase()}
                       </button>
                    ))}
                 </div>
                 <button 
                    onClick={() => {
                       if(resourceSubTab === 'pvc') setIsCreatePvcModalOpen(true);
                       if(resourceSubTab === 'pv') setIsCreatePvModalOpen(true);
                       if(resourceSubTab === 'sc') setIsCreateScModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
                 >
                    <Plus size={16}/> Create {resourceSubTab.toUpperCase()}
                 </button>
               </div>

               <div className="flex-1 overflow-y-auto">
                  {resourceSubTab === 'pvc' && (
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                           <tr>
                              <th className="px-6 py-3">名称</th>
                              <th className="px-6 py-3">命名空间</th>
                              <th className="px-6 py-3">状态</th>
                              <th className="px-6 py-3">容量</th>
                              <th className="px-6 py-3">StorageClass</th>
                              <th className="px-6 py-3">使用率 (监控)</th>
                              <th className="px-6 py-3 text-right">操作</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {pvcs.map(pvc => (
                              <tr key={pvc.id} className="hover:bg-slate-50">
                                 <td className="px-6 py-3 font-medium text-slate-800">{pvc.name}</td>
                                 <td className="px-6 py-3 text-slate-600">{pvc.namespace}</td>
                                 <td className="px-6 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${pvc.status === 'Bound' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                       {pvc.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-3 font-mono text-slate-700">{pvc.capacity}</td>
                                 <td className="px-6 py-3 text-slate-600">{pvc.storageClass}</td>
                                 <td className="px-6 py-3 w-48">
                                    <div className="flex items-center gap-2">
                                       <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full ${pvc.usedPercentage! > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${pvc.usedPercentage || 0}%`}}></div>
                                       </div>
                                       <span className="text-xs text-slate-500">{pvc.usedPercentage || 0}%</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-3 text-right flex justify-end gap-2">
                                    <button 
                                      onClick={() => handleExpandClick(pvc)}
                                      className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                                      title="在线扩容"
                                    >
                                       <ArrowUpRight size={14} /> 扩容
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteResource('pvc', pvc.id)}
                                      className="text-slate-400 hover:text-red-600 p-1"
                                    >
                                       <Trash2 size={16}/>
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  )}
                  
                  {resourceSubTab === 'pv' && (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                           <tr>
                              <th className="px-6 py-3">名称</th>
                              <th className="px-6 py-3">容量</th>
                              <th className="px-6 py-3">Access Modes</th>
                              <th className="px-6 py-3">Reclaim Policy</th>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3">Claim</th>
                              <th className="px-6 py-3">StorageClass</th>
                              <th className="px-6 py-3 text-right">操作</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {pvs.map(pv => (
                              <tr key={pv.id} className="hover:bg-slate-50">
                                 <td className="px-6 py-3 font-medium text-slate-800">{pv.name}</td>
                                 <td className="px-6 py-3 font-mono text-slate-700">{pv.capacity}</td>
                                 <td className="px-6 py-3 text-slate-600">{pv.accessModes.join(', ')}</td>
                                 <td className="px-6 py-3 text-slate-600">{pv.reclaimPolicy}</td>
                                 <td className="px-6 py-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                       {pv.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-3 text-slate-600 text-xs">{pv.claimRef || '-'}</td>
                                 <td className="px-6 py-3 text-slate-600">{pv.storageClass}</td>
                                 <td className="px-6 py-3 text-right">
                                    <button 
                                      onClick={() => handleDeleteResource('pv', pv.id)}
                                      className="text-slate-400 hover:text-red-600 p-1"
                                    >
                                       <Trash2 size={16}/>
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  )}

                  {resourceSubTab === 'sc' && (
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                           <tr>
                              <th className="px-6 py-3">名称</th>
                              <th className="px-6 py-3">Provisioner</th>
                              <th className="px-6 py-3">Reclaim Policy</th>
                              <th className="px-6 py-3">Binding Mode</th>
                              <th className="px-6 py-3">Allow Expansion</th>
                              <th className="px-6 py-3 text-right">操作</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {scs.map(sc => (
                              <tr key={sc.id} className="hover:bg-slate-50">
                                 <td className="px-6 py-3 font-medium text-slate-800">{sc.name}</td>
                                 <td className="px-6 py-3 text-slate-600 text-xs">{sc.provisioner}</td>
                                 <td className="px-6 py-3 text-slate-600">{sc.reclaimPolicy}</td>
                                 <td className="px-6 py-3 text-slate-600">{sc.volumeBindingMode}</td>
                                 <td className="px-6 py-3">
                                    {sc.allowVolumeExpansion ? <CheckCircle size={16} className="text-green-500"/> : <X size={16} className="text-slate-300"/>}
                                 </td>
                                 <td className="px-6 py-3 text-right">
                                    <button 
                                      onClick={() => handleDeleteResource('sc', sc.id)}
                                      className="text-slate-400 hover:text-red-600 p-1"
                                    >
                                       <Trash2 size={16}/>
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  )}
               </div>
            </div>
         )}

         {/* === VIEW: PROVIDERS (CSI UNIFIED PLATFORM) === */}
         {activeView === 'providers' && (
            <div className="flex-1 overflow-y-auto p-8 animate-in fade-in">
               {!selectedProviderId ? (
                  <div>
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Installed CSI Drivers</h3>
                        <button 
                           onClick={() => setIsDeployCsiModalOpen(true)}
                           className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                        >
                           <Plus size={16}/> Deploy New Driver
                        </button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drivers.map(drv => (
                           <div 
                              key={drv.id}
                              onClick={() => { setSelectedProviderId(drv.id); setProviderDetailTab('overview'); }}
                              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                           >
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                    {drv.type === 'Ceph' ? <Database size={24} className="text-blue-600"/> : 
                                     drv.type === 'Minio' ? <Cloud size={24} className="text-red-500"/> :
                                     drv.type === 'Topolvm' ? <HardDrive size={24} className="text-green-600"/> : <Server size={24} className="text-slate-500"/>}
                                 </div>
                                 <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${
                                    drv.status === 'Healthy' ? 'bg-green-100 text-green-700' : 
                                    drv.status === 'Installing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                 }`}>
                                    {drv.status === 'Installing' && <RefreshCw size={10} className="animate-spin"/>}
                                    {drv.status}
                                 </span>
                              </div>
                              <h3 className="text-lg font-bold text-slate-800 mb-1">{drv.name}</h3>
                              <p className="text-xs text-slate-500 mb-4 font-mono">{drv.provisioner}</p>
                              
                              <div className="space-y-2 pt-4 border-t border-slate-50">
                                 <div className="text-xs text-slate-500 flex justify-between">
                                    <span>Version</span>
                                    <span className="font-medium text-slate-700">{drv.version}</span>
                                 </div>
                                 <div className="text-xs text-slate-500 flex justify-between">
                                    <span>Registered Nodes</span>
                                    <span className="font-medium text-slate-700">{drv.nodesRegistered}</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               ) : (
                  <div className="space-y-6">
                     <button onClick={() => setSelectedProviderId(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4">
                        <X size={16}/> Back to Driver List
                     </button>
                     
                     {(() => {
                        const drv = drivers.find(d => d.id === selectedProviderId);
                        if (!drv) return null;
                        return (
                           <>
                              <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                 <div>
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                       {drv.name}
                                       <span className="text-sm px-2 py-0.5 bg-slate-100 rounded text-slate-500 font-normal">{drv.version}</span>
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1 font-mono">{drv.provisioner}</p>
                                 </div>
                                 <div className="flex gap-2">
                                    <button className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                                       <Activity size={16}/> Health Check
                                    </button>
                                    <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                                       <Settings size={16}/> Configuration
                                    </button>
                                 </div>
                              </div>

                              <div className="border-b border-slate-200 flex gap-6">
                                 {[
                                    {id: 'overview', label: 'Overview & Health'},
                                    {id: 'volumes', label: 'Managed Volumes'},
                                    {id: 'monitor', label: 'Monitoring'},
                                    ...(drv.type === 'Ceph' || drv.type === 'Minio' ? [{id: 'backend', label: 'Backend Resources'}] : [])
                                 ].map(tab => (
                                    <button
                                       key={tab.id}
                                       onClick={() => setProviderDetailTab(tab.id as any)}
                                       className={`pb-3 pt-1 px-1 text-sm font-medium border-b-2 transition-colors ${providerDetailTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                       {tab.label}
                                    </button>
                                 ))}
                              </div>

                              <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[400px]">
                                 {providerDetailTab === 'overview' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                       <div>
                                          <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Component Health</h4>
                                          <div className="space-y-4">
                                             <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                   <Server size={20} className="text-slate-500"/>
                                                   <div>
                                                      <div className="font-bold text-slate-800">CSI Controller Service</div>
                                                      <div className="text-xs text-slate-500">Deployment / 2 Replicas</div>
                                                   </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${drv.components?.controller === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                   {drv.components?.controller}
                                                </span>
                                             </div>
                                             <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                   <HardDrive size={20} className="text-slate-500"/>
                                                   <div>
                                                      <div className="font-bold text-slate-800">CSI Node Plugin</div>
                                                      <div className="text-xs text-slate-500">DaemonSet / {drv.nodesRegistered} Nodes</div>
                                                   </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${drv.components?.nodePlugin === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                   {drv.components?.nodePlugin}
                                                </span>
                                             </div>
                                          </div>
                                       </div>
                                       <div>
                                          <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Driver Details</h4>
                                          <dl className="grid grid-cols-2 gap-4 text-sm">
                                             <dt className="text-slate-500">Driver Name</dt>
                                             <dd className="font-mono text-slate-800">{drv.provisioner}</dd>
                                             <dt className="text-slate-500">Installation Date</dt>
                                             <dd className="text-slate-800">{drv.createdAt}</dd>
                                             <dt className="text-slate-500">Topology Aware</dt>
                                             <dd className="text-slate-800">True</dd>
                                             <dt className="text-slate-500">Volume Expansion</dt>
                                             <dd className="text-slate-800">Online</dd>
                                          </dl>
                                       </div>
                                    </div>
                                 )}

                                 {providerDetailTab === 'volumes' && (
                                    <div>
                                       <div className="mb-4 text-sm text-slate-500 flex justify-between items-center">
                                          <span>Showing volumes provisioned by <strong>{drv.provisioner}</strong></span>
                                          <button className="text-blue-600 font-medium hover:underline text-xs">View all in Resource Manager</button>
                                       </div>
                                       <table className="w-full text-left text-sm">
                                          <thead className="bg-slate-50 text-slate-500">
                                             <tr>
                                                <th className="px-4 py-2">PVC Name</th>
                                                <th className="px-4 py-2">Capacity</th>
                                                <th className="px-4 py-2">StorageClass</th>
                                                <th className="px-4 py-2">Status</th>
                                                <th className="px-4 py-2 text-right">Actions</th>
                                             </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                             {pvcs.filter(p => scs.find(s => s.name === p.storageClass)?.provisioner === drv.provisioner).map(pvc => (
                                                <tr key={pvc.id}>
                                                   <td className="px-4 py-3 font-medium text-slate-800">{pvc.name}</td>
                                                   <td className="px-4 py-3">{pvc.capacity}</td>
                                                   <td className="px-4 py-3 text-slate-600">{pvc.storageClass}</td>
                                                   <td className="px-4 py-3"><span className="text-green-600 font-medium">{pvc.status}</span></td>
                                                   <td className="px-4 py-3 text-right">
                                                      <button onClick={() => handleExpandClick(pvc)} className="text-blue-600 hover:underline">Expand</button>
                                                   </td>
                                                </tr>
                                             ))}
                                             {pvcs.filter(p => scs.find(s => s.name === p.storageClass)?.provisioner === drv.provisioner).length === 0 && (
                                                <tr><td colSpan={5} className="text-center py-8 text-slate-400">No volumes found for this driver.</td></tr>
                                             )}
                                          </tbody>
                                       </table>
                                    </div>
                                 )}

                                 {providerDetailTab === 'monitor' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                       <div className="h-64 border rounded-xl p-4">
                                          <h4 className="text-sm font-bold text-slate-600 mb-2">Driver IOPS</h4>
                                          <ResponsiveContainer width="100%" height="100%">
                                             <LineChart data={storageMetrics}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="time" tick={{fontSize: 10}} />
                                                <YAxis tick={{fontSize: 10}} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="iops" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                             </LineChart>
                                          </ResponsiveContainer>
                                       </div>
                                       <div className="h-64 border rounded-xl p-4">
                                          <h4 className="text-sm font-bold text-slate-600 mb-2">Throughput (MB/s)</h4>
                                          <ResponsiveContainer width="100%" height="100%">
                                             <AreaChart data={storageMetrics}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="time" tick={{fontSize: 10}} />
                                                <YAxis tick={{fontSize: 10}} />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="throughput" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                                             </AreaChart>
                                          </ResponsiveContainer>
                                       </div>
                                    </div>
                                 )}

                                 {providerDetailTab === 'backend' && drv.type === 'Ceph' && (
                                    <div className="space-y-4">
                                       <h3 className="font-bold text-slate-800">Ceph Pools</h3>
                                       <table className="w-full text-left text-sm">
                                          <thead className="bg-slate-50 text-slate-500">
                                             <tr>
                                                <th className="px-4 py-2">Pool Name</th>
                                                <th className="px-4 py-2">Type</th>
                                                <th className="px-4 py-2">Replicas</th>
                                                <th className="px-4 py-2">Used</th>
                                             </tr>
                                          </thead>
                                          <tbody>
                                             {mockCephPools.map(pool => (
                                                <tr key={pool.name} className="border-b border-slate-50">
                                                   <td className="px-4 py-3 font-medium">{pool.name}</td>
                                                   <td className="px-4 py-3">{pool.type}</td>
                                                   <td className="px-4 py-3">{pool.replicas}</td>
                                                   <td className="px-4 py-3">{pool.used}</td>
                                                </tr>
                                             ))}
                                          </tbody>
                                       </table>
                                    </div>
                                 )}
                              </div>
                           </>
                        );
                     })()}
                  </div>
               )}
            </div>
         )}

         {/* === VIEW: SNAPSHOTS === */}
         {activeView === 'snapshots' && (
            <div className="p-8">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Volume Snapshots</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                     <Plus size={16}/> Create Snapshot
                  </button>
               </div>
               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                           <th className="px-6 py-3">Snapshot Name</th>
                           <th className="px-6 py-3">Source PVC</th>
                           <th className="px-6 py-3">Size</th>
                           <th className="px-6 py-3">Created At</th>
                           <th className="px-6 py-3">Status</th>
                           <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {mockSnapshots.map(snap => (
                           <tr key={snap.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-800">{snap.name}</td>
                              <td className="px-6 py-4 text-slate-600">{snap.sourcePvc}</td>
                              <td className="px-6 py-4">{snap.size}</td>
                              <td className="px-6 py-4 text-slate-500">{snap.createdAt}</td>
                              <td className="px-6 py-4">
                                 <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                    <CheckCircle size={12}/> Ready
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button className="text-blue-600 hover:underline text-xs mr-3">Restore</button>
                                 <button className="text-red-500 hover:underline text-xs">Delete</button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* === VIEW: COSI === */}
         {activeView === 'cosi' && (
            <div className="p-8">
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Cloud className="text-purple-600"/> COSI Object Storage</h3>
                     <p className="text-sm text-slate-500">Container Object Storage Interface (BucketClaims)</p>
                  </div>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                     <Plus size={16}/> Create Bucket
                  </button>
               </div>
               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                           <th className="px-6 py-3">Bucket Claim</th>
                           <th className="px-6 py-3">Bucket Class</th>
                           <th className="px-6 py-3">Protocol</th>
                           <th className="px-6 py-3">Status</th>
                           <th className="px-6 py-3">Access Secret</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {mockBucketClaims.map(bc => (
                           <tr key={bc.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-800">{bc.name}</td>
                              <td className="px-6 py-4 text-slate-600">{bc.bucketClass}</td>
                              <td className="px-6 py-4">{bc.protocol}</td>
                              <td className="px-6 py-4">
                                 <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${bc.status === 'Bound' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {bc.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs">{bc.accessSecret}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* === VIEW: OPERATIONS === */}
         {activeView === 'ops' && (
            <div className="p-8">
               <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Settings className="text-slate-600"/> Storage Operations & Automation</h3>
               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                           <th className="px-6 py-3">Operation Type</th>
                           <th className="px-6 py-3">Target Resource</th>
                           <th className="px-6 py-3">Start Time</th>
                           <th className="px-6 py-3">Status</th>
                           <th className="px-6 py-3">Message</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {mockOperations.map(op => (
                           <tr key={op.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-700">{op.type}</td>
                              <td className="px-6 py-4 text-slate-600">{op.target}</td>
                              <td className="px-6 py-4 text-slate-500">{op.startTime}</td>
                              <td className="px-6 py-4">
                                 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${op.status === 'Completed' ? 'bg-green-100 text-green-700' : op.status === 'Running' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                    {op.status === 'Running' && <RefreshCw size={10} className="animate-spin"/>}
                                    {op.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-slate-600 truncate max-w-xs" title={op.message}>{op.message || '-'}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* --- Expansion Modal --- */}
         {isExpandModalOpen && selectedPvcForExpand && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2"><ArrowUpRight size={18} className="text-blue-600"/> 在线扩容</h3>
                     <button onClick={() => setIsExpandModalOpen(false)}><X size={20} className="text-slate-400"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                     <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100">
                        当前卷 <strong>{selectedPvcForExpand.name}</strong> 容量为 <strong>{selectedPvcForExpand.capacity}</strong>。
                        扩容过程业务无感知，无需重启 Pod。
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">目标容量</label>
                        <input 
                           className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                           placeholder="e.g. 200Gi"
                           value={expandSize}
                           onChange={e => setExpandSize(e.target.value)}
                        />
                     </div>
                  </div>
                  <div className="px-6 py-4 bg-slate-50 flex justify-end gap-2 border-t border-slate-100">
                     <button onClick={() => setIsExpandModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm hover:bg-white rounded-lg">取消</button>
                     <button onClick={handleExpandSubmit} className="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 rounded-lg flex items-center gap-2">
                        <CheckCircle size={16}/> 确认扩容
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* --- Deploy CSI Driver Modal --- */}
         {isDeployCsiModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                     <div>
                        <h3 className="text-xl font-bold text-slate-800">Deploy CSI Driver</h3>
                        <p className="text-sm text-slate-500 mt-1">Install storage providers to your cluster.</p>
                     </div>
                     <button onClick={() => setIsDeployCsiModalOpen(false)}><X size={24} className="text-slate-400"/></button>
                  </div>
                  <div className="p-8 space-y-6">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Select Driver Type</label>
                        <div className="grid grid-cols-2 gap-4">
                           {['AWS EBS', 'Azure Disk', 'Ceph RBD', 'Topolvm'].map(type => (
                              <div 
                                 key={type}
                                 onClick={() => setDeployDriverForm({...deployDriverForm, type})}
                                 className={`p-4 border rounded-xl cursor-pointer transition-all ${deployDriverForm.type === type ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-300'}`}
                              >
                                 <div className="font-bold text-slate-800">{type}</div>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Namespace</label>
                        <input 
                           className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm"
                           value={deployDriverForm.namespace}
                           onChange={e => setDeployDriverForm({...deployDriverForm, namespace: e.target.value})}
                        />
                     </div>
                     <div className="flex items-center gap-2">
                        <input 
                           type="checkbox"
                           checked={deployDriverForm.autoDiscover}
                           onChange={e => setDeployDriverForm({...deployDriverForm, autoDiscover: e.target.checked})}
                           className="rounded text-blue-600"
                        />
                        <label className="text-sm text-slate-700">Auto-discover existing storage resources</label>
                     </div>
                  </div>
                  <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                     <button onClick={() => setIsDeployCsiModalOpen(false)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                     <button onClick={handleDeployDriver} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2">
                        <Download size={18}/> Deploy Driver
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* --- Create PVC Modal (Existing) --- */}
         {isCreatePvcModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-slate-800">新建存储卷声明 (PVC)</h3>
                   <button onClick={() => setIsCreatePvcModalOpen(false)}><X size={20} className="text-slate-400"/></button>
                </div>
                <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">名称</label>
                      <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newPvc.name || ''} onChange={e => setNewPvc({...newPvc, name: e.target.value})} placeholder="my-pvc" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">命名空间</label>
                      <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newPvc.namespace} onChange={e => setNewPvc({...newPvc, namespace: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">StorageClass</label>
                        <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                          value={newPvc.storageClass} onChange={e => setNewPvc({...newPvc, storageClass: e.target.value})}>
                            <option value="default">default</option>
                            <option value="ceph-block">ceph-block</option>
                            <option value="local-path">local-path</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">容量</label>
                        <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                          value={newPvc.capacity} onChange={e => setNewPvc({...newPvc, capacity: e.target.value})} />
                      </div>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">访问模式</label>
                     <div className="flex gap-4">
                        {['RWO', 'RWX', 'ROX'].map(mode => (
                           <label key={mode} className="flex items-center gap-2 text-sm cursor-pointer">
                             <input type="checkbox" checked={newPvc.accessModes?.includes(mode as any)} 
                               onChange={e => {
                                 const modes = newPvc.accessModes || [];
                                 if(e.target.checked) setNewPvc({...newPvc, accessModes: [...modes, mode as any]});
                                 else setNewPvc({...newPvc, accessModes: modes.filter(m => m !== mode)});
                               }}
                             />
                             {mode}
                           </label>
                        ))}
                     </div>
                   </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                   <button onClick={() => setIsCreatePvcModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">取消</button>
                   <button onClick={handleCreatePvc} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium">创建 PVC</button>
                </div>
              </div>
            </div>
         )}

         {/* --- Create SC Modal (Existing) --- */}
         {isCreateScModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                   <h3 className="text-lg font-bold text-slate-800">创建 StorageClass</h3>
                   <button onClick={() => setIsCreateScModalOpen(false)}><X size={20} className="text-slate-400"/></button>
                </div>
                <div className="space-y-4 overflow-y-auto pr-2">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">名称</label>
                      <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newSc.name} onChange={e => setNewSc({...newSc, name: e.target.value})} placeholder="fast-ssd" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Provisioner</label>
                      <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        value={newSc.provisioner} onChange={e => setNewSc({...newSc, provisioner: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reclaim Policy</label>
                        <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                          value={newSc.reclaimPolicy} onChange={e => setNewSc({...newSc, reclaimPolicy: e.target.value as any})}>
                            <option value="Delete">Delete</option>
                            <option value="Retain">Retain</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-6">
                         <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                           <input type="checkbox" checked={newSc.allowExpansion} onChange={e => setNewSc({...newSc, allowExpansion: e.target.checked})} className="rounded text-blue-600"/>
                           Allow Expansion
                         </label>
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-700">Parameters (Dynamic Provisioning)</label>
                        <button onClick={() => setNewSc({...newSc, params: [...newSc.params, {key: '', value: ''}]})} className="text-xs text-blue-600 font-medium">+ Add Param</button>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                         {newSc.params.map((p, idx) => (
                           <div key={idx} className="flex gap-2">
                              <input className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs" placeholder="Key" value={p.key} 
                                onChange={e => {
                                  const list = [...newSc.params]; list[idx].key = e.target.value; setNewSc({...newSc, params: list});
                                }}/>
                              <input className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs" placeholder="Value" value={p.value}
                                onChange={e => {
                                  const list = [...newSc.params]; list[idx].value = e.target.value; setNewSc({...newSc, params: list});
                                }}/>
                              <button onClick={() => {
                                const list = [...newSc.params]; list.splice(idx, 1); setNewSc({...newSc, params: list});
                              }} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                   <button onClick={() => setIsCreateScModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">取消</button>
                   <button onClick={handleCreateSc} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium">创建 StorageClass</button>
                </div>
              </div>
            </div>
         )}
      </div>
    </div>
  );
};
