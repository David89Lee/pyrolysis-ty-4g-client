import { App as AntdApp, DatePicker, Modal, Space, Spin } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { useEffect, useRef, useState } from 'react'
import { fetchDtuCurve } from '../api'
import type { CurvePoint } from '../types'

const SUCCESS_CODE = 200
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

interface CurveModalProps {
  open: boolean
  dtu: number
  field: string
  title: string
  onClose: () => void
}

export default function CurveModal({ open, dtu, field, title, onClose }: CurveModalProps) {
  const { message } = AntdApp.useApp()
  const [range, setRange] = useState<[Dayjs, Dayjs]>(() => [
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ])
  const [points, setPoints] = useState<CurvePoint[]>([])
  const [loading, setLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchDtuCurve(dtu, field, range[0].format(TIME_FORMAT), range[1].format(TIME_FORMAT))
      .then((res) => {
        if (cancelled) return
        if (res.data.code === SUCCESS_CODE) {
          setPoints(res.data.data ?? [])
        } else {
          message.error(res.data.msg || '查询曲线数据失败')
        }
      })
      .catch(() => {
        if (!cancelled) message.error('查询曲线数据请求失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [dtu, field, range, message])

  // 弹窗内容由 Portal 延迟挂载，组件挂载时容器还不存在，因此在这里惰性初始化图表
  useEffect(() => {
    if (!open) return
    const container = containerRef.current
    if (!container) return

    let chart = chartRef.current
    if (!chart) {
      chart = echarts.init(container)
      chartRef.current = chart
      observerRef.current = new ResizeObserver(() => chart?.resize())
      observerRef.current.observe(container)
    }

    chart.setOption(
      {
        tooltip: { trigger: 'axis' },
        grid: { left: 56, right: 24, top: 32, bottom: 64 },
        xAxis: {
          type: 'category',
          data: points.map((p) => p.time),
          boundaryGap: false,
          axisLabel: { hideOverlap: true },
        },
        yAxis: { type: 'value' },
        dataZoom: [
          { type: 'inside' },
          { type: 'slider', height: 18 },
        ],
        series: [
          {
            name: title,
            type: 'line',
            showSymbol: false,
            smooth: true,
            data: points.map((p) => p.value),
          },
        ],
      },
      true,
    )
    chart.resize()
  }, [open, points, title])

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      style={{ maxWidth: '96vw' }}
      destroyOnHidden
    >
      <Space style={{ marginBottom: 16 }}>
        <DatePicker.RangePicker
          showTime
          allowClear={false}
          value={range}
          onChange={(dates) => {
            if (dates?.[0] && dates?.[1]) {
              setRange([dates[0], dates[1]])
            }
          }}
        />
      </Space>
      <Spin spinning={loading}>
        <div ref={containerRef} style={{ width: '100%', height: 420 }} />
      </Spin>
    </Modal>
  )
}
