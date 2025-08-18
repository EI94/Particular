"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { resetPassword } from "@/lib/auth"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)

    try {
      const result = await resetPassword(data.email)

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: result.error.message,
        })
        return
      }

      setEmailSent(true)
      toast({
        title: "Email inviata!",
        description: "Controlla la tua casella di posta per reimpostare la password.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore imprevisto",
        description: "Si è verificato un errore durante l'invio dell'email.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Particular</h1>
            <p className="mt-2 text-gray-600">Gestione Immobiliare Intelligente</p>
          </div>

          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Email inviata!</CardTitle>
              <CardDescription>
                Abbiamo inviato le istruzioni per reimpostare la password all'indirizzo{" "}
                <strong>{form.getValues("email")}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Controlla la tua casella di posta (incluso lo spam)</p>
                <p>• Clicca sul link nell'email per reimpostare la password</p>
                <p>• Il link è valido per 1 ora</p>
              </div>

              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false)
                    form.reset()
                  }}
                  className="w-full"
                >
                  Invia di nuovo
                </Button>
                
                <Link href="/login" className="w-full">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Torna al login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Particular</h1>
          <p className="mt-2 text-gray-600">Gestione Immobiliare Intelligente</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Reimposta password</CardTitle>
            <CardDescription className="text-center">
              Inserisci la tua email per ricevere le istruzioni
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="mario.rossi@email.com"
                          type="email"
                          autoComplete="email"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Invio in corso...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Invia email
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Torna al login
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
