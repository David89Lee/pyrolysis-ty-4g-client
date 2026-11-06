import { useCallback, useEffect, useState } from 'react'
import {
  App as AntdApp,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { createInfo, deleteInfo, fetchInfos, updateInfo } from '../api'
import type { Info } from '../types'

const SUCCESS_CODE = 200

export default function InfoPanel() {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<{ sn: string; description: string }>()

  const [infos, setInfos] = useState<Info[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Info | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadInfos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchInfos(page, pageSize)
      if (res.data.code === SUCCESS_CODE) {
        setInfos(res.data.data.list ?? [])
        setTotal(res.data.data.pagination.total)
      } else {
        message.error(res.data.msg || '查询设备信息列表失败')
      }
    } catch {
      message.error('查询设备信息列表请求失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, message])

  useEffect(() => {
    loadInfos()
  }, [loadInfos])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (info: Info) => {
    setEditing(info)
    form.setFieldsValue({ sn: info.Sn, description: info.Description })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    let values: { sn: string; description: string }
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    const { sn, description } = values
    setSubmitting(true)
    try {
      const res = editing
        ? await updateInfo(editing.ID, sn, description)
        : await createInfo(sn, description)
      if (res.data.code === SUCCESS_CODE) {
        message.success(editing ? '更新成功' : '创建成功')
        setModalOpen(false)
        loadInfos()
      } else {
        message.error(res.data.msg || '保存失败')
      }
    } catch {
      message.error('保存请求失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (info: Info) => {
    try {
      const res = await deleteInfo(info.ID)
      if (res.data.code === SUCCESS_CODE) {
        message.success('删除成功')
        loadInfos()
      } else {
        message.error(res.data.msg || '删除失败')
      }
    } catch {
      message.error('删除请求失败')
    }
  }

  const columns: ColumnsType<Info> = [
    { title: 'ID', dataIndex: 'ID', width: 80 },
    { title: 'SN（DTU识别码）', dataIndex: 'Sn', width: 200 },
    { title: '描述', dataIndex: 'Description' },
    {
      title: '创建时间',
      dataIndex: 'CreatedAt',
      width: 200,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '--'),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该设备信息？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="设备信息列表"
      extra={<Button onClick={openCreate}>新增设备</Button>}
    >
      <Table<Info>
        rowKey="ID"
        columns={columns}
        dataSource={infos}
        loading={loading}
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

      <Modal
        title={editing ? '编辑设备' : '新增设备'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="sn"
            label="SN（DTU识别码）"
            rules={[
              { required: true, message: '请输入 DTU 识别码' },
              { len: 16, message: '识别码长度必须为 16 位' },
            ]}
          >
            <Input placeholder="如 AABB558087243440" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[
              { required: true, message: '请输入描述' },
              { max: 255, message: '描述不能超过 255 个字符' },
            ]}
          >
            <Input.TextArea rows={3} placeholder="请输入描述信息" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
