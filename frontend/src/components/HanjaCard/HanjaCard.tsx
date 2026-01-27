import { useState, useEffect, useLayoutEffect } from 'react'
import { motion, useAnimation, PanInfo } from 'framer-motion'
import styled from 'styled-components'
import { Hanja } from '../../types/hanja'

interface HanjaCardProps {
  hanja: Hanja
  onSwipe: (result: 'known' | 'unknown') => void
}

const Container = styled.div`
  width: 100%;
  max-width: none;
  margin: 0;
  height: 100%;
  flex: 1;
  min-height: 0;
`

const SwipeGuides = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
`

const Card = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: relative;
  perspective: 1000px;
  touch-action: none;
  cursor: grab;
  background: white;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: clamp(0.75rem, 2vh, 2rem) 0;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  &:active {
    cursor: grabbing;
  }

  &:active ${SwipeGuides} {
    opacity: 0.5;
  }
`

const Main = styled.div`
  padding-top: clamp(0.5rem, 0vh, 5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Character = styled.div`
  font-family: var(--hanja-font-family) !important;
  font-size: clamp(8rem, 20vw, 18rem);
  font-weight: 800;
  line-height: 1;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-display: swap;
`

const Hint = styled.p`
  font-size: 1rem;
  opacity: 0.8;
  margin-top: 1rem;
`

const Info = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1.5rem;
  box-sizing: border-box;
`

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
`

const InfoLabel = styled.span`
  font-weight: 600;
  color: #666;
  min-width: 50px;
  font-size: 0.85rem;
`

const InfoValue = styled.span`
  font-family: var(--hanja-font-family) !important;
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  font-weight: 500;
  color: #1a1a1a;
  flex: 1;
  word-break: keep-all;
  overflow-wrap: break-word;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`

const Examples = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const ExampleItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 8px;
`

const ExampleSentence = styled.span`
  font-family: var(--hanja-font-family) !important;
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  font-weight: 500;
  color: #1a1a1a;
  word-break: keep-all;
  overflow-wrap: break-word;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`

const ExampleMeaning = styled.span`
  font-size: 0.9rem;
  color: #666;
`

const SwipeGuide = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
  margin: 0 auto;
`

const HanjaCard = ({ hanja, onSwipe }: HanjaCardProps) => {
  const [showInfo, setShowInfo] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const controls = useAnimation()
  
  // hanja.id가 변경되면 컴포넌트가 재생성되므로 별도 state 불필요
  // key prop으로 React가 완전히 새로운 컴포넌트로 인식하도록 함

  // useLayoutEffect로 동기적으로 처리하여 이전 카드가 보이지 않도록
  useLayoutEffect(() => {
    // hanja가 변경되면 즉시 내용을 숨기기 (렌더링 전에 실행)
    setShowInfo(false)
    
    // 카드 초기화 - 명시적으로 opacity와 y를 리셋
    // 이전 스와이프 상태가 남아있을 수 있으므로 강제로 리셋
    // 카드는 즉시 보이도록 설정 (opacity: 1)
    controls.set({ y: 0, opacity: 1, scale: 1 })
  }, [hanja.id, controls])
  
  useEffect(() => {
    // 마운트 상태 설정 (클라이언트 사이드에서만 실행)
    setIsMounted(true)
    
    // 카드 애니메이션 시작 (즉시)
    controls.start({ 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    }).catch(() => {
      // 에러 무시 (컴포넌트가 언마운트된 경우)
    })
    
    // 음과 뜻은 2.5초 후에 표시
    const timer = setTimeout(() => {
      setShowInfo(true)
    }, 2500)
    
    // cleanup 함수: hanja가 변경될 때 타이머와 상태 리셋
    return () => {
      clearTimeout(timer)
      setShowInfo(false)
      // cleanup 시에도 상태를 리셋
      try {
        controls.set({ y: 0, opacity: 1, scale: 1 })
      } catch {
        // 에러 무시
      }
    }
  }, [hanja.id, controls]) // hanja.id를 의존성으로 사용하여 같은 한자라도 다른 인스턴스로 인식

  const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // 음과 뜻이 표시되기 전에는 스와이프 무시 (선택사항)
    // 주석 처리: 사용자가 빠르게 스와이프할 수 있도록 허용
    // if (!showInfo) {
    //   await controls.start({ 
    //     y: 0, 
    //     opacity: 1,
    //     transition: { type: 'spring', stiffness: 300, damping: 20 } 
    //   })
    //   return
    // }
    
    const threshold = 100
    const velocity = info.velocity.y

    if (info.offset.y < -threshold || velocity < -500) {
      // 위로 스와이프 (알고 있음)
      await controls.start({ y: -500, opacity: 0, transition: { duration: 0.2 } })
      onSwipe('known')
    } else if (info.offset.y > threshold || velocity > 500) {
      // 아래로 스와이프 (모름)
      await controls.start({ y: 500, opacity: 0, transition: { duration: 0.2 } })
      onSwipe('unknown')
    } else {
      // 제자리로 복귀 - opacity도 명시적으로 1로 설정
      // 서버 환경에서도 확실하게 적용되도록 await 사용
      await controls.start({ 
        y: 0, 
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 } 
      })
    }
  }

  // 마운트되지 않았으면 빈 div 반환
  if (!isMounted) {
    return (
      <Container>
        <Card
          style={{ opacity: 0, visibility: 'hidden' }}
          initial={false}
          animate={false}
        >
          <Main>
            <Character></Character>
          </Main>
        </Card>
      </Container>
    )
  }

  return (
    <Container>
      <Card
        drag="y"
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ opacity: 1, scale: 1, y: 0 }}
        whileDrag={{ cursor: 'grabbing' }}
      >
        <Main>
          <Character>{hanja.character}</Character>
          {!showInfo && <Hint>잠시 후 뜻과 음이 공개됩니다...</Hint>}
        </Main>

        {showInfo && (
          <Info
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InfoRow>
              <InfoLabel>뜻:</InfoLabel>
              <InfoValue>{hanja.meaning}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>음:</InfoLabel>
              <InfoValue>{hanja.sound}</InfoValue>
            </InfoRow>
            {hanja.examples.length > 0 && (
              <Examples>
                <InfoLabel as="span">예문:</InfoLabel>
                {hanja.examples.map((example, idx) => (
                  <ExampleItem key={idx}>
                    <ExampleSentence>{example.sentence}</ExampleSentence>
                    <ExampleMeaning>{example.meaning}</ExampleMeaning>
                  </ExampleItem>
                ))}
              </Examples>
            )}
          </Info>
        )}

        <SwipeGuides>
          <SwipeGuide>
            <span>⬆️ 알고 있어요</span>
          </SwipeGuide>
          <SwipeGuide>
            <span>⬇️ 모르겠어요</span>
          </SwipeGuide>
        </SwipeGuides>
      </Card>
    </Container>
  )
}

export default HanjaCard
