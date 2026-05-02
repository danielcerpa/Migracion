import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bug, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../services/api';
import '../styles/Login.css';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const data = await loginUsuario(email, password);
      login(data.user);
      navigate('/controlpanel');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error de conexión con el servidor');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-wrapper">
            <Bug size={40} />
          </div>
          <h2 className="login-title">Bienvenido</h2>
          <p className="login-subtitle" id="sistem">Sistema de Gestión Entomológica</p>
          <p className="login-subtitle">Administrador de prueba:</p>
          <p className="login-subtitle">admin@mail.com</p>
          <p className="login-subtitle">Contraseña: 123</p>
          <br />
          <p className="login-subtitle">Consultor de prueba: </p>
          <p className="login-subtitle">consultor@mail.com</p>
          <p className="login-subtitle">Contraseña: 123</p>
        </div>

        <div className="login-form-box">


          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '8px', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">
                <span>Correo Electrónico</span>
                <span className={`char-count ${email.length === 150 ? 'limit-reached' : ''}`}>{email.length}/150</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="nombre@ejemplo.com"
                maxLength={150}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Contraseña</span>
                <span className={`char-count ${password.length === 64 ? 'limit-reached' : ''}`}>{password.length}/64</span>
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input password-input"
                  placeholder="••••••••"
                  maxLength={64}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
      
      <button 
        onClick={toggleTheme}
        className="login-theme-btn"
        title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
      >
        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </button>
    </div>
  );
};

export default Login;
