import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Task from './Task'
import type { KanbanItem } from './types'

const mockItem: KanbanItem = {
  id: 'test-1',
  title: 'Test Task',
  description: 'A description for the task',
  character: {
    id: '1',
    name: 'Rick Sanchez',
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  },
}

const mockItemNoDesc: KanbanItem = {
  ...mockItem,
  description: '',
}

describe('Task', () => {
  it('renders the task title', () => {
    render(<Task item={mockItem} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('renders the task description when provided', () => {
    render(<Task item={mockItem} />)
    expect(screen.getByText('A description for the task')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<Task item={mockItemNoDesc} />)
    expect(screen.queryByText('A description for the task')).not.toBeInTheDocument()
  })

  it('renders the character name', () => {
    render(<Task item={mockItem} />)
    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
  })

  it('renders the character image with correct alt text', () => {
    render(<Task item={mockItem} />)
    const img = screen.getByAltText('Rick Sanchez')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', mockItem.character.image)
  })
})
