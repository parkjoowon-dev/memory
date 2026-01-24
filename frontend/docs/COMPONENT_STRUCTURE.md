# React 컴포넌트 구조 제안

## 전체 컴포넌트 트리

```
App
└── Router
    └── Layout
        ├── Navigation (하단 네비게이션)
        └── Routes
            ├── Home
            ├── ChapterSelection
            ├── Study
            │   └── HanjaCard
            ├── Quiz
            ├── Game
            ├── Exam
            ├── Statistics
            └── WrongAnswers
```

## 컴포넌트 상세 설명

### 1. Layout 컴포넌트
**위치**: `src/components/Layout/Layout.tsx`

**역할**: 전체 앱의 레이아웃 구조 제공

**구성**:
- 메인 콘텐츠 영역
- 하단 네비게이션 바

**Props**:
```typescript
interface LayoutProps {
  children: ReactNode
}
```

---

### 2. Navigation 컴포넌트
**위치**: `src/components/Layout/Navigation.tsx`

**역할**: 하단 네비게이션 바

**기능**:
- 홈, 학습, 연습, 시험, 통계 메뉴
- 현재 페이지 하이라이트
- 모바일 최적화

---

### 3. Home 컴포넌트
**위치**: `src/pages/Home/Home.tsx`

**역할**: 앱의 메인 화면

**주요 기능**:
- 전체 진도 표시 (원형 차트)
- 완료 단원 수 표시
- 빠른 시작 버튼들

**상태 관리**:
- `useStore`에서 `progress`, `hanjaList` 사용

---

### 4. ChapterSelection 컴포넌트
**위치**: `src/pages/ChapterSelection/ChapterSelection.tsx`

**역할**: 단원 선택 화면

**주요 기능**:
- 단원별 카드 표시
- 단원별 진행률 표시
- 완료 상태 표시

**데이터**:
- `hanjaList`에서 단원별 한자 필터링
- `progress`에서 진행도 계산

---

### 5. Study 컴포넌트
**위치**: `src/pages/Study/Study.tsx`

**역할**: 한자 학습 화면

**주요 기능**:
- 한자 카드 플립 애니메이션
- 이전/다음 한자 이동
- 학습 완료 체크
- 진행률 표시

**상태**:
- `currentIndex`: 현재 한자 인덱스
- `completedHanja`: 완료한 한자 Set

**하위 컴포넌트**:
- `HanjaCard`: 한자 카드 컴포넌트

---

### 6. HanjaCard 컴포넌트
**위치**: `src/components/HanjaCard/HanjaCard.tsx`

**역할**: 한자 카드 (플립 애니메이션)

**주요 기능**:
- 카드 플립 (앞면: 한자, 뒷면: 정보)
- 한자 정보 표시 (음, 뜻, 예문)
- 학습 완료 체크박스

**Props**:
```typescript
interface HanjaCardProps {
  hanja: Hanja
  isCompleted: boolean
  onComplete: () => void
}
```

**애니메이션**:
- Framer Motion 사용
- 3D 회전 효과

---

### 7. Quiz 컴포넌트
**위치**: `src/pages/Quiz/Quiz.tsx`

**역할**: 퀴즈 모드 화면

**주요 기능**:
- 문제 생성 (랜덤)
- 4지선다 선택
- 즉시 피드백
- 점수 계산
- 오답 노트 자동 저장

**상태**:
- `questions`: 문제 리스트
- `currentQuestion`: 현재 문제 인덱스
- `score`: 점수
- `selectedAnswer`: 선택한 답
- `showResult`: 결과 표시 여부

**문제 유형**:
- 한자 → 뜻
- 뜻 → 한자
- 한자 → 음
- 음 → 한자

---

### 8. Game 컴포넌트
**위치**: `src/pages/Game/Game.tsx`

**역할**: 게임 모드 화면 (준비 중)

**향후 구현 예정**:
- 맞추기 게임
- 타이핑 게임
- 순서 맞추기 게임

---

### 9. Exam 컴포넌트
**위치**: `src/pages/Exam/Exam.tsx`

**역할**: 시험 모드 화면 (준비 중)

**향후 구현 예정**:
- 제한 시간 설정
- 문제 출제
- 타이머
- 결과 화면

---

### 10. Statistics 컴포넌트
**위치**: `src/pages/Statistics/Statistics.tsx`

**역할**: 학습 통계 화면

**주요 기능**:
- 전체 진도 표시
- 퀴즈 정답률
- 완료 단원 수
- 시험 응시 횟수

**데이터**:
- `progress`: 학습 진행도
- `quizResults`: 퀴즈 결과
- `examResults`: 시험 결과

---

### 11. WrongAnswers 컴포넌트
**위치**: `src/pages/WrongAnswers/WrongAnswers.tsx`

**역할**: 오답 노트 화면

**주요 기능**:
- 오답 한자 리스트 표시
- 한자 정보 표시
- 오답 노트에서 제거

**데이터**:
- `wrongAnswers`: 오답 한자 ID 리스트
- `hanjaList`: 한자 데이터

---

## 상태 관리 (Zustand)

### Store 구조
**위치**: `src/store/useStore.ts`

**상태**:
```typescript
interface AppState {
  hanjaList: Hanja[]              // 한자 데이터
  progress: Progress[]            // 학습 진행도
  quizResults: QuizResult[]        // 퀴즈 결과
  examResults: ExamResult[]       // 시험 결과
  wrongAnswers: string[]          // 오답 한자 ID 리스트
  currentChapter: number | null    // 현재 학습 중인 단원
}
```

**Actions**:
- `setHanjaList`: 한자 데이터 설정
- `updateProgress`: 진행도 업데이트
- `addQuizResult`: 퀴즈 결과 추가
- `addExamResult`: 시험 결과 추가
- `addWrongAnswer`: 오답 추가
- `removeWrongAnswer`: 오답 제거
- `setCurrentChapter`: 현재 단원 설정

---

## 타입 정의

### 위치: `src/types/hanja.ts`

**주요 타입**:
- `Hanja`: 한자 데이터
- `Example`: 예문
- `Chapter`: 단원 정보
- `Progress`: 학습 진행도
- `QuizResult`: 퀴즈 결과
- `ExamResult`: 시험 결과
- `QuestionType`: 문제 유형

---

## 데이터 관리

### 샘플 데이터
**위치**: `src/data/sampleHanja.ts`

- 초기 개발용 샘플 한자 데이터
- 향후 실제 5급 한자 데이터로 교체 예정

### 로컬 스토리지
**위치**: `src/utils/storage.ts`

- LocalStorage 유틸리티 함수
- 향후 진행도, 결과 등 저장에 사용

---

## 스타일링

### 접근 방식
- CSS Modules 스타일 (각 컴포넌트별 CSS 파일)
- 모바일 우선 반응형 디자인
- Tailwind CSS 도입 고려 가능

### 디자인 원칙
- 큰 터치 영역 (최소 44x44px)
- 명확한 색상 구분
- 충분한 여백
- 가독성 우선

---

## 향후 확장 가능 컴포넌트

1. **Timer 컴포넌트**: 시험 모드용 타이머
2. **ProgressBar 컴포넌트**: 재사용 가능한 진행 바
3. **Modal 컴포넌트**: 결과 모달 등
4. **Button 컴포넌트**: 공통 버튼 스타일
5. **Card 컴포넌트**: 공통 카드 스타일
6. **GameMatch 컴포넌트**: 맞추기 게임
7. **GameTyping 컴포넌트**: 타이핑 게임

