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

// 학습 진행 상태 타입
export interface StudyProgress {
  user_id: string
  hanja_id: string
  chapter: number
  is_known: boolean
}

export interface StudyProgressListResponse {
  progress: StudyProgress[]
}

/**
 * 특정 사용자의 모든 학습 진행 상태 가져오기
 */
export async function fetchAllStudyProgress(
  userId: string = 'default'
): Promise<ApiResponse<StudyProgressListResponse>> {
  return fetchApi<StudyProgressListResponse>(`/api/study-progress/${userId}`)
}

/**
 * 특정 사용자의 특정 단원 학습 진행 상태 가져오기
 */
export async function fetchStudyProgressByChapter(
  userId: string = 'default',
  chapter: number
): Promise<ApiResponse<StudyProgressListResponse>> {
  return fetchApi<StudyProgressListResponse>(`/api/study-progress/${userId}/chapter/${chapter}`)
}

/**
 * 특정 사용자의 특정 한자 학습 진행 상태 가져오기
 */
export async function fetchStudyProgress(
  userId: string = 'default',
  hanjaId: string
): Promise<ApiResponse<StudyProgress>> {
  return fetchApi<StudyProgress>(`/api/study-progress/${userId}/hanja/${hanjaId}`)
}

/**
 * 학습 진행 상태 저장/업데이트
 */
export async function saveStudyProgress(
  progress: StudyProgress
): Promise<ApiResponse<StudyProgress>> {
  const API_BASE_URL = getApiBaseUrl()
  const url = API_BASE_URL ? `${API_BASE_URL}/api/study-progress` : '/api/study-progress'
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progress),
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

// 연습 진행 상태 타입
export interface PracticeProgress {
  user_id: string
  hanja_id: string
  chapter: number
  is_known: boolean
}

export interface PracticeProgressListResponse {
  progress: PracticeProgress[]
}

/**
 * 특정 사용자의 모든 연습 진행 상태 가져오기
 */
export async function fetchAllPracticeProgress(
  userId: string = 'default'
): Promise<ApiResponse<PracticeProgressListResponse>> {
  return fetchApi<PracticeProgressListResponse>(`/api/practice-progress/${userId}`)
}

/**
 * 특정 사용자의 특정 단원 연습 진행 상태 가져오기
 */
export async function fetchPracticeProgressByChapter(
  userId: string = 'default',
  chapter: number
): Promise<ApiResponse<PracticeProgressListResponse>> {
  return fetchApi<PracticeProgressListResponse>(`/api/practice-progress/${userId}/chapter/${chapter}`)
}

/**
 * 특정 사용자의 특정 한자 연습 진행 상태 가져오기
 */
export async function fetchPracticeProgress(
  userId: string = 'default',
  hanjaId: string
): Promise<ApiResponse<PracticeProgress>> {
  return fetchApi<PracticeProgress>(`/api/practice-progress/${userId}/hanja/${hanjaId}`)
}

/**
 * 연습 진행 상태 저장/업데이트
 */
export async function savePracticeProgress(
  progress: PracticeProgress
): Promise<ApiResponse<PracticeProgress>> {
  const API_BASE_URL = getApiBaseUrl()
  const url = API_BASE_URL ? `${API_BASE_URL}/api/practice-progress` : '/api/practice-progress'
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progress),
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
