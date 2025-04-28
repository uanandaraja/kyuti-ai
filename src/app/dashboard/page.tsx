"use client"

import { createAuthClient } from "better-auth/react"
const { useSession } = createAuthClient()
import { redirect } from "next/navigation"
import ImageUpload from "@/components/image-upload"
import { useGetPrompt } from "@/app/hooks/useGetPrompt"
import { useEditImage } from "@/app/hooks/useEditImage"
import { useGetImagebyId } from "@/app/hooks/useGetImagebyId"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ImagePopout } from "@/components/image-popout"

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
  const [currentImageId, setCurrentImageId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { mutate: editImage, isPending: isEditing } = useEditImage()
  const { data: currentImageData, isLoading: isLoadingImage } = useGetImagebyId(currentImageId || "")
  const currentImage = currentImageData?.[0]

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
          console.log("Image edit task triggered:", data)
          setCurrentImageId(data.data?.id || null)
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
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl mb-4">Hi, {session?.user?.name}!</h2>
          <a href="/dashboard/gallery" className="text-blue-500 hover:text-blue-600">Gallery</a>
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

            {currentImageId && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-medium">Processing your image...</h3>
                <div className="space-y-2">
                  {currentImage?.status === 'completed' && currentImage.editedUrl ? (
                    <div 
                      className="cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(currentImage.editedUrl)}
                    >
                      <img 
                        src={currentImage.editedUrl} 
                        alt="Edited" 
                        className="w-full h-64 object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <Skeleton className="w-full h-64 rounded-lg" />
                  )}
                </div>
                {currentImage?.status === 'processing' && (
                  <p className="text-sm text-gray-500 text-center">Your image is being processed. This may take a few moments...</p>
                )}
                {currentImage?.status === 'failed' && (
                  <p className="text-sm text-red-500 text-center">Failed to process image. Please try again.</p>
                )}
                {currentImage?.status === 'completed' && (
                  <p className="text-sm text-green-500 text-center">Image processing completed! Click the image to view and save.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      {selectedImage && (
        <ImagePopout
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  )
}