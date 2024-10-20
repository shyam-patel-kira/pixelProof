"use client"

import { useRouter } from 'next/router';

interface Image {
    imageId: string;
    version: number;
    wallet: string;
    data: string;
    proof?: string;
}

interface GalleryImageProps {
    image: Image | null;
}

const GalleryImage = ({ params }: { params: { id: string } }) => {
    const images: Image[] = getImages(params.id);

    if (!images.length) {
        return <div>Image not found</div>;
    }

    return images.map(image => (
        <div className='relative w-full max-w-[400px] mx-auto mt-10'>
            <img src={image.data} alt={`Image ${image.imageId}`} className='w-full rounded-lg'/>
        </div>
    ));
};

// Server-side data fetching with TypeScript
export const getImages = (imageId : string) => {
    const storedImages = localStorage.getItem("webcamGallery") || "{}";
    const parsedStoredImages = JSON.parse(storedImages);

    if(parsedStoredImages[imageId] !== undefined) {
        return parsedStoredImages[imageId];
    }

};

export default GalleryImage;
