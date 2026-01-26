import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useStore } from '../../store/useStore'
import HanjaCard from '../../components/HanjaCard/HanjaCard'
import { 
  fetchPracticeProgressByChapter, 
  fetchAllPracticeProgress,
  savePracticeProgress,
  fetchAllStudyProgress
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
  const [isReviewMode, setIsReviewMode] = useState(false) // 복습 모드
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
  const [seenHanjaIds, setSeenHanjaIds] = useState<Set<string>>(new Set()) // 이미 본 한자 추적
  
  // 한자 리스트 필터링 및 랜덤 섞기
  const quizHanjaList = useMemo(() => {
    let filtered: typeof hanjaList = []
    
    if (isReviewMode) {
      // 복습 모드: 모르는 한자만 다시 연습
      filtered = hanjaList.filter((h) => unknownHanjaIds.includes(h.id))
    } else {
      // 일반 모드
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
    }
    
    // 이미 본 한자는 제외
    const unseenFiltered = filtered.filter((h) => !seenHanjaIds.has(h.id))
    
    // 랜덤으로 섞기
    return shuffleArray(unseenFiltered)
  }, [hanjaList, chapter, isChapterMode, knownHanjaIds, unknownHanjaIds, seenHanjaIds, isReviewMode])
  
  // DB에서 연습 상태 불러오기 함수
  const loadPracticeProgress = useCallback(async () => {
    setIsLoadingProgress(true)
    try {
      let practiceResponse
      if (isChapterMode && chapter) {
        // 단원별 연습: 해당 단원의 연습 상태만 불러오기
        practiceResponse = await fetchPracticeProgressByChapter(userId, chapter)
      } else {
        // 전체 연습: 연습 상태 불러오기
        practiceResponse = await fetchAllPracticeProgress(userId)
      }
      
      if (practiceResponse.error) {
        console.error('연습 상태 불러오기 오류:', practiceResponse.error)
      } else if (practiceResponse.data) {
        const knownIds = new Set<string>()
        const unknownIds: string[] = []
        
        practiceResponse.data.progress.forEach((p) => {
          if (p.is_known) {
            knownIds.add(p.hanja_id)
          } else {
            unknownIds.push(p.hanja_id)
          }
        })
        
        setKnownHanjaIds(knownIds)
        setUnknownHanjaIds(unknownIds)
        console.log('연습 상태 불러오기 성공:', { 
          knownCount: knownIds.size, 
          unknownCount: unknownIds.length,
          totalProgress: practiceResponse.data.progress.length 
        })
        return { knownIds, unknownIds }
      }
      
      // 전체 연습 모드일 때는 학습 상태도 확인하여 필터링에 사용
      if (!isChapterMode) {
        const studyResponse = await fetchAllStudyProgress(userId)
        if (studyResponse.data) {
          const studiedIds = new Set<string>()
          studyResponse.data.progress.forEach((p) => {
            studiedIds.add(p.hanja_id)
          })
          console.log('학습 상태 확인 (필터링용):', {
            학습한한자수: studiedIds.size
          })
        }
      }
    } catch (error) {
      console.error('진행 상태 불러오기 실패:', error)
    } finally {
      setIsLoadingProgress(false)
    }
    return null
  }, [chapter, userId, isChapterMode])
  
  // DB에서 연습 상태 불러오기 (전체 연습 모드일 때는 학습 상태도 함께 확인)
  useEffect(() => {
    loadPracticeProgress()
  }, [loadPracticeProgress])
  
  // 현재 한자는 항상 리스트의 첫 번째 (인덱스 0)
  const currentHanja = quizHanjaList[0]
  
  // 진행률 계산: 전체 한자 수 대비 본 한자 수
  const totalHanjaCount = useMemo(() => {
    if (isReviewMode) {
      // 복습 모드: 모르는 한자 수
      return unknownHanjaIds.length
    } else {
      if (isChapterMode && chapter) {
        return hanjaList.filter((h) => h.chapter === chapter).length
      } else {
        const studiedIds = new Set([...knownHanjaIds, ...unknownHanjaIds])
        return hanjaList.filter((h) => studiedIds.has(h.id)).length
      }
    }
  }, [hanjaList, chapter, isChapterMode, knownHanjaIds, unknownHanjaIds, isReviewMode])
  
  const progressPercent = totalHanjaCount > 0 
    ? (seenHanjaIds.size / totalHanjaCount) * 100 
    : 0

  const handleSwipe = async (result: 'known' | 'unknown') => {
    if (!currentHanja) return
    
    const isKnown = result === 'known'
    
    // 이미 본 한자로 표시
    setSeenHanjaIds((prev) => new Set(prev).add(currentHanja.id))
    
    // DB에 연습 상태 저장
    try {
      const saveResponse = await savePracticeProgress({
        user_id: userId,
        hanja_id: currentHanja.id,
        chapter: currentHanja.chapter,
        is_known: isKnown
      })
      
      if (saveResponse.error) {
        console.error('연습 상태 저장 오류:', saveResponse.error)
      } else {
        console.log('연습 상태 저장 성공:', { 
          hanja_id: currentHanja.id, 
          is_known: isKnown 
        })
      }
    } catch (error) {
      console.error('연습 상태 저장 실패:', error)
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
    
    // quizHanjaList가 업데이트되면 자동으로 다음 한자가 표시됨
    // (quizHanjaList는 이미 본 한자를 제외하므로, 다음 한자는 항상 인덱스 0에 있음)
  }
  
  // 모든 한자를 다 봤는지 확인 및 복습 모드 전환
  useEffect(() => {
    if (quizHanjaList.length === 0 && seenHanjaIds.size > 0 && !isLoadingProgress) {
      const handleCompletion = async () => {
        if (!isReviewMode) {
          // 일반 모드에서 끝났을 때: 서버에서 데이터 다시 불러온 후 확인
          const progressData = await loadPracticeProgress()
          if (progressData) {
            if (progressData.unknownIds.length > 0) {
              // 모르는 한자가 있으면 복습 모드로 전환
              setSeenHanjaIds(new Set()) // 본 한자 리스트 초기화
              setIsReviewMode(true)
            } else {
              // 모든 한자를 알고 있으면 완료
              alert('연습이 완료되었습니다!')
              navigate(isChapterMode ? '/chapters' : '/quiz')
            }
          }
        } else {
          // 복습 모드에서 끝났을 때: 서버에서 데이터 다시 불러온 후 확인
          const progressData = await loadPracticeProgress()
          if (progressData) {
            if (progressData.unknownIds.length === 0) {
              // 모든 한자를 알고 있으면 완료
              alert('복습이 완료되었습니다!')
              navigate(isChapterMode ? '/chapters' : '/quiz')
            } else {
              // 아직 모르는 한자가 있으면 다시 처음부터 시작
              setSeenHanjaIds(new Set()) // 본 한자 리스트 초기화
            }
          }
        }
      }
      
      setTimeout(() => {
        handleCompletion()
      }, 100)
    }
  }, [quizHanjaList.length, seenHanjaIds.size, isLoadingProgress, isChapterMode, navigate, isReviewMode])

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
          key={`${currentHanja.id}-${seenHanjaIds.size}-${isChapterMode ? `chapter-${chapter}` : 'all'}`}
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
            {isReviewMode 
              ? (isChapterMode ? `${chapter}단원 연습 (복습)` : '전체 연습 (복습)')
              : (isChapterMode ? `${chapter}단원 연습` : '전체 연습')}
          </Title>
          <Progress>
            <ProgressBar>
              <ProgressFill style={{ width: `${progressPercent}%` }} />
            </ProgressBar>
            <ProgressText>
              {seenHanjaIds.size} / {totalHanjaCount}
            </ProgressText>
          </Progress>
        </HeaderInner>
      </HeaderOverlay>
    </Screen>
  )
}

export default Quiz
