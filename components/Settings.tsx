
import React, { useState } from 'react';
import { Project, ProjectMember, ProjectNamespace } from '../types';
import { 
  Briefcase, Users, Shield, FolderPlus, MoreHorizontal, PieChart, 
  Trash2, Edit, Activity, CheckCircle, AlertTriangle, Layers, 
  Settings as SettingsIcon, Plus, X, ArrowLeft, Save, FileText, 
  Search, Cpu, HardDrive, Database, DollarSign, Download, Lock,
  BarChart2, Zap, History, ChevronRight, TrendingUp, AlertOctagon,
  Scale, Box, Copy, UserPlus, UserMinus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';

const mockProjects: Project[] = [
  { 
    id: 'proj-001', 
    name: 'Mall-Production', 
    description: '核心电商业务生产环境', 
    clusterId: 'cls-1234', 
    status: 'Active', 
    cpuQuota: 32, 
    cpuUsed: 18, 
    memQuota: 64, 
    memUsed: 42,
    storageQuota: 1000,
    storageUsed: 650,
    workloadCount: 24,
    memberCount: 8,
    costMonth: 1250,
    createdAt: '2023-01-15'
  },
  { 
    id: 'proj-002', 
    name: 'Payment-Gateway', 
    description: '支付网关独立隔离环境', 
    clusterId: 'cls-1234', 
    status: 'Active', 
    cpuQuota: 16, 
    cpuUsed: 14, 
    memQuota: 32, 
    memUsed: 28,
    storageQuota: 500,
    storageUsed: 120,
    workloadCount: 12,
    memberCount: 5,
    costMonth: 890,
    createdAt: '2023-03-10'
  },
  { 
    id: 'proj-003', 
    name: 'Dev-Playground', 
    description: '开发人员测试沙箱', 
    clusterId: 'cls-5678', 
    status: 'Inactive', 
    cpuQuota: 8, 
    cpuUsed: 0, 
    memQuota: 16, 
    memUsed: 0,
    storageQuota: 100,
    storageUsed: 5,
    workloadCount: 0,
    memberCount: 15,
    costMonth: 50,
    createdAt: '2023-06-20'
  },
];

const mockMembers: ProjectMember[] = [
  { userId: 'u-001', username: 'admin', role: 'Project Owner', addedAt: '2023-01-15' },
  { userId: 'u-002', username: 'dev-lead', role: 'Project Owner', addedAt: '2023-01-16' },
  { userId: 'u-003', username: 'frontend-dev', role: 'Developer', addedAt: '2023-02-01' },
  { userId: 'u-004', username: 'backend-dev', role: 'Developer', addedAt: '2023-02-05' },
  { userId: 'u-005', username: 'auditor', role: 'Viewer', addedAt: '2023-03-10' },
];

const mockNamespaces: ProjectNamespace[] = [
  { id: 'ns-prod-01', name: 'mall-frontend', status: 'Active', cpuLimit: 4, memLimit: 8, cpuUsed: 2.5, memUsed: 4.1, policyStatus: 'Compliant', createdAt: '2023-01-15' },
  { id: 'ns-prod-02', name: 'mall-backend', status: 'Active', cpuLimit: 8, memLimit: 16, cpuUsed: 6.2, memUsed: 10.5, policyStatus: 'Compliant', createdAt: '2023-01-15' },
  { id: 'ns-prod-03', name: 'mall-data', status: 'Active', cpuLimit: 4, memLimit: 8, cpuUsed: 1.1, memUsed: 3.2, policyStatus: 'NonCompliant', createdAt: '2023-02-20' },
];

const resourceUsageData = [
  { time: 'Mon', cpu: 45, mem: 55 },
  { time: 'Tue', cpu: 52, mem: 58 },
  { time: 'Wed', cpu: 49, mem: 60 },
  { time: 'Thu', cpu: 62, mem: 65 },
  { time: 'Fri', cpu: 58, mem: 62 },
  { time: 'Sat', cpu: 40, mem: 50 },
  { time: 'Sun', cpu: 35, mem: 45 },
];

const workloadDistribution = [
  { name: 'Deployment', value: 15, color: '#3b82f6' },
  { name: 'StatefulSet', value: 5, color: '#8b5cf6' },
  { name: 'CronJob', value: 4, color: '#10b981' },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'users' | 'roles' | 'audit'>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectDetailTab, setProjectDetailTab] = useState<'overview' | 'members' | 'quota' | 'namespaces' | 'optimization'>('overview');

  // Member Management State
  const [members, setMembers] = useState<ProjectMember[]>(mockMembers);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({ username: '', role: 'Developer' as ProjectMember['role'] });

  const handleCreateProject = () => {
    setIsCreateModalOpen(false);
    alert('项目创建成功！');
  };

  const handleAddMember = () => {
    if (!newMemberForm.username) return;
    const newMember: ProjectMember = {
      userId: `u-${Date.now()}`,
      username: newMemberForm.username,
      role: newMemberForm.role,
      addedAt: new Date().toISOString().split('T')[0]
    };
    setMembers([...members, newMember]);
    setIsAddMemberModalOpen(false);
    setNewMemberForm({ username: '', role: 'Developer' });
  };

  const handleRemoveMember = (userId: string) => {
    if (window.confirm('确定要移除该成员吗？')) {
      setMembers(members.filter(m => m.userId !== userId));
    }
  };

  const handleRoleChange = (userId: string, newRole: ProjectMember['role']) => {
    setMembers(members.map(m => m.userId === userId ? { ...m, role: newRole } : m));
  };

  // --- Render: Project Details View ---
  if (selectedProject) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedProject(null)}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              {selectedProject.name}
              <span className={`text-sm px-2 py-0.5 rounded-full border ${selectedProject.status === 'Active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                {selectedProject.status}
              </span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">{selectedProject.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 flex gap-6">
          {[
            { id: 'overview', label: '项目总览', icon: <Activity size={16} /> },
            { id: 'members', label: '成员管理', icon: <Users size={16} /> },
            { id: 'quota', label: '配额管理', icon: <PieChart size={16} /> },
            { id: 'namespaces', label: '命名空间', icon: <Layers size={16} /> },
            { id: 'optimization', label: '资源优化', icon: <Zap size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setProjectDetailTab(tab.id as any)}
              className={`pb-3 pt-1 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                projectDetailTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* --- Tab Content --- */}
        <div className="min-h-[500px]">
          
          {/* 1. Overview */}
          {projectDetailTab === 'overview' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Activity size={18}/> 资源消耗趋势 (近7天)</h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={resourceUsageData}>
                               <defs>
                                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                               <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                               <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                               <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="url(#colorCpu)" name="CPU Use %" />
                               <Area type="monotone" dataKey="mem" stroke="#10b981" fillOpacity={0} strokeWidth={2} name="Mem Use %" />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <h4 className="text-sm font-medium text-slate-500 mb-2">本月预估成本</h4>
                         <div className="text-2xl font-bold text-slate-800 flex items-center gap-1">
                            <DollarSign size={20} className="text-green-600"/> {selectedProject.costMonth.toLocaleString()}
                         </div>
                         <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp size={12}/> 环比上月 +5%</p>
                      </div>
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <h4 className="text-sm font-medium text-slate-500 mb-2">工作负载总数</h4>
                         <div className="text-2xl font-bold text-slate-800 flex items-center gap-1">
                            <Box size={20} className="text-blue-600"/> {selectedProject.workloadCount}
                         </div>
                         <p className="text-xs text-slate-400 mt-1">Pods: 142 Running</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><PieChart size={18}/> 负载类型分布</h3>
                      <div className="h-48">
                         <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                               <Pie data={workloadDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                                  {workloadDistribution.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                               </Pie>
                               <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{fontSize: '12px'}}/>
                               <Tooltip />
                            </RePieChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   
                   <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-blue-800 mb-2 text-sm">集群信息</h4>
                      <div className="text-sm text-blue-700 space-y-2">
                         <div className="flex justify-between"><span>Cluster ID:</span> <span className="font-mono">{selectedProject.clusterId}</span></div>
                         <div className="flex justify-between"><span>Region:</span> <span>ap-northeast-1</span></div>
                         <div className="flex justify-between"><span>K8s Ver:</span> <span>v1.28.2</span></div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* 2. Members Management */}
          {projectDetailTab === 'members' && (
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <h3 className="font-bold text-slate-700">项目成员列表</h3>
                   <div className="flex gap-2">
                      <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                         <Search size={16} /> 搜索成员
                      </button>
                      <button 
                         onClick={() => setIsAddMemberModalOpen(true)}
                         className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                         <UserPlus size={16} /> 添加成员
                      </button>
                   </div>
                </div>
                <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                         <th className="px-6 py-3">用户名</th>
                         <th className="px-6 py-3">角色权限</th>
                         <th className="px-6 py-3">加入时间</th>
                         <th className="px-6 py-3 text-right">操作</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {members.map(member => (
                         <tr key={member.userId} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                     {member.username.substring(0,2).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-slate-800">{member.username}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <select 
                                 className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer hover:bg-slate-100 rounded px-2 py-1"
                                 value={member.role}
                                 onChange={(e) => handleRoleChange(member.userId, e.target.value as any)}
                               >
                                 <option value="Project Owner">Project Owner (管理员)</option>
                                 <option value="Developer">Developer (开发者)</option>
                                 <option value="Viewer">Viewer (访客)</option>
                               </select>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{member.addedAt}</td>
                            <td className="px-6 py-4 text-right">
                               <button 
                                 onClick={() => handleRemoveMember(member.userId)}
                                 className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                 title="移除成员"
                               >
                                  <UserMinus size={18} />
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}

          {/* 3. Quota Management */}
          {projectDetailTab === 'quota' && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {/* CPU Quota */}
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Cpu size={20}/></div>
                            <h4 className="font-bold text-slate-800">CPU 配额</h4>
                         </div>
                         <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Limit</span>
                      </div>
                      <div className="text-3xl font-bold text-slate-800 mb-1">{selectedProject.cpuUsed} <span className="text-sm text-slate-400 font-normal">/ {selectedProject.cpuQuota} Cores</span></div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
                         <div className="bg-blue-500 h-full" style={{width: `${(selectedProject.cpuUsed/selectedProject.cpuQuota)*100}%`}}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">使用率 {Math.round((selectedProject.cpuUsed/selectedProject.cpuQuota)*100)}%</p>
                   </div>

                   {/* Memory Quota */}
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity size={20}/></div>
                            <h4 className="font-bold text-slate-800">内存配额</h4>
                         </div>
                         <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Limit</span>
                      </div>
                      <div className="text-3xl font-bold text-slate-800 mb-1">{selectedProject.memUsed} <span className="text-sm text-slate-400 font-normal">/ {selectedProject.memQuota} GiB</span></div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
                         <div className="bg-purple-500 h-full" style={{width: `${(selectedProject.memUsed/selectedProject.memQuota)*100}%`}}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">使用率 {Math.round((selectedProject.memUsed/selectedProject.memQuota)*100)}%</p>
                   </div>

                   {/* Storage Quota */}
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><HardDrive size={20}/></div>
                            <h4 className="font-bold text-slate-800">存储配额</h4>
                         </div>
                         <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">PVC</span>
                      </div>
                      <div className="text-3xl font-bold text-slate-800 mb-1">{selectedProject.storageUsed} <span className="text-sm text-slate-400 font-normal">/ {selectedProject.storageQuota} GiB</span></div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
                         <div className="bg-orange-500 h-full" style={{width: `${(selectedProject.storageUsed/selectedProject.storageQuota)*100}%`}}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">使用率 {Math.round((selectedProject.storageUsed/selectedProject.storageQuota)*100)}%</p>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                   <div>
                      <h4 className="font-bold text-slate-800 mb-1">申请配额调整</h4>
                      <p className="text-sm text-slate-500">如需更多资源，请发起工单申请，审批通过后自动生效。</p>
                   </div>
                   <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">调整配额</button>
                </div>
             </div>
          )}

          {/* 4. Namespaces */}
          {projectDetailTab === 'namespaces' && (
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <h3 className="font-bold text-slate-700">项目命名空间</h3>
                   <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                      <FolderPlus size={16} /> 新建 Namespace
                   </button>
                </div>
                <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                         <th className="px-6 py-3">名称</th>
                         <th className="px-6 py-3">状态</th>
                         <th className="px-6 py-3">配额使用 (CPU/Mem)</th>
                         <th className="px-6 py-3">安全合规</th>
                         <th className="px-6 py-3">创建时间</th>
                         <th className="px-6 py-3 text-right">操作</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {mockNamespaces.map(ns => (
                         <tr key={ns.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-800">{ns.name}</td>
                            <td className="px-6 py-4">
                               <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                               </span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="w-32 space-y-1">
                                  <div className="flex justify-between text-xs text-slate-500">
                                     <span>CPU</span>
                                     <span>{Math.round((ns.cpuUsed/ns.cpuLimit)*100)}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-1 rounded-full"><div className="bg-blue-500 h-full rounded-full" style={{width: `${(ns.cpuUsed/ns.cpuLimit)*100}%`}}></div></div>
                                  <div className="flex justify-between text-xs text-slate-500 pt-1">
                                     <span>Mem</span>
                                     <span>{Math.round((ns.memUsed/ns.memLimit)*100)}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-1 rounded-full"><div className="bg-purple-500 h-full rounded-full" style={{width: `${(ns.memUsed/ns.memLimit)*100}%`}}></div></div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               {ns.policyStatus === 'Compliant' ? (
                                  <span className="text-green-600 flex items-center gap-1 text-xs font-medium"><CheckCircle size={14}/> 合规</span>
                               ) : (
                                  <span className="text-red-500 flex items-center gap-1 text-xs font-medium"><AlertOctagon size={14}/> 风险</span>
                               )}
                            </td>
                            <td className="px-6 py-4 text-slate-500">{ns.createdAt}</td>
                            <td className="px-6 py-4 text-right">
                               <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18}/></button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}

          {/* 5. Optimization */}
          {projectDetailTab === 'optimization' && (
             <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
                   <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Zap size={20}/></div>
                   <div>
                      <h4 className="font-bold text-purple-900">AI 智能建议</h4>
                      <p className="text-sm text-purple-800 mt-1">检测到 3 个 Deployment 资源请求过高，建议降低 Request 配额以节省成本。预计每月可节省 $120。</p>
                      <button className="mt-2 text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700">一键优化</button>
                   </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                   <h3 className="font-bold text-slate-700 mb-4">闲置资源清理</h3>
                   <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                         <tr>
                            <th className="px-4 py-2">资源类型</th>
                            <th className="px-4 py-2">名称</th>
                            <th className="px-4 py-2">闲置时长</th>
                            <th className="px-4 py-2">建议</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         <tr>
                            <td className="px-4 py-3">ConfigMap</td>
                            <td className="px-4 py-3">old-config-v1</td>
                            <td className="px-4 py-3">30 天</td>
                            <td className="px-4 py-3 text-red-500 cursor-pointer hover:underline">删除</td>
                         </tr>
                         <tr>
                            <td className="px-4 py-3">Secret</td>
                            <td className="px-4 py-3">unused-key</td>
                            <td className="px-4 py-3">45 天</td>
                            <td className="px-4 py-3 text-red-500 cursor-pointer hover:underline">删除</td>
                         </tr>
                      </tbody>
                   </table>
                </div>
             </div>
          )}
        </div>

        {/* --- Add Member Modal --- */}
        {isAddMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-slate-800">添加项目成员</h3>
                   <button onClick={() => setIsAddMemberModalOpen(false)}><X size={20} className="text-slate-400"/></button>
                </div>
                <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">用户名 / 邮箱</label>
                      <div className="relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                         <input 
                           className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Search user..."
                           value={newMemberForm.username}
                           onChange={e => setNewMemberForm({...newMemberForm, username: e.target.value})}
                         />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">分配角色</label>
                      <div className="grid grid-cols-1 gap-2">
                         {[
                           { role: 'Project Owner', desc: '拥有项目所有权限，包括管理成员和配额' },
                           { role: 'Developer', desc: '可以部署应用、管理配置，但不能修改配额' },
                           { role: 'Viewer', desc: '仅拥有只读权限，无法修改任何资源' }
                         ].map((r) => (
                            <div 
                              key={r.role}
                              onClick={() => setNewMemberForm({...newMemberForm, role: r.role as any})}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${newMemberForm.role === r.role ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                               <div className="font-bold text-sm text-slate-800">{r.role}</div>
                               <div className="text-xs text-slate-500">{r.desc}</div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                   <button onClick={() => setIsAddMemberModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">取消</button>
                   <button onClick={handleAddMember} disabled={!newMemberForm.username} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium disabled:bg-slate-300">确认添加</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // --- Render: Project List View ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">系统设置 / 项目管理</h2>
           <p className="text-slate-500 text-sm mt-1">管理多租户项目、资源配额及访问权限</p>
        </div>
        <button 
           onClick={() => setIsCreateModalOpen(true)}
           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm font-medium shadow-sm"
        >
          <FolderPlus size={18} />
          <span>新建项目</span>
        </button>
      </div>

      <div className="border-b border-slate-200 flex gap-6">
         {[
           { id: 'projects', label: '项目列表', icon: <Briefcase size={16} /> },
           { id: 'users', label: '全局用户', icon: <Users size={16} /> },
           { id: 'roles', label: '角色定义', icon: <Shield size={16} /> },
           { id: 'audit', label: '审计日志', icon: <FileText size={16} /> },
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

      {activeTab === 'projects' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProjects.map(project => (
               <div 
                 key={project.id} 
                 onClick={() => setSelectedProject(project)}
                 className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
               >
                  <div className={`absolute top-0 left-0 w-1 h-full ${project.status === 'Active' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                  <div className="flex justify-between items-start mb-4 pl-2">
                     <div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{project.description}</p>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-xs font-medium ${project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {project.status}
                     </span>
                  </div>

                  <div className="space-y-4 pl-2">
                     <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                           <span>CPU 使用率</span>
                           <span>{Math.round((project.cpuUsed/project.cpuQuota)*100)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-blue-500 h-full rounded-full" style={{width: `${(project.cpuUsed/project.cpuQuota)*100}%`}}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                           <span>内存 使用率</span>
                           <span>{Math.round((project.memUsed/project.memQuota)*100)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-purple-500 h-full rounded-full" style={{width: `${(project.memUsed/project.memQuota)*100}%`}}></div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-6 pl-2 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                     <div className="flex gap-3">
                        <span className="flex items-center gap-1"><Box size={14}/> {project.workloadCount} Apps</span>
                        <span className="flex items-center gap-1"><Users size={14}/> {project.memberCount} Members</span>
                     </div>
                     <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"/>
                  </div>
               </div>
            ))}
            
            <button 
               onClick={() => setIsCreateModalOpen(true)}
               className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all min-h-[220px]"
            >
               <Plus size={48} className="mb-4 opacity-50"/>
               <span className="font-bold">创建新项目</span>
            </button>
         </div>
      )}

      {/* --- Create Project Modal --- */}
      {isCreateModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-xl font-bold text-slate-800">新建项目向导</h3>
                  <button onClick={() => setIsCreateModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
               </div>
               <div className="p-8 space-y-6 overflow-y-auto">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">项目名称</label>
                     <input className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Finance-Prod"/>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                     <textarea className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows={3} placeholder="项目用途及所属部门..."/>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">绑定集群</label>
                        <select className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                           <option>production-k8s</option>
                           <option>staging-k8s</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">管理员</label>
                        <input className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm bg-slate-100 text-slate-500" value="Current User (Admin)" disabled/>
                     </div>
                  </div>
                  <div>
                     <h4 className="font-bold text-sm text-slate-700 mb-3">初始配额设置</h4>
                     <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                           <div className="text-xs text-slate-500 mb-1">CPU Cores</div>
                           <input type="number" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm font-bold" defaultValue={16}/>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                           <div className="text-xs text-slate-500 mb-1">Memory (GiB)</div>
                           <input type="number" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm font-bold" defaultValue={32}/>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                           <div className="text-xs text-slate-500 mb-1">Storage (GiB)</div>
                           <input type="number" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm font-bold" defaultValue={100}/>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors font-medium">取消</button>
                  <button onClick={handleCreateProject} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2">
                     <CheckCircle size={18} /> 创建项目
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
