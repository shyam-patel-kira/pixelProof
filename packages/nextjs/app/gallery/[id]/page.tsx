"use client"

import {Image, ImageGallery, ImageOperation} from "../../../utils/types";
import { ArrowDownIcon } from "@heroicons/react/24/outline";


const GalleryImage = ({ params }: { params: { id: string } }) => {
    const images: Image[] = getImages(params.id);

    if (!images.length) {
        return <div>Image not found</div>;
    }

    return images.map((image, index) => (
        <div className='relative w-full max-w-[400px] mx-auto mt-5 items-center' key={image.imageId}>
            <div className="flex flex-row justify-center items-center mx-auto mt-5">
            <div>Version: {image.version}</div>
            </div>
            <img src={image.data} alt={`Image ${image.imageId}`} className='w-full rounded-lg'/>
            <div className="flex flex-row justify-center items-center mx-auto mt-5">
                {index != images.length - 1 && <ArrowDownIcon className="h-8 w-8 fill-secondary"  />}
                {index != images.length - 1 && <div>{ImageOperation[images[index+1].operation]}</div>}
            </div>
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
