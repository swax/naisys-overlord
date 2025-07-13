const API_BASE = '/api'

export interface HelloResponse {
  message: string
  timestamp: string
  success: boolean
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
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