"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export function AuthGuard({ 
  children, 
  redirectTo = "/login", 
  requireAuth = true 
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Aspetta il caricamento

    if (requireAuth && !user) {
      // Utente non autenticato e autenticazione richiesta
      router.push(redirectTo)
      return
    }

    if (!requireAuth && user) {
      // Utente autenticato ma non dovrebbe essere (es. pagina login)
      router.push("/dashboard")
      return
    }
  }, [user, loading, requireAuth, redirectTo, router])

  // Mostra loading durante il controllo dell'autenticazione
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  // Se l'utente non è autenticato e l'autenticazione è richiesta, non mostrare nulla
  // (il redirect è già in corso)
  if (requireAuth && !user) {
    return null
  }

  // Se l'utente è autenticato ma non dovrebbe essere, non mostrare nulla
  if (!requireAuth && user) {
    return null
  }

  return <>{children}</>
}
