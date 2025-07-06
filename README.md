# AI 笔记生成器 🤖📝

一个基于 Next.js + TypeScript 的智能笔记应用，集成 GitHub 同步功能，支持文件夹组
织，能够将任意数据交给 AI 整理成结构化的 Markdown 笔记。

![项目主界面](./docs/images/main-interface.png)

## 🚀 核心特性

### 🎯 智能笔记生成

- **AI 驱动** - 使用 Google Cloud Vertex AI 智能整理内容
- **结构化输出** - 自动生成标准 Markdown 格式笔记
- **内容增强** - AI 自动补充相关知识和深入见解
- **智能标题** - 根据内容自动生成合适的标题

### 📁 文件夹管理

- **层次结构** - 支持无限层级的文件夹嵌套
- **拖拽操作** - 直观的文件夹和笔记管理
- **树形视图** - 清晰的文件夹树形展示
- **批量操作** - 支持文件夹和笔记的批量管理

### 🔗 GitHub 集成

- **双向同步** - 应用与 GitHub 仓库之间的双向同步
- **版本控制** - 完整的版本历史和冲突解决
- **导入功能** - 从现有 GitHub 仓库导入笔记和文件夹结构
- **实时状态** - 同步状态实时显示和监控

### 🎨 现代化界面

- **响应式设计** - 完美适配桌面和移动设备
- **暗色模式** - 支持明暗主题切换
- **优雅动画** - 流畅的交互动画和过渡效果
- **直观操作** - 简洁直观的用户界面

## 🛠 技术栈

**前端架构**

- **Next.js 15** - 最新的 React 全栈框架，使用 App Router
- **TypeScript** - 完整的类型安全保障
- **Tailwind CSS** - 现代化 CSS 框架
- **Zustand** - 轻量级状态管理
- **React 19** - 最新的 React 版本

**后端服务**

- **Google Cloud Vertex AI** - 企业级 AI 文本生成
- **Firebase Firestore** - 实时数据库
- **Firebase Auth** - 用户认证系统
- **GitHub API** - 版本控制和同步

**开发工具**

- **Turbopack** - 超快的开发构建工具
- **Prism.js** - 代码语法高亮
- **KaTeX** - 数学公式渲染
- **DOMPurify** - 内容安全过滤

## 📂 项目架构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── notes/         # 笔记 CRUD 接口
│   │   ├── folders/       # 文件夹管理接口
│   │   ├── github/        # GitHub 集成接口
│   │   └── generative/    # AI 生成接口
│   ├── notes/[id]/        # 动态笔记详情页
│   ├── github-settings/   # GitHub 配置页面
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── auth/             # 认证相关组件
│   │   ├── AuthProvider.tsx
│   │   ├── LoginButton.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── UserProfile.tsx
│   ├── FolderTree.tsx     # 文件夹树组件
│   ├── GithubSettings.tsx # GitHub 设置组件
│   ├── SyncStatusIcon.tsx # 同步状态图标
│   ├── MarkdownRenderer.tsx # Markdown 渲染器
│   ├── Layout.tsx         # 全局布局
│   ├── Sidebar.tsx        # 侧边栏
│   └── Navbar.tsx         # 导航栏
├── lib/                   # 核心逻辑
│   ├── ai.ts             # AI 服务封装
│   ├── auth.ts           # 认证逻辑
│   ├── firebase.ts       # Firebase 配置
│   ├── github.ts         # GitHub 服务
│   ├── store.tsx         # Zustand 状态管理
│   └── utils.ts          # 工具函数
├── hooks/                # 自定义 Hooks
│   └── useAuth.ts        # 认证 Hook
└── styles/               # 样式文件
    ├── globals.css
    ├── code-block.css
    └── prism.css
```

## 🧠 核心实现

### 1. 增强的状态管理

使用 Zustand 构建的类型安全状态管理，现在包含完整的 GitHub 集成和文件夹功能：

```typescript
interface NotesStore {
  // 基础状态
  notes: Note[]
  user: User | null
  currentNote: Note | null
  isLoading: boolean
  isAuthenticated: boolean

