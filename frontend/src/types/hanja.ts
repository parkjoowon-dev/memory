export interface Example {
  sentence: string
  meaning: string
}

export interface Hanja {
  id: string
  character: string // 한자
  sound: string // 음
  meaning: string // 뜻
  strokeOrder: string[] // 획순 (이미지 경로 또는 좌표)
  examples: Example[] // 예문
  chapter: number // 단원
  difficulty: number // 난이도 (1-5)
}

export interface Chapter {
  id: number
  title: string
  hanjaCount: number
  completed: boolean
  progress: number // 0-100
}

export interface Progress {
  userId: string
  chapter: number
  completedHanja: string[] // 완료한 한자 ID 리스트
  studyCount: number // 학습 횟수
  lastStudied: Date
}

export interface QuizResult {
  hanjaId: string
  questionType: string
  isCorrect: boolean
  timestamp: Date
}

export interface ExamResult {
  examId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number // 초 단위
  wrongAnswers: string[]
  timestamp: Date
}

export type QuestionType = 
  | 'character-to-meaning' // 한자 → 뜻
  | 'meaning-to-character' // 뜻 → 한자
  | 'character-to-sound' // 한자 → 음
  | 'sound-to-character' // 음 → 한자

