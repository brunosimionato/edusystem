import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Building,
  BookOpen,
  Users,
  BarChart3,
  Shield,
  ChevronRight,
  Loader2
} from 'lucide-react';
import './login.css';

const Login = () => {
  const [selectedUserType, setSelectedUserType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const userTypes = [
    {
      id: 'teacher',
      title: 'Professor',
      description: 'Portal do educador',
      icon: GraduationCap
    },
    {
      id: 'admin',
      title: 'Secretaria',
      description: 'Administração escolar',
      icon: Building
    }
  ];

  const features = [
    {
      icon: BookOpen,
      text: 'Gerenciamento intuitivo'
    },
    {
      icon: Users,
      text: 'Controle de Usuários'
    },
    {
      icon: BarChart3,
      text: 'Interface simples e eficiente'
    },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserType) {
      alert('Por favor, selecione o tipo de usuário');
      return;
    }

    setIsLoading(true);
    
    // Simulação de login
    setTimeout(() => {
      console.log('Login data:', { ...formData, userType: selectedUserType });
      setIsLoading(false);
      
      // Aqui você pode redirecionar baseado no tipo de usuário
      if (selectedUserType === 'teacher') {
        // Redirecionar para dashboard do professor
        console.log('Redirecionando para dashboard do professor');
      } else if (selectedUserType === 'admin') {
        // Redirecionar para dashboard da secretaria
        console.log('Redirecionando para dashboard da secretaria');
      }
    }, 2000);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Lado Esquerdo */}
        <div className="login-left">
          <div className="logo-section">
          <div className="logo-icon">
            <GraduationCap style={{ width: '40px', height: '40px' }} />
          </div>

            <h1>EduSystem</h1>
            <p>Sistema de Gestão Escolar</p>
          </div>

          <div className="welcome-section">
            <h2>Bem-vindo de volta!</h2>
            <p>
              Acesse sua conta e gerencie todas as atividades escolares de forma 
              simples e eficiente. Nossa plataforma oferece ferramentas completas 
              para educadores e administradores.
            </p>

            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">
                    <feature.icon size={20} />
                  </div>
                  <span className="feature-text">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lado Direito */}
        <div className="login-right">
          <div className="form-header">
            <h2>Fazer Login</h2>
            <p>Selecione seu tipo de usuário e acesse sua conta</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Tipos de Usuário */}
            <div className="user-types">
              {userTypes.map((type) => (
                <div
                  key={type.id}
                  className={`user-type ${selectedUserType === type.id ? 'active' : ''}`}
                  onClick={() => setSelectedUserType(type.id)}
                >
                  <div className="user-icon">
                    <type.icon size={24} />
                  </div>
                  <div className="user-info">
                    <div className="user-title">{type.title}</div>
                    <div className="user-description">{type.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Campos do Formulário */}
            <div className="form-group">
              <label htmlFor="username">Nome de usuário</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Digite seu nome de usuário"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <div className="password-input-wrapper">
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
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Opções do Formulário */}
            <div className="form-options">
              <label className="remember-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                Lembrar de mim
              </label>
              <button type="button" className="forgot-password-link">
                Esqueceu a senha?
              </button>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="loading-spinner" size={18} />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="footer-text">
            © 2025 EduSystem. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