  // GitHub 集成
  githubConfig: GitHubConfig | null
  isGitHubConnected: boolean

  // 文件夹管理
  folders: Folder[]
  currentFolder: Folder | null
  expandedFolders: Set<string>

  // 增强的笔记模型
  interface Note {
    id: string
    userId: string
    title: string
    content: string
    createdAt: Date | string
    updatedAt: Date | string

    // GitHub 同步
    githubPath?: string
    githubSha?: string
    lastSyncedAt?: Date | string
    syncStatus?: 'synced' | 'pending' | 'conflict' | 'error' | 'not_synced'

    // 文件夹关联
    folderId?: string | null

    // 其他属性
    prompt?: string
    tags?: string[]
  }
}
```

### 2. GitHub 服务集成

完整的 GitHub API 集成，支持仓库连接、内容同步和版本控制：

```typescript
export class GitHubService {
  private config: GitHubConfig

  // 连接测试
  async testConnection(): Promise<{ success: boolean; error?: string }>

  // 仓库信息
  async getRepoInfo()

  // 内容获取
  async getContents(path: string = '')

  // 文件操作
  async createFile(path: string, content: string, message: string)
  async updateFile(path: string, content: string, message: string, sha: string)
  async deleteFile(path: string, message: string, sha: string)

  // 批量导入
  async importNotesFromRepo(): Promise<ImportResult>
}
```

### 3. 文件夹树形结构

支持无限层级嵌套的文件夹系统：

```typescript
interface Folder {
  id: string
  userId: string
  name: string
  parentId?: string // 父文件夹ID，支持嵌套
  githubPath?: string // GitHub 路径映射
  createdAt: Date | string
  updatedAt: Date | string
}

// 递归渲染文件夹树
const renderFolderNode = (folder: any, level: number = 0) => {
  const isExpanded = expandedFolders.has(folder.id)
  const folderNotes = getFolderNotes(folder.id)
  const hasChildren = folder.children.length > 0 || folderNotes.length > 0

  return (
    <div key={folder.id} className="select-none">
      {/* 文件夹节点 */}
      <div
        className="flex items-center gap-2"
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {/* 展开/收起图标 */}
        {/* 文件夹图标 */}
        {/* 文件夹名称和笔记数量 */}
        {/* 同步状态图标 */}
      </div>

      {/* 递归渲染子文件夹和笔记 */}
      {isExpanded && (
        <div className="ml-4">
          {folder.children.map(child => renderFolderNode(child, level + 1))}
          {folderNotes.map(note => renderNoteItem(note, level))}
        </div>
      )}
    </div>
  )
}
```

### 4. 同步状态管理

实时显示笔记和文件夹的同步状态：

```typescript
type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error' | 'not_synced'

const SyncStatusIcon = ({ status, size = 16 }) => {
  const statusConfig = {
    synced: { icon: '✅', color: 'text-green-500', title: '已同步到 GitHub' },
    pending: { icon: '⏳', color: 'text-yellow-500', title: '正在同步' },
    conflict: { icon: '⚠️', color: 'text-red-500', title: '存在冲突' },
    error: { icon: '❌', color: 'text-red-500', title: '同步失败' },
    not_synced: { icon: '☁️', color: 'text-gray-400', title: '未同步' },
  }

  return (
    <span
      className={statusConfig[status].color}
      title={statusConfig[status].title}
    >
      {statusConfig[status].icon}
    </span>
  )
}
```

### 5. 用户认证系统

完整的 Firebase 认证集成：

```typescript
// 认证提供者
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { setUser, setLoading } = useNotesStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setLoading])

  return <>{children}</>
}
```

## 🎨 UI/UX 设计

### 响应式布局

- **三栏布局** - 导航栏 + 侧边栏 + 主内容区
- **文件夹树** - 左侧显示完整的文件夹结构
- **笔记列表** - 按文件夹分组显示笔记
- **移动端适配** - 自适应布局，侧边栏可折叠

### 交互细节

- **拖拽支持** - 文件夹和笔记的拖拽操作
- **键盘快捷键** - 常用操作的快捷键支持
- **实时搜索** - 笔记和文件夹的实时搜索
- **批量操作** - 支持多选和批量操作

### 同步状态可视化

- **状态图标** - 每个笔记显示同步状态
- **进度指示** - 同步进度的实时显示
- **冲突解决** - 可视化的冲突解决界面
- **历史记录** - 完整的同步历史记录

## 🔧 功能模块

### 1. 智能笔记生成

```typescript
// AI 生成笔记
export async function generateNote(prompt: string): Promise<string> {
  const vertexAI = new VertexAI({
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  })

  const model = vertexAI.getGenerativeModel({ model: MODEL_NAME })
  const fullPrompt = `帮我将以下内容整理并补充为一篇笔记，
  你也可以提供一下深入见解。注意：你返回的回答内容必须全部都是md格式的内容，
  并且只能包含和这篇笔记有关的内容。内容：\n\n${prompt}`

  const result = await model.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
  })

  const response = await result.response
  return response?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}
