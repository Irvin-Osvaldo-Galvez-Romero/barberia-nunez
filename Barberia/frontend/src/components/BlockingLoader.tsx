import { useUiStore } from '../stores/uiStore'
import './BlockingLoader.css'

export default function BlockingLoader() {
  const { blocking, message } = useUiStore()

  if (!blocking) return null

  return (
    <div className="blocking-overlay" role="alert" aria-busy="true" aria-live="polite">
      <div className="blocking-card">
        <div className="blocking-spinner" />
        <h3>Procesando</h3>
        <p>{message}</p>
        <div className="blocking-bar" />
      </div>
    </div>
  )
}
