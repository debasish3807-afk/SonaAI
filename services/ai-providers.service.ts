/**
 * SONA AI — AI Providers Service (Mock Layer)
 * Production-ready interface for future integration with:
 * Gemini AI, OpenAI, Claude, DeepSeek, Grok, ElevenLabs, Whisper, Stability AI, Replicate
 */

export type AIProvider =
  | 'gemini'
  | 'openai'
  | 'claude'
  | 'deepseek'
  | 'grok'
  | 'elevenlabs'
  | 'whisper'
  | 'stability'
  | 'replicate'
  | 'sona';

export type ModelCapability =
  | 'text'
  | 'vision'
  | 'audio'
  | 'image_gen'
  | 'video_gen'
  | 'code'
  | 'embedding'
  | 'tts'
  | 'stt';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  capabilities: ModelCapability[];
  contextWindow: number;
  maxOutput: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  isDefault?: boolean;
  isAvailable: boolean;
  isBeta?: boolean;
  isNew?: boolean;
  description: string;
  version: string;
  releaseDate: string;
  benchmark?: {
    mmlu?: number;
    humanEval?: number;
    gsm8k?: number;
  };
  tags: string[];
}

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  icon: string;
  color: string;
  description: string;
  website: string;
  isEnabled: boolean;
  apiKey?: string;
  models: AIModel[];
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: PromptCategory;
  tags: string[];
  icon: string;
  color: string;
  usageCount: number;
  isFavorite?: boolean;
  variables?: PromptVariable[];
  author?: string;
  rating?: number;
}

export interface PromptVariable {
  name: string;
  label: string;
  type: 'text' | 'select' | 'number';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export type PromptCategory =
  | 'writing'
  | 'coding'
  | 'analysis'
  | 'creative'
  | 'business'
  | 'education'
  | 'productivity'
  | 'fun'
  | 'image';

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  color: string;
  capabilities: string[];
  model: string;
  status: 'active' | 'idle' | 'training' | 'error';
  tasks: number;
  successRate: number;
  isCustom?: boolean;
  systemPrompt?: string;
  lastUsed?: string;
}

export interface AIPlugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  isInstalled: boolean;
  isEnabled?: boolean;
  version: string;
  author: string;
  rating: number;
  downloads: number;
  permissions: string[];
  changelog?: string;
  isOfficial?: boolean;
  isFeatured?: boolean;
}

