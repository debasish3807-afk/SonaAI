/**
 * SONA AI — Workspace & Project Service (Mock Layer)
 * Ready for Firebase integration
 */

export interface Workspace {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'personal' | 'team' | 'project';
  members?: number;
  itemCount: number;
  lastActivity: string;
  isPinned?: boolean;
  storageUsed: number;
  storageCap: number;
  tags: string[];
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived' | 'paused';
  type: 'ai_app' | 'website' | 'research' | 'content' | 'general';
  progress: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  completedTasks: number;
  color: string;
  icon: string;
  tags: string[];
  collaborators?: number;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'image' | 'audio' | 'video' | 'code' | 'archive';
  size?: number;
  path: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  mimeType?: string;
  icon: string;
  color: string;
  isStarred?: boolean;
  isShared?: boolean;
  thumbnailUrl?: string;
}

export interface BackupEntry {
  id: string;
  name: string;
  type: 'auto' | 'manual' | 'cloud';
  size: string;
  itemCount: number;
  status: 'completed' | 'in_progress' | 'failed';
  createdAt: string;
  description: string;
  includes: string[];
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'api_key_added' | 'permission_changed' | 'suspicious' | 'export';
  description: string;
  device: string;
  location: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  isResolved?: boolean;
}

export interface APIKey {
  id: string;
  name: string;
  provider: string;
  key: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  requestCount: number;
  monthlyBudget?: number;
  currentSpend?: number;
  color: string;
  icon: string;
}

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'w1',
    name: 'Personal Hub',
    description: 'Your personal AI workspace for daily tasks and projects',
    icon: 'person',
    color: '#7C6FFF',
    type: 'personal',
    itemCount: 84,
    lastActivity: '2m ago',
    isPinned: true,
    storageUsed: 2.4,
    storageCap: 10,
    tags: ['personal', 'daily'],
  },
  {
    id: 'w2',
    name: 'SONA Dev Team',
    description: 'Collaborative workspace for the SONA development team',
    icon: 'group',
    color: '#00D4FF',
    type: 'team',
    members: 6,
    itemCount: 312,
    lastActivity: '15m ago',
    isPinned: true,
    storageUsed: 18.7,
    storageCap: 100,
    tags: ['team', 'development'],
  },
  {
    id: 'w3',
    name: 'AI Research Lab',
    description: 'Research papers, experiments, and findings on AI models',
    icon: 'science',
    color: '#00E676',
    type: 'project',
    itemCount: 156,
    lastActivity: '1h ago',
    storageUsed: 8.2,
    storageCap: 50,
    tags: ['research', 'ai'],
  },
  {
    id: 'w4',
    name: 'Content Studio',
    description: 'AI-generated content, images, and creative projects',
    icon: 'palette',
    color: '#FF6B9D',
    type: 'project',
    itemCount: 247,
    lastActivity: '3h ago',
    storageUsed: 14.1,
    storageCap: 50,
    tags: ['content', 'creative'],
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'pr1',
    workspaceId: 'w1',
    name: 'SONA Mobile App',
    description: 'Building the next generation AI assistant mobile application',
    status: 'active',
    type: 'ai_app',
    progress: 68,
    deadline: '2025-09-30',
    createdAt: '2025-01-15',
    updatedAt: new Date().toISOString(),
    taskCount: 48,
    completedTasks: 33,
    color: '#7C6FFF',
    icon: 'phone-android',
    tags: ['react-native', 'ai', 'mobile'],
    collaborators: 4,
  },
  {
    id: 'pr2',
    workspaceId: 'w2',
    name: 'AI Research Summary',
    description: 'Compiling and summarizing latest AI research for team reports',
    status: 'active',
    type: 'research',
    progress: 45,
    createdAt: '2025-05-10',
    updatedAt: new Date().toISOString(),
    taskCount: 20,
    completedTasks: 9,
    color: '#00E676',
    icon: 'science',
    tags: ['research', 'llm', 'papers'],
    collaborators: 3,
  },
  {
    id: 'pr3',
    workspaceId: 'w3',
    name: 'Marketing Website',
    description: 'AI-generated marketing website for SONA launch campaign',
    status: 'completed',
    type: 'website',
    progress: 100,
    deadline: '2025-06-01',
    createdAt: '2025-04-01',
    updatedAt: '2025-06-01',
    taskCount: 32,
    completedTasks: 32,
    color: '#FF9800',
    icon: 'language',
    tags: ['website', 'marketing'],
  },
  {
    id: 'pr4',
    workspaceId: 'w4',
    name: 'Content Batch Q3',
    description: 'AI-generated blog posts, social media content, and newsletters',
    status: 'paused',
    type: 'content',
    progress: 30,
    deadline: '2025-09-15',
    createdAt: '2025-07-01',
    updatedAt: new Date().toISOString(),
    taskCount: 60,
    completedTasks: 18,
    color: '#FF6B9D',
    icon: 'article',
    tags: ['content', 'social', 'blog'],
    collaborators: 2,
  },
];

