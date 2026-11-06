import { App as AntdApp, Badge, Col, ConfigProvider, Layout, Row, Typography } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import DtuModule from './components/DtuModule'
import InfoPanel from './components/InfoPanel'
import { useSampleStream } from './hooks/useSampleStream'

const { Header, Content } = Layout

const DTU_LIST = [1, 2, 3, 4]

export default function App() {
  const { samples, connected } = useSampleStream()

  return (
    <ConfigProvider locale={zhCN}>
      <AntdApp>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
              热解粒子监测系统
            </Typography.Title>
            <Badge
              status={connected ? 'processing' : 'default'}
              text={
                <span style={{ color: '#fff' }}>
                  {connected ? '实时数据已连接' : '实时数据未连接'}
                </span>
              }
            />
          </Header>
          <Content style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Row gutter={[24, 24]}>
                {DTU_LIST.map((dtu) => (
                  <Col key={dtu} xs={24} xl={12}>
                    <DtuModule dtu={dtu} sample={samples[dtu]} />
                  </Col>
                ))}
              </Row>
              <InfoPanel />
            </div>
          </Content>
        </Layout>
      </AntdApp>
    </ConfigProvider>
  )
}
