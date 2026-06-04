import type { Character } from "./types";

const GET_CHARACTERS_QUERY = `
  query GetCharacters {
    characters(page: 1) {
      results {
        id
        name
        image
      }
    }
  }
`;

export async function fetchCharacters(): Promise<Character[]> {
  const response = await fetch('https://rickandmortyapi.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: GET_CHARACTERS_QUERY }),
  });

  const { data } = await response.json();
  return data?.characters?.results || [];
}