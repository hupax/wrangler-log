/**
 * 将字符串中的 \n 转换成真实的换行符
 * @param content 原始内容字符串
 * @returns 处理后的内容字符串
 */
export function process(content: string): string {
  if (!content) return ''

  return content
    .replace(/\\n/g, '\n') // 将 \n 转换为真实换行
    .replace(/\\r\\n/g, '\n') // 处理 Windows 换行符
    .replace(/\\r/g, '\n') // 处理 Mac 旧版换行符
}
