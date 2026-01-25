import { Hanja } from '../types/hanja'

// API 기본 URL (환경 변수에서 가져오거나 기본값 사용)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

/**
 * API 호출 헬퍼 함수
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    console.error('API 호출 오류:', error)
    return {
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    }
  }
}

/**
 * 모든 한자 데이터 가져오기
 */
export async function fetchHanjaList(): Promise<ApiResponse<{ hanja: Hanja[] }>> {
  return fetchApi<{ hanja: Hanja[] }>('/api/hanja')
}

/**
 * 특정 한자 데이터 가져오기
 */
export async function fetchHanjaById(hanjaId: string): Promise<ApiResponse<Hanja>> {
  return fetchApi<Hanja>(`/api/hanja/${hanjaId}`)
}

/**
 * 단원별 한자 데이터 가져오기
 */
export async function fetchHanjaByChapter(
  chapter: number
): Promise<ApiResponse<{ hanja: Hanja[] }>> {
  return fetchApi<{ hanja: Hanja[] }>(`/api/hanja/chapter/${chapter}`)
}
