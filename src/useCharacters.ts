import { useState, useEffect } from 'react';
import { fetchCharacters } from './api';
import type { Character } from './types';

export function useCharacters(query?: string) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters(query)
      .then((data) => {
        setCharacters(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [query]);

  return { characters, loading, error };
}
