import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useStore } from '../../store/useStore'
import HanjaCard from '../../components/HanjaCard/HanjaCard'
import { 
  fetchStudyProgressByChapter, 
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

const ChapterTitle = styled.h2`
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

const Study = () => {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const { hanjaList, userName } = useStore()
  
  const chapter = chapterId ? parseInt(chapterId) : 1
  const allChapterHanja = hanjaList.filter((h) => h.chapter === chapter)
  const userId = userName || 'default'
  
  // 학습 상태 관리
  const [knownHanjaIds, setKnownHanjaIds] = useState<Set<string>>(new Set())
  const [unknownHanjaIds, setUnknownHanjaIds] = useState<string[]>([])
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
  
  // knownHanjaIds를 사용하여 리뷰 모드에서 제외할 한자 확인 (TypeScript 경고 방지)
  void knownHanjaIds
  
  // DB에서 학습 상태 불러오기 함수
  const loadStudyProgress = useCallback(async () => {
    setIsLoadingProgress(true)
    try {
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
    } catch (error) {
      console.error('학습 상태 불러오기 실패:', error)
    } finally {
      setIsLoadingProgress(false)
    }
    return null
  }, [chapter, userId])
  
  // DB에서 학습 상태 불러오기
  useEffect(() => {
    loadStudyProgress()
  }, [loadStudyProgress])
  
  // 현재 학습할 한자 리스트 계산
  const studyList = useMemo(() => {
    if (isReviewMode) {
      // 리뷰 모드: 모르는 한자만 다시 학습
      return allChapterHanja.filter((h) => unknownHanjaIds.includes(h.id))
    } else {
      // 일반 모드: 모든 한자 학습
      return allChapterHanja
    }
  }, [allChapterHanja, unknownHanjaIds, isReviewMode])
  
  // studyList가 변경되면 currentIndex 조정
  useEffect(() => {
    if (studyList.length > 0) {
      // 인덱스가 범위를 벗어나면 0으로 리셋
      if (currentIndex >= studyList.length) {
        setCurrentIndex(0)
      }
    } else if (studyList.length === 0 && isReviewMode) {
      // 리뷰 모드에서 모든 한자를 알고 있으면 완료
      alert('복습이 완료되었습니다!')
      navigate('/chapters')
    }
  }, [studyList, currentIndex, isReviewMode, navigate])
  
  // 리뷰 모드에서 unknownHanjaIds가 변경되면 인덱스 확인
  useEffect(() => {
    if (isReviewMode && studyList.length > 0 && currentIndex >= studyList.length) {
      setCurrentIndex(0)
    }
  }, [unknownHanjaIds, isReviewMode, studyList.length, currentIndex])
  
  const currentHanja = studyList[currentIndex]
  const progressPercent = studyList.length > 0 
    ? ((currentIndex + 1) / studyList.length) * 100 
    : 0

  const handleSwipe = async (result: 'known' | 'unknown') => {
    if (!currentHanja) return
    
    const isKnown = result === 'known'
    
    // DB에 학습 상태 저장
    try {
      const saveResponse = await saveStudyProgress({
        user_id: userId,
        hanja_id: currentHanja.id,
        chapter: chapter,
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
    } catch (error) {
      console.error('학습 상태 저장 실패:', error)
      // 저장 실패해도 UI는 업데이트 (사용자 경험 개선)
    }
    
    // 다음 한자로 이동
    if (currentIndex < studyList.length - 1) {
      // 상태 업데이트
      if (isKnown) {
        // 알고 있음: knownHanjaIds에 추가
        setKnownHanjaIds((prev) => new Set(prev).add(currentHanja.id))
        // unknownHanjaIds에서 제거
        setUnknownHanjaIds((prev) => prev.filter((id) => id !== currentHanja.id))
      } else {
        // 모름: unknownHanjaIds에 추가 (중복 방지)
        setUnknownHanjaIds((prev) => {
          if (!prev.includes(currentHanja.id)) {
            return [...prev, currentHanja.id]
          }
          return prev
        })
      }
      // 다음 한자로 이동
      setCurrentIndex(prev => prev + 1)
    } else {
      // 모든 한자를 다 봤을 때
      if (!isReviewMode) {
        // 일반 모드에서 끝났을 때
        if (result === 'unknown') {
          // 모르는 한자로 표시: 서버에서 데이터 다시 불러온 후 리뷰 모드로 전환
          const progressData = await loadStudyProgress()
          if (progressData && progressData.unknownIds.length > 0) {
            setIsReviewMode(true)
            setCurrentIndex(0)
          } else {
            // 서버에 모르는 한자가 없으면 완료
            alert('학습이 완료되었습니다!')
            navigate('/chapters')
          }
        } else {
          // 알고 있는 한자로 표시: 서버에서 데이터 다시 불러온 후 확인
          const progressData = await loadStudyProgress()
          if (progressData) {
            if (progressData.unknownIds.length === 0) {
              // 모든 한자를 알고 있으면 완료
              alert('학습이 완료되었습니다!')
              navigate('/chapters')
            } else {
              // 모르는 한자가 있으면 리뷰 모드로 전환
              setIsReviewMode(true)
              setCurrentIndex(0)
            }
          }
        }
      } else {
        // 리뷰 모드에서 끝났을 때
        if (result === 'unknown') {
          // 모르는 한자로 표시: 서버에서 데이터 다시 불러온 후 처음부터 시작
          const progressData = await loadStudyProgress()
          if (progressData && progressData.unknownIds.length > 0) {
            setCurrentIndex(0)
          } else {
            // 서버에 모르는 한자가 없으면 완료
            alert('복습이 완료되었습니다!')
            navigate('/chapters')
          }
        } else {
          // 알고 있는 한자로 표시: 서버에서 데이터 다시 불러온 후 확인
          const progressData = await loadStudyProgress()
          if (progressData) {
            if (progressData.unknownIds.length === 0) {
              // 모든 한자를 알고 있으면 완료
              alert('복습이 완료되었습니다!')
              navigate('/chapters')
            } else {
              // 아직 모르는 한자가 있으면 처음부터 다시 시작
              setCurrentIndex(0)
            }
          }
        }
      }
    }
  }

  if (isLoadingProgress) {
    return (
      <Empty>
        <EmptyText>학습 상태를 불러오는 중...</EmptyText>
      </Empty>
    )
  }

  if (!currentHanja) {
    return (
      <Empty>
        <EmptyText>이 단원에 한자가 없습니다.</EmptyText>
        <EmptyButton onClick={() => navigate('/chapters')}>단원 선택으로 돌아가기</EmptyButton>
      </Empty>
    )
  }

  return (
    <Screen>
      <Content>
        <HanjaCard
          key={`${currentHanja.id}-${currentIndex}-${isReviewMode ? 'review' : 'normal'}`}
          hanja={currentHanja}
          onSwipe={handleSwipe}
        />
      </Content>

      <HeaderOverlay>
        <HeaderInner>
          <BackButton onClick={() => navigate('/chapters')}>
            ← 뒤로
          </BackButton>
          <ChapterTitle>
            {isReviewMode ? `${chapter}단원 (복습)` : `${chapter}단원`}
          </ChapterTitle>
          <Progress>
            <ProgressBar>
              <ProgressFill style={{ width: `${progressPercent}%` }} />
            </ProgressBar>
            <ProgressText>
              {currentIndex + 1} / {studyList.length}
            </ProgressText>
          </Progress>
        </HeaderInner>
      </HeaderOverlay>
    </Screen>
  )
}

export default Study
