import { useQuery } from '@tanstack/react-query';

interface Prompt {
  id: string;
  promptName: string;
  promptText: string;
}

interface PromptResponse {
  prompts: Prompt[];
}

const fetchPrompts = async (): Promise<PromptResponse> => {
  const response = await fetch('/api/prompt');

  if (!response.ok) {
    throw new Error('Failed to fetch prompts');
  }

  return response.json();
};

export const useGetPrompt = () => {
  return useQuery({
    queryKey: ['prompts'],
    queryFn: fetchPrompts,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
};
