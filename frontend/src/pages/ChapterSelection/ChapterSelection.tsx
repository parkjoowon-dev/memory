import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import './ChapterSelection.css'

const ChapterSelection = () => {
  const { hanjaList, progress } = useStore()
  
  // 단원별 한자 개수 계산
  const chapters = Array.from({ length: 10 }, (_, i) => {
    const chapterId = i + 1
    const chapterHanja = hanjaList.filter((h) => h.chapter === chapterId)
    const chapterProgress = progress.find((p) => p.chapter === chapterId)
    const completedCount = chapterProgress?.completedHanja.length || 0
    const progressPercent = chapterHanja.length > 0 
      ? (completedCount / chapterHanja.length) * 100 
      : 0
    
    return {
      id: chapterId,
      title: `${chapterId}단원`,
      hanjaCount: chapterHanja.length,
      progress: progressPercent,
      completed: progressPercent === 100,
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
          <Link
            key={chapter.id}
            to={`/study/${chapter.id}`}
            className={`chapter-card ${chapter.completed ? 'completed' : ''}`}
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
        ))}
      </div>
    </div>
  )
}

export default ChapterSelection

