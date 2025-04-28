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
      <aside className="w-64 bg-gray-50 border-r hidden sm:block p-4">
        <div className="mb-8">
          <h1 className="text-xl font-medium">kyuti.ai</h1>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                Studio
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                Galeri
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <ul className="flex justify-around">
          <li>
            <a href="#" className="flex items-center gap-2">
              Studio
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-2">
              Galeri
            </a>
          </li>
        </ul>
      </nav>

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