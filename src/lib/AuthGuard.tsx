import { useAuth } from './auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Lista julkisista reiteistä
const publicRoutes = ['/', '/login', '/tutustu']

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Jos reitti on julkinen, sallitaan pääsy
    if (publicRoutes.includes(window.location.pathname)) {
      return
    }

    // Jos käyttäjä ei ole kirjautunut ja reitti ei ole julkinen,
    // ohjataan etusivulle
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  // Jos reitti on julkinen tai käyttäjä on kirjautunut, 
  // näytetään sisältö
  if (publicRoutes.includes(window.location.pathname) || user) {
    return <>{children}</>
  }

  // Muissa tapauksissa ei näytetä mitään
  return null
}