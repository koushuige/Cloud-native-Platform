
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
  Sun, CheckCircle, Info, ChevronUp, AlertOctagon, Gauge, ShieldX, Scan, Fingerprint as ScanIcon, HardDrive,
  Wand2, Coffee
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart as ReLineChart, Line, BarChart, Bar, Cell, PieChart, Pie, ComposedChart } from 'recharts';

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

// --- Sub Components ---

const SecurityManagement: React.FC = () => {
  const [secTab, setSecTab] = useState<'code' | 'image'>('code');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <div className="flex gap-10 overflow-x-auto">
          {[
            { id: 'code', label: '代码扫描', icon: <Code size={18}/> },
            { id: 'image', label: '镜像扫描', icon: <Scan size={18}/> },
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

  // CI Specific State
  const [isCIWizardOpen, setIsCIWizardOpen] = useState(false);
  const [ciWizardStep, setCiWizardStep] = useState(1);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [ciBuildTool, setCiBuildTool] = useState('Maven');

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

  // --- CI Wizard ---

  const renderCIWizard = () => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl h-[75vh] flex flex-col overflow-hidden border border-white/20">
          <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
             <div className="flex items-center gap-6">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                   <Wand2 size={24}/>
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">创建构建流水线</h3>
                   <div className="flex gap-2 mt-2">
                      {[1, 2, 3].map(s => <div key={s} className={`w-10 h-1 rounded-full ${s <= ciWizardStep ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>)}
                   </div>
                </div>
             </div>
             <button onClick={() => { setIsCIWizardOpen(false); setCiWizardStep(1); }} className="p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all"><X size={28}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-12 bg-slate-50/30">
             {ciWizardStep === 1 && (
                <div className="max-w-2xl mx-auto space-y-10 animate-in slide-in-from-right-4">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">流水线名称</label>
                      <input className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm" placeholder="e.g. order-service-build" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">所属项目</label>
                      <select className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-100 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat">
                         {mockCodeProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                   </div>
                </div>
             )}
             {ciWizardStep === 2 && (
                <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">绑定源码仓库</label>
                   <div className="grid grid-cols-1 gap-4">
                      {mockCodeProjects[0].repos.map(repo => (
                         <div 
                           key={repo.id} 
                           onClick={() => setSelectedRepoId(repo.id)}
                           className={`p-6 border-2 rounded-3xl cursor-pointer flex items-center justify-between transition-all ${selectedRepoId === repo.id ? 'border-indigo-600 bg-white shadow-xl ring-4 ring-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                         >
                            <div className="flex items-center gap-4">
                               <div className={`p-3 rounded-xl ${selectedRepoId === repo.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}><FileCode size={20}/></div>
                               <div><div className="font-black text-slate-800 text-base">{repo.name}</div><div className="text-xs text-slate-400 font-bold uppercase mt-0.5">Branch: {repo.defaultBranch}</div></div>
                            </div>
                            {selectedRepoId === repo.id && <CheckCircle size={24} className="text-indigo-600"/>}
                         </div>
                      ))}
                   </div>
                </div>
             )}
             {ciWizardStep === 3 && (
                <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-right-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">选择构建模版</label>
                   <div className="grid grid-cols-2 gap-6">
                      {[
                        { id: 'Maven', label: 'Java (Maven)', icon: <Coffee size={24}/>, desc: '标准 Maven 构建并推送至 Harbor' },
                        { id: 'Node', label: 'Node.js (NPM)', icon: <Laptop size={24}/>, desc: 'Web 前端项目构建与镜像打包' },
                        { id: 'Go', label: 'Golang', icon: <Zap size={24}/>, desc: '高性能 Go 服务构建环境' },
                        { id: 'Python', label: 'Python', icon: <FileCode size={24}/>, desc: '自动化脚本与 AI 模型环境' },
                      ].map(tool => (
                         <div 
                           key={tool.id} 
                           onClick={() => setCiBuildTool(tool.id)}
                           className={`p-8 border-2 rounded-[40px] cursor-pointer transition-all ${ciBuildTool === tool.id ? 'border-indigo-600 bg-white shadow-xl ring-4 ring-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                         >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${ciBuildTool === tool.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>{tool.icon}</div>
                            <h5 className="font-black text-slate-800 text-lg">{tool.label}</h5>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{tool.desc}</p>
                         </div>
                      ))}
                   </div>
                </div>
             )}
          </div>

          <div className="px-10 py-8 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
             <button onClick={() => setCiWizardStep(s => Math.max(1, s-1))} className={`font-black text-xs uppercase text-slate-400 hover:text-indigo-600 ${ciWizardStep === 1 ? 'invisible' : ''}`}>上一步</button>
             <div className="flex gap-4">
                <button onClick={() => setIsCIWizardOpen(false)} className="px-10 py-4 border-2 border-slate-100 text-slate-500 rounded-2xl font-black text-sm">取消</button>
                {ciWizardStep < 3 ? (
                   <button onClick={() => setCiWizardStep(s => s + 1)} disabled={ciWizardStep === 2 && !selectedRepoId} className="px-16 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 font-black text-sm transition-all shadow-xl shadow-indigo-100">下一步</button>
                ) : (
                   <button onClick={() => { alert('CI 流水线已成功创建！'); setIsCIWizardOpen(false); }} className="px-16 py-4 bg-slate-900 text-white rounded-2xl hover:bg-black font-black text-sm flex items-center gap-2 shadow-2xl transition-all"><Save size={18}/> 确认并保存</button>
                )}
             </div>
          </div>
       </div>
    </div>
  );

  // --- CD Wizard ---

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
                    <button onClick={() => setCdWizardMode('visual')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${cdWizardMode === 'visual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-50'}`}>GRAPH</button>
                    <button onClick={() => setCdWizardMode('yaml')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${cdWizardMode === 'yaml' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-50'}`}>YAML</button>
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

  // --- Metrics ---
  // Fix: Added missing renderMetrics function to display efficiency metrics and error analysis
  const renderMetrics = () => (
    <div className="space-y-8 animate-in fade-in">
       <div className="flex justify-between items-end px-2">
         <div className="flex gap-10 border-b border-slate-100">
            {[
              { id: 'overview', label: '效能概览' },
              { id: 'dashboard', label: '失败分析' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setMetricsTab(tab.id as any)}
                className={`pb-4 pt-1 px-1 text-sm font-black flex items-center gap-3 border-b-4 transition-all uppercase tracking-widest ${metricsTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
              >
                 {tab.label}
              </button>
            ))}
         </div>
         <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 mb-2">
            {['最近7天', '最近30天'].map(r => (
               <button 
                  key={r}
                  onClick={() => setMetricsTimeRange(r)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${metricsTimeRange === r ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  {r}
               </button>
            ))}
         </div>
       </div>
       {metricsTab === 'overview' ? <MetricsOverview timeRange={metricsTimeRange} /> : <MetricsBoard />}
    </div>
  );

  // --- Artifacts ---
  // Fix: Added missing renderArtifacts function to display the list of generated build artifacts
  const renderArtifacts = () => (
    <div className="space-y-8 animate-in fade-in">
       <div className="flex justify-between items-end px-2">
          <div>
             <h3 className="text-2xl font-black text-slate-800 tracking-tight">制品仓库 (Artifact Hub)</h3>
             <p className="text-xs text-slate-400 font-bold uppercase mt-1">管理容器镜像、Helm Charts 与二进制包。</p>
          </div>
          <div className="flex gap-3">
             <button className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                <Filter size={14}/> 筛选类型
             </button>
             <button className="bg-indigo-600 text-white px-6 py-2 rounded-2xl text-xs font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Plus size={16}/> 导入制品
             </button>
          </div>
       </div>

       <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                <tr>
                   <th className="px-10 py-5">制品名称 / 版本</th>
                   <th className="px-6 py-5">类型</th>
                   <th className="px-6 py-5">存储库地址</th>
                   <th className="px-6 py-5">扫描状态</th>
                   <th className="px-10 py-5 text-right">更新时间</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {mockArtifacts.map(art => (
                   <tr key={art.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                         <div className="font-black text-slate-800">{art.name}</div>
                         <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase font-bold">{art.version}</div>
                      </td>
                      <td className="px-6 py-6">
                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${art.type === 'Image' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{art.type}</span>
                      </td>
                      <td className="px-6 py-6 font-mono text-xs text-slate-500 truncate max-w-[200px]">{art.repo}</td>
                      <td className="px-6 py-6">
                         <div className="flex items-center gap-2 text-emerald-500 font-black text-xs">
                            <ShieldCheck size={14}/> Clean
                         </div>
                      </td>
                      <td className="px-10 py-6 text-right text-xs text-slate-400 font-bold uppercase">{art.time}</td>
                   </tr>
                ))}
             </tbody>
          </table>
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
        <button 
           onClick={() => { setCiWizardStep(1); setIsCIWizardOpen(true); }}
           className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-3 hover:bg-indigo-700 shadow-2xl transition-all active:scale-95"
        >
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
              {/* Left sidebar functionality would be implemented here in renderCodeSidebar */}
           </div>
        )}
        {activeSubView === 'artifacts' && renderArtifacts()}
        {activeSubView === 'metrics' && renderMetrics()}
        {activeSubView === 'security' && <SecurityManagement />}
        {activeSubView === 'cd' && (
           <div className="flex h-full min-h-[600px] -mx-8 bg-slate-50/50">
              {/* CD Sub-Navigation logic */}
           </div>
        )}
      </div>
      {isCDWizardOpen && renderCDWizard()}
      {isCIWizardOpen && renderCIWizard()}
    </div>
  );
};
