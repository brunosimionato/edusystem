import { useState } from 'react';
import { alunoApi } from '../api/api';

export function useCreateAluno() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const create = async (alunoData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Formata as datas para string ISO
      const formattedData = {
        ...alunoData,
        nascimento: alunoData.nascimento instanceof Date 
          ? alunoData.nascimento.toISOString() 
          : alunoData.nascimento,
      };

      const response = await alunoApi.create(formattedData);
      setData(response);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao criar aluno';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    create,
    isLoading,
    error,
    data,
  };
}