"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LogIn } from "lucide-react"

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
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { signIn } from "@/lib/auth"
import { AuthGuard } from "@/components/auth/auth-guard"
import { loginSchema, type LoginFormData } from "@/lib/validations"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await signIn(data.email, data.password)

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Errore di accesso",
          description: result.error.message,
        })
        return
      }

      toast({
        title: "Accesso effettuato!",
        description: "Benvenuto in Particular.",
      })

      // Redirect alla dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore imprevisto",
        description: "Si è verificato un errore durante l'accesso.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Particular</h1>
          <p className="mt-2 text-gray-600">Gestione Immobiliare Intelligente</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Accedi al tuo account</CardTitle>
            <CardDescription className="text-center">
              Inserisci le tue credenziali per accedere
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="La tua password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            disabled={isLoading}
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <Link
                    href="/reset-password"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Password dimenticata?
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Accesso in corso...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      Accedi
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Non hai un account?{" "}
                    <Link
                      href="/signup"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Registrati
                    </Link>
                  </span>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
    </AuthGuard>
  )
}
