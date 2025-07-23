import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [userType, setUserType] = useState('professor');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Exemplo de requisição ao backend
try {
  // 1. Busca usuário pelo email e tipo
  const response = await fetch(`http://localhost:3001/users?email=${encodeURIComponent(formData.email)}&userType=${userType}`);
  if (!response.ok) throw new Error('Usuário não encontrado');
  
  const user = await response.json();

  // 2. Verifica se a senha bate (atenção: nunca faça isso no front, é só exemplo)
  if (user.password === formData.password) {
    // Redireciona
    navigate('/inicioSec/secretaria');
  } else {
    alert('Senha incorreta');
  }

} catch (error) {
  alert(error.message || 'Erro ao conectar com o servidor');
}
setIsLoading(false);
  }

  const getPlaceholder = () => {
    switch(userType) {
      case 'professor':
        return 'Digite seu email';
      case 'secretaria':
        return 'Digite seu email';
      default:
        return 'Digite seu email';
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Seção esquerda - Logo e informações */}
        <div className="login-left">
          <div className="logo">
            <div className="logo-icon">📚</div>
            <h1>EduSystem</h1>
            <p>Sistema de Gestão Escolar</p>
          </div>
          
          <div className="info-section">
            <h3>Bem-vindo de volta!</h3>
            <p>Acesse sua conta para continuar gerenciando sua instituição de ensino com eficiência e praticidade.</p>
            
            <div className="features">
              <div className="feature">
                <span className="feature-icon">✨</span>
                <span>Interface intuitiva</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <span>Dados seguros</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <span>Relatórios completos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção direita - Formulário */}
        <div className="login-right">
          <div className="form-header">
            <h2>Fazer Login</h2>
            <p>Selecione seu tipo de usuário e faça login</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="user-types">
              <div 
                className={`user-type ${userType === 'professor' ? 'active' : ''}`}
                onClick={() => handleUserTypeChange('professor')}
              >
                <span className="user-icon">👩‍🏫</span>
                <div className="user-info">
                  <span className="user-title">Professor</span>
                  <span className="user-desc">Acesso ao sistema acadêmico</span>
                </div>
              </div>
              <div 
                className={`user-type ${userType === 'secretaria' ? 'active' : ''}`}
                onClick={() => handleUserTypeChange('secretaria')}
              >
                <span className="user-icon">👩‍💼</span>
                <div className="user-info">
                  <span className="user-title">Secretaria</span>
                  <span className="user-desc">Gestão administrativa</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder={getPlaceholder()}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Senha</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={togglePassword}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleInputChange}
                />
                Lembrar-me
              </label>
              <a href="#" className="forgot-password">Esqueceu a senha?</a>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Entrando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>

          <div className="footer-text">
            © 2025 EduSystem - Todos os direitos reservados
          </div>
        </div>
      </div>
    </div>
  );
};




export default LoginForm;