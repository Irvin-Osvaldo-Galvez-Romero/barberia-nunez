import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, UserRole } from '../stores/authStore'
import { useLanguage } from '../hooks/useLanguage'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  
  // Estados para registro
  const [registerNombre, setRegisterNombre] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerRol, setRegisterRol] = useState<UserRole>('BARBERO')
  
  const navigate = useNavigate()
  const { login, register, loading, isAuthenticated, isDemoMode, checkAuth } = useAuthStore()
  const { t } = useLanguage()

  useEffect(() => {
    checkAuth()
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate, checkAuth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError(t('completarCampos'))
      return
    }

    const result = await login(email, password)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || t('errorIniciarSesion'))
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!registerNombre || !registerEmail || !registerPassword) {
      setError(t('completarCampos'))
      return
    }

    const result = await register(registerEmail, registerPassword, registerNombre, registerRol)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || t('errorRegistro'))
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header con logo de barbería */}
        <div className="login-header">
          <div className="login-logo">
            <img src="/src/assets/logo-barberia.jpeg" alt="Nuñez Barber Shop" className="login-logo-img" />
          </div>
          <h1 className="login-title">Nuñez Barber Shop</h1>
          <p className="login-subtitle">{t('sistemaGestion')}</p>
        </div>

        {/* Form Container */}
        <div className="login-form-container">
          {isDemoMode && (
            <div className="login-demo-notice">
              <p className="login-demo-notice-title">{t('modoDemoActivo')}</p>
              <p className="login-demo-notice-text">
                {t('usaCredencialesDemo')} <strong>admin@demo.com</strong> / <strong>demo123</strong> {t('datosDemo')}<br/>
                <strong>barbero@demo.com</strong> / <strong>demo123</strong>
              </p>
            </div>
          )}

          {error && (
            <div className="login-error-notice">
              <p className="login-error-notice-text">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label className="login-label">{t('correoElectronico')}</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('placeholderEmail')}
                  className="login-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-form-group">
              <label className="login-label">{t('contrasena')}</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-btn-primary"
            >
              {loading ? t('iniciandoSesion') : t('iniciarSesion')}
            </button>
          </form>
        </div>
      </div>

      {/* Modal de Registro */}
      {showRegister && (
        <div className="modal-overlay" onClick={() => setShowRegister(false)}>
          <div className="register-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="register-modal-header">
              <h2 className="register-modal-title">{t('crearCuenta')}</h2>
              <button className="register-modal-close" onClick={() => setShowRegister(false)}>×</button>
            </div>
            <form onSubmit={handleRegister}>
              <div className="register-modal-body">
                {error && (
                  <div className="register-modal-error">
                    <p>{error}</p>
                  </div>
                )}

                <div className="register-form-group">
                  <label className="register-form-label">{t('nombreCompleto')} *</label>
                  <input
                    type="text"
                    className="register-form-input"
                    placeholder={t('placeholderNombre')}
                    value={registerNombre}
                    onChange={(e) => setRegisterNombre(e.target.value)}
                    required
                  />
                </div>

                <div className="register-form-group">
                  <label className="register-form-label">{t('email')} *</label>
                  <input
                    type="email"
                    className="register-form-input"
                    placeholder={t('placeholderEmailRegistro')}
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="register-form-group">
                  <label className="register-form-label">{t('contrasena')} *</label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder={t('placeholderContrasena')}
                    className="register-form-input"
                    required
                  />
                </div>

                <div className="register-form-group">
                  <label className="register-form-label">{t('rol')} *</label>
                  <select
                    className="register-form-input"
                    value={registerRol}
                    onChange={(e) => setRegisterRol(e.target.value as UserRole)}
                    required
                  >
                    <option value="barbero">{t('barbero')}</option>
                    <option value="recepcionista">{t('recepcionista')}</option>
                    <option value="admin">{t('admin')}</option>
                  </select>
                </div>
              </div>
              <div className="register-modal-footer">
                <button type="button" className="register-btn-cancel" onClick={() => setShowRegister(false)}>
                  {t('cancelar')}
                </button>
                <button type="submit" className="register-btn-submit" disabled={loading}>
                  {loading ? t('registrando') : t('registrarse')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
