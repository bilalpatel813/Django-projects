import http from './http'
import { dashboardEndpointPath } from '../utils/format'

export const dashboardService = {
  async getStats() {
    const { data } = await http.get(dashboardEndpointPath())
    return data
  },
}
