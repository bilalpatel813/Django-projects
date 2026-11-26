import http, { revokeSession } from './http'

export const authService = {
  async login({ username, password }) {
    const { data } = await http.post('/login', { username, password }, { skipAuth: true })
    return data
  },

  async me() {
    const { data } = await http.get('/Me')
    return data
  },

  async logout(session) {
    await revokeSession(session)
  },
}
