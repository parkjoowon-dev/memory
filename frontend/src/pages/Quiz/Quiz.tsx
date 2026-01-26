import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useStore } from '../../store/useStore'
import HanjaCard from '../../components/HanjaCard/HanjaCard'
import { 
  fetchStudyProgressByChapter, 
  fetchAllStudyProgress,
  saveStudyProgress
} from '../../utils/api'

const Screen = styled.div`
  padding: 0;
  max-width: none;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
`

const Content = styled.div`
  flex: 1;
  margin-bottom: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  width: 100%;
  min-height: 0;
  padding: 0;
`

const HeaderOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  pointer-events: none;
  padding: 0.5rem 0.5rem 0;
`

const HeaderInner = styled.div`
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
`

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 0.9rem;
  color: #2563eb;
  cursor: pointer;
  padding: 0.25rem 0.25rem;
  margin-bottom: 0;
  line-height: 1;
`

const Title = styled.h2`
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0;
  line-height: 1;
`

const Progress = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const ProgressBar = styled.div`
  flex: 1;
  width: clamp(90px, 22vw, 160px);
  height: 4px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 999px;
  overflow: hidden;
`

const ProgressFill = styled.div`
  height: 100%;
  background: #2563eb;
  transition: width 0.3s;
`

const ProgressText = styled.span`
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.55);
  font-weight: 600;
  min-width: 0;
  text-align: right;
`

const Empty = styled.div`
  text-align: center;
  padding: 3rem 1rem;
`

const EmptyText = styled.p`
  margin-bottom: 1rem;
  color: #666;
`

const EmptyButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
`

// 배열을 랜덤으로 섞는 함수 (Fisher-Yates 알고리즘)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const Quiz = () => {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const { hanjaList, userName } = useStore()
  
  const userId = userName || 'default'
  const chapter = chapterId ? parseInt(chapterId) : null
  const isChapterMode = chapter !== null
  
  // 학습 상태 관리
  const [knownHanjaIds, setKnownHanjaIds] = useState<Set<string>>(new Set())
  const [unknownHanjaIds, setUnknownHanjaIds] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
  
  // 한자 리스트 필터링 및 랜덤 섞기
  const quizHanjaList = useMemo(() => {
    let filtered: typeof hanjaList = []
    
    if (isChapterMode) {
      // 단원별 모드: 해당 단원의 한자만
      filtered = hanjaList.filter((h) => h.chapter === chapter)
    } else {
      // 전체 모드: 학습했던 한자만 (알고 있음 또는 모름으로 표시된 한자)
      const studiedIds = new Set([...knownHanjaIds, ...unknownHanjaIds])
      filtered = hanjaList.filter((h) => studiedIds.has(h.id))
      
      // 디버깅: 학습 상태 확인
      if (studiedIds.size === 0) {
        console.warn('⚠️ 학습한 한자가 없습니다. 전체 연습을 하려면 먼저 학습을 시작해주세요.')
      } else {
        console.log('📚 전체 연습 필터링:', {
          전체한자수: hanjaList.length,
          학습한한자수: studiedIds.size,
          필터된한자수: filtered.length
        })
      }
    }
    
    // 랜덤으로 섞기
    return shuffleArray(filtered)
  }, [hanjaList, chapter, isChapterMode, knownHanjaIds, unknownHanjaIds])
  
  // DB에서 학습 상태 불러오기
  useEffect(() => {
    const loadStudyProgress = async () => {
      setIsLoadingProgress(true)
      try {
        let response
        if (isChapterMode && chapter) {
          response = await fetchStudyProgressByChapter(userId, chapter)
        } else {
          response = await fetchAllStudyProgress(userId)
        }
        
        if (response.error) {
          console.error('학습 상태 불러오기 오류:', response.error)
        } else if (response.data) {
          const knownIds = new Set<string>()
          const unknownIds: string[] = []
          
          response.data.progress.forEach((p) => {
            if (p.is_known) {
              knownIds.add(p.hanja_id)
            } else {
              unknownIds.push(p.hanja_id)
            }
          })
          
          setKnownHanjaIds(knownIds)
          setUnknownHanjaIds(unknownIds)
          console.log('학습 상태 불러오기 성공:', { 
            knownCount: knownIds.size, 
            unknownCount: unknownIds.length,
            totalProgress: response.data.progress.length 
          })
        }
      } catch (error) {
        console.error('학습 상태 불러오기 실패:', error)
      } finally {
        setIsLoadingProgress(false)
      }
    }
    
    loadStudyProgress()
  }, [chapter, userId, isChapterMode])
  
  const currentHanja = quizHanjaList[currentIndex]
  const progressPercent = quizHanjaList.length > 0 
    ? ((currentIndex + 1) / quizHanjaList.length) * 100 
    : 0

  const handleSwipe = async (result: 'known' | 'unknown') => {
    if (!currentHanja) return
    
    const isKnown = result === 'known'
    
    // DB에 학습 상태 저장
    try {
      const saveResponse = await saveStudyProgress({
        user_id: userId,
        hanja_id: currentHanja.id,
        chapter: currentHanja.chapter,
        is_known: isKnown
      })
      
      if (saveResponse.error) {
        console.error('학습 상태 저장 오류:', saveResponse.error)
      } else {
        console.log('학습 상태 저장 성공:', { 
          hanja_id: currentHanja.id, 
          is_known: isKnown 
        })
      }
    } catch (error) {
      console.error('학습 상태 저장 실패:', error)
    }
    
    // 상태 업데이트
    if (isKnown) {
      setKnownHanjaIds((prev) => new Set(prev).add(currentHanja.id))
      setUnknownHanjaIds((prev) => prev.filter((id) => id !== currentHanja.id))
    } else {
      setUnknownHanjaIds((prev) => {
        if (!prev.includes(currentHanja.id)) {
          return [...prev, currentHanja.id]
        }
        return prev
      })
    }
    
    // 다음 한자로 이동
    if (currentIndex < quizHanjaList.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // 모든 한자를 다 봤을 때
      alert('연습이 완료되었습니다!')
      navigate(isChapterMode ? '/chapters' : '/quiz')
    }
  }

  if (isLoadingProgress) {
    return (
      <Empty>
        <EmptyText>학습 상태를 불러오는 중...</EmptyText>
      </Empty>
    )
  }

  if (quizHanjaList.length === 0) {
    return (
      <Empty>
        <EmptyText>
          {!isChapterMode
            ? '학습한 한자가 없습니다. 먼저 학습을 시작해주세요.'
            : '이 단원에 한자가 없습니다.'}
        </EmptyText>
        <EmptyButton onClick={() => navigate(isChapterMode ? '/chapters' : '/')}>
          {isChapterMode ? '단원 선택으로 돌아가기' : '홈으로 돌아가기'}
        </EmptyButton>
      </Empty>
    )
  }

  if (!currentHanja) {
    return (
      <Empty>
        <EmptyText>연습할 한자가 없습니다.</EmptyText>
        <EmptyButton onClick={() => navigate('/chapters')}>
          {isChapterMode ? '단원 선택으로 돌아가기' : '홈으로 돌아가기'}
        </EmptyButton>
      </Empty>
    )
  }

  return (
    <Screen>
      <Content>
        <HanjaCard
          key={`${currentHanja.id}-${currentIndex}-${isChapterMode ? `chapter-${chapter}` : 'all'}`}
          hanja={currentHanja}
          onSwipe={handleSwipe}
        />
      </Content>

      <HeaderOverlay>
        <HeaderInner>
          <BackButton onClick={() => navigate(isChapterMode ? '/chapters' : '/')}>
            ← 뒤로
          </BackButton>
          <Title>
            {isChapterMode ? `${chapter}단원 연습` : '전체 연습'}
          </Title>
          <Progress>
            <ProgressBar>
              <ProgressFill style={{ width: `${progressPercent}%` }} />
            </ProgressBar>
            <ProgressText>
              {currentIndex + 1} / {quizHanjaList.length}
            </ProgressText>
          </Progress>
        </HeaderInner>
      </HeaderOverlay>
    </Screen>
  )
}

export default Quiz
