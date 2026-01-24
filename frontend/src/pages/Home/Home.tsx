import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import './Home.css'

const Home = () => {
  const { progress, hanjaList } = useStore()
  
  // 전체 진도 계산
  const totalProgress = progress.length > 0
    ? progress.reduce((sum, p) => sum + (p.completedHanja.length / hanjaList.length) * 100, 0) / progress.length
    : 0
  
  const completedChapters = progress.filter((p) => p.completedHanja.length > 0).length

  return (
    <div className="home">
      <div className="home-header">
        <h1 className="home-title">한자 5급 준비</h1>
        <p className="home-subtitle">체계적으로 학습하고 실전에 대비하세요</p>
      </div>

      <div className="home-progress">
        <div className="progress-card">
          <div className="progress-circle">
            <svg width="120" height="120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#2563eb"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - totalProgress / 100)}`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="progress-text">
              <span className="progress-percent">{Math.round(totalProgress)}%</span>
            </div>
          </div>
          <div className="progress-info">
            <p>완료 단원: {completedChapters}개</p>
            <p>학습한 한자: {progress.reduce((sum, p) => sum + p.completedHanja.length, 0)}개</p>
          </div>
        </div>
      </div>

      <div className="home-actions">
        <Link to="/chapters" className="action-button primary">
          <span className="button-icon">📚</span>
          <span className="button-text">학습 시작하기</span>
        </Link>
        <Link to="/quiz" className="action-button">
          <span className="button-icon">✏️</span>
          <span className="button-text">퀴즈 풀기</span>
        </Link>
        <Link to="/exam" className="action-button">
          <span className="button-icon">📝</span>
          <span className="button-text">시험 모드</span>
        </Link>
        <Link to="/statistics" className="action-button">
          <span className="button-icon">📊</span>
          <span className="button-text">학습 통계</span>
        </Link>
      </div>
    </div>
  )
}

export default Home

