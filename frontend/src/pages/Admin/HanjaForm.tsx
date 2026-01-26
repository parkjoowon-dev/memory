import { useState, useEffect } from 'react'
import { Hanja } from '../../types/hanja'
import styled from 'styled-components'

interface HanjaFormProps {
  initialData: Hanja | null
  editingId: string | null
  onClose: () => void
  onSuccess: () => void
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`

const FormContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem 0.5rem;

  &:hover {
    color: #1a1a1a;
  }
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.95rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`


const ExampleItem = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
`

const ExampleInput = styled(Input)`
  flex: 1;
`

const AddButton = styled.button`
  padding: 0.5rem 1rem;
  background: #e0e0e0;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  margin-top: 0.5rem;

  &:hover {
    background: #d0d0d0;
  }
`

const RemoveButton = styled.button`
  padding: 0.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background: #b91c1c;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) => (p.$primary ? '#2563eb' : '#e0e0e0')};
  color: ${(p) => (p.$primary ? 'white' : '#1a1a1a')};

  &:hover {
    background: ${(p) => (p.$primary ? '#1d4ed8' : '#d0d0d0')};
  }
`

const HanjaForm = ({ initialData, editingId, onClose, onSuccess }: HanjaFormProps) => {
  const [formData, setFormData] = useState({
    character: '',
    sound: '',
    meaning: '',
    chapter: 1,
    difficulty: 2,
    examples: [] as Array<{ sentence: string; meaning: string }>,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        character: initialData.character,
        sound: initialData.sound,
        meaning: initialData.meaning,
        chapter: initialData.chapter,
        difficulty: initialData.difficulty,
        examples: initialData.examples.map((ex) => ({
          sentence: ex.sentence,
          meaning: ex.meaning,
        })),
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || ''
    const url = editingId
      ? `${API_BASE_URL}/api/hanja/${editingId}`
      : `${API_BASE_URL}/api/hanja`

    try {
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert(editingId ? '수정되었습니다.' : '등록되었습니다.')
        onSuccess()
      } else {
        const error = await response.json()
        alert(`오류: ${error.detail || '저장에 실패했습니다.'}`)
      }
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { sentence: '', meaning: '' }],
    })
  }

  const removeExample = (index: number) => {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== index),
    })
  }

  const updateExample = (index: number, field: 'sentence' | 'meaning', value: string) => {
    const newExamples = [...formData.examples]
    newExamples[index] = { ...newExamples[index], [field]: value }
    setFormData({ ...formData, examples: newExamples })
  }

  return (
    <Overlay onClick={onClose}>
      <FormContainer onClick={(e) => e.stopPropagation()}>
        <FormHeader>
          <FormTitle>{editingId ? '한자 수정' : '새 한자 추가'}</FormTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </FormHeader>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>한자 *</Label>
            <Input
              type="text"
              value={formData.character}
              onChange={(e) => setFormData({ ...formData, character: e.target.value })}
              required
              maxLength={1}
            />
          </FormGroup>

          <FormGroup>
            <Label>음 *</Label>
            <Input
              type="text"
              value={formData.sound}
              onChange={(e) => setFormData({ ...formData, sound: e.target.value })}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>뜻 *</Label>
            <Input
              type="text"
              value={formData.meaning}
              onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>단원 *</Label>
            <Input
              type="number"
              value={formData.chapter}
              onChange={(e) =>
                setFormData({ ...formData, chapter: parseInt(e.target.value) || 1 })
              }
              required
              min={1}
            />
          </FormGroup>

          <FormGroup>
            <Label>난이도 (1-5)</Label>
            <Input
              type="number"
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: parseInt(e.target.value) || 2 })
              }
              min={1}
              max={5}
            />
          </FormGroup>

          <FormGroup>
            <Label>예문</Label>
            {formData.examples.map((example, index) => (
              <ExampleItem key={index}>
                <ExampleInput
                  type="text"
                  placeholder="예문 (예: 一石二鳥)"
                  value={example.sentence}
                  onChange={(e) => updateExample(index, 'sentence', e.target.value)}
                />
                <ExampleInput
                  type="text"
                  placeholder="뜻 (예: 한 가지 일로 두 가지 이득)"
                  value={example.meaning}
                  onChange={(e) => updateExample(index, 'meaning', e.target.value)}
                />
                <RemoveButton type="button" onClick={() => removeExample(index)}>
                  삭제
                </RemoveButton>
              </ExampleItem>
            ))}
            <AddButton type="button" onClick={addExample}>
              + 예문 추가
            </AddButton>
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              취소
            </Button>
            <Button $primary type="submit">
              {editingId ? '수정' : '등록'}
            </Button>
          </ButtonGroup>
        </form>
      </FormContainer>
    </Overlay>
  )
}

export default HanjaForm
