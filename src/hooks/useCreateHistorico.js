import { useState, useCallback } from 'react';

import HistoricoEscolarService from '../Services/HistoricoEscolarService';

export const useCreateHistoricoEscolar = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState(null);

    const create = useCallback(async (novoHistoricoEscolar) => {
        setIsCreating(true);
        setCreateError(null);
        try {
            return await HistoricoEscolarService.create(novoHistoricoEscolar);
        } catch (err) {
            setCreateError(err);
            throw err;
        } finally {
            setIsCreating(false);
        }
    }, []);

    return { create, isCreating, createError };
}
