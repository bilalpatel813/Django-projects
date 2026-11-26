import http from './http'

export const authService = {
  async login({ username, password }) {
    const { data } = await http.post('/login', { username, password })
    return data
  },

  async me() {
    const { data } = await http.get('/Me')
    return data
  },

  async logout(refresh) {
    try {
      await http.post('/logout', { refresh })
    } catch {
      // The access token may already be expired; local logout still succeeds.
    }
  },
}