export const MOCK_FILES: FileItem[] = [
  { id: 'f1', name: 'Documents', type: 'folder', path: '/Documents', createdAt: '2025-01-01', updatedAt: new Date().toISOString(), icon: 'folder', color: '#F5C842' },
  { id: 'f2', name: 'Images', type: 'folder', path: '/Images', createdAt: '2025-01-01', updatedAt: new Date().toISOString(), icon: 'folder', color: '#7C6FFF' },
  { id: 'f3', name: 'Code', type: 'folder', path: '/Code', createdAt: '2025-01-01', updatedAt: new Date().toISOString(), icon: 'folder', color: '#00D4FF', isStarred: true },
  { id: 'f4', name: 'SONA Product Brief.pdf', type: 'document', size: 2457600, path: '/Documents/SONA Product Brief.pdf', parentId: 'f1', createdAt: '2025-03-10', updatedAt: '2025-06-01', mimeType: 'application/pdf', icon: 'picture-as-pdf', color: '#FF5252', isStarred: true },
  { id: 'f5', name: 'AI Research Papers.zip', type: 'archive', size: 15728640, path: '/Documents/AI Research Papers.zip', parentId: 'f1', createdAt: '2025-04-15', updatedAt: '2025-04-15', icon: 'archive', color: '#FF9800' },
  { id: 'f6', name: 'hero-image-v3.png', type: 'image', size: 4194304, path: '/Images/hero-image-v3.png', parentId: 'f2', createdAt: '2025-06-01', updatedAt: '2025-06-01', mimeType: 'image/png', icon: 'image', color: '#00E676', thumbnailUrl: 'https://images.unsplash.com/photo-1681266895901-91b24c1a5a05?w=200' },
  { id: 'f7', name: 'ai-art-collection.zip', type: 'archive', size: 134217728, path: '/Images/ai-art-collection.zip', parentId: 'f2', createdAt: '2025-07-01', updatedAt: '2025-07-01', icon: 'archive', color: '#7C6FFF' },
  { id: 'f8', name: 'sona-app', type: 'folder', path: '/Code/sona-app', parentId: 'f3', createdAt: '2025-02-01', updatedAt: new Date().toISOString(), icon: 'folder', color: '#00D4FF' },
  { id: 'f9', name: 'app.tsx', type: 'code', size: 10240, path: '/Code/sona-app/app.tsx', parentId: 'f8', createdAt: '2025-02-01', updatedAt: new Date().toISOString(), mimeType: 'text/typescript', icon: 'code', color: '#00D4FF' },
  { id: 'f10', name: 'voice-recording-01.mp3', type: 'audio', size: 8388608, path: '/Documents/voice-recording-01.mp3', parentId: 'f1', createdAt: '2025-07-01', updatedAt: '2025-07-01', mimeType: 'audio/mpeg', icon: 'audiotrack', color: '#FF6B9D' },
];