export const MOCK_AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: 'auto-awesome',
    color: '#4285F4',
    description: 'Google\'s most capable AI models with multimodal reasoning',
    website: 'https://ai.google.dev',
    isEnabled: true,
    models: [
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'gemini',
        capabilities: ['text', 'vision', 'code', 'audio'],
        contextWindow: 2000000,
        maxOutput: 8192,
        inputCostPer1M: 3.5,
        outputCostPer1M: 10.5,
        isDefault: true,
        isAvailable: true,
        isNew: true,
        description: 'Most capable Gemini model with 2M context window and advanced reasoning',
        version: '2.5',
        releaseDate: '2025-03',
        benchmark: { mmlu: 91.0, humanEval: 88.5, gsm8k: 97.0 },
        tags: ['flagship', 'multimodal', 'long-context'],
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'gemini',
        capabilities: ['text', 'vision', 'code'],
        contextWindow: 1000000,
        maxOutput: 8192,
        inputCostPer1M: 0.1,
        outputCostPer1M: 0.4,
        isAvailable: true,
        description: 'Fast and efficient model optimized for speed and cost',
        version: '2.0',
        releaseDate: '2025-01',
        benchmark: { mmlu: 87.0, humanEval: 82.0, gsm8k: 95.0 },
        tags: ['fast', 'efficient', 'recommended'],
      },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'psychology',
    color: '#10A37F',
    description: 'GPT-4 and o-series reasoning models from OpenAI',
    website: 'https://openai.com',
    isEnabled: false,
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        capabilities: ['text', 'vision', 'code', 'audio'],
        contextWindow: 128000,
        maxOutput: 4096,
        inputCostPer1M: 5.0,
        outputCostPer1M: 15.0,
        isAvailable: true,
        description: 'Omni model with text, vision and audio in one package',
        version: '4o',
        releaseDate: '2024-05',
        benchmark: { mmlu: 88.7, humanEval: 90.2, gsm8k: 96.1 },
        tags: ['flagship', 'multimodal'],
      },
      {
        id: 'o3',
        name: 'o3 Reasoning',
        provider: 'openai',
        capabilities: ['text', 'code'],
        contextWindow: 200000,
        maxOutput: 100000,
        inputCostPer1M: 10.0,
        outputCostPer1M: 40.0,
        isAvailable: true,
        isBeta: true,
        isNew: true,
        description: 'Advanced reasoning model for complex problems',
        version: 'o3',
        releaseDate: '2025-04',
        benchmark: { mmlu: 96.7, humanEval: 99.5, gsm8k: 99.2 },
        tags: ['reasoning', 'coding', 'math'],
      },
    ],
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    icon: 'chat-bubble',
    color: '#D4704A',
    description: 'Claude models with best-in-class safety and reasoning',
    website: 'https://anthropic.com',
    isEnabled: false,
    models: [
      {
        id: 'claude-3-7-sonnet',
        name: 'Claude 3.7 Sonnet',
        provider: 'claude',
        capabilities: ['text', 'vision', 'code'],
        contextWindow: 200000,
        maxOutput: 8192,
        inputCostPer1M: 3.0,
        outputCostPer1M: 15.0,
        isAvailable: true,
        isNew: true,
        description: 'Best balance of speed, intelligence and safety',
        version: '3.7',
        releaseDate: '2025-02',
        benchmark: { mmlu: 90.0, humanEval: 93.7, gsm8k: 97.1 },
        tags: ['balanced', 'safe', 'reasoning'],
      },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: 'explore',
    color: '#2563EB',
    description: 'Open-source frontier models with strong coding capabilities',
    website: 'https://deepseek.com',
    isEnabled: false,
    models: [
      {
        id: 'deepseek-r2',
        name: 'DeepSeek R2',
        provider: 'deepseek',
        capabilities: ['text', 'code'],
        contextWindow: 128000,
        maxOutput: 8192,
        inputCostPer1M: 0.55,
        outputCostPer1M: 2.19,
        isAvailable: true,
        isNew: true,
        description: 'State-of-the-art reasoning model, cost-effective alternative',
        version: 'R2',
        releaseDate: '2025-05',
        benchmark: { mmlu: 90.8, humanEval: 96.0, gsm8k: 97.3 },
        tags: ['open-source', 'coding', 'reasoning'],
      },
    ],
  },
  {
    id: 'grok',
    name: 'xAI Grok',
    icon: 'bolt',
    color: '#9B59B6',
    description: 'Real-time knowledge models from xAI with web access',
    website: 'https://x.ai',
    isEnabled: false,
    models: [
      {
        id: 'grok-3',
        name: 'Grok 3',
        provider: 'grok',
        capabilities: ['text', 'vision', 'code'],
        contextWindow: 131072,
        maxOutput: 8192,
        inputCostPer1M: 3.0,
        outputCostPer1M: 15.0,
        isAvailable: true,
        description: 'Real-time AI with live web search and X data access',
        version: '3',
        releaseDate: '2025-02',
        benchmark: { mmlu: 87.5, humanEval: 88.0, gsm8k: 94.0 },
        tags: ['real-time', 'web-search'],
      },
    ],
  },
  {
    id: 'stability',
    name: 'Stability AI',
    icon: 'image',
    color: '#7C3AED',
    description: 'Open-source image and video generation models',
    website: 'https://stability.ai',
    isEnabled: false,
    models: [
      {
        id: 'stable-diffusion-3-5',
        name: 'Stable Diffusion 3.5',
        provider: 'stability',
        capabilities: ['image_gen'],
        contextWindow: 0,
        maxOutput: 0,
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        isAvailable: true,
        description: 'Latest SD model with photorealistic quality and prompt adherence',
        version: '3.5',
        releaseDate: '2024-10',
        tags: ['image', 'photorealistic', 'open-source'],
      },
    ],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    icon: 'mic',
    color: '#F59E0B',
    description: 'Ultra-realistic voice synthesis and cloning',
    website: 'https://elevenlabs.io',
    isEnabled: false,
    models: [
      {
        id: 'eleven-turbo-v2-5',
        name: 'Turbo v2.5',
        provider: 'elevenlabs',
        capabilities: ['tts'],
        contextWindow: 0,
        maxOutput: 0,
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        isAvailable: true,
        description: 'Ultra-low latency voice with near-human quality',
        version: '2.5',
        releaseDate: '2024-11',
        tags: ['voice', 'low-latency', 'realistic'],
      },
    ],
  },
  {
    id: 'whisper',
    name: 'OpenAI Whisper',
    icon: 'hearing',
    color: '#06B6D4',
    description: 'State-of-the-art speech recognition and transcription',
    website: 'https://openai.com/whisper',
    isEnabled: false,
    models: [
      {
        id: 'whisper-large-v3',
        name: 'Whisper Large v3',
        provider: 'whisper',
        capabilities: ['stt'],
        contextWindow: 0,
        maxOutput: 0,
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        isAvailable: true,
        description: 'Best-in-class speech-to-text with 99 language support',
        version: 'large-v3',
        releaseDate: '2024-03',
        tags: ['speech', 'multilingual', 'transcription'],
      },
    ],
  },
];

