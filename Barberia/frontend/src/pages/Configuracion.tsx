import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useHorariosStore, Horario, DiaSemana } from '../stores/horariosStore'
import { useConfiguracionStore } from '../stores/configuracionStore'
import { useAuthStore } from '../stores/authStore'
import { useLanguage } from '../hooks/useLanguage'
import './Configuracion.css'

/**
 * VISTA: CONFIGURACIÓN
 * Panel de administración del sistema
 * - Configuración de horarios de trabajo
 * - Información del negocio
 * - Configuración general (moneda, idioma, zona horaria)
 * - Configuración de notificaciones
 */

const DIAS_SEMANA: { value: DiaSemana; label: string }[] = [
  { value: 'LUNES', label: 'lunes' },
  { value: 'MARTES', label: 'martes' },
  { value: 'MIERCOLES', label: 'miércoles' },
  { value: 'JUEVES', label: 'jueves' },
  { value: 'VIERNES', label: 'viernes' },
  { value: 'SABADO', label: 'sábado' },
  { value: 'DOMINGO', label: 'domingo' },
]

export default function Configuracion() {
  const { user } = useAuthStore()
  const { t } = useLanguage()
  const { horarios, loading: horariosLoading, fetchHorarios, saveHorarios, subscribeToRealtimeUpdates: subscribeToHorarios, unsubscribeFromRealtimeUpdates: unsubscribeFromHorarios } = useHorariosStore()
  const { 
    informacionNegocio, 
    configuracionGeneral, 
    configuracionNotificaciones,
    loading: configLoading,
    fetchConfiguracion,
    updateInformacionNegocio,
    updateConfiguracionGeneral,
    updateConfiguracionNotificaciones,
    subscribeToRealtimeUpdates: subscribeToConfiguracion,
    unsubscribeFromRealtimeUpdates: unsubscribeFromConfiguracion
  } = useConfiguracionStore()
  
  const [horariosFormData, setHorariosFormData] = useState<Partial<Record<DiaSemana, { hora_apertura: string; hora_cierre: string; activo: boolean }>>>({})
  const [infoNegocioData, setInfoNegocioData] = useState(informacionNegocio)
  const [configGeneralData, setConfigGeneralData] = useState(configuracionGeneral)
  const [configNotificacionesData, setConfigNotificacionesData] = useState(configuracionNotificaciones)
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<'horarios' | 'negocio' | 'general' | 'notificaciones'>('horarios')

  useEffect(() => {
    fetchHorarios()
    fetchConfiguracion()
  }, [fetchHorarios, fetchConfiguracion])

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    subscribeToHorarios()
    subscribeToConfiguracion()

    return () => {
      unsubscribeFromHorarios()
      unsubscribeFromConfiguracion()
    }
  }, [subscribeToHorarios, unsubscribeFromHorarios, subscribeToConfiguracion, unsubscribeFromConfiguracion])

  useEffect(() => {
    setInfoNegocioData(informacionNegocio)
    setConfigGeneralData(configuracionGeneral)
    setConfigNotificacionesData(configuracionNotificaciones)
  }, [informacionNegocio, configuracionGeneral, configuracionNotificaciones])

  useEffect(() => {
    if (horarios.length > 0) {
      const initialData: Partial<Record<DiaSemana, { hora_apertura: string; hora_cierre: string; activo: boolean }>> = {}
      horarios.forEach(horario => {
        initialData[horario.dia_semana] = {
          hora_apertura: horario.hora_apertura,
          hora_cierre: horario.hora_cierre,
          activo: horario.activo
        }
      })
      // Asegurar que todos los días estén presentes
      DIAS_SEMANA.forEach(dia => {
        if (!initialData[dia.value]) {
          initialData[dia.value] = {
            hora_apertura: '09:00',
            hora_cierre: '18:00',
            activo: dia.value !== 'DOMINGO'
          }
        }
      })
      setHorariosFormData(initialData)
    }
  }, [horarios])

  // Verificar si solo administradores pueden acceder
  if (user?.rol !== 'ADMIN') {
    return (
      <Layout>
        <div className="configuracion-container">
          <div className="access-denied">
            <h2>{t('error')}</h2>
            <p>{t('soloAdminsPueden')}</p>
          </div>
        </div>
      </Layout>
    )
  }

  const handleHorariosChange = (dia: DiaSemana, field: 'hora_apertura' | 'hora_cierre' | 'activo', value: string | boolean) => {
    setHorariosFormData(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [field]: value
      }
    }))
    setHasChanges(true)
    setError('')
    setSuccess('')
  }

  const handleApplyToAll = (dia: DiaSemana) => {
    const horario = horariosFormData[dia]
    if (!horario) return
    const newData: Partial<Record<DiaSemana, { hora_apertura: string; hora_cierre: string; activo: boolean }>> = { ...horariosFormData }
    DIAS_SEMANA.forEach(d => {
      newData[d.value] = {
        hora_apertura: horario.hora_apertura,
        hora_cierre: horario.hora_cierre,
        activo: d.value === dia ? horario.activo : horariosFormData[d.value]?.activo ?? true
      }
    })
    setHorariosFormData(newData)
    setHasChanges(true)
  }

  const handleHorariosSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validar que las horas de cierre sean después de las de apertura
    for (const dia of DIAS_SEMANA) {
      const horario = horariosFormData[dia.value]
      if (horario && horario.activo) {
        if (horario.hora_apertura >= horario.hora_cierre) {
          setError(`El horario de ${dia.label} no es válido. La hora de cierre debe ser posterior a la hora de apertura.`)
          return
        }
      }
    }

    const horariosToSave: Horario[] = DIAS_SEMANA.map((dia, index) => ({
      id: horarios.find(h => h.dia_semana === dia.value)?.id || `temp-${index}`,
      dia_semana: dia.value,
      hora_apertura: horariosFormData[dia.value]?.hora_apertura || '09:00',
      hora_cierre: horariosFormData[dia.value]?.hora_cierre || '20:00',
      activo: horariosFormData[dia.value]?.activo ?? true
    }))

    const result = await saveHorarios(horariosToSave)
    if (result.success) {
      setSuccess(t('horariosGuardadosCorrectamente'))
      setHasChanges(false)
      // Recargar los horarios para actualizar la UI
      fetchHorarios()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || t('errorGuardarHorarios'))
    }
  }

  const handleInfoNegocioSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!infoNegocioData.nombre.trim()) {
      setError(t('nombreDelNegocioRequerido'))
      return
    }

    const result = await updateInformacionNegocio(infoNegocioData)
    if (result.success) {
      setSuccess(t('informacionGuardada'))
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || 'Error al guardar la información')
    }
  }

  const handleConfigGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const result = await updateConfiguracionGeneral(configGeneralData)
    if (result.success) {
      setSuccess(t('configGeneralGuardada'))
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || 'Error al guardar la configuración')
    }
  }

  const handleConfigNotificacionesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const result = await updateConfiguracionNotificaciones(configNotificacionesData)
    if (result.success) {
      setSuccess(t('configNotificacionesGuardada'))
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || 'Error al guardar la configuración')
    }
  }

  const handleReset = () => {
    if (confirm(t('estasSeguroRestaurar'))) {
      const defaultData: Partial<Record<DiaSemana, { hora_apertura: string; hora_cierre: string; activo: boolean }>> = {}
      DIAS_SEMANA.forEach(dia => {
        defaultData[dia.value] = {
          hora_apertura: dia.value === 'DOMINGO' ? '10:00' : '09:00',
          hora_cierre: dia.value === 'DOMINGO' ? '16:00' : dia.value === 'SABADO' ? '18:00' : '20:00',
          activo: dia.value !== 'DOMINGO'
        }
      })
      setHorariosFormData(defaultData)
      setHasChanges(true)
      setError('')
      setSuccess('')
    }
  }

  return (
    <Layout>
      <div className="configuracion-container">
        <div className="configuracion-header">
          <div>
            <h1 className="configuracion-title">⚙️ {t('configuracion')}</h1>
            <p className="configuracion-subtitle">{t('administraLaInformacion')}</p>
          </div>
        </div>

        <div className="configuracion-content">
          {/* Tabs de Navegación */}
          <div className="config-tabs">
            <button
              className={`config-tab ${activeTab === 'horarios' ? 'active' : ''}`}
              onClick={() => setActiveTab('horarios')}
            >
               {t('horariosDeTrabajos')}
            </button>
            <button
              className={`config-tab ${activeTab === 'negocio' ? 'active' : ''}`}
              onClick={() => setActiveTab('negocio')}
            >
               {t('informacionNegocio')}
            </button>
            <button
              className={`config-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
               {t('configuracionGeneral')}
            </button>
            <button
              className={`config-tab ${activeTab === 'notificaciones' ? 'active' : ''}`}
              onClick={() => setActiveTab('notificaciones')}
            >
               {t('notificaciones')}
            </button>
          </div>

          {/* Sección: Horarios de Trabajo */}
          {activeTab === 'horarios' && (
            <div className="config-section">
              <div className="section-header">
                <h2 className="section-title"> {t('horariosDeTrabajos')}</h2>
                <p className="section-description">
                  {t('configuraLasHoras')}
                </p>
              </div>

              {(horariosLoading || configLoading) ? (
                <div className="loading-state">{t('cargandoDatos')}</div>
              ) : (
                <form onSubmit={handleHorariosSubmit}>
                  {error && (
                    <div className="alert alert-error">
                      <p>{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="alert alert-success">
                      <p>{success}</p>
                    </div>
                  )}

                  <div className="horarios-table">
                    <div className="table-header-row">
                      <div className="table-cell header-cell">{t('tableDia')}</div>
                      <div className="table-cell header-cell">{t('tableApertura')}</div>
                      <div className="table-cell header-cell">{t('tableCierre')}</div>
                      <div className="table-cell header-cell">{t('tableEstado')}</div>
                      <div className="table-cell header-cell">{t('tableAcciones')}</div>
                    </div>

                    {DIAS_SEMANA.map(dia => {
                      const horario = horariosFormData[dia.value]
                      if (!horario) return null

                      return (
                        <div key={dia.value} className={`table-row ${!horario.activo ? 'inactive' : ''}`}>
                          <div className="table-cell">
                            <div className="dia-label">
                              <strong>{dia.label}</strong>
                            </div>
                          </div>
                          <div className="table-cell">
                            <input
                              type="time"
                              className="time-input"
                              value={horario.hora_apertura}
                              onChange={(e) => handleHorariosChange(dia.value, 'hora_apertura', e.target.value)}
                              disabled={!horario.activo}
                            />
                          </div>
                          <div className="table-cell">
                            <input
                              type="time"
                              className="time-input"
                              value={horario.hora_cierre}
                              onChange={(e) => handleHorariosChange(dia.value, 'hora_cierre', e.target.value)}
                              disabled={!horario.activo}
                            />
                          </div>
                          <div className="table-cell">
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={horario.activo}
                                onChange={(e) => handleHorariosChange(dia.value, 'activo', e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                              <span className="toggle-label">
                                {horario.activo ? t('abierto') : t('cerrado')}
                              </span>
                            </label>
                          </div>
                          <div className="table-cell">
                            <button
                              type="button"
                              className="btn-apply"
                              onClick={() => handleApplyToAll(dia.value)}
                              title={t('aplicarEsteHorario')}
                            >
                              {t('aplicarATodos')}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-reset"
                      onClick={handleReset}
                    >
                       {t('restaurarPredeterminados')}
                    </button>
                    <button
                      type="submit"
                      className="btn-save"
                      disabled={!hasChanges}
                    >
                      {t('guardarHorarios')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Sección: Información del Negocio */}
          {activeTab === 'negocio' && (
            <div className="config-section config-negocio">
              <div className="section-header">
                <h2 className="section-title"> {t('informacionNegocioTabla')}</h2>
                <p className="section-description">
                  {t('administraLaInformacion')}
                </p>
              </div>

              <form onSubmit={handleInfoNegocioSubmit}>
                {error && (
                  <div className="alert alert-error">
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success">
                    <p>{success}</p>
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{t('nombreDelNegocio')} *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={infoNegocioData.nombre}
                      onChange={(e) => setInfoNegocioData({ ...infoNegocioData, nombre: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('telefono')} *</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={infoNegocioData.telefono}
                      onChange={(e) => setInfoNegocioData({ ...infoNegocioData, telefono: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('email')} *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={infoNegocioData.email}
                      onChange={(e) => setInfoNegocioData({ ...infoNegocioData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('direccion')} *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={infoNegocioData.direccion}
                      onChange={(e) => setInfoNegocioData({ ...infoNegocioData, direccion: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">{t('descripcion')} (Opcional)</label>
                    <textarea
                      className="form-textarea"
                      rows={4}
                      value={infoNegocioData.descripcion || ''}
                      onChange={(e) => setInfoNegocioData({ ...infoNegocioData, descripcion: e.target.value })}
                      placeholder={t('descripcionBreve')}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    {t('guardarInformacion')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sección: Configuración General */}
          {activeTab === 'general' && (
            <div className="config-section config-general">
              <div className="section-header">
                <h2 className="section-title"> {t('configurationGeneral')}</h2>
                <p className="section-description">
                  {t('configurarPreferencias')}
                </p>
              </div>

              <form onSubmit={handleConfigGeneralSubmit}>
                {error && (
                  <div className="alert alert-error">
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success">
                    <p>{success}</p>
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{t('monedaEtiqueta')}</label>
                    <select
                      className="form-input"
                      value={configGeneralData.moneda}
                      onChange={(e) => setConfigGeneralData({ ...configGeneralData, moneda: e.target.value })}
                      required
                    >
                      <option value="USD">USD ($)</option>
                      <option value="MXN">MXN ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="COP">COP ($)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('formatoFechaEtiqueta')}</label>
                    <select
                      className="form-input"
                      value={configGeneralData.formato_fecha}
                      onChange={(e) => setConfigGeneralData({ ...configGeneralData, formato_fecha: e.target.value })}
                      required
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (Ej: 15/01/2026)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (Ej: 01/15/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (Ej: 2026-01-15)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('zonaHorariaEtiqueta')}</label>
                    <select
                      className="form-input"
                      value={configGeneralData.zona_horaria}
                      onChange={(e) => setConfigGeneralData({ ...configGeneralData, zona_horaria: e.target.value })}
                      required
                    >
                      <option value="America/Mexico_City">México (GMT-6)</option>
                      <option value="America/New_York">Nueva York (GMT-5)</option>
                      <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                      <option value="America/Bogota">Bogotá (GMT-5)</option>
                      <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('idiomaEtiqueta')}</label>
                    <select
                      className="form-input"
                      value={configGeneralData.idioma}
                      onChange={(e) => setConfigGeneralData({ ...configGeneralData, idioma: e.target.value })}
                      required
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    {t('guardarConfiguracion')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sección: Configuración de Notificaciones */}
          {activeTab === 'notificaciones' && (
            <div className="config-section config-notificaciones">
              <div className="section-header">
                <h2 className="section-title"> {t('configNotificaciones')}</h2>
                <p className="section-description">
                  {t('configurarNotificaciones')}
                </p>
              </div>

              <form onSubmit={handleConfigNotificacionesSubmit}>
                {error && (
                  <div className="alert alert-error">
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success">
                    <p>{success}</p>
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-checkbox-label">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={configNotificacionesData.recordatorio_citas}
                        onChange={(e) => setConfigNotificacionesData({ ...configNotificacionesData, recordatorio_citas: e.target.checked })}
                      />
                      <span>{t('enviarRecordatoriosCitas')}</span>
                    </label>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-checkbox-label">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={configNotificacionesData.confirmacion_automatica}
                        onChange={(e) => setConfigNotificacionesData({ ...configNotificacionesData, confirmacion_automatica: e.target.checked })}
                      />
                      <span>{t('confirmacionAutomatica')}</span>
                    </label>
                  </div>

                  {configNotificacionesData.recordatorio_citas && (
                    <div className="form-group">
                      <label className="form-label">{t('recordatorioHoras')} *</label>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        className="form-input"
                        value={configNotificacionesData.recordatorio_horas_antes}
                        onChange={(e) => setConfigNotificacionesData({ ...configNotificacionesData, recordatorio_horas_antes: parseInt(e.target.value) || 24 })}
                        required
                      />
                      <small className="form-hint">{t('horasAntesLaCita')}</small>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    {t('guardarConfiguracion')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
