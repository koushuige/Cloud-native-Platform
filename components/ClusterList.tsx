
import React, { useState } from 'react';
import { Cluster, ClusterStatus } from '../types';
import { MoreHorizontal, Plus, HardDrive, RefreshCw, ChevronDown, ChevronRight, Server } from 'lucide-react';
import { ClusterInspection } from './ClusterInspection';

interface ClusterListProps {
  clusters: Cluster[];
}

export const ClusterList: React.FC<ClusterListProps> = ({ clusters }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">集群管理</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus size={18} />
          <span>新建集群</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold w-10"></th>
              <th className="px-6 py-4 font-semibold">名称 / ID</th>
              <th className="px-6 py-4 font-semibold">状态</th>
              <th className="px-6 py-4 font-semibold">版本</th>
              <th className="px-6 py-4 font-semibold">节点数</th>
              <th className="px-6 py-4 font-semibold">资源利用率</th>
              <th className="px-6 py-4 font-semibold">提供商</th>
              <th className="px-6 py-4 font-semibold text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {clusters.map((cluster) => (
              <React.Fragment key={cluster.id}>
                <tr 
                  onClick={() => toggleRow(cluster.id)} 
                  className={`transition-colors cursor-pointer ${expandedRows.has(cluster.id) ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-6 py-4 text-slate-400">
                    {expandedRows.has(cluster.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-slate-800">{cluster.name}</div>
                      <div className="text-xs text-slate-400">{cluster.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${cluster.status === ClusterStatus.RUNNING ? 'bg-green-100 text-green-800' : 
                        cluster.status === ClusterStatus.WARNING ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {cluster.status === ClusterStatus.RUNNING && <span className="w-2 h-2 mr-1.5 rounded-full bg-green-500"></span>}
                      {cluster.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{cluster.version}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{cluster.nodes}</td>
                  <td className="px-6 py-4">
                    <div className="w-32 space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>CPU</span>
                        <span>{cluster.cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${cluster.cpuUsage}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    <div className="flex items-center space-x-2">
                       <HardDrive size={16} className="text-slate-400"/>
                       <span>{cluster.provider}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
                {expandedRows.has(cluster.id) && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={8} className="p-0 border-b border-slate-200">
                       <div className="px-6 py-4 bg-slate-50 shadow-inner">
                         <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                           <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Server size={14} className="text-blue-500" />
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">节点列表 (Nodes)</span>
                              </div>
                              <span className="text-xs text-slate-500">{cluster.nodeList?.length || 0} Nodes Online</span>
                           </div>
                           {cluster.nodeList && cluster.nodeList.length > 0 ? (
                             <table className="w-full text-sm">
                               <thead>
                                 <tr className="text-slate-500 border-b border-slate-100 bg-white text-xs uppercase tracking-wider">
                                   <th className="px-4 py-3 font-medium text-left">节点名称</th>
                                   <th className="px-4 py-3 font-medium text-left">IP 地址</th>
                                   <th className="px-4 py-3 font-medium text-left">状态</th>
                                   <th className="px-4 py-3 font-medium text-left">CPU 利用率</th>
                                   <th className="px-4 py-3 font-medium text-left">内存利用率</th>
                                   <th className="px-4 py-3 font-medium text-left">系统镜像</th>
                                 </tr>
                               </thead>
                               <tbody>
                                 {cluster.nodeList.map((node, idx) => (
                                   <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                     <td className="px-4 py-3 font-mono text-slate-700 font-medium">{node.name}</td>
                                     <td className="px-4 py-3 text-slate-600">{node.ip}</td>
                                     <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${node.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                          {node.status}
                                        </span>
                                     </td>
                                     <td className="px-4 py-3 w-48">
                                        <div className="flex items-center gap-3">
                                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                              className={`h-1.5 rounded-full ${node.cpuUsage > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                              style={{ width: `${node.cpuUsage}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-xs text-slate-500 w-8 text-right">{node.cpuUsage}%</span>
                                        </div>
                                     </td>
                                     <td className="px-4 py-3 w-48">
                                        <div className="flex items-center gap-3">
                                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                              className={`h-1.5 rounded-full ${node.memoryUsage > 80 ? 'bg-red-500' : 'bg-purple-500'}`} 
                                              style={{ width: `${node.memoryUsage}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-xs text-slate-500 w-8 text-right">{node.memoryUsage}%</span>
                                        </div>
                                     </td>
                                     <td className="px-4 py-3 text-slate-500">{node.osImage}</td>
                                   </tr>
                                 ))}
                               </tbody>
                             </table>
                           ) : (
                             <div className="p-4 text-center text-slate-400 text-sm">暂无节点信息</div>
                           )}
                         </div>
                       </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Mini Wizards / Quick Actions */}
         <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-2">纳管已有集群</h3>
            <p className="text-indigo-100 text-sm mb-4">通过 Kubeconfig 导入 AWS, GCP 或本地 IDC 集群。</p>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              开始导入
            </button>
         </div>
         <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
             <div className="flex items-center space-x-3 mb-4 text-slate-800">
                <RefreshCw className="text-blue-500" />
                <h3 className="font-bold">集群巡检</h3>
             </div>
             <p className="text-slate-500 text-sm mb-4">上次巡检发现 3 个潜在风险 (证书过期警告)。</p>
             <button 
                onClick={() => setIsInspectionOpen(true)}
                className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
             >
               查看报告 &rarr;
             </button>
         </div>
      </div>

      {/* Inspection Modal */}
      <ClusterInspection isOpen={isInspectionOpen} onClose={() => setIsInspectionOpen(false)} />
    </div>
  );
};
