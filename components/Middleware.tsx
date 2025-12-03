import React, { useState, useEffect, useRef } from 'react';
import { KafkaInstance, KafkaConfigTemplate, KafkaTopic, KafkaUser, KafkaConsumerGroup, KafkaInspectionReport, KafkaConsumerOffset, KafkaLogEntry, KafkaAlertRule, KafkaAlertRecord, KafkaInspectionItem } from '../types';
import { Database, Activity, Settings, BarChart2, Plus, X, Check, Server, HardDrive, Cpu, MoreVertical, Play, Pause, RefreshCw, Trash2, ArrowUpCircle, FileJson, Download, Upload, Copy, Save, ArrowLeft, Users, Layers, ShieldCheck, AlertTriangle, FileText, Search, Clock, CheckSquare, Square, Edit, Edit3, Bell, Eye, ArrowRight, ChevronRight, BellRing, Filter, Calendar, Mail, AlertOctagon, Printer, CloudLightning, Archive, PlayCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

// --- Mock Data Generators ---
const mockTopics: KafkaTopic[] = [
  { name: 'order-events', partitions: 12, replicas: 3, retentionBytes: '100GB', cleanupPolicy: 'delete' },
  { name: 'user-logs', partitions: 6, replicas: 2, retentionBytes: '50GB', cleanupPolicy: 'delete' },
  { name: 'payment-transactions', partitions: 24, replicas: 3, retentionBytes: '500GB', cleanupPolicy: 'compact' },
];

const mockUsers: KafkaUser[] = [
  { username: 'admin-user', mechanism: 'SCRAM-SHA-512', access: 'Full' },
  { username: 'readonly-client', mechanism: 'SCRAM-SHA-256', access: 'Read' },
  { username: 'order-service', mechanism: 'SCRAM-SHA-512', access: 'Write' },
];

const mockConsumerGroups: KafkaConsumerGroup[] = [
  { groupId: 'order-processor-group', state: 'Stable', lag: 124, members: 3, topics: ['order-events'] },
  { groupId: 'log-indexer', state: 'Stable', lag: 0, members: 1, topics: ['user-logs'] },
  { groupId: 'analytics-consumer', state: 'Rebalancing', lag: 4502, members: 0, topics: ['order-events', 'payment-transactions'] },
];

const mockAlertRules: KafkaAlertRule[] = [
  { id: 'rule-01', name: '消息严重堆积', metric: 'Consumer Lag', operator: '>', threshold: 10000, duration: '5m', level: 'Critical', channels: ['Email', 'SMS'], enabled: true, isPreset: true },
  { id: 'rule-02', name: 'Broker 节点下线', metric: 'Active Brokers', operator: '<', threshold: 3, duration: '1m', level: 'Critical', channels: ['DingTalk', 'Webhook'], enabled: true, isPreset: true },
  { id: 'rule-03', name: '副本不同步', metric: 'Under Replicated Partitions', operator: '>', threshold: 0, duration: '10m', level: 'Warning', channels: ['Email'], enabled: true, isPreset: true },
];

const mockAlertHistory: KafkaAlertRecord[] = [
  { id: 'hist-001', ruleName: '消息严重堆积', level: 'Critical', status: 'Firing', triggerTime: '2023-10-25 10:23:00', content: 'Consumer Group "analytics-consumer" lag > 10000 on topic "order-events"' },
  { id: 'hist-002', ruleName: 'Broker 节点下线', level: 'Critical', status: 'Resolved', triggerTime: '2023-10-24 02:00:00', resolveTime: '2023-10-24 02:15:00', content: 'Broker-1 is not reachable' },
  { id: 'hist-003', ruleName: '磁盘使用率过高', level: 'Warning', status: 'Resolved', triggerTime: '2023-10-20 15:30:00', resolveTime: '2023-10-20 16:00:00', content: 'Broker-0 disk usage > 85%' },
];

const mockInspectionItems: KafkaInspectionItem[] = [
  { name: '集群节点健康度', category: 'Availability', status: 'Pass', message: '所有 Broker 节点在线，心跳正常。' },
  { name: '未同步副本 (URP)', category: 'Availability', status: 'Warning', message: '发现 2 个 Partition 存在副本同步延迟。', suggestion: '请检查网络带宽或磁盘 IO 压力。' },
  { name: 'Controller 选举频率', category: 'Availability', status: 'Pass', message: '过去 24 小时未发生 Controller 切换。' },
  { name: 'Topic 配置合规性', category: 'Configuration', status: 'Pass', message: '所有 Topic 均配置了合理的副本因子。' },
  { name: '磁盘空间分布倾斜', category: 'Resource', status: 'Fail', message: 'Broker-2 磁盘使用率比平均值高 40%。', suggestion: '建议执行分区重平衡 (Rebalance) 操作。' },
  { name: '消费组 Dead 状态', category: 'Availability', status: 'Pass', message: '未发现 Dead 状态的消费组。' },
];

// Helper to generate logs
const generateMockLogs = (): KafkaLogEntry[] => {
  const logs: KafkaLogEntry[] = [];
  const levels: KafkaLogEntry['level'][] = ['INFO', 'INFO', 'INFO', 'WARN', 'INFO', 'ERROR', 'INFO'];
  const messages = [
    'Completed load of log properties for topic order-events',
    'Received request for topic partition payment-transactions-2',
    'Connection to node 2 could not be established. Broker may not be available.',
    'Flushing log for order-events-0',
    'Created log for partition user-logs-1 in /var/lib/kafka/data',
    'Error processing request: Request timed out',
    'Auto-tuning of memory buffers completed'
  ];
  
  for (let i = 0; i < 20; i++) {
    logs.push({
      id: `log-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - i * 60000).toISOString().replace('T', ' ').substring(0, 19),
      level: levels[i % levels.length],
      pod: `kafka-broker-${i % 3}`,
      message: messages[i % messages.length]
    });
  }
  return logs;
};

// Helper to generate detailed offsets for a consumer group
const generateMockOffsets = (group: KafkaConsumerGroup): KafkaConsumerOffset[] => {
  const offsets: KafkaConsumerOffset[] = [];
  group.topics.forEach(topic => {
    // Generate 3 partitions per topic for demo
    for (let i = 0; i < 3; i++) {
      const logEndOffset = Math.floor(Math.random() * 1000000) + 50000;
      const currentOffset = group.state === 'Rebalancing' ? logEndOffset - Math.floor(Math.random() * 5000) : logEndOffset - Math.floor(Math.random() * 100);
      const lag = logEndOffset - currentOffset;
      offsets.push({
        topic: topic,
        partition: i,
        currentOffset,
        logEndOffset,
        lag,
        consumerId: group.members > 0 ? `consumer-${group.groupId}-${i}-xyz` : '-',
        clientId: group.members > 0 ? `client-${i}` : '-',
        host: `/192.168.1.${10 + i}`
      });
    }
  });
  return offsets;
};

const mockInspections: KafkaInspectionReport[] = [
  { id: 'insp-20231024', status: 'Warning', score: 85, issuesFound: 2, timestamp: '2023-10-24 10:00:00', items: mockInspectionItems },
  { id: 'insp-20231023', status: 'Pass', score: 98, issuesFound: 0, timestamp: '2023-10-23 10:00:00', items: mockInspectionItems.map(i => ({...i, status: 'Pass'})) },
];

// Comprehensive Monitor Data
const fullMonitorData = [
  { time: '10:00', cpu: 45, memory: 62, disk: 40, bytesIn: 50, bytesOut: 120, reqSec: 2000, latency: 5, queueTime: 2, conn: 150, logSize: 450 },
  { time: '10:05', cpu: 48, memory: 63, disk: 41, bytesIn: 65, bytesOut: 140, reqSec: 2500, latency: 6, queueTime: 3, conn: 165, logSize: 452 },
  { time: '10:10', cpu: 55, memory: 65, disk: 42, bytesIn: 80, bytesOut: 180, reqSec: 3200, latency: 12, queueTime: 8, conn: 180, logSize: 455 },
  { time: '10:15', cpu: 52, memory: 64, disk: 42, bytesIn: 75, bytesOut: 160, reqSec: 2800, latency: 8, queueTime: 4, conn: 175, logSize: 457 },
  { time: '10:20', cpu: 46, memory: 63, disk: 43, bytesIn: 55, bytesOut: 130, reqSec: 2200, latency: 5, queueTime: 2, conn: 160, logSize: 459 },
  { time: '10:25', cpu: 44, memory: 62, disk: 43, bytesIn: 45, bytesOut: 110, reqSec: 1800, latency: 4, queueTime: 1, conn: 155, logSize: 460 },
  { time: '10:30', cpu: 50, memory: 64, disk: 44, bytesIn: 90, bytesOut: 210, reqSec: 3500, latency: 15, queueTime: 10, conn: 190, logSize: 462 },
];

// Initial Mock Data for Instances
const initialKafkaInstances: KafkaInstance[] = [
  { id: 'kafka-prod-01', name: 'trade-events-cluster', version: '3.4.0', topics: 45, partitions: 128, status: 'Running', nodes: 3, memory: '8GB', storage: '500GB', configTemplateId: 'tpl-high-reliable' },
  { id: 'kafka-dev-01', name: 'dev-logs', version: '3.3.1', topics: 12, partitions: 24, status: 'Running', nodes: 1, memory: '4GB', storage: '100GB', configTemplateId: 'tpl-throughput' },
];

// Pre-set Production Templates
const initialTemplates: KafkaConfigTemplate[] = [
  {
    id: 'tpl-throughput',
    name: '高吞吐优化模板 (High Throughput)',
    description: '适用于日志收集、流式计算等对吞吐量要求极高的场景。优化了 batch.size 和 linger.ms。',
    type: 'System',
    updatedAt: '2023-10-01',
    params: {
      'batch.size': '131072',
      'linger.ms': '50',
      'compression.type': 'lz4',
      'acks': '1',
      'log.retention.hours': '72'
    }
  },
  {
    id: 'tpl-latency',
    name: '低延迟优化模板 (Low Latency)',
    description: '适用于实时交易、即时通讯等对延迟敏感的场景。尽可能减少消息在缓冲区的停留。',
    type: 'System',
    updatedAt: '2023-10-01',
    params: {
      'batch.size': '16384',
      'linger.ms': '0',
      'compression.type': 'snappy',
      'acks': '1',
      'socket.send.buffer.bytes': '102400'
    }
  },
  {
    id: 'tpl-high-reliable',
    name: '金融级高可靠模板 (High Reliability)',
    description: '适用于金融账务、核心交易数据。确保数据不丢失，牺牲部分吞吐量以换取数据一致性。',
    type: 'System',
    updatedAt: '2023-10-05',
    params: {
      'acks': 'all',
      'min.insync.replicas': '2',
      'unclean.leader.election.enable': 'false',
      'replication.factor': '3',
      'log.flush.interval.messages': '1000'
    }
  }
];

export const Middleware: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'instances' | 'templates'>('instances');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState('overview'); // overview, topics, users, consumers, monitor, alerts, inspection, logs

  const [instances, setInstances] = useState<KafkaInstance[]>(initialKafkaInstances);
  const [templates, setTemplates] = useState<KafkaConfigTemplate[]>(initialTemplates);
  
  // Topic Management State
  const [topics, setTopics] = useState<KafkaTopic[]>(mockTopics);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicModalMode, setTopicModalMode] = useState<'create' | 'edit' | 'batch-edit'>('create');
  const [currentTopicForm, setCurrentTopicForm] = useState<Partial<KafkaTopic>>({});
  const [isSyncingTopics, setIsSyncingTopics] = useState(false);

  // Consumer Group State
  const [selectedConsumerGroup, setSelectedConsumerGroup] = useState<KafkaConsumerGroup | null>(null);
  const [consumerOffsets, setConsumerOffsets] = useState<KafkaConsumerOffset[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ groupId: '', threshold: 1000, email: 'admin@example.com', enabled: true });

  // Logs State
  const [logs, setLogs] = useState<KafkaLogEntry[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [logLevel, setLogLevel] = useState('ALL');

  // Alerts Center State
  const [alertTab, setAlertTab] = useState<'center' | 'rules'>('center');
  const [alertRules, setAlertRules] = useState<KafkaAlertRule[]>(mockAlertRules);
  const [alertHistory, setAlertHistory] = useState<KafkaAlertRecord[]>(mockAlertHistory);
  
  // Inspection State
  const [inspectionReports, setInspectionReports] = useState<KafkaInspectionReport[]>(mockInspections);
  const [isRunningInspection, setIsRunningInspection] = useState(false);

  // Instance Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Template Management State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<KafkaConfigTemplate> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Instance Form State
  const [newInstance, setNewInstance] = useState<{
    name: string;
    version: string;
    nodes: number;
    memory: string;
    storage: string;
    configTemplateId: string;
  }>({
    name: '',
    version: '3.5.1',
    nodes: 3,
    memory: '4GB',
    storage: '100GB',
    configTemplateId: 'tpl-throughput'
  });

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Load logs when logs tab is active
  useEffect(() => {
    if (detailTab === 'logs') {
      setLogs(generateMockLogs());
    }
  }, [detailTab]);

  // --- Kafka Instance Handlers ---
  const handleCreateInstance = () => {
    const id = `kafka-${Math.random().toString(36).substr(2, 6)}`;
    const createdInstance: KafkaInstance = {
      id,
      name: newInstance.name,
      version: newInstance.version,
      topics: 0,
      partitions: 0,
      status: 'Provisioning',
      nodes: newInstance.nodes,
      memory: newInstance.memory,
      storage: newInstance.storage,
      configTemplateId: newInstance.configTemplateId
    };

    setInstances([createdInstance, ...instances]);
    setIsWizardOpen(false);
    resetWizard();

    setTimeout(() => {
      setInstances(prev => prev.map(i => i.id === id ? { ...i, status: 'Running' } : i));
    }, 5000);
  };

  const resetWizard = () => {
    setWizardStep(1);
    setNewInstance({
      name: '',
      version: '3.5.1',
      nodes: 3,
      memory: '4GB',
      storage: '100GB',
      configTemplateId: 'tpl-throughput'
    });
  };

  const updateStatus = (id: string, newStatus: KafkaInstance['status'], revertToRunningAfterMs?: number) => {
    setInstances(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    if (revertToRunningAfterMs) {
      setTimeout(() => {
        setInstances(prev => prev.map(i => i.id === id ? { ...i, status: 'Running' } : i));
      }, revertToRunningAfterMs);
    }
  };

  const handleAction = (e: React.MouseEvent, id: string, action: 'restart' | 'stop' | 'resume' | 'upgrade' | 'delete') => {
    e.stopPropagation();
    setActiveMenu(null);
    const instance = instances.find(i => i.id === id);
    if (!instance) return;

    switch (action) {
      case 'restart': updateStatus(id, 'Restarting', 4000); break;
      case 'stop': updateStatus(id, 'Stopped'); break;
      case 'resume': updateStatus(id, 'Running'); break;
      case 'upgrade': 
        updateStatus(id, 'Upgrading');
        setTimeout(() => {
          setInstances(prev => prev.map(i => i.id === id ? { ...i, status: 'Running', version: '3.6.0' } : i));
        }, 5000);
        break;
      case 'delete':
        if (window.confirm(`确认要删除实例 ${instance.name} 吗？此操作不可逆，数据将丢失。`)) {
          updateStatus(id, 'Deleting');
          setTimeout(() => setInstances(prev => prev.filter(i => i.id !== id)), 2000);
        }
        break;
    }
  };

  // --- Topic Management Handlers ---
  const handleTopicCheck = (name: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedTopics(newSelected);
  };

  const handleSelectAllTopics = () => {
    if (selectedTopics.size === topics.length) {
      setSelectedTopics(new Set());
    } else {
      setSelectedTopics(new Set(topics.map(t => t.name)));
    }
  };

  const handleOpenCreateTopic = () => {
    setTopicModalMode('create');
    setCurrentTopicForm({
      name: '',
      partitions: 3,
      replicas: 2,
      retentionBytes: '1GB',
      cleanupPolicy: 'delete'
    });
    setIsTopicModalOpen(true);
  };

  const handleOpenEditTopic = (topic: KafkaTopic) => {
    setTopicModalMode('edit');
    setCurrentTopicForm({ ...topic });
    setIsTopicModalOpen(true);
  };

  const handleOpenBatchEdit = () => {
    setTopicModalMode('batch-edit');
    setCurrentTopicForm({
      retentionBytes: '1GB',
      cleanupPolicy: 'delete'
    });
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = () => {
    if (topicModalMode === 'create') {
      if (!currentTopicForm.name) return;
      setTopics([...topics, currentTopicForm as KafkaTopic]);
    } else if (topicModalMode === 'edit') {
      setTopics(topics.map(t => t.name === currentTopicForm.name ? { ...t, ...currentTopicForm } as KafkaTopic : t));
    } else if (topicModalMode === 'batch-edit') {
      setTopics(topics.map(t => {
        if (selectedTopics.has(t.name)) {
          return {
            ...t,
            retentionBytes: currentTopicForm.retentionBytes || t.retentionBytes,
            cleanupPolicy: currentTopicForm.cleanupPolicy || t.cleanupPolicy
          };
        }
        return t;
      }));
      setSelectedTopics(new Set());
    }
    setIsTopicModalOpen(false);
  };

  const handleDeleteTopic = (name: string) => {
    if (window.confirm(`确认删除 Topic "${name}" 吗？数据将无法恢复。`)) {
      setTopics(topics.filter(t => t.name !== name));
      if (selectedTopics.has(name)) {
        const newSelected = new Set(selectedTopics);
        newSelected.delete(name);
        setSelectedTopics(newSelected);
      }
    }
  };

  const handleBatchDeleteTopics = () => {
    if (window.confirm(`确认删除选中的 ${selectedTopics.size} 个 Topic 吗？`)) {
      setTopics(topics.filter(t => !selectedTopics.has(t.name)));
      setSelectedTopics(new Set());
    }
  };

  const handleSyncMetadata = () => {
    setIsSyncingTopics(true);
    setTimeout(() => {
      setIsSyncingTopics(false);
      alert('元数据同步成功！');
    }, 1500);
  };

  // --- Consumer Group Handlers ---
  const handleViewConsumerDetail = (group: KafkaConsumerGroup) => {
    setSelectedConsumerGroup(group);
    setConsumerOffsets(generateMockOffsets(group));
  };

  const handleOpenAlertConfig = (group: KafkaConsumerGroup) => {
    setAlertConfig({
      groupId: group.groupId,
      threshold: 1000,
      email: 'admin@example.com',
      enabled: true
    });
    setIsAlertModalOpen(true);
  };

  const handleSaveAlertConfig = () => {
    alert(`已为消费者组 ${alertConfig.groupId} 设置延迟告警：阈值 > ${alertConfig.threshold} (通知: ${alertConfig.email})`);
    setIsAlertModalOpen(false);
  };

  // --- Inspection Handler ---
  const handleRunInspection = () => {
    setIsRunningInspection(true);
    setTimeout(() => {
      setIsRunningInspection(false);
      const newReport: KafkaInspectionReport = {
        id: `insp-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'Pass',
        score: 100,
        issuesFound: 0,
        items: mockInspectionItems.map(i => ({...i, status: 'Pass', message: i.status === 'Pass' ? i.message : '已修复: ' + i.message}))
      };
      setInspectionReports([newReport, ...inspectionReports]);
    }, 3000);
  };

  // --- Template Handlers ---
  const handleCreateTemplate = () => {
    setEditingTemplate({
      name: '',
      description: '',
      params: { 'auto.create.topics.enable': 'false' },
      type: 'Custom'
    });
    setIsTemplateModalOpen(true);
  };

  const handleEditTemplate = (tpl: KafkaConfigTemplate) => {
    setEditingTemplate({ ...tpl });
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate || !editingTemplate.name) return;
    if (editingTemplate.id) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...editingTemplate, updatedAt: new Date().toISOString().split('T')[0] } as KafkaConfigTemplate : t));
    } else {
      const newTpl: KafkaConfigTemplate = {
        id: `tpl-custom-${Date.now()}`,
        name: editingTemplate.name,
        description: editingTemplate.description || '',
        type: 'Custom',
        updatedAt: new Date().toISOString().split('T')[0],
        params: editingTemplate.params || {}
      };
      setTemplates([...templates, newTpl]);
    }
    setIsTemplateModalOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('确认删除此模板吗？')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleExportTemplate = (tpl: KafkaConfigTemplate) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tpl, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${tpl.name}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          if (content.params && content.name) {
            setTemplates(prev => [...prev, {
              ...content,
              id: `tpl-import-${Date.now()}`,
              type: 'Custom',
              name: content.name + ' (Imported)',
              updatedAt: new Date().toISOString().split('T')[0]
            }]);
            alert('模板导入成功！');
          } else {
            alert('无效的模板文件格式。');
          }
        } catch (error) {
          alert('文件解析失败。');
        }
      };
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running': return 'bg-green-100 text-green-700';
      case 'Stopped': return 'bg-red-100 text-red-700';
      case 'Deleting': return 'bg-slate-100 text-slate-500';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  // --- Render Logic ---
  
  const selectedInstance = instances.find(i => i.id === selectedInstanceId);

  // VIEW: Instance Details
  if (selectedInstanceId && selectedInstance) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        {/* Header / Breadcrumb */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedInstanceId(null)}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
             <div className="flex items-center gap-2">
               <h2 className="text-2xl font-bold text-slate-800">{selectedInstance.name}</h2>
               <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(selectedInstance.status)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {selectedInstance.status}
               </span>
             </div>
             <p className="text-sm text-slate-500 font-mono mt-1 flex items-center gap-2">
                ID: {selectedInstance.id}
                <span className="text-slate-300">|</span>
                Ver: {selectedInstance.version}
             </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600 shadow-sm">
                <span className="select-all">192.168.1.100:9092,192.168.1.101:9092</span>
                <button className="text-blue-600 hover:text-blue-700"><Copy size={12} /></button>
             </div>
             <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <Settings size={16} /> 管理配置
             </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 flex gap-6 overflow-x-auto">
           {[
             { id: 'overview', label: '基本信息', icon: <Database size={16} /> },
             { id: 'topics', label: 'Topic 管理', icon: <Layers size={16} /> },
             { id: 'users', label: '用户管理', icon: <Users size={16} /> },
             { id: 'consumers', label: '消费者组', icon: <Users size={16} /> },
             { id: 'logs', label: '日志查询', icon: <FileText size={16} /> },
             { id: 'monitor', label: '监控中心', icon: <BarChart2 size={16} /> },
             { id: 'alerts', label: '告警中心', icon: <AlertTriangle size={16} /> },
             { id: 'inspection', label: '巡检报告', icon: <ShieldCheck size={16} /> },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => { setDetailTab(tab.id); setSelectedConsumerGroup(null); }}
               className={`pb-3 pt-1 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                 detailTab === tab.id 
                 ? 'border-orange-500 text-orange-600' 
                 : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
               }`}
             >
               {tab.icon}
               {tab.label}
             </button>
           ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
           {detailTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Server size={18} className="text-slate-400" /> 实例规格
                    </h3>
                    <dl className="grid grid-cols-2 gap-y-4 text-sm">
                       <dt className="text-slate-500">节点数量</dt>
                       <dd className="font-mono text-slate-800 font-medium">{selectedInstance.nodes} Nodes</dd>
                       <dt className="text-slate-500">单节点内存</dt>
                       <dd className="font-mono text-slate-800 font-medium">{selectedInstance.memory}</dd>
                       <dt className="text-slate-500">单节点存储</dt>
                       <dd className="font-mono text-slate-800 font-medium">{selectedInstance.storage} SSD</dd>
                       <dt className="text-slate-500">Kafka 版本</dt>
                       <dd className="font-mono text-slate-800 font-medium">{selectedInstance.version}</dd>
                    </dl>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Activity size={18} className="text-slate-400" /> 运行状态
                    </h3>
                    <dl className="grid grid-cols-2 gap-y-4 text-sm">
                       <dt className="text-slate-500">运行时间</dt>
                       <dd className="font-mono text-slate-800 font-medium">12d 4h 23m</dd>
                       <dt className="text-slate-500">Topic 数量</dt>
                       <dd className="font-mono text-slate-800 font-medium">{selectedInstance.topics}</dd>
                       <dt className="text-slate-500">Partition 总数</dt>
                       <dd className="font-mono text-slate-800 font-medium">{selectedInstance.partitions}</dd>
                       <dt className="text-slate-500">应用模板</dt>
                       <dd className="text-orange-600 font-medium cursor-pointer hover:underline">
                         {templates.find(t => t.id === selectedInstance.configTemplateId)?.name || 'N/A'}
                       </dd>
                    </dl>
                 </div>
              </div>
           )}

           {detailTab === 'topics' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                 {/* ... Topic content (same as before) ... */}
                 <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                       <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input placeholder="搜索 Topic..." className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                       </div>
                       <button 
                         onClick={handleSyncMetadata}
                         disabled={isSyncingTopics}
                         className="text-slate-500 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-200 transition-colors"
                         title="同步元数据"
                       >
                         <RefreshCw size={18} className={isSyncingTopics ? "animate-spin" : ""} />
                       </button>
                    </div>
                    
                    {selectedTopics.size > 0 ? (
                      <div className="flex items-center gap-3 bg-blue-50 px-4 py-1.5 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                         <span className="text-sm text-blue-700 font-medium">已选择 {selectedTopics.size} 项</span>
                         <div className="h-4 w-px bg-blue-200"></div>
                         <button onClick={handleOpenBatchEdit} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                            <Edit3 size={14} /> 批量配置
                         </button>
                         <button onClick={handleBatchDeleteTopics} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 ml-2">
                            <Trash2 size={14} /> 批量删除
                         </button>
                      </div>
                    ) : (
                      <button onClick={handleOpenCreateTopic} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                         <Plus size={16} /> 创建 Topic
                      </button>
                    )}
                 </div>
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                       <tr>
                          <th className="px-6 py-3 w-12">
                             <div className="flex items-center justify-center">
                                <button onClick={handleSelectAllTopics} className="text-slate-400 hover:text-slate-600">
                                   {selectedTopics.size > 0 && selectedTopics.size === topics.length ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                                </button>
                             </div>
                          </th>
                          <th className="px-6 py-3">Topic 名称</th>
                          <th className="px-6 py-3">分区数</th>
                          <th className="px-6 py-3">副本数</th>
                          <th className="px-6 py-3">保留策略</th>
                          <th className="px-6 py-3 text-right">操作</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {topics.map((topic, i) => (
                          <tr key={i} className={`hover:bg-slate-50 ${selectedTopics.has(topic.name) ? 'bg-blue-50/50' : ''}`}>
                             <td className="px-6 py-3">
                                <div className="flex items-center justify-center">
                                   <button onClick={() => handleTopicCheck(topic.name)} className="text-slate-400 hover:text-blue-600">
                                      {selectedTopics.has(topic.name) ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                                   </button>
                                </div>
                             </td>
                             <td className="px-6 py-3 font-mono text-slate-700 font-medium">{topic.name}</td>
                             <td className="px-6 py-3">{topic.partitions}</td>
                             <td className="px-6 py-3">{topic.replicas}</td>
                             <td className="px-6 py-3 text-slate-500">{topic.cleanupPolicy} / {topic.retentionBytes}</td>
                             <td className="px-6 py-3 text-right">
                                <div className="flex items-center justify-end gap-3">
                                   <button onClick={() => handleOpenEditTopic(topic)} className="text-slate-400 hover:text-blue-600" title="编辑配置">
                                      <Edit size={16} />
                                   </button>
                                   <button onClick={() => handleDeleteTopic(topic.name)} className="text-slate-400 hover:text-red-600" title="删除 Topic">
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           )}

           {detailTab === 'users' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                 {/* ... Users content (same as before) ... */}
                 <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-700">SASL 用户列表</h3>
                    <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                       <Plus size={16} /> 新增用户
                    </button>
                 </div>
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                       <tr>
                          <th className="px-6 py-3">用户名</th>
                          <th className="px-6 py-3">认证机制</th>
                          <th className="px-6 py-3">权限 (ACL)</th>
                          <th className="px-6 py-3 text-right">操作</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {mockUsers.map((user, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                             <td className="px-6 py-3 font-mono text-slate-700 font-bold">{user.username}</td>
                             <td className="px-6 py-3 text-slate-600">{user.mechanism}</td>
                             <td className="px-6 py-3">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${user.access === 'Full' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                   {user.access} Access
                                </span>
                             </td>
                             <td className="px-6 py-3 text-right flex justify-end gap-3 text-slate-400">
                                <button className="hover:text-blue-600"><Settings size={16}/></button>
                                <button className="hover:text-red-600"><Trash2 size={16}/></button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           )}

          {detailTab === 'consumers' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                 {selectedConsumerGroup ? (
                    // --- Detailed View: Consumer Group Partition Offsets ---
                    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                       <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <button onClick={() => setSelectedConsumerGroup(null)} className="p-1.5 hover:bg-slate-200 rounded text-slate-500">
                                <ArrowLeft size={18} />
                             </button>
                             <div>
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                  {selectedConsumerGroup.groupId}
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${selectedConsumerGroup.state === 'Stable' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                     {selectedConsumerGroup.state}
                                  </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                  Total Lag: <span className="font-mono text-slate-700 font-medium">{selectedConsumerGroup.lag}</span>
                                </p>
                             </div>
                          </div>
                          <button 
                             onClick={() => handleOpenAlertConfig(selectedConsumerGroup)}
                             className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
                          >
                             <BellRing size={16} className="text-orange-600" /> 堆积告警设置
                          </button>
                       </div>
                       
                       <table className="w-full text-left text-sm">
                          <thead className="bg-white text-slate-500 font-medium border-b border-slate-200">
                             <tr>
                                <th className="px-6 py-3">Topic / Partition</th>
                                <th className="px-6 py-3">Client Host</th>
                                <th className="px-6 py-3 text-right">Current Offset</th>
                                <th className="px-6 py-3 text-right">Log End Offset</th>
                                <th className="px-6 py-3 text-right">Lag (堆积)</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {consumerOffsets.map((offset, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                   <td className="px-6 py-3">
                                      <div className="font-medium text-slate-700">{offset.topic}</div>
                                      <div className="text-xs text-slate-400 font-mono">Partition-{offset.partition}</div>
                                   </td>
                                   <td className="px-6 py-3 text-slate-600">
                                      <div className="text-xs font-mono">{offset.clientId}</div>
                                      <div className="text-xs text-slate-400">{offset.host}</div>
                                   </td>
                                   <td className="px-6 py-3 text-right font-mono text-slate-600">{offset.currentOffset.toLocaleString()}</td>
                                   <td className="px-6 py-3 text-right font-mono text-slate-600">{offset.logEndOffset.toLocaleString()}</td>
                                   <td className="px-6 py-3 text-right">
                                      {offset.lag > 1000 ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-600">
                                          {offset.lag.toLocaleString()}
                                        </span>
                                      ) : (
                                        <span className="font-mono text-slate-600">{offset.lag.toLocaleString()}</span>
                                      )}
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 ) : (
                    // --- List View: Consumer Groups ---
                    <table className="w-full text-left text-sm">
                       <thead className="bg-slate-50 text-slate-500 font-medium">
                          <tr>
                             <th className="px-6 py-3">消费者组 ID</th>
                             <th className="px-6 py-3">状态</th>
                             <th className="px-6 py-3">总积压 (Lag)</th>
                             <th className="px-6 py-3">成员数</th>
                             <th className="px-6 py-3">订阅 Topic</th>
                             <th className="px-6 py-3 text-right">操作</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {mockConsumerGroups.map((group, i) => (
                             <tr key={i} className="hover:bg-slate-50 group transition-colors">
                                <td 
                                   className="px-6 py-3 font-mono text-slate-700 font-medium cursor-pointer hover:text-blue-600"
                                   onClick={() => handleViewConsumerDetail(group)}
                                >
                                   {group.groupId}
                                </td>
                                <td className="px-6 py-3">
                                   <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${group.state === 'Stable' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${group.state === 'Stable' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                      {group.state}
                                   </span>
                                </td>
                                <td className="px-6 py-3 font-mono">
                                   {group.lag > 1000 ? <span className="text-red-600 font-bold">{group.lag.toLocaleString()}</span> : <span className="text-slate-600">{group.lag.toLocaleString()}</span>}
                                </td>
                                <td className="px-6 py-3">{group.members}</td>
                                <td className="px-6 py-3 text-xs text-slate-500">
                                   {group.topics.join(', ')}
                                </td>
                                <td className="px-6 py-3 text-right">
                                   <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                         onClick={() => handleOpenAlertConfig(group)}
                                         title="设置告警" 
                                         className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded"
                                      >
                                         <Bell size={16} />
                                      </button>
                                      <button 
                                         onClick={() => handleViewConsumerDetail(group)}
                                         title="查看详情" 
                                         className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                      >
                                         <Eye size={16} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 )}
              </div>
           )}

           {detailTab === 'logs' && (
             <div className="space-y-4">
               {/* Search Toolbar */}
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                 <div className="flex items-center gap-3 w-full md:w-auto">
                   <div className="relative w-full md:w-64">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input 
                        placeholder="关键字搜索..." 
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                     />
                   </div>
                   <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 bg-white">
                      <Clock size={16} className="text-slate-400"/>
                      <select className="text-sm text-slate-700 bg-transparent border-none outline-none cursor-pointer">
                        <option>最近 15 分钟</option>
                        <option>最近 1 小时</option>
                        <option>最近 24 小时</option>
                      </select>
                   </div>
                   <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 bg-white">
                      <Filter size={16} className="text-slate-400"/>
                      <select 
                        className="text-sm text-slate-700 bg-transparent border-none outline-none cursor-pointer"
                        value={logLevel}
                        onChange={(e) => setLogLevel(e.target.value)}
                      >
                        <option value="ALL">全部级别</option>
                        <option value="INFO">INFO</option>
                        <option value="WARN">WARN</option>
                        <option value="ERROR">ERROR</option>
                      </select>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded">
                       <Check size={12} /> 日志持久化已开启 (ES)
                    </span>
                    <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                       <Download size={18} />
                    </button>
                 </div>
               </div>

               {/* Log Viewer */}
               <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-sm overflow-hidden h-[600px] flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
                     {logs
                       .filter(l => (logLevel === 'ALL' || l.level === logLevel) && l.message.toLowerCase().includes(logSearch.toLowerCase()))
                       .map(log => (
                       <div key={log.id} className="flex gap-3 hover:bg-slate-800/50 p-1 rounded">
                          <span className="text-slate-500 w-36 flex-shrink-0 select-none">{log.timestamp}</span>
                          <span className={`w-12 font-bold flex-shrink-0 ${log.level === 'ERROR' ? 'text-red-500' : log.level === 'WARN' ? 'text-yellow-500' : 'text-blue-400'}`}>
                             {log.level}
                          </span>
                          <span className="text-slate-400 w-32 flex-shrink-0 truncate" title={log.pod}>[{log.pod}]</span>
                          <span className="text-slate-300 break-all">{log.message}</span>
                       </div>
                     ))}
                     {logs.length === 0 && <div className="text-slate-500 text-center py-12">未找到匹配日志</div>}
                  </div>
               </div>
             </div>
           )}

           {detailTab === 'monitor' && (
              <div className="space-y-6">
                 {/* Monitoring Toolbar (Same as before) */}
                 <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                       <Activity className="text-orange-600" size={20} />
                       <h3 className="font-bold text-slate-800">实时监控看板</h3>
                    </div>
                    {/* ... */}
                 </div>
                 {/* ... Charts (Same as before) ... */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Section 1: System Resources */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center justify-between">
                          <span>系统资源 (System Resources)</span>
                          <Cpu size={16} />
                       </h4>
                       <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={fullMonitorData}>
                                <defs>
                                   <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                   </linearGradient>
                                   <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                                <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Legend wrapperStyle={{paddingTop: '20px'}} />
                                <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="url(#colorCpu)" name="CPU 利用率 (%)" />
                                <Area type="monotone" dataKey="memory" stackId="2" stroke="#8b5cf6" fill="url(#colorMem)" name="内存利用率 (%)" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                     {/* Section 2: Throughput & Traffic */}
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center justify-between">
                          <span>流量与吞吐 (Throughput)</span>
                          <Activity size={16} />
                       </h4>
                       <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={fullMonitorData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="#f97316" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'MB/s', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fill: '#94a3b8', fontSize: 10} }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Req/s', angle: 90, position: 'insideRight', style: {textAnchor: 'middle', fill: '#94a3b8', fontSize: 10} }} />
                                <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Legend wrapperStyle={{paddingTop: '20px'}} />
                                <Line yAxisId="left" type="monotone" dataKey="bytesIn" stroke="#f97316" strokeWidth={2} dot={false} name="Bytes In (MB/s)" />
                                <Line yAxisId="left" type="monotone" dataKey="bytesOut" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Bytes Out (MB/s)" />
                                <Line yAxisId="right" type="monotone" dataKey="reqSec" stroke="#10b981" strokeWidth={2} dot={false} name="Requests/Sec" />
                             </LineChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {detailTab === 'alerts' && (
              <div className="space-y-6">
                 {/* Tabs for Alert Center */}
                 <div className="flex gap-4 border-b border-slate-200">
                    <button 
                       onClick={() => setAlertTab('center')}
                       className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${alertTab === 'center' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                       实时告警与历史
                    </button>
                    <button 
                       onClick={() => setAlertTab('rules')}
                       className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${alertTab === 'rules' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                       告警规则配置
                    </button>
                 </div>

                 {alertTab === 'center' ? (
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="col-span-1 space-y-4">
                         {/* Stats */}
                         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                               <p className="text-sm text-slate-500">当前活动告警</p>
                               <p className="text-2xl font-bold text-red-600">1</p>
                            </div>
                            <div className="p-3 bg-red-50 text-red-600 rounded-full"><BellRing size={20}/></div>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                               <p className="text-sm text-slate-500">24h 告警总数</p>
                               <p className="text-2xl font-bold text-slate-800">5</p>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Activity size={20}/></div>
                         </div>
                      </div>

                      <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                         <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-700">告警列表</h3>
                            <div className="flex gap-2">
                               <select className="text-xs border border-slate-300 rounded px-2 py-1 bg-white">
                                  <option>所有状态</option>
                                  <option>Firing (触发中)</option>
                                  <option>Resolved (已恢复)</option>
                               </select>
                            </div>
                         </div>
                         <div className="divide-y divide-slate-100">
                            {alertHistory.map(alert => (
                               <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
                                  <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${alert.status === 'Firing' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                  <div className="flex-1">
                                     <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                           <span className="font-bold text-slate-800">{alert.ruleName}</span>
                                           <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${alert.level === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                                              {alert.level}
                                           </span>
                                        </div>
                                        <span className="text-xs text-slate-400">{alert.triggerTime}</span>
                                     </div>
                                     <p className="text-sm text-slate-600 mt-1">{alert.content}</p>
                                     <div className="mt-2 flex items-center gap-4 text-xs">
                                        <span className={`font-medium ${alert.status === 'Firing' ? 'text-red-600' : 'text-green-600'}`}>
                                           {alert.status === 'Firing' ? '🔥 触发中' : '✅ 已恢复 ' + (alert.resolveTime ? `(${alert.resolveTime})` : '')}
                                        </span>
                                        <button className="text-blue-600 hover:underline">查看指标趋势</button>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                         <div className="flex items-center gap-2">
                            <Settings size={18} className="text-slate-400"/>
                            <h3 className="font-bold text-slate-700">告警规则配置</h3>
                         </div>
                         <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                            <Plus size={16} /> 新建规则
                         </button>
                      </div>
                      <table className="w-full text-left text-sm">
                         <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                               <th className="px-6 py-3">规则名称</th>
                               <th className="px-6 py-3">监控指标</th>
                               <th className="px-6 py-3">触发条件</th>
                               <th className="px-6 py-3">持续时间</th>
                               <th className="px-6 py-3">通知渠道</th>
                               <th className="px-6 py-3">状态</th>
                               <th className="px-6 py-3 text-right">操作</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {alertRules.map(rule => (
                               <tr key={rule.id} className="hover:bg-slate-50">
                                  <td className="px-6 py-3">
                                     <div className="font-medium text-slate-800">{rule.name}</div>
                                     {rule.isPreset && <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">预置</span>}
                                  </td>
                                  <td className="px-6 py-3 text-slate-600">{rule.metric}</td>
                                  <td className="px-6 py-3 font-mono text-slate-700">{rule.operator} {rule.threshold}</td>
                                  <td className="px-6 py-3 text-slate-600">{rule.duration}</td>
                                  <td className="px-6 py-3">
                                     <div className="flex gap-1">
                                        {rule.channels.map(c => (
                                           <span key={c} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 flex items-center gap-1">
                                              {c === 'Email' ? <Mail size={10}/> : <Bell size={10}/>} {c}
                                           </span>
                                        ))}
                                     </div>
                                  </td>
                                  <td className="px-6 py-3">
                                     <div className={`relative inline-block w-8 h-4 transition duration-200 ease-linear rounded-full border cursor-pointer ${rule.enabled ? 'bg-green-500 border-green-500' : 'bg-slate-200 border-slate-200'}`}>
                                        <span className={`absolute left-0 inline-block bg-white rounded-full shadow transform transition duration-200 ease-linear h-full w-4 ${rule.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                     </div>
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                     <button className="text-slate-400 hover:text-blue-600"><Edit size={16}/></button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                 )}
              </div>
           )}

           {detailTab === 'inspection' && (
              <div className="space-y-6">
                 {/* Inspection Header */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                       <div>
                          <p className="text-sm text-slate-500">最近巡检时间</p>
                          <h3 className="text-xl font-bold text-slate-800 mt-1">{inspectionReports[0].timestamp}</h3>
                       </div>
                       <button 
                         onClick={handleRunInspection}
                         disabled={isRunningInspection}
                         className={`mt-4 w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${isRunningInspection ? 'bg-slate-100 text-slate-400' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
                       >
                         {isRunningInspection ? <RefreshCw size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                         {isRunningInspection ? '正在巡检中...' : '立即开始巡检'}
                       </button>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                       <div>
                          <p className="text-sm text-slate-500">上次健康评分</p>
                          <div className={`text-4xl font-bold mt-2 ${inspectionReports[0].score >= 90 ? 'text-green-500' : inspectionReports[0].score >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                             {inspectionReports[0].score}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">共检测 128 项指标</p>
                       </div>
                       <div className="h-16 w-16 rounded-full border-4 border-slate-100 flex items-center justify-center">
                          <ShieldCheck size={32} className={inspectionReports[0].score >= 90 ? 'text-green-500' : 'text-yellow-500'} />
                       </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <p className="text-sm text-slate-500 mb-4">自动化设置</p>
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-700 flex items-center gap-2"><Clock size={16}/> 定时巡检</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">已开启</span>
                       </div>
                       <p className="text-xs text-slate-400 pl-6">每日凌晨 02:00 自动执行全量巡检。</p>
                       <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                          <button className="text-blue-600 text-sm hover:underline">修改计划</button>
                       </div>
                    </div>
                 </div>

                 {/* Report Detail */}
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                       <h3 className="font-bold text-slate-700">详细检测报告</h3>
                       <div className="flex gap-2">
                          <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                             <Printer size={16} /> 导出 PDF
                          </button>
                          <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                             <FileText size={16} /> 导出 Excel
                          </button>
                       </div>
                    </div>
                    
                    {inspectionReports[0].items ? (
                      <table className="w-full text-left text-sm">
                         <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                               <th className="px-6 py-3">检查项</th>
                               <th className="px-6 py-3">分类</th>
                               <th className="px-6 py-3">状态</th>
                               <th className="px-6 py-3">详情说明</th>
                               <th className="px-6 py-3">建议</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {inspectionReports[0].items.map((item, i) => (
                               <tr key={i} className="hover:bg-slate-50">
                                  <td className="px-6 py-3 font-medium text-slate-800">{item.name}</td>
                                  <td className="px-6 py-3 text-slate-500">{item.category}</td>
                                  <td className="px-6 py-3">
                                     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                        item.status === 'Pass' ? 'bg-green-100 text-green-700' : 
                                        item.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                     }`}>
                                        {item.status === 'Pass' ? <Check size={10} /> : <AlertOctagon size={10} />}
                                        {item.status}
                                     </span>
                                  </td>
                                  <td className="px-6 py-3 text-slate-600">{item.message}</td>
                                  <td className="px-6 py-3 text-slate-500 italic">
                                     {item.suggestion ? <span className="text-orange-600 flex items-center gap-1"><CloudLightning size={12}/> {item.suggestion}</span> : '-'}
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-slate-500">无详细报告数据</div>
                    )}
                 </div>
              </div>
           )}
        </div>

        {/* --- Topic Modal (Same as before) --- */}
        {isTopicModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                 <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">
                       {topicModalMode === 'create' && '创建 Topic'}
                       {topicModalMode === 'edit' && `编辑 Topic: ${currentTopicForm.name}`}
                       {topicModalMode === 'batch-edit' && `批量编辑 ${selectedTopics.size} 个 Topic`}
                    </h3>
                    <button onClick={() => setIsTopicModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                 </div>
                 <div className="p-6 space-y-4">
                    {topicModalMode === 'create' && (
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Topic 名称</label>
                          <input 
                             className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                             value={currentTopicForm.name || ''}
                             onChange={e => setCurrentTopicForm({...currentTopicForm, name: e.target.value})}
                             placeholder="e.g. my-topic-v1"
                          />
                       </div>
                    )}
                    
                    {topicModalMode !== 'batch-edit' && (
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">分区数 (Partitions)</label>
                             <input 
                                type="number"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                value={currentTopicForm.partitions || 1}
                                onChange={e => setCurrentTopicForm({...currentTopicForm, partitions: parseInt(e.target.value)})}
                                min={1}
                             />
                          </div>
                          <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">副本因子 (Replicas)</label>
                             <input 
                                type="number"
                                className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none ${topicModalMode === 'edit' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                                value={currentTopicForm.replicas || 1}
                                onChange={e => setCurrentTopicForm({...currentTopicForm, replicas: parseInt(e.target.value)})}
                                min={1}
                                disabled={topicModalMode === 'edit'}
                             />
                          </div>
                       </div>
                    )}

                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">清理策略 (Cleanup Policy)</label>
                       <select 
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                          value={currentTopicForm.cleanupPolicy || 'delete'}
                          onChange={e => setCurrentTopicForm({...currentTopicForm, cleanupPolicy: e.target.value as any})}
                       >
                          <option value="delete">Delete (删除过期数据)</option>
                          <option value="compact">Compact (日志压缩)</option>
                       </select>
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">日志保留 (Retention Bytes)</label>
                       <input 
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                          value={currentTopicForm.retentionBytes || ''}
                          onChange={e => setCurrentTopicForm({...currentTopicForm, retentionBytes: e.target.value})}
                          placeholder="e.g. 100GB"
                       />
                       <p className="text-xs text-slate-500 mt-1">支持动态调整，立即生效。</p>
                    </div>
                 </div>
                 <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                    <button onClick={() => setIsTopicModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm hover:bg-white rounded-lg">取消</button>
                    <button onClick={handleSaveTopic} className="px-4 py-2 bg-orange-600 text-white text-sm hover:bg-orange-700 rounded-lg flex items-center gap-2">
                       <Check size={16} /> 保存配置
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* --- Consumer Alert Modal --- */}
        {isAlertModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                 <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-2">
                      <BellRing className="text-orange-600" size={20} />
                      <h3 className="text-lg font-bold text-slate-800">堆积告警设置</h3>
                    </div>
                    <button onClick={() => setIsAlertModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                 </div>
                 <div className="p-6 space-y-4">
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-sm text-orange-800 mb-4">
                       正在为消费者组 <strong>{alertConfig.groupId}</strong> 配置告警规则。
                    </div>
                    
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">最大堆积阈值 (Max Lag)</label>
                       <div className="relative">
                          <input 
                             type="number"
                             className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none pr-12"
                             value={alertConfig.threshold}
                             onChange={e => setAlertConfig({...alertConfig, threshold: parseInt(e.target.value)})}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">条消息</span>
                       </div>
                       <p className="text-xs text-slate-500 mt-1">当任意分区的 Lag 超过此数值时触发告警。</p>
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">通知邮箱</label>
                       <input 
                          type="email"
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                          value={alertConfig.email}
                          onChange={e => setAlertConfig({...alertConfig, email: e.target.value})}
                       />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                       <input 
                          type="checkbox" 
                          id="alertEnabled"
                          checked={alertConfig.enabled}
                          onChange={e => setAlertConfig({...alertConfig, enabled: e.target.checked})}
                          className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                       />
                       <label htmlFor="alertEnabled" className="text-sm text-slate-700">启用此告警规则</label>
                    </div>
                 </div>
                 <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                    <button onClick={() => setIsAlertModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm hover:bg-white rounded-lg">取消</button>
                    <button onClick={handleSaveAlertConfig} className="px-4 py-2 bg-orange-600 text-white text-sm hover:bg-orange-700 rounded-lg flex items-center gap-2">
                       <Check size={16} /> 保存设置
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>
    );
  }

  // VIEW: Instance List & Templates (Existing Logic)
  return (
    <div className="space-y-6">
      {/* Module Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">中间件市场 / Kafka</h2>
           <p className="text-slate-500 text-sm mt-1">全托管 Kafka 服务，支持一键部署、弹性扩容与自动化运维。</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           <button 
             onClick={() => setActiveTab('instances')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'instances' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             实例列表
           </button>
           <button 
             onClick={() => setActiveTab('templates')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'templates' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             参数模板管理
           </button>
        </div>

        <div>
          {activeTab === 'instances' ? (
            <button 
              onClick={() => setIsWizardOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
            >
              <Plus size={18} />
              创建 Kafka 实例
            </button>
          ) : (
             <div className="flex gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json" 
                  onChange={handleImportFile}
                />
                <button 
                  onClick={handleImportTrigger}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Upload size={18} /> 导入
                </button>
                <button 
                  onClick={handleCreateTemplate}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus size={18} />
                  新建模板
                </button>
             </div>
          )}
        </div>
      </div>

      {/* --- View: Instance List --- */}
      {activeTab === 'instances' && (
        <div className="grid grid-cols-1 gap-6">
          {instances.map(instance => (
            <div 
              key={instance.id} 
              onClick={() => setSelectedInstanceId(instance.id)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className={`p-4 rounded-xl transition-colors ${instance.status === 'Stopped' ? 'bg-slate-100 text-slate-400' : 'bg-orange-50 text-orange-600 group-hover:bg-orange-100'}`}>
                   <Database size={32} />
                </div>
                
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 group-hover:text-orange-600 transition-colors">
                      {instance.name}
                      {instance.status === 'Running' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">{instance.id}</p>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(instance.status)}`}>
                       {(instance.status === 'Provisioning' || instance.status === 'Restarting' || instance.status === 'Upgrading') ? (
                          <RefreshCw size={10} className="animate-spin" />
                       ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${instance.status === 'Running' ? 'bg-green-500' : 'bg-current'}`}></span>
                       )}
                       {instance.status}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">规格 (Nodes / Ver)</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="font-bold text-slate-700">{instance.nodes || '-'} 节点</span>
                       <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">v{instance.version}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Template</p>
                    <div className="text-sm font-medium text-slate-700 mt-1 flex items-center gap-1">
                      <FileJson size={14} className="text-slate-400"/>
                      {templates.find(t => t.id === instance.configTemplateId)?.name || '默认配置'}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Metrics</p>
                    <div className="text-sm font-medium text-slate-700 mt-1">
                       {instance.topics} Topics / {instance.partitions} Partitions
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 relative">
                   <div className="flex gap-2">
                      <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                        <BarChart2 size={16} /> <span className="hidden md:inline">监控</span>
                      </button>
                      <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                        <Settings size={16} /> <span className="hidden md:inline">配置</span>
                      </button>
                   </div>
                   
                   <div className="relative ml-auto md:ml-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === instance.id ? null : instance.id); }}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-md transition-colors"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeMenu === instance.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-20 py-1 text-sm animate-in fade-in zoom-in-95 duration-200">
                          {instance.status === 'Running' && (
                            <>
                              <button onClick={(e) => handleAction(e, instance.id, 'restart')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                <RefreshCw size={14} /> 重启实例
                              </button>
                              <button onClick={(e) => handleAction(e, instance.id, 'stop')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-orange-600">
                                <Pause size={14} /> 暂停服务
                              </button>
                              <button onClick={(e) => handleAction(e, instance.id, 'upgrade')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600">
                                <ArrowUpCircle size={14} /> 版本升级
                              </button>
                            </>
                          )}
                          {instance.status === 'Stopped' && (
                             <button onClick={(e) => handleAction(e, instance.id, 'resume')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-green-600">
                                <Play size={14} /> 恢复服务
                             </button>
                          )}
                          <div className="border-t border-slate-100 my-1"></div>
                          <button onClick={(e) => handleAction(e, instance.id, 'delete')} className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600">
                            <Trash2 size={14} /> 删除实例
                          </button>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- View: Template Management (Existing Logic) --- */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    {tpl.type === 'System' ? (
                       <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium mb-2">系统预置</span>
                    ) : (
                       <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded font-medium mb-2">自定义</span>
                    )}
                    <h3 className="font-bold text-slate-800 text-lg">{tpl.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleExportTemplate(tpl)} title="导出 JSON" className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded">
                      <Download size={16} />
                    </button>
                    {tpl.type === 'Custom' && (
                      <>
                        <button onClick={() => handleEditTemplate(tpl)} title="编辑" className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded">
                          <Settings size={16} />
                        </button>
                        <button onClick={() => handleDeleteTemplate(tpl.id)} title="删除" className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
               </div>
               
               <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">{tpl.description}</p>
               
               <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex-1 mb-4">
                  <div className="text-xs font-mono text-slate-600 space-y-1">
                    {Object.entries(tpl.params).slice(0, 4).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                         <span className="text-slate-500">{k}:</span>
                         <span className="font-semibold">{v}</span>
                      </div>
                    ))}
                    {Object.keys(tpl.params).length > 4 && (
                      <div className="text-slate-400 italic pt-1 text-center">...更多参数</div>
                    )}
                  </div>
               </div>
               
               <div className="text-xs text-slate-400 pt-3 border-t border-slate-100 flex justify-between">
                 <span>Updated: {tpl.updatedAt}</span>
                 {tpl.type === 'Custom' ? <span>By: Admin</span> : <span>By: System</span>}
               </div>
            </div>
          ))}
          
          <div 
             onClick={handleCreateTemplate}
             className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50/30 transition-all cursor-pointer min-h-[300px]"
          >
             <Plus size={48} className="mb-4 opacity-50" />
             <h3 className="font-bold text-lg">新建自定义模板</h3>
             <p className="text-sm mt-2 text-center max-w-[200px]">基于现有参数配置创建一个新的模板以便复用。</p>
          </div>
        </div>
      )}

      {/* --- Template Editor Modal (Existing) --- */}
      {isTemplateModalOpen && editingTemplate && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-800">{editingTemplate.id ? '编辑模板' : '创建新模板'}</h3>
                  <button onClick={() => setIsTemplateModalOpen(false)}><X size={20} className="text-slate-400" /></button>
               </div>
               <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">模板名称</label>
                    <input 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      value={editingTemplate.name}
                      onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                      placeholder="e.g. My Custom Config"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                    <textarea 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      value={editingTemplate.description}
                      onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})}
                      placeholder="用途描述..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">参数配置 (Key-Value)</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                       {Object.entries(editingTemplate.params || {}).map(([k, v], idx) => (
                         <div key={idx} className="flex gap-2">
                            <input 
                              className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs" 
                              value={k} 
                              onChange={(e) => {
                                const newParams = {...editingTemplate.params};
                                const oldVal = newParams[k];
                                delete newParams[k];
                                newParams[e.target.value] = oldVal;
                                setEditingTemplate({...editingTemplate, params: newParams});
                              }}
                            />
                            <span className="text-slate-400 self-center">:</span>
                            <input 
                              className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs" 
                              value={v} 
                              onChange={(e) => {
                                const newParams = {...editingTemplate.params};
                                newParams[k] = e.target.value;
                                setEditingTemplate({...editingTemplate, params: newParams});
                              }}
                            />
                            <button 
                              onClick={() => {
                                const newParams = {...editingTemplate.params};
                                delete newParams[k];
                                setEditingTemplate({...editingTemplate, params: newParams});
                              }}
                              className="text-red-400 hover:text-red-600"
                            >
                              <X size={14} />
                            </button>
                         </div>
                       ))}
                       <button 
                         onClick={() => setEditingTemplate({
                           ...editingTemplate, 
                           params: { ...editingTemplate.params, [`param.${Object.keys(editingTemplate.params || {}).length + 1}`]: 'value' }
                         })}
                         className="text-xs text-orange-600 font-medium hover:underline flex items-center gap-1"
                       >
                         <Plus size={12} /> 添加参数
                       </button>
                    </div>
                  </div>
               </div>
               <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                  <button onClick={() => setIsTemplateModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm hover:bg-white rounded-lg">取消</button>
                  <button onClick={handleSaveTemplate} className="px-4 py-2 bg-orange-600 text-white text-sm hover:bg-orange-700 rounded-lg flex items-center gap-2">
                    <Save size={16} /> 保存模板
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* --- Wizard Modal (Existing) --- */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">创建 Kafka 实例</h3>
                <p className="text-sm text-slate-500 mt-1">步骤 {wizardStep} / 3</p>
              </div>
              <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-200 hover:border-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              {wizardStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">实例名称</label>
                    <input 
                      type="text" 
                      value={newInstance.name}
                      onChange={(e) => setNewInstance({...newInstance, name: e.target.value})}
                      placeholder="例如: kafka-prod-log-01"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kafka 版本</label>
                    <select 
                      value={newInstance.version}
                      onChange={(e) => setNewInstance({...newInstance, version: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                    >
                      <option value="3.5.1">Apache Kafka 3.5.1 (Recommended)</option>
                      <option value="3.4.0">Apache Kafka 3.4.0</option>
                      <option value="3.3.2">Apache Kafka 3.3.2</option>
                    </select>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  {/* ... Existing Layout options ... */}
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">部署架构 & 资源</label>
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div 
                          onClick={() => setNewInstance({...newInstance, nodes: 1})}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${newInstance.nodes === 1 ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-slate-200'}`}
                        >
                           <div className="font-bold text-sm text-slate-800">开发测试版 (1 Node)</div>
                        </div>
                        <div 
                          onClick={() => setNewInstance({...newInstance, nodes: 3})}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${newInstance.nodes === 3 ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-slate-200'}`}
                        >
                           <div className="font-bold text-sm text-slate-800">生产高可用版 (3 Nodes)</div>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <select 
                           value={newInstance.memory}
                           onChange={(e) => setNewInstance({...newInstance, memory: e.target.value})}
                           className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                           <option value="4GB">4GB Mem</option>
                           <option value="8GB">8GB Mem</option>
                           <option value="16GB">16GB Mem</option>
                        </select>
                        <select 
                           value={newInstance.storage}
                           onChange={(e) => setNewInstance({...newInstance, storage: e.target.value})}
                           className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                           <option value="100GB">100GB SSD</option>
                           <option value="500GB">500GB SSD</option>
                           <option value="1TB">1TB SSD</option>
                        </select>
                     </div>
                  </div>
                  
                  {/* NEW: Template Selection */}
                  <div className="border-t border-slate-100 pt-4">
                     <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
                       <span>配置参数模板</span>
                       <a href="#" onClick={(e) => { e.preventDefault(); setIsWizardOpen(false); setActiveTab('templates'); }} className="text-orange-600 text-xs hover:underline">管理模板</a>
                     </label>
                     <div className="grid grid-cols-1 gap-2">
                        {templates.map(tpl => (
                           <div 
                             key={tpl.id}
                             onClick={() => setNewInstance({...newInstance, configTemplateId: tpl.id})}
                             className={`relative p-3 border rounded-lg cursor-pointer flex items-start gap-3 transition-all ${newInstance.configTemplateId === tpl.id ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                           >
                              <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${newInstance.configTemplateId === tpl.id ? 'border-orange-600 bg-orange-600' : 'border-slate-300'}`}>
                                 {newInstance.configTemplateId === tpl.id && <Check size={10} className="text-white" />}
                              </div>
                              <div className="flex-1">
                                 <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-slate-800">{tpl.name}</span>
                                    <span className="text-[10px] uppercase bg-slate-100 px-1 rounded text-slate-500">{tpl.type}</span>
                                 </div>
                                 <p className="text-xs text-slate-500 mt-1 line-clamp-1">{tpl.description}</p>
                                 {newInstance.configTemplateId === tpl.id && (
                                    <div className="mt-2 text-xs font-mono text-slate-600 bg-white/50 p-2 rounded border border-orange-100/50">
                                       {Object.entries(tpl.params).slice(0, 3).map(([k,v]) => `${k}=${v}`).join(', ')}...
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                       <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">配置清单预览</h4>
                       <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                          <dt className="text-slate-500">实例名称</dt>
                          <dd className="font-semibold text-slate-800 text-right">{newInstance.name}</dd>
                          
                          <dt className="text-slate-500">资源规格</dt>
                          <dd className="font-semibold text-slate-800 text-right">
                             {newInstance.nodes} Nodes / {newInstance.memory} / {newInstance.storage}
                          </dd>

                          <dt className="text-slate-500">参数模板</dt>
                          <dd className="font-semibold text-orange-600 text-right flex items-center justify-end gap-1">
                             <FileJson size={14}/>
                             {templates.find(t => t.id === newInstance.configTemplateId)?.name}
                          </dd>
                       </dl>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-orange-50 text-orange-800 rounded-lg text-sm border border-orange-100">
                       <div className="mt-0.5"><Activity size={16} /></div>
                       <p>预计创建时间为 3-5 分钟。系统将自动应用所选模板的 {Object.keys(templates.find(t => t.id === newInstance.configTemplateId)?.params || {}).length} 项优化参数。</p>
                    </div>
                 </div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
               {wizardStep > 1 && (
                 <button onClick={() => setWizardStep(s => s - 1)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors font-medium">上一步</button>
               )}
               {wizardStep < 3 ? (
                 <button onClick={() => setWizardStep(s => s + 1)} disabled={!newInstance.name} className="px-6 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-lg transition-colors font-medium">下一步</button>
               ) : (
                 <button onClick={handleCreateInstance} className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2">
                   <Check size={18} /> 确认创建
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};