const API_BASE = '/api'

export const api = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`)
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    return response.json()
  }
}

export const apiEndpoints = {
  hello: '/hello'
}