'use client';

import { useState } from 'react';

interface ImageGalleryProps {
  images: { url: string }[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div>
      <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-4">
        {images?.[selectedImage]?.url ? (
          <img src={images[selectedImage].url} alt={productName} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
        )}
      </div>
      {images?.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <button key={idx} onClick={() => setSelectedImage(idx)} className={`h-20 rounded border-2 overflow-hidden ${selectedImage === idx ? 'border-blue-600' : 'border-gray-300'}`}>
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