export const MOCK_PROMPTS: PromptTemplate[] = [
  {
    id: 'p1',
    title: 'Expert Code Reviewer',
    description: 'Get detailed, actionable code review feedback',
    prompt: 'Review the following {{language}} code as a senior engineer. Identify bugs, security issues, performance bottlenecks, and suggest improvements with examples:\n\n```{{code}}```',
    category: 'coding',
    tags: ['code', 'review', 'debugging'],
    icon: 'code',
    color: '#7C6FFF',
    usageCount: 2847,
    rating: 4.9,
    variables: [
      { name: 'language', label: 'Programming Language', type: 'select', options: ['TypeScript', 'Python', 'Rust', 'Go', 'JavaScript', 'Swift', 'Kotlin'], required: true },
      { name: 'code', label: 'Your Code', type: 'text', placeholder: 'Paste your code here...', required: true },
    ],
  },
  {
    id: 'p2',
    title: 'Business Plan Generator',
    description: 'Create comprehensive business plans from your idea',
    prompt: 'Create a detailed business plan for {{idea}}. Include: Executive Summary, Market Analysis, Revenue Model, Go-to-Market Strategy, Financial Projections (3 years), and Risk Analysis. Target market: {{target_market}}.',
    category: 'business',
    tags: ['business', 'startup', 'planning'],
    icon: 'business-center',
    color: '#FF9800',
    usageCount: 1923,
    rating: 4.8,
    variables: [
      { name: 'idea', label: 'Business Idea', type: 'text', placeholder: 'e.g., AI-powered fitness app for seniors', required: true },
      { name: 'target_market', label: 'Target Market', type: 'text', placeholder: 'e.g., US market, 60+ demographic', required: true },
    ],
  },
  {
    id: 'p3',
    title: 'Creative Story Writer',
    description: 'Generate compelling stories with your parameters',
    prompt: 'Write an engaging short story (800-1200 words) in the {{genre}} genre. Protagonist: {{protagonist}}. Setting: {{setting}}. Central conflict: {{conflict}}. Include vivid descriptions and surprising twists.',
    category: 'creative',
    tags: ['writing', 'fiction', 'story'],
    icon: 'auto-stories',
    color: '#FF6B9D',
    usageCount: 3210,
    rating: 4.7,
    variables: [
      { name: 'genre', label: 'Genre', type: 'select', options: ['Sci-Fi', 'Fantasy', 'Thriller', 'Romance', 'Mystery', 'Horror'], required: true },
      { name: 'protagonist', label: 'Main Character', type: 'text', placeholder: 'e.g., a time-traveling chef', required: true },
      { name: 'setting', label: 'Setting', type: 'text', placeholder: 'e.g., year 2087, Mars colony', required: true },
      { name: 'conflict', label: 'Central Conflict', type: 'text', placeholder: 'e.g., discovers a hidden truth about humanity', required: true },
    ],
  },
  {
    id: 'p4',
    title: 'Data Analyst',
    description: 'Analyze data and extract meaningful insights',
    prompt: 'Analyze the following data and provide: Key trends, Statistical insights, Anomalies or outliers, Actionable recommendations, and Visualization suggestions. Data type: {{data_type}}.\n\nData:\n{{data}}',
    category: 'analysis',
    tags: ['data', 'analysis', 'insights'],
    icon: 'analytics',
    color: '#00D4FF',
    usageCount: 1456,
    rating: 4.6,
    variables: [
      { name: 'data_type', label: 'Data Type', type: 'select', options: ['Sales Data', 'User Analytics', 'Financial Reports', 'Survey Results', 'Web Traffic'], required: true },
      { name: 'data', label: 'Your Data', type: 'text', placeholder: 'Paste your data, CSV, or description...', required: true },
    ],
  },
  {
    id: 'p5',
    title: 'Email Composer',
    description: 'Write professional emails for any context',
    prompt: 'Write a professional email for the following situation. Tone: {{tone}}. Recipient: {{recipient}}. Purpose: {{purpose}}. Key points to include: {{key_points}}. Keep it concise and impactful.',
    category: 'productivity',
    tags: ['email', 'communication', 'professional'],
    icon: 'email',
    color: '#00E676',
    usageCount: 4521,
    rating: 4.8,
    isFavorite: true,
    variables: [
      { name: 'tone', label: 'Tone', type: 'select', options: ['Formal', 'Friendly', 'Urgent', 'Apologetic', 'Persuasive', 'Informational'], required: true },
      { name: 'recipient', label: 'Recipient', type: 'text', placeholder: 'e.g., CEO, client, team member', required: true },
      { name: 'purpose', label: 'Purpose', type: 'text', placeholder: 'e.g., request a meeting, follow up on proposal', required: true },
      { name: 'key_points', label: 'Key Points', type: 'text', placeholder: 'Main things to cover...', required: false },
    ],
  },
  {
    id: 'p6',
    title: 'Learning Path Creator',
    description: 'Get a structured learning plan for any skill',
    prompt: 'Create a comprehensive {{duration}}-month learning path to master {{skill}}. My current level: {{level}}. Include: Weekly milestones, Recommended resources (books, courses, projects), Practice exercises, and Checkpoints to measure progress.',
    category: 'education',
    tags: ['learning', 'education', 'skills'],
    icon: 'school',
    color: '#F5C842',
    usageCount: 2103,
    rating: 4.9,
    variables: [
      { name: 'skill', label: 'Skill to Learn', type: 'text', placeholder: 'e.g., Machine Learning, Guitar, Japanese', required: true },
      { name: 'level', label: 'Current Level', type: 'select', options: ['Complete Beginner', 'Some Basics', 'Intermediate', 'Advanced'], required: true },
      { name: 'duration', label: 'Duration (months)', type: 'select', options: ['1', '3', '6', '12'], required: true },
    ],
  },
  {
    id: 'p7',
    title: 'Image Prompt Engineer',
    description: 'Generate perfect prompts for AI image tools',
    prompt: 'Create 5 detailed, optimized prompts for generating AI images of: {{subject}}. Style: {{style}}. For each prompt, include: subject details, environment, lighting, camera specs, artistic style, and quality modifiers. Make each prompt unique and progressively more detailed.',
    category: 'image',
    tags: ['image', 'midjourney', 'stable-diffusion', 'prompts'],
    icon: 'auto-fix-high',
    color: '#7C6FFF',
    usageCount: 3876,
    rating: 4.9,
    isFavorite: true,
    variables: [
      { name: 'subject', label: 'Image Subject', type: 'text', placeholder: 'e.g., futuristic city, portrait, landscape', required: true },
      { name: 'style', label: 'Art Style', type: 'select', options: ['Photorealistic', 'Digital Art', 'Oil Painting', 'Anime', 'Cinematic', 'Abstract', 'Watercolor'], required: true },
    ],
  },
  {
    id: 'p8',
    title: 'Debug Assistant',
    description: 'Fix bugs with step-by-step explanation',
    prompt: 'Help me debug this {{language}} error. Error message: {{error}}. Context: {{context}}. Provide: 1) Root cause analysis, 2) Step-by-step fix, 3) How to prevent this in future, 4) Fixed code example.',
    category: 'coding',
    tags: ['debugging', 'error', 'fix'],
    icon: 'bug-report',
    color: '#FF5252',
    usageCount: 5234,
    rating: 4.8,
    variables: [
      { name: 'language', label: 'Language/Framework', type: 'text', placeholder: 'e.g., React Native, Python', required: true },
      { name: 'error', label: 'Error Message', type: 'text', placeholder: 'Paste the error message...', required: true },
      { name: 'context', label: 'Code Context', type: 'text', placeholder: 'What were you trying to do?', required: false },
    ],
  },
];

