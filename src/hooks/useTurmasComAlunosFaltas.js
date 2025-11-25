// src/hooks/useTurmasComAlunosFaltas.js
import { useState, useEffect, useCallback } from 'react';
import TurmaService from '../Services/TurmaService';
import AlunoService from '../Services/AlunoService';

export const useTurmasComAlunosFaltas = () => {
    const [turmas, setTurmas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            
            // Usa o método list() que existe no TurmaService
            const turmasBasicas = await TurmaService.list({ withAlunos: false });
            console.log('✅ Turmas básicas para faltas:', turmasBasicas);

            // Para cada turma, busca os alunos
            const turmasCompletas = await Promise.all(
                turmasBasicas.map(async (turma) => {
                    try {
                        console.log(`🔄 Buscando alunos da turma ${turma.id} para faltas...`);
                        const alunos = await AlunoService.getByTurma(turma.id);
                        console.log(`✅ Alunos da turma ${turma.id} para faltas:`, alunos);
                        
                        return {
                            id: turma.id,
                            nome: turma.nome,
                            turno: turma.turno,
                            serie: turma.serie,
                            tipo: determinarTipoTurma(turma.serie),
                            alunos: alunos,
                            alunosMatriculados: alunos.length
                        };
                    } catch (error) {
                        console.error(`❌ Erro ao carregar alunos da turma ${turma.id} para faltas:`, error);
                        return {
                            id: turma.id,
                            nome: turma.nome,
                            turno: turma.turno,
                            serie: turma.serie,
                            tipo: determinarTipoTurma(turma.serie),
                            alunos: [],
                            alunosMatriculados: 0
                        };
                    }
                })
            );

            console.log('✅ Todas as turmas com alunos para faltas:', turmasCompletas);
            setTurmas(turmasCompletas);
        } catch (error) {
            console.error('❌ Erro ao buscar turmas para faltas:', error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return {
        turmas,
        isLoading,
        hasError,
        refetch,
    };
};

// Função auxiliar para determinar o tipo da turma
function determinarTipoTurma(serie) {
    if (!serie) return 'fundamental1';
    
    if (serie.includes('1º') || serie.includes('2º') || serie.includes('3º') || 
        serie.includes('4º') || serie.includes('5º')) {
        return 'fundamental1';
    }
    
    if (serie.includes('6º') || serie.includes('7º') || serie.includes('8º') || 
        serie.includes('9º')) {
        return 'fundamental2';
    }
    
    return 'fundamental1';
}