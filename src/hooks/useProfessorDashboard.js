import { useState, useEffect } from 'react';
import ProfessorService from '../Services/ProfessorService';

export const useProfessorDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalAlunos: 0,
    totalTurmas: 0,
    diasLetivos: 200
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar todos os professores e encontrar o do usuário logado
        const professores = await ProfessorService.getAll();
        
        // Encontrar professor ATIVO (prioriza por status)
        const professorAtivo = professores.find(p => 
          p.usuario?.status === 'ativo' || !p.usuario?.status
        );

        if (!professorAtivo) {
          throw new Error("Nenhum professor ativo encontrado");
        }

        const professorId = professorAtivo.id;
        const data = await ProfessorService.getDashboardData(professorId);
        
        setDashboardData(data);
        
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setError(err.message);
        
        setDashboardData({
          totalAlunos: 0,
          totalTurmas: 0,
          diasLetivos: 200
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return { dashboardData, loading, error };
};