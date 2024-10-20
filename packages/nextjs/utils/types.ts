export enum ImageOperation {
    Capture,
    GrayScale,
}

export interface Image {
    imageId: string;
    version: number;
    wallet: string | undefined;
    data: string;
    proof?: string;
    publicSignal?: string;
    operation: ImageOperation;
}

export interface ImageGallery {
    [key: string]: Image[]
}