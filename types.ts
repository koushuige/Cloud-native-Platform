
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

// --- Monitoring & Dashboards ---

export interface MonitoringDashboard {
  id: string;
  name: string;
  source: 'System' | 'Grafana' | 'Custom';
  panels: MonitoringPanel[];
}

export interface MonitoringPanel {
  id: string;
  title: string;
  type: 'Area' | 'Line' | 'Bar' | 'Pie';
  metric: string;
  unit: string;
  color: string;
  data?: any[]; // Mock data for visualization
}

// --- Project Management Types ---

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Archived';
  clusterId: string; // Bound cluster
  
  // Quotas
  cpuQuota: number; // Cores
  cpuUsed: number;
  memQuota: number; // GiB
  memUsed: number;
  storageQuota: number; // GiB
  storageUsed: number;
  
  // Stats
  workloadCount: number;
  memberCount: number;
  costMonth: number; // Estimated cost
  createdAt: string;
}

export interface ProjectNamespace {
  id: string;
  name: string;
  status: 'Active' | 'Terminating';
  cpuLimit: number; // Cores assigned to this NS
  memLimit: number; // GiB assigned to this NS
  cpuUsed: number; // Actual usage
  memUsed: number; // Actual usage
  policyStatus: 'Compliant' | 'NonCompliant';
  createdAt: string;
}

export interface ProjectMember {
  userId: string;
  username: string;
  role: 'Project Owner' | 'Developer' | 'Viewer';
  addedAt: string;
}

// --- Application / Workload Types ---

export type ScalingMetricType = 'CPU' | 'Memory' | 'NetworkIn' | 'NetworkOut' | 'StorageRead' | 'StorageWrite' | 'Custom';

export interface ScalingRule {
  id: string;
  metricType: ScalingMetricType;
  targetValue: number;
  unit: string; // '%', 'Mbps', 'MiB', 'Count'
  customMetricName?: string;
}

export interface ScheduledScalingRule {
  id: string;
  name: string;
  schedule: string; // Cron expression
  targetReplicas: number;
  enabled: boolean;
  timezone?: string;
}

export interface ApplicationScalingConfig {
  enabled: boolean;
  minReplicas: number;
  maxReplicas: number;
  currentReplicas: number;
  metrics: ScalingRule[];
  schedules: ScheduledScalingRule[];
}

export interface Application {
  id: string;
  name: string;
  namespace: string;
  version: string;
  status: 'Healthy' | 'Degraded' | 'Progressing' | 'Stopped';
  healthScore: number;
  description?: string;
  resources: {
    workloads: string[]; // Workload IDs
    services: string[];  // Service IDs
    ingresses: string[]; // Ingress IDs
    configMaps: string[]; // ConfigMap IDs
  };
  metrics?: {
    cpu: string;
    memory: string;
    requests: string; // RPS
  };
  scalingConfig?: ApplicationScalingConfig;
  createdAt: string;
  updatedAt: string;
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
  icon?: string; // Icon name or URL
  maintainer?: string;
}

export interface K8sEvent {
  id: string;
  type: 'Normal' | 'Warning';
  reason: string;
  message: string;
  object: string;
  count: number;
  lastSeen: string;
}

export interface AppLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export interface Workload {
  id: string;
  name: string;
  type: 'Deployment' | 'StatefulSet' | 'DaemonSet' | 'Job' | 'CronJob';
  namespace: string;
  replicas: number;
  availableReplicas: number;
  image: string;
  status: 'Healthy' | 'Progressing' | 'Degraded' | 'Suspended';
  cpuRequest?: string;
  memRequest?: string;
  createdAt: string;
  scaling?: ApplicationScalingConfig; // Embedded scaling config for workload view
}

export interface Pod {
  id: string;
  name: string;
  namespace: string;
  node: string;
  status: 'Running' | 'Pending' | 'Failed' | 'Succeeded';
  restarts: number;
  age: string;
  ip: string;
  cpuUsage?: string;
  memUsage?: string;
}

export interface HPA {
  id: string;
  name: string;
  targetRef: string;
  minReplicas: number;
  maxReplicas: number;
  currentReplicas: number;
  metrics: { type: string; current: string; target: string }[];
}

export interface ConfigMap {
  id: string;
  name: string;
  namespace: string;
  keys: string[];
  age: string;
}

// --- Network Types ---

