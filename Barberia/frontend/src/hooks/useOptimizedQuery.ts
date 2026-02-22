import { useCallback, useRef, useEffect, useState } from 'react'

/**
 * Hook para caché y optimización de queries
 * Evita solicitudes duplicadas dentro de un período de tiempo
 */
export function useOptimizedQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
  cacheDurationMs: number = 5 * 60 * 1000 // 5 minutos por defecto
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const cacheRef = useRef<{
    data: T | null
    timestamp: number
  }>({
    data: null,
    timestamp: 0
  })

  const executeQuery = useCallback(async () => {
    const now = Date.now()
    const timeSinceLastFetch = now - cacheRef.current.timestamp

    // Si tenemos datos en caché y aún son válidos, usarlos
    if (cacheRef.current.data && timeSinceLastFetch < cacheDurationMs) {
      setData(cacheRef.current.data)
      return cacheRef.current.data
    }

    setLoading(true)
    setError(null)

    try {
      const result = await queryFn()
      cacheRef.current = {
        data: result,
        timestamp: Date.now()
      }
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Query failed')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [...dependencies, cacheDurationMs])

  useEffect(() => {
    executeQuery()
  }, [executeQuery])

  return { data, loading, error, refetch: executeQuery }
}

/**
 * Hook para debounce de búsqueda
 */
export function useDebouncedSearch<T>(
  searchFn: (term: string) => Promise<T>,
  delay: number = 300
) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults(null)
      return
    }

    setLoading(true)
    clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await searchFn(searchTerm)
        setResults(result)
      } finally {
        setLoading(false)
      }
    }, delay)

    return () => clearTimeout(timeoutRef.current)
  }, [searchTerm, searchFn, delay])

  return { searchTerm, setSearchTerm, results, loading }
}

/**
 * Hook para paginación
 */
export function usePagination<T>(items: T[], itemsPerPage: number = 20) {
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const currentItems = items.slice(startIdx, endIdx)

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  }
}
