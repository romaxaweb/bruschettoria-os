"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const result = await response.json()

      if (!response.ok || !result.ok) {
        setError("Неправильний пароль")
        return
      }

      router.replace("/")
      router.refresh()
    } catch {
      setError("Помилка входу")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] p-6 text-white">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-2xl"
      >
        <div className="mb-7">
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-orange-300/70">
            Bruschettoria
          </div>

          <h1 className="text-2xl font-semibold">
            OS Login
          </h1>

          <p className="mt-2 text-sm text-white/40">
            Введіть пароль для доступу до системи
          </p>
        </div>

        <input
          autoFocus
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="Пароль"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/25 focus:border-orange-400/50"
        />

        {error ? (
          <p className="mt-3 text-sm text-red-400">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 w-full rounded-2xl bg-orange-400 px-4 py-3 font-medium text-black transition hover:bg-orange-300 disabled:opacity-50"
        >
          {loading ? "Вхід..." : "Увійти"}
        </button>
      </form>
    </main>
  )
}
