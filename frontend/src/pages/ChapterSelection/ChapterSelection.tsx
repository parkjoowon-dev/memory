import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { fetchAllStudyProgress } from '../../utils/api'
import './ChapterSelection.css'

const ChapterSelection = () => {
  const navigate = useNavigate()
  const { hanjaList, userName } = useStore()
  const [studyProgress, setStudyProgress] = useState<Map<number, { known: number; total: number }>>(new Map())
  
  const userId = userName || 'default'
  
  // DB에서 학습 진행 상태 불러오기
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetchAllStudyProgress(userId)
        if (response.data) {
          // 단원별로 학습 상태 집계
          const progressMap = new Map<number, { known: number; total: number }>()
          
          // 각 단원별로 초기화
          for (let i = 1; i <= 10; i++) {
            progressMap.set(i, { known: 0, total: 0 })
          }
          
          // 학습한 한자들을 단원별로 집계
          response.data.progress.forEach((p) => {
            const chapter = p.chapter
            const current = progressMap.get(chapter) || { known: 0, total: 0 }
            progressMap.set(chapter, {
              known: p.is_known ? current.known + 1 : current.known,
              total: current.total + 1
            })
          })
          
          setStudyProgress(progressMap)
        }
      } catch (error) {
        console.error('학습 진행 상태 불러오기 실패:', error)
      }
    }
    
    loadProgress()
  }, [userId])
  
  // 단원별 한자 개수 계산
  const chapters = Array.from({ length: 10 }, (_, i) => {
    const chapterId = i + 1
    const chapterHanja = hanjaList.filter((h) => h.chapter === chapterId)
    const chapterProgress = studyProgress.get(chapterId) || { known: 0, total: 0 }
    
    // 학습한 한자 수 (알고 있음 + 모름 모두 포함)
    const studiedCount = chapterProgress.total
    // 알고 있는 한자 수
    const knownCount = chapterProgress.known
    
    // 프로그레스는 학습한 한자 수 기준 (알고 있음 + 모름)
    const progressPercent = chapterHanja.length > 0 
      ? (studiedCount / chapterHanja.length) * 100 
      : 0
    
    return {
      id: chapterId,
      title: `${chapterId}단원`,
      hanjaCount: chapterHanja.length,
      progress: progressPercent,
      completed: progressPercent === 100 && knownCount === studiedCount, // 모든 한자를 알고 있어야 완료
      studiedCount,
      knownCount,
    }
  })

  return (
    <div className="chapter-selection">
      <div className="chapter-header">
        <h1>단원 선택</h1>
        <p>학습하고 싶은 단원을 선택하세요</p>
      </div>

      <div className="chapter-list">
        {chapters.map((chapter) => (
          <div key={chapter.id} className={`chapter-card ${chapter.completed ? 'completed' : ''}`}>
            <Link
              to={`/study/${chapter.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', flex: 1 }}
            >
              <div className="chapter-card-header">
                <h2 className="chapter-title">{chapter.title}</h2>
                <span className="chapter-count">{chapter.hanjaCount}개</span>
              </div>
              <div className="chapter-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${chapter.progress}%` }}
                  />
                </div>
                <span className="progress-text">{Math.round(chapter.progress)}%</span>
              </div>
              {chapter.completed && (
                <span className="completed-badge">✓ 완료</span>
              )}
            </Link>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  navigate(`/quiz/chapter/${chapter.id}`)
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '6px',
                  textAlign: 'center',
                  color: '#333',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                연습
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChapterSelection

