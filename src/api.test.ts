import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCharacters } from './api'
import type { Character } from './types'

const MOCK_CHARACTERS: Character[] = [
  { id: '1', name: 'Rick Sanchez', image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg' },
  { id: '2', name: 'Morty Smith', image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg' },
]

describe('fetchCharacters', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sends a POST request to the Rick and Morty GraphQL endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: { characters: { results: MOCK_CHARACTERS } } }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await fetchCharacters()

    expect(mockFetch).toHaveBeenCalledOnce()
    expect(mockFetch).toHaveBeenCalledWith('https://rickandmortyapi.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('query GetCharacters'),
    })
  })

  it('returns an array of characters on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: { characters: { results: MOCK_CHARACTERS } } }),
    }))

    const result = await fetchCharacters()
    expect(result).toEqual(MOCK_CHARACTERS)
    expect(result).toHaveLength(2)
  })

  it('returns an empty array when the API response has no characters', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: { characters: { results: null } } }),
    }))

    const result = await fetchCharacters()
    expect(result).toEqual([])
  })

  it('returns an empty array when the API response has no data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({}),
    }))

    const result = await fetchCharacters()
    expect(result).toEqual([])
  })

  it('throws when the network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    await expect(fetchCharacters()).rejects.toThrow('Network error')
  })
})
