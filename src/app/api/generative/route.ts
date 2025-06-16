import { NextRequest, NextResponse } from 'next/server'
import { generateContentFromFile } from '@/lib/ai'


export async function GET() {
  return NextResponse.json({ message: 'Chat API is working' })
}
export async function POST(request: NextRequest) {
  const { prompt, fileType, gcsUri } = await request.json()

  const message = await generateContentFromFile(prompt, fileType, gcsUri)

  return NextResponse.json({
    message,
    success: true,
  })
}
