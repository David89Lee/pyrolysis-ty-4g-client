// 后端 SSE 推送的采样事件，对应 Go 端 sse.SampleEvent
export interface SampleEvent {
  dtu: number // DTU 编号 1~4
  timestamp: string
  temperature: number // °C
  humidity: number // %
  pm1_0: number // μg/m³
  pm2_5: number // μg/m³
  pm10: number // μg/m³
  tvoc_sample: number // ppb
  tvoc_background: number // ppb
  pyrolysis: number // ppb
  status_code: number
  sensor_normal: boolean
  alarming: boolean
  error?: string
}

// 设备信息实体，对应 Go 端 model.Info（gorm.Model + Sn + Description，无 json tag，键名为大写）
export interface Info {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  Sn: string
  Description: string
}

// 后端统一响应结构
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

// 分页响应 data（对应 Go 端 response.PageData，pagination 为嵌套对象）
export interface Pagination {
  page: number
  page_size: number
  total: number
}

export interface PageData<T> {
  list: T[] | null
  pagination: Pagination
}

// DTU 采样记录，对应 Go 端 model.DtuBase（无明显 json tag，键名为结构体字段名）
export interface DtuRecord {
  ID: number
  CreatedAt: string
  Year: number
  Month: number
  Day: number
  Hour: number
  Minute: number
  Second: number
  Temperature: number // °C
  Humidity: number // %
  Pm1: number // pm1.0 μg/m³
  Pm2dot5: number // pm2.5 μg/m³
  Pm10: number // pm10 μg/m³
  TvocSampling: number // tvoc 采样值 ppb
  TvocBackground: number // tvoc 本底值 ppb
  Pyrolysis: number // 热解粒子值 ppb
  SensorState: boolean // 传感器状态
  Alarm: boolean // 是否报警
}

// 曲线数据点
export interface CurvePoint {
  time: string
  value: number
}
