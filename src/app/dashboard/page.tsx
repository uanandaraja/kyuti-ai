"use client"

import { createAuthClient } from "better-auth/react"
const { useSession } = createAuthClient()
import { redirect } from "next/navigation"

export default function Dashboard() {
  const {
    data: session,
    isPending,
    error,
  } = useSession()

  if (isPending) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl mb-4">Hi, {session?.user?.name}!</h2>
          <div className="bg-white rounded-lg border p-4">
            to do here
          </div>
        </div>
      </main>
    </div>
  )
}