import type { Character } from "./types";

const GET_CHARACTERS_QUERY = `
query($name: String) {
   characters(filter:{name: $name}) {
      results {
        id
        name
        image
      }
    }
}
`;

export async function fetchCharacters(query?: string): Promise<Character[]> {
  const response = await fetch('https://rickandmortyapi.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: GET_CHARACTERS_QUERY, variables: { name: query } }),
  });

  const { data } = await response.json();
  return data?.characters?.results || [];
}