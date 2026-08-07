"use client"

import { FormEvent, useRef, useState } from "react"

export default function LoginPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const password = inputRef.current?.value ?? ""

    if (!password) {
      setError("Введіть код доступу")
      return
    }

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
        setError("Неправильний код")
        return
      }

      window.location.assign("/")
    } catch {
      setError("Помилка входу")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#0b0908] px-5 text-white">
      <form
        onSubmit={submit}
        autoComplete="off"
        className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#15110f] p-7 shadow-2xl"
      >
        <div className="mb-7">
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-orange-300/80">
            Bruschettoria
          </div>

          <h1 className="text-2xl font-semibold">
            OS Login
          </h1>

          <p className="mt-2 text-sm text-white/40">
            Введіть код доступу
          </p>
        </div>

        <input
          ref={inputRef}
          name="access_code"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="6-значний PIN"
          maxLength={6}
          pattern="[0-9]*"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base text-white outline-none placeholder:text-white/25 focus:border-orange-400/50"
          style={{
            WebkitTextSecurity: "disc",
          } as React.CSSProperties}
        />

        {error && (
          <p className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full touch-manipulation rounded-2xl bg-[#ff9858] px-4 py-3.5 font-medium text-[#1a0e08] active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? "Вхід..." : "Увійти"}
        </button>
      </form>
    </main>
  )
}
