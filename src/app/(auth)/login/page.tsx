"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Tentando login com:", email)
      
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error("Erro no login:", error)
        
        // Mensagens de erro mais amigáveis
        if (error.message?.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos. Se você acabou de criar a conta, verifique seu email e clique no link de confirmação ANTES de fazer login.")
        } else if (error.message?.includes("Email not confirmed")) {
          setError("Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.")
        } else {
          setError(error.message || "Erro ao fazer login. Tente novamente.")
        }
        setLoading(false)
        return
      }

      // Login bem-sucedido - redirecionar para dashboard
      console.log("Login bem-sucedido!")
      router.push("/dashboard")
    } catch (err) {
      console.error("Erro ao fazer login:", err)
      setError("Erro ao conectar com o servidor. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <Smartphone className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Poderoso iPhones</CardTitle>
          <CardDescription>
            Sistema de Gestão Completo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Entrar
            </Button>
          </form>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Não tem uma conta?{' '}
              <Link href="/register" className="text-blue-600 hover:underline">
                Criar conta
              </Link>
            </p>
            <p className="mt-2 text-xs">
              <strong>Dica:</strong> Se você criou uma conta, verifique seu email e clique no link de confirmação antes de fazer login.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}