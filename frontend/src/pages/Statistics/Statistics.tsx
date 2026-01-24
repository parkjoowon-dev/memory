import { useStore } from '../../store/useStore'
import './Statistics.css'

const Statistics = () => {
  const { progress, quizResults, examResults, hanjaList } = useStore()
  
  const totalProgress = progress.length > 0
    ? progress.reduce((sum, p) => sum + (p.completedHanja.length / hanjaList.length) * 100, 0) / progress.length
    : 0
  
  const totalQuizQuestions = quizResults.length
  const correctQuizAnswers = quizResults.filter((r) => r.isCorrect).length
  const quizAccuracy = totalQuizQuestions > 0 
    ? (correctQuizAnswers / totalQuizQuestions) * 100 
    : 0

  return (
    <div className="statistics">
      <div className="statistics-header">
        <h1>학습 통계</h1>
        <p>나의 학습 현황을 확인하세요</p>
      </div>

      <div className="statistics-content">
        <div className="stat-card">
          <h3>전체 진도</h3>
          <div className="stat-value">{Math.round(totalProgress)}%</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        <div className="stat-card">
          <h3>퀴즈 정답률</h3>
          <div className="stat-value">{Math.round(quizAccuracy)}%</div>
          <div className="stat-detail">
            {correctQuizAnswers} / {totalQuizQuestions} 문제
          </div>
        </div>

        <div className="stat-card">
          <h3>완료한 단원</h3>
          <div className="stat-value">
            {progress.filter((p) => p.completedHanja.length > 0).length}개
          </div>
        </div>

        <div className="stat-card">
          <h3>시험 응시 횟수</h3>
          <div className="stat-value">{examResults.length}회</div>
        </div>
      </div>
    </div>
  )
}

export default Statistics

