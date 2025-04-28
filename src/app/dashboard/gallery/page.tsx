'use client';

import { useGetImages } from '@/app/hooks/useGetImages';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export default function GalleryPage() {
  const { data: images, isLoading, error } = useGetImages();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Gallery</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Gallery</h1>
        <div className="text-red-500">Error loading images. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images?.map((image) => (
          <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={image.editedUrl || image.originalUrl}
              alt="Generated image"
              fill
              className="object-cover"
            />
            {image.status === 'processing' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white">Processing...</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
