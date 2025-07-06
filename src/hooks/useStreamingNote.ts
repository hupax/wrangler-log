import { useState, useCallback } from 'react'

interface StreamingNoteState {
  content: string
  isGenerating: boolean
  error: string | null
  isComplete: boolean
}

export function useStreamingNote() {
  const [state, setState] = useState<StreamingNoteState>({
    content: '',
    isGenerating: false,
    error: null,
    isComplete: false,
  })

  const generateNote = useCallback(async (prompt: string, userId: string) => {
    setState({
      content: '',
      isGenerating: true,
      error: null,
      isComplete: false,
    })

    try {
      const response = await fetch('/api/notes/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, userId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // 处理可能的多个事件
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              switch (data.type) {
                case 'start':
                  // 开始生成
                  break
                case 'content':
                  // 直接追加新内容，保持简单
                  setState(prev => ({
                    ...prev,
                    content: prev.content + data.content,
                  }))
                  break
                case 'end':
                  setState(prev => ({
                    ...prev,
                    isGenerating: false,
                    isComplete: true,
                  }))
                  return
                case 'error':
                  setState(prev => ({
                    ...prev,
                    isGenerating: false,
                    error: data.error || 'Unknown error occurred',
                  }))
                  return
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in generateNote:', error)
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      }))
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      content: '',
      isGenerating: false,
      error: null,
      isComplete: false,
    })
  }, [])

  return {
    ...state,
    generateNote,
    reset,
  }
}
