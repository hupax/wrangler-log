# AI 笔记生成器 🤖📝

一个基于 Next.js + TypeScript 的智能笔记应用，能够将任意数据交给 AI 整理成结构化
的 Markdown 笔记。

![项目主界面](./docs/images/main-interface.png)

## 🚀 技术栈

**前端架构**

- **Next.js 15** - 最新的 React 全栈框架，支持 App Router
- **TypeScript** - 完整的类型安全保障
- **Tailwind CSS** - 现代化 CSS 框架
- **Zustand** - 轻量级状态管理

**后端服务**

- **Google Cloud Vertex AI** - 企业级 AI 文本生成
- **Firebase Firestore** - 实时数据库
- **Firebase Storage** - 文件存储服务

**核心特性**

- 🎨 自定义 Markdown 渲染器，支持语法高亮
- 📱 响应式设计，完美适配各种设备
- ⚡ 优雅的加载动画和用户体验
- 🔄 实时数据同步

## 📂 项目架构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── notes/         # 笔记CRUD接口
│   │   ├── generative/    # AI生成接口
│   │   └── upload-file/   # 文件上传接口
│   ├── notes/[id]/        # 动态笔记详情页
│   └── page.tsx           # 主页面
├── components/            # React组件
│   ├── MarkdownRenderer.tsx  # 自定义Markdown渲染器
│   ├── Layout.tsx         # 全局布局
│   ├── Sidebar.tsx        # 侧边栏
│   └── Navbar.tsx         # 导航栏
├── lib/                   # 核心逻辑
│   ├── ai.ts             # AI服务封装
│   ├── firebase.ts       # Firebase配置
│   ├── store.tsx         # Zustand状态管理
│   └── utils.ts          # 工具函数
└── styles/               # 样式文件
```

## 🧠 核心实现

### 1. 状态管理架构

使用 Zustand 构建的类型安全状态管理，简洁而强大：

```typescript
interface NotesStore {
  notes: Note[]
  currentNote: Note | null
  isLoading: boolean
  isGenerating: boolean

  // Actions
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  setCurrentNote: (note: Note | null) => void
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  // 状态定义和更新逻辑
}))
```

![状态管理流程图](./docs/images/state-flow.png)

### 2. AI 服务集成

封装 Google Cloud Vertex AI，实现智能内容生成：

```typescript
export async function generateNote(prompt: string) {
  const vertexAI = new VertexAI({
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  })

  const generativeModel = vertexAI.getGenerativeModel({
    model: MODEL_NAME || '',
  })

  const fullPrompt = `帮我将以下内容整理并补充为一篇笔记，
  你也可以提供一下深入见解。注意：你返回的回答内容必须全部都是md格式的内容，
  并且只能包含和这篇笔记有关的内容。内容：\n\n${prompt}`

  const req = {
    contents: [
      {
        role: 'user',
        parts: [{ text: fullPrompt }],
      },
    ],
  }

  const resp = await generativeModel.generateContentStream(req)
  const contentResponse = await resp.response
  return contentResponse?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}
```

### 3. 自定义 Markdown 渲染器

这是项目的核心亮点 - 一个功能丰富的 Markdown 渲染组件：

```typescript
const MarkdownRenderer = memo(({ content, className = '' }) => {
  // 解析Markdown为结构化数据
  const parseMarkdown = useCallback((markdownContent: string): Section[] => {
    const lines = markdownContent.split('\n')
    const sections: Section[] = []

    // 支持代码块、列表、表格、引用等多种元素
    // 智能解析嵌套结构

    return sections
  }, [])

  // 语法高亮映射
  const languageKey = (() => {
    const lang = section.language?.toLowerCase() || 'text'
    if (lang === 'dockerfile') return 'docker'
    if (lang === 'cpp' || lang === 'c++') return 'java'
    return lang
  })()

  // 使用Prism.js进行语法高亮
  return (
    <div className="markdown-renderer">
      {sections.map((section, index) => (
        // 渲染各种Markdown元素
      ))}
    </div>
  )
})
```

![Markdown渲染效果](./docs/images/markdown-rendering.png)

### 4. API 设计

RESTful 风格的 API 设计，类型安全的数据交换：

```typescript
// GET /api/notes - 获取笔记列表
export async function GET() {
  try {
    const q = query(collection(db, 'notes'), orderBy('updatedAt', 'desc'))
    const querySnapshot = await getDocs(q)

    const notes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }))

    return NextResponse.json({ notes })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

