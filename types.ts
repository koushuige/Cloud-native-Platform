

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

// --- DevOps CI/CD Types ---

export type TaskCondition = 'OnSuccess' | 'Always' | 'OnFailure';

export interface PipelineTask {
  id: string;
  name: string;
  type: 'Shell' | 'Java' | 'Golang' | 'NodeJS' | 'Docker' | 'Helm' | 'Deploy' | 'Verify' | 'Traffic' | 'Rollback' | 'Approval';
  status: 'Success' | 'Failed' | 'Running' | 'Pending' | 'Blocked';
  cpuQuota?: string;
  memQuota?: string;
  condition: TaskCondition;
  script?: string;
  config?: any;
}

// --- CD Specific Types ---

export type GateType = 'Security' | 'Compliance' | 'Test' | 'Performance';
export type GateMode = 'Pre' | 'Post';

export interface QualityGate {
  id: string;
  type: GateType;
  mode: GateMode;
  status: 'Pass' | 'Fail' | 'Running' | 'Pending';
  config?: any;
  reportUrl?: string;
}

export interface ApprovalAction {
  user: string;
  action: 'Approve' | 'Reject';
  comment: string;
  timestamp: string;
}

export interface ApprovalNode {
  id: string;
  approvers: string[];
  role?: string;
  mode: 'All' | 'Any';
  status: 'Pending' | 'Approved' | 'Rejected';
  history: ApprovalAction[];
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'Success' | 'Failed' | 'Running' | 'Pending' | 'Blocked';
  tasks: PipelineTask[];
  gates?: QualityGate[];
  approvals?: ApprovalNode[];
}

export interface ReleaseTrigger {
  type: 'ImageRegistry' | 'Webhook' | 'Manual' | 'Cron';
  config: {
    registry?: string;
    imagePattern?: string;
    webhookUrl?: string;
    cronExpr?: string;
  };
  enabled: boolean;
}

export interface ReleaseOrder {
  id: string;
  name: string;
  appId: string;
  env: 'Dev' | 'Staging' | 'Prod';
  artifact: {
    type: 'Image' | 'Chart';
    name: string;
    version: string;
    repo: string;
  };
  status: 'Running' | 'Success' | 'Failed' | 'Blocked' | 'Pending';
  stages: PipelineStage[];
  startTime: string;
  endTime?: string;
  triggers: ReleaseTrigger[];
  window?: { start: string; end: string };
}

export interface DevOpsPipeline {
  id: string;
  name: string;
  repo: string;
  lastStatus: 'Success' | 'Failed' | 'Running' | 'Pending';
  lastRunTime: string;
  avgDuration: string;
  successRate: number;
  gitOpsEnabled?: boolean;
  gitOpsPath?: string;
}

// --- Code Management Types ---

export interface CodeIssue {
  id: string;
  severity: 'Critical' | 'Major' | 'Minor' | 'Info';
  type: 'Vulnerability' | 'Bug' | 'CodeSmell' | 'SecurityHotspot';
  file: string;
  line: number;
  description: string;
  ruleId: string;
}

export interface CodeQualityReport {
  id: string;
  timestamp: string;
  score: string; // A, B, C, D, E
  vulnerabilities: number;
  bugs: number;
  codeSmells: number;
  coverage: number; // percentage
  duplication: number; // percentage
  issues: CodeIssue[];
}

export interface CodeRepository {
  id: string;
  name: string;
  defaultBranch: string;
  lastCommitMessage: string;
  lastUpdateTime: string;
  qualityReport?: CodeQualityReport;
}

export interface CodeProject {
  id: string;
  name: string;
  description: string;
  cloneHttp: string;
  cloneSsh: string;
  status: 'Healthy' | 'Error';
  tool: 'GitLab' | 'GitHub' | 'Gitea';
  repos: CodeRepository[];
}

export enum View {
  DASHBOARD = 'dashboard',
  CLUSTERS = 'clusters',
  OPERATIONS = 'operations',
  APPLICATIONS = 'applications',
  DEVOPS = 'devops',
  NETWORK = 'network',
  STORAGE = 'storage',
  MIDDLEWARE = 'middleware',
  SETTINGS = 'settings'
}

// --- Middleware Management Types (Kafka/Redis/RabbitMQ) ---

export interface KafkaInstance {
  id: string;
  name: string;
  version: string;
  topics: number;
  partitions: number;
  status: 'Running' | 'Stopped' | 'Provisioning' | 'Restarting' | 'Upgrading' | 'Deleting';
  nodes: number;
  memory: string;
  storage: string;
  configTemplateId: string;
}

