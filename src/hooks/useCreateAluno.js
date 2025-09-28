import { useState, useCallback } from 'react';

import AlunoService from '../Services/AlunoService';

export const useCreateAluno = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState(null);

    const create = useCallback(async (novoAluno) => {
        setIsCreating(true);
        setCreateError(null);
        try {
            return await AlunoService.create(novoAluno);
        } catch (err) {
            setCreateError(err);
            throw err;
        } finally {
            setIsCreating(false);
        }
    }, []);

    return { create, isCreating, createError };
}
