import React, { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  School,
  UserPlus,
  Plus,
  ClipboardList,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./secretaria.css";
import { useAuth } from "../../context/AuthContext";

const Secretaria = () => {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  // Estado que armazena os dados vindos do backend
  const [stats, setStats] = useState({
    alunos: 0,
    professores: 0,
    turmas: 0,
    disciplinas: 0,
  });

  // Busca os dados do backend assim que o componente for carregado
  useEffect(() => {
    if (!authToken) return;

    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/dashboard", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Erro ao buscar dados do dashboard"
          );
        }

        const data = await response.json();

        setStats({
          alunos: data.alunos,
          professores: data.professores,
          turmas: data.turmas,
          disciplinas: data.disciplinas,
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    };

    fetchStats();
  }, [authToken]);

  // Dados para renderização dos cards
  const dashboardStats = [
    {
      label: "Total de Alunos",
      value: stats.alunos,
      icon: Users,
      color: "blue",
    },
    {
      label: "Professores Ativos",
      value: stats.professores,
      icon: GraduationCap,
      color: "green",
    },
    {
      label: "Turmas Ativas",
      value: stats.turmas,
      icon: School,
      color: "purple",
    },
    {
      label: "Disciplinas",
      value: stats.disciplinas,
      icon: BookOpen,
      color: "orange",
    },
  ];

  // Botões de ações rápidas
  const quickActions = [
    {
      icon: UserPlus,
      text: "Cadastrar Aluno",
      color: "blue",
      onClick: () => navigate("/secretaria/cadastrar-aluno"),
    },
    {
      icon: Plus,
      text: "Criar Turma",
      color: "green",
      onClick: () => navigate("/secretaria/criar-turma"),
    },
    {
      icon: ClipboardList,
      text: "Notas",
      color: "purple",
      onClick: () => navigate("/secretaria/notas"),
    },
    {
      icon: Calendar,
      text: "Horários",
      color: "orange",
      onClick: () => navigate("/secretaria/horarios"),
    },
  ];

  return (
    <div className="dashboard-content">
      {/* Cards de estatísticas */}
      <div className="stats-grid">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <h3>{stat.label}</h3>
                <div className="stat-value">
                  {stat.value !== undefined ? stat.value : "-"}
                </div>
              </div>
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ações rápidas */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Ações Rápidas</h3>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="action-button"
              onClick={action.onClick}
            >
              <div className={`action-icon ${action.color}`}>
                <action.icon />
              </div>
              <span className="action-text">{action.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Secretaria;
