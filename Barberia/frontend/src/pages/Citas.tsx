import { useEffect, useMemo, useState } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import Layout from '../components/Layout'
import { useCitasStore, Cita, EstadoCita } from '../stores/citasStore'
import { useClientesStore, Cliente } from '../stores/clientesStore'
import { useEmpleadosStore } from '../stores/empleadosStore'
import { useServiciosStore } from '../stores/serviciosStore'
import { useHorariosStore, DiaSemana } from '../stores/horariosStore'
import { useAuthStore } from '../stores/authStore'
import { useLanguage } from '../hooks/useLanguage'
import './Citas.css'

/**
 * VISTA: CITAS
 * Gestión y visualización de citas
 * - Calendario semanal con horarios
 * - Creación, edición y cancelación de citas
 * - Asignación de barberos y servicios
 */

const SLOT_HEIGHT = 80

export default function Citas() {
  const { user } = useAuthStore()
  const { t, idioma } = useLanguage()
  const { citas, loading, currentDate, fetchCitas, setCurrentDate, addCita, updateCita, deleteCita, subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates } = useCitasStore()
  const { clientes, fetchClientes, addCliente } = useClientesStore()
  const { empleados, fetchEmpleados } = useEmpleadosStore()
  const { servicios, fetchServicios } = useServiciosStore()
  const { horarios, fetchHorarios } = useHorariosStore()

  const [showModal, setShowModal] = useState(false)
  const [showReadOnlyModal, setShowReadOnlyModal] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [showClientList, setShowClientList] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null)
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    barbero_id: '',
    servicios: [] as string[],
    notas: '',
    estado: 'PENDIENTE' as EstadoCita
  })
  const [newClientData, setNewClientData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fecha_registro: new Date().toISOString(),
    activo: true
  })
  const [error, setError] = useState('')
  const [selectedBarberoFilter, setSelectedBarberoFilter] = useState<string>('')

  // Función para convertir día de la semana a enum (debe estar antes de su uso)
  const getDiaSemana = (date: Date): DiaSemana => {
    const dayOfWeek = date.getDay()
    const dias: DiaSemana[] = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']
    return dias[dayOfWeek]
  }

  // Obtener el empleado actual si el usuario es barbero
  const currentBarbero = useMemo(() => {
    if (user?.rol === 'BARBERO') {
      // Buscar el empleado por email
      return empleados.find(e => e.email?.toLowerCase() === user.email.toLowerCase() && e.rol === 'BARBERO')
    }
    return null
  }, [user, empleados])

  // Calcular semana actual (solo días activos)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = useMemo(() => {
    const allDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    // Si no hay horarios configurados, mostrar todos los días
    if (!horarios || horarios.length === 0) {
      return allDays
    }
    // Filtrar solo los días activos según la configuración
    const filtered = allDays.filter(day => {
      const diaSemana = getDiaSemana(day)
      const horario = horarios.find(h => h.dia_semana === diaSemana)
      // Si no hay horario configurado para este día, mostrarlo por defecto
      return horario ? horario.activo === true : true
    })
    // Si después del filtro no hay días, mostrar todos (fallback)
    return filtered.length > 0 ? filtered : allDays
  }, [weekStart, horarios])

  // Convertir weekStart a timestamp para usar como dependencia estable
  const weekStartTimestamp = weekStart.getTime()

  // Cargar datos básicos solo una vez o cuando estén vacíos
  useEffect(() => {
    if (clientes.length === 0 && !loading) {
      fetchClientes()
    }
    if (empleados.length === 0 && !loading) {
      fetchEmpleados()
    }
    if (servicios.length === 0 && !loading) {
      fetchServicios()
    }
    if (horarios.length === 0 && !loading) {
      fetchHorarios()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cargar citas cuando cambie la semana
  useEffect(() => {
    const startDate = weekStart
    const endDate = addDays(weekStart, 7)
    fetchCitas(startDate, endDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartTimestamp])

  // Suscribirse a cambios en tiempo real de citas
  useEffect(() => {
    subscribeToRealtimeUpdates()
    
    return () => {
      unsubscribeFromRealtimeUpdates()
    }
  }, [subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates])

  const barberos = useMemo(() => {
    return empleados.filter(e => e.rol === 'BARBERO' && e.activo)
  }, [empleados])

  const filteredClients = useMemo(() => {
    const term = clientSearch.toLowerCase()
    const filtered = clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(term) ||
      cliente.telefono?.toLowerCase().includes(term) ||
      cliente.email?.toLowerCase().includes(term)
    )
    return filtered.slice(0, 5)
  }, [clientes, clientSearch])

  // Función para obtener horas disponibles para un día
  const getHorasDisponibles = (day: Date): number[] => {
    const diaSemana = getDiaSemana(day)
    const horario = horarios.find(h => h.dia_semana === diaSemana)
    
    // Si no hay horario configurado o el día está cerrado, retornar array vacío
    if (!horario || !horario.activo) {
      return []
    }

    // Parsear horas de apertura y cierre
    const [horaApertura] = horario.hora_apertura.split(':').map(Number)
    const [horaCierre] = horario.hora_cierre.split(':').map(Number)

    // Generar array de horas disponibles (incluyendo la hora de cierre)
    const horas: number[] = []
    let horaActual = horaApertura

    // Incluir todas las horas desde apertura hasta cierre (incluyendo la hora de cierre)
    while (horaActual <= horaCierre) {
      horas.push(horaActual)
      horaActual++
    }

    return horas
  }

  // Obtener todas las horas únicas de todos los días de la semana
  const allHours = useMemo(() => {
    const getHorasDisponiblesMemo = (day: Date): number[] => {
      const diaSemana = getDiaSemana(day)
      const horario = horarios.find(h => h.dia_semana === diaSemana)
      
      if (!horario || !horario.activo) {
        return []
      }

      const [horaApertura] = horario.hora_apertura.split(':').map(Number)
      const [horaCierre] = horario.hora_cierre.split(':').map(Number)

      const horas: number[] = []
      let horaActual = horaApertura

      // Incluir todas las horas desde apertura hasta cierre (incluyendo la hora de cierre)
      while (horaActual <= horaCierre) {
        horas.push(horaActual)
        horaActual++
      }

      return horas
    }

    const horasSet = new Set<number>()
    weekDays.forEach(day => {
      const horas = getHorasDisponiblesMemo(day)
      horas.forEach(h => horasSet.add(h))
    })
    // Si no hay horarios configurados, usar horarios por defecto
    if (horasSet.size === 0) {
      return [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    }
    return Array.from(horasSet).sort((a, b) => a - b)
  }, [weekDays, horarios])

  // Función para verificar si un día está cerrado
  const isDiaCerrado = (day: Date): boolean => {
    const diaSemana = getDiaSemana(day)
    const horario = horarios.find(h => h.dia_semana === diaSemana)
    return !horario || !horario.activo
  }

  // Filtrar citas según el barbero seleccionado o el barbero actual
  const filteredCitas = useMemo(() => {
    // Si el usuario es barbero, solo mostrar sus citas
    if (user?.rol === 'BARBERO' && currentBarbero) {
      return citas.filter(cita => String(cita.barbero_id) === String(currentBarbero.id))
    }
    // Si hay un filtro manual seleccionado, usar ese
    if (selectedBarberoFilter && selectedBarberoFilter !== '') {
      return citas.filter(cita => String(cita.barbero_id) === String(selectedBarberoFilter))
    }
    // Si no hay filtro, mostrar todas
    return citas
  }, [citas, selectedBarberoFilter, user, currentBarbero])

  const getCitasForSlot = (day: Date, hour: number) => {
    // Crear fecha de inicio del slot en hora local
    const slotStart = new Date(day)
    slotStart.setHours(hour, 0, 0, 0)
    
    return filteredCitas.filter(cita => {
      // Parsear el formato local literal (YYYY-MM-DDTHH:mm:ss)
      let citaDate: Date
      if (cita.fecha_hora.includes('T')) {
        const [datePart, timePart] = cita.fecha_hora.split('T')
        const [parsedYear, parsedMonth, parsedDay] = datePart.split('-').map(Number)
        const [parsedHour, parsedMinute] = timePart.split(':').map(Number)
        citaDate = new Date(parsedYear, parsedMonth - 1, parsedDay, parsedHour, parsedMinute, 0, 0)
      } else {
        citaDate = new Date(cita.fecha_hora)
      }
      
      const citaYear = citaDate.getFullYear()
      const citaMonth = citaDate.getMonth()
      const citaDay = citaDate.getDate()
      const citaHour = citaDate.getHours()
      
      const slotYear = slotStart.getFullYear()
      const slotMonth = slotStart.getMonth()
      const slotDay = slotStart.getDate()
      
      const matches = citaYear === slotYear && 
             citaMonth === slotMonth && 
             citaDay === slotDay && 
             citaHour === hour
      
      if (cita.cliente_nombre) {
        console.log(`Cita ${cita.cliente_nombre}: ${cita.fecha_hora}`)
        console.log(`  Parsed: ${citaYear}-${String(citaMonth+1).padStart(2,'0')}-${String(citaDay).padStart(2,'0')} @ ${citaHour}:00`)
        console.log(`  Slot: ${slotYear}-${String(slotMonth+1).padStart(2,'0')}-${String(slotDay).padStart(2,'0')} @ ${hour}:00`)
        console.log(`  Match: ${matches}`)
      }
      
      return matches
    })
  }

  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1))
  }

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1))
  }

  const handleOpenModal = (day?: Date, hour?: number) => {
    setSelectedCita(null)
    setSelectedClient(null)
    setClientSearch('')
    setShowClientList(false)
    setFormData({
      fecha: day ? format(day, 'yyyy-MM-dd') : format(currentDate, 'yyyy-MM-dd'),
      hora: hour !== undefined ? `${hour.toString().padStart(2, '0')}:00` : '10:00',
      barbero_id: barberos[0]?.id || '',
      servicios: [],
      notas: '',
      estado: 'PENDIENTE'
    })
    setError('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setShowClientModal(false)
    setSelectedCita(null)
    setSelectedClient(null)
    setClientSearch('')
    setShowClientList(false)
    setError('')
  }

  const handleSelectClient = (cliente: Cliente) => {
    setSelectedClient(cliente)
    setClientSearch(cliente.nombre)
    setShowClientList(false)
  }

  const handleCreateClient = async () => {
    if (!newClientData.nombre.trim() || !newClientData.telefono.trim()) {
      setError(t('nombreYTelefonoRequeridos'))
      return
    }

    const result = await addCliente(newClientData)
    if (result.success) {
      const nuevoCliente = clientes.find(c => c.nombre === newClientData.nombre)
      if (nuevoCliente) {
        setSelectedClient(nuevoCliente)
      }
      setShowClientModal(false)
      setNewClientData({ nombre: '', telefono: '', email: '', fecha_registro: new Date().toISOString(), activo: true })
    } else {
      setError(result.error || 'Error al crear cliente')
    }
  }

  const triggerGoogleSync = async (barberoIdToSync: string) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/google/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: barberoIdToSync })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        console.warn('Sincronización Google Calendar falló:', data.error || response.statusText)
      }
    } catch (syncError) {
      console.warn('Error al sincronizar con Google Calendar:', syncError)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedClient) {
      setError(t('seleccionarCliente'))
      return
    }

    // Si es barbero, usar su ID automáticamente
    const barberoId = user?.rol === 'BARBERO' && currentBarbero 
      ? currentBarbero.id 
      : formData.barbero_id

    if (!barberoId) {
      setError(t('barberoRequerido'))
      return
    }

    if (formData.servicios.length === 0) {
      setError(t('seleccionarServicio'))
      return
    }

    // Crear fecha en hora local sin conversión de zona horaria
    const [year, month, day] = formData.fecha.split('-').map(Number)
    const [hour, minute] = formData.hora.split(':').map(Number)
    const fechaHora = new Date(year, month - 1, day, hour, minute, 0, 0)
    const serviciosSeleccionados = formData.servicios.map(servicioId => {
      const servicio = servicios.find(s => s.id === servicioId)
      return {
        servicio_id: servicioId,
        servicio_nombre: servicio?.nombre || '',
        precio: servicio?.precio || 0
      }
    })
    const duracionTotal = serviciosSeleccionados.reduce((sum, s) => {
      const servicio = servicios.find(serv => serv.id === s.servicio_id)
      return sum + (servicio?.duracion || 0)
    }, 0)

    // Validar disponibilidad del barbero (no puede tener citas solapadas)
    const fechaHoraFin = new Date(fechaHora.getTime() + duracionTotal * 60000)
    const citasBarbero = citas.filter(c => 
      c.barbero_id === barberoId && 
      c.estado !== 'CANCELADA' && 
      c.estado !== 'NO_ASISTIO' &&
      c.id !== selectedCita?.id // Excluir la cita actual si se está editando
    )

    type CitaConflicto = { cliente?: string; inicio: Date; fin: Date }
    let citaConflictiva: CitaConflicto | undefined
    const tieneConflicto = citasBarbero.some(citaExistente => {
      // Parsear el formato local literal de la cita existente
      let inicioExistente: Date
      if (citaExistente.fecha_hora.includes('T')) {
        const [datePart, timePart] = citaExistente.fecha_hora.split('T')
        const [existYear, existMonth, existDay] = datePart.split('-').map(Number)
        const [existHour, existMinute] = timePart.split(':').map(Number)
        inicioExistente = new Date(existYear, existMonth - 1, existDay, existHour, existMinute, 0, 0)
      } else {
        inicioExistente = new Date(citaExistente.fecha_hora)
      }
      
      const finExistente = new Date(inicioExistente)
      finExistente.setMinutes(finExistente.getMinutes() + citaExistente.duracion)
      
      // Verificar si hay solapamiento
      // La nueva cita se solapa si:
      // - Su inicio está dentro del rango de una cita existente, O
      // - Su fin está dentro del rango de una cita existente, O
      // - La nueva cita contiene completamente una cita existente
      const hayConflicto = (
        (fechaHora >= inicioExistente && fechaHora < finExistente) ||
        (fechaHoraFin > inicioExistente && fechaHoraFin <= finExistente) ||
        (fechaHora <= inicioExistente && fechaHoraFin >= finExistente)
      )
      
      if (hayConflicto) {
        citaConflictiva = {
          cliente: citaExistente.cliente_nombre,
          inicio: inicioExistente,
          fin: finExistente
        }
      }
      
      return hayConflicto
    })

    if (tieneConflicto && citaConflictiva !== undefined) {
      const { inicio, fin, cliente } = citaConflictiva as CitaConflicto
      const horaInicio = inicio.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
      const horaFin = fin.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
      setError(`${t('barberoTieneConflicto')} ${cliente ?? t('aOtroCliente')} ${t('deTiempoA')} ${horaInicio} a ${horaFin}. ${t('porFavorSelecciona')}`)
      return
    }

    const barbero = barberos.find(b => b.id === barberoId) || currentBarbero

    // Convertir a formato local ISO literal (sin zona horaria)
    const yearStr = fechaHora.getFullYear()
    const monthStr = String(fechaHora.getMonth() + 1).padStart(2, '0')
    const dayStr = String(fechaHora.getDate()).padStart(2, '0')
    const hours = String(fechaHora.getHours()).padStart(2, '0')
    const minutes = String(fechaHora.getMinutes()).padStart(2, '0')
    const seconds = String(fechaHora.getSeconds()).padStart(2, '0')
    const fechaHoraLocal = `${yearStr}-${monthStr}-${dayStr}T${hours}:${minutes}:${seconds}`

    const citaData = {
      cliente_id: selectedClient.id,
      cliente_nombre: selectedClient.nombre,
      cliente_telefono: selectedClient.telefono,
      barbero_id: barberoId,
      barbero_nombre: barbero?.nombre || '',
      // Guardar en formato local literal para evitar conversiones de zona horaria
      fecha_hora: fechaHoraLocal,
      duracion: duracionTotal,
      estado: formData.estado,
      notas: formData.notas || undefined,
      servicios: serviciosSeleccionados
    }

    // Calcular fechas de la semana actual para recargar correctamente
    const weekStartDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const startDate = weekStartDate
    const endDate = addDays(weekStartDate, 7)

    if (selectedCita) {
      const result = await updateCita(selectedCita.id, citaData, startDate, endDate)
      if (result.success) {
        handleCloseModal()
      } else {
        setError(result.error || t('errorAlActualizarCita'))
      }
    } else {
      const result = await addCita(citaData, startDate, endDate)
      if (result.success) {
        handleCloseModal()
        if (barberoId) {
          void triggerGoogleSync(String(barberoId))
        }
      } else {
        setError(result.error || t('errorAlCrearCita'))
      }
    }
  }

  const getAppointmentPosition = (citas: Cita[], index: number) => {
    const total = citas.length
    const width = 100 / total
    const left = (index * width)
    const right = 100 - ((index + 1) * width)
    return { left: `${left}%`, right: `${right}%` }
  }

  const getEstadoClass = (estado: EstadoCita) => {
    const classes: Record<EstadoCita, string> = {
      'PENDIENTE': 'pending',
      'CONFIRMADA': 'confirmed',
      'EN_PROCESO': 'in-progress',
      'COMPLETADA': 'completed',
      'CANCELADA': 'cancelled',
      'NO_ASISTIO': 'no-show'
    }
    return classes[estado] || 'pending'
  }

  // Mini calendario
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOfWeek = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1
  const lastDayOfWeek = monthEnd.getDay() === 0 ? 0 : 7 - monthEnd.getDay()

  return (
    <Layout>
      <div className="citas-container">
        <div className="main-content">
          <div className="calendar-header">
            <h1 className="calendar-title">{t('calendarioSemanal')}</h1>
            <div className="date-controls">
              <button className="btn-nav" onClick={handlePrevWeek}>◀</button>
              <div className="current-date">
                {format(weekStart, "EEEE, d 'de' MMMM", { locale: idioma === 'es' ? es : enUS })}
              </div>
              <button className="btn-nav" onClick={handleNextWeek}>▶</button>
            </div>
          </div>
          <div className="calendar-grid">
            <div className="time-column">
              <div className="time-header">Hora - Días</div>
              {allHours.map(hour => {
                // Formatear hora en formato 12 horas (AM/PM)
                let displayHour = hour
                let period = 'AM'
                
                if (hour === 0) {
                  displayHour = 12
                  period = 'AM'
                } else if (hour === 12) {
                  displayHour = 12
                  period = 'PM'
                } else if (hour > 12) {
                  displayHour = hour - 12
                  period = 'PM'
                } else {
                  displayHour = hour
                  period = 'AM'
                }
                
                return (
                  <div key={hour} className="time-slot">
                    {displayHour} {period}
                  </div>
                )
              })}
            </div>
            <div className="days-container">
              {weekDays.map(day => (
                <div key={day.toISOString()} className="day-header">
                  <div className="day-name">{format(day, 'EEE', { locale: es })}</div>
                  <div className={`day-number ${isToday(day) ? 'today' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
              {weekDays.map(day => {
                const horasDelDia = getHorasDisponibles(day)
                const diaCerrado = isDiaCerrado(day)
                return (
                  <div key={`col-${day.toISOString()}`} className={`day-column ${diaCerrado ? 'closed' : ''}`}>
                    {allHours.map(hour => {
                      const horaDisponible = horasDelDia.includes(hour)
                      if (!horaDisponible) {
                        return (
                          <div 
                            key={`${day.toISOString()}-${hour}`} 
                            className="hour-slot unavailable"
                            title="Fuera del horario de atención"
                          />
                        )
                      }
                      const slotCitas = getCitasForSlot(day, hour)
                      const hasMultiple = slotCitas.length > 1
                      return (
                        <div 
                          key={`${day.toISOString()}-${hour}`} 
                          className={`hour-slot ${hasMultiple ? 'has-multiple' : ''}`}
                          onClick={user?.rol !== 'BARBERO' ? () => handleOpenModal(day, hour) : undefined}
                        >
                        {slotCitas.map((cita, index) => {
                          const position = getAppointmentPosition(slotCitas, index)
                          const height = Math.min((cita.duracion / 60) * SLOT_HEIGHT, SLOT_HEIGHT)
                          return (
                            <div
                              key={cita.id}
                              className={`appointment ${getEstadoClass(cita.estado)}`}
                              style={{
                                top: '4px',
                                height: `${height}px`,
                                left: position.left,
                                right: position.right
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedCita(cita)
                                setSelectedClient(clientes.find(c => c.id === cita.cliente_id) || null)
                                
                                // Parsear el formato local literal (YYYY-MM-DDTHH:mm:ss)
                                let citaDate: Date
                                if (cita.fecha_hora.includes('T')) {
                                  const [datePart, timePart] = cita.fecha_hora.split('T')
                                  const [editYear, editMonth, editDay] = datePart.split('-').map(Number)
                                  const [editHour, editMinute] = timePart.split(':').map(Number)
                                  citaDate = new Date(editYear, editMonth - 1, editDay, editHour, editMinute, 0, 0)
                                } else {
                                  citaDate = new Date(cita.fecha_hora)
                                }
                                
                                // Mapear servicios correctamente - mantener los IDs originales tal como vienen
                                const serviciosIds = cita.servicios && cita.servicios.length > 0
                                  ? cita.servicios.map(s => s.servicio_id).filter(id => id && id !== 'undefined' && id !== 'null')
                                  : []
                                
                                console.log('Cita seleccionada:', cita.id)
                                console.log('Servicios en cita:', cita.servicios)
                                console.log('IDs de servicios:', serviciosIds)
                                
                                setFormData({
                                  fecha: format(citaDate, 'yyyy-MM-dd'),
                                  hora: format(citaDate, 'HH:mm'),
                                  barbero_id: cita.barbero_id,
                                  servicios: serviciosIds,
                                  notas: cita.notas || '',
                                  estado: cita.estado
                                })
                                setShowModal(true)
                              }}
                            >
                              <div className="appointment-name">{cita.cliente_nombre}</div>
                              <div className="appointment-service">
                                {cita.servicios.map(s => s.servicio_nombre).join(', ')} - {cita.barbero_nombre.split(' ')[0]}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="sidebar">
          {user?.rol !== 'BARBERO' && (
            <div className="sidebar-card">
              <button className="btn-new" onClick={() => handleOpenModal()}>+ {t('nuevaCita')}</button>
            </div>
          )}

          {user?.rol !== 'BARBERO' && (
            <div className="sidebar-card">
              <h3 className="sidebar-title">🔍 {t('filtrarPorBarbero')}</h3>
              <select
                className="barbero-filter-select"
                value={selectedBarberoFilter}
                onChange={(e) => setSelectedBarberoFilter(e.target.value)}
              >
                <option value="">{t('todosBarberos')}</option>
                {barberos.map(barbero => (
                  <option key={barbero.id} value={barbero.id}>
                    {barbero.nombre}
                    {barbero.especialidad && ` - ${barbero.especialidad}`}
                  </option>
                ))}
              </select>
              {selectedBarberoFilter && (
                <>
                  <button
                    className="btn-clear-filter"
                    onClick={() => setSelectedBarberoFilter('')}
                  >
                    {t('limpiarFiltro')}
                  </button>
                  <div className="filter-info">
                    <p>
                      {t('mostrando')} <strong>{barberos.find(b => b.id === selectedBarberoFilter)?.nombre}</strong>
                    </p>
                    <p className="filter-count">
                      {filteredCitas.length} {filteredCitas.length === 1 ? 'cita' : 'citas'} {t('citasEnEstaSemana')}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
          {user?.rol === 'BARBERO' && currentBarbero && (
            <div className="sidebar-card">
              <h3 className="sidebar-title">{t('misCitas')}</h3>
              <div className="filter-info">
                <p>
                  <strong>{currentBarbero.nombre}</strong>
                </p>
                <p className="filter-count">
                  {filteredCitas.length} {filteredCitas.length === 1 ? 'cita' : 'citas'} {t('citasEnEstaSemana')}
                </p>
              </div>
            </div>
          )}

          <div className="sidebar-card">
            <div className="mini-calendar">
              <div className="mini-calendar-header">
                <button className="btn-nav" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>◀</button>
                <div className="mini-calendar-title">{format(currentDate, 'MMMM yyyy', { locale: idioma === 'es' ? es : enUS })}</div>
                <button className="btn-nav" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>▶</button>
              </div>
              <div className="mini-calendar-grid">
                {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
                  <div key={day} className="mini-day-header">{day}</div>
                ))}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-start-${i}`} className="mini-day other-month"></div>
                ))}
                {calendarDays.map(day => (
                  <div
                    key={day.toISOString()}
                    className={`mini-day ${isToday(day) ? 'today' : ''} ${isSameDay(day, currentDate) ? 'selected' : ''}`}
                    onClick={() => setCurrentDate(day)}
                  >
                    {format(day, 'd')}
                  </div>
                ))}
                {Array.from({ length: lastDayOfWeek }).map((_, i) => (
                  <div key={`empty-end-${i}`} className="mini-day other-month"></div>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">{t('barberoDisponiblidad')}</h3>
            <div className="staff-list">
              {barberos.map(barbero => (
                <div key={barbero.id} className="staff-item">
                  <div className="staff-name">{barbero.nombre}</div>
                  <div className="staff-status">{t('disponible')}</div>
                </div>
              ))}
            </div>
            <div className="staff-note">
              <strong>{t('variosBarberos')}</strong>
              <p>{t('variosBarberosDescripcion')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nueva/Editar Cita */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedCita ? t('editarCita') : t('nuevaCita')}</h2>
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
                  <label className="form-label">{t('buscarCliente')}</label>
                  <div className="search-client-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      className="search-client-input"
                      placeholder={t('buscarClientePlaceholder')}
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      onFocus={() => setShowClientList(true)}
                      onBlur={() => setTimeout(() => setShowClientList(false), 200)}
                    />
                  </div>
                  {showClientList && !selectedClient && filteredClients.length > 0 && (
                    <div className="client-results show">
                      {filteredClients.map(cliente => (
                        <div
                          key={cliente.id}
                          className="client-result-item"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleSelectClient(cliente)
                          }}
                        >
                          <div className="client-result-info">
                            <div className="client-result-name">{cliente.nombre}</div>
                            <div className="client-result-contact">
                              📞 {cliente.telefono}
                              {cliente.email && ` | 📧 ${cliente.email}`}
                            </div>
                          </div>
                          <div className="client-result-visits">{cliente.visitas} {t('visitas')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn-create-client"
                    onClick={() => setShowClientModal(true)}
                  >
                    {t('crearNuevoCliente')}
                  </button>
                  {selectedClient && (
                    <div className="selected-client show">
                      <div className="selected-client-info">
                        <div className="selected-client-details">
                          <div className="selected-client-name">{selectedClient.nombre}</div>
                          <div className="selected-client-contact">
                            📞 {selectedClient.telefono}
                            {selectedClient.email && ` | 📧 ${selectedClient.email}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-remove-client"
                          onClick={() => {
                            setSelectedClient(null)
                            setClientSearch('')
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="auto-count-notice">
                    ℹ️ El conteo de visitas se actualizará automáticamente al confirmar la cita
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha y Hora</label>
                  <div className="form-row">
                    <input
                      type="date"
                      className="form-input"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      required
                    />
                    <input
                      type="time"
                      className="form-input"
                      value={formData.hora}
                      onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {user?.rol !== 'BARBERO' ? (
                  <div className="form-group">
                    <label className="form-label">{t('barberoLabel')} *</label>
                    <select
                      className="form-select"
                      value={formData.barbero_id}
                      onChange={(e) => setFormData({ ...formData, barbero_id: e.target.value })}
                      required
                    >
                      <option value="">{t('seleccionarBarbero')}</option>
                      {barberos.map(barbero => (
                        <option key={barbero.id} value={barbero.id}>
                          {barbero.nombre}
                          {barbero.especialidad && ` - ${barbero.especialidad}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  currentBarbero && (
                    <div className="form-group">
                      <label className="form-label">{t('barberoLabel')}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={currentBarbero.nombre}
                        disabled
                      />
                      <input
                        type="hidden"
                        value={currentBarbero.id}
                        onChange={() => {}}
                      />
                    </div>
                  )
                )}

                <div className="form-group">
                  <label className="form-label">{t('serviciosLabel')} *</label>
                  <div className="services-checkboxes">
                    {servicios.filter(s => s.activo).map(servicio => {
                      // Comparar IDs de forma consistente
                      const isChecked = formData.servicios.some(selectedId => {
                        const matches = String(selectedId) === String(servicio.id)
                        if (matches) {
                          console.log(`✓ Servicio ${servicio.nombre} está marcado`)
                        }
                        return matches
                      })
                      
                      return (
                        <label key={servicio.id} className="service-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  servicios: [...formData.servicios, servicio.id]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  servicios: formData.servicios.filter(id => String(id) !== String(servicio.id))
                                })
                              }
                            }}
                          />
                          <span>
                            {servicio.nombre} - ${servicio.precio.toFixed(2)} ({servicio.duracion} min)
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('estadoLabel')}</label>
                  <select
                    className="form-select"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoCita })}
                  >
                    <option value="PENDIENTE">{t('pendiente')}</option>
                    <option value="CONFIRMADA">{t('confirmada')}</option>
                    <option value="EN_PROCESO">{t('enProceso')}</option>
                    <option value="COMPLETADA">{t('completada')}</option>
                    <option value="CANCELADA">{t('cancelada')}</option>
                    <option value="NO_ASISTIO">{t('noAsistio')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('notasLabel')} (Opcional)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder={t('agregarNotas')}
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                {selectedCita && (
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={async () => {
                      if (confirm(t('estasSeguroEliminarCita'))) {
                        const weekStartDate = startOfWeek(currentDate, { weekStartsOn: 1 })
                        const startDate = weekStartDate
                        const endDate = addDays(weekStartDate, 7)
                        await deleteCita(selectedCita.id, startDate, endDate)
                        handleCloseModal()
                      }
                    }}
                  >
                    🗑️ {t('eliminarBtn')}
                  </button>
                )}
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  {t('cancelarBtn')}
                </button>
                <button type="submit" className="btn-save">
                  {selectedCita ? t('actualizarBtn') : t('guardarBtn')} {t('nuevaCita')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Solo Lectura (Barbero) */}
      {showReadOnlyModal && selectedCita && (
        <div className="modal-overlay" onClick={() => { setShowReadOnlyModal(false); setSelectedCita(null) }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('detallesCita')}</h2>
              <button className="modal-close" onClick={() => { setShowReadOnlyModal(false); setSelectedCita(null) }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">{t('cliente')}</label>
                <div className="selected-client show">
                  <div className="selected-client-info">
                    <div className="selected-client-details">
                      <div className="selected-client-name">{selectedCita.cliente_nombre}</div>
                      <div className="selected-client-contact">📞 {selectedCita.cliente_telefono}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('fechaYHora')}</label>
                <div className="form-row">
                  {(() => {
                    let citaDate: Date
                    const fh = selectedCita.fecha_hora
                    if (fh.includes('T')) {
                      const [datePart, timePart] = fh.split('T')
                      const [y, m, d] = datePart.split('-').map(Number)
                      const [hh, mm] = timePart.split(':').map(Number)
                      citaDate = new Date(y, m - 1, d, hh, mm, 0, 0)
                    } else {
                      citaDate = new Date(fh)
                    }
                    return (
                      <>
                        <input type="text" className="form-input" value={format(citaDate, 'yyyy-MM-dd')} disabled />
                        <input type="text" className="form-input" value={format(citaDate, 'HH:mm')} disabled />
                      </>
                    )
                  })()}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('barberoLabel')}</label>
                <input type="text" className="form-input" value={selectedCita.barbero_nombre} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">{t('serviciosLabel')}</label>
                <div className="services-checkboxes">
                  {selectedCita.servicios.map(s => (
                    <div key={String(s.servicio_id)} className="service-checkbox-label">
                      <span>{s.servicio_nombre} - ${s.precio.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('estadoLabel')}</label>
                <input type="text" className="form-input" value={selectedCita.estado.replace('_', ' ')} disabled />
              </div>

              {selectedCita.notas && (
                <div className="form-group">
                  <label className="form-label">{t('notasLabel')}</label>
                  <textarea className="form-textarea" rows={3} value={selectedCita.notas} disabled />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => { setShowReadOnlyModal(false); setSelectedCita(null) }}>
                {t('cerrar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Cliente */}
      {showClientModal && (
        <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('crearNuevoCliente')}</h2>
              <button className="modal-close" onClick={() => setShowClientModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">{t('nombreCompleto')} *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('nombreCompletoPlaceholder')}
                  value={newClientData.nombre}
                  onChange={(e) => setNewClientData({ ...newClientData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('telefono')} *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder={t('telefonoPlaceholder')}
                  value={newClientData.telefono}
                  onChange={(e) => setNewClientData({ ...newClientData, telefono: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('emailOpcional')}</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder={t('emailPlaceholder')}
                  value={newClientData.email}
                  onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setShowClientModal(false)}>
                {t('cancelarBtn')}
              </button>
              <button type="button" className="btn-save" onClick={handleCreateClient}>
                {t('crearCliente')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}