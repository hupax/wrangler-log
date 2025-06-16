import { VertexAI } from '@google-cloud/vertexai'

const GOOGLE_CLOUD_PROJECT = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT
const GOOGLE_CLOUD_LOCATION = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_LOCATION
const MODEL_NAME = process.env.NEXT_PUBLIC_MODEL_NAME

export async function generateContentFromFile(prompt: string, fileType?: string, gcsUri?: string) {
  const vertexAI = new VertexAI({
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  })

  console.log(GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, MODEL_NAME, 'GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, MODEL_NAME')

  const generativeModel = vertexAI.getGenerativeModel({ model: MODEL_NAME || '' })

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
