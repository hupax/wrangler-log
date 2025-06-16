import { VertexAI } from '@google-cloud/vertexai'

const GOOGLE_CLOUD_PROJECT = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT
const GOOGLE_CLOUD_LOCATION = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_LOCATION
const MODEL_NAME = process.env.NEXT_PUBLIC_MODEL_NAME

// 笔记类型提示词模板
const NOTE_TEMPLATES = {
  general: '请生成一篇关于以下主题的详细笔记，使用Markdown格式：',
  technical: '请生成一篇技术文档，包含代码示例和详细说明：',
  tutorial: '请生成一篇教程，包含步骤说明和实践建议：',
  summary: '请总结以下内容，提取关键要点：',
  analysis: '请分析以下主题，提供深入见解：',
}

export async function generateContentFromFile(
  prompt: string,
  fileType?: string,
  gcsUri?: string
) {
  const vertexAI = new VertexAI({
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  })

  console.log(
    GOOGLE_CLOUD_PROJECT,
    GOOGLE_CLOUD_LOCATION,
    MODEL_NAME,
    'GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, MODEL_NAME'
  )

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


export async function generateNote(prompt: string) {
  const vertexAI = new VertexAI({
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  })

  const generativeModel = vertexAI.getGenerativeModel({ model: MODEL_NAME || '' })

  const fullPrompt = `$你好，帮我将以下内容整理并补充为一篇笔记，你也可以提供一下深入见解。注意：你返回的回答内容必须全部都是md格式的内容，并且返回的是 输出 Markdown 原文，不要将所有回答放到Markdown代码块中，并且只能包含和这篇笔记有关的内容。内容：\n\n${prompt}`

  const req = {
    contents: [{
      role: 'user',
      parts: [{ text: fullPrompt }]
    }]
  }

  const resp = await generativeModel.generateContentStream(req)
  const contentResponse = await resp.response
  return contentResponse?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// 标题
export async function generateNoteTitle(content: string) {
  const vertexAI = new VertexAI({
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  })

  const generativeModel = vertexAI.getGenerativeModel({ model: MODEL_NAME || '' })

  const titlePrompt = `请为以下Markdown内容生成一个简洁、准确的标题（不超过50个字符）,注意你返回的内容必须是纯文本，可以包含英文。\n\n内容：\n\n${content.slice(0, 1000)}`

  const req = {
    contents: [{
      role: 'user',
      parts: [{ text: titlePrompt }]
    }]
  }

  const resp = await generativeModel.generateContentStream(req)
  const contentResponse = await resp.response
  return contentResponse?.candidates?.[0]?.content?.parts?.[0]?.text || '新建笔记'
}