```

### 2. 文件夹管理

```typescript
// 文件夹 CRUD API
export async function POST(request: NextRequest) {
  const { name, parentId, userId } = await request.json()

  const folderRef = await addDoc(collection(db, 'folders'), {
    name,
    parentId: parentId || null,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return NextResponse.json({ success: true, folderId: folderRef.id })
}
```

### 3. GitHub 同步

```typescript
// GitHub 配置保存
export async function POST(request: NextRequest) {
  const { config, userId } = await request.json()

  // 验证 GitHub 连接
  const githubService = new GitHubService(config)
  const connectionResult = await githubService.testConnection()

  if (connectionResult.success) {
    // 保存配置到 Firestore
    await setDoc(doc(db, 'github_configs', userId), {
      ...config,
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json(
    {
      success: false,
      error: connectionResult.error,
    },
    { status: 400 }
  )
}
```

## 📦 部署和运行

### 环境配置

```bash
# 克隆项目
git clone <repository-url>
cd wrangler

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
```

### 环境变量设置

```env
# Google Cloud Vertex AI
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CLOUD_CREDENTIALS=path/to/service-account.json

# Firebase 配置
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 启动开发服务器

```bash
# 开发模式（使用 Turbopack）
npm run dev

# 生产构建
npm run build
npm start
```

## 🎯 项目亮点

### 技术创新

1. **完整的 TypeScript 实现** - 从前端到后端的全链路类型安全
2. **现代化技术栈** - Next.js 15 + React 19 + Turbopack
3. **智能 AI 集成** - 深度集成 Google Cloud Vertex AI
4. **实时同步架构** - Firebase + GitHub 双向同步
5. **组件化设计** - 高度可复用的组件架构

### 功能特色

1. **文件夹管理** - 支持无限层级的文件夹嵌套
2. **GitHub 集成** - 完整的版本控制和同步功能
3. **智能生成** - AI 驱动的内容生成和优化
4. **实时协作** - 多设备间的实时数据同步
5. **用户体验** - 直观的界面和流畅的交互

### 架构优势

1. **模块化设计** - 清晰的代码结构和组件分离
2. **类型安全** - 完整的 TypeScript 类型定义
3. **性能优化** - 代码分割、懒加载和缓存策略
4. **可扩展性** - 易于添加新功能和集成
5. **可维护性** - 清晰的代码结构和文档

## 🚀 未来规划

### 短期目标

- [ ] 完善文件夹 UI 集成
- [ ] 实现 GitHub 批量导入
- [ ] 添加同步冲突解决
- [ ] 优化移动端体验

### 中期目标

- [ ] 多人协作功能
- [ ] 插件系统
- [ ] 主题定制
- [ ] 高级搜索

### 长期目标

- [ ] 多云存储支持
- [ ] AI 助手功能
- [ ] 数据分析面板
- [ ] 企业级功能

---

这个项目展示了如何用现代化的技术栈构建一个功能完整、体验优秀的 AI 笔记应用。每个
技术选型都经过深思熟虑，每行代码都追求质量和可维护性。通过 GitHub 集成和文件夹管
理，用户可以更好地组织和同步自己的知识体系。

_Built with ❤️ using Next.js 15 + TypeScript + AI_
