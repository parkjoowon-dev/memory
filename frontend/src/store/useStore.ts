import { create } from 'zustand'
import { Hanja, Progress, QuizResult, ExamResult } from '../types/hanja'
import { fetchHanjaList } from '../utils/api'

interface AppState {
  // 한자 데이터
  hanjaList: Hanja[]
  setHanjaList: (hanja: Hanja[]) => void
  loadHanjaList: () => Promise<void>
  isLoading: boolean
  error: string | null
  
  // 학습 진행도
  progress: Progress[]
  updateProgress: (progress: Progress) => void
  
  // 퀴즈 결과
  quizResults: QuizResult[]
  addQuizResult: (result: QuizResult) => void
  
  // 시험 결과
  examResults: ExamResult[]
  addExamResult: (result: ExamResult) => void
  
  // 오답 노트
  wrongAnswers: string[] // 한자 ID 리스트
  addWrongAnswer: (hanjaId: string) => void
  removeWrongAnswer: (hanjaId: string) => void
  
  // 현재 학습 중인 단원
  currentChapter: number | null
  setCurrentChapter: (chapter: number | null) => void
}

export const useStore = create<AppState>((set, get) => ({
  // 초기 상태
  hanjaList: [],
  progress: [],
  quizResults: [],
  examResults: [],
  wrongAnswers: [],
  currentChapter: null,
  isLoading: false,
  error: null,
  
  // Actions
  setHanjaList: (hanja) => set({ hanjaList: hanja, error: null }),
  
  // API에서 한자 데이터 로드
  loadHanjaList: async () => {
    const { hanjaList } = get()
    
    // 이미 데이터가 있으면 다시 로드하지 않음
    if (hanjaList.length > 0) {
      return
    }
    
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetchHanjaList()
      
      if (response.error) {
        set({ error: response.error, isLoading: false })
        console.error('한자 데이터 로드 실패:', response.error)
        return
      }
      
      if (response.data?.hanja) {
        set({ hanjaList: response.data.hanja, isLoading: false, error: null })
        console.log(`✅ ${response.data.hanja.length}개의 한자 데이터를 로드했습니다.`)
      } else {
        set({ error: '데이터 형식이 올바르지 않습니다.', isLoading: false })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      set({ error: errorMessage, isLoading: false })
      console.error('한자 데이터 로드 중 오류:', error)
    }
  },
  
  updateProgress: (progress) =>
    set((state) => ({
      progress: [
        ...state.progress.filter((p) => p.chapter !== progress.chapter),
        progress,
      ],
    })),
  
  addQuizResult: (result) =>
    set((state) => ({
      quizResults: [...state.quizResults, result],
      wrongAnswers: result.isCorrect
        ? state.wrongAnswers
        : [...new Set([...state.wrongAnswers, result.hanjaId])],
    })),
  
  addExamResult: (result) => set((state) => ({
    examResults: [...state.examResults, result],
  })),
  
  addWrongAnswer: (hanjaId) =>
    set((state) => ({
      wrongAnswers: [...new Set([...state.wrongAnswers, hanjaId])],
    })),
  
  removeWrongAnswer: (hanjaId) =>
    set((state) => ({
      wrongAnswers: state.wrongAnswers.filter((id) => id !== hanjaId),
    })),
  
  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
}))