export const MOCK_AI_AGENTS: AIAgent[] = [
  {
    id: 'a1',
    name: 'ARIA',
    description: 'Advanced Research & Insights Agent. Specializes in deep research, data analysis, and comprehensive reports.',
    avatar: 'search',
    color: '#7C6FFF',
    capabilities: ['Web Research', 'Data Analysis', 'Report Generation', 'Fact Checking', 'Citation Finding'],
    model: 'Gemini 2.5 Pro',
    status: 'active',
    tasks: 247,
    successRate: 97.2,
    lastUsed: '2m ago',
  },
  {
    id: 'a2',
    name: 'NOVA',
    description: 'Code Generation & Review Agent. Expert in full-stack development, debugging, and architecture design.',
    avatar: 'code',
    color: '#00D4FF',
    capabilities: ['Code Generation', 'Code Review', 'Bug Fixing', 'Architecture Design', 'Documentation'],
    model: 'Claude 3.7 Sonnet',
    status: 'active',
    tasks: 1823,
    successRate: 94.8,
    lastUsed: '1h ago',
  },
  {
    id: 'a3',
    name: 'MUSE',
    description: 'Creative Content Agent. Specializes in writing, storytelling, marketing copy, and creative ideation.',
    avatar: 'auto-stories',
    color: '#FF6B9D',
    capabilities: ['Content Writing', 'Storytelling', 'Marketing Copy', 'Brainstorming', 'Blog Posts'],
    model: 'GPT-4o',
    status: 'idle',
    tasks: 943,
    successRate: 96.5,
    lastUsed: '3h ago',
  },
  {
    id: 'a4',
    name: 'VEGA',
    description: 'Visual Design Agent. Creates image prompts, UI designs, and visual content strategies.',
    avatar: 'palette',
    color: '#00E676',
    capabilities: ['Image Prompting', 'Design Critique', 'UI/UX Feedback', 'Color Theory', 'Visual Strategy'],
    model: 'Gemini 2.5 Pro',
    status: 'idle',
    tasks: 512,
    successRate: 98.1,
    lastUsed: '6h ago',
  },
  {
    id: 'a5',
    name: 'ECHO',
    description: 'Voice & Audio Agent. Handles voice interactions, transcription, and audio content creation.',
    avatar: 'mic',
    color: '#F5C842',
    capabilities: ['Voice Synthesis', 'Transcription', 'Podcast Scripts', 'Audio Editing Notes', 'Pronunciation'],
    model: 'ElevenLabs Turbo',
    status: 'training',
    tasks: 128,
    successRate: 91.4,
  },
  {
    id: 'a6',
    name: 'SAGE',
    description: 'Knowledge & Learning Agent. Teaches complex topics, creates study plans, and explains concepts.',
    avatar: 'school',
    color: '#FF9800',
    capabilities: ['Concept Explanation', 'Study Plans', 'Q&A', 'Summarization', 'Quizzes'],
    model: 'Gemini 2.0 Flash',
    status: 'active',
    tasks: 3421,
    successRate: 99.1,
    lastUsed: '30m ago',
  },
];

