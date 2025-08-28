"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore"
import { Plus, Home, Users, CreditCard, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth, logOut } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function Dashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "payments"), 
      orderBy("createdAt", "desc"), 
      limit(20)
    )
    
    const unsub = onSnapshot(q, (snap: any) => {
      setPayments(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    
    return () => unsub()
  }, [user])

  const handleLogout = async () => {
    const result = await logOut()
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: result.error.message,
      })
    } else {
      toast({
        title: "Logout effettuato",
        description: "Arrivederci!",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50"
      case "pending":
        return "text-yellow-600 bg-yellow-50"
      case "late":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagato"
      case "pending":
        return "In attesa"
      case "late":
        return "In ritardo"
      case "failed":
        return "Fallito"
      default:
        return status
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">
                  Benvenuto, {user?.displayName || user?.email}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/onboarding">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Aggiungi immobile
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Immobili Totali
                </CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  In sviluppo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Inquilini Attivi
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  In sviluppo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pagamenti Mese
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payments.filter(p => p.status === "paid").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pagamenti completati
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Pagamenti Recenti</CardTitle>
              <CardDescription>
                Gli ultimi 20 pagamenti registrati nel sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Nessun pagamento
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Inizia aggiungendo il tuo primo immobile.
                  </p>
                  <div className="mt-6">
                    <Link href="/onboarding">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Aggiungi immobile
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Pagamento #{payment.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Scadenza: {formatDate(payment.dueDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              payment.status
                            )}`}
                          >
                            {getStatusText(payment.status)}
                          </span>
                        </div>
                        <Link href={`/pay/${payment.id}`}>
                          <Button variant="outline" size="sm">
                            Dettagli
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
