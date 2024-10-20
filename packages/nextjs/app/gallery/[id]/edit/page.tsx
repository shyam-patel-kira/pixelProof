"use client";

import React, {useState} from "react";
import type { Image } from "../../../../utils/types";
import { ImageOperation } from "../../../../utils/types";

const GalleryImage = ({ params }: { params: { id: string } }) => {
  const image: Image | null = getImage(params.id);
  const [imageSt, setImageSt] = useState(image);

  const updateImage = (updatedImageData: string, operation: ImageOperation) => {
    if(!image) {
        return;
    }
    const updatedImage: Image = JSON.parse(JSON.stringify(imageSt));
    updatedImage.data = updatedImageData;
    updatedImage.version++;
    updatedImage.operation = operation;

    const storedImages = localStorage.getItem("webcamGallery") || "{}";
    const parsedStoredImages = JSON.parse(storedImages);
    parsedStoredImages[image.imageId].push(updatedImage);
    localStorage.setItem("webcamGallery", JSON.stringify(parsedStoredImages));
    setImageSt(updatedImage);
  }

  // Perform an operation on the image (e.g., grayscale filter)
  const applyGrayScaleFilter = () => {
    if (!image) return;

    const img = new Image();
    img.src = image.data;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return;
      }

      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image on the canvas
      ctx.drawImage(img, 0, 0);

      // Get the image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply a grayscale filter to the image
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Calculate the grayscale value
        const gray = 0.3 * r + 0.59 * g + 0.11 * b;
        // Set the red, green, and blue channels to the grayscale value
        data[i] = data[i + 1] = data[i + 2] = gray;
      }

      // Put the modified data back to the canvas
      ctx.putImageData(imageData, 0, 0);

      updateImage(canvas.toDataURL(), ImageOperation.GrayScale);
    };
  };

  if (!image) {
    return <div>Image not found</div>;
  }

  return (
    <div className="relative w-full max-w-[400px] mx-auto mt-10">
      {imageSt && <img src={imageSt.data} alt={`Image ${imageSt.imageId}`} className="w-full rounded-lg" />}
      <div className="flex flex-col items-center">
            <button
              onClick={applyGrayScaleFilter}
              className="bg-white text-gray-800 border-none rounded-full py-2 px-4 text-lg cursor-pointer shadow-md mt-3"
            >
              Apply grayscale
            </button>
          </div>
    </div>
  );
};

// Server-side data fetching with TypeScript
export const getImage = (imageId: string) => {
  const storedImages = localStorage.getItem("webcamGallery") || "{}";
  const parsedStoredImages = JSON.parse(storedImages);

  if (parsedStoredImages[imageId] !== undefined) {
    return parsedStoredImages[imageId][parsedStoredImages[imageId].length - 1];
  }
};

export default GalleryImage;
