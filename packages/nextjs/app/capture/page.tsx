"use client";

import React, { useState, useRef, useEffect } from "react";
import piexif, { TagValues, dump, insert } from "piexif-ts";
import { v4 as uuidv4 } from 'uuid';
import { useAccount } from 'wagmi';
const snarkjs = require("snarkjs");
import { promises as fs } from 'fs';
import { error } from "console";
import {Image, ImageGallery, ImageOperation} from "../../utils/types";


// const wc = require("../../circuits/no_round_grayscale/no_round_js/witness_calculator.js");
// const { readFileSync, writeFile } = require("fs");

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

  const downloadProof = (proof: any, publicSignals: any) => {
    const data = {
      proof,
      publicSignals,
    };
  
    // Create a Blob from the data
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Create a link element to trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.download = "zk_proof.json";
  
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match video stream
      if (context && video.videoWidth && video.videoHeight) {
        // canvas.width = video.videoWidth;
        // canvas.height = video.videoHeight;

        canvas.width = 640;
        canvas.height = 480;

        // Draw video frame onto canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data URL from canvas
        let imageDataUrl = canvas.toDataURL("image/jpeg");

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data; // This contains RGBA values in a single array
  

        // Convert the data array into a matrix format
        const matrix = [];
        for (let y = 0; y < canvas.height; y++) {
          const row = [];
          for (let x = 0; x < canvas.width; x++) {
            const offset = (y * canvas.width + x) * 3;
            const red = data[offset];
            const green = data[offset + 1];
            const blue = data[offset + 2];
            row.push([red, green, blue]); // Each pixel as [R, G, B, A]
          }
          matrix.push(row); // Add the row to the matrix
        }

        const originalMatrixArray = [];
        for(let x = 0; x < matrix.length; x++){
          for(let y = 0; y <  matrix[x].length; y++) {
            originalMatrixArray.push(matrix[x][y]);
          }
        }

        const grayscaleDataArray = convertToGrayscale(originalMatrixArray);

        const positiveRemainders = new Array(grayscaleDataArray.length).fill(1000);
        const negativeRemainders = new Array(grayscaleDataArray.length).fill(0);

        const input = {
          "orig" : originalMatrixArray,
          "gray" : grayscaleDataArray,
          "positiveRemainder" : positiveRemainders,
          "negativeRemainder" : negativeRemainders
        };

        const wasmFilePath = "../../no_round_js/no_round.wasm";
        const zKeyFikePath = "../../no_round_js/no_round_0001.zkey";
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmFilePath, zKeyFikePath);
        console.log("Proof: ");
        console.log(JSON.stringify(proof, null, 1));
        console.log("Public Signals: ");
        console.log(JSON.stringify(publicSignals));

        const response = await fetch("no_round_js/verification_key.json");
        if (!response.ok) {
          throw new Error("failed to fetch file!!");
        }
        const verificationData  =  await response.text();
        const vKey = JSON.parse(verificationData);

        const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

        if (res === true) {
            console.log("Verification OK");
        } else {
            console.log("Invalid proof");
        }

        // Convert DataURL to binary string
        let imageDataBinary = imageDataUrl.replace("data:image/jpeg;base64,", "");

        const imageId = uuidv4();

        // Add EXIF metadata
        let exifObj = {
          "0th": {
            [TagValues.ImageIFD.Model]: JSON.stringify({
              imageId: imageId,
              version: 0,
              wallet: account.address,
              proof: proof,
              publicSignal: publicSignals,
              operation: ImageOperation.Capture
            }),
          }
        };

        let exifBytes = dump(exifObj);
        let newImageData = insert(exifBytes, imageDataUrl);

        // Set the captured image with metadata and save to localStorage
        setCapturedImage(newImageData);
        saveImageToLocalStorage(imageId, newImageData);
        // downloadProof(proof, publicSignals);

        // Stop the webcam
        stopWebcam();
      }
    }
  };

  const convertToGrayscale = (matrix: number[][]): number[] => {
    const grayScaled = [];
    let index = 0;
    for(let x = 0; x < matrix.length; x++) {
      const pixel = matrix[x];
      const gray = Math.floor(0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]);
      grayScaled[x] = gray;
    }
    return grayScaled;
  };

  const saveImageToLocalStorage = (imageId: string, imageDataUrl: string) => {
    const gallery: ImageGallery = JSON.parse(localStorage.getItem("webcamGallery") || "{}");
    const image = gallery[imageId] !== undefined ? gallery[imageId] : [];
    image.push({
      "imageId": imageId, 
      "version": 0, 
      "wallet": account.address, 
      data: imageDataUrl, 
      operation: ImageOperation.Capture
    });
    gallery[imageId] = image;
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
