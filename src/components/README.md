# MarkdownRenderer 组件

一个美观的 Markdown 渲染组件，支持完整的 Markdown 语法和现代化的样式。

## 特性

- ✨ **完整的 Markdown 支持** - 标题、列表、代码块、表格、引用等
- 🎨 **现代化样式** - 紫色主题配色，深色模式支持
- 📱 **响应式设计** - 在所有设备上都有优秀的显示效果
- 🚀 **高性能** - 自定义解析器，无需第三方依赖
- 💫 **语法高亮** - 代码块支持语言标识和美观的样式
- 🔗 **链接支持** - 自动处理外部链接，新窗口打开

## 使用方法

### 基础使用

```tsx
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function MyPage() {
  const markdownContent = `
# 我的标题

这是一段普通文本，支持 **粗体**、*斜体* 和 \`行内代码\`。

## 代码块示例

\`\`\`javascript
function hello() {
  console.log("Hello, World!")
}
\`\`\`

## 列表示例

- 第一项
- 第二项
- 第三项

> 这是一个引用块
`

  return (
    <div className="container mx-auto p-8">
      <MarkdownRenderer content={markdownContent} />
    </div>
  )
}
```

### 从文件读取

```tsx
import fs from 'fs'
import path from 'path'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default async function BlogPost() {
  // 读取 markdown 文件
  const markdownPath = path.join(process.cwd(), 'content', 'my-post.md')
  const markdownContent = fs.readFileSync(markdownPath, 'utf8')

  return (
    <div className="max-w-4xl mx-auto p-8">
      <MarkdownRenderer content={markdownContent} />
    </div>
  )
}
```

### 自定义样式

```tsx
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function CustomStyledPost() {
  const content = '# 我的内容'

  return (
    <MarkdownRenderer
      content={content}
      className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg"
    />
  )
}
```

## 支持的语法

### 标题

```markdown
# 一级标题

## 二级标题

### 三级标题

#### 四级标题
```

### 文本格式

```markdown
**粗体文本** _斜体文本_ `行内代码` [链接文本](https://example.com)
```

### 列表

```markdown
- 无序列表项
- 另一个项目

1. 有序列表项
2. 第二项
```

### 代码块

````markdown
```javascript
function example() {
  return 'Hello World'
}
```
````

### 引用

```markdown
> 这是一个引用块可以跨越多行
```

### 表格

```markdown
| 列 1   | 列 2   | 列 3   |
| ------ | ------ | ------ |
| 数据 1 | 数据 2 | 数据 3 |
| 数据 4 | 数据 5 | 数据 6 |
```

### 分割线

```markdown
---
```

## Props

| 属性      | 类型   | 默认值 | 描述                   |
| --------- | ------ | ------ | ---------------------- |
| content   | string | -      | 要渲染的 Markdown 内容 |
| className | string | ""     | 可选的 CSS 类名        |

## 样式主题

组件使用紫色主题配色方案：

- **主要颜色**: 紫色 (#8B5CF6)
- **次要颜色**: 蓝色 (#3B82F6)
- **强调颜色**: 绿色 (#10B981)
- **代码背景**: 深灰色 (#111827)
- **文本颜色**: 自适应深色/浅色模式

## 注意事项

1. **HTML 安全性**: 组件使用 `dangerouslySetInnerHTML` 来渲染处理后的内容，请确
   保传入的 Markdown 内容是可信的。

2. **性能**: 对于大型文档，建议考虑分页或懒加载。

3. **样式继承**: 组件会继承父容器的一些样式，请确保在合适的容器中使用。

## 示例项目

查看 `src/app/page.tsx` 中的完整使用示例。
