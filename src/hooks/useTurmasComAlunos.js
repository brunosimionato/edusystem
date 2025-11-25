// src/hooks/useTurmasComAlunos.js
import { useState, useEffect, useCallback } from 'react';
import TurmaService from '../Services/TurmaService';
import AlunoService from '../Services/AlunoService';

export const useTurmasComAlunos = () => {
    const [turmas, setTurmas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);

        try {
            const turmasBasicas = await TurmaService.list({ withAlunos: false });

            const turmasCompletas = await Promise.all(
                turmasBasicas.map(async (turma) => {
                    try {
                        const alunos = await AlunoService.getByTurma(turma.id);

                        return {
                            ...turma,
                            alunos,
                            alunosMatriculados: alunos.length,
                        };

                    } catch (error) {

                        return {
                            ...turma,
                            alunos: [],
                            alunosMatriculados: 0,
                        };
                    }
                })
            );

            setTurmas(turmasCompletas);

        } catch (error) {
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { turmas, isLoading, hasError, refetch };
};
