import { useQuery } from '@tanstack/react-query';

interface Image {
  id: string;
  userId: string;
  originalUrl: string;
  editedUrl: string | null;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export function useGetImages() {
  return useQuery<Image[]>({
    queryKey: ['images'],
    queryFn: async () => {
      const response = await fetch('/api/image', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
}
