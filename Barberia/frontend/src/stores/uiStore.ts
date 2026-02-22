import { create } from 'zustand'

interface UiState {
  blocking: boolean
  message: string
  showBlocking: (message?: string) => void
  hideBlocking: () => void
  setMessage: (message: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  blocking: false,
  message: 'Procesando...',
  showBlocking: (message = 'Procesando...') => set({ blocking: true, message }),
  hideBlocking: () => set({ blocking: false }),
  setMessage: (message: string) => set({ message })
}))
