import { useEffect, useMemo, useState, useCallback } from 'react'
import Layout from '../components/Layout'
import { useClientesStore, Cliente } from '../stores/clientesStore'
import { useAuthStore } from '../stores/authStore'
import { useLanguage } from '../hooks/useLanguage'
import './Clientes.css'

/**
 * VISTA: CLIENTES
 * Gestión de clientes de la barbería
 * - Listar, crear, editar y eliminar clientes
 * - Búsqueda y estadísticas
 */
export default function Clientes() {
  const { user } = useAuthStore()
  const { clientes, loading, searchTerm, fetchClientes, setSearchTerm, deleteCliente, addCliente, updateCliente, subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates } = useClientesStore()
  const { t } = useLanguage()
  
  // Permisos: Recepcionista puede crear y editar, pero no eliminar
  const canDelete = user?.rol !== 'RECEPCIONISTA'
  const [showModal, setShowModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    notas: ''
  })
  const [error, setError] = useState('')

  // Cargar clientes solo una vez al montar el componente
  useEffect(() => {
    if (clientes.length === 0 && !loading) {
      fetchClientes()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Suscribirse a cambios en tiempo real de clientes
  useEffect(() => {
    subscribeToRealtimeUpdates()

    return () => {
      unsubscribeFromRealtimeUpdates()
    }
  }, [subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates])

  const filteredClientes = useMemo(() => {
    const term = (searchTerm || '').trim()
    if (!term) return clientes

    const lowerTerm = term.toLowerCase()
    const filtered = clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(lowerTerm) ||
      cliente.telefono.toLowerCase().includes(lowerTerm) ||
      (cliente.email && cliente.email.toLowerCase().includes(lowerTerm))
    )
    return filtered
  }, [clientes, searchTerm])

  const stats = useMemo(() => {
    const total = clientes.length
    const activos = clientes.filter(c => c.activo).length
    const totalVisits = clientes.reduce((sum, c) => sum + c.visitas, 0)
    const avgVisits = total > 0 ? (totalVisits / total).toFixed(1) : '0'

    return { total, activos, totalVisits, avgVisits }
  }, [clientes])

  const getVisitsBadge = (visitas: number) => {
    if (visitas >= 20) return { text: t('clienteVipBadge'), class: 'visits-frequent' }
    if (visitas >= 10) return { text: t('clienteFrecuenteBadge'), class: 'visits-frequent' }
    if (visitas >= 5) return { text: t('clienteRegularBadge'), class: 'visits-regular' }
    if (visitas > 0) return { text: t('clienteNuevoBadge'), class: 'visits-new' }
    return null
  }

  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-')
      return `${day}/${month}/${year}`
    } catch {
      return dateString
    }
  }

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente)
      setFormData({
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email || '',
        notas: cliente.notas || ''
      })
    } else {
      setEditingCliente(null)
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        notas: ''
      })
    }
    setError('')
    setShowModal(true)
  }

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setEditingCliente(null)
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      notas: ''
    })
    setError('')
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      setError('Nombre y teléfono son requeridos')
      return
    }

    const clienteData = {
      nombre: formData.nombre.trim(),
      telefono: formData.telefono.trim(),
      email: formData.email.trim() || undefined,
      notas: formData.notas.trim() || undefined,
      fecha_registro: editingCliente?.fecha_registro || new Date().toISOString().split('T')[0],
      activo: editingCliente?.activo ?? true
    }

    if (editingCliente) {
      const result = await updateCliente(editingCliente.id, clienteData)
      if (result.success) {
        handleCloseModal()
      } else {
        setError(result.error || t('guardandoClienteError'))
      }
    } else {
      const result = await addCliente(clienteData)
      if (result.success) {
        handleCloseModal()
      } else {
        setError(result.error || t('guardandoClienteError'))
      }
    }
  }, [formData, editingCliente, updateCliente, addCliente, handleCloseModal, t])

  return (
    <Layout>
      <div className="clientes-container">
        <div className="clientes-header">
          <div>
            <h1>{t('clientesTitulo')}</h1>
            <p className="subtitle">{t('clientesSubtitulo')}</p>
          </div>
          <button className="btn-new" onClick={() => handleOpenModal()}>+ {t('nuevoCliente')}</button>
        </div>

        <div className="stats">
          <div className="stat-card">
            <div className="stat-label">{t('totalClientes')}</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t('clientesActivos')}</div>
            <div className="stat-value">{stats.activos}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t('visitasTotales')}</div>
            <div className="stat-value">{stats.totalVisits}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t('visitasPromedio')}</div>
            <div className="stat-value">{stats.avgVisits}</div>
          </div>
        </div>

        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder={t('placeholderBuscarClientes')}
              value={searchTerm ?? ''}
              onChange={(e) => {
                setSearchTerm(e.target.value)
              }}
            />
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">
            👥 Clients List
          </div>
          {loading ? (
            <div className="loading-state">{t('cargandoClientes')}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{t('cliente')}</th>
                  <th>{t('contacto') || 'Contacto'}</th>
                  <th>{t('registro') || 'Registro'}</th>
                  <th>{t('visitasTotales')}</th>
                  <th>{t('estado') || 'Estado'}</th>
                  <th style={{ textAlign: 'right' }}>{t('acciones') || 'Acciones'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      {searchTerm ? t('sinResultadosClientes') : t('sinClientes')}
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cliente) => {
                    const badge = getVisitsBadge(cliente.visitas)
                    return (
                      <tr key={cliente.id}>
                        <td>
                          <div className="client-info">
                            <div className="avatar-small">{getInitials(cliente.nombre)}</div>
                            <div>
                              <div className="client-name">{cliente.nombre}</div>
                              {cliente.notas && (
                                <div className="contact-info">{cliente.notas}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">📞 {cliente.telefono}</div>
                          {cliente.email && (
                            <div className="contact-info">📧 {cliente.email}</div>
                          )}
                        </td>
                        <td>
                          <div className="contact-info">{formatDate(cliente.fecha_registro)}</div>
                        </td>
                        <td>
                          <div className="visits-info">
                            <div className="visits-count">
                              <span>{cliente.visitas}</span>
                              <span className="visits-label">{cliente.visitas === 1 ? (t('visita') || 'visita') : (t('visitas') || 'visitas')}</span>
                            </div>
                            {badge && (
                              <span className={`visits-badge ${badge.class}`}>{badge.text}</span>
                            )}
                            {cliente.ultima_visita && (
                              <div className="last-visit">{t('ultimaVisita') || 'Última'}: {formatDate(cliente.ultima_visita)}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${cliente.activo ? 'badge-active' : ''}`}>
                            {cliente.activo ? `✅ ${t('activo')}` : `❌ ${t('inactivo')}`}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="actions">
                            <button 
                              className="btn-icon" 
                              title={t('editar')}
                              onClick={() => handleOpenModal(cliente)}
                            >
                              ✏️
                            </button>
                            {canDelete && (
                              <button 
                                className="btn-icon" 
                                title={t('eliminar')}
                                onClick={() => {
                                  if (confirm(t('confirmarEliminarCliente'))) {
                                    deleteCliente(cliente.id)
                                  }
                                }}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Nuevo/Editar Cliente */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCliente ? t('editarClienteModal') : t('nuevoClienteModal')}</h2>
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

                <div className="form-group">
                  <label className="form-label">{t('telefono')} *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder={t('placeholderTelefono') || 'Ej: 555-1234'}
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('email')} ({t('opcional') || 'Opcional'})</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder={t('placeholderEmailRegistro')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('notas') || 'Notas'} ({t('opcional') || 'Opcional'})</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder={t('placeholderNotasCliente') || 'Agregar notas adicionales sobre el cliente...'}
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  {t('cancelar')}
                </button>
                <button type="submit" className="btn-save">
                  {editingCliente ? t('actualizar') : t('guardar')} {t('cliente')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}