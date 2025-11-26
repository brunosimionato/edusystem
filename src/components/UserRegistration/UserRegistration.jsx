import { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Loader2, CheckCircle } from 'lucide-react';
import { useCreateUser } from '../../hooks/useCreateUser';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';



const userTypes = [
    { value: 'professor', label: 'Professor' },
    { value: 'secretaria', label: 'Secretaria' },
    { value: 'aluno', label: 'Aluno' }
];

export default function UserRegistration() {
    const { authToken, userRole } = useAuth();
    const navigate = useNavigate();
    const { createPublic, create, isLoading, error } = useCreateUser();
    
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        tipo_usuario: 'secretaria'
    });

    useEffect(() => {
        if (authToken && userRole === 'aluno') {
            navigate('/professor/dashboard');
        }
    }, [authToken, userRole, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess(false);

        try {
            if (authToken) {
                // Usuário logado - usa rota protegida
                await create(formData, authToken);
            } else {
                // Usuário não logado - usa rota pública
                await createPublic(formData);
            }
            
            setSuccess(true);
            
            // Se não estava logado, redireciona para login após criar o usuário
            if (!authToken) {
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                // Limpar formulário se já estava logado
                setFormData({
                    nome: '',
                    email: '',
                    senha: '',
                    tipo_usuario: 'secretaria'
                });
            }
        } catch (err) {
            console.error('Erro ao criar usuário:', err);
        }
    };

    return (
        <div className="user-registration">
            <div className="registration-header">
                <h2>
                    {authToken ? 'Cadastrar Novo Usuário' : 'Criar Primeira Conta'}
                </h2>
                <p>
                    {authToken 
                        ? 'Crie uma nova conta no sistema' 
                        : 'Crie a primeira conta de administrador do sistema'
                    }
                </p>
            </div>

            {!authToken && (
                <div className="info-banner">
                    <strong>Primeiro acesso:</strong> Você está criando a primeira conta do sistema. 
                    Recomendamos usar o tipo "Secretaria" para ter acesso completo.
                </div>
            )}

            <form onSubmit={handleSubmit} className="registration-form">
                <div className="form-group">
                    <label htmlFor="nome">
                        <User size={16} />
                        Nome Completo
                    </label>
                    <input
                        type="text"
                        id="nome"
                        name="nome"
                        placeholder="Digite o nome completo"
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">
                        <Mail size={16} />
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Digite o email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="senha">
                        <Lock size={16} />
                        Senha
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="senha"
                            name="senha"
                            placeholder="Digite a senha (mínimo 6 caracteres)"
                            value={formData.senha}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="tipo_usuario">Tipo de Usuário</label>
                    <select
                        id="tipo_usuario"
                        name="tipo_usuario"
                        value={formData.tipo_usuario}
                        onChange={handleInputChange}
                        required
                    >
                        {userTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        <CheckCircle size={18} />
                        <span>
                            {authToken 
                                ? 'Usuário criado com sucesso!' 
                                : 'Conta criada com sucesso! Redirecionando para login...'
                            }
                        </span>
                    </div>
                )}

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="loading-spinner" size={18} />
                            {authToken ? 'Criando...' : 'Criando conta...'}
                        </>
                    ) : (
                        authToken ? 'Criar Usuário' : 'Criar Primeira Conta'
                    )}
                </button>

                {!authToken && (
                    <div className="login-link">
                        Já tem uma conta? <a href="/login">Fazer login</a>
                    </div>
                )}
            </form>
        </div>
    );
}