export const MOCK_BACKUPS: BackupEntry[] = [
  {
    id: 'b1',
    name: 'Full Backup — July 5',
    type: 'manual',
    size: '47.2 MB',
    itemCount: 312,
    status: 'completed',
    createdAt: new Date().toISOString(),
    description: 'Complete backup of all SONA data including chats, memories, and files',
    includes: ['Chat History', 'Memories', 'Knowledge Vault', 'AI Images', 'Settings'],
  },
  {
    id: 'b2',
    name: 'Auto Backup — July 4',
    type: 'auto',
    size: '44.8 MB',
    itemCount: 298,
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    description: 'Automated daily backup',
    includes: ['Chat History', 'Memories', 'Settings'],
  },
  {
    id: 'b3',
    name: 'Cloud Sync — July 3',
    type: 'cloud',
    size: '43.1 MB',
    itemCount: 287,
    status: 'completed',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    description: 'Incremental cloud sync backup',
    includes: ['Chat History', 'Memories', 'Knowledge Vault'],
  },
  {
    id: 'b4',
    name: 'Auto Backup — July 3',
    type: 'auto',
    size: '0 MB',
    itemCount: 0,
    status: 'failed',
    createdAt: new Date(Date.now() - 180000000).toISOString(),
    description: 'Backup failed due to insufficient storage',
    includes: [],
  },
];

export const MOCK_SECURITY_EVENTS: SecurityEvent[] = [
  { id: 'se1', type: 'login', description: 'Signed in successfully', device: 'iPhone 15 Pro', location: 'New York, US', timestamp: new Date(Date.now() - 120000).toISOString(), severity: 'low' },
  { id: 'se2', type: 'api_key_added', description: 'Gemini API key added', device: 'MacBook Pro', location: 'New York, US', timestamp: new Date(Date.now() - 3600000).toISOString(), severity: 'medium' },
  { id: 'se3', type: 'login', description: 'Signed in from new device', device: 'iPad Air', location: 'New York, US', timestamp: new Date(Date.now() - 86400000).toISOString(), severity: 'medium', isResolved: true },
  { id: 'se4', type: 'export', description: 'Data export requested', device: 'iPhone 15 Pro', location: 'New York, US', timestamp: new Date(Date.now() - 172800000).toISOString(), severity: 'low' },
];

export const MOCK_API_KEYS: APIKey[] = [
  { id: 'k1', name: 'Gemini API Key', provider: 'Google Gemini', key: 'AIza••••••••••••••••••••••••K3s8', isActive: true, createdAt: '2025-06-01', lastUsed: '2m ago', requestCount: 14872, monthlyBudget: 50, currentSpend: 12.40, color: '#4285F4', icon: 'auto-awesome' },
  { id: 'k2', name: 'OpenAI Key', provider: 'OpenAI', key: 'sk-proj-••••••••••••••••••••••••WXYZ', isActive: false, createdAt: '2025-04-15', lastUsed: '3d ago', requestCount: 523, monthlyBudget: 20, currentSpend: 0, color: '#10A37F', icon: 'psychology' },
  { id: 'k3', name: 'ElevenLabs Key', provider: 'ElevenLabs', key: 'el_••••••••••••••••••••••••Ab2z', isActive: false, createdAt: '2025-07-01', requestCount: 0, color: '#F59E0B', icon: 'mic' },
];

class WorkspaceService {
  async getWorkspaces(): Promise<Workspace[]> {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_WORKSPACES;
  }

  async getProjects(workspaceId?: string): Promise<Project[]> {
    await new Promise(r => setTimeout(r, 200));
    if (workspaceId) return MOCK_PROJECTS.filter(p => p.workspaceId === workspaceId);
    return MOCK_PROJECTS;
  }

  async getFiles(parentId?: string): Promise<FileItem[]> {
    await new Promise(r => setTimeout(r, 200));
    if (parentId) return MOCK_FILES.filter(f => f.parentId === parentId);
    return MOCK_FILES.filter(f => !f.parentId);
  }

  async getBackups(): Promise<BackupEntry[]> {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_BACKUPS;
  }

  async createBackup(): Promise<BackupEntry> {
    await new Promise(r => setTimeout(r, 2000));
    return MOCK_BACKUPS[0];
  }

  async getSecurityEvents(): Promise<SecurityEvent[]> {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_SECURITY_EVENTS;
  }

  async getAPIKeys(): Promise<APIKey[]> {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_API_KEYS;
  }

  async formatBytes(bytes: number): Promise<string> {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }
}

export const workspaceService = new WorkspaceService();
export default workspaceService;
