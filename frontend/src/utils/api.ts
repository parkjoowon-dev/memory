import { Hanja } from '../types/hanja'

// API 기본 URL 설정
// - 로컬 개발 환경: http://localhost:8000 (백엔드 서버)
// - 프로덕션 환경: 빈 문자열 (같은 도메인에서 서빙)
const getApiBaseUrl = (): string => {
  // 환경 변수가 명시적으로 설정되어 있으면 사용
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // 개발 모드인지 확인 (Vite의 import.meta.env.DEV)
  // 로컬에서 실행 중이면 (포트 3000) 백엔드 서버(8000)로 연결
  const isDev = import.meta.env.DEV
  
  // 개발 모드면 백엔드 서버 주소, 프로덕션 모드면 상대 경로
  return isDev ? 'http://localhost:8000' : ''
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

// API 기본 URL (함수로 동적 계산)
const API_BASE_URL = getApiBaseUrl()

/**
 * API 호출 헬퍼 함수
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint
    const response = await fetch(url, {
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
