import { App as AntdApp, DatePicker, Modal, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { fetchDtuHistory, fetchDtuRecords } from '../api'
import type { DtuRecord } from '../types'

const SUCCESS_CODE = 200
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

type ListMode = 'records' | 'history'

interface RecordModalProps {
  open: boolean
  dtu: number
  mode: ListMode
  onClose: () => void
}

// 记录默认当天，历史默认最近一周
function defaultRange(mode: ListMode): [Dayjs, Dayjs] {
  if (mode === 'history') {
    return [dayjs().subtract(7, 'day').startOf('day'), dayjs().endOf('day')]
  }
  return [dayjs().startOf('day'), dayjs().endOf('day')]
}

export default function RecordModal({ open, dtu, mode, onClose }: RecordModalProps) {
  const { message } = AntdApp.useApp()
  const [range, setRange] = useState<[Dayjs, Dayjs]>(() => defaultRange(mode))
  const [records, setRecords] = useState<DtuRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = {
      start: range[0].format(TIME_FORMAT),
      end: range[1].format(TIME_FORMAT),
      page,
      pageSize,
    }
    const request = mode === 'history' ? fetchDtuHistory(dtu, params) : fetchDtuRecords(dtu, params)
    request
      .then((res) => {
        if (cancelled) return
        if (res.data.code === SUCCESS_CODE) {
          setRecords(res.data.data.list ?? [])
          setTotal(res.data.data.pagination.total)
        } else {
          message.error(res.data.msg || '查询数据失败')
        }
      })
      .catch(() => {
        if (!cancelled) message.error('查询数据请求失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [dtu, mode, page, pageSize, range, message])

  const columns: ColumnsType<DtuRecord> = [
    {
      title: '时间',
      dataIndex: 'CreatedAt',
      width: 180,
      render: (v: string) => (v ? dayjs(v).format(TIME_FORMAT) : '--'),
    },
    {
      title: '温度(°C)',
      dataIndex: 'Temperature',
      width: 100,
      render: (v: number) => v?.toFixed(1) ?? '--',
    },
    {
      title: '湿度(%)',
      dataIndex: 'Humidity',
      width: 100,
      render: (v: number) => v?.toFixed(1) ?? '--',
    },
    { title: 'PM1.0', dataIndex: 'Pm1', width: 90 },
    { title: 'PM2.5', dataIndex: 'Pm2dot5', width: 90 },
    { title: 'PM10', dataIndex: 'Pm10', width: 90 },
    { title: 'TVOC采样值', dataIndex: 'TvocSampling', width: 120 },
    { title: 'TVOC本底值', dataIndex: 'TvocBackground', width: 120 },
    { title: '热解粒子值', dataIndex: 'Pyrolysis', width: 120 },
    {
      title: '传感器状态',
      dataIndex: 'SensorState',
      width: 110,
      render: (v: boolean) => (
        <Tag color={v ? 'success' : 'error'}>{v ? '正常' : '异常'}</Tag>
      ),
    },
    {
      title: '报警',
      dataIndex: 'Alarm',
      width: 90,
      render: (v: boolean) => (
        <Tag color={v ? 'error' : 'success'}>{v ? '报警' : '正常'}</Tag>
      ),
    },
  ]

  return (
    <Modal
      title={`${mode === 'history' ? '历史数据' : '记录数据'} - Dtu ${dtu}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
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
              setPage(1)
            }
          }}
        />
      </Space>
      <Table<DtuRecord>
        rowKey="ID"
        size="small"
        columns={columns}
        dataSource={records}
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
      />
    </Modal>
  )
}