export interface RedisInstance {
  id: string;
  name: string;
  version: string;
  architecture: 'Sentinel' | 'Cluster' | 'Standalone';
  status: 'Running' | 'Stopped' | 'Provisioning' | 'Upgrading';
  endpoint: string;
  nodes: number;
  cpu: string;
  memory: string;
  storage: string;
}

export interface RabbitMQInstance {
  id: string;
  name: string;
  version: string;
  status: 'Running' | 'Stopped' | 'Provisioning';
  nodes: number;
  queues: number;
  consumers: number;
  endpoint: string;
}

export interface MiddlewareBackup {
  id: string;
  timestamp: string;
  size: string;
  status: 'Success' | 'Failed' | 'In-Progress';
  type: 'Automatic' | 'Manual';
  target: 'PVC' | 'S3';
}

export interface KafkaConfigTemplate {
  id: string;
  name: string;
  description: string;
  type: 'System' | 'Custom';
  updatedAt: string;
  params: Record<string, string>;
}

export interface KafkaTopic {
  name: string;
  partitions: number;
  replicas: number;
  retentionBytes: string;
  cleanupPolicy: 'delete' | 'compact';
}

export interface KafkaUser {
  username: string;
  mechanism: string;
  access: string;
}

export interface KafkaConsumerGroup {
  groupId: string;
  state: string;
  lag: number;
  members: number;
  topics: string[];
}

export interface KafkaInspectionReport {
  id: string;
  timestamp: string;
  status: string;
  score: number;
  issuesFound: number;
  items: KafkaInspectionItem[];
}

export interface KafkaConsumerOffset {
  topic: string;
  partition: number;
  currentOffset: number;
  logEndOffset: number;
  lag: number;
  consumerId: string;
  clientId: string;
  host: string;
}

export interface KafkaLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  pod: string;
  message: string;
}

export interface KafkaAlertRule {
  id: string;
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  duration: string;
  level: string;
  channels: string[];
  enabled: boolean;
  isPreset?: boolean;
}

export interface KafkaAlertRecord {
  id: string;
  ruleName: string;
  level: string;
  status: 'Firing' | 'Resolved';
  triggerTime: string;
  resolveTime?: string;
  content: string;
}

export interface KafkaInspectionItem {
  name: string;
  category: string;
  status: 'Pass' | 'Warning' | 'Fail';
  message: string;
  suggestion?: string;
}

// --- Network Management Types ---

export interface Service {
  id: string;
  name: string;
  namespace: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  clusterIP: string;
  ports: string[];
  selector: Record<string, string>;
  protocol: 'TCP' | 'UDP' | 'SCTP';
  sessionAffinity: 'None' | 'ClientIP';
}

export interface Ingress {
  id: string;
  name: string;
  namespace: string;
  loadBalancerIP: string;
  rules: { host: string; path: string; backend: string; }[];
  tls: boolean;
  certificate?: string;
}

export interface NetworkPolicy {
  id: string;
  name: string;
  namespace: string;
  podSelector: string;
  policyTypes: string[];
  age: string;
  scope: 'Namespace' | 'Pod' | 'Project';
  ingressRules: { from: string; ports: string; }[];
}

export interface IPPool {
  id: string;
  name: string;
  cidr: string;
  gateway: string;
  vlan: number;
  totalIPs: number;
  usedIPs: number;
  status: 'Healthy' | 'Error';
  namespaceBinding?: string[];
}

export interface IPAllocation {
  ip: string;
  podName: string;
  namespace: string;
  node: string;
  isStatic: boolean;
  lastDrift?: string;
}

export interface NetworkFlowLog {
  id: string;
  timestamp: string;
  srcIP: string;
  srcPod?: string;
  dstIP: string;
  dstPod?: string;
  dstPort: number;
  protocol: string;
  action: 'ALLOW' | 'DENY';
  bytes: number;
  latencyMs: number;
}

export interface NetworkAlertRule {
  id: string;
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  unit: string;
  enabled: boolean;
}

// --- Storage Management Types ---

export interface StorageClass {
  id: string;
  name: string;
  provisioner: string;
  reclaimPolicy: 'Delete' | 'Retain';
  volumeBindingMode: 'Immediate' | 'WaitForFirstConsumer';
  allowVolumeExpansion: boolean;
}

export interface PersistentVolumeClaim {
  id: string;
  name: string;
  namespace: string;
  status: string;
  capacity: string;
  storageClass: string;
  accessModes: string[];
  age: string;
  usedPercentage: number;
  volumeName?: string;
}

export interface PersistentVolume {
  id: string;
  name: string;
  capacity: string;
  accessModes: string[];
  reclaimPolicy: string;
  status: string;
  claimRef: string;
  storageClass: string;
  age: string;
}

