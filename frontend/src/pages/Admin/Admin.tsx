import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { fetchHanjaList, fetchHanjaById } from '../../utils/api'
import { Hanja } from '../../types/hanja'
import styled from 'styled-components'
import HanjaForm from './HanjaForm'

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
`

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`

const FilterLabel = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const TableHeader = styled.thead`
  background: #f5f5f5;
`

const TableRow = styled.tr`
  border-bottom: 1px solid #e0e0e0;

  &:hover {
    background: #f9f9f9;
  }
`

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  color: #666;
`

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.95rem;
`

const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) => (p.$danger ? '#dc2626' : '#2563eb')};
  color: white;

  &:hover {
    background: ${(p) => (p.$danger ? '#b91c1c' : '#1d4ed8')};
  }
`

const CharacterCell = styled(TableCell)`
  font-size: 1.5rem;
  font-weight: 600;
`

const Admin = () => {
  const { hanjaList, setHanjaList } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Hanja | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all')

  useEffect(() => {
    loadHanjaList()
  }, [])

  const loadHanjaList = async () => {
    const response = await fetchHanjaList()
    if (response.data) {
      setHanjaList(response.data.hanja)
    }
  }

  const handleCreate = () => {
    setFormData(null)
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = async (id: string) => {
    const response = await fetchHanjaById(id)
    if (response.data) {
      setFormData(response.data)
      setEditingId(id)
      setShowForm(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || ''
    try {
      const response = await fetch(`${API_BASE_URL}/api/hanja/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadHanjaList()
        alert('삭제되었습니다.')
      } else {
        alert('삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setFormData(null)
    setEditingId(null)
  }

  const handleFormSuccess = () => {
    loadHanjaList()
    handleFormClose()
  }

  // 단원 목록 추출 (중복 제거 및 정렬)
  const chapters = Array.from(new Set(hanjaList.map((h) => h.chapter))).sort((a, b) => a - b)

  // 필터링된 한자 목록
  const filteredHanjaList =
    selectedChapter === 'all'
      ? hanjaList
      : hanjaList.filter((h) => h.chapter === selectedChapter)

  return (
    <Container>
      <Header>
        <Title>한자 관리</Title>
        <Button $primary onClick={handleCreate}>
          + 새 한자 추가
        </Button>
      </Header>

      <FilterSection>
        <FilterLabel htmlFor="chapter-select">단원 필터:</FilterLabel>
        <Select
          id="chapter-select"
          value={selectedChapter}
          onChange={(e) =>
            setSelectedChapter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
          }
        >
          <option value="all">전체</option>
          {chapters.map((chapter) => (
            <option key={chapter} value={chapter}>
              {chapter}단원
            </option>
          ))}
        </Select>
        <span style={{ color: '#666', fontSize: '0.9rem' }}>
          총 {filteredHanjaList.length}개
        </span>
      </FilterSection>

      {showForm && (
        <HanjaForm
          initialData={formData}
          editingId={editingId}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>ID</TableHeaderCell>
            <TableHeaderCell>한자</TableHeaderCell>
            <TableHeaderCell>음</TableHeaderCell>
            <TableHeaderCell>뜻</TableHeaderCell>
            <TableHeaderCell>단원</TableHeaderCell>
            <TableHeaderCell>난이도</TableHeaderCell>
            <TableHeaderCell>예문</TableHeaderCell>
            <TableHeaderCell>작업</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <tbody>
          {filteredHanjaList.map((hanja) => (
            <TableRow key={hanja.id}>
              <TableCell>{hanja.id}</TableCell>
              <CharacterCell>{hanja.character}</CharacterCell>
              <TableCell>{hanja.sound}</TableCell>
              <TableCell>{hanja.meaning}</TableCell>
              <TableCell>{hanja.chapter}</TableCell>
              <TableCell>{hanja.difficulty}</TableCell>
              <TableCell>{hanja.examples.length}개</TableCell>
              <TableCell>
                <ActionButton onClick={() => handleEdit(hanja.id)}>수정</ActionButton>
                <ActionButton $danger onClick={() => handleDelete(hanja.id)}>
                  삭제
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Container>
  )
}

export default Admin
