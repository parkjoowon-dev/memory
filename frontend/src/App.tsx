import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import ChapterSelection from './pages/ChapterSelection/ChapterSelection'
import Study from './pages/Study/Study'
import Quiz from './pages/Quiz/Quiz'
import Game from './pages/Game/Game'
import Exam from './pages/Exam/Exam'
import Statistics from './pages/Statistics/Statistics'
import WrongAnswers from './pages/WrongAnswers/WrongAnswers'
import { useStore } from './store/useStore'
import { sampleHanja } from './data/sampleHanja'

function App() {
  const { setHanjaList, hanjaList } = useStore()

  // 샘플 데이터 초기화
  useEffect(() => {
    if (hanjaList.length === 0) {
      setHanjaList(sampleHanja)
    }
  }, [hanjaList.length, setHanjaList])

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chapters" element={<ChapterSelection />} />
          <Route path="/study/:chapterId" element={<Study />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/game" element={<Game />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/wrong-answers" element={<WrongAnswers />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

