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
- **Firebase Firestore** - 实时数据库（扁平化结构）
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
│   │   ├── users/         # 用户管理接口
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
│   └── utils.ts          # 工具函数
├── stores/               # Zustand 状态管理
│   ├── auth.ts           # 认证状态
│   ├── notes.ts          # 笔记状态
│   ├── github.ts         # GitHub 状态
│   └── index.ts          # 统一导出
└── styles/               # 样式文件
    ├── globals.css
    ├── code-block.css
    └── prism.css
```

## 🗄️ 数据库结构

### Firestore 扁平化结构

```
Firestore Collections:
├── users/
│   └── {userId}: {
│       email, displayName, photoURL,
│       createdAt, updatedAt
│     }
├── notes/
│   └── {noteId}: {
│       title, content, userId, folderId,
│       githubPath, githubSha, syncStatus,
│       createdAt, updatedAt, ...
│     }
├── folders/
│   └── {folderId}: {
│       name, parentId, userId, githubPath,
│       createdAt, updatedAt, ...
│     }
└── github_configs/
    └── {userId}: {
        accessToken, repoOwner, repoName,
        defaultBranch, basePath, updatedAt
}
```

### 优势

- **查询性能更好** - 减少深度嵌套查询
- **扩展性更强** - 支持分享、协作等功能
- **维护更简单** - 数据关系清晰
- **权限控制精确** - 基于文档级别的权限

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
// 文件夹 CRUD API - 扁平化结构
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
// GitHub 配置保存 - 扁平化结构
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

### Firestore 配置部署

```bash
# 安装 Firebase CLI
npm install -g firebase-tools

# 登录 Firebase
firebase login

# 初始化项目（如果还没有）
firebase init firestore

# 部署索引和安全规则
chmod +x scripts/deploy-firestore.sh
./scripts/deploy-firestore.sh

# 或者手动部署
firebase deploy --only firestore:indexes
firebase deploy --only firestore:rules
```

### 启动开发服务器

```bash
# 开发模式（使用 Turbopack）
npm run dev

# 生产构建
npm run build
npm start
```

## 🔒 安全配置

### Firestore 安全规则

项目使用严格的安全规则确保数据安全：

```javascript
// 用户只能访问自己的数据
match /notes/{noteId} {
  allow read, write: if request.auth != null &&
    resource.data.userId == request.auth.uid;
}

// 支持公共笔记（可选功能）
match /notes/{noteId} {
  allow read: if resource.data.isPublic == true;
}
```

### 必需的索引

系统自动创建以下复合索引以优化查询性能：

- `notes`: userId + updatedAt (desc)
- `notes`: userId + folderId + updatedAt (desc)
- `folders`: userId + parentId
- `folders`: userId + createdAt (desc)

## 🎯 项目亮点

### 技术创新

1. **扁平化数据结构** - 优化的 Firestore 存储架构
2. **完整的 TypeScript 实现** - 从前端到后端的全链路类型安全
3. **现代化技术栈** - Next.js 15 + React 19 + Turbopack
4. **智能 AI 集成** - 深度集成 Google Cloud Vertex AI
5. **实时同步架构** - Firebase + GitHub 双向同步

### 功能特色

1. **文件夹管理** - 支持无限层级的文件夹嵌套
2. **GitHub 集成** - 完整的版本控制和同步功能
3. **智能生成** - AI 驱动的内容生成和优化
4. **实时协作** - 多设备间的实时数据同步
5. **用户体验** - 直观的界面和流畅的交互

### 架构优势

1. **模块化设计** - 清晰的代码结构和组件分离
2. **类型安全** - 完整的 TypeScript 类型定义
3. **性能优化** - 扁平化结构 + 复合索引
4. **可扩展性** - 易于添加新功能和集成
5. **可维护性** - 清晰的代码结构和文档

## 🚀 未来规划

### 短期目标

- [ ] 完善 GitHub 同步功能实现
- [ ] 实现笔记批量导入
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
- [ ] 团队工作空间
- [ ] API 开放平台

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 升级到扁平化结构后，建议重新部署 Firestore 配置以获得最佳性能。
