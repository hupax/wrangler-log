import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'


const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION
const MODEL_NAME = process.env.MODEL_NAME

export async function POST(request: NextRequest) {
  console.log(111)

  const ai = new GoogleGenAI({
    vertexai: true,
    project: GOOGLE_CLOUD_PROJECT,
    location: GOOGLE_CLOUD_LOCATION,
  })
  const response = await ai.models.generateContent({
    model: MODEL_NAME || '',
    contents: 'why is the sky blue?',
  })
  console.debug(response.text)
}
