
import React, { useState } from 'react';
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
  MoreVertical, FileText, Search, Clock, Filter, AlertOctagon, Download, Share2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';

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

const mockDrivers: CsiDriver[] = [
  { id: 'drv-1', name: 'Rook Ceph', type: 'Ceph', status: 'Healthy', version: 'v1.12.5', nodesRegistered: 5, provisioner: 'rook-ceph.rbd.csi.ceph.com', createdAt: '2023-01-10' },
  { id: 'drv-2', name: 'Minio Operator', type: 'Minio', status: 'Healthy', version: 'v5.0.10', nodesRegistered: 5, provisioner: 'minio.csi.io', createdAt: '2023-02-15' },
  { id: 'drv-3', name: 'Topolvm', type: 'Topolvm', status: 'Healthy', version: 'v0.28.0', nodesRegistered: 3, provisioner: 'topolvm.io/lvm', createdAt: '2023-03-10' },
];

const mockSnapshots: VolumeSnapshot[] = [
  { id: 'snap-1', name: 'mysql-backup-daily', namespace: 'default', sourcePvc: 'mysql-data', status: 'Ready', size: '100Gi', createdAt: '2023-10-25 02:00', restoreSize: '100Gi' },
  { id: 'snap-2', name: 'redis-backup-pre-upgrade', namespace: 'default', sourcePvc: 'redis-data', status: 'Ready', size: '20Gi', createdAt: '2023-10-24 15:30', restoreSize: '20Gi' },
];

const mockCephPools: CephPool[] = [
  { name: 'rbd-pool', type: 'Replicated', replicas: 3, pgNum: 128, used: '2.5TB', status: 'Healthy', deviceClass: 'ssd' },
  { name: 'cephfs-data', type: 'ErasureCoded', replicas: 0, pgNum: 64, used: '5.1TB', status: 'Healthy', deviceClass: 'hdd' },
];

const mockCrushMap: CephCrushNode = {
  id: -1, name: 'default', type: 'root', weight: 100, items: [
    { id: -2, name: 'rack01', type: 'rack', weight: 50, items: [
      { id: -3, name: 'host01', type: 'host', weight: 25, items: [
         { id: 0, name: 'osd.0', type: 'osd', weight: 12.5, status: 'up' },
         { id: 1, name: 'osd.1', type: 'osd', weight: 12.5, status: 'up' }
      ]},
      { id: -4, name: 'host02', type: 'host', weight: 25, items: [
         { id: 2, name: 'osd.2', type: 'osd', weight: 12.5, status: 'up' },
         { id: 3, name: 'osd.3', type: 'osd', weight: 12.5, status: 'down' }
      ]}
    ]},
    { id: -5, name: 'rack02', type: 'rack', weight: 50, items: [
      { id: -6, name: 'host03', type: 'host', weight: 25, items: [
         { id: 4, name: 'osd.4', type: 'osd', weight: 12.5, status: 'up' },
         { id: 5, name: 'osd.5', type: 'osd', weight: 12.5, status: 'up' }
      ]}
    ]}
  ]
};

const mockTopolvmNodes: TopolvmNode[] = [
  { name: 'node-1', ip: '10.0.10.101', vgName: 'vg-local', device: '/dev/nvme0n1', total: '1024', used: '240', status: 'Ready' },
  { name: 'node-2', ip: '10.0.10.102', vgName: 'vg-local', device: '/dev/nvme0n1', total: '1024', used: '512', status: 'Ready' },
  { name: 'node-3', ip: '10.0.10.103', vgName: 'vg-local', device: '/dev/nvme0n1', total: '1024', used: '128', status: 'Ready' },
];

const mockTopolvmLvs: TopolvmLogicalVolume[] = [
  { id: 'lv-1', name: 'pvc-1x2y3z', node: 'node-1', size: '20Gi', deviceClass: 'ssd', status: 'Active', pvcRef: 'default/redis-data', createdAt: '2023-10-20' },
  { id: 'lv-2', name: 'pvc-abc123', node: 'node-2', size: '50Gi', deviceClass: 'ssd', status: 'Active', pvcRef: 'prod/mongo-data', createdAt: '2023-10-21' },
];

