import { NextRequest, NextResponse } from 'next/server'
import { generateNoteStream } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { prompt, userId } = await request.json()

    // 验证必需的参数
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          // 发送开始信号
          controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'))

          // 流式生成笔记内容 - 直接发送AI生成的chunk
          for await (const chunk of generateNoteStream(prompt)) {
            const data = JSON.stringify({
              type: 'content',
              content: chunk,
            })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }

          // 发送结束信号
          controller.enqueue(encoder.encode('data: {"type":"end"}\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to generate note',
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Failed to create stream:', error)
    return NextResponse.json(
      { error: 'Failed to create stream', details: error },
      { status: 500 }
    )
  }
}