export interface CsiDriver {
  id: string;
  name: string;
  type: 'Ceph' | 'Minio' | 'Topolvm';
  status: string;
  version: string;
  nodesRegistered: number;
  provisioner: string;
  createdAt: string;
}

export interface VolumeSnapshot {
  id: string;
  name: string;
  namespace: string;
  sourcePvc: string;
  status: string;
  size: string;
  createdAt: string;
  restoreSize: string;
}

export interface CephPool {
  name: string;
  type: string;
  replicas: number;
  pgNum: number;
  used: string;
  status: string;
  deviceClass: string;
}

export interface CephOsd {
  id: number;
  name: string;
  type: string;
  weight: number;
  status: 'up' | 'down';
}

export interface CephCrushNode {
  id: number;
  name: string;
  type: string;
  weight: number;
  items?: (CephCrushNode | CephOsd)[];
  status?: string;
}

export interface TopolvmNode {
  name: string;
  ip: string;
  vgName: string;
  device: string;
  total: string;
  used: string;
  status: string;
}

export interface TopolvmLogicalVolume {
  id: string;
  name: string;
  node: string;
  size: string;
  deviceClass: string;
  status: string;
  pvcRef: string;
  createdAt: string;
}

export interface MinioTenant {
  name: string;
  namespace: string;
  status: string;
  nodes: number;
  capacity: string;
  used: string;
  version: string;
  pools: number;
}

export interface MinioBucket {
  name: string;
  objects: number;
  size: string;
  quota: string;
  policy: string;
  createdAt: string;
  versioning: boolean;
  retention: string;
}

export interface MinioUser {
  accessKey: string;
  policy: string;
  status: string;
  createdAt: string;
}

export interface CephDeploymentConfig {}
export interface CephAlertPolicy {}
export interface TopolvmDeviceClass {}

// --- Project & Setting Types ---

export interface Project {
  id: string;
  name: string;
  description: string;
  clusterId: string;
  status: 'Active' | 'Inactive';
  cpuQuota: number;
  cpuUsed: number;
  memQuota: number;
  memUsed: number;
  storageQuota: number;
  storageUsed: number;
  workloadCount: number;
  memberCount: number;
  costMonth: number;
  createdAt: string;
}

export interface ProjectMember {
  userId: string;
  username: string;
  role: 'Project Owner' | 'Developer' | 'Viewer';
  addedAt: string;
}

export interface ProjectNamespace {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  cpuLimit: number;
  memLimit: number;
  cpuUsed: number;
  memUsed: number;
  policyStatus: 'Compliant' | 'NonCompliant';
  createdAt: string;
}

// --- Cluster Inspection Types ---

export interface ClusterInspectionReport {
  id: string;
  clusterId: string;
  score: number;
  status: 'Pass' | 'Warning' | 'Fail';
  riskLevel: 'Low' | 'Medium' | 'High';
  timestamp: string;
  durationSeconds: number;
  items: ClusterInspectionItem[];
}

export interface ClusterInspectionItem {
  id: string;
  name: string;
  category: string;
  status: 'Pass' | 'Warning' | 'Fail';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  message: string;
  recommendation?: string;
}

// Compatibility types
export interface MonitoringPanel { id: string; title: string; type: string; metric: string; unit: string; color: string; data: any[]; }
export interface MonitoringDashboard { id: string; name: string; source: string; panels: MonitoringPanel[]; }
export interface Workload { id: string; name: string; type: string; namespace: string; replicas: number; availableReplicas: number; image: string; status: string; cpuRequest: string; memRequest: string; createdAt: string; }
export interface Pod { id: string; name: string; namespace: string; node: string; status: string; restarts: number; age: string; ip: string; cpuUsage: string; memUsage: string; }

// --- Application Specific Types ---
export interface ApplicationScalingMetric {
  id: string;
  metricType: string;
  targetValue: number;
  unit: string;
}

export interface ApplicationScalingSchedule {
  id: string;
  name: string;
  schedule: string;
  targetReplicas: number;
  enabled: boolean;
}

export interface ApplicationScalingConfig {
  enabled: boolean;
  minReplicas: number;
  maxReplicas: number;
  currentReplicas: number;
  metrics: ApplicationScalingMetric[];
  schedules: ApplicationScalingSchedule[];
}

export interface ApplicationRevision {
  revision: number;
  image: string;
  message: string;
  createdAt: string;
  current: boolean;
}

export interface ApplicationTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  maintainer: string;
  icon: string;
}

export interface Application {
  id: string;
  name: string;
  namespace: string;
  version: string;
  status: string;
  healthScore: number;
  description: string;
  resources: any;
  metrics: any;
  scalingConfig: ApplicationScalingConfig;
  createdAt: string;
  updatedAt: string;
}
