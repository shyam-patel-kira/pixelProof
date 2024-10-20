"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Image {
    imageId: string;
    version: number;
    wallet: string;
    data: string;
    proof?: string;
}

interface ImageGallery {
    [key: string]: Image[]
}


const Gallery: React.FC = () => {
  const [images, setImages] = useState<ImageGallery>({});
  const router = useRouter();

  useEffect(() => {
    const storedImages = localStorage.getItem("webcamGallery");
    if (storedImages) {
      setImages(JSON.parse(storedImages));
    }
  }, []);

  const handleViewHistory = (imageId: string) => {
    router.push(`/gallery/${imageId}`);
  };

  const handleEdit = (imageId: string) => {
    router.push(`/gallery/${imageId}/edit`);
    // console.log("Editing image:", image);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => router.push("/")}
        className="mt-4 mb-6 bg-white text-gray-800 border-none rounded-full px-6 py-2 text-lg cursor-pointer shadow hover:bg-gray-100 transition-colors"
      >
        Back
      </button>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {Object.keys(images).length === 0 ? (
          <div className="text-center text-gray-600">No images found in gallery.</div>
        ) : (
          Object.keys(images).map((key, index) => {
            const image = images[key][0];
            return (
                <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 text-center w-48"
                >
                <img
                    src={image.data}
                    alt={`Captured ${index + 1}`}
                    className="w-full rounded-lg mb-4"
                />
                <button
                    onClick={() => handleViewHistory(image.imageId)}
                    className="mb-2 bg-white text-gray-800 border-none rounded-full px-4 py-2 text-sm cursor-pointer shadow hover:bg-gray-100 transition-colors"
                >
                    View History
                </button>
                <button
                    onClick={() => handleEdit(image.imageId)}
                    className="bg-white text-gray-800 border-none rounded-full px-4 py-2 text-sm cursor-pointer shadow hover:bg-gray-100 transition-colors"
                >
                    Edit
                </button>
                </div>
          )})
        )}
      </div>
    </div>
  );
};

export default Gallery;
