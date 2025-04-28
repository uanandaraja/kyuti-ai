import { useMutation } from '@tanstack/react-query';

interface EditImageResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const editImage = async (data: { file: File; prompt: string }): Promise<EditImageResponse> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('prompt', data.prompt);

  const response = await fetch('/api/image', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return { success: true, data: result };
};

export const useEditImage = () => {
  return useMutation({
    mutationFn: editImage,
  });
};
