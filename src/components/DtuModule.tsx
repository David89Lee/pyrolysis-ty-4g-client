import { useMemo, useState } from 'react'
import { Button, Card, Col, Row, Space, Statistic, Tag } from 'antd'
import dayjs from 'dayjs'
import type { SampleEvent } from '../types'
import CurveModal from './CurveModal'
import RecordModal from './RecordModal'

interface DtuModuleProps {
  dtu: number
  sample?: SampleEvent
}

interface SensorItem {
  key: keyof SampleEvent & string
  label: string
  unit: string
  precision?: number
}

// 8 个采样寄存器（去掉状态码，传感器状态/报警以 Tag 形式展示在底部）
const SENSOR_ITEMS: SensorItem[] = [
  { key: 'temperature', label: '温度', unit: '°C', precision: 1 },
  { key: 'humidity', label: '湿度', unit: '%', precision: 1 },
  { key: 'pm1_0', label: 'PM1.0', unit: 'μg/m³' },
  { key: 'pm2_5', label: 'PM2.5', unit: 'μg/m³' },
  { key: 'pm10', label: 'PM10', unit: 'μg/m³' },
  { key: 'tvoc_sample', label: 'TVOC 采样值', unit: 'ppb' },
  { key: 'tvoc_background', label: 'TVOC 本底值', unit: 'ppb' },
  { key: 'pyrolysis', label: '热解粒子值', unit: 'ppb' },
]

type ListMode = 'records' | 'history'

export default function DtuModule({ dtu, sample }: DtuModuleProps) {
  const [curve, setCurve] = useState<{ field: string; title: string } | null>(null)
  const [listMode, setListMode] = useState<ListMode | null>(null)

  const values = useMemo(() => {
    if (!sample) return null
    return sample as unknown as Record<string, number>
  }, [sample])

  return (
    <Card
      title={`Dtu ${dtu}`}
      extra={
        <Space>
          <Button onClick={() => setListMode('records')}>查看记录</Button>
          <Button onClick={() => setListMode('history')}>查看历史</Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        {SENSOR_ITEMS.map((item) => (
          <Col key={item.key} xs={12} sm={8} md={6} lg={5} xl={4}>
            <Card size="small" className="sensor-card">
              <Statistic
                title={item.label}
                value={values?.[item.key] ?? '--'}
                precision={item.precision}
                suffix={item.unit}
                styles={{ value: { fontSize: 22 } }}
              />
              <Button
                type="link"
                size="small"
                onClick={() => setCurve({ field: item.key, title: item.label })}
              >
                查看曲线
              </Button>
            </Card>
          </Col>
        ))}
        <Col xs={12} sm={8} md={6} lg={4} xl={4}>
          <Card size="small" className="sensor-card" title="传感器状态">
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Tag color={sample ? (sample.sensor_normal ? 'success' : 'error') : 'default'}>
                {sample ? (sample.sensor_normal ? '正常' : '异常') : '--'}
              </Tag>
              <Tag color={sample ? (sample.alarming ? 'error' : 'success') : 'default'}>
                {sample ? (sample.alarming ? '报警中' : '无报警') : '--'}
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="sensor-footer">
        <Space>
          <Tag color={sample ? (sample.sensor_normal ? 'success' : 'error') : 'default'}>
            传感器{sample ? (sample.sensor_normal ? '正常' : '异常') : '--'}
          </Tag>
          <Tag color={sample ? (sample.alarming ? 'error' : 'success') : 'default'}>
            {sample ? (sample.alarming ? '报警中' : '无报警') : '--'}
          </Tag>
        </Space>
        {sample?.timestamp && (
          <span className="sensor-time">
            采样时间：{dayjs(sample.timestamp).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        )}
      </div>

      {curve && (
        <CurveModal
          open
          dtu={dtu}
          field={curve.field}
          title={`Dtu ${dtu} - ${curve.title} 曲线`}
          onClose={() => setCurve(null)}
        />
      )}
      {listMode && (
        <RecordModal
          open
          dtu={dtu}
          mode={listMode}
          onClose={() => setListMode(null)}
        />
      )}
    </Card>
  )
}