// POST /api/notes - AI生成新笔记
export async function POST(request: NextRequest) {
  const { prompt } = await request.json()

  const content = await generateNote(prompt)
  const title = await generateNoteTitle(content)

  const noteRef = await addDoc(collection(db, 'notes'), {
    title: title.trim(),
    content,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    prompt: prompt || null,
  })

  return NextResponse.json({
    success: true,
    noteId: noteRef.id,
    title,
    content,
  })
}
```

### 5. 优雅的加载体验

简洁的 OpenAI 风格加载动画：

```typescript
// 简洁的加载页面
if (isGenerating) {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="relative">
        {/* 呼吸圆形动画 */}
        <div className="w-16 h-16 bg-black rounded-full animate-pulse"></div>

        {/* 外圈呼吸效果 */}
        <div className="absolute inset-0 w-16 h-16 bg-black rounded-full opacity-20 animate-ping"></div>
      </div>
    </div>
  )
}
```

![加载动画效果](./docs/images/loading-animation.png)

## 🎨 UI/UX 设计

### 响应式布局

- 左侧边栏：笔记列表和导航
- 主内容区：AI 输入界面/笔记详情
- 移动端适配：侧边栏自动折叠

### 交互细节

- 平滑的过渡动画
- 键盘快捷键支持（Enter 提交）
- 悬浮效果和微交互
- 暗色模式兼容

![界面设计展示](./docs/images/ui-showcase.png)

## 🔧 核心功能

### 1. 智能笔记生成

用户输入任意内容，AI 自动：

- 结构化整理信息
- 补充相关知识
- 生成合适的标题
- 输出标准 Markdown 格式

### 2. 实时笔记管理

- 侧边栏实时显示笔记列表
- 支持笔记的增删改查
- 自动保存到 Firebase 云端
- 跨设备数据同步

### 3. 高级 Markdown 渲染

- 语法高亮（支持多种编程语言）
- 表格、列表、引用块
- 数学公式支持
- 代码块复制功能

![功能演示](./docs/images/features-demo.png)

## 🚀 技术亮点

### TypeScript 全栈类型安全

```typescript
interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  isGenerated: boolean
  prompt?: string
  tags?: string[]
}
```

### Next.js 15 新特性运用

- App Router 架构
- 服务端组件优化
- 动态路由和参数处理
- API Routes 集成

### 状态管理最佳实践

- Zustand 轻量级方案
- 类型安全的状态更新
- 组件间数据共享
- 持久化存储支持

### 性能优化

- React.memo 防止不必要重渲染
- useCallback 缓存函数
- 代码分割和懒加载
- 图片和资源优化

## 📦 部署和运行

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 填入Firebase和Google Cloud配置

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
npm start
```

## 🎯 项目特色

1. **完整的 TypeScript 实现** - 从前端到后端的全链路类型安全
2. **现代化技术栈** - 使用最新的 React 和 Next.js 特性
3. **优雅的代码架构** - 模块化设计，易于维护和扩展
4. **用户体验优先** - 细致的交互设计和性能优化
5. **AI 深度集成** - 不只是简单调用，而是深度的业务场景结合

这个项目展示了如何用现代化的前端技术栈构建一个功能完整、体验优秀的 AI 应用。每个
技术选型都有其考虑，每行代码都追求质量和可维护性。

---

_Built with ❤️ using Next.js + TypeScript_
