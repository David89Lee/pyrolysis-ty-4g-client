import axios from 'axios'
import type {
  ApiResponse,
  CurvePoint,
  DtuRecord,
  Info,
  PageData,
} from '../types'

const http = axios.create({
  baseURL: '/',
  timeout: 10000,
})

// 时间范围查询参数
export interface TimePageParams {
  start: string
  end: string
  page: number
  pageSize: number
}

// ===== 设备信息（Info）增删改查 =====

export function fetchInfos(page: number, pageSize: number) {
  return http.get<ApiResponse<PageData<Info>>>('/api/v1/info', {
    params: { page, pageSize },
  })
}

// Go 端 BindJSON 大小写不敏感，这里与 struct 字段名保持一致
export function createInfo(sn: string, description: string) {
  return http.post<ApiResponse<Info>>('/api/v1/info', {
    Sn: sn,
    Description: description,
  })
}

export function updateInfo(id: number, sn: string, description: string) {
  return http.put<ApiResponse<Info>>('/api/v1/info', {
    ID: id,
    Sn: sn,
    Description: description,
  })
}

export function deleteInfo(id: number) {
  return http.delete<ApiResponse<null>>(`/api/v1/info/${id}`)
}

// ===== DTU 采样数据 =====

// 查询某个 DTU 的实时记录（dtu 1~4，对应 Dtu1~Dtu4 表）
export function fetchDtuRecords(dtu: number, params: TimePageParams) {
  return http.get<ApiResponse<PageData<DtuRecord>>>(`/api/v1/dtu/${dtu}/records`, {
    params,
  })
}

// 查询某个 DTU 的历史记录（对应 Dtu1His~Dtu4His 表）
export function fetchDtuHistory(dtu: number, params: TimePageParams) {
  return http.get<ApiResponse<PageData<DtuRecord>>>(`/api/v1/dtu/${dtu}/history`, {
    params,
  })
}

// 查询某个 DTU 单个参数在时间范围内的曲线数据
export function fetchDtuCurve(
  dtu: number,
  field: string,
  start: string,
  end: string,
) {
  return http.get<ApiResponse<CurvePoint[]>>(`/api/v1/dtu/${dtu}/curve`, {
    params: { field, start, end },
  })
}
