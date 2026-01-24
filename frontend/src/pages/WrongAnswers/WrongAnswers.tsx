import { useStore } from '../../store/useStore'
import './WrongAnswers.css'

const WrongAnswers = () => {
  const { wrongAnswers, hanjaList, removeWrongAnswer } = useStore()
  
  const wrongHanja = hanjaList.filter((h) => wrongAnswers.includes(h.id))

  return (
    <div className="wrong-answers">
      <div className="wrong-answers-header">
        <h1>오답 노트</h1>
        <p>틀린 문제를 다시 복습하세요</p>
      </div>

      {wrongHanja.length === 0 ? (
        <div className="empty-state">
          <p>오답이 없습니다. 잘하고 있어요! 👍</p>
        </div>
      ) : (
        <div className="wrong-answers-list">
          {wrongHanja.map((hanja) => (
            <div key={hanja.id} className="wrong-answer-card">
              <div className="hanja-info">
                <div className="hanja-character">{hanja.character}</div>
                <div className="hanja-details">
                  <div className="detail-row">
                    <span className="label">음:</span>
                    <span className="value">{hanja.sound}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">뜻:</span>
                    <span className="value">{hanja.meaning}</span>
                  </div>
                </div>
              </div>
              <button
                className="remove-button"
                onClick={() => removeWrongAnswer(hanja.id)}
              >
                제거
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WrongAnswers

