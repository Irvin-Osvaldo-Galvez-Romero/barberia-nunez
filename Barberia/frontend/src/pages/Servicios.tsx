import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { useServiciosStore, Servicio } from '../stores/serviciosStore'
import { useAuthStore } from '../stores/authStore'
import { useLanguage } from '../hooks/useLanguage'
import './Servicios.css'

/**
 * VISTA: SERVICIOS
 * Gestión de servicios de la barbería
 * - Listar, crear, editar y eliminar servicios
 * - Estadísticas y búsqueda
 */
export default function Servicios() {
  const { user } = useAuthStore()
  const {
    servicios, 
    loading, 
    searchTerm, 
    categoriaFilter,
    fetchServicios, 
    setSearchTerm, 
    setCategoriaFilter,
    deleteServicio, 
    addServicio, 
    updateServicio,
    subscribeToRealtimeUpdates,
    unsubscribeFromRealtimeUpdates
  } = useServiciosStore()
  const { t } = useLanguage()
  
  // Permisos: Recepcionista puede crear y editar, pero no eliminar
  const canDelete = user?.rol !== 'RECEPCIONISTA'
  
  const [showModal, setShowModal] = useState(false)
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion: '',
    categoria: 'Corte',
    activo: true
  })
  const [error, setError] = useState('')

  // Cargar servicios solo una vez al montar el componente
  useEffect(() => {
    if (servicios.length === 0 && !loading) {
      fetchServicios()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Suscribirse a cambios en tiempo real de servicios
  useEffect(() => {
    subscribeToRealtimeUpdates()

    return () => {
      unsubscribeFromRealtimeUpdates()
    }
  }, [subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates])

  const filteredServicios = useMemo(() => {
    let filtered = servicios

    // Filtro por categoría
    if (categoriaFilter && categoriaFilter !== 'Todas') {
      filtered = filtered.filter(s => s.categoria === categoriaFilter)
    }

    // Filtro por búsqueda
    const term = (searchTerm || '').trim()
    if (term) {
      const lowerTerm = term.toLowerCase()
      filtered = filtered.filter(servicio =>
        servicio.nombre.toLowerCase().includes(lowerTerm) ||
        servicio.descripcion?.toLowerCase().includes(lowerTerm) ||
        servicio.categoria.toLowerCase().includes(lowerTerm)
      )
    }

    return filtered
  }, [servicios, searchTerm, categoriaFilter])

  const stats = useMemo(() => {
    const total = servicios.length
    const activos = servicios.filter(s => s.activo).length
    const avgPrice = total > 0 
      ? (servicios.reduce((sum, s) => sum + s.precio, 0) / total).toFixed(2)
      : '0.00'
    const avgDuration = total > 0
      ? Math.round(servicios.reduce((sum, s) => sum + s.duracion, 0) / total)
      : 0

    return { total, activos, avgPrice, avgDuration }
  }, [servicios])

  const categorias = useMemo(() => {
    const cats = Array.from(new Set(servicios.map(s => s.categoria)))
    return cats.sort()
  }, [servicios])

  const getServiceIcon = (categoria: string) => {
    if (categoria === 'Corte') return '✂️'
    if (categoria === 'Barba') return '🪒'
    if (categoria === 'Tinte') return '🎨'
    return '💇'
  }

  const handleOpenModal = (servicio?: Servicio) => {
    if (servicio) {
      setEditingServicio(servicio)
      setFormData({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || '',
        precio: servicio.precio.toString(),
        duracion: servicio.duracion.toString(),
        categoria: servicio.categoria,
        activo: servicio.activo
      })
    } else {
      setEditingServicio(null)
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        duracion: '',
        categoria: 'Corte',
        activo: true
      })
    }
    setError('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingServicio(null)
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      duracion: '',
      categoria: 'Corte',
      activo: true
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

    const precio = parseFloat(formData.precio)
    const duracion = parseInt(formData.duracion)

    if (isNaN(precio) || precio <= 0) {
      setError('El precio debe ser un número válido mayor a 0')
      return
    }

    if (isNaN(duracion) || duracion <= 0) {
      setError('La duración debe ser un número válido mayor a 0')
      return
    }

    const servicioData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      precio,
      duracion,
      categoria: formData.categoria,
      activo: formData.activo
    }

    if (editingServicio) {
      const result = await updateServicio(editingServicio.id, servicioData)
      if (result.success) {
        handleCloseModal()
      } else {
        setError(result.error || t('errorActualizarServicio'))
      }
    } else {
      const result = await addServicio(servicioData)
      if (result.success) {
        handleCloseModal()
      } else {
        setError(result.error || t('errorCrearServicio'))
      }
    }
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  return (
    <Layout>
      <div className="servicios-container">
        <div className="servicios-header">
          <div>
            <h1 className="servicios-title">{t('serviciosTitulo')}</h1>
            <p className="servicios-subtitle">{t('serviciosSubtitulo')}</p>
          </div>
          <button className="btn-new" onClick={() => handleOpenModal()}>+ {t('nuevoServicio')}</button>
        </div>

        <div className="servicios-stats">
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">{t('totalServiciosLabel')}</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-icon">✂️</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">{t('precioPromedio')}</div>
              <div className="stat-value">{formatPrice(parseFloat(stats.avgPrice))}</div>
            </div>
            <div className="stat-icon">💰</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">{t('duracionPromedio')}</div>
              <div className="stat-value">{stats.avgDuration} min</div>
            </div>
            <div className="stat-icon">⏱️</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">{t('resultados')}</div>
              <div className="stat-value">{filteredServicios.length}</div>
            </div>
            <div className="stat-icon">📊</div>
          </div>
        </div>

        <div className="servicios-filters">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="filter-input"
              placeholder={t('placeholderBuscarServicios')}
              value={searchTerm ?? ''}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="filter-select"
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
          >
            <option value="">{t('todasCategorias')}</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-state">{t('cargandoServicios')}</div>
        ) : (
          <div className="services-grid">
            {filteredServicios.length === 0 ? (
              <div className="empty-state">
                <p>{searchTerm || categoriaFilter !== 'Todas' ? t('sinResultadosServicios') : t('sinServicios')}</p>
              </div>
            ) : (
              filteredServicios.map((servicio) => (
                <div key={servicio.id} className="service-card">
                  <div className="service-header">
                    <div className="service-icon">{getServiceIcon(servicio.categoria)}</div>
                    <div className="service-title">
                      <div className="service-name">{servicio.nombre}</div>
                      <span className="service-category">{servicio.categoria}</span>
                    </div>
                  </div>
                  <div className="service-details">
                    <div className="detail-item">
                      <span className="detail-label">💰 {t('precioLabel')}</span>
                      <span className="detail-value">{formatPrice(servicio.precio)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">⏱️ {t('duracionLabel')}</span>
                      <span className="detail-value">{servicio.duracion} min</span>
                    </div>
                  </div>
                  {servicio.descripcion && (
                    <div className="service-description">
                      {servicio.descripcion}
                    </div>
                  )}
                  <div className="service-actions">
                    <button 
                      className="btn-icon" 
                      title={t('editar')}
                      onClick={() => handleOpenModal(servicio)}
                    >
                      ✏️
                    </button>
                    {canDelete && (
                      <button 
                        className="btn-icon" 
                        title={t('eliminar')}
                        onClick={() => {
                          if (confirm(t('confirmarEliminarServicio'))) {
                            deleteServicio(servicio.id)
                          }
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal Nuevo/Editar Servicio */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingServicio ? t('editarServicio') : t('nuevoServicio')}</h2>
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
                  <label className="form-label">{t('nombreServicio')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('placeholderServicioNombre')}
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('categoria')} *</label>
                  <select
                    className="form-input"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                  >
                    <option value="Corte">Corte</option>
                    <option value="Barba">Barba</option>
                    <option value="Tinte">Tinte</option>
                    <option value="Tratamiento">Tratamiento</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('precioLabel')} ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      placeholder={t('placeholderPrecio')}
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('duracionLabel')} (min) *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      placeholder={t('placeholderDuracion')}
                      value={formData.duracion}
                      onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('descripcionServicio')}</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder={t('placeholderDescripcionServicio')}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    />
                    <span>{t('servicioActivo')}</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  {t('cancelar')}
                </button>
                <button type="submit" className="btn-save">
                  {editingServicio ? t('actualizar') : t('guardar')} {t('servicio') || t('servicios')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}