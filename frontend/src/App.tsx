import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import ChapterSelection from './pages/ChapterSelection/ChapterSelection'
import StudyMode from './pages/StudyMode/StudyMode'
import Game from './pages/Game/Game'
import Exam from './pages/Exam/Exam'
import Statistics from './pages/Statistics/Statistics'
import WrongAnswers from './pages/WrongAnswers/WrongAnswers'
import Admin from './pages/Admin/Admin'
import { useStore } from './store/useStore'
import { sampleHanja } from './data/sampleHanja'

function App() {
  const { loadHanjaList, hanjaList, isLoading, error } = useStore()

  // API에서 한자 데이터 로드
  useEffect(() => {
    loadHanjaList()
  }, [loadHanjaList])

  // API 로드 실패 시 샘플 데이터로 폴백
  useEffect(() => {
    if (error && hanjaList.length === 0) {
      console.warn('⚠️ API 로드 실패, 샘플 데이터를 사용합니다.')
      const { setHanjaList } = useStore.getState()
      setHanjaList(sampleHanja)
    }
  }, [error, hanjaList.length])

  // 로딩 중 표시 (선택사항)
  if (isLoading && hanjaList.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>한자 데이터를 불러오는 중...</div>
        {error && <div style={{ color: 'red', fontSize: '0.9rem' }}>오류: {error}</div>}
      </div>
    )
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chapters" element={<ChapterSelection />} />
          <Route path="/study/:chapterId" element={<StudyMode />} />
          <Route path="/quiz" element={<StudyMode />} />
          <Route path="/quiz/chapter/:chapterId" element={<StudyMode />} />
          <Route path="/game" element={<Game />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/wrong-answers" element={<WrongAnswers />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