const mockMinioTenants: MinioTenant[] = [
  { name: 'minio-tenant-1', namespace: 'minio-system', status: 'Healthy', nodes: 4, capacity: '16 TB', used: '4.5 TB', version: 'RELEASE.2023-10-24', pools: 1 },
];

const mockMinioBuckets: MinioBucket[] = [
  { name: 'archive-2023', objects: 15200, size: '4.2 TB', quota: '10 TB', policy: 'Private', createdAt: '2023-01-10', versioning: true, retention: '30d' },
  { name: 'public-assets', objects: 4500, size: '150 GB', quota: '1 TB', policy: 'Public', createdAt: '2023-03-15', versioning: false, retention: 'None' },
];

const mockMinioUsers: MinioUser[] = [
  { accessKey: 'admin-key', policy: 'consoleAdmin', status: 'Active', createdAt: '2023-01-01' },
  { accessKey: 'loki-service', policy: 'readWrite', status: 'Active', createdAt: '2023-05-20' },
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
  // Main View Navigation
  const [activeView, setActiveView] = useState<'dashboard' | 'resources' | 'sc' | 'ceph' | 'topolvm' | 'minio' | 'snapshots' | 'ops'>('dashboard');
  
  // Sub-tabs
  const [resourceTab, setResourceTab] = useState<'pvc' | 'pv'>('pvc');
  const [cephTab, setCephTab] = useState<'overview' | 'pools' | 'crush' | 'monitoring'>('overview');
  const [topolvmTab, setTopolvmTab] = useState<'nodes' | 'lvs'>('nodes');
  const [minioTab, setMinioTab] = useState<'tenants' | 'buckets' | 'users'>('tenants');

  // Data State
  const [pvcs, setPvcs] = useState(initialPVCs);
  const [pvs, setPvs] = useState(initialPVs);
  const [scs, setSCs] = useState(initialSCs);
  const [snapshots, setSnapshots] = useState(mockSnapshots);
  const [minioUsers, setMinioUsers] = useState(mockMinioUsers);

  // Ceph Wizard State
  const [isDeployCephModalOpen, setIsDeployCephModalOpen] = useState(false);
  const [cephWizardStep, setCephWizardStep] = useState(1);

  // Navigation Item Component
  const NavItem = ({ id, label, icon }: { id: typeof activeView, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveView(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
        activeView === id 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  // --- RENDER FUNCTIONS ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Database size={20}/></div>
            <h4 className="font-bold text-slate-700">PVC 总数</h4>
          </div>
          <div className="text-2xl font-bold text-slate-800">{pvcs.length}</div>
          <div className="text-xs text-slate-500 mt-1">Bound: {pvcs.filter(p=>p.status==='Bound').length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><HardDrive size={20}/></div>
            <h4 className="font-bold text-slate-700">存储容量</h4>
          </div>
          <div className="text-2xl font-bold text-slate-800">12.5 TB</div>
          <div className="text-xs text-slate-500 mt-1">Used: 4.2 TB (33%)</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Activity size={20}/></div>
            <h4 className="font-bold text-slate-700">健康状态</h4>
          </div>
          <div className="text-2xl font-bold text-green-600">Healthy</div>
          <div className="text-xs text-slate-500 mt-1">All drivers operational</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><AlertTriangle size={20}/></div>
            <h4 className="font-bold text-slate-700">告警事件</h4>
          </div>
          <div className="text-2xl font-bold text-slate-800">0</div>
          <div className="text-xs text-slate-500 mt-1">Past 24 hours</div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">存储后端状态</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockDrivers.map(driver => (
          <div key={driver.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${driver.type === 'Ceph' ? 'bg-red-50 text-red-600' : driver.type === 'Minio' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                   {driver.type === 'Ceph' ? <HardDrive size={24}/> : driver.type === 'Minio' ? <Cloud size={24}/> : <Server size={24}/>}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{driver.name}</h4>
                  <div className="text-xs text-slate-500">{driver.version}</div>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">{driver.status}</span>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
               <div className="flex justify-between"><span>Provisioner:</span> <span className="font-mono text-xs">{driver.provisioner}</span></div>
               <div className="flex justify-between"><span>Nodes:</span> <span>{driver.nodesRegistered}</span></div>
               <div className="flex justify-between"><span>Created:</span> <span>{driver.createdAt}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 border-b border-slate-200">
          <button onClick={() => setResourceTab('pvc')} className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${resourceTab === 'pvc' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>持久卷声明 (PVC)</button>
          <button onClick={() => setResourceTab('pv')} className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${resourceTab === 'pv' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>持久卷 (PV)</button>
        </div>
        <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700"><Plus size={16}/> 创建 {resourceTab === 'pvc' ? 'PVC' : 'PV'}</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {resourceTab === 'pvc' ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Namespace</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Capacity</th>
                <th className="px-6 py-3">StorageClass</th>
                <th className="px-6 py-3">Usage</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pvcs.map(pvc => (
                <tr key={pvc.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{pvc.name}</td>
                  <td className="px-6 py-4 text-slate-600">{pvc.namespace}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-xs font-medium ${pvc.status === 'Bound' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{pvc.status}</span></td>
                  <td className="px-6 py-4">{pvc.capacity}</td>
                  <td className="px-6 py-4 text-slate-600">{pvc.storageClass}</td>
                  <td className="px-6 py-4 w-32">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{width: `${pvc.usedPercentage}%`}}></div>
                      </div>
                      <span>{pvc.usedPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2 text-slate-400">
                    <button className="hover:text-blue-600"><Edit3 size={16}/></button>
                    <button className="hover:text-red-600"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Capacity</th>
                <th className="px-6 py-3">Access Mode</th>
                <th className="px-6 py-3">Reclaim Policy</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Claim</th>
                <th className="px-6 py-3">StorageClass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pvs.map(pv => (
                <tr key={pv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{pv.name}</td>
                  <td className="px-6 py-4">{pv.capacity}</td>
                  <td className="px-6 py-4">{pv.accessModes.join(', ')}</td>
                  <td className="px-6 py-4 text-slate-600">{pv.reclaimPolicy}</td>
                  <td className="px-6 py-4"><span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">{pv.status}</span></td>
                  <td className="px-6 py-4 text-slate-600">{pv.claimRef}</td>
                  <td className="px-6 py-4 text-slate-600">{pv.storageClass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderStorageClasses = () => (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-center">
         <h3 className="text-lg font-bold text-slate-800">存储类 (StorageClass)</h3>
         <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700"><Plus size={16}/> 创建 StorageClass</button>
       </div>
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
             <tr>
               <th className="px-6 py-3">Name</th>
               <th className="px-6 py-3">Provisioner</th>
               <th className="px-6 py-3">Reclaim Policy</th>
               <th className="px-6 py-3">Binding Mode</th>
               <th className="px-6 py-3">Expansion</th>
               <th className="px-6 py-3 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {scs.map(sc => (
               <tr key={sc.id} className="hover:bg-slate-50">
                 <td className="px-6 py-4 font-medium text-slate-800">{sc.name}</td>
                 <td className="px-6 py-4 font-mono text-xs text-slate-600">{sc.provisioner}</td>
                 <td className="px-6 py-4 text-slate-600">{sc.reclaimPolicy}</td>
                 <td className="px-6 py-4 text-slate-600">{sc.volumeBindingMode}</td>
                 <td className="px-6 py-4 text-slate-600">{sc.allowVolumeExpansion ? 'True' : 'False'}</td>
                 <td className="px-6 py-4 text-right flex justify-end gap-2 text-slate-400">
                    <button className="hover:text-blue-600"><Settings size={16}/></button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );

  const renderCeph = () => (
    <div className="space-y-6 animate-in fade-in">
       {/* Ceph Header */}
       <div className="flex justify-between items-center">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><HardDrive className="text-red-600"/> Ceph 分布式存储</h3>
         <div className="flex gap-2">
            <button onClick={() => setCephTab('overview')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${cephTab==='overview' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>总览</button>
            <button onClick={() => setCephTab('pools')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${cephTab==='pools' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>存储池</button>
            <button onClick={() => setCephTab('crush')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${cephTab==='crush' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>CRUSH Map</button>
            <button onClick={() => setCephTab('monitoring')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${cephTab==='monitoring' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>监控</button>
            <button onClick={() => setIsDeployCephModalOpen(true)} className="ml-2 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-red-700"><Plus size={16}/> 部署向导</button>
         </div>
       </div>

       {/* Ceph Content */}
       {cephTab === 'overview' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h4 className="text-sm font-bold text-slate-500 uppercase">Cluster Status</h4>
               <div className="text-3xl font-bold text-green-600 mt-2 flex items-center gap-2"><CheckCircle size={28}/> HEALTH_OK</div>
               <div className="mt-4 text-sm text-slate-600 space-y-1">
                 <div className="flex justify-between"><span>Monitors:</span> <span>3/3 Quorum</span></div>
                 <div className="flex justify-between"><span>OSDs:</span> <span>6/6 Up, 6 In</span></div>
                 <div className="flex justify-between"><span>MGRs:</span> <span>Active</span></div>
               </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h4 className="text-sm font-bold text-slate-500 uppercase">Capacity Usage</h4>
               <div className="h-32 mt-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name: 'Raw', used: 35, available: 65}]} layout="vertical">
                       <XAxis type="number" hide />
                       <YAxis type="category" dataKey="name" hide />
                       <Tooltip />
                       <Bar dataKey="used" stackId="a" fill="#ef4444" radius={[4,0,0,4]} />
                       <Bar dataKey="available" stackId="a" fill="#e2e8f0" radius={[0,4,4,0]} />
                    </BarChart>
                 </ResponsiveContainer>
               </div>
               <div className="flex justify-between text-sm text-slate-600 mt-2">
                  <span>Used: 7.6 TB</span>
                  <span>Total: 20 TB</span>
               </div>
            </div>
         </div>
       )}

       {cephTab === 'pools' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-medium">
                 <tr>
                    <th className="px-6 py-3">Pool Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Replica / EC</th>
                    <th className="px-6 py-3">PG Num</th>
                    <th className="px-6 py-3">Usage</th>
                    <th className="px-6 py-3">Device Class</th>
                    <th className="px-6 py-3">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {mockCephPools.map((pool, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                       <td className="px-6 py-4 font-bold text-slate-700">{pool.name}</td>
                       <td className="px-6 py-4 text-slate-600">{pool.type}</td>
                       <td className="px-6 py-4">{pool.type === 'Replicated' ? `Size: ${pool.replicas}` : 'EC 4+2'}</td>
                       <td className="px-6 py-4">{pool.pgNum}</td>
                       <td className="px-6 py-4">{pool.used}</td>
                       <td className="px-6 py-4"><span className="uppercase text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{pool.deviceClass}</span></td>
                       <td className="px-6 py-4"><span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">{pool.status}</span></td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>
       )}

      {cephTab === 'crush' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
             <h4 className="font-bold text-slate-700">CRUSH Map Topology</h4>
             <button className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-200">Rebalance / Optimize</button>
          </div>
          <div className="flex flex-col items-center">
            {/* Root */}
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 min-w-[120px] text-center mb-8 relative">
              <div className="font-bold text-slate-800">{mockCrushMap.name}</div>
              <div className="text-xs text-slate-500">{mockCrushMap.type} (w:{mockCrushMap.weight})</div>
              <div className="absolute -bottom-8 left-1/2 w-px h-8 bg-slate-300"></div>
            </div>

            {/* Racks */}
            <div className="flex gap-12 relative">
               <div className="absolute -top-8 left-0 right-0 h-px bg-slate-300 mx-auto w-[50%]"></div>
               {mockCrushMap.items?.map((rack) => (
                 <div key={rack.id} className="flex flex-col items-center">
                    <div className="absolute -top-8 w-px h-8 bg-slate-300"></div>
                    <div className="border border-slate-300 rounded-lg p-3 bg-white min-w-[120px] text-center mb-8 relative z-10">
                      <div className="font-bold text-slate-800">{rack.name}</div>
                      <div className="text-xs text-slate-500">{rack.type} (w:{rack.weight})</div>
                      <div className="absolute -bottom-8 left-1/2 w-px h-8 bg-slate-300"></div>
                    </div>
                    
                    {/* Hosts */}
                    <div className="flex gap-4 relative">
                      <div className="absolute -top-8 left-0 right-0 h-px bg-slate-300 mx-auto w-[80%]"></div>
                      {rack.items?.map((host) => (
                        <div key={host.id} className="flex flex-col items-center relative">
                          <div className="absolute -top-8 w-px h-8 bg-slate-300"></div>
                          <div className="border border-slate-300 rounded-lg p-2 bg-slate-50 min-w-[100px] text-center mb-4 z-10">
                             <div className="font-bold text-sm text-slate-800">{host.name}</div>
                             <div className="text-[10px] text-slate-500">{host.type}</div>
                          </div>
                          
                          {/* OSDs */}
                          <div className="grid grid-cols-2 gap-2">
                             {host.items?.map((osd) => (
                               <div key={osd.id} className={`p-2 rounded border text-center text-xs ${osd.status === 'up' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                  <div className="font-mono font-bold">{osd.name}</div>
                                  <div>{osd.status}</div>
                               </div>
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

       {cephTab === 'monitoring' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h4 className="font-bold text-slate-700 mb-4">Performance Metrics (IOPS & Throughput)</h4>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={storageMetrics}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                   <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                   <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip />
                   <Legend />
                   <Area yAxisId="left" type="monotone" dataKey="iops" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" name="IOPS" />
                   <Area yAxisId="right" type="monotone" dataKey="throughput" stroke="#10b981" fillOpacity={0.1} fill="#10b981" name="MB/s" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
       )}
    </div>
  );

  const renderTopolvm = () => (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-center">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Server className="text-green-600"/> Topolvm 本地存储</h3>
         <div className="flex gap-2">
            <button onClick={() => setTopolvmTab('nodes')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${topolvmTab==='nodes' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>节点视图</button>
            <button onClick={() => setTopolvmTab('lvs')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${topolvmTab==='lvs' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>逻辑卷 (LV)</button>
         </div>
       </div>

       {topolvmTab === 'nodes' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                   <tr>
                      <th className="px-6 py-3">Node</th>
                      <th className="px-6 py-3">IP</th>
                      <th className="px-6 py-3">VG Name</th>
                      <th className="px-6 py-3">Device Path</th>
                      <th className="px-6 py-3">Capacity (GB)</th>
                      <th className="px-6 py-3">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {mockTopolvmNodes.map((node, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-bold text-slate-700">{node.name}</td>
                         <td className="px-6 py-4 text-slate-600">{node.ip}</td>
                         <td className="px-6 py-4 font-mono">{node.vgName}</td>
                         <td className="px-6 py-4 font-mono text-slate-500">{node.device}</td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2 w-32">
                               <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{width: `${(parseInt(node.used)/parseInt(node.total))*100}%`}}></div>
                               </div>
                               <span className="text-xs">{node.used}/{node.total}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4"><span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">{node.status}</span></td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       )}

       {topolvmTab === 'lvs' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                   <tr>
                      <th className="px-6 py-3">LV Name</th>
                      <th className="px-6 py-3">Node</th>
                      <th className="px-6 py-3">Size</th>
                      <th className="px-6 py-3">PVC Ref</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {mockTopolvmLvs.map((lv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-mono text-slate-700">{lv.name}</td>
                         <td className="px-6 py-4">{lv.node}</td>
                         <td className="px-6 py-4">{lv.size}</td>
                         <td className="px-6 py-4 text-blue-600">{lv.pvcRef}</td>
                         <td className="px-6 py-4 text-slate-500">{lv.createdAt}</td>
                         <td className="px-6 py-4"><span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">{lv.status}</span></td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       )}
    </div>
  );

  const renderMinio = () => (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-center">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Cloud className="text-pink-600"/> Minio 对象存储</h3>
         <div className="flex gap-2">
            <button onClick={() => setMinioTab('tenants')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${minioTab==='tenants' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>租户管理</button>
            <button onClick={() => setMinioTab('buckets')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${minioTab==='buckets' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>Bucket 管理</button>
            <button onClick={() => setMinioTab('users')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${minioTab==='users' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>用户权限</button>
         </div>
       </div>

       {minioTab === 'tenants' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {mockMinioTenants.map((tenant, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="bg-pink-50 p-3 rounded-lg text-pink-600"><Cloud size={24}/></div>
                         <div>
                            <h4 className="font-bold text-slate-800">{tenant.name}</h4>
                            <div className="text-xs text-slate-500">{tenant.namespace}</div>
                         </div>
                      </div>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{tenant.status}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      <div className="bg-slate-50 p-3 rounded-lg">
                         <div className="text-xs text-slate-500">Total Capacity</div>
                         <div className="font-bold text-slate-800">{tenant.capacity}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                         <div className="text-xs text-slate-500">Nodes / Pools</div>
                         <div className="font-bold text-slate-800">{tenant.nodes} / {tenant.pools}</div>
                      </div>
                   </div>
                   <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                      <span>Ver: {tenant.version}</span>
                      <button className="text-blue-600 hover:underline">管理控制台</button>
                   </div>
                </div>
             ))}
             <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50/30 transition-all cursor-pointer min-h-[200px]">
                <Plus size={32} />
                <span className="mt-2 font-medium">创建新租户</span>
             </div>
          </div>
       )}

       {minioTab === 'buckets' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h4 className="font-bold text-slate-700">Bucket 列表 (minio-tenant-1)</h4>
                <button className="bg-pink-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-pink-700"><Plus size={16}/> 新建 Bucket</button>
             </div>
             <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-500 font-medium border-b border-slate-200">
                   <tr>
                      <th className="px-6 py-3">Bucket Name</th>
                      <th className="px-6 py-3">Objects</th>
                      <th className="px-6 py-3">Size</th>
                      <th className="px-6 py-3">Quota</th>
                      <th className="px-6 py-3">Policy</th>
                      <th className="px-6 py-3">Features</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {mockMinioBuckets.map((bucket, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium text-slate-800">{bucket.name}</td>
                         <td className="px-6 py-4">{bucket.objects.toLocaleString()}</td>
                         <td className="px-6 py-4">{bucket.size}</td>
                         <td className="px-6 py-4">{bucket.quota}</td>
                         <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-xs font-bold ${bucket.policy === 'Public' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{bucket.policy}</span></td>
                         <td className="px-6 py-4 flex gap-1">
                            {bucket.versioning && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-xs border border-blue-100">Ver</span>}
                            {bucket.retention !== 'None' && <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-xs border border-orange-100">Lock</span>}
                         </td>
                         <td className="px-6 py-4 text-right flex justify-end gap-2 text-slate-400">
                           <button className="hover:text-blue-600"><Settings size={16}/></button>
                           <button className="hover:text-red-600"><Trash2 size={16}/></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       )}

       {minioTab === 'users' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h4 className="font-bold text-slate-700">Access Keys & Policy</h4>
                <button 
                  onClick={() => setMinioUsers([...minioUsers, { accessKey: `user-${Date.now()}`, policy: 'readOnly', status: 'Active', createdAt: new Date().toISOString().split('T')[0] }])}
                  className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-900"
                >
                  <Plus size={16}/> 创建 Key
                </button>
             </div>
             <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-500 font-medium border-b border-slate-200">
                   <tr>
                      <th className="px-6 py-3">Access Key</th>
                      <th className="px-6 py-3">Policy</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Created At</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {minioUsers.map((user, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-mono font-bold text-slate-700">{user.accessKey}</td>
                         <td className="px-6 py-4">
                           <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">{user.policy}</span>
                         </td>
                         <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded text-xs font-bold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {user.status}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-slate-500">{user.createdAt}</td>
                         <td className="px-6 py-4 text-right flex justify-end gap-2 text-slate-400">
                           <button className="hover:text-blue-600"><Edit3 size={16}/></button>
                           <button onClick={() => setMinioUsers(minioUsers.filter(u => u.accessKey !== user.accessKey))} className="hover:text-red-600"><Trash2 size={16}/></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       )}
    </div>
  );

  const renderSnapshots = () => (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-center">
         <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Camera size={20}/> 快照与备份</h3>
            <p className="text-sm text-slate-500 mt-1">基于 CSI VolumeSnapshot 的数据保护与恢复。</p>
         </div>
         <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700"><Plus size={16}/> 创建快照</button>
       </div>
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                   <th className="px-6 py-3">Snapshot Name</th>
                   <th className="px-6 py-3">Namespace</th>
                   <th className="px-6 py-3">Source PVC</th>
                   <th className="px-6 py-3">Size</th>
                   <th className="px-6 py-3">Created At</th>
                   <th className="px-6 py-3">Status</th>
                   <th className="px-6 py-3 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {snapshots.map(snap => (
                   <tr key={snap.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-800">{snap.name}</td>
                      <td className="px-6 py-4 text-slate-600">{snap.namespace}</td>
                      <td className="px-6 py-4 text-slate-600">{snap.sourcePvc}</td>
                      <td className="px-6 py-4">{snap.size}</td>
                      <td className="px-6 py-4 text-slate-500">{snap.createdAt}</td>
                      <td className="px-6 py-4"><span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">{snap.status}</span></td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                         <button className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                            <Copy size={14}/> 克隆卷
                         </button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const renderOps = () => (
     <div className="space-y-6 animate-in fade-in">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Monitor size={20} className="text-blue-600"/> 存储运维监控</h3>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                 <h4 className="text-sm font-bold text-slate-500 mb-4">Total IOPS (Cluster Wide)</h4>
                 <div className="h-64 bg-slate-50 rounded-lg border border-slate-100 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={storageMetrics}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                          <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                          <Tooltip />
                          <Line type="monotone" dataKey="iops" stroke="#3b82f6" strokeWidth={2} dot={false}/>
                       </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div>
                 <h4 className="text-sm font-bold text-slate-500 mb-4">Throughput (MB/s)</h4>
                 <div className="h-64 bg-slate-50 rounded-lg border border-slate-100 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={storageMetrics}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                          <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                          <Tooltip />
                          <Line type="monotone" dataKey="throughput" stroke="#10b981" strokeWidth={2} dot={false}/>
                       </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>
     </div>
  );

  // --- CEPH WIZARD (Simplified for brevity) ---
  const renderCephWizard = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[600px] flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="text-xl font-bold text-slate-800">部署 Ceph 分布式存储</h3>
             <button onClick={() => setIsDeployCephModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
          </div>
          <div className="flex-1 p-8 overflow-y-auto">
             <div className="flex gap-4 mb-8">
                {[1,2,3,4].map(s => (
                   <div key={s} className={`flex-1 h-2 rounded-full ${s <= cephWizardStep ? 'bg-red-600' : 'bg-slate-200'}`}></div>
                ))}
             </div>
             <div className="text-center py-10">
                <HardDrive size={64} className="mx-auto text-red-100 mb-4"/>
                <h4 className="text-lg font-bold text-slate-700">Wizard Step {cephWizardStep}</h4>
                <p className="text-slate-500 mt-2">配置节点、磁盘与网络参数...</p>
             </div>
          </div>
          <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
             <button onClick={() => setCephWizardStep(s => Math.max(1, s-1))} disabled={cephWizardStep===1} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600">上一步</button>
             <button onClick={() => {
                if(cephWizardStep < 4) setCephWizardStep(s => s+1);
                else { setIsDeployCephModalOpen(false); alert('部署任务已提交'); }
             }} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{cephWizardStep === 4 ? '开始部署' : '下一步'}</button>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex h-full bg-slate-50/50 -m-8">
      {/* Sub-Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
         <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Core Storage</div>
         <div className="space-y-1">
            <NavItem id="dashboard" label="概览" icon={<LayoutDashboard size={18} />} />
            <NavItem id="resources" label="资源管理 (PV/PVC)" icon={<Database size={18} />} />
            <NavItem id="sc" label="存储类 (SC)" icon={<Layers size={18} />} />
         </div>

         <div className="my-6 border-t border-slate-100"></div>
         <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Storage Providers</div>
         <div className="space-y-1">
            <NavItem id="ceph" label="Rook Ceph" icon={<HardDrive size={18} className="text-red-500" />} />
            <NavItem id="topolvm" label="Topolvm 本地盘" icon={<Server size={18} className="text-green-500" />} />
            <NavItem id="minio" label="Minio 对象存储" icon={<Cloud size={18} className="text-pink-500" />} />
         </div>

         <div className="my-6 border-t border-slate-100"></div>
         <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Data Protection</div>
         <div className="space-y-1">
            <NavItem id="snapshots" label="快照与备份" icon={<Camera size={18} />} />
            <NavItem id="ops" label="监控运维" icon={<Monitor size={18} />} />
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-64px)]">
         {activeView === 'dashboard' && renderDashboard()}
         {activeView === 'resources' && renderResources()}
         {activeView === 'sc' && renderStorageClasses()}
         {activeView === 'ceph' && renderCeph()}
         {activeView === 'topolvm' && renderTopolvm()}
         {activeView === 'minio' && renderMinio()}
         {activeView === 'snapshots' && renderSnapshots()}
         {activeView === 'ops' && renderOps()}
      </div>

      {isDeployCephModalOpen && renderCephWizard()}
    </div>
  );
};