export const MOCK_PLUGINS: AIPlugin[] = [
  {
    id: 'pl1',
    name: 'Web Browsing',
    description: 'Allow SONA to search and browse the web for real-time information and research',
    icon: 'travel-explore',
    color: '#4285F4',
    category: 'Connectivity',
    isInstalled: true,
    isEnabled: true,
    version: '2.4.1',
    author: 'SONA Team',
    rating: 4.9,
    downloads: 248000,
    permissions: ['Internet Access', 'URL Fetching'],
    isOfficial: true,
    isFeatured: true,
  },
  {
    id: 'pl2',
    name: 'Code Interpreter',
    description: 'Execute Python, JavaScript, and SQL code directly within SONA conversations',
    icon: 'terminal',
    color: '#10A37F',
    category: 'Development',
    isInstalled: true,
    isEnabled: true,
    version: '3.1.0',
    author: 'SONA Team',
    rating: 4.8,
    downloads: 186000,
    permissions: ['Code Execution', 'File System Read'],
    isOfficial: true,
    isFeatured: true,
  },
  {
    id: 'pl3',
    name: 'Wolfram Alpha',
    description: 'Access Wolfram computational knowledge engine for math, science, and data queries',
    icon: 'calculate',
    color: '#FF6D00',
    category: 'Knowledge',
    isInstalled: true,
    isEnabled: false,
    version: '1.2.0',
    author: 'Wolfram Research',
    rating: 4.7,
    downloads: 92000,
    permissions: ['Internet Access', 'API Key Required'],
  },
  {
    id: 'pl4',
    name: 'GitHub Integration',
    description: 'Connect SONA to your GitHub repositories for code review, PR summaries, and issue management',
    icon: 'code',
    color: '#24292E',
    category: 'Development',
    isInstalled: false,
    version: '1.8.3',
    author: 'DevTools Inc.',
    rating: 4.6,
    downloads: 74000,
    permissions: ['GitHub OAuth', 'Repository Read', 'Issue Write'],
  },
  {
    id: 'pl5',
    name: 'DALL·E 3 Image Gen',
    description: 'Generate high-quality images using OpenAI DALL·E 3 directly in chat',
    icon: 'auto-awesome',
    color: '#7C3AED',
    category: 'Creative',
    isInstalled: false,
    version: '2.0.1',
    author: 'OpenAI',
    rating: 4.8,
    downloads: 163000,
    permissions: ['API Key Required', 'Image Generation'],
    isFeatured: true,
  },
  {
    id: 'pl6',
    name: 'Notion Sync',
    description: 'Sync SONA memories and knowledge with your Notion workspace automatically',
    icon: 'sync',
    color: '#000000',
    category: 'Productivity',
    isInstalled: false,
    version: '1.5.0',
    author: 'Productivity Labs',
    rating: 4.5,
    downloads: 48000,
    permissions: ['Notion OAuth', 'Page Read/Write'],
  },
  {
    id: 'pl7',
    name: 'YouTube Summarizer',
    description: 'Paste any YouTube URL and SONA will summarize, extract insights, and answer questions',
    icon: 'play-circle',
    color: '#FF0000',
    category: 'Media',
    isInstalled: false,
    version: '1.3.2',
    author: 'MediaAI Tools',
    rating: 4.4,
    downloads: 37000,
    permissions: ['Internet Access', 'YouTube Transcript API'],
  },
  {
    id: 'pl8',
    name: 'Google Calendar',
    description: 'Let SONA manage your schedule, set reminders, and plan your day with AI assistance',
    icon: 'calendar-today',
    color: '#4285F4',
    category: 'Productivity',
    isInstalled: false,
    version: '2.2.0',
    author: 'Google',
    rating: 4.7,
    downloads: 201000,
    permissions: ['Google OAuth', 'Calendar Read/Write'],
    isOfficial: true,
  },
];

