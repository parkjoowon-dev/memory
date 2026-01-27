import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useStore } from '../../store/useStore'
import HanjaCard from '../../components/HanjaCard/HanjaCard'
import { 
  fetchStudyProgressByChapter, 
  saveStudyProgress,
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

type Mode = 'study' | 'practice'

const StudyMode = () => {
  const { chapterId } = useParams<{ chapterId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { hanjaList, userName } = useStore()
  
  const location = useLocation()
  
  // URL에서 mode 확인
  // /quiz 경로면 practice, /study 경로면 study
  const urlMode = searchParams.get('mode') as Mode | null
  const mode: Mode = urlMode || (location.pathname.startsWith('/quiz') ? 'practice' : 'study')
  const isPracticeMode = mode === 'practice'
  
  const userId = userName || 'default'
  const chapter = chapterId ? parseInt(chapterId) : null
  const isChapterMode = chapter !== null
  
  // 학습 상태 관리
  const [knownHanjaIds, setKnownHanjaIds] = useState<Set<string>>(new Set())
  const [unknownHanjaIds, setUnknownHanjaIds] = useState<string[]>([])
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
  const [seenHanjaIds, setSeenHanjaIds] = useState<Set<string>>(new Set()) // 연습 모드에서 이미 본 한자 추적
  
  // knownHanjaIds를 사용하여 리뷰 모드에서 제외할 한자 확인 (TypeScript 경고 방지)
  void knownHanjaIds
  
  // DB에서 진행 상태 불러오기 함수
  const loadProgress = useCallback(async () => {
    setIsLoadingProgress(true)
    try {
      if (isPracticeMode) {
        // 연습 모드
        let practiceResponse
        if (isChapterMode && chapter) {
          practiceResponse = await fetchPracticeProgressByChapter(userId, chapter)
        } else {
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
            unknownCount: unknownIds.length
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
      } else {
        // 학습 모드
        if (!chapter) {
          console.error('학습 모드에서는 chapter가 필요합니다.')
          return null
        }
        
        const response = await fetchStudyProgressByChapter(userId, chapter)
        if (response.data) {
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
            unknownIds: unknownIds
          })
          return { knownIds, unknownIds }
        }
      }
    } catch (error) {
      console.error('진행 상태 불러오기 실패:', error)
    } finally {
      setIsLoadingProgress(false)
    }
    return null
  }, [chapter, userId, isChapterMode, isPracticeMode])
  
  // DB에서 진행 상태 불러오기
  useEffect(() => {
    loadProgress()
  }, [loadProgress])
  
  // 현재 학습할 한자 리스트 계산
  const hanjaList_filtered = useMemo(() => {
    if (isPracticeMode) {
      // 연습 모드
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
          // 전체 모드: 학습했던 한자만
          const studiedIds = new Set([...knownHanjaIds, ...unknownHanjaIds])
          filtered = hanjaList.filter((h) => studiedIds.has(h.id))
          
          if (studiedIds.size === 0) {
            console.warn('⚠️ 학습한 한자가 없습니다. 전체 연습을 하려면 먼저 학습을 시작해주세요.')
          }
        }
      }
      
      // 이미 본 한자는 제외 (연습 모드만)
      const unseenFiltered = filtered.filter((h) => !seenHanjaIds.has(h.id))
      
      // 랜덤으로 섞기
      return shuffleArray(unseenFiltered)
    } else {
      // 학습 모드
      if (!chapter) return []
      
      const allChapterHanja = hanjaList.filter((h) => h.chapter === chapter)
      
      if (isReviewMode) {
        // 리뷰 모드: 모르는 한자만 다시 학습
        return allChapterHanja.filter((h) => unknownHanjaIds.includes(h.id))
      } else {
        // 일반 모드: 모든 한자 학습
        return allChapterHanja
      }
    }
  }, [hanjaList, chapter, isChapterMode, knownHanjaIds, unknownHanjaIds, seenHanjaIds, isReviewMode, isPracticeMode])
  
  // studyList가 변경되면 currentIndex 조정 (학습 모드만)
  useEffect(() => {
    if (!isPracticeMode && hanjaList_filtered.length > 0) {
      if (currentIndex >= hanjaList_filtered.length) {
        setCurrentIndex(0)
      }
    } else if (!isPracticeMode && hanjaList_filtered.length === 0 && isReviewMode) {
      alert('복습이 완료되었습니다!')
      navigate('/chapters')
    }
  }, [hanjaList_filtered.length, currentIndex, isReviewMode, navigate, isPracticeMode])
  
  // 현재 한자
  const currentHanja = isPracticeMode 
    ? hanjaList_filtered[0] // 연습 모드: 항상 첫 번째
    : hanjaList_filtered[currentIndex] // 학습 모드: 인덱스 기반
  
  // 진행률 계산
  const totalHanjaCount = useMemo(() => {
    if (isPracticeMode) {
      if (isReviewMode) {
        return unknownHanjaIds.length
      } else {
        if (isChapterMode && chapter) {
          return hanjaList.filter((h) => h.chapter === chapter).length
        } else {
          const studiedIds = new Set([...knownHanjaIds, ...unknownHanjaIds])
          return hanjaList.filter((h) => studiedIds.has(h.id)).length
        }
      }
    } else {
      return hanjaList_filtered.length
    }
  }, [hanjaList, chapter, isChapterMode, knownHanjaIds, unknownHanjaIds, isReviewMode, isPracticeMode, hanjaList_filtered.length])
  
  const progressPercent = totalHanjaCount > 0 
    ? (isPracticeMode 
      ? (seenHanjaIds.size / totalHanjaCount) * 100 
      : ((currentIndex + 1) / totalHanjaCount) * 100)
    : 0

  const handleSwipe = async (result: 'known' | 'unknown') => {
    if (!currentHanja) return
    
    const isKnown = result === 'known'
    
    // 연습 모드: 이미 본 한자로 표시
    if (isPracticeMode) {
      setSeenHanjaIds((prev) => new Set(prev).add(currentHanja.id))
    }
    
    // DB에 진행 상태 저장
    try {
      if (isPracticeMode) {
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
      } else {
        const saveResponse = await saveStudyProgress({
          user_id: userId,
          hanja_id: currentHanja.id,
          chapter: chapter!,
          is_known: isKnown
        })
        
        if (saveResponse.error) {
          console.error('학습 상태 저장 오류:', saveResponse.error)
        } else {
          console.log('학습 상태 저장 성공:', { 
            hanja_id: currentHanja.id, 
            chapter: chapter,
            is_known: isKnown 
          })
        }
      }
    } catch (error) {
      console.error('진행 상태 저장 실패:', error)
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
    if (isPracticeMode) {
      // 연습 모드: quizHanjaList가 업데이트되면 자동으로 다음 한자가 표시됨
    } else {
      // 학습 모드: 인덱스 기반
      if (currentIndex < hanjaList_filtered.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        // 모든 한자를 다 봤을 때
        if (!isReviewMode) {
          // 일반 모드에서 끝났을 때
          if (result === 'unknown') {
            const progressData = await loadProgress()
            if (progressData && progressData.unknownIds.length > 0) {
              setIsReviewMode(true)
              setCurrentIndex(0)
            } else {
              alert('학습이 완료되었습니다!')
              navigate('/chapters')
            }
          } else {
            const progressData = await loadProgress()
            if (progressData) {
              if (progressData.unknownIds.length === 0) {
                alert('학습이 완료되었습니다!')
                navigate('/chapters')
              } else {
                setIsReviewMode(true)
                setCurrentIndex(0)
              }
            }
          }
        } else {
          // 리뷰 모드에서 끝났을 때
          if (result === 'unknown') {
            const progressData = await loadProgress()
            if (progressData && progressData.unknownIds.length > 0) {
              setCurrentIndex(0)
            } else {
              alert('복습이 완료되었습니다!')
              navigate('/chapters')
            }
          } else {
            const progressData = await loadProgress()
            if (progressData) {
              if (progressData.unknownIds.length === 0) {
                alert('복습이 완료되었습니다!')
                navigate('/chapters')
              } else {
                setCurrentIndex(0)
              }
            }
          }
        }
      }
    }
  }
  
  // 연습 모드: 모든 한자를 다 봤는지 확인 및 복습 모드 전환
  useEffect(() => {
    if (isPracticeMode && hanjaList_filtered.length === 0 && seenHanjaIds.size > 0 && !isLoadingProgress) {
      const handleCompletion = async () => {
        if (!isReviewMode) {
          const progressData = await loadProgress()
          if (progressData) {
            if (progressData.unknownIds.length > 0) {
              setSeenHanjaIds(new Set())
              setIsReviewMode(true)
            } else {
              alert('연습이 완료되었습니다!')
              navigate(isChapterMode ? '/chapters' : '/quiz')
            }
          }
        } else {
          const progressData = await loadProgress()
          if (progressData) {
            if (progressData.unknownIds.length === 0) {
              alert('복습이 완료되었습니다!')
              navigate(isChapterMode ? '/chapters' : '/quiz')
            } else {
              setSeenHanjaIds(new Set())
            }
          }
        }
      }
      
      setTimeout(() => {
        handleCompletion()
      }, 100)
    }
  }, [hanjaList_filtered.length, seenHanjaIds.size, isLoadingProgress, isChapterMode, navigate, isReviewMode, isPracticeMode, loadProgress])

  if (isLoadingProgress) {
    return (
      <Empty>
        <EmptyText>학습 상태를 불러오는 중...</EmptyText>
      </Empty>
    )
  }

  if (hanjaList_filtered.length === 0) {
    return (
      <Empty>
        <EmptyText>
          {isPracticeMode && !isChapterMode
            ? '학습한 한자가 없습니다. 먼저 학습을 시작해주세요.'
            : '이 단원에 한자가 없습니다.'}
        </EmptyText>
        <EmptyButton onClick={() => navigate(isChapterMode ? '/chapters' : (isPracticeMode ? '/quiz' : '/chapters'))}>
          {isChapterMode ? '단원 선택으로 돌아가기' : '홈으로 돌아가기'}
        </EmptyButton>
      </Empty>
    )
  }

  if (!currentHanja) {
    return (
      <Empty>
        <EmptyText>{isPracticeMode ? '연습할 한자가 없습니다.' : '학습할 한자가 없습니다.'}</EmptyText>
        <EmptyButton onClick={() => navigate(isChapterMode ? '/chapters' : (isPracticeMode ? '/quiz' : '/chapters'))}>
          {isChapterMode ? '단원 선택으로 돌아가기' : '홈으로 돌아가기'}
        </EmptyButton>
      </Empty>
    )
  }

  const getTitle = () => {
    if (isPracticeMode) {
      if (isReviewMode) {
        return isChapterMode ? `${chapter}단원 연습 (복습)` : '전체 연습 (복습)'
      } else {
        return isChapterMode ? `${chapter}단원 연습` : '전체 연습'
      }
    } else {
      return isReviewMode ? `${chapter}단원 (복습)` : `${chapter}단원`
    }
  }

  const getProgressText = () => {
    if (isPracticeMode) {
      return `${seenHanjaIds.size} / ${totalHanjaCount}`
    } else {
      return `${currentIndex + 1} / ${hanjaList_filtered.length}`
    }
  }

  return (
    <Screen>
      <Content>
        <HanjaCard
          key={isPracticeMode 
            ? `practice-${currentHanja.id}-${seenHanjaIds.size}-${Date.now()}`
            : `study-${currentHanja.id}-${currentIndex}-${isReviewMode ? 'review' : 'normal'}-${Date.now()}`}
          hanja={currentHanja}
          onSwipe={handleSwipe}
        />
      </Content>

      <HeaderOverlay>
        <HeaderInner>
          <BackButton onClick={() => navigate(isChapterMode ? '/chapters' : (isPracticeMode ? '/quiz' : '/chapters'))}>
            ← 뒤로
          </BackButton>
          <Title>{getTitle()}</Title>
          <Progress>
            <ProgressBar>
              <ProgressFill style={{ width: `${progressPercent}%` }} />
            </ProgressBar>
            <ProgressText>{getProgressText()}</ProgressText>
          </Progress>
        </HeaderInner>
      </HeaderOverlay>
    </Screen>
  )
}

export default StudyMode
