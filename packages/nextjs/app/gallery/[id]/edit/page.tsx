"use client"

import {Image} from "../../../../utils/types";


const GalleryImage = ({ params }: { params: { id: string } }) => {
    const image: Image | null = getImage(params.id);

    if (!image) {
        return <div>Image not found</div>;
    }

    return (
        <div className='relative w-full max-w-[400px] mx-auto mt-10'>
            <img src={image.data} alt={`Image ${image.imageId}`} className='w-full rounded-lg'/>
        </div>
    );
};

// Server-side data fetching with TypeScript
export const getImage = (imageId : string) => {
    const storedImages = localStorage.getItem("webcamGallery") || "{}";
    const parsedStoredImages = JSON.parse(storedImages);

    if(parsedStoredImages[imageId] !== undefined) {
        return parsedStoredImages[imageId][0];
    }

};

export default GalleryImage;
