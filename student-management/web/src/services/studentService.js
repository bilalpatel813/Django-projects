import http from './http'

export const studentService = {
  async list({ page = 1, signal } = {}) {
    const { data } = await http.get('/students/', { params: { page }, signal })
    return data
  },
  async get(id, signal) {
    const { data } = await http.get(`/students/${encodeURIComponent(id)}/`, { signal })
    return data
  },
  async create(values) {
    const { data } = await http.post('/students/', values)
    return data
  },
  async update(id, values) {
    const { data } = await http.patch(`/students/${encodeURIComponent(id)}/`, values)
    return data
  },
  async remove(id) {
    await http.delete(`/students/${encodeURIComponent(id)}/`)
  },
}
