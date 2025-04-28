import { useQuery } from '@tanstack/react-query';

interface Image {
  id: string;
  userId: string;
  originalUrl: string;
  editedUrl: string | null;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export function useGetImagebyId(id: string) {
  return useQuery<Image[]>({
    queryKey: ['image', id],
    queryFn: async () => {
      const response = await fetch(`/api/image/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      return response.json();
    },
    enabled: !!id, // Only run the query if we have an ID
    refetchInterval: (query) => {
      // Only poll if the image is still processing
      return query.state.data?.[0]?.status === 'processing' ? 2000 : false;
    },
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
  });
}
