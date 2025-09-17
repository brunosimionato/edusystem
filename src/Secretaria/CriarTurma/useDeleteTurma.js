import { useState, useCallback } from 'react';

import TurmaService from '../../Services/TurmaService';

export const useDeleteTurma = () => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const remove = useCallback(async (id) => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await TurmaService.delete(id);
        } catch (err) {
            setDeleteError(err);
            throw err;
        } finally {
            setIsDeleting(false);
        }
    }, []);

    return { remove, isDeleting, deleteError };
}