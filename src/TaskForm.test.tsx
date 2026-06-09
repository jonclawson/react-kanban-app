import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from './TaskForm'
import type { Character } from './types'

const mockCharacters: Character[] = [
  { id: '1', name: 'Rick Sanchez', image: 'https://example.com/rick.jpg' },
  { id: '2', name: 'Morty Smith', image: 'https://example.com/morty.jpg' },
]

function renderForm() {
  const setSelectedCharId = vi.fn()
  const handleAddItem = vi.fn()
  const setTitle = vi.fn()
  const setDesc = vi.fn()
  const onCharType = vi.fn()

  const utils = render(
    <TaskForm
      setSelectedCharId={setSelectedCharId}
      selectedCharId=""
      characters={mockCharacters}
      onCharType={onCharType}
      handleAddItem={handleAddItem}
      title=""
      setTitle={setTitle}
      desc=""
      setDesc={setDesc}
    />
  )

  return { setSelectedCharId, handleAddItem, setTitle, setDesc, onCharType, ...utils }
}

describe('TaskForm', () => {
  it('renders the title input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument()
  })

  it('renders the description input', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument()
  })

  it('renders a character autocomplete input', () => {
    renderForm()
    const input = screen.getByRole('combobox')
    expect(input).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search characters...')).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
  })

  it('calls setTitle when typing in the title input', async () => {
    const { setTitle } = renderForm()
    const input = screen.getByPlaceholderText('Title')
    await userEvent.type(input, 'New Task')
    expect(setTitle).toHaveBeenCalled()
  })

  it('calls setDesc when typing in the description input', async () => {
    const { setDesc } = renderForm()
    const input = screen.getByPlaceholderText('Description')
    await userEvent.type(input, 'Some description')
    expect(setDesc).toHaveBeenCalled()
  })

  it('calls setSelectedCharId when selecting a character from the dropdown', async () => {
    const { setSelectedCharId } = renderForm()
    const input = screen.getByRole('combobox')

    await userEvent.type(input, 'Rick')
    const option = screen.getByText('Rick Sanchez')
    await userEvent.click(option)

    expect(setSelectedCharId).toHaveBeenCalledWith('1')
  })

  it('calls handleAddItem on form submit', async () => {
    const handleAddItem = vi.fn()

    render(
      <TaskForm
        setSelectedCharId={vi.fn()}
        selectedCharId="1"
        characters={mockCharacters}
        onCharType={vi.fn()}
        handleAddItem={handleAddItem}
        title="Test"
        setTitle={vi.fn()}
        desc="Desc"
        setDesc={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /add task/i }))
    expect(handleAddItem).toHaveBeenCalledOnce()
  })
})
