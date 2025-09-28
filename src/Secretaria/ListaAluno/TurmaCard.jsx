import React, { useState } from "react";
import {
    Edit,
    UserX,
    UserCheck,
    ArrowRightLeft,
    ChevronDown,
    ChevronRight,
    Settings,
} from "lucide-react";

const TurmaCard = ({ turma }) => {
    const [isExpandida, setIsExpandida] = useState(false);

    const toggleTurma = () => {
        setIsExpandida(!isExpandida);
    };

    const getTurnoClass = (turno) => {
        // remove espaços, acentos e coloca em minúsculas
        turno = turno.replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const classes = {
            manha: "turno-manha",
            tarde: "turno-tarde",
            noite: "turno-noite",
            integral: "turno-integral",
        };
        return classes[turno] || "";
    };

    const getStatusTurma = (alunos, capacidade) => {
        const alunosAtivos = alunos.filter((a) => a.status === "ativo").length;
        const percentual = (alunosAtivos / capacidade) * 100;

        if (percentual >= 100) return "lotada";
        if (percentual >= 80) return "quase-lotada";
        return "";
    };

    const handleEditarAluno = (alunoId) => {
        console.log("Editar aluno:", alunoId);
        // Implementar lógica de edição
    };

    const handleToggleStatusAluno = (alunoId, statusAtual) => {
        console.log("Toggle status aluno:", alunoId, statusAtual);
        // Implementar lógica de ativar/inativar
    };

    const handleRemanejarAluno = (alunoId) => {
        console.log("Remanejar aluno:", alunoId);
        // Implementar lógica de remanejamento
    };

    const handleDeclaracaoAluno = (alunoId) => {
        console.log("Declaração aluno:", alunoId);
        // Implementar lógica de declaração de matrícula
    };

    const alunosAtivos = turma.alunos.filter((a) => a.status === "ativo").length;
    const percentualOcupacao = (alunosAtivos / turma.quantidadeMaxima) * 100;
    const statusTurma = getStatusTurma(turma.alunos, turma.quantidadeMaxima);

    return (
        <div className={`turma-card ${statusTurma}`}>
            <div className="turma-info">
                <div className="turma-header clickable" onClick={toggleTurma}>
                    {isExpandida ? (
                        <ChevronDown size={20} />
                    ) : (
                        <ChevronRight size={20} />
                    )}
                    <h3 className="turma-nome-aluno">{turma.nome}</h3>
                    <span className={`turma-turno ${getTurnoClass(turma.turno)}`}>
                        {turma.turno}
                    </span>

                    {/* Botão de imprimir */}
                    <button
                        className="print-alunos-turmas-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Imprimir alunos da turma ${turma.nome}`);
                        }}
                    >
                        Imprimir
                    </button>
                </div>

                <div className="turma-details">
                    <div className="alunos-count">
                        {alunosAtivos} de {turma.quantidadeMaxima} vagas ocupadas (
                        {turma.alunos.length} alunos cadastrados)
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${Math.min(percentualOcupacao, 100)}%`,
                            }}
                        ></div>
                    </div>
                </div>

                {/* Tabela de Alunos Expandida */}
                {isExpandida && (
                    <div className="alunos-table-container">
                        <div className="alunos-table-header">
                            <span>Nome do Aluno</span>
                            <span>Status</span>
                            <span>Ações</span>
                        </div>

                        {turma.alunos.map((aluno) => (
                            <div key={aluno.id} className="aluno-row-lista-aluno">
                                <div
                                    className={`aluno-nome ${aluno.status === "inativo" ? "inativo" : ""
                                        }`}
                                >
                                    {aluno.nome}
                                </div>

                                <div>
                                    <span className={`status-badge ${aluno.status || "inativo"}`}>
                                        {aluno.status === "ativo" ? "Ativo" : "Inativo"}
                                    </span>
                                </div>

                                <div className="aluno-actions">
                                    <button
                                        className="action-button-lista-aluno edit-button"
                                        onClick={() => handleEditarAluno(aluno.id)}
                                        title="Editar aluno"
                                    >
                                        <Edit size={16} />
                                    </button>

                                    {aluno.status === "ativo" ? (
                                        <button
                                            className="action-button-lista-aluno deactivate-button"
                                            onClick={() =>
                                                handleToggleStatusAluno(aluno.id, aluno.status)
                                            }
                                            title="Inativar aluno"
                                        >
                                            <UserX size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            className="action-button-lista-aluno activate-button"
                                            onClick={() =>
                                                handleToggleStatusAluno(aluno.id, aluno.status)
                                            }
                                            title="Ativar aluno"
                                        >
                                            <UserCheck size={16} />
                                        </button>
                                    )}

                                    <button
                                        className="action-button-lista-aluno transfer-button"
                                        onClick={() => handleRemanejarAluno(aluno.id)}
                                        title="Remanejar aluno"
                                    >
                                        <ArrowRightLeft size={16} />
                                    </button>

                                    <button
                                        className="action-button-lista-aluno declaracao-button"
                                        onClick={() => handleDeclaracaoAluno(aluno.id)}
                                        title="Declaração de matrícula"
                                    >
                                        <Settings size={17} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TurmaCard;