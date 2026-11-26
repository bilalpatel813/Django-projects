import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import { createServer } from 'vite'

const values = new Map()
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
}
globalThis.window = new EventTarget()

let server, httpModule, authService, handler
const adapter = (config) => handler(config)
const response = (config, data = {}, status = 200) => ({ data, status, statusText: '', headers: {}, config })
function reject(config, status) {
  return Promise.reject(new axios.AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, response(config, {}, status)))
}
function deferred() {
  let resolve
  const promise = new Promise((r) => { resolve = r })
  return { promise, resolve }
}
function tokenPair() {
  const { access, refresh } = httpModule.readTokens()
  return { access, refresh }
}

before(async () => {
  axios.defaults.adapter = adapter
  server = await createServer({ configFile: false, server: { middlewareMode: true } })
  httpModule = await server.ssrLoadModule('/src/services/http.js')
  ;({ authService } = await server.ssrLoadModule('/src/services/authService.js'))
})
beforeEach(() => {
  values.clear()
  httpModule.saveTokens(null)
})
after(async () => {
  httpModule.saveTokens(null)
  await server.close()
})

test('login never sends stale authorization and never refreshes on 401', async () => {
  httpModule.saveTokens({ access: 'old', refresh: 'old-refresh' })
  const calls = []
  handler = (config) => {
    calls.push(config.url)
    assert.equal(config.headers.Authorization, undefined)
    return reject(config, 401)
  }
  await assert.rejects(authService.login({ username: 'a', password: 'b' }))
  assert.deepEqual(calls, ['/login'])
  assert.equal(httpModule.getAccessToken(), 'old')
})

test('concurrent 401s share one refresh and retry with rotated tokens', async () => {
  httpModule.saveTokens({ access: 'old', refresh: 'old-refresh' })
  const gate = deferred()
  let refreshes = 0
  handler = async (config) => {
    if (config.url === '/token/refresh') {
      refreshes++
      await gate.promise
      return response(config, { access: 'new', refresh: 'new-refresh' })
    }
    return config.headers.Authorization === 'Bearer old' ? reject(config, 401) : response(config, { ok: true })
  }
  const requests = [httpModule.default.get('/Me'), httpModule.default.get('/students')]
  await new Promise((resolve) => setTimeout(resolve, 10))
  assert.equal(refreshes, 1)
  gate.resolve()
  await Promise.all(requests)
  assert.deepEqual(tokenPair(), { access: 'new', refresh: 'new-refresh' })
})

test('network refresh failure preserves tokens; rejected refresh clears them once', async () => {
  httpModule.saveTokens({ access: 'old', refresh: 'old-refresh' })
  let expired = 0
  const onExpired = () => { expired++ }
  window.addEventListener('auth:expired', onExpired)
  handler = (config) => config.url === '/token/refresh'
    ? Promise.reject(new axios.AxiosError('offline', 'ERR_NETWORK', config)) : reject(config, 401)
  await assert.rejects(httpModule.default.get('/Me'))
  assert.equal(httpModule.getAccessToken(), 'old')
  assert.equal(expired, 0)
  handler = (config) => reject(config, 401)
  await assert.rejects(httpModule.default.get('/Me'))
  assert.equal(httpModule.readTokens(), null)
  assert.equal(expired, 1)
  window.removeEventListener('auth:expired', onExpired)
})

test('logout during rotation cannot restore tokens and revokes the rotated pair', async () => {
  httpModule.saveTokens({ access: 'old', refresh: 'old-refresh' })
  const gate = deferred()
  const started = deferred()
  let logout
  handler = async (config) => {
    if (config.url === '/token/refresh') {
      started.resolve()
      await gate.promise
      return response(config, { access: 'new', refresh: 'new-refresh' })
    }
    if (config.url === '/logout') {
      logout = { body: JSON.parse(config.data), authorization: config.headers.Authorization }
      return response(config, {}, 205)
    }
    return reject(config, 401)
  }
  const request = httpModule.default.get('/Me')
  const rejection = assert.rejects(request)
  await started.promise
  const session = httpModule.endSession()
  const revocation = authService.logout(session)
  assert.equal(httpModule.readTokens(), null)
  gate.resolve()
  await Promise.all([rejection, revocation])
  assert.deepEqual(logout, { body: { refresh: 'new-refresh' }, authorization: 'Bearer new' })
  assert.equal(httpModule.readTokens(), null)
})

