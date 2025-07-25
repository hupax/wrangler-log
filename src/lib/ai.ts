import { VertexAI } from '@google-cloud/vertexai'

const GOOGLE_CLOUD_PROJECT = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT
const GOOGLE_CLOUD_LOCATION = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_LOCATION
const MODEL_NAME = process.env.NEXT_PUBLIC_MODEL_NAME

// 简化的流式笔记生成
export async function generateNoteStream(prompt: string) {
  const vertexAI = new VertexAI({
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  })

  const generativeModel = vertexAI.getGenerativeModel({
    model: MODEL_NAME || '',
  })

  const fullPrompt = `
# AI 笔记生成提示词

## 角色设定

你是一位善于将技术知识转化为实用笔记的专家，擅长创建既有个人观点又极其实用的技术文档。

## 任务目标

根据我提供的原始学习内容，生成一份完整、实用、有个人色彩的技术笔记。

## 笔记要求

### 1. 结构要求

- 使用清晰的多层级标题结构，配合emoji增强可读性
- 包含完整的解决方案流程：
  - 概念/背景介绍（可包含个人观点）
  - 为什么选择/核心优势
  - 安装配置步骤
  - 实战示例/代码模板
  - 故障排查/常见问题
  - 对比分析/最佳实践

### 2. 内容要求

- **完整性**：从基础安装到高级配置的全流程覆盖
- **实用性**：每个步骤都可直接执行，提供完整的命令和配置
- **个人化**：适当加入个人观点、使用体验、推荐理由
- **问题导向**：围绕解决具体问题来组织内容

### 3. 格式要求

- 大量使用emoji来标记不同类型的内容（🔧安装、⚠️注意、✅效果等）
- 使用代码块展示所有命令、配置文件、代码示例
- 使用表格进行对比分析和特性说明
- 使用引用块突出重要提示和核心观点
- 使用分隔线组织结构，增强视觉层次

### 4. 语言风格

- 生动有趣但不失专业，可以有个人态度和观点
- 使用生动的比喻和形象的描述
- 适当的幽默感和个人化表达
- 保持技术准确性的同时增强可读性

### 5. 代码示例要求

- 提供完整可执行的命令序列
- 配置文件要完整且可直接使用
- 每个代码块都有清晰的说明和注释
- 包含验证步骤，确保配置生效

### 6. 实用性导向

- 每个步骤都要可操作，避免空洞的理论
- 提供故障排查指南和常见问题解决方案
- 包含管理维护的常用命令
- 给出优化建议和最佳实践

## 输出格式示例

\`\`\`markdown
# 🚀 [主题名称]：[生动的副标题或个人观点]

> 😎 **适用场景**：[主要应用场景]
> 🎯 **核心优势**：[为什么选择这个技术/方法]
> ⚡ **关键词**：[技术栈或重要概念]

---

## 🌟 为什么选择 [技术名称]？

[个人观点和推荐理由，可以包含与其他方案的对比]

### ✅ 主要优势

- **[优势一]**：[具体说明]
- **[优势二]**：[具体说明]
- **[优势三]**：[具体说明]

### ⚠️ 注意事项

- [需要注意的点]
- [可能的限制]

---

## 🔧 安装配置步骤

### 第一步：[步骤名称]

\`\`\`bash
# 具体命令
# 详细注释
\`\`\`

### 第二步：[步骤名称]

\`\`\`bash
# 配置命令
\`\`\`

⚠️ **重要提示**：[关键注意事项]

---

## 📝 配置文件详解

### [配置文件名]

\`\`\`language
# 完整的配置文件内容
# 每行都有说明
\`\`\`

---

## 🎯 实战案例

### 场景：[具体使用场景]

**问题描述**：[要解决什么问题]

**解决方案**：

\`\`\`language
// 完整的代码示例
// 详细注释
\`\`\`

**验证步骤**：

\`\`\`bash
# 验证命令
\`\`\`

---

## 🔍 故障排查指南

### 常见问题 1：[问题描述]

**症状**：[具体表现]

**解决方案**：

\`\`\`bash
# 解决命令
\`\`\`

### 常见问题 2：[问题描述]

**原因**：[问题原因]

**解决方法**：[具体步骤]

---

## 📊 对比分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| [方案一] | [优点] | [缺点] | [场景] |
| [方案二] | [优点] | [缺点] | [场景] |

---

## 🚀 最佳实践与优化技巧

### 💡 技巧一：[技巧名称]

[具体说明和代码示例]

### 💡 技巧二：[技巧名称]

[具体说明]

---

## 📋 常用管理命令

\`\`\`bash
# 查看状态
[命令]

# 重启服务
[命令]

# 查看日志
[命令]
\`\`\`

---

> 🎉 **总结**：[简洁的总结和使用建议]
\`\`\`

## 生成指令

请根据以上要求，将我接下来提供的原始学习内容转化为一份完整、实用、有个人特色的技术笔记。确保：
一、
1. 保持原始内容的核心信息，并补充完整的操作流程
2. 提供可直接使用的命令、配置文件和代码示例
3. 包含故障排查和常见问题解决方案
4. 使用生动有趣的语言风格，适当加入个人观点
5. 重点突出实用性，每个步骤都要可操作
6. 善用emoji和视觉元素增强可读性
二、
1. 你也可以补充相关知识或见解。
2. 你返回的回答内容必须全部都是md格式的内容，并且返回的是 输出 Markdown 原文，不要将所有回答放到Markdown代码块中，并且只能包含和这篇笔记有关的内容。
3. 你应该认真、仔细、全面阅读内容，包括内容中的链接等。
4. 笔记应该以第一人称视角风格呈现，但不要使用"我"、"我们"等字眼。
5. 和算法相关，则使用cpp实现。
6. 可以适当使用英文。

现在请开始处理我的原始学习内容：

${prompt}`

  const req = {
    contents: [
      {
        role: 'user',
        parts: [{ text: fullPrompt }],
      },
    ],
  }

  return await generativeModel.generateContentStream(req)
}

// 生成笔记标题
export async function generateNoteTitle(content: string) {
  const vertexAI = new VertexAI({
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  })

  const generativeModel = vertexAI.getGenerativeModel({
    model: MODEL_NAME || '',
  })

  const titlePrompt = `请为以下Markdown内容生成一个简洁、准确的标题（不超过50个字符），注意你返回的内容必须是纯文本，尽量包含英文。

内容：
${content.slice(0, 1000)}`

  const req = {
    contents: [
      {
        role: 'user',
        parts: [{ text: titlePrompt }],
      },
    ],
  }

  try {
    const response = await generativeModel.generateContent(req)
    return (
      response.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      '新建笔记'
    )
  } catch (error) {
    console.error('Error generating title:', error)
    return '新建笔记'
  }
}

// 文件内容生成（保持原有功能）
export async function generateContentFromFile(
  prompt: string,
  fileType?: string,
  gcsUri?: string
) {
  const vertexAI = new VertexAI({
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  })

  const generativeModel = vertexAI.getGenerativeModel({
    model: MODEL_NAME || '',
  })

  const parts = [] as any[]
  if (gcsUri && fileType) {
    parts.push({
      fileData: {
        fileUri: gcsUri,
        mimeType: fileType,
      },
    })
  }
  if (prompt) {
    parts.push({ text: prompt })
  }

  const req = { contents: [{ role: 'user', parts }] }
  const resp = await generativeModel.generateContentStream(req)
  const contentResponse = await resp.response
  return contentResponse?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}
