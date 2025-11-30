import { useState, useEffect } from 'react';
import { apiClient } from '../api/api';

export function useDisciplinas() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDisciplinas = async () => {
      try {
        setIsLoading(true);

        const data = await apiClient.get('/disciplinas');
        setDisciplinas(data);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar disciplinas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisciplinas();
  }, []);

  return {
    disciplinas,
    isLoading,
    error,
  };
}