// ──────────────────────────────────────────────
// Service Interface (ready for real integration)
// ──────────────────────────────────────────────
class AIProvidersService {
  async getAllProviders(): Promise<AIProviderConfig[]> {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_AI_PROVIDERS;
  }

  async toggleProvider(id: AIProvider, enabled: boolean): Promise<void> {
    await new Promise(r => setTimeout(r, 200));
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const key = `@sona_provider_${id}_enabled`;
    await AsyncStorage.setItem(key, JSON.stringify(enabled));
  }

  async setApiKey(id: AIProvider, key: string): Promise<void> {
    await new Promise(r => setTimeout(r, 200));
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(`sona_api_key_${id}`, key);
  }

  async validateApiKey(id: AIProvider, key: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 500));
    return key.length > 10; // Mock validation
  }

  async getPrompts(category?: PromptCategory): Promise<PromptTemplate[]> {
    await new Promise(r => setTimeout(r, 200));
    if (category) return MOCK_PROMPTS.filter(p => p.category === category);
    return MOCK_PROMPTS;
  }

  async getAgents(): Promise<AIAgent[]> {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_AI_AGENTS;
  }

  async getPlugins(): Promise<AIPlugin[]> {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_PLUGINS;
  }
}

export const aiProvidersService = new AIProvidersService();
export default aiProvidersService;