test('a late refresh cannot overwrite a newer login', async () => {
  httpModule.saveTokens({ access: 'old', refresh: 'old-refresh' })
  const gate = deferred()
  const started = deferred()
  handler = async (config) => {
    if (config.url === '/token/refresh') {
      started.resolve()
      await gate.promise
      return response(config, { access: 'rotated', refresh: 'rotated-refresh' })
    }
    return reject(config, 401)
  }
  const request = httpModule.default.get('/Me')
  const rejection = assert.rejects(request)
  await started.promise
  httpModule.saveTokens({ access: 'different', refresh: 'different-refresh' })
  gate.resolve()
  await rejection
  assert.deepEqual(tokenPair(), { access: 'different', refresh: 'different-refresh' })
})

test('a rotation finishing after another tab clears storage is revoked', async () => {
  httpModule.saveTokens({ access: 'old', refresh: 'old-refresh' })
  const gate = deferred()
  const started = deferred()
  const revoked = deferred()
  handler = async (config) => {
    if (config.url === '/token/refresh') {
      started.resolve()
      await gate.promise
      return response(config, { access: 'rotated', refresh: 'rotated-refresh' })
    }
    if (config.url === '/logout') {
      revoked.resolve(JSON.parse(config.data))
      return response(config, {}, 205)
    }
    return reject(config, 401)
  }
  const rejection = assert.rejects(httpModule.default.get('/Me'))
  await started.promise
  localStorage.removeItem('sms.auth.tokens')
  gate.resolve()
  await rejection
  assert.deepEqual(await revoked.promise, { refresh: 'rotated-refresh' })
  assert.equal(httpModule.readTokens(), null)
})

test('a rejected retried request expires the session without another refresh', async () => {
  httpModule.saveTokens({ access: 'old', refresh: 'old-refresh' })
  let refreshes = 0
  handler = (config) => {
    if (config.url === '/token/refresh') {
      refreshes++
      return Promise.resolve(response(config, { access: 'new', refresh: 'new-refresh' }))
    }
    return reject(config, 401)
  }
  await assert.rejects(httpModule.default.get('/Me'))
  assert.equal(refreshes, 1)
  assert.equal(httpModule.readTokens(), null)
})

test('logout refreshes an expired access token before blacklisting', async () => {
  httpModule.saveTokens({ access: 'old', refresh: 'old-refresh' })
  const calls = []
  handler = (config) => {
    calls.push([config.url, config.headers.Authorization, JSON.parse(config.data)])
    if (config.url === '/token/refresh') return Promise.resolve(response(config, { access: 'new', refresh: 'new-refresh' }))
    return config.headers.Authorization === 'Bearer old' ? reject(config, 401) : Promise.resolve(response(config, {}, 205))
  }
  await authService.logout(httpModule.endSession())
  assert.deepEqual(calls.map(([url]) => url), ['/logout', '/token/refresh', '/logout'])
  assert.equal(calls[2][1], 'Bearer new')
  assert.deepEqual(calls[2][2], { refresh: 'new-refresh' })
})

test('maintenance rotates a refresh token before it expires', async () => {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 59 })).toString('base64url')
  const rotated = deferred()
  handler = (config) => {
    assert.equal(config.url, '/token/refresh')
    rotated.resolve()
    return Promise.resolve(response(config, { access: 'new', refresh: 'new-refresh' }))
  }
  httpModule.saveTokens({ access: 'old', refresh: `header.${payload}.signature` })
  await rotated.promise
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(tokenPair(), { access: 'new', refresh: 'new-refresh' })
})

test('an old 401 cannot retry with a different tab’s new login', async () => {
  httpModule.saveTokens({ access: 'old', refresh: 'old-refresh' })
  const gate = deferred()
  const started = deferred()
  let calls = 0
  handler = async (config) => {
    calls++
    started.resolve()
    await gate.promise
    return reject(config, 401)
  }
  const rejection = assert.rejects(httpModule.default.get('/Me'))
  await started.promise
  localStorage.setItem('sms.auth.tokens', JSON.stringify({ access: 'other', refresh: 'other-refresh', sessionId: 'other-session' }))
  gate.resolve()
  await rejection
  assert.equal(calls, 1)
  assert.deepEqual(tokenPair(), { access: 'other', refresh: 'other-refresh' })
})
