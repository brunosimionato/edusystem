import { useState, useEffect, useCallback } from 'react';
import TurmaService from '../Services/TurmaService';
import AlunoService from '../Services/AlunoService';
import ProfessorService from '../Services/ProfessorService';
import { useAuth } from '../context/AuthContext';

export const useTurmasProfessor = () => {
    const { user } = useAuth();
    const [turmas, setTurmas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [professor, setProfessor] = useState(null);

    const refetch = useCallback(async () => {
        if (!user?.id) {
            return;
        }

        setIsLoading(true);
        setHasError(false);

        try {
            let professorEncontrado = null;
            
            try {
                const todosProfessores = await ProfessorService.getAll();
                professorEncontrado = todosProfessores.find(prof => 
                    prof.idUsuario === user.id
                );
                
                if (!professorEncontrado) {
                    setTurmas([]);
                    setProfessor(null);
                    return;
                }
                
                setProfessor(professorEncontrado);
            } catch (error) {
                console.error("Erro ao buscar professores:", error);
                setTurmas([]);
                setProfessor(null);
                return;
            }

            const turmasBasicas = await TurmaService.list({ withAlunos: false });

            let turmasDoProfessorIds = [];

            if (professorEncontrado.turmas && professorEncontrado.turmas.length > 0) {
                turmasDoProfessorIds = professorEncontrado.turmas.map(t => t.id);
            } 
            else {
                const turmasComProfessorId = turmasBasicas.filter(turma => 
                    turma.professor_id === professorEncontrado.id
                );
                turmasDoProfessorIds = turmasComProfessorId.map(t => t.id);
                
                if (turmasDoProfessorIds.length === 0) {
                    const turmasPorOutrasChaves = turmasBasicas.filter(turma => 
                        turma.professorId === professorEncontrado.id ||
                        turma.id_professor === professorEncontrado.id ||
                        (turma.professor && turma.professor.id === professorEncontrado.id)
                    );
                    turmasDoProfessorIds = turmasPorOutrasChaves.map(t => t.id);
                }
            }

            const turmasComAlunos = await Promise.all(
                turmasBasicas
                    .filter(turma => turmasDoProfessorIds.length === 0 || turmasDoProfessorIds.includes(turma.id))
                    .map(async (turma) => {
                        try {
                            const alunos = await AlunoService.getByTurma(turma.id);
                            return {
                                ...turma,
                                alunos,
                                alunosMatriculados: alunos.length,
                            };
                        } catch (error) {
                            console.error(`Erro ao buscar alunos da turma ${turma.id}:`, error);
                            return {
                                ...turma,
                                alunos: [],
                                alunosMatriculados: 0,
                            };
                        }
                    })
            );

            let turmasFiltradas = turmasComAlunos;

            if (turmasDoProfessorIds.length > 0) {
                turmasFiltradas = turmasComAlunos.filter(turma => 
                    turmasDoProfessorIds.includes(turma.id)
                );
            }

            setTurmas(turmasFiltradas);

        } catch (error) {
            console.error("Erro ao buscar turmas do professor:", error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { turmas, isLoading, hasError, refetch, professor };
};