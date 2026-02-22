import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { useEmpleadosStore, Empleado, Rol } from '../stores/empleadosStore'
import { useAuthStore } from '../stores/authStore'
import { useLanguage } from '../hooks/useLanguage'
import './Empleados.css'

/**
 * VISTA: EMPLEADOS
 * Gestión de empleados (barberos) de la barbería
 * - Listar, crear, editar y eliminar empleados
 * - Estadísticas y asignación de roles
 */
export default function Empleados() {
  const { user } = useAuthStore()
  const { t } = useLanguage()
  const {
    empleados, 
    loading, 
    searchTerm, 
    rolFilter,
    fetchEmpleados, 
    setSearchTerm, 
    setRolFilter,
    deleteEmpleado, 
    addEmpleado, 
    updateEmpleado,
    subscribeToRealtimeUpdates,
    unsubscribeFromRealtimeUpdates
  } = useEmpleadosStore()
  
  // Permisos: Recepcionista solo puede crear, no editar ni eliminar
  const canEdit = user?.rol !== 'RECEPCIONISTA'
  const canDelete = user?.rol !== 'RECEPCIONISTA'
  
  const [showModal, setShowModal] = useState(false)
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    rol: 'BARBERO' as Rol,
    fecha_contratacion: new Date().toISOString().split('T')[0],
    activo: true,
    porcentaje_comision: '',
    especialidad: '',
    password: ''
  })
  const [error, setError] = useState('')

  // Cargar empleados solo una vez al montar el componente
  useEffect(() => {
    if (empleados.length === 0 && !loading) {
      fetchEmpleados()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Suscribirse a cambios en tiempo real de empleados
  useEffect(() => {
    subscribeToRealtimeUpdates()

    return () => {
      unsubscribeFromRealtimeUpdates()
    }
  }, [subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates])

  const filteredEmpleados = useMemo(() => {
    let filtered = empleados

    // Filtro por rol
    if (rolFilter && rolFilter !== 'Todos') {
      filtered = filtered.filter(e => e.rol === rolFilter)
    }

    // Filtro por búsqueda
    const term = (searchTerm || '').trim()
    if (term) {
      const lowerTerm = term.toLowerCase()
      filtered = filtered.filter(empleado =>
        empleado.nombre.toLowerCase().includes(lowerTerm) ||
        empleado.email?.toLowerCase().includes(lowerTerm) ||
        empleado.telefono?.includes(term)
      )
    }

    return filtered
  }, [empleados, searchTerm, rolFilter])

  const stats = useMemo(() => {
    const total = empleados.length
    const activos = empleados.filter(e => e.activo).length
    const barberos = empleados.filter(e => e.rol === 'BARBERO').length
    const recepcionistas = empleados.filter(e => e.rol === 'RECEPCIONISTA').length

    return { total, activos, barberos, recepcionistas }
  }, [empleados])

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const getRoleLabel = (rol: Rol) => {
    const labels: Record<Rol, string> = {
      'ADMINISTRADOR': 'Administrador',
      'BARBERO': 'Barbero',
      'RECEPCIONISTA': 'Recepcionista'
    }
    return labels[rol] || rol
  }

  const handleOpenModal = (empleado?: Empleado) => {
    // Recepcionista no puede editar empleados
    if (empleado && !canEdit) {
      return
    }
    if (empleado) {
      setEditingEmpleado(empleado)
      setFormData({
        nombre: empleado.nombre,
        telefono: empleado.telefono || '',
        email: empleado.email || '',
        rol: empleado.rol,
        fecha_contratacion: empleado.fecha_contratacion,
        activo: empleado.activo,
        porcentaje_comision: empleado.porcentaje_comision?.toString() || '',
        especialidad: empleado.especialidad || '',
        password: empleado.password || ''
      })
      setShowPassword(false)
    } else {
      setEditingEmpleado(null)
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        rol: 'BARBERO',
        fecha_contratacion: new Date().toISOString().split('T')[0],
        activo: true,
        porcentaje_comision: '',
        especialidad: '',
        password: ''
      })
      setShowPassword(false)
    }
    setError('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingEmpleado(null)
    setShowPassword(false)
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      rol: 'BARBERO',
      fecha_contratacion: new Date().toISOString().split('T')[0],
      activo: true,
      porcentaje_comision: '',
      especialidad: '',
      password: ''
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    if (formData.rol === 'BARBERO' && formData.porcentaje_comision) {
      const comision = parseFloat(formData.porcentaje_comision)
      if (isNaN(comision) || comision < 0 || comision > 100) {
        setError('El porcentaje de comisión debe ser un número entre 0 y 100')
        return
      }
    }

    const empleadoData: Omit<Empleado, 'id'> = {
      nombre: formData.nombre.trim(),
      telefono: formData.telefono.trim() || undefined,
      email: formData.email.trim() || undefined,
      rol: formData.rol,
      fecha_contratacion: formData.fecha_contratacion,
      activo: formData.activo,
      porcentaje_comision: formData.rol === 'BARBERO' && formData.porcentaje_comision 
        ? parseFloat(formData.porcentaje_comision) 
        : undefined,
      especialidad: formData.rol === 'BARBERO' && formData.especialidad.trim()
        ? formData.especialidad.trim()
        : undefined
    }

    // Incluir password si se proporciona
    if (formData.password.trim()) {
      empleadoData.password = formData.password.trim()
    } else if (!editingEmpleado) {
      // Si se está creando y no hay contraseña, mostrar error
      setError(t('passwordRequeridaEmpleado'))
      return
    }

    if (editingEmpleado) {
      const result = await updateEmpleado(editingEmpleado.id, empleadoData)
      if (result.success) {
        handleCloseModal()
      } else {
        setError(result.error || t('errorActualizarEmpleado'))
      }
    } else {
      const result = await addEmpleado(empleadoData)
      if (result.success) {
        handleCloseModal()
      } else {
        setError(result.error || t('errorCrearEmpleado'))
      }
    }
  }

  return (
    <Layout>
      <div className="empleados-container">
        <div className="empleados-header">
          <div>
            <h1 className="empleados-title">{t('empleadosTitulo')}</h1>
            <p className="empleados-subtitle">{t('empleadosSubtitulo')}</p>
          </div>
          <button className="btn-new" onClick={() => handleOpenModal()}>+ {t('nuevoEmpleado')}</button>
        </div>

        <div className="empleados-stats">
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">{t('totalPersonal')}</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">{t('activo')}</div>
              <div className="stat-value">{stats.activos}</div>
            </div>
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">{t('barberos')}</div>
              <div className="stat-value">{stats.barberos}</div>
            </div>
            <div className="stat-icon">✂️</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">{t('recepcionistas')}</div>
              <div className="stat-value">{stats.recepcionistas}</div>
            </div>
            <div className="stat-icon">👤</div>
          </div>
        </div>

        <div className="empleados-filters">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="filter-input"
              placeholder={t('placeholderBuscarEmpleados')}
              value={searchTerm ?? ''}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="filter-select"
            value={rolFilter}
            onChange={(e) => setRolFilter(e.target.value)}
          >
            <option value="">{t('todosRoles')}</option>
            <option value="ADMINISTRADOR">{t('admin')}</option>
            <option value="BARBERO">{t('barbero')}</option>
            <option value="RECEPCIONISTA">{t('recepcionista')}</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">{t('cargandoEmpleados')}</div>
        ) : (
          <div className="staff-grid">
            {filteredEmpleados.length === 0 ? (
              <div className="empty-state">
                <p>{searchTerm || rolFilter !== 'Todos' ? t('sinResultadosEmpleados') : t('sinEmpleados')}</p>
              </div>
            ) : (
              filteredEmpleados.map((empleado) => (
                <div key={empleado.id} className="staff-card">
                  <div className="staff-header">
                    <div className="staff-avatar">{getInitials(empleado.nombre)}</div>
                    <div className="staff-info">
                      <div className="staff-name">{empleado.nombre}</div>
                      <span className={`staff-role role-${empleado.rol.toLowerCase()}`}>
                        {getRoleLabel(empleado.rol)}
                      </span>
                    </div>
                  </div>
                  <div className="staff-details">
                    {empleado.email && (
                      <div className="detail-row">📧 {empleado.email}</div>
                    )}
                    {empleado.telefono && (
                      <div className="detail-row">📞 {empleado.telefono}</div>
                    )}
                    {empleado.rol === 'BARBERO' && empleado.especialidad && (
                      <div className="detail-row">💼 {t('especialidad')}: {empleado.especialidad}</div>
                    )}
                    {empleado.rol === 'BARBERO' && empleado.porcentaje_comision !== undefined && (
                      <div className="detail-row">💰 {t('porcentajeComision')}: {empleado.porcentaje_comision}%</div>
                    )}
                    <div className="detail-row">
                      <span className={`badge ${empleado.activo ? 'badge-active' : 'badge-inactive'}`}>
                        {empleado.activo ? `✅ ${t('activo')}` : `❌ ${t('inactivo')}`}
                      </span>
                    </div>
                  </div>
                  <div className="staff-actions">
                    {canEdit && (
                      <button 
                        className="btn-icon" 
                        title={t('editar')}
                        onClick={() => handleOpenModal(empleado)}
                      >
                        ✏️
                      </button>
                    )}
                    {canDelete && (
                      <button 
                        className="btn-icon" 
                        title={t('eliminar')}
                        onClick={() => {
                          if (confirm(t('confirmarEliminarEmpleado') || t('confirmarEliminarCliente'))) {
                            deleteEmpleado(empleado.id)
                          }
                        }}
                      >
                        🗑️
                      </button>
                    )}
                    {!canEdit && !canDelete && (
                      <span className="no-actions-hint" title={t('soloPuedesCrear')}>
                        👁️ {t('soloLectura')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal Nuevo/Editar Empleado */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingEmpleado ? t('editarEmpleado') : t('nuevoEmpleado')}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="modal-error">
                    <p>{error}</p>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">{t('nombreCompleto')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('placeholderNombre')}
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('email')}</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder={t('placeholderEmail')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('telefono')}</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder={t('placeholderTelefono')}
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('contrasena')}</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input password-input"
                      placeholder={editingEmpleado ? t('dejarVacioMantener') : t('minimo6Caracteres')}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingEmpleado}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? t('ocultarContrasena') : t('mostrarContrasena')}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <small className="form-hint">
                    {editingEmpleado 
                      ? (editingEmpleado.password 
                          ? `${t('contrasenaActual')}: ${showPassword ? editingEmpleado.password : '••••••••'}`
                          : t('ingresarNuevaContrasena'))
                      : t('ingresarContrasenaNuevoEmpleado')}
                  </small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('rol')} *</label>
                    <select
                      className="form-input"
                      value={formData.rol}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value as Rol })}
                      required
                    >
                      <option value="BARBERO">{t('barbero')}</option>
                      <option value="RECEPCIONISTA">{t('recepcionista')}</option>
                      <option value="ADMINISTRADOR">{t('admin')}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('fechaContratacion')} *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.fecha_contratacion}
                      onChange={(e) => setFormData({ ...formData, fecha_contratacion: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {formData.rol === 'BARBERO' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">{t('porcentajeComision')}</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className="form-input"
                          placeholder="40"
                          value={formData.porcentaje_comision}
                          onChange={(e) => setFormData({ ...formData, porcentaje_comision: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">{t('especialidad')}</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ej: Corte + Barba"
                          value={formData.especialidad}
                          onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    />
                    <span>{t('empleadoActivo')}</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  {t('cancelar')}
                </button>
                <button type="submit" className="btn-save">
                  {editingEmpleado ? t('actualizar') : t('guardar')} {t('empleado') || t('empleados')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}