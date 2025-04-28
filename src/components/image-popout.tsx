import Image from 'next/image';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface ImagePopoutProps {
  imageUrl: string;
  onClose: () => void;
}

export function ImagePopout({ imageUrl, onClose }: ImagePopoutProps) {
  const handleSave = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-image.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="relative max-w-[80vw] max-h-[80vh] group"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt="Generated image"
          width={400}
          height={400}
          className="object-contain rounded-lg"
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="lg"
            onClick={handleSave}
            className="bg-white hover:bg-white/90 text-black font-semibold shadow-lg flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Save Image
          </Button>
        </div>
      </div>
    </div>
  );
} 