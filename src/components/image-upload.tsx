"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"

interface ImageUploadProps {
  onFileSelect?: (file: File) => void
}

export default function ImageUpload({ onFileSelect }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    const file = acceptedFiles[0]
    
    if (file && file.type.startsWith('image/')) {
      if (file.size > 25 * 1024 * 1024) {
        setError('file size must be less than 25mb')
        return
      }
      setPreview(URL.createObjectURL(file))
      onFileSelect?.(file)
    } else {
      setError('please upload an image file')
    }
  }, [setError, setPreview, onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-gray-600">
            {isDragActive ? (
              <p>drop the image here</p>
            ) : (
              <p>drag and drop an image, or click to select</p>
            )}
          </div>
          <p className="text-sm text-gray-500">supports: jpg, png, gif, webp (max 25mb)</p>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {preview && (
        <div className="mt-4">
          <img 
            src={preview} 
            alt="preview" 
            className="max-h-[300px] rounded-lg mx-auto object-contain"
          />
        </div>
      )}
    </div>
  )
}
