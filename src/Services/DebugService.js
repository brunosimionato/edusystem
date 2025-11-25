// src/services/DebugService.js
import { API_URL } from '../utils/env.js';

class DebugService {
  async testAllEndpoints() {
    const endpoints = [
      '/',
      '/turmas',
      '/alunos',
      '/disciplinas',
      '/notas'
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        const token = localStorage.getItem('token');
        const url = `${API_URL}${endpoint}`;
        
        console.log(`🔍 Testando: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        let data;
        if (isJson) {
          data = await response.json();
        } else {
          data = await response.text();
          data = data.substring(0, 200) + '...'; // Limitar tamanho
        }

        results[endpoint] = {
          status: response.status,
          ok: response.ok,
          contentType: contentType,
          isJson: isJson,
          data: data
        };

        console.log(`📊 ${endpoint}:`, results[endpoint]);
      } catch (error) {
        results[endpoint] = {
          error: error.message,
          status: 0,
          ok: false
        };
        console.error(`❌ ${endpoint}:`, error);
      }
    }

    return results;
  }
}

export default new DebugService();