import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KanbanBoard from './KanbanBoard'
import type { Character } from './types'

vi.mock('./api', () => ({
  fetchCharacters: vi.fn(),
}))

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

import { fetchCharacters } from './api'

const MOCK_CHARACTERS: Character[] = [
  { id: '1', name: 'Rick Sanchez', image: 'https://example.com/rick.jpg' },
  { id: '2', name: 'Morty Smith', image: 'https://example.com/morty.jpg' },
]

describe('KanbanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while fetching characters', () => {
    vi.mocked(fetchCharacters).mockReturnValue(new Promise(() => {}))
    render(<KanbanBoard />)

    expect(screen.getByText('Loading characters...')).toBeInTheDocument()
    expect(screen.queryByText('Rick & Morty Kanban')).not.toBeInTheDocument()
  })

  it('shows error state when fetch fails', async () => {
    vi.mocked(fetchCharacters).mockRejectedValue(new Error('Network error'))
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument()
    })
    expect(screen.queryByText('To Do')).not.toBeInTheDocument()
  })

  it('fetches characters on mount', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(MOCK_CHARACTERS)
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(fetchCharacters).toHaveBeenCalledOnce()
    })
  })

  it('renders the board title', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(MOCK_CHARACTERS)
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(screen.getByText('Rick & Morty Kanban')).toBeInTheDocument()
    })
  })

  it('renders all three column headings', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(MOCK_CHARACTERS)
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument()
    })
    expect(screen.getByText('Doing')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders the add task form', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(MOCK_CHARACTERS)
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Title')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
  })

  it('populates the character dropdown from the API', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(MOCK_CHARACTERS)
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
    })
    expect(screen.getByText('Morty Smith')).toBeInTheDocument()
  })

  it('adds a new item when form is submitted with valid data', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchCharacters).mockResolvedValue(MOCK_CHARACTERS)
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Title'), 'My Test Task')
    await user.selectOptions(screen.getByRole('combobox'), '1')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    expect(screen.getByText('My Test Task')).toBeInTheDocument()
    expect(screen.getAllByText('Rick Sanchez').length).toBeGreaterThanOrEqual(1)
  })

  it('can add multiple items to the board', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchCharacters).mockResolvedValue(MOCK_CHARACTERS)
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Title'), 'Task One')
    await user.selectOptions(screen.getByRole('combobox'), '1')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    await user.type(screen.getByPlaceholderText('Title'), 'Task Two')
    await user.selectOptions(screen.getByRole('combobox'), '2')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    expect(screen.getByText('Task One')).toBeInTheDocument()
    expect(screen.getByText('Task Two')).toBeInTheDocument()
  })

  it('clears the form inputs after adding an item', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchCharacters).mockResolvedValue(MOCK_CHARACTERS)
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Title'), 'Temp Task')
    await user.selectOptions(screen.getByRole('combobox'), '1')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    expect(screen.getByPlaceholderText<HTMLInputElement>('Title').value).toBe('')
  })

  it('does not add an item when title is empty', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchCharacters).mockResolvedValue(MOCK_CHARACTERS)
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add task/i }))

    expect(screen.queryByText('My Test Task')).not.toBeInTheDocument()
  })

  it('does not add an item when no character is selected', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchCharacters).mockResolvedValue(MOCK_CHARACTERS)
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Title'), 'No Char Task')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    expect(screen.queryByText('No Char Task')).not.toBeInTheDocument()
  })

  it('renders the task description in the card', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchCharacters).mockResolvedValue(MOCK_CHARACTERS)
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Title'), 'Task with desc')
    await user.type(screen.getByPlaceholderText('Description'), 'This is a description')
    await user.selectOptions(screen.getByRole('combobox'), '1')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    expect(screen.getByText('This is a description')).toBeInTheDocument()
  })

  it('renders a character image for each task', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchCharacters).mockResolvedValue(MOCK_CHARACTERS)
    render(<KanbanBoard />)

    await waitFor(() => {
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Title'), 'Image Test')
    await user.selectOptions(screen.getByRole('combobox'), '1')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    const imgs = screen.getAllByRole('img')
    const rickImg = imgs.find(img => img.getAttribute('src') === 'https://example.com/rick.jpg')
    expect(rickImg).toBeInTheDocument()
    expect(rickImg).toHaveAttribute('alt', 'Rick Sanchez')
  })
})
