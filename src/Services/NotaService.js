// src/services/NotaService.js - ADAPTADO
import { z } from 'zod';
import { API_URL } from '../utils/env.js';
import HistoricoEscolarService from './HistoricoEscolarService';

// Usando histórico escolar como base para notas
export const novaNotaSchema = z.object({
    idAluno: z.number(),
    idDisciplina: z.number(),
    trimestre: z.number().min(1).max(3),
    nota: z.number().min(0).max(100),
    anoLetivo: z.number()
});

export const notaSchema = z.object({
    id: z.number(),
    idAluno: z.number(),
    idDisciplina: z.number(),
    trimestre: z.number(),
    nota: z.number(),
    anoLetivo: z.number(),
    createdAt: z.string().optional()
});

class NotaService {
    /**
     * Usa histórico escolar para simular notas
     */
    async getByAluno(alunoId, anoLetivo, trimestre) {
        try {
            const historicos = await HistoricoEscolarService.getByAlunoId(alunoId);
            
            // Filtrar por ano letivo e converter para estrutura de nota
            const notas = historicos
                .filter(h => {
                    const historicoYear = h.anoConclusao;
                    return historicoYear === anoLetivo;
                })
                .map(h => ({
                    id: h.id,
                    idAluno: h.idAluno,
                    idDisciplina: h.idDisciplina || 0, // Se não tem disciplina, usa 0
                    trimestre: trimestre || 1,
                    nota: h.nota,
                    anoLetivo: h.anoConclusao,
                    createdAt: h.createdAt
                }));

            return notas.map(notaSchema.parse);
        } catch (error) {
            console.error("Error fetching notas from historico:", error);
            throw new Error('Failed to fetch notas');
        }
    }

    /**
     * Cria uma nova "nota" como histórico escolar
     */
    async create(notaData) {
        const validatedData = novaNotaSchema.parse(notaData);
        
        // Criar como histórico escolar
        const historicoData = {
            idAluno: validatedData.idAluno,
            idDisciplina: validatedData.idDisciplina,
            nomeEscola: "Sistema de Notas", // Placeholder
            serieConcluida: `${validatedData.trimestre}º Trimestre`,
            nota: validatedData.nota,
            anoConclusao: validatedData.anoLetivo
        };

        try {
            const historico = await HistoricoEscolarService.create(historicoData);
            
            // Converter de volta para estrutura de nota
            const nota = {
                id: historico.id,
                idAluno: historico.idAluno,
                idDisciplina: historico.idDisciplina || 0,
                trimestre: validatedData.trimestre,
                nota: historico.nota,
                anoLetivo: historico.anoConclusao,
                createdAt: historico.createdAt
            };

            return notaSchema.parse(nota);
        } catch (error) {
            console.error("Error creating nota as historico:", error);
            throw new Error('Failed to create nota');
        }
    }

    /**
     * Atualiza uma "nota" via histórico escolar
     */
    async update(id, updateData) {
        const validatedData = novaNotaSchema.partial().parse(updateData);
        
        try {
            const historico = await HistoricoEscolarService.update(id, {
                ...validatedData,
                nomeEscola: "Sistema de Notas", // Manter placeholder
                serieConcluida: `${validatedData.trimestre || 1}º Trimestre`
            });

            // Converter de volta para estrutura de nota
            const nota = {
                id: historico.id,
                idAluno: historico.idAluno,
                idDisciplina: historico.idDisciplina || 0,
                trimestre: validatedData.trimestre || 1,
                nota: historico.nota,
                anoLetivo: historico.anoConclusao,
                createdAt: historico.createdAt
            };

            return notaSchema.parse(nota);
        } catch (error) {
            console.error("Error updating nota as historico:", error);
            throw new Error('Failed to update nota');
        }
    }

    /**
     * Deleta uma "nota" via histórico escolar
     */
    async delete(id) {
        try {
            await HistoricoEscolarService.delete(id);
        } catch (error) {
            console.error("Error deleting nota as historico:", error);
            throw new Error('Failed to delete nota');
        }
    }
}

export default new NotaService();