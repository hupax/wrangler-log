import { uploadFile as uploadFileToStorage } from '@/lib/firebase'
import { NextRequest, NextResponse } from 'next/server'

const uploadFile = uploadFileToStorage

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const userId = formData.get('userId') as string
  const recordId = formData.get('recordId') as string
  const timestamp = formData.get('timestamp') as string

  const response = await uploadFile(file, userId, recordId, timestamp)

  return NextResponse.json(response)
}

export { uploadFile }
