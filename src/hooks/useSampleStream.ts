import { useEffect, useState } from 'react'
import type { SampleEvent } from '../types'

// 订阅后端 SSE /api/v1/sample/stream，按 dtu 编号保存最新的采样数据
export function useSampleStream() {
  const [samples, setSamples] = useState<Record<number, SampleEvent>>({})
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const es = new EventSource('/api/v1/sample/stream')

    es.onopen = () => setConnected(true)

    es.addEventListener('sample', (e) => {
      try {
        const ev = JSON.parse((e as MessageEvent).data) as SampleEvent
        if (!ev?.dtu) return
        setSamples((prev) => ({ ...prev, [ev.dtu]: ev }))
      } catch {
        // 忽略无法解析的帧
      }
    })

    // 出错（含断线）时浏览器会自动按 retry: 3000 重连
    es.onerror = () => setConnected(false)

    return () => es.close()
  }, [])

  return { samples, connected }
}
