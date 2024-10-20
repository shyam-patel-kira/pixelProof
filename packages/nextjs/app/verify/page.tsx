'use client'

import React, { useState } from 'react';
import { load, TagValues } from "piexif-ts";
import type { Image } from "../../utils/types";
const snarkjs = require("snarkjs");

const Verify = () => {
  const [imageSrc, setImageSrc] = useState<any>(null);
  const [processedSrc, setProcessedSrc] = useState<any>(null);
  const [zkProof, setZkProof] = useState<any>(null);
  const [publicSignals, setPublicSignals] = useState<any>(null);

  // Read the image file selected by the user
  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          const dataUrl = e.target.result;
          setImageSrc(dataUrl); // Display the image
          const exifData = load(dataUrl as string);
          console.log(exifData);
          if (exifData['0th']) {
            const deviceMode: Image = JSON.parse(exifData['0th'][TagValues.ImageIFD.Model]);
            console.log(deviceMode.imageId);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to handle the ZK proof upload
  const handleProofChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          const proofData = JSON.parse(e.target.result as string);
          setZkProof(proofData.proof); // Assuming 'proof' is the key in your JSON
          setPublicSignals(proofData.publicSignals); // Assuming 'publicSignals' is also a key
        }
      };
      reader.readAsText(file);
    }
  };

  // Function to validate ZK proof using snarkjs
  const validateProof = async () => {
    if (!zkProof || !publicSignals) {
      console.log("Please upload ZK proof and public signals");
      return;
    }

    try {
      const response = await fetch("no_round_js/verification_key.json");
      if (!response.ok) {
        throw new Error("Failed to fetch verification key!");
      }
      const verificationData = await response.text();
      const vKey = JSON.parse(verificationData);

      // Validate the ZK proof
      const res = await snarkjs.groth16.verify(vKey, publicSignals, zkProof);
      if (res === true) {
        console.log("Verification OK");
      } else {
        console.log("Invalid proof");
      }
    } catch (error) {
      console.error("Error during proof validation:", error);
    }
  };

  // Perform an operation on the image (e.g., grayscale filter)
  const applyFilter = () => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

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

      // Convert the canvas back to an image and display it
      setProcessedSrc(canvas.toDataURL());
    };
  };

  return (
    <div>
      <h1>Verify Image and ZK Proof</h1>

      {/* Image Upload Input */}
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {imageSrc && (
        <div>
          <h2>Original Image</h2>
          <img src={imageSrc} alt="Original" style={{ maxWidth: '300px' }} />
        </div>
      )}

      {/* Button to Apply Filter */}
      <button onClick={applyFilter} disabled={!imageSrc}>
        Apply Grayscale Filter
      </button>
      {processedSrc && (
        <div>
          <h2>Processed Image</h2>
          <img src={processedSrc} alt="Processed" style={{ maxWidth: '300px' }} />
        </div>
      )}

      {/* ZK Proof Upload Input */}
      <input type="file" accept=".json" onChange={handleProofChange} />
      
      {/* Button to Validate ZK Proof */}
      <button onClick={validateProof} disabled={!zkProof || !publicSignals}>
        Validate ZK Proof
      </button>
    </div>
  );
};

export default Verify;
