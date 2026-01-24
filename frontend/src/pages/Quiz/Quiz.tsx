import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../../store/useStore'
import { QuestionType, Hanja } from '../../types/hanja'
import './Quiz.css'

const Quiz = () => {
  const { hanjaList, addQuizResult } = useStore()
  const [currentQuestion, setCurrentQuestion] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState<boolean>(false)
  const [questions, setQuestions] = useState<Array<{
    hanja: Hanja
    type: QuestionType
    options: string[]
    correctAnswer: string
  }>>([])

  const generateOptions = useCallback((
    list: Hanja[],
    field: 'meaning' | 'character' | 'sound',
    correct: string
  ): string[] => {
    const options = new Set<string>([correct])
    while (options.size < 4) {
      const random = list[Math.floor(Math.random() * list.length)]
      options.add(random[field])
    }
    return Array.from(options).sort(() => Math.random() - 0.5)
  }, [])

  const generateQuestions = useCallback(() => {
    const questionTypes: QuestionType[] = [
      'character-to-meaning',
      'meaning-to-character',
      'character-to-sound',
      'sound-to-character',
    ]

    const generated = hanjaList.slice(0, 10).map((hanja) => {
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)]
      let correctAnswer: string
      let options: string[]

      switch (type) {
        case 'character-to-meaning':
          correctAnswer = hanja.meaning
          options = generateOptions(hanjaList, 'meaning', hanja.meaning)
          break
        case 'meaning-to-character':
          correctAnswer = hanja.character
          options = generateOptions(hanjaList, 'character', hanja.character)
          break
        case 'character-to-sound':
          correctAnswer = hanja.sound
          options = generateOptions(hanjaList, 'sound', hanja.sound)
          break
        case 'sound-to-character':
          correctAnswer = hanja.character
          options = generateOptions(hanjaList, 'character', hanja.character)
          break
      }

      return { hanja, type, options, correctAnswer }
    })

    setQuestions(generated)
  }, [generateOptions, hanjaList])

  useEffect(() => {
    generateQuestions()
  }, [generateQuestions])

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return

    setSelectedAnswer(answer)
    const isCorrect = answer === questions[currentQuestion].correctAnswer
    setShowResult(true)

    if (isCorrect) {
      setScore(score + 1)
    }

    addQuizResult({
      hanjaId: questions[currentQuestion].hanja.id,
      questionType: questions[currentQuestion].type,
      isCorrect,
      timestamp: new Date(),
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const getQuestionText = () => {
    const q = questions[currentQuestion]
    if (!q) return ''

    switch (q.type) {
      case 'character-to-meaning':
        return `"${q.hanja.character}"의 뜻은?`
      case 'meaning-to-character':
        return `"${q.hanja.meaning}"을 나타내는 한자는?`
      case 'character-to-sound':
        return `"${q.hanja.character}"의 음은?`
      case 'sound-to-character':
        return `"${q.hanja.sound}"로 읽는 한자는?`
      default:
        return ''
    }
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-empty">
        <p>한자 데이터가 없습니다.</p>
      </div>
    )
  }

  const q = questions[currentQuestion]
  const isCorrect = selectedAnswer === q?.correctAnswer

  return (
    <div className="quiz">
      <div className="quiz-header">
        <div className="quiz-progress">
          문제 {currentQuestion + 1} / {questions.length}
        </div>
        <div className="quiz-score">점수: {score}점</div>
      </div>

      <div className="quiz-question">
        <h2 className="question-text">{getQuestionText()}</h2>
      </div>

      <div className="quiz-options">
        {q?.options.map((option, idx) => {
          const isSelected = selectedAnswer === option
          const isCorrectOption = option === q.correctAnswer
          let className = 'option-button'

          if (showResult) {
            if (isCorrectOption) {
              className += ' correct'
            } else if (isSelected && !isCorrectOption) {
              className += ' incorrect'
            }
          } else if (isSelected) {
            className += ' selected'
          }

          return (
            <button
              key={idx}
              className={className}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
            >
              {option}
            </button>
          )
        })}
      </div>

      {showResult && (
        <div className="quiz-result">
          <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? '✓ 정답입니다!' : '✗ 틀렸습니다.'}
          </div>
          {!isCorrect && (
            <div className="correct-answer">
              정답: {q.correctAnswer}
            </div>
          )}
          {currentQuestion < questions.length - 1 ? (
            <button className="next-button" onClick={handleNext}>
              다음 문제
            </button>
          ) : (
            <div className="quiz-complete">
              <h3>퀴즈 완료!</h3>
              <p>최종 점수: {score} / {questions.length}</p>
              <button
                className="restart-button"
                onClick={() => {
                  setCurrentQuestion(0)
                  setScore(0)
                  setSelectedAnswer(null)
                  setShowResult(false)
                  generateQuestions()
                }}
              >
                다시 풀기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Quiz

