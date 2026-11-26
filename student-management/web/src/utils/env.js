const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')

/**
 * Base URL for every API call.
 * - Leave VITE_API_BASE_URL empty in dev: requests go to "/api" and Vite proxies
 *   them to the Django server (see vite.config.js).
 * - In production set it to the deployed API origin (schema + host + port).
 *   Paths are appended to the configured base; only trailing slashes are removed.
 */
export const API_BASE_URL = rawBase || '/api'
