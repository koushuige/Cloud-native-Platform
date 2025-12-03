
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClusterList } from './components/ClusterList';
import { Operations } from './components/Operations';
import { Applications } from './components/Applications';
import { Network } from './components/Network';
import { Storage } from './components/Storage';
import { Middleware } from './components/Middleware';
import { Settings } from './components/Settings';
import { View, Cluster, ClusterStatus, Node } from './types';

// Helper to generate mock nodes
const generateNodes = (count: number, prefix: string): Node[] => {
  return Array.from({ length: count }).map((_, i) => ({
    name: `${prefix}-worker-${i + 1}`,
    ip: `10.0.10.${100 + i}`,
    cpuUsage: Math.floor(Math.random() * 60) + 10,
    memoryUsage: Math.floor(Math.random() * 70) + 20,
    status: Math.random() > 0.95 ? 'NotReady' : 'Ready',
    osImage: 'Ubuntu 22.04.2 LTS'
  }));
};

// Mock Data
const mockClusters: Cluster[] = [
  { 
    id: 'cls-1234', 
    name: 'production-k8s', 
    version: 'v1.28.2', 
    nodes: 12, 
    cpuUsage: 78, 
    memoryUsage: 62, 
    status: ClusterStatus.RUNNING, 
    provider: 'AWS',
    nodeList: generateNodes(12, 'prod')
  },
  { 
    id: 'cls-5678', 
    name: 'staging-k8s', 
    version: 'v1.29.0', 
    nodes: 3, 
    cpuUsage: 24, 
    memoryUsage: 35, 
    status: ClusterStatus.RUNNING, 
    provider: 'Aliyun',
    nodeList: generateNodes(3, 'stage')
  },
  { 
    id: 'cls-9012', 
    name: 'dev-cluster-01', 
    version: 'v1.27.5', 
    nodes: 1, 
    cpuUsage: 0, 
    memoryUsage: 0, 
    status: ClusterStatus.PROVISIONING, 
    provider: 'OnPremise',
    nodeList: []
  },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard clusters={mockClusters} />;
      case View.CLUSTERS:
        return <ClusterList clusters={mockClusters} />;
      case View.OPERATIONS:
        return <Operations />;
      case View.APPLICATIONS:
        return <Applications />;
      case View.NETWORK:
        return <Network />;
      case View.STORAGE:
        return <Storage />;
      case View.MIDDLEWARE:
        return <Middleware />;
      case View.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard clusters={mockClusters} />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;