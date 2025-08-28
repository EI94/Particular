"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
} from "firebase/auth"
import { auth } from "./firebase"
import { upsertOwner } from "./firestore"

export interface AuthError {
  code: string
  message: string
}

// Messaggi di errore personalizzati in italiano
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "Utente non trovato. Verifica l'email inserita."
    case "auth/wrong-password":
      return "Password non corretta."
    case "auth/email-already-in-use":
      return "Questa email è già registrata. Prova ad accedere."
    case "auth/weak-password":
      return "La password è troppo debole. Usa almeno 6 caratteri."
    case "auth/invalid-email":
      return "Email non valida."
    case "auth/user-disabled":
      return "Questo account è stato disabilitato."
    case "auth/too-many-requests":
      return "Troppi tentativi. Riprova più tardi."
    case "auth/network-request-failed":
      return "Errore di connessione. Verifica la tua connessione internet."
    case "auth/invalid-credential":
      return "Credenziali non valide. Verifica email e password."
    default:
      return "Si è verificato un errore. Riprova."
  }
}

// Registrazione nuovo utente
export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: User; error: null } | { user: null; error: AuthError }> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    
    // Aggiorna il profilo con il nome
    await updateProfile(userCredential.user, {
      displayName: name,
    })

    // Crea il documento owner in Firestore
    await upsertOwner(userCredential.user.uid, email, name)

    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return {
      user: null,
      error: {
        code: error.code,
        message: getErrorMessage(error.code),
      },
    }
  }
}

// Login utente esistente
export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User; error: null } | { user: null; error: AuthError }> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )

    // Assicuriamoci che esista il documento owner
    await upsertOwner(
      userCredential.user.uid,
      userCredential.user.email || email,
      userCredential.user.displayName || undefined
    )

    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return {
      user: null,
      error: {
        code: error.code,
        message: getErrorMessage(error.code),
      },
    }
  }
}

// Logout
export const logOut = async (): Promise<{ success: true; error: null } | { success: false; error: AuthError }> => {
  try {
    await signOut(auth)
    return { success: true, error: null }
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getErrorMessage(error.code),
      },
    }
  }
}

// Reset password
export const resetPassword = async (
  email: string
): Promise<{ success: true; error: null } | { success: false; error: AuthError }> => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true, error: null }
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getErrorMessage(error.code),
      },
    }
  }
}

// Hook personalizzato per l'utente corrente
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { user, loading }
}

// Verifica se l'utente è autenticato
export const requireAuth = (user: User | null, loading: boolean) => {
  if (loading) return { isAuthenticated: false, isLoading: true }
  if (!user) return { isAuthenticated: false, isLoading: false }
  return { isAuthenticated: true, isLoading: false }
}
