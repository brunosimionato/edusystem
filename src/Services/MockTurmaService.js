class MockTurmaService {
    async getAll() {
      console.log('🎭 Usando dados mockados de turmas');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return [
        {
          id: 1,
          nome: "1º ANO A",
          turno: "manhã",
          serie: "1º Ano",
          tipo: "fundamental1",
          alunos: [
            { id: 1, nome: "Ana Silva" },
            { id: 2, nome: "Bruno Costa" },
            { id: 3, nome: "Carlos Mendes" }
          ]
        },
        {
          id: 2,
          nome: "6º ANO A",
          turno: "manhã", 
          serie: "6º Ano",
          tipo: "fundamental2",
          alunos: [
            { id: 4, nome: "Daniela Lima" },
            { id: 5, nome: "Eduardo Santos" },
            { id: 6, nome: "Fernanda Oliveira" }
          ]
        },
        {
          id: 3,
          nome: "9º ANO B",
          turno: "tarde",
          serie: "9º Ano",
          tipo: "fundamental2",
          alunos: [
            { id: 7, nome: "Gabriel Silva" },
            { id: 8, nome: "Helena Costa" }
          ]
        }
      ];
    }
  
    async create(turmaData) {
      console.log('🎭 Mock: Criando turma', turmaData);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: Math.random() * 1000,
        ...turmaData,
        alunos: []
      };
    }
  }
  
  export default new MockTurmaService();