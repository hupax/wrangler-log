import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function DemoPage() {
  const sampleMarkdown = `
# ChatGPT风格 MarkdownRenderer 演示

这是一个基于 **react-markdown** 的现代化 Markdown 渲染器，具有 ChatGPT 级别的渲染效果！

## 🚀 核心特性

- ✅ **语法高亮** - 基于 highlight.js
- ✅ **数学公式** - 支持 KaTeX 渲染
- ✅ **Mermaid 图表** - 流程图、时序图等
- ✅ **代码复制** - 悬停显示复制按钮
- ✅ **XSS 防护** - 内置安全过滤
- ✅ **响应式设计** - 完美适配各种屏幕

## 📊 Mermaid 图表演示

### 流程图示例
\`\`\`mermaid
graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[跳转登录页]
    D --> E[用户输入账号密码]
    E --> F{验证是否通过?}
    F -->|通过| C
    F -->|失败| G[显示错误信息]
    G --> E
    C --> H[结束]
\`\`\`

### 时序图示例
\`\`\`mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: 发起登录请求
    Frontend->>Backend: 发送用户凭证
    Backend->>Database: 查询用户信息
    Database-->>Backend: 返回用户数据
    Backend-->>Frontend: 返回认证结果
    Frontend-->>User: 显示登录状态
\`\`\`

## 🧮 数学公式支持

行内公式：当 $a \\neq 0$ 时，方程 $ax^2 + bx + c = 0$ 的解为：

块级公式：
$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$

复杂公式示例：
$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

## 💻 代码高亮演示

## 标题层级测试

### 三级标题示例
#### 四级标题示例
##### 五级标题示例
###### 六级标题示例

---

## 文本格式全面测试

这里展示各种文本格式的组合使用：

- **粗体文本** 和 *斜体文本* 的基本用法
- ***粗斜体组合*** 的效果展示
- \`行内代码\` 与 **粗体 \`代码\`** 的混合使用
- [普通链接](https://github.com) 和 [**粗体链接**](https://nextjs.org)
- *斜体中包含 [链接](https://tailwindcss.com) 的效果*
- **粗体中包含 \`代码\` 和 [链接](https://typescript.org) 的混合效果**

---

## 复杂嵌套列表测试

### 深层嵌套无序列表
- 编程语言分类
  - 前端开发语言
    - JavaScript
      - ES6+ 新特性
      - TypeScript 超集
    - CSS 预处理器
      - Sass/SCSS
      - Less
      - Stylus
  - 后端开发语言
    - 服务端语言
      - Node.js (JavaScript)
      - Python
        - Django 框架
        - Flask 框架
        - FastAPI 框架
      - Java
        - Spring Boot
        - Spring Cloud
      - Go
        - Gin 框架
        - Echo 框架
    - 数据库相关
      - 关系型数据库
        - MySQL
        - PostgreSQL
      - 非关系型数据库
        - MongoDB
        - Redis

### 复杂有序列表
1. 项目开发流程
   1. 需求分析阶段
      1. 用户调研
      2. 需求文档编写
      3. 原型设计
   2. 设计阶段
      1. UI/UX 设计
         1. 用户界面设计
         2. 用户体验优化
         3. 设计规范制定
      2. 架构设计
         1. 系统架构规划
         2. 数据库设计
         3. API 接口设计
   3. 开发阶段
      1. 前端开发
      2. 后端开发
      3. 接口联调
   4. 测试阶段
      1. 单元测试
      2. 集成测试
      3. 用户验收测试
2. 部署上线流程
   1. 环境准备
   2. 代码部署
   3. 监控配置

### 混合列表类型
- 学习路径规划
  1. 基础知识学习
     - HTML/CSS 基础
     - JavaScript 核心概念
  2. 框架学习
     - React 生态
       - React 基础
       - React Router
       - Redux/Zustand
     - Vue 生态
       - Vue 3 Composition API
       - Vuex/Pinia
  3. 工程化工具
     1. 构建工具
        - Webpack
        - Vite
        - Rollup
     2. 开发工具
        - VS Code 插件
        - Chrome DevTools
        - Git 版本控制

---

## 多样化代码块测试

### TypeScript 复杂示例
\`\`\`typescript
interface User {
  id: number
  name: string
  email: string
  preferences?: {
    theme: 'light' | 'dark'
    language: string
  }
}

class UserManager {
  private users: Map<number, User> = new Map()

  addUser(user: User): void {
    this.users.set(user.id, user)
  }

  getUser(id: number): User | undefined {
    return this.users.get(id)
  }

  getUsersByPreference(theme: 'light' | 'dark'): User[] {
    return Array.from(this.users.values())
      .filter(user => user.preferences?.theme === theme)
  }
}

// 泛型函数示例
function createApiResponse<T>(data: T, status: number = 200): ApiResponse<T> {
  return {
    data,
    status,
    timestamp: new Date().toISOString()
  }
}
\`\`\`

### React JSX 示例
\`\`\`jsx
import React, { useState, useEffect } from 'react'

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(\`/api/users/\${userId}\`)
        if (!response.ok) throw new Error('用户不存在')
        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (loading) return <div className="spinner">加载中...</div>
  if (error) return <div className="error">错误: {error}</div>

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>邮箱: {user.email}</p>
      {user.avatar && (
        <img
          src={user.avatar}
          alt={\`\${user.name}的头像\`}
          className="avatar"
        />
      )}
    </div>
  )
}

export default UserProfile
\`\`\`

### Python 数据处理示例
\`\`\`python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class DataProcessor:
    def __init__(self, data_source):
        self.data_source = data_source
        self.df = None

    def load_data(self):
        """加载数据"""
        try:
            self.df = pd.read_csv(self.data_source)
            print(f"成功加载 {len(self.df)} 条记录")
        except FileNotFoundError:
            print("文件未找到")
            return False
        return True

    def clean_data(self):
        """数据清洗"""
        if self.df is None:
            return

        # 删除重复项
        self.df.drop_duplicates(inplace=True)

        # 处理缺失值
        self.df.fillna(method='ffill', inplace=True)

        # 数据类型转换
        date_columns = ['created_at', 'updated_at']
        for col in date_columns:
            if col in self.df.columns:
                self.df[col] = pd.to_datetime(self.df[col])

    def analyze_trends(self):
        """趋势分析"""
        if 'created_at' not in self.df.columns:
            return {}

        daily_counts = self.df.groupby(
            self.df['created_at'].dt.date
        ).size()

        return {
            'total_records': len(self.df),
            'date_range': {
                'start': self.df['created_at'].min(),
                'end': self.df['created_at'].max()
            },
            'daily_average': daily_counts.mean(),
            'max_daily': daily_counts.max()
        }

# 使用示例
processor = DataProcessor('user_data.csv')
if processor.load_data():
    processor.clean_data()
    trends = processor.analyze_trends()
    print("分析结果:", trends)
\`\`\`

### SQL 查询示例
\`\`\`sql
-- 复杂的用户订单分析查询
WITH user_order_stats AS (
  SELECT
    u.id as user_id,
    u.name,
    u.email,
    COUNT(o.id) as total_orders,
    SUM(o.amount) as total_spent,
    AVG(o.amount) as avg_order_value,
    MAX(o.created_at) as last_order_date
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.created_at >= '2023-01-01'
  GROUP BY u.id, u.name, u.email
),
user_segments AS (
  SELECT
    *,
    CASE
      WHEN total_spent >= 1000 THEN 'VIP'
      WHEN total_spent >= 500 THEN 'Premium'
      WHEN total_spent >= 100 THEN 'Regular'
      ELSE 'New'
    END as user_segment,
    DATEDIFF(CURRENT_DATE, last_order_date) as days_since_last_order
  FROM user_order_stats
)
SELECT
  user_segment,
  COUNT(*) as user_count,
  AVG(total_spent) as avg_lifetime_value,
  AVG(total_orders) as avg_order_count,
  AVG(days_since_last_order) as avg_days_inactive
FROM user_segments
GROUP BY user_segment
ORDER BY avg_lifetime_value DESC;
\`\`\`

### Docker 配置示例
\`\`\`dockerfile
# 多阶段构建的 Next.js 应用
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
\`\`\`

---

## 高级引用块测试

> 这是一个简单的引用块。

> 这是一个包含 **粗体文本** 和 *斜体文本* 的引用块。
>
> 还可以包含 \`行内代码\` 和 [链接](https://example.com)。

> ### 引用块中的标题
>
> 引用块中可以包含各种格式：
>
> - 列表项目 1
> - 列表项目 2
>   - 嵌套列表项
>
> \`\`\`javascript
> // 引用块中的代码
> console.log('Hello from quote block!')
> \`\`\`

---

## 复杂表格测试

### 基础表格
| 功能 | React | Vue | Angular | Svelte |
|------|-------|-----|---------|--------|
| 组件化 | ✅ | ✅ | ✅ | ✅ |
| 虚拟DOM | ✅ | ✅ | ❌ | ❌ |
| TypeScript | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 学习曲线 | 中等 | 简单 | 复杂 | 简单 |

### 包含格式化内容的表格
| 技术栈 | 描述 | 示例代码 | 链接 |
|--------|------|----------|------|
| **React** | *现代化* UI 库 | \`Component \` | [官网](https://react.dev) |
| **Next.js** | *全栈* React 框架 | \`getServerSideProps\` | [文档](https://nextjs.org) |
| **Tailwind** | ***实用优先*** 的 CSS | \`className="px-4 py-2"\` | [指南](https://tailwindcss.com) |

### 数据对比表格
| 指标 | 小型项目 | 中型项目 | 大型项目 | 企业级项目 |
|------|----------|----------|----------|------------|
| 开发周期 | 1-2周 | 1-3个月 | 6-12个月 | 1-2年 |
| 团队规模 | 1-2人 | 3-8人 | 10-20人 | 20+人 |
| 技术复杂度 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 维护成本 | 低 | 中等 | 高 | 非常高 |
| 预算范围 | <10万 | 10-50万 | 50-200万 | 200万+ |

---

## 分割线测试

上面是一条标准分割线。

***

这是另一种分割线样式。

---

这是第三种分割线。

___

## 综合格式测试

这一段包含了 **各种格式的混合使用**：

1. 首先是带有 *斜体强调* 的 **粗体文本**
2. 然后是包含 \`行内代码\` 的列表项
3. 最后是带有 [**粗体链接**](https://github.com) 的项目
   - 嵌套项包含 ***粗斜体文本***
   - 另一个嵌套项包含 \`代码\` 和 *[斜体链接](https://typescript.org)*

> **重要提示**: 这个 MarkdownRenderer 组件支持所有常见的 Markdown 语法，包括：
>
> - ✅ 多级标题 (H1-H6)
> - ✅ 文本格式化 (粗体、斜体、代码)
> - ✅ 深层嵌套列表 (有序和无序)
> - ✅ 语法高亮代码块
> - ✅ 表格渲染
> - ✅ 引用块
> - ✅ 链接处理
> - ✅ 分割线
> - ✅ 混合格式支持

最后，让我们用一个复杂的示例来结束：

\`\`\`json
{
  "project": {
    "name": "MarkdownRenderer",
    "version": "1.0.0",
    "features": [
      "语法高亮",
      "深色模式",
      "响应式设计",
      "类型安全"
    ],
    "dependencies": {
      "react": "^18.0.0",
      "next": "^13.0.0",
      "tailwindcss": "^3.0.0",
      "prismjs": "^1.29.0"
    },
    "performance": {
      "parsing": "自定义高性能解析器",
      "rendering": "优化的组件渲染",
      "bundle_size": "最小化打包体积"
    }
  }
}
\`\`\`

**测试完成！** 如果你能看到这里的所有格式都正确渲染，那么 MarkdownRenderer 组件就完美运行了！ 🎉
`

  return (
    <div className="min-h-screen pt-4">
      <div className="container mx-auto px-4 py-8">
        {/* 主要内容区域 */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-blue-100 dark:border-blue-800">
            {/* 内容头部装饰 */}
            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>

            {/* 文章内容 */}
            <article className="p-8 md:p-12">
              <MarkdownRenderer content={sampleMarkdown} />
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
