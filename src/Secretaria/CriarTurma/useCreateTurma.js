import { useState, useCallback } from 'react';

import TurmaService from '../../Services/TurmaService';

export const useCreateTurma = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState(null);

    const create = useCallback(async (novaTurma) => {
        setIsCreating(true);
        setCreateError(null);
        try {
            return await TurmaService.create(novaTurma);
        } catch (err) {
            setCreateError(err);
            throw err;
        } finally {
            setIsCreating(false);
        }
    }, []);

    return { create, isCreating, createError };
}