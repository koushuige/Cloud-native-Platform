import React, { useState } from 'react';
import { 
  DevOpsPipeline, PipelineStage, PipelineTask, ReleaseOrder, 
  QualityGate, ApprovalNode, GateType, GateMode, ReleaseTrigger,
  CodeProject, CodeRepository, CodeQualityReport, CodeIssue
} from '../types';
import { 
  Play, Rocket, GitBranch, Package, BarChart3, ShieldCheck, Plus, 
  Search, Filter, Clock, CheckCircle2, XCircle, AlertTriangle, 
  ArrowRight, GitCommit, Tag, Activity, MoreVertical, 
  Settings, Box, Terminal, Layers, Trash2, Code, ShieldAlert,
  ChevronRight, LayoutGrid, Monitor, Share2, ClipboardList, TrendingUp,
  Fingerprint, ShieldHalf, Construction, User, Download, X, Save,
  Check, PlayCircle, GitPullRequest, Calendar, Cpu, Database, Split,
  ArrowLeft, RefreshCw, Eye, Shield, UserCheck, MessageSquare, 
  ExternalLink, Zap, MousePointer2, ListFilter, LayoutList, History,
  BookOpen, Fingerprint as AuthIcon, ShieldQuestion, UserPlus, LayoutDashboard,
  Timer, Globe, Network, Sliders, Laptop, Lock, Bell, BellRing, Mail, 
  MessageCircle, Settings2, UserCog, ChevronDown, Gitlab, Github, Bug, 
  FileCode, SearchCode, FileSearch, LineChart, BarChart as BarChartIcon, 
  LayoutTemplate, FileOutput, Copy, Upload, File, GitBranch as BranchIcon,
  Sun, CheckCircle, Info, ChevronUp, AlertOctagon, Gauge, ShieldX, Scan, Fingerprint as ScanIcon, HardDrive
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart as ReLineChart, Line, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

// --- Mock Data for Security ---

const mockSecurityEngines = [
  { id: 'sq', name: 'SonarQube', lang: 'General', type: 'SAST', status: 'Enabled', lastScan: '2h ago', gate: 'Passed' },
  { id: 'gl', name: 'Golangci-lint', lang: 'Golang', type: 'Linter', status: 'Enabled', lastScan: '1d ago', gate: 'Passed' },
  { id: 'sb', name: 'SpotBugs', lang: 'Java', type: 'SAST', status: 'Enabled', lastScan: '3h ago', gate: 'Failed' },
  { id: 'f8', name: 'Flake8', lang: 'Python', type: 'Linter', status: 'Disabled', lastScan: '-', gate: '-' },
];

const mockImageScans = [
  { id: 'img-1', name: 'mall-frontend-ui', tag: 'v1.2.5', status: 'Healthy', critical: 0, high: 2, medium: 15, time: '10-30 15:45' },
  { id: 'img-2', name: 'auth-service-core', tag: 'v2.1.0', status: 'Risk', critical: 2, high: 8, medium: 24, time: '10-30 14:20' },
  { id: 'img-3', name: 'payment-gateway', tag: 'latest', status: 'Healthy', critical: 0, high: 0, medium: 5, time: '10-30 09:00' },
];

const mockVulnerabilities = [
  { id: 'CVE-2023-1234', severity: 'Critical', package: 'openssl', version: '1.1.1t', fixed: '1.1.1u', desc: 'Buffer overflow in SSL handshake' },
  { id: 'CVE-2023-5678', severity: 'High', package: 'libxml2', version: '2.9.10', fixed: '2.9.12', desc: 'Use-after-free in XML parser' },
];

// --- Mock Data for Metrics ---

const mockPipelineTrends = [
  { time: '10/24', success: 42, fail: 2 },
  { time: '10/25', success: 38, fail: 5 },
  { time: '10/26', success: 55, fail: 1 },
  { time: '10/27', success: 48, fail: 3 },
  { time: '10/28', success: 35, fail: 8 },
  { time: '10/29', success: 62, fail: 2 },
  { time: '10/30', success: 58, fail: 4 },
];

const mockAppStatusDistribution = [
  { name: '运行中', value: 15, color: '#10b981' },
  { name: '部署中', value: 4, color: '#3b82f6' },
  { name: '异常', value: 2, color: '#ef4444' },
];

const mockLatestExecutions = [
  { id: 'e-1', name: 'mall-frontend-prod-deploy', status: 'Success', time: '10-30 15:45', duration: '3m 20s' },
  { id: 'e-2', name: 'order-service-ci-pipeline', status: 'Failed', time: '10-30 14:12', duration: '5m 45s' },
  { id: 'e-3', name: 'auth-gateway-test-branch', status: 'Success', time: '10-30 13:05', duration: '2m 15s' },
  { id: 'e-4', name: 'data-sync-job-nightly', status: 'Success', time: '10-30 11:30', duration: '8m 10s' },
  { id: 'e-5', name: 'payment-core-v2-build', status: 'Success', time: '10-30 09:20', duration: '4m 50s' },
];

const mockLatestAppUpdates = [
  { name: 'Mall Frontend', status: 'Running', cluster: 'Prod-HK', ns: 'default', pipeline: 'frontend-deploy', time: '10-30 15:45' },
  { name: 'Order Service', status: 'Updating', cluster: 'Prod-HK', ns: 'order', pipeline: 'order-deploy', time: '10-30 15:30' },
  { name: 'Auth Service', status: 'Running', cluster: 'Prod-SH', ns: 'auth', pipeline: 'auth-ci', time: '10-30 14:20' },
  { name: 'User Center', status: 'Stopped', cluster: 'Staging', ns: 'test', pipeline: 'user-ci', time: '10-29 18:10' },
  { name: 'Payment API', status: 'Running', cluster: 'Prod-HK', ns: 'default', pipeline: 'payment-ci', time: '10-29 16:00' },
];

const mockLatestScans = [
  { repo: 'mall-frontend-ui', score: 'A', status: 'Pass', bugs: 0, vuln: 2, smell: 12, time: '10-30 10:00' },
  { repo: 'auth-service-core', score: 'B', status: 'Warning', bugs: 5, vuln: 0, smell: 45, time: '10-30 09:15' },
  { repo: 'order-api-v2', score: 'A', status: 'Pass', bugs: 2, vuln: 0, smell: 18, time: '10-29 23:40' },
  { repo: 'user-data-processor', score: 'D', status: 'Fail', bugs: 12, vuln: 4, smell: 88, time: '10-29 20:20' },
  { repo: 'payment-gateway', score: 'A', status: 'Pass', bugs: 0, vuln: 0, smell: 5, time: '10-29 15:50' },
];

const mockTopFailedPipelines = [
  { name: 'data-heavy-migration', count: 12, rate: 45 },
  { name: 'legacy-auth-service', count: 8, rate: 30 },
  { name: 'node-exporter-custom', count: 5, rate: 15 },
  { name: 'temp-cleanup-job', count: 4, rate: 10 },
  { name: 'cron-backup-s3', count: 3, rate: 5 },
];

const mockPipelines: DevOpsPipeline[] = [
  { id: 'p-1', name: 'mall-frontend-ci', repo: 'mall-frontend', lastStatus: 'Success', lastRunTime: '2023-10-30 15:45', avgDuration: '3m 20s', successRate: 98 },
  { id: 'p-2', name: 'order-service-ci', repo: 'order-service', lastStatus: 'Failed', lastRunTime: '2023-10-30 14:12', avgDuration: '5m 45s', successRate: 85 },
  { id: 'p-3', name: 'auth-gateway-ci', repo: 'auth-gateway', lastStatus: 'Running', lastRunTime: '2023-10-30 13:05', avgDuration: '2m 15s', successRate: 92 },
];

const mockArtifacts = [
  { id: 'art-1', name: 'mall-frontend', version: 'v1.2.0-build.45', type: 'Image', repo: 'harbor.example.com/prod/frontend', time: '10-30 15:50' },
  { id: 'art-2', name: 'order-service', version: 'v2.1.0-rc.3', type: 'Image', repo: 'harbor.example.com/prod/order', time: '10-30 14:30' },
  { id: 'art-3', name: 'helm-chart-base', version: '1.0.5', type: 'Chart', repo: 'chartmuseum/infra/base', time: '10-29 10:00' },
];

const mockReleaseOrders: ReleaseOrder[] = [
  {
    id: 'ro-1', name: 'Mall Frontend Release', appId: 'Mall Frontend', env: 'Prod', status: 'Running', startTime: '10-30 15:45',
    artifact: { type: 'Image', name: 'mall-frontend', version: 'v1.2.0-build.45', repo: 'harbor.example.com' },
    stages: [
      { id: 's1', name: '环境检查', status: 'Success', tasks: [] },
      { id: 's2', name: '灰度部署', status: 'Running', tasks: [] },
      { id: 's3', name: '全量更新', status: 'Pending', tasks: [] },
    ],
    triggers: []
  },
  {
    id: 'ro-2', name: 'Auth Service Fix', appId: 'Auth Service', env: 'Prod', status: 'Blocked', startTime: '10-30 14:20',
    artifact: { type: 'Image', name: 'auth-service', version: 'v2.1.1-hotfix', repo: 'harbor.example.com' },
    stages: [
      { id: 's1', name: '安全扫描', status: 'Success', tasks: [] },
      { id: 's2', name: '灰度部署', status: 'Blocked', tasks: [] },
    ],
    triggers: []
  }
];

const mockReleaseHistory = [
  { id: 'h-1', appId: 'Mall Frontend', version: 'v1.1.9', status: 'Success', user: 'admin', duration: '5m 10s', time: '2023-10-25 10:00' },
  { id: 'h-2', appId: 'Order Service', version: 'v2.0.5', status: 'Failed', user: 'dev-lead', duration: '2m 45s', time: '2023-10-24 15:30' },
  { id: 'h-3', appId: 'Payment API', version: 'v1.5.0', status: 'Success', user: 'admin', duration: '4m 20s', time: '2023-10-20 09:00' },
];

const mockCodeProjects: CodeProject[] = [
  {
    id: 'prj-001', name: 'Mall-Ecosystem', description: '电商平台核心微服务代码库集成。', cloneHttp: 'http://gitlab.example.com/mall/ecosystem.git', cloneSsh: 'git@gitlab.example.com:mall/ecosystem.git', status: 'Healthy', tool: 'GitLab',
    repos: [
      { 
        id: 'repo-1', name: 'mall-frontend-ui', defaultBranch: 'main', lastCommitMessage: 'feat: add new checkout flow', lastUpdateTime: '2h ago',
        qualityReport: { id: 'qr-1', score: 'A', vulnerabilities: 2, bugs: 0, codeSmells: 12, coverage: 91, duplication: 3, timestamp: '2023-10-30', issues: [
          { id: 'iss-1', severity: 'Major', type: 'CodeSmell', file: 'src/components/Checkout.tsx', line: 45, description: 'Long method detected', ruleId: 'ts-102' }
        ]}
      },
      { id: 'repo-2', name: 'auth-service-core', defaultBranch: 'develop', lastCommitMessage: 'fix: jwt refresh bug', lastUpdateTime: '5h ago' }
    ]
  },
  {
    id: 'prj-002', name: 'Infra-Tools', description: '内部运维自动化与监控工具集。', cloneHttp: 'http://github.com/org/infra.git', cloneSsh: 'git@github.com:org/infra.git', status: 'Healthy', tool: 'GitHub',
    repos: [
      { id: 'repo-3', name: 'node-exporter-custom', defaultBranch: 'master', lastCommitMessage: 'update: add disk io metrics', lastUpdateTime: '1d ago' }
    ]
  }
];

const mockBranches = [
  { name: 'main', isDefault: true, isProtected: true, commitId: 'a7b8c9d0', author: 'admin', updateTime: '2h ago' },
  { name: 'develop', isDefault: false, isProtected: true, commitId: 'e1f2g3h4', author: 'frontend-dev', updateTime: '5h ago' },
  { name: 'feature/new-ui', isDefault: false, isProtected: false, commitId: 'i5j6k7l8', author: 'designer-x', updateTime: '1d ago' },
];

// --- Sub Components ---

const SecurityManagement: React.FC = () => {
  const [secTab, setSecTab] = useState<'code' | 'image'>('code');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <div className="flex gap-10 overflow-x-auto">
          {[
            { id: 'code', label: '代码扫描', icon: <Code size={18}/> },
            { id: 'image', label: '镜像扫描', icon: <ScanIcon size={18}/> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSecTab(tab.id as any)}
              className={`pb-4 pt-1 px-1 text-sm font-black flex items-center gap-3 border-b-4 transition-all uppercase tracking-widest ${
                secTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
           <button className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm text-xs font-black text-indigo-600 hover:bg-slate-50 flex items-center gap-2">
              <Settings size={14}/> 全局策略配置
           </button>
        </div>
      </div>

      {secTab === 'code' ? (
        <div className="space-y-8">
           {/* Code Scanning Engines Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockSecurityEngines.map(engine => (
                <div key={engine.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl ${engine.status === 'Enabled' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                         {engine.id === 'sq' ? <Activity size={24}/> : <Terminal size={24}/>}
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${engine.status === 'Enabled' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                         {engine.status}
                      </div>
                   </div>
                   <h4 className="text-xl font-black text-slate-800">{engine.name}</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{engine.lang} • {engine.type}</p>
                   
                   <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                      <div>
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Quality Gate</div>
                         <div className={`text-sm font-black mt-0.5 ${engine.gate === 'Passed' ? 'text-emerald-500' : engine.gate === 'Failed' ? 'text-red-500' : 'text-slate-400'}`}>
                            {engine.gate}
                         </div>
                      </div>
                      <button className="p-2 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"><Settings size={18}/></button>
                   </div>
                </div>
              ))}
           </div>

           {/* Recent Code Scan List */}
           <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                 <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <ShieldCheck size={24} className="text-indigo-600" /> 代码扫描审计历史
                 </h3>
                 <div className="flex gap-4">
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                       <input placeholder="搜索代码库..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                 </div>
              </div>
              <table className="w-full text-left">
                 <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                    <tr>
                       <th className="px-10 py-5">项目/代码库</th>
                       <th className="px-6 py-5">引擎</th>
                       <th className="px-6 py-5">质量门状态</th>
                       <th className="px-6 py-5">缺陷/漏洞</th>
                       <th className="px-10 py-5 text-right">最后扫描时间</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {mockLatestScans.map(scan => (
                       <tr key={scan.repo} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                          <td className="px-10 py-6 font-black text-slate-700">{scan.repo}</td>
                          <td className="px-6 py-6">
                             <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter">SonarQube</span>
                          </td>
                          <td className="px-6 py-6">
                             <div className={`flex items-center gap-2 font-black text-xs ${scan.status === 'Pass' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {scan.status === 'Pass' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                                {scan.status === 'Pass' ? 'Gate Passed' : 'Gate Failed'}
                             </div>
                          </td>
                          <td className="px-6 py-6">
                             <div className="flex gap-3 text-[10px] font-mono">
                                <span className="text-orange-500 font-black">Bugs: {scan.bugs}</span>
                                <span className="text-red-500 font-black">Vulns: {scan.vuln}</span>
                             </div>
                          </td>
                          <td className="px-10 py-6 text-right text-xs text-slate-400 font-bold uppercase">{scan.time}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      ) : (
        <div className="space-y-8">
           {/* Image Security Summary */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                       <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                          <Package size={24} className="text-pink-500" /> 已扫描镜像列表
                       </h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                       {mockImageScans.map(img => (
                          <div key={img.id} className="px-10 py-8 hover:bg-slate-50/50 transition-colors group flex items-center justify-between">
                             <div className="flex items-center gap-6">
                                <div className={`p-4 rounded-[20px] ${img.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                   <Monitor size={28}/>
                                </div>
                                <div>
                                   <h4 className="text-lg font-black text-slate-800">{img.name} <span className="text-slate-400 text-xs font-mono ml-2">:{img.tag}</span></h4>
                                   <div className="flex items-center gap-4 mt-2">
                                      <div className="flex gap-2">
                                         <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase">Critical: {img.critical}</span>
                                         <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded uppercase">High: {img.high}</span>
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{img.time}</span>
                                   </div>
                                </div>
                             </div>
                             <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-100 opacity-0 group-hover:opacity-100 transition-all">查看漏洞报告</button>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Vulnerability Highlight */}
              <div className="space-y-6">
                 <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[400px]">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    <div>
                       <div className="p-4 bg-white/10 w-fit rounded-2xl mb-8 backdrop-blur-md"><ShieldAlert size={32} className="text-red-400"/></div>
                       <h3 className="text-2xl font-black mb-4">关键漏洞威胁情报</h3>
                       <p className="text-slate-400 text-sm leading-relaxed mb-10">
                          发现 2 个关键 (Critical) CVE 漏洞影响基础架构组件，建议立即执行镜像更新修复。
                       </p>
                       <div className="space-y-4">
                          {mockVulnerabilities.map(v => (
                             <div key={v.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="flex justify-between items-center mb-1">
                                   <span className="text-red-400 font-mono font-black text-xs">{v.id}</span>
                                   <span className="text-[10px] font-black uppercase text-slate-500">{v.severity}</span>
                                </div>
                                <div className="text-xs text-slate-300 font-bold">{v.package} {v.version} &rarr; <span className="text-emerald-400">{v.fixed}</span></div>
                             </div>
                          ))}
                       </div>
                    </div>
                    <button className="mt-10 w-full py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-xl flex items-center justify-center gap-2">
                       批量修复流水线 <ArrowRight size={20}/>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const MetricsOverview: React.FC<{ timeRange: string }> = ({ timeRange }) => {
  const [pipelineRange, setPipelineRange] = useState('7天');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 上层: 流水线效能 & 应用状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. 流水线效能卡片 */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Zap size={20}/></div>
              流水线执行状况
            </h3>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
              {['24小时', '7天', '14天'].map(range => (
                <button
                  key={range}
                  onClick={() => setPipelineRange(range)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${pipelineRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
            {/* 左侧 - 执行状况图表 */}
            <div className="xl:col-span-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={mockPipelineTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold'}} />
                  <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={3} name="执行成功" dot={{r: 4, fill: '#10b981', strokeWidth: 0}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="fail" stroke="#ef4444" strokeWidth={3} name="执行失败" dot={{r: 4, fill: '#ef4444', strokeWidth: 0}} activeDot={{r: 6}} />
                </ReLineChart>
              </ResponsiveContainer>
            </div>

            {/* 右侧 - 关键指标 & 列表 */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">执行总数</div>
                   <div className="text-2xl font-black text-slate-800">285</div>
                   <div className="text-xs text-green-600 mt-1 flex items-center gap-1 font-bold"><ChevronUp size={12}/> 12.5%</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-3xl border border-indigo-100">
                   <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">14天平均耗时</div>
                   <div className="text-2xl font-black text-indigo-700">4m 35s</div>
                   <div className="mt-3">
                      <div className="flex justify-between text-[8px] font-bold text-indigo-400 mb-1 uppercase tracking-tighter">
                        <span>小于平均 (65%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/50 rounded-full overflow-hidden flex">
                        <div className="h-full bg-indigo-500" style={{width: '65%'}}></div>
                      </div>
                   </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">最新执行 Top5</h4>
                <div className="space-y-1.5">
                  {mockLatestExecutions.map(exec => (
                    <div key={exec.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        {exec.status === 'Success' ? <CheckCircle className="text-green-500" size={14}/> : <XCircle className="text-red-500" size={14}/>}
                        <span className="text-xs font-black text-slate-700 group-hover:text-indigo-600 truncate max-w-[120px]">{exec.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                        <span>{exec.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 应用状态卡片 */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 flex flex-col gap-8">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Box size={20}/></div>
            应用状态
          </h3>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
            <div className="xl:col-span-2 flex flex-col items-center justify-center border-r border-slate-50 pr-4">
              <div className="relative w-44 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockAppStatusDistribution}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {mockAppStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-4xl font-black text-slate-800 tracking-tighter">21</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">总数</div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                {mockAppStatusDistribution.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase">{item.name} {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">最新更新 Top5</h4>
              <div className="overflow-hidden rounded-2xl border border-slate-50">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-4 py-2.5">应用</th>
                      <th className="px-4 py-2.5">状态</th>
                      <th className="px-4 py-2.5">集群</th>
                      <th className="px-4 py-2.5 text-right">时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
                    {mockLatestAppUpdates.map(app => (
                      <tr key={app.name} className="hover:bg-slate-50/50 cursor-pointer group">
                        <td className="px-4 py-2.5 text-slate-800 font-black group-hover:text-indigo-600 truncate max-w-[80px]">{app.name}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] ${app.status === 'Running' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-400 truncate max-w-[60px]">{app.cluster}</td>
                        <td className="px-4 py-2.5 text-right text-slate-400 whitespace-nowrap">{app.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下层: 代码质量卡片 */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 flex flex-col gap-10">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><ShieldCheck size={20}/></div>
          代码质量
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* 左侧 - 质量概览 */}
          <div className="lg:col-span-4 flex flex-col justify-center border-r border-slate-50 pr-8">
            <div className="flex items-center gap-10">
              <div className="relative w-36 h-36 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{value: 91}, {value: 9}]}
                      innerRadius={45}
                      outerRadius={65}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <div className="text-3xl font-black text-emerald-600">91%</div>
                   <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">通过率</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1">
                {[
                  { label: '全部仓库', val: 18, color: 'bg-slate-50' },
                  { label: '质量阈-通过', val: 15, color: 'bg-emerald-50' },
                  { label: '质量阈-警告', val: 2, color: 'bg-yellow-50' },
                  { label: '质量阈-失败', val: 1, color: 'bg-red-50' }
                ].map(item => (
                  <div key={item.label} className={`${item.color} rounded-2xl p-4 transition-transform hover:scale-105`}>
                     <div className="text-xl font-black text-slate-800">{item.val}</div>
                     <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-tight">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-start gap-4">
              <Info size={18} className="text-emerald-600 shrink-0 mt-0.5"/>
              <p className="text-[11px] font-bold text-emerald-800 leading-relaxed">
                当前项目代码健康状态良好。共有 1 个仓库未达到质量阈要求，建议优先处理 <span className="underline cursor-pointer">mall-data</span> 的缺陷。
              </p>
            </div>
          </div>

          {/* 右侧 - 最新扫描列表 */}
          <div className="lg:col-span-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex justify-between">
               <span>最新扫描 Top5 仓库</span>
               <button className="text-indigo-600 hover:underline flex items-center gap-1">查看全部报告 <ArrowRight size={12}/></button>
            </h4>
            <div className="overflow-hidden rounded-3xl border border-slate-100">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 text-slate-400 uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">代码仓库分支</th>
                    <th className="px-6 py-4">评分</th>
                    <th className="px-6 py-4 text-center">缺陷/漏洞/异味</th>
                    <th className="px-6 py-4 text-right">扫描时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
                  {mockLatestScans.map(scan => (
                    <tr key={scan.repo} className="hover:bg-slate-50/80 cursor-pointer group">
                      <td className="px-6 py-4 text-slate-800 font-black group-hover:text-indigo-600 flex items-center gap-2">
                         <Gitlab size={14} className="text-orange-500 opacity-50"/>
                         {scan.repo}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                          scan.score === 'A' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {scan.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-[10px]">
                        <span className="text-orange-500">{scan.bugs}</span> / <span className="text-red-500">{scan.vuln}</span> / <span className="text-indigo-500">{scan.smell}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400">{scan.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricsBoard: React.FC = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 失败次数排行 */}
      <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-8">
          <div className="p-2 bg-red-50 text-red-600 rounded-xl"><AlertOctagon size={20}/></div>
          失败次数 Top5 (最近7天)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockTopFailedPipelines} layout="vertical" margin={{left: 40}}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={150} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="count" fill="#ef4444" radius={[0, 8, 8, 0]} barSize={24} name="失败次数" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 高危流水线配置 */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
         <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
         <div>
            <div className="p-3 bg-white/20 w-fit rounded-2xl mb-6 backdrop-blur-md"><Shield size={28}/></div>
            <h3 className="text-2xl font-black mb-3">高危流水线配置</h3>
            <p className="text-indigo-100/80 text-sm leading-relaxed">
               通过设定错误率阈值、单次执行时长阈值等策略，自动标识项目中存在隐患的流水线，督促团队优化构建过程。
            </p>
         </div>
         <button className="mt-10 w-full py-4 bg-white text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-lg flex items-center justify-center gap-2">
            进入策略配置 <ArrowRight size={20}/>
         </button>
      </div>
    </div>

    {/* 列表详情 */}
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
       <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h4 className="font-black text-slate-800 flex items-center gap-2"><ListFilter size={18}/> 监控明细</h4>
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                <input placeholder="搜索流水线..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-200 transition-all"/>
             </div>
          </div>
       </div>
       <table className="w-full text-left text-sm">
          <thead className="bg-white text-slate-400 font-black uppercase tracking-widest text-[10px]">
             <tr>
                <th className="px-8 py-4">流水线名称</th>
                <th className="px-8 py-4">关联仓库</th>
                <th className="px-8 py-4 text-center">当前错误率</th>
                <th className="px-8 py-4 text-center">健康状态</th>
                <th className="px-8 py-4 text-right">操作</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
             {mockTopFailedPipelines.map(item => (
                <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                   <td className="px-8 py-5 text-slate-800 font-black">{item.name}</td>
                   <td className="px-8 py-5 font-mono text-xs text-slate-400">git://corp/infra/{item.name}.git</td>
                   <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                         <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full" style={{width: `${item.rate}%`}}></div>
                         </div>
                         <span className="text-red-500 text-xs w-8">{item.rate}%</span>
                      </div>
                   </td>
                   <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.rate > 40 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                         {item.rate > 40 ? 'High Risk' : 'Warning'}
                      </span>
                   </td>
                   <td className="px-8 py-5 text-right">
                      <button className="text-indigo-600 hover:underline">查看日志</button>
                   </td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  </div>
);

// --- Main Component ---

export const DevOps: React.FC = () => {
  const [activeSubView, setActiveSubView] = useState<'ci' | 'cd' | 'code' | 'artifacts' | 'metrics' | 'security'>('metrics');
  
  // Metrics Local State
  const [metricsTab, setMetricsTab] = useState<'overview' | 'dashboard'>('overview');
  const [metricsTimeRange, setMetricsTimeRange] = useState('最近7天');

  // CD Specific State
  const [cdTab, setCdTab] = useState<'board' | 'history' | 'templates' | 'subscriptions'>('board');
  const [isCDWizardOpen, setIsCDWizardOpen] = useState(false);
  const [cdWizardStep, setCdWizardStep] = useState(1);
  const [cdWizardMode, setCdWizardMode] = useState<'visual' | 'yaml'>('visual');
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [cdStages] = useState<PipelineStage[]>([
    { id: 'stg-1', name: '灰度部署与验证', status: 'Pending', tasks: [{ id: 't-1', name: 'K8s 滚动部署', type: 'Deploy', condition: 'OnSuccess', status: 'Pending' }] }
  ]);
  const [activeTriggers, setActiveTriggers] = useState<string[]>(['Manual']);
  const [concurrency, setConcurrency] = useState(20);
  
  // Code State
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(['prj-001', 'prj-002']));
  const [selectedCodeProject, setSelectedCodeProject] = useState<CodeProject | null>(mockCodeProjects[0]);
  const [selectedCodeRepo, setSelectedCodeRepo] = useState<CodeRepository | null>(mockCodeProjects[0].repos[0]);
  const [repoDetailTab, setRepoDetailTab] = useState<'files' | 'history' | 'branches' | 'quality'>('quality');

  const toggleProject = (e: React.MouseEvent, prjId: string) => {
    e.stopPropagation();
    const next = new Set(expandedProjects);
    if (next.has(prjId)) next.delete(prjId);
    else next.add(prjId);
    setExpandedProjects(next);
  };

  // --- Render Functions ---

  const renderCDWizard = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-[95vw] h-[92vh] flex flex-col overflow-hidden border border-white/20">
         <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
            <div className="flex items-center gap-6">
               <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                  <Rocket size={24}/>
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">发布流程设计向导</h3>
                  <div className="flex items-center gap-4 mt-2">
                     {[1, 2, 3].map(step => (
                        <div key={step} className="flex items-center gap-2">
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${cdWizardStep >= step ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>{step}</div>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${cdWizardStep === step ? 'text-indigo-600' : 'text-slate-400'}`}>
                              {step === 1 ? '选择制品' : step === 2 ? '编排流程' : '触发与策略'}
                           </span>
                           {step < 3 && <div className="w-8 -0.5 bg-slate-100 ml-2"></div>}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-4">
               {cdWizardStep === 2 && (
                  <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex">
                    <button onClick={() => setCdWizardMode('visual')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${cdWizardMode === 'visual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>GRAPH</button>
                    <button onClick={() => setCdWizardMode('yaml')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${cdWizardMode === 'yaml' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>YAML</button>
                  </div>
               )}
               <button onClick={() => setIsCDWizardOpen(false)} className="p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X size={28}/></button>
            </div>
         </div>

         <div className="flex-1 overflow-hidden relative">
            {cdWizardStep === 1 && (
               <div className="h-full flex flex-col p-10 bg-slate-50/50 overflow-y-auto">
                  <div className="max-w-5xl mx-auto w-full space-y-8">
                     <h4 className="text-xl font-black text-slate-800">选择交付物版本</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockArtifacts.map(art => (
                           <div 
                              key={art.id}
                              onClick={() => setSelectedArtifactId(art.id)}
                              className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all group ${selectedArtifactId === art.id ? 'border-indigo-600 bg-white shadow-2xl ring-4 ring-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                           >
                              <div className="flex justify-between items-start mb-6">
                                 <div className={`p-4 rounded-2xl ${art.type === 'Image' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {art.type === 'Image' ? <Monitor size={28}/> : <Package size={28}/>}
                                 </div>
                                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedArtifactId === art.id ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
                                    {selectedArtifactId === art.id && <Check size={14} className="text-white"/>}
                                 </div>
                              </div>
                              <h5 className="font-black text-slate-800 text-lg">{art.name}</h5>
                              <p className="text-sm font-mono text-slate-500 mt-1">{art.version}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {cdWizardStep === 2 && (
               <div className="flex-1 flex h-full overflow-hidden bg-slate-50/30">
                  <div className="w-80 bg-white border-r border-slate-100 p-8 space-y-10 overflow-y-auto shrink-0">
                     <section className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><LayoutGrid size={14}/> 流程模板库</h4>
                        <div className="space-y-3">
                           {['金丝雀发布 (Canary)', '蓝绿部署 (Blue-Green)', '滚动更新 (Rolling)'].map(tpl => (
                              <button key={tpl} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-white transition-all group">
                                 <span className="text-xs font-black text-slate-700">{tpl}</span>
                                 <Plus size={14} className="text-slate-300 group-hover:text-indigo-600"/>
                              </button>
                           ))}
                        </div>
                     </section>
                  </div>
                  <div className="flex-1 p-12 overflow-y-auto relative bg-slate-50/50">
                     {cdWizardMode === 'visual' ? (
                        <div className="max-w-4xl mx-auto space-y-12">
                           {cdStages.map((stage, sIdx) => (
                              <div key={stage.id} className="relative group">
                                 <div className="bg-white border-2 border-slate-100 rounded-[40px] p-8 hover:border-indigo-400 hover:shadow-2xl transition-all shadow-sm">
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-indigo-100">{sIdx + 1}</div>
                                          <div className="text-xl font-black text-slate-800">{stage.name}</div>
                                       </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                       {stage.tasks.map(task => (
                                          <div key={task.id} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 hover:bg-white transition-all">
                                             <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm border border-slate-100"><Box size={20}/></div>
                                                <div>
                                                   <div className="text-sm font-black text-slate-800">{task.name}</div>
                                                   <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{task.type}</div>
                                                </div>
                                             </div>
                                          </div>
                                       ))}
                                       <button className="w-full py-6 border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 hover:border-indigo-200 transition-all font-black text-[10px] uppercase tracking-widest">+ 添加任务节点</button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="bg-[#121212] rounded-[40px] p-10 h-full font-mono text-sm text-emerald-400/90 shadow-2xl overflow-auto">
                           <div className="text-slate-500 mb-6"># Release Pipeline YAML</div>
                           <div>apiVersion: tekton.dev/v1beta1</div>
                           <div>kind: Pipeline</div>
                           <div>metadata:</div>
                           <div className="pl-4">name: mall-release-v1</div>
                           <div>spec:</div>
                           <div className="pl-4">tasks:</div>
                           <div className="pl-8">- name: deploy-k8s</div>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {cdWizardStep === 3 && (
               <div className="h-full flex flex-col p-12 bg-slate-50/50 overflow-y-auto">
                  <div className="max-w-5xl mx-auto w-full space-y-12">
                     <section className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg"><Zap size={20}/></div>
                           <h4 className="text-xl font-black text-slate-800 tracking-tight">发布触发器配置</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {['Manual', 'ImagePush', 'Webhook'].map(t => (
                              <div 
                                 key={t}
                                 onClick={() => setActiveTriggers(prev => prev.includes(t) ? prev.filter(i => i !== t) : [...prev, t])}
                                 className={`p-8 rounded-[40px] border-2 cursor-pointer transition-all ${activeTriggers.includes(t) ? 'border-indigo-600 bg-white shadow-2xl ring-4 ring-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                              >
                                 <h5 className="font-black text-slate-800 text-lg">{t === 'Manual' ? '手动触发' : t === 'ImagePush' ? '镜像仓库触发' : 'Webhook 触发'}</h5>
                                 <p className="text-xs text-slate-400 mt-2">点击选择触发策略</p>
                              </div>
                           ))}
                        </div>
                     </section>

                     <div className="grid grid-cols-2 gap-8">
                        <section className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600"><Bell size={20}/></div>
                              <h4 className="font-black text-slate-800">通知策略</h4>
                           </div>
                           <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
                              <input type="checkbox" className="w-5 h-5 rounded-lg text-indigo-600" defaultChecked />
                              <span className="text-sm font-black text-slate-700">自动订阅我参与的事件</span>
                           </label>
                        </section>
                        <section className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600"><Sliders size={20}/></div>
                              <h4 className="font-black text-slate-800">并发策略</h4>
                           </div>
                           <input type="range" className="w-full h-2 bg-slate-100 rounded-full accent-indigo-600" value={concurrency} onChange={e => setConcurrency(parseInt(e.target.value))}/>
                        </section>
                     </div>
                  </div>
               </div>
            )}
         </div>

         <div className="px-10 py-8 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
            <button onClick={() => setCdWizardStep(s => Math.max(1, s-1))} className={`flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-black text-xs uppercase ${cdWizardStep === 1 ? 'invisible' : ''}`}>
               <ArrowLeft size={16}/> 上一步
            </button>
            <div className="flex gap-4">
               <button onClick={() => setIsCDWizardOpen(false)} className="px-10 py-4 border-2 border-slate-100 text-slate-500 rounded-2xl hover:bg-slate-50 font-black text-sm">取消</button>
               {cdWizardStep < 3 ? (
                  <button 
                     onClick={() => setCdWizardStep(s => s + 1)}
                     disabled={cdWizardStep === 1 && !selectedArtifactId}
                     className="px-12 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 font-black text-sm flex items-center gap-3 transition-all shadow-xl shadow-indigo-100"
                  >
                     下一步 <ChevronRight size={18}/>
                  </button>
               ) : (
                  <button 
                     onClick={() => { alert('发布单已提交执行！'); setIsCDWizardOpen(false); }}
                     className="px-12 py-4 bg-slate-900 text-white rounded-2xl hover:bg-black font-black text-sm flex items-center gap-3 transition-all shadow-xl"
                  >
                     <Save size={20}/> 确认并发布
                  </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );

  const renderCodeSidebar = () => (
    <div className="w-72 bg-white border-r border-slate-100 flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-slate-50">
         <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">工具链项目</div>
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
            <input placeholder="搜索项目..." className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-200 transition-all" />
         </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
         {mockCodeProjects.map(prj => (
            <div key={prj.id} className="space-y-1">
               <button 
                  onClick={() => { setSelectedCodeProject(prj); setSelectedCodeRepo(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-all ${
                     selectedCodeProject?.id === prj.id && !selectedCodeRepo ? 'text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
               >
                  <div className="flex items-center gap-2">
                     <Gitlab size={16} className="text-orange-500" />
                     <span className="truncate">{prj.name}</span>
                  </div>
                  <div onClick={(e) => toggleProject(e, prj.id)} className="p-1 hover:bg-white rounded-lg cursor-pointer">
                     <ChevronDown size={14} className={`transition-transform text-slate-300 ${expandedProjects.has(prj.id) ? '' : '-rotate-90'}`}/>
                  </div>
               </button>
               {expandedProjects.has(prj.id) && (
                  <div className="pl-6 space-y-1 mt-1">
                     {prj.repos.map(repo => (
                        <button
                           key={repo.id}
                           onClick={() => { setSelectedCodeProject(prj); setSelectedCodeRepo(repo); setRepoDetailTab('quality'); }}
                           className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                              selectedCodeRepo?.id === repo.id ? 'text-indigo-600 bg-indigo-50/50 shadow-sm border border-indigo-100/50' : 'text-slate-500 hover:bg-slate-50'
                           }`}
                        >
                           <FileCode size={14} className={selectedCodeRepo?.id === repo.id ? 'text-indigo-500' : 'text-slate-400'}/>
                           <span className="truncate">{repo.name}</span>
                        </button>
                     ))}
                  </div>
               )}
            </div>
         ))}
      </div>
    </div>
  );

  const renderCodeDashboard = () => {
    if (!selectedCodeProject) return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
         <SearchCode size={80} className="opacity-10 mb-4" />
         <p className="font-black uppercase tracking-widest text-sm">选择左侧项目或仓库开始</p>
      </div>
    );

    if (selectedCodeRepo && repoDetailTab === 'quality') {
      const report = selectedCodeRepo.qualityReport || { score: '-', vulnerabilities: 0, bugs: 0, codeSmells: 0, coverage: 0, duplication: 0, issues: [] };
      return (
        <div className="flex-1 flex flex-col h-full bg-slate-50/30 overflow-hidden animate-in fade-in">
          {/* Quality Analysis Header */}
          <div className="px-10 py-8 bg-white border-b border-slate-100 flex justify-between items-end shrink-0">
             <div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                   <span>{selectedCodeProject.name}</span>
                   <ChevronRight size={10} className="opacity-50"/>
                   <span className="text-slate-600">{selectedCodeRepo.name}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                   代码质量全景视图
                   <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title="刷新报告">
                      <RefreshCw size={20}/>
                   </button>
                </h3>
             </div>
             <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200">
                <FileOutput size={16}/> 导出数据
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-10">
             {/* Metric Overview Row */}
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
                {[
                   { label: '漏洞', value: report.vulnerabilities, icon: <ShieldAlert size={24}/>, color: 'red' },
                   { label: '缺陷', value: report.bugs, icon: <Sun size={24}/>, color: 'orange' },
                   { label: '异味', value: report.codeSmells, icon: <Zap size={24}/>, color: 'blue' },
                   { label: '覆盖率', value: `${report.coverage}%`, icon: <Activity size={24}/>, color: 'green' }
                ].map(stat => (
                   <div key={stat.label} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm hover:shadow-xl transition-all flex flex-col items-start">
                      <div className={`p-3 rounded-2xl mb-8 ${
                        stat.color === 'red' ? 'bg-red-50 text-red-500' : 
                        stat.color === 'orange' ? 'bg-orange-50 text-orange-500' : 
                        stat.color === 'blue' ? 'bg-indigo-50 text-indigo-500' : 
                        'bg-emerald-50 text-emerald-500'
                      }`}>
                         {stat.icon}
                      </div>
                      <div className="text-4xl font-black text-slate-800 mb-2">{stat.value}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                   </div>
                ))}
                
                {/* Large Quality Grade Card */}
                <div className="bg-white rounded-[40px] border-2 border-indigo-600 p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
                   <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">质量评分</div>
                   <div className="text-8xl font-black text-indigo-600">{report.score}</div>
                </div>
             </div>

             {/* Detailed Issues Table */}
             <div className="bg-white rounded-[48px] border border-slate-50 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                         <th className="px-12 py-6">级别</th>
                         <th className="px-8 py-6">类型</th>
                         <th className="px-8 py-6">文件</th>
                         <th className="px-8 py-6">描述</th>
                         <th className="px-12 py-6 text-right">操作</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {report.issues.map(issue => (
                         <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-12 py-8">
                               <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                 issue.severity === 'Major' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-indigo-600'
                               }`}>{issue.severity}</span>
                            </td>
                            <td className="px-8 py-8 text-sm font-black text-slate-800">{issue.type}</td>
                            <td className="px-8 py-8 font-mono text-xs text-slate-400">{issue.file}:{issue.line}</td>
                            <td className="px-8 py-8 text-sm font-bold text-slate-600">{issue.description}</td>
                            <td className="px-12 py-8 text-right">
                               <button className="text-indigo-600 text-xs font-black hover:underline ml-auto">查看代码</button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      );
    }

    if (selectedCodeRepo && repoDetailTab === 'branches') {
      const mockBranches = [
        { name: 'main', isDefault: true, isProtected: true, commitId: 'a7b8c9d0', author: 'admin', updateTime: '2h ago' },
        { name: 'develop', isDefault: false, isProtected: true, commitId: 'e1f2g3h4', author: 'frontend-dev', updateTime: '5h ago' },
        { name: 'feature/new-ui', isDefault: false, isProtected: false, commitId: 'i5j6k7l8', author: 'designer-x', updateTime: '1d ago' },
      ];
      return (
        <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden animate-in fade-in">
           <div className="px-10 py-6 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
             <div className="flex items-center gap-4">
                <Gitlab size={24} className="text-orange-500" />
                <h3 className="text-lg font-black text-slate-800 tracking-tight">{selectedCodeRepo.name}</h3>
             </div>
             <button className="bg-white border border-slate-300 text-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
                <Copy size={14}/> 克隆仓库
             </button>
          </div>

          <div className="bg-white px-10 border-b border-slate-200 flex gap-8 shrink-0">
             {[
               { id: 'files', label: '文件' },
               { id: 'history', label: '提交历史' },
               { id: 'branches', label: '分支' },
               { id: 'quality', label: '代码质量分析' }
             ].map(tab => (
                <button
                   key={tab.id}
                   onClick={() => setRepoDetailTab(tab.id as any)}
                   className={`py-3 text-sm font-bold border-b-2 transition-all px-1 ${
                      repoDetailTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                   }`}
                >
                   {tab.label}
                </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-6">
             <div className="flex justify-end items-center gap-3">
                <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-[12px] text-sm font-black flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                   创建新分支
                </button>
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input placeholder="按名称搜索" className="pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-[12px] text-sm focus:ring-2 focus:ring-indigo-500 w-64 outline-none transition-all" />
                </div>
             </div>

             <div className="bg-white rounded-[24px] border border-slate-200 shadow-xl overflow-hidden">
                <div className="divide-y divide-slate-100">
                   {mockBranches.map(branch => (
                      <div key={branch.name} className="px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                         <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                               <BranchIcon size={20} className="text-slate-400" />
                               <span className="font-black text-slate-800 text-base">{branch.name}</span>
                               {branch.isDefault && (
                                  <span className="bg-indigo-600 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">default</span>
                               )}
                               {branch.isProtected && (
                                  <span className="bg-emerald-500 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">protected</span>
                               )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                               <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  <GitCommit size={14} className="text-slate-400" />
                                  <span className="text-indigo-500 font-mono font-black hover:underline cursor-pointer">{branch.commitId}</span>
                               </div>
                               <span className="text-slate-600 font-black flex items-center gap-1.5"><User size={12}/> {branch.author}</span>
                               <span className="flex items-center gap-1.5"><Clock size={12}/> 更新时间 {branch.updateTime}</span>
                            </div>
                         </div>
                         <button className="p-3 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 hover:bg-white rounded-xl transition-all">
                            <MoreVertical size={20} />
                          </button>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-10 overflow-y-auto animate-in fade-in bg-slate-50/50">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="bg-white rounded-[48px] border border-slate-200 p-10 shadow-sm group hover:border-indigo-200 transition-all">
             <div className="flex items-center gap-8 mb-10">
                <div className="p-8 bg-slate-50 text-orange-500 rounded-[36px] group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-inner">
                   <Gitlab size={48} />
                </div>
                <div>
                   <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{selectedCodeProject.name}</h3>
                   <p className="text-slate-500 mt-2 font-bold">{selectedCodeProject.description}</p>
                   <div className="flex items-center gap-4 mt-6">
                      <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${selectedCodeProject.status === 'Healthy' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                         <div className={`w-2 h-2 rounded-full ${selectedCodeProject.status === 'Healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                         集成状态: {selectedCodeProject.status}
                      </span>
                   </div>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-slate-50 rounded-[32px] space-y-3 border border-slate-100">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">克隆地址 (HTTP)</div>
                   <div className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm group/addr">
                      <span className="text-sm font-mono text-slate-600 truncate">{selectedCodeProject.cloneHttp}</span>
                      <Copy size={18} className="text-slate-300 hover:text-indigo-600 cursor-pointer transition-colors group-hover/addr:scale-110"/>
                   </div>
                </div>
             </div>
          </div>
          <div className="space-y-6">
             <h4 className="text-2xl font-black text-slate-800 px-4 tracking-tighter">仓库列表</h4>
             <div className="grid grid-cols-1 gap-4">
                {selectedCodeProject.repos.map(repo => (
                   <div key={repo.id} onClick={() => { setSelectedCodeRepo(repo); setRepoDetailTab('quality'); }} className="bg-white border border-slate-200 rounded-[32px] p-8 hover:border-indigo-400 hover:shadow-2xl transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
                      <div className="flex items-center gap-8">
                         <div className="p-5 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                            <FileCode size={28}/>
                         </div>
                         <div>
                            <h5 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{repo.name}</h5>
                            <div className="text-[11px] font-black text-slate-400 uppercase mt-2 flex items-center gap-4 tracking-widest">
                               <span className="flex items-center gap-1.5"><GitBranch size={14}/> {repo.defaultBranch}</span>
                               <span className="text-slate-200">|</span>
                               <span className="flex items-center gap-1.5"><Clock size={14}/> {repo.lastUpdateTime}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-10 border-l border-slate-100 pl-10">
                         {repo.qualityReport && (
                            <div className="text-center px-6">
                               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">上次评分</div>
                               <div className="text-4xl font-black text-emerald-500 drop-shadow-sm">{repo.qualityReport.score}</div>
                            </div>
                         )}
                         <ChevronRight size={32} className="text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1"/>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderArtifacts = () => (
    <div className="space-y-8 animate-in fade-in">
       <div className="flex justify-between items-end px-2">
          <div>
             <h3 className="text-2xl font-black text-slate-800 tracking-tight">制品中心</h3>
             <p className="text-xs text-slate-400 font-bold uppercase mt-1">管理源码构建、单元测试与镜像打包。</p>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-3 transition-all hover:bg-indigo-700 shadow-xl"><Upload size={18}/> 导入制品</button>
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mockArtifacts.map(art => (
             <div key={art.id} className="bg-white border-2 border-slate-100 rounded-[32px] p-6 hover:shadow-2xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                   <div className={`p-4 rounded-2xl ${art.type === 'Image' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {art.type === 'Image' ? <Monitor size={28}/> : <Package size={28}/>}
                   </div>
                   <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20}/></button>
                </div>
                <h5 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{art.name}</h5>
                <p className="text-sm font-mono text-slate-500 mt-1">{art.version}</p>
                <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   <span className="flex items-center gap-1.5"><Database size={12}/> {art.repo}</span>
                   <span>{art.time}</span>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex justify-between items-center px-2">
          <div className="flex gap-10 overflow-x-auto">
             {[
               { id: 'overview', label: '概览' },
               { id: 'dashboard', label: 'CI看板' },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setMetricsTab(tab.id as any)}
                 className={`pb-4 pt-1 px-1 text-sm font-black flex items-center gap-3 border-b-4 transition-all uppercase tracking-widest ${
                   metricsTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'
                 }`}
               >
                 {tab.label}
               </button>
             ))}
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm text-xs font-black text-slate-600">
                <Calendar size={14} className="text-indigo-500"/>
                <select 
                   value={metricsTimeRange} 
                   onChange={(e) => setMetricsTimeRange(e.target.value)}
                   className="bg-transparent outline-none cursor-pointer"
                >
                   <option>24小时</option>
                   <option>最近7天</option>
                   <option>最近14天</option>
                   <option>最近30天</option>
                </select>
             </div>
          </div>
       </div>

       {metricsTab === 'overview' ? <MetricsOverview timeRange={metricsTimeRange} /> : <MetricsBoard />}
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
       <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800">全量发布历史记录</h3>
          <div className="flex gap-2">
             <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Download size={20}/></button>
          </div>
       </div>
       <table className="w-full text-left">
          <thead>
             <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="px-10 py-5">应用名称</th>
                <th className="px-6 py-5">版本</th>
                <th className="px-6 py-5">状态</th>
                <th className="px-6 py-5">执行人</th>
                <th className="px-6 py-5">总耗时</th>
                <th className="px-10 py-5">完成时间</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
             {mockReleaseHistory.map(h => (
                <tr key={h.id} className="hover:bg-slate-50/50 transition-colors group">
                   <td className="px-10 py-6 font-black text-slate-700">{h.appId}</td>
                   <td className="px-6 py-6 font-mono text-xs text-slate-500">{h.version}</td>
                   <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${h.status === 'Success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${h.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                         {h.status}
                      </span>
                   </td>
                   <td className="px-6 py-6 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-black">{h.user.toUpperCase().substring(0,2)}</div>
                      <span className="text-xs font-bold text-slate-600">{h.user}</span>
                   </td>
                   <td className="px-6 py-6 text-xs text-slate-500">{h.duration}</td>
                   <td className="px-10 py-6 text-xs text-slate-400">{h.time}</td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  );

  const renderCDBoard = () => (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in">
       <div className="flex justify-between items-end mb-4 px-2">
          <div>
             <h3 className="text-xl font-black text-slate-800 tracking-tight">应用发布看板</h3>
             <p className="text-xs text-slate-400 font-bold uppercase mt-1">实时观测各应用环境流转状态及卡点。</p>
          </div>
          <button 
             onClick={() => { setCdWizardStep(1); setIsCDWizardOpen(true); }}
             className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-3 hover:bg-indigo-700 shadow-2xl transition-all"
          >
            <Rocket size={20} /> 新建发布单
          </button>
       </div>
       <div className="space-y-6">
          {mockReleaseOrders.map(order => (
             <div key={order.id} className="bg-white border-2 border-slate-100 rounded-[40px] p-8 hover:shadow-2xl transition-all group overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                   <div className="flex items-center gap-6 min-w-[300px]">
                      <div className={`p-6 rounded-[24px] ${order.status === 'Running' ? 'bg-indigo-50 text-indigo-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                         <Box size={32}/>
                      </div>
                      <div>
                         <h4 className="text-xl font-black text-slate-800">{order.appId}</h4>
                         <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-400 uppercase">
                            <Tag size={14}/> {order.artifact.version}
                            <span className="text-slate-200">|</span>
                            <span>{order.startTime}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex-1 flex items-center gap-3 relative px-10">
                      {order.stages.map((stage, idx) => (
                         <React.Fragment key={stage.id}>
                            <div className="flex flex-col items-center gap-2">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all ${
                                  stage.status === 'Success' ? 'bg-green-50 border-green-500 text-green-600 shadow-lg shadow-green-100' :
                                  stage.status === 'Running' ? 'bg-indigo-50 border-indigo-500 text-indigo-600 animate-bounce' :
                                  stage.status === 'Blocked' ? 'bg-orange-50 border-orange-500 text-orange-600' :
                                  'bg-white border-slate-100 text-slate-300'
                               }`}>
                                  {stage.status === 'Success' ? <Check size={24}/> : <Layers size={24}/>}
                               </div>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate w-20 text-center">{stage.name}</span>
                            </div>
                            {idx < order.stages.length - 1 && <div className="flex-1 h-0.5 bg-slate-100 min-w-[20px]"></div>}
                         </React.Fragment>
                      ))}
                   </div>
                   <div className="flex gap-2">
                      {order.status === 'Blocked' && (
                         <button className="bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-xl hover:bg-orange-700 transition-all flex items-center gap-2">
                            <ShieldAlert size={16}/> 处理风险
                         </button>
                      )}
                      <button className="p-4 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                         <ChevronRight size={24}/>
                      </button>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const renderCI = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end px-2">
        <div>
           <h3 className="text-2xl font-black text-slate-800 tracking-tight">持续构建流水线</h3>
           <p className="text-xs text-slate-400 font-bold uppercase mt-1">管理源码构建、单元测试与镜像打包。</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-3 hover:bg-indigo-700 shadow-2xl transition-all">
          <Plus size={20} /> 创建流水线
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {mockPipelines.map(pipe => (
          <div key={pipe.id} className="bg-white border-2 border-slate-100 rounded-[40px] p-8 hover:shadow-2xl transition-all flex flex-col lg:flex-row lg:items-center justify-between group overflow-hidden">
            <div className="flex items-center gap-8">
              <div className={`p-6 rounded-[24px] ${pipe.lastStatus === 'Success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {pipe.lastStatus === 'Running' ? <RefreshCw className="animate-spin" size={32} /> : <Play size={32}/>}
              </div>
              <div>
                <h4 className="font-black text-xl text-slate-800 flex items-center gap-3">
                  {pipe.name}
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${pipe.lastStatus === 'Success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{pipe.lastStatus}</span>
                </h4>
                <div className="flex gap-4 mt-3 text-xs font-bold text-slate-400 uppercase">
                  <span className="flex items-center gap-1.5"><GitBranch size={14}/> {pipe.repo}</span>
                  <span className="flex items-center gap-1.5"><History size={14}/> 最近运行: {pipe.lastRunTime}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-12 mt-6 lg:mt-0 px-8 border-l border-slate-100">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase font-black mb-1">平均耗时</div>
                <div className="text-lg font-black text-slate-700">{pipe.avgDuration}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase font-black mb-1">成功率</div>
                <div className="text-lg font-black text-green-600">{pipe.successRate}%</div>
              </div>
              <button className="p-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all hover:scale-110 active:scale-95"><PlayCircle size={22} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div>
           <h2 className="text-4xl font-black text-slate-800 tracking-tighter">DevOps 交付中心</h2>
           <p className="text-slate-500 text-sm mt-1 font-medium">集成流水线编排、源码管理与自动化发布。</p>
        </div>
      </div>
      <div className="border-b border-slate-200 flex gap-10 overflow-x-auto px-2">
         {[
           { id: 'ci', label: '持续构建 (CI)', icon: <Play size={18} /> },
           { id: 'cd', label: '持续发布 (CD)', icon: <Rocket size={18} /> },
           { id: 'code', label: '代码管理', icon: <Code size={18} /> },
           { id: 'artifacts', label: '制品管理', icon: <Package size={18} /> },
           { id: 'metrics', label: '效能度量', icon: <BarChart3 size={18} /> },
           { id: 'security', label: '安全管理', icon: <ShieldCheck size={18} /> },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveSubView(tab.id as any)}
             className={`pb-4 pt-1 px-1 text-sm font-black flex items-center gap-3 border-b-4 transition-all uppercase tracking-widest ${
               activeSubView === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'
             }`}
           >
             {tab.icon} {tab.label}
           </button>
         ))}
      </div>
      <div className="py-4">
        {activeSubView === 'ci' && renderCI()}
        {activeSubView === 'code' && (
           <div className="flex h-full min-h-[600px] -mx-8 bg-white/50">
              {renderCodeSidebar()}
              {renderCodeDashboard()}
           </div>
        )}
        {activeSubView === 'artifacts' && renderArtifacts()}
        {activeSubView === 'metrics' && renderMetrics()}
        {activeSubView === 'security' && <SecurityManagement />}
        {activeSubView === 'cd' && (
           <div className="flex h-full min-h-[600px] -mx-8 bg-slate-50/50">
              <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col h-[calc(100vh-280px)] overflow-y-auto shrink-0">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">发布导航</div>
                 <div className="space-y-1">
                    {[
                       { id: 'board', label: '发布看板', icon: <LayoutDashboard size={18}/> },
                       { id: 'history', label: '发布历史', icon: <History size={18}/> },
                       { id: 'subscriptions', label: '订阅设置', icon: <BellRing size={18}/> }
                    ].map(item => (
                       <button
                          key={item.id}
                          onClick={() => setCdTab(item.id as any)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                             cdTab === item.id ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                          }`}
                       >
                          {item.icon} {item.label}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-280px)]">
                 {cdTab === 'board' && renderCDBoard()}
                 {cdTab === 'history' && renderHistory()}
                 {(cdTab !== 'board' && cdTab !== 'history') && (
                    <div className="flex flex-col items-center justify-center py-40 text-slate-300">
                       <Construction size={80} className="opacity-10 mb-4 animate-bounce" />
                       <p className="font-black uppercase text-xs">CD {cdTab} 模块建设中...</p>
                    </div>
                 )}
              </div>
           </div>
        )}
      </div>
      {isCDWizardOpen && renderCDWizard()}
    </div>
  );
};

// --- Local Mini Icons ---
const AvgTimeIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </svg>
);