export interface Service {
  id: string;
  name: string;
  namespace: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName';
  clusterIP: string;
  ports: string[]; // e.g., "80:30080/TCP"
  selector: Record<string, string>;
  protocol: 'TCP' | 'UDP' | 'SCTP';
  sessionAffinity?: 'ClientIP' | 'None';
}

export interface Ingress {
  id: string;
  name: string;
  namespace: string;
  loadBalancerIP?: string;
  rules: { host: string; path: string; backend: string }[];
  tls?: boolean;
  certificate?: string;
}

export interface NetworkPolicy {
  id: string;
  name: string;
  namespace: string;
  podSelector: string; // e.g. "app=db"
  policyTypes: ('Ingress' | 'Egress')[];
  ingressRules?: { from: string; ports: string }[];
  egressRules?: { to: string; ports: string }[];
  age: string;
  scope: 'Project' | 'Namespace' | 'Pod';
}

export interface IPPool {
  id: string;
  name: string;
  cidr: string;
  gateway: string;
  vlan: number;
  totalIPs: number;
  usedIPs: number;
  namespaceBinding?: string[]; // Bound namespaces
  status: 'Healthy' | 'Exhausted';
}

export interface IPAllocation {
  ip: string;
  podName: string;
  namespace: string;
  node: string;
  isStatic: boolean; // Is fixed IP
  lastDrift?: string; // e.g. "Migrated from node-1 to node-2"
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
  metric: 'Retransmission' | 'DropRate' | 'Latency' | 'ConnFailure';
  operator: '>' | '<';
  threshold: number;
  unit: string;
  enabled: boolean;
}

// --- Storage Types (Advanced) ---

export interface StorageClass {
  id: string;
  name: string;
  provisioner: string; // e.g., "ceph.rook.io/block"
  reclaimPolicy: 'Delete' | 'Retain';
  volumeBindingMode: 'Immediate' | 'WaitForFirstConsumer';
  allowVolumeExpansion?: boolean;
}

export interface PersistentVolume {
  id: string;
  name: string;
  capacity: string;
  accessModes: string[];
  reclaimPolicy: string;
  status: 'Available' | 'Bound' | 'Released' | 'Failed';
  claimRef?: string;
  storageClass: string;
  age: string;
}

export interface PersistentVolumeClaim {
  id: string;
  name: string;
  namespace: string;
  status: 'Bound' | 'Pending' | 'Lost';
  capacity: string;
  storageClass: string;
  accessModes: ('RWO' | 'RWX' | 'ROX')[];
  age: string;
  volumeName?: string;
  usedPercentage?: number; // For monitoring
}

export interface CsiDriver {
  id: string;
  name: string;
  type: 'Ceph' | 'Minio' | 'Topolvm' | 'EBS' | 'AzureDisk' | 'Generic';
  provisioner: string; // e.g., "ebs.csi.aws.com"
  status: 'Healthy' | 'Degraded' | 'Unknown' | 'Installing';
  version: string;
  nodesRegistered: number;
  createdAt: string;
  components?: {
    controller: 'Healthy' | 'Degraded';
    nodePlugin: 'Healthy' | 'Degraded';
  };
}

export interface VolumeSnapshot {
  id: string;
  name: string;
  namespace: string;
  sourcePvc: string;
  status: 'Ready' | 'Creating' | 'Error';
  size: string;
  createdAt: string;
  restoreSize: string;
}

// Ceph Specific
export interface CephPool {
  name: string;
  type: 'Replicated' | 'ErasureCoded';
  replicas: number;
  pgNum: number;
  used: string;
  status: 'Healthy' | 'Degraded';
  deviceClass?: 'ssd' | 'hdd' | 'nvme';
}

export interface CephOsd {
  id: number;
  host: string;
  status: 'Up' | 'Down';
  in: boolean;
  deviceClass: 'ssd' | 'hdd' | 'nvme';
  size: string;
  usedPercent: number;
}

export interface CephDeploymentConfig {
  name: string;
  namespace: string;
  nodes: string[];
  useAllDevices: boolean;
  deviceFilter: string;
  networkMode: 'host' | 'overlay';
}

export interface CephCrushNode {
  id: number;
  name: string;
  type: 'root' | 'datacenter' | 'rack' | 'host' | 'osd';
  status?: 'up' | 'down';
  weight: number;
  items?: CephCrushNode[];
}

export interface CephAlertPolicy {
  id: string;
  name: string;
  metric: 'capacity' | 'osd_status' | 'latency' | 'recovery';
  operator: '>' | '<' | '=';
  threshold: string;
  level: 'Warning' | 'Critical';
  enabled: boolean;
}

