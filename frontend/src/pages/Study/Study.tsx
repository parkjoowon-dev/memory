import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useStore } from '../../store/useStore'
import HanjaCard from '../../components/HanjaCard/HanjaCard'

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
  const { hanjaList } = useStore()
  
  const chapter = chapterId ? parseInt(chapterId) : 1
  const chapterHanja = hanjaList.filter((h) => h.chapter === chapter)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const currentHanja = chapterHanja[currentIndex]
  const progressPercent = chapterHanja.length > 0 
    ? ((currentIndex + 1) / chapterHanja.length) * 100 
    : 0

  const handleSwipe = (result: 'known' | 'unknown') => {
    // TODO: result에 따라 학습 상태 저장 (알고 있음/모름)
    void result
    if (currentIndex < chapterHanja.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      alert('학습이 완료되었습니다!')
      navigate('/chapters')
    }
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
          key={currentHanja.id}
          hanja={currentHanja}
          onSwipe={handleSwipe}
        />
      </Content>

      <HeaderOverlay>
        <HeaderInner>
          <BackButton onClick={() => navigate('/chapters')}>
            ← 뒤로
          </BackButton>
          <ChapterTitle>{chapter}단원</ChapterTitle>
          <Progress>
            <ProgressBar>
              <ProgressFill style={{ width: `${progressPercent}%` }} />
            </ProgressBar>
            <ProgressText>
              {currentIndex + 1} / {chapterHanja.length}
            </ProgressText>
          </Progress>
        </HeaderInner>
      </HeaderOverlay>
    </Screen>
  )
}

export default Study
