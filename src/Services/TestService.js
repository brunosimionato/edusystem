// src/services/TestService.js
import { API_URL } from '../utils/env.js';

class TestService {
  async testConnection() {
    try {
      console.log('🔍 Testando conexão com:', API_URL);
      
      const response = await fetch(`${API_URL}/`, {
        method: 'GET',
      });

      console.log('📊 Status:', response.status);
      console.log('📊 URL:', response.url);
      
      const text = await response.text();
      console.log('📄 Primeiros 500 caracteres da resposta:', text.substring(0, 500));
      
      // Verificar se é HTML
      const isHtml = text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
      console.log('📄 É HTML?', isHtml);
      
      return {
        status: response.status,
        ok: response.ok,
        text: text,
        isHtml: isHtml,
        url: response.url
      };
    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      return {
        error: error.message,
        status: 0,
        ok: false
      };
    }
  }

  async testTurmasEndpoint() {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Testando endpoint /turmas');
      console.log('🔐 Token presente:', !!token);
      
      const response = await fetch(`${API_URL}/turmas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Status /turmas:', response.status);
      
      const text = await response.text();
      console.log('📄 Resposta /turmas:', text.substring(0, 500));
      
      const isHtml = text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
      console.log('📄 É HTML?', isHtml);
      
      return {
        status: response.status,
        ok: response.ok,
        text: text,
        isHtml: isHtml
      };
    } catch (error) {
      console.error('❌ Erro no endpoint /turmas:', error);
      return {
        error: error.message,
        status: 0,
        ok: false
      };
    }
  }
}

export default new TestService();