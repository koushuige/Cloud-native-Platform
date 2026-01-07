
export enum ClusterStatus {
  RUNNING = 'Running',
  WARNING = 'Warning',
  ERROR = 'Error',
  PROVISIONING = 'Provisioning'
}

export interface Node {
  name: string;
  ip: string;
  cpuUsage: number;
  memoryUsage: number;
  status: 'Ready' | 'NotReady' | 'Unknown';
  osImage: string;
}

export interface Cluster {
  id: string;
  name: string;
  version: string;
  nodes: number;
  cpuUsage: number;
  memoryUsage: number;
  status: ClusterStatus;
  provider: 'AWS' | 'Aliyun' | 'OnPremise';
  nodeList?: Node[];
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  source: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

// --- Microservices Governance Types ---

export interface MicroService {
  id: string;
  name: string;
  namespace: string;
  version: string;
  instances: number;
  status: 'Healthy' | 'Warning' | 'Error';
  healthScore: number;
  qps: number;
  latency: string;
  errorRate: number;
}

export interface Gateway {
  id: string;
  name: string;
  type: 'Ingress' | 'Egress';
  hosts: string[];
  ports: number[];
  status: 'Ready' | 'NotReady';
  namespace: string;
}

export interface ExternalService {
  id: string;
  host: string;
  location: 'MESH_EXTERNAL' | 'MESH_INTERNAL';
  resolution: 'DNS' | 'NONE' | 'STATIC';
  endpoints: string[];
  namespace: string;
}

export interface ServicePolicy {
  id: string;
  service: string;
  lbPolicy: 'ROUND_ROBIN' | 'RANDOM' | 'LEAST_CONN';
  circuitBreaker: {
    maxConnections: number;
    errorThreshold: number;
    interval: string;
  };
}

export interface RateLimit {
  id: string;
  service: string;
  limit: number;
  unit: 'rps' | 'rpm' | 'rph';
  status: 'Enabled' | 'Disabled';
}

export interface GrayRelease {
  id: string;
  name: string;
  service: string;
  baseline: { version: string; weight: number };
  canary: { version: string; weight: number; status: 'Testing' | 'Promoting' | 'Completed' };
  startTime: string;
}

export interface TraceSpan {
  id: string;
  operation: string;
  service: string;
  startTime: string;
  duration: number; // ms
  status: 'OK' | 'Error';
  tags: Record<string, string>;
}

export enum View {
  DASHBOARD = 'dashboard',
  CLUSTERS = 'clusters',
  OPERATIONS = 'operations',
  APPLICATIONS = 'applications',
  MICROSERVICES = 'microservices',
  DEVOPS = 'devops',
  NETWORK = 'network',
  STORAGE = 'storage',
  MIDDLEWARE = 'middleware',
  SETTINGS = 'settings'
}

// --- Application Delivery Types ---
export interface Workload { id: string; name: string; type: string; namespace: string; replicas: number; availableReplicas: number; image: string; status: string; cpuRequest: string; memRequest: string; createdAt: string; }
export interface Pod { id: string; name: string; namespace: string; node: string; status: string; restarts: number; age: string; ip: string; cpuUsage: string; memUsage: string; }
export interface ApplicationTemplate { id: string; name: string; description: string; version: string; category: string; maintainer: string; icon: string; }
export interface ApplicationScalingConfig { enabled: boolean; minReplicas: number; maxReplicas: number; currentReplicas: number; metrics: any[]; schedules: any[]; }
export interface ApplicationRevision { revision: number; image: string; message: string; createdAt: string; current: boolean; }

// --- Middleware Types ---
export interface KafkaTopic { name: string; partitions: number; replicas: number; status: string; }
export interface KafkaUser { name: string; authenticationType: string; status: string; }
export interface KafkaConsumerGroup { name: string; state: string; consumers: number; }

// --- Network Management Types ---
export interface Service { id: string; name: string; namespace: string; type: 'ClusterIP' | 'NodePort' | 'LoadBalancer'; clusterIP: string; ports: string[]; selector: Record<string, string>; protocol: string; sessionAffinity: string; }
export interface Ingress { id: string; name: string; namespace: string; loadBalancerIP: string; rules: { host: string; path: string; backend: string; }[]; tls: boolean; certificate?: string; }
export interface NetworkPolicy { id: string; name: string; namespace: string; podSelector: string; policyTypes: string[]; age: string; scope: string; ingressRules: any[]; }
export interface IPPool { id: string; name: string; cidr: string; gateway: string; vlan: number; totalIPs: number; usedIPs: number; namespaceBinding?: string[]; status: string; }
export interface IPAllocation { ip: string; podName: string; namespace: string; node: string; isStatic: boolean; lastDrift?: string; }
export interface NetworkFlowLog { id: string; timestamp: string; srcIP: string; srcPod?: string; dstIP: string; dstPod?: string; dstPort: number; protocol: string; action: 'ALLOW' | 'DENY'; bytes: number; latencyMs: number; }
export interface NetworkAlertRule { id: string; name: string; metric: string; operator: string; threshold: number; unit: string; enabled: boolean; }

// --- Storage Management Types ---
export interface StorageClass { id: string; name: string; provisioner: string; reclaimPolicy: 'Delete' | 'Retain'; volumeBindingMode: 'Immediate' | 'WaitForFirstConsumer'; allowVolumeExpansion: boolean; }
export interface PersistentVolumeClaim { id: string; name: string; namespace: string; status: string; capacity: string; storageClass: string; accessModes: string[]; age: string; usedPercentage: number; volumeName?: string; }
export interface CsiDriver { id: string; name: string; type: 'Ceph' | 'Minio' | 'Topolvm'; status: string; version: string; nodesRegistered: number; provisioner: string; createdAt: string; }
export interface VolumeSnapshot { id: string; name: string; namespace: string; sourcePvc: string; status: string; size: string; createdAt: string; restoreSize: string; }
export interface PersistentVolume { id: string; name: string; capacity: string; accessModes: string[]; reclaimPolicy: string; status: string; claimRef: string; storageClass: string; age: string; }
export interface CephPool { name: string; type: string; replicas: number; pgNum: number; used: string; status: string; deviceClass: string; }
export interface MinioBucket { name: string; objects: number; size: string; quota: string; policy: string; createdAt: string; versioning: boolean; retention: string; }
export interface CephOsd { id: number; name: string; type: 'osd'; weight: number; status: 'up' | 'down'; }
export interface TopolvmNode { name: string; ip: string; vgName: string; device: string; total: string; used: string; status: string; }
export interface MinioUser { accessKey: string; policy: string; status: string; createdAt: string; }
export interface CephDeploymentConfig { /* placeholder */ }
export interface CephCrushNode { id: number; name: string; type: string; weight: number; items?: (CephCrushNode | CephOsd)[]; status?: string; }
export interface CephAlertPolicy { /* placeholder */ }
export interface TopolvmLogicalVolume { id: string; name: string; node: string; size: string; deviceClass: string; status: string; pvcRef: string; createdAt: string; }
export interface TopolvmDeviceClass { /* placeholder */ }
export interface MinioTenant { name: string; namespace: string; status: string; nodes: number; capacity: string; used: string; version: string; pools: number; }

// --- Project & Member Settings Types ---
export interface Project { id: string; name: string; description: string; clusterId: string; status: string; cpuQuota: number; cpuUsed: number; memQuota: number; memUsed: number; storageQuota: number; storageUsed: number; workloadCount: number; memberCount: number; costMonth: number; createdAt: string; }
export interface ProjectMember { userId: string; username: string; role: 'Project Owner' | 'Developer' | 'Viewer'; addedAt: string; }
export interface ProjectNamespace { id: string; name: string; status: string; cpuLimit: number; memLimit: number; cpuUsed: number; memUsed: number; policyStatus: string; createdAt: string; }

// --- Inspection Types ---
export interface ClusterInspectionItem { id: string; name: string; category: string; status: string; severity: string; message: string; recommendation?: string; }

// --- DevOps Types ---
export type GateType = 'Quality' | 'Approval' | 'Security';
export type GateMode = 'Auto' | 'Manual';
export interface QualityGate { type: GateType; mode: GateMode; status: string; }
export interface ApprovalNode { id: string; name: string; approvers: string[]; status: string; }
export interface ReleaseTrigger { type: string; enabled: boolean; config?: any; }
export interface CodeQualityReport { id: string; score: string; vulnerabilities: number; bugs: number; codeSmells: number; coverage: number; duplication: number; timestamp: string; issues: CodeIssue[]; }
export interface CodeIssue { id: string; severity: string; type: string; file: string; line: number; description: string; ruleId: string; }

// (Remaining existing types preserved below for compatibility)
export type TaskCondition = 'OnSuccess' | 'Always' | 'OnFailure';
export interface PipelineTask { id: string; name: string; type: any; status: any; condition: TaskCondition; script?: string; config?: any; }
export interface PipelineStage { id: string; name: string; status: any; tasks: PipelineTask[]; }
export interface ReleaseOrder { id: string; name: string; appId: string; env: any; artifact: any; status: any; stages: PipelineStage[]; startTime: string; triggers: any[]; }
export interface DevOpsPipeline { id: string; name: string; repo: string; lastStatus: any; lastRunTime: string; avgDuration: string; successRate: number; }
export interface CodeProject { id: string; name: string; description: string; cloneHttp: string; cloneSsh: string; status: any; tool: any; repos: any[]; }
export interface CodeRepository { id: string; name: string; defaultBranch: string; lastCommitMessage: string; lastUpdateTime: string; qualityReport?: any; }
export interface KafkaInstance { id: string; name: string; version: string; topics: number; partitions: number; status: any; nodes: number; memory: string; storage: string; configTemplateId: string; }
export interface RedisInstance { id: string; name: string; version: string; architecture: any; status: any; endpoint: string; nodes: number; cpu: string; memory: string; storage: string; }
export interface RabbitMQInstance { id: string; name: string; version: string; status: any; nodes: number; queues: number; consumers: number; endpoint: string; cpu: string; memory: string; storage: string; }
export interface RabbitMQQueue { name: string; vhost: string; state: string; messages: number; ready: number; unacked: number; publishRate: number; deliverRate: number; }
export interface MiddlewareBackup { id: string; timestamp: string; size: string; status: any; type: any; target: any; }
export interface ClusterInspectionReport { id: string; clusterId: string; score: number; status: any; riskLevel: any; timestamp: string; durationSeconds: number; items: any[]; }
export interface MonitoringPanel { id: string; title: string; type: string; metric: string; unit: string; color: string; data: any[]; }
export interface MonitoringDashboard { id: string; name: string; source: string; panels: MonitoringPanel[]; }
export interface Application { id: string; name: string; namespace: string; version: string; status: string; healthScore: number; description: string; resources: any; metrics: any; scalingConfig: any; createdAt: string; updatedAt: string; }
