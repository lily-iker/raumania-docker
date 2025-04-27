import React, { useState } from 'react';
import Image from "next/image";
import { X } from "lucide-react";

interface ProductImageProps {
  image: File;
  preview: string;
  onRemove: () => void;
}

export const ProductImage: React.FC<ProductImageProps> = ({ image, preview, onRemove }) => {
  return (
    <div className="relative w-24 h-24 m-1">
      <Image
        src={preview || "/placeholder.jpg"}
        alt={image.name}
        fill
        className="object-cover rounded-md"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
      >
        <X size={16} />
      </button>
    </div>
  );
};