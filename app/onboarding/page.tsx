"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, ChevronRight, Home, User, FileText, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { AuthGuard } from "@/components/auth/auth-guard"
import { upsertOwner, createUnit, createTenant, createLease } from "@/lib/firestore"
import {
  ownerSchema,
  unitSchema,
  tenantSchema,
  leaseSchema,
  type OwnerFormData,
  type UnitFormData,
  type TenantFormData,
  type LeaseFormData,
} from "@/lib/validations"

type OnboardingStep = 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [unitId, setUnitId] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)

  // Form per ogni step
  const ownerForm = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: { name: user?.displayName || "" },
  })

  const unitForm = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      address: "",
      city: "",
      rooms: 2,
      m2: 60,
      rentAsk: 1000,
    },
  })

  const tenantForm = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })

  const leaseForm = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      rent: 1000,
      dueDay: 5,
      paymentMethod: "SEPA_MANDATE",
      iban: "",
      startDate: new Date().toISOString().split('T')[0],
    },
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Devi essere autenticato per accedere a questa pagina.</p>
      </div>
    )
  }

  const onOwnerSubmit = async (data: OwnerFormData) => {
    setIsLoading(true)
    try {
      await upsertOwner(user.uid, user.email || "", data.name)
      setCurrentStep(2)
      toast({
        title: "Profilo salvato!",
        description: "Ora aggiungiamo il tuo primo immobile.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onUnitSubmit = async (data: UnitFormData) => {
    setIsLoading(true)
    try {
    const id = await createUnit({
        ownerId: user.uid,
        address: data.address,
        city: data.city,
        rooms: data.rooms,
        m2: data.m2,
        rentAsk: data.rentAsk,
        status: "vacant",
      })
      setUnitId(id)
      setCurrentStep(3)
      toast({
        title: "Immobile aggiunto!",
        description: "Ora aggiungiamo i dettagli dell'inquilino.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio dell'immobile.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onTenantSubmit = async (data: TenantFormData) => {
    setIsLoading(true)
    try {
      const id = await createTenant({
        ownerId: user.uid,
        name: data.name,
        email: data.email,
        phone: data.phone,
      })
      setTenantId(id)
      // Aggiorna il form del lease con l'email del tenant
      leaseForm.setValue("rent", unitForm.getValues("rentAsk"))
      setCurrentStep(4)
      toast({
        title: "Inquilino aggiunto!",
        description: "Ora configuriamo il contratto di locazione.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio dell'inquilino.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onLeaseSubmit = async (data: LeaseFormData) => {
    if (!unitId || !tenantId) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Dati mancanti per la creazione del contratto.",
      })
      return
    }

    setIsLoading(true)
    try {
      // Genera un riferimento mandato SEPA mock se necessario
      const mandateRef = data.paymentMethod === "SEPA_MANDATE"
        ? `MND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
        : undefined

      await createLease({
        unitId,
        tenantId,
        startDate: data.startDate,
        rent: data.rent,
        dueDay: data.dueDay,
        paymentMethod: data.paymentMethod,
        mandateRef,
        tenantEmail: tenantForm.getValues("email"),
      })

      toast({
        title: "Onboarding completato! 🎉",
        description: "Il tuo primo immobile è stato configurato con successo.",
      })

      // Redirect alla dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del contratto.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { number: 1, title: "Profilo", icon: User, completed: currentStep > 1 },
    { number: 2, title: "Immobile", icon: Home, completed: currentStep > 2 },
    { number: 3, title: "Inquilino", icon: User, completed: currentStep > 3 },
    { number: 4, title: "Contratto", icon: FileText, completed: currentStep > 4 },
  ]

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Benvenuto in Particular</h1>
          <p className="mt-2 text-gray-600">
            Configuriamo il tuo primo immobile in pochi semplici passaggi
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : currentStep === step.number
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-white border-gray-300 text-gray-500"
                  }`}
                >
                  {step.completed ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-2 mr-4 text-sm">
                  <div
                    className={`font-medium ${
                      step.completed || currentStep === step.number
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 ${
                      step.completed ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          {/* Step 1: Owner Info */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informazioni Proprietario
                </CardTitle>
                <CardDescription>
                  Iniziamo con le tue informazioni personali
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...ownerForm}>
                  <form onSubmit={ownerForm.handleSubmit(onOwnerSubmit)} className="space-y-4">
                    <FormField
                      control={ownerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Il tuo nome e cognome"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Questo nome apparirà sui contratti e documenti ufficiali
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Salvataggio..." : "Continua"}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </>
          )}

          {/* Step 2: Unit Info */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="mr-2 h-5 w-5" />
                  Dettagli Immobile
                </CardTitle>
                <CardDescription>
                  Aggiungi le informazioni del tuo primo immobile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...unitForm}>
                  <form onSubmit={unitForm.handleSubmit(onUnitSubmit)} className="space-y-4">
                    <FormField
                      control={unitForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Indirizzo completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Via Roma 123, Milano (MI)"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={unitForm.control}
                        name="rooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numero di stanze</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                disabled={isLoading}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={unitForm.control}
                        name="m2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Superficie (m²)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="10"
                                max="1000"
                                disabled={isLoading}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={unitForm.control}
                      name="rentAsk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canone mensile desiderato (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="100"
                              max="10000"
                              disabled={isLoading}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Questo sarà il canone di riferimento per il contratto
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Indietro
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Salvataggio..." : "Continua"}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
          </div>
                  </form>
                </Form>
              </CardContent>
            </>
          )}

          {/* Step 3: Tenant Info */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informazioni Inquilino
                </CardTitle>
                <CardDescription>
                  Aggiungi i dettagli dell&apos;inquilino
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...tenantForm}>
                  <form onSubmit={tenantForm.handleSubmit(onTenantSubmit)} className="space-y-4">
                    <FormField
                      control={tenantForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo inquilino</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome e cognome dell&apos;inquilino"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={tenantForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email inquilino</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="inquilino@email.com"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Verrà utilizzata per inviare i reminder di pagamento
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={tenantForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefono (opzionale)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="339 123 4567"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Indietro
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Salvataggio..." : "Continua"}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
          </div>
                  </form>
                </Form>
              </CardContent>
            </>
          )}

          {/* Step 4: Lease Info */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Configurazione Contratto
                </CardTitle>
                <CardDescription>
                  Ultimi dettagli per completare il contratto di locazione
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...leaseForm}>
                  <form onSubmit={leaseForm.handleSubmit(onLeaseSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={leaseForm.control}
                        name="rent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canone mensile (€)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="100"
                                max="10000"
                                disabled={isLoading}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={leaseForm.control}
                        name="dueDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giorno di scadenza</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="28"
                                disabled={isLoading}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Giorno del mese per il pagamento (1-28)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={leaseForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data inizio contratto</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={leaseForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Metodo di pagamento</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="sepa"
                                  value="SEPA_MANDATE"
                                  checked={field.value === "SEPA_MANDATE"}
                                  onChange={() => field.onChange("SEPA_MANDATE")}
                                  disabled={isLoading}
                                />
                                <Label htmlFor="sepa">Addebito SEPA (consigliato)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="manual"
                                  value="MANUAL"
                                  checked={field.value === "MANUAL"}
                                  onChange={() => field.onChange("MANUAL")}
                                  disabled={isLoading}
                                />
                                <Label htmlFor="manual">Bonifico manuale</Label>
                              </div>
          </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {leaseForm.watch("paymentMethod") === "SEPA_MANDATE" && (
                      <FormField
                        control={leaseForm.control}
                        name="iban"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IBAN inquilino</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="IT60 X054 2811 1010 0000 0123 456"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              IBAN per l&apos;addebito automatico (MVP - solo per test)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(3)}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Indietro
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creazione contratto..." : "Completa onboarding"}
                        <Check className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
    </AuthGuard>
  )
}