import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import styled from 'styled-components'
import './Home.css'

const NameInputOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`

const NameInputContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`

const NameInputTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
`

const NameInputSubtitle = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  text-align: center;
`

const NameInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`

const NameInputButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1d4ed8;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

const Home = () => {
  const { progress, hanjaList, userName, setUserName } = useStore()
  const navigate = useNavigate()
  const [nameInput, setNameInput] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)

  useEffect(() => {
    // 사용자 이름이 없으면 입력 폼 표시
    if (!userName) {
      setShowNameInput(true)
    }
  }, [userName])

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = nameInput.trim()
    if (trimmedName) {
      setUserName(trimmedName)
      setShowNameInput(false)
      setNameInput('')
    }
  }

  // 전체 진도 계산
  const totalProgress = progress.length > 0
    ? progress.reduce((sum, p) => sum + (p.completedHanja.length / hanjaList.length) * 100, 0) / progress.length
    : 0
  
  const completedChapters = progress.filter((p) => p.completedHanja.length > 0).length

  return (
    <>
      {showNameInput && (
        <NameInputOverlay>
          <NameInputContainer>
            <NameInputTitle>이름을 입력해주세요</NameInputTitle>
            <NameInputSubtitle>여러 사람이 사용할 수 있도록 이름을 입력해주세요</NameInputSubtitle>
            <form onSubmit={handleNameSubmit}>
              <NameInput
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="이름을 입력하세요"
                autoFocus
                maxLength={20}
              />
              <NameInputButton type="submit" disabled={!nameInput.trim()}>
                시작하기
              </NameInputButton>
            </form>
          </NameInputContainer>
        </NameInputOverlay>
      )}

      <div className="home">
        <div className="home-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h1 className="home-title" style={{ margin: 0 }}>한자 5급 준비</h1>
            {userName && (
              <button
                onClick={() => {
                  setShowNameInput(true)
                  setNameInput(userName)
                }}
                style={{
                  background: 'none',
                  border: '1px solid #2563eb',
                  color: '#2563eb',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                이름 변경
              </button>
            )}
          </div>
          <p className="home-subtitle">
            {userName ? `${userName}님, ` : ''}체계적으로 학습하고 실전에 대비하세요
          </p>
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
    </>
  )
}

export default Home
