import { create } from 'zustand'
import { Hanja, Progress, QuizResult, ExamResult } from '../types/hanja'

interface AppState {
  // 한자 데이터
  hanjaList: Hanja[]
  setHanjaList: (hanja: Hanja[]) => void
  
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

export const useStore = create<AppState>((set) => ({
  // 초기 상태
  hanjaList: [],
  progress: [],
  quizResults: [],
  examResults: [],
  wrongAnswers: [],
  currentChapter: null,
  
  // Actions
  setHanjaList: (hanja) => set({ hanjaList: hanja }),
  
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

