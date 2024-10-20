"use client";

import React, { useState, useRef, useEffect } from "react";
import piexif, { TagValues, dump, insert } from "piexif-ts";
import { v4 as uuidv4 } from 'uuid';
import { useAccount } from 'wagmi';

const Capture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const account = useAccount();

  // Start the webcam when the component mounts
  useEffect(() => {
    startWebcam();
    return () => stopWebcam(); // Cleanup the webcam when the component unmounts
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Request the front camera (selfie camera)
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMediaStream(stream);
    } catch (error) {
      console.error("Error accessing webcam", error);
    }
  };

  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match video stream
      if (context && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame onto canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data URL from canvas
        let imageDataUrl = canvas.toDataURL("image/jpeg");

        // Add EXIF metadata
        let exifObj = {
          "0th": {
            [TagValues.ImageIFD.Make]: "Custom Webcam",
            [TagValues.ImageIFD.Model]: "Webcam Capture",
            [TagValues.ImageIFD.ImageDescription]: "Captured using webcam",
            [TagValues.ImageIFD.Software]: "Custom App v1.0",
          },
          "Exif": {
            [TagValues.ExifIFD.UserComment]: JSON.stringify({
              imageId: uuidv4(),
              versionId: 0,
              wallet: account.address,
            }),
          },
        };

        let exifBytes = dump(exifObj);
        let newImageData = insert(exifBytes, imageDataUrl);

        // Set the captured image with metadata and save to localStorage
        setCapturedImage(newImageData);
        saveImageToLocalStorage(newImageData);

        // Stop the webcam
        stopWebcam();
      }
    }
  };

  const saveImageToLocalStorage = (imageDataUrl: string) => {
    const gallery = JSON.parse(localStorage.getItem("webcamGallery") || "[]");
    gallery.push(imageDataUrl);
    localStorage.setItem("webcamGallery", JSON.stringify(gallery));
  };

  const handleDownload = () => {
    if (capturedImage) {
      const link = document.createElement("a");
      link.href = capturedImage;
      link.download = "captured-image.jpg";

      // Trigger the download
      link.click();
      link.remove();
    }
  };

  const resetState = () => {
    stopWebcam();
    setCapturedImage(null);
    startWebcam();
  };

  return (
    <div className="relative w-full max-w-[400px] mx-auto mt-10">
      {capturedImage && (
        <>
          <img src={capturedImage} alt="Captured" className="w-full rounded-lg" />
          <div className="flex flex-col items-center">
            <button
              onClick={resetState}
              className="bg-white text-gray-800 border-none rounded-full py-2 px-4 text-lg cursor-pointer shadow-md mt-3"
            >
              Reset
            </button>
            <button
              onClick={handleDownload}
              className="bg-white text-gray-800 border-none rounded-full py-2 px-4 text-lg cursor-pointer shadow-md mt-3"
            >
              Download Image
            </button>
          </div>
        </>
      )}
  
      {!capturedImage && (
        <>
          <video ref={videoRef} autoPlay muted className="w-full rounded-lg" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex flex-col items-center">
          <button
            onClick={captureImage}
            className="bg-white text-gray-800 border-none rounded-full py-2 px-4 text-lg cursor-pointer shadow-md mt-3"
          >
            Capture Image
          </button>
          </div>
        </>
      )}
    </div>
  );  
};

export default Capture;
