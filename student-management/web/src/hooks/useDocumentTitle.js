import { useEffect } from 'react'

const BASE = 'Student Management System'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : BASE
  }, [title])
}
