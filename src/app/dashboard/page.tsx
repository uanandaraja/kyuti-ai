"use client"

import { createAuthClient } from "better-auth/react"
const { useSession } = createAuthClient()
import { redirect } from "next/navigation"
import ImageUpload from "@/components/image-upload"
import { useGetPrompt } from "@/app/hooks/useGetPrompt"
import { useEditImage } from "@/app/hooks/useEditImage"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Dashboard() {
  const {
    data: session,
    isPending,
    error,
  } = useSession()

  const { data: promptsData, isLoading: isLoadingPrompts } = useGetPrompt()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedPromptId, setSelectedPromptId] = useState<string>("")
  const [preview, setPreview] = useState<string | null>(null)
  const { mutate: editImage, isPending: isEditing } = useEditImage()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !selectedPromptId) return

    const selectedPrompt = promptsData?.prompts.find(p => p.id === selectedPromptId)
    if (!selectedPrompt) return

    editImage(
      { file: selectedFile, prompt: selectedPrompt.promptText },
      {
        onSuccess: (data) => {
          console.log("Image edited successfully:", data)
          // You can add success handling here
        },
        onError: (error) => {
          console.error("Error editing image:", error)
        },
      }
    )
  }

  if (isPending || isLoadingPrompts) {
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
          <div className="bg-white rounded-lg border p-4 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageUpload onFileSelect={handleFileSelect} />
              
              <div className="space-y-2">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                  Select Edit Style
                </label>
                <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    {promptsData?.prompts.map((prompt) => (
                      <SelectItem key={prompt.id} value={prompt.id}>
                        {prompt.promptName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                disabled={!selectedFile || !selectedPromptId || isEditing}
                className="w-full"
              >
                {isEditing ? "Editing..." : "Edit Image"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}