// Minio Specific
export interface MinioTenant {
  name: string;
  namespace: string;
  status: 'Healthy' | 'Degraded' | 'Initializing';
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
  policy: 'Public' | 'Private' | 'Custom';
  createdAt?: string;
  versioning?: boolean;
  retention?: string;
}

export interface MinioUser {
  accessKey: string;
  policy: string;
  status: 'Active' | 'Disabled';
  createdAt: string;
}

// Topolvm Specific
export interface TopolvmNode {
  name: string;
  ip: string;
  vgName: string;
  device: string;
  total: string;
  used: string;
  status: 'Ready' | 'NotReady';
}

export interface TopolvmLogicalVolume {
  id: string;
  name: string;
  node: string;
  size: string;
  deviceClass: string;
  status: 'Active' | 'Inactive';
  pvcRef?: string;
  createdAt: string;
}

export interface TopolvmDeviceClass {
  name: string;
  volumeGroup: string;
  default: boolean;
  spareGb: number;
}

// COSI (Container Object Storage Interface)
export interface BucketClaim {
  id: string;
  name: string;
  namespace: string;
  bucketClass: string;
  protocol: 'S3' | 'AzureBlob' | 'GCS';
  status: 'Bound' | 'Provisioning';
  accessSecret: string;
}

export interface StorageOperation {
  id: string;
  type: 'Expansion' | 'Snapshot' | 'Migration' | 'Backup' | 'HealthCheck';
  target: string;
  status: 'Completed' | 'Running' | 'Failed';
  startTime: string;
  endTime?: string;
  message?: string;
}


// --- Middleware Types ---

export interface KafkaConfigTemplate {
  id: string;
  name: string;
  description: string;
  type: 'System' | 'Custom';
  params: Record<string, string>;
  updatedAt: string;
}

export interface KafkaInstance {
  id: string;
  name: string;
  version: string;
  topics: number;
  partitions: number;
  status: 'Running' | 'Rebalancing' | 'Stopped' | 'Provisioning' | 'Restarting' | 'Upgrading' | 'Deleting';
  nodes?: number;
  memory?: string;
  storage?: string;
  configTemplateId?: string;
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
  mechanism: 'SCRAM-SHA-256' | 'SCRAM-SHA-512';
  access: 'Read' | 'Write' | 'Full';
}

export interface KafkaConsumerGroup {
  groupId: string;
  state: 'Stable' | 'Empty' | 'Dead' | 'Rebalancing';
  lag: number;
  members: number;
  topics: string[];
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

export interface KafkaInspectionReport {
  id: string;
  status: 'Pass' | 'Fail' | 'Warning';
  score: number;
  issuesFound: number;
  timestamp: string;
  items?: KafkaInspectionItem[];
}

export interface KafkaInspectionItem {
  name: string;
  category: 'Configuration' | 'Resource' | 'Availability' | 'Performance';
  status: 'Pass' | 'Fail' | 'Warning';
  message: string;
  suggestion?: string;
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
  operator: '>' | '<' | '=';
  threshold: number;
  duration: string;
  level: 'Critical' | 'Warning' | 'Info';
  channels: string[]; // e.g., ['Email', 'DingTalk']
  enabled: boolean;
  isPreset?: boolean;
}

export interface KafkaAlertRecord {
  id: string;
  ruleName: string;
  level: 'Critical' | 'Warning' | 'Info';
  status: 'Firing' | 'Resolved';
  triggerTime: string;
  resolveTime?: string;
  content: string;
}

// --- Cluster Inspection Types ---

export interface ClusterInspectionReport {
  id: string;
  clusterId: string;
  score: number;
  status: 'Pass' | 'Fail' | 'Warning';
  riskLevel: 'High' | 'Medium' | 'Low' | 'None';
  timestamp: string;
  durationSeconds: number;
  items: ClusterInspectionItem[];
}

export interface ClusterInspectionItem {
  id: string;
  name: string;
  category: 'Infrastructure' | 'Component' | 'Workload' | 'Security';
  status: 'Pass' | 'Fail' | 'Warning' | 'Info';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  message: string;
  recommendation?: string;
}

export enum View {
  DASHBOARD = 'dashboard',
  CLUSTERS = 'clusters',
  OPERATIONS = 'operations',
  APPLICATIONS = 'applications',
  NETWORK = 'network',
  STORAGE = 'storage',
  MIDDLEWARE = 'middleware',
  SETTINGS = 'settings'
}
