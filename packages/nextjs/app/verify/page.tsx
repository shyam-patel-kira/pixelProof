'use client'

import React, { useState } from 'react';
import { load, TagValues } from "piexif-ts";
import { ethers } from 'ethers';
const snarkjs = require("snarkjs");
import YourContractABI from '../verify/contract.json';
const Verify = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [zkProof, setZkProof] = useState<any>(null);
  const [publicSignals, setPublicSignals] = useState<any>(null);
   // Ethereum provider (MetaMask or any other provider)
   const provider = new ethers.providers.Web3Provider(window.ethereum);
   const contractAddress = ""; // Replace with your contract address
   const contract = new ethers.Contract("0x02831dbc00bc6832752496c00b354bd1a1246406", YourContractABI, provider);

  // Read the image file selected by the user
  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          const dataUrl = e.target.result as string;
          setImageSrc(dataUrl); // Display the image

          try {
            const exifData = load(dataUrl); // Load EXIF data
            console.log("EXIF Data:", exifData);

            // Check if EXIF data contains the required proof and signals
            if (exifData['0th']) {
              const proofData = JSON.parse(exifData['0th'][TagValues.ImageIFD.Model]);
              console.log("Proof Data:", proofData);

              // Set zkProof and publicSignals
              setZkProof(proofData.proof); // Use the extracted proof
              setPublicSignals(proofData.publicSignal); // Use the extracted public signals
            }
          } catch (error) {
            console.error("Error reading EXIF data:", error);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to validate ZK proof using snarkjs
  const validateProof = async () => {
    if (!zkProof || !publicSignals) {
      setVerificationResult("No proof or public signals found.");
      return;
    }

    try {
      const response = await fetch("no_round_js/verification_key.json");
      if (!response.ok) {
        throw new Error("Failed to fetch verification key!");
      }
      const verificationData = await response.json();

      // Validate the ZK proof
      const res = await snarkjs.groth16.verify(verificationData, publicSignals, zkProof);

      if (res === true) {
        
          setVerificationResult("Verification Successful!");
          console.log(zkProof)
        const temp  = [
            [zkProof.pi_b[0][1], zkProof.pi_b[0][0]],
            [zkProof.pi_b[1][1], zkProof.pi_b[1][0]]
          ]
          // Prepare proof parameters for the smart contract call
          const _pA = zkProof.pi_a.slice(0, 2); // Assuming zkProof contains proof.A
          const _pB = temp; // Assuming zkProof contains proof.B
          const _pC = zkProof.pi_c.slice(0, 2); // Assuming zkProof contains proof.C
          const _pubSignals = publicSignals[0]; // Public signals
  
          // Call the smart contract verifyProof function
          const result = await contract.verifyProof(_pA, _pB, _pC, [_pubSignals]);
          if (result) {
            setVerificationResult("Smart Contract Verification Successful!");
          } else {
            setVerificationResult("Smart Contract Verification Failed.");
          }
      } else {
        setVerificationResult("Invalid Proof.");
      }
    } catch (error) {
      console.error("Error during proof validation:", error);
      setVerificationResult("Error during proof validation.");
    }
  };

  return (
    <div className="container">
      <h1 className="text-center text-lg">Verify Image and ZK Proof</h1>

      {/* Image Upload Input */}
      <input className="file-input" type="file" accept="image/*" onChange={handleImageChange} />
      {imageSrc && (
        <div className="image-container">
          <h2 className="subtitle">Uploaded Image</h2>
          <img src={imageSrc} alt="Uploaded" className="image-preview" />
        </div>
      )}

      {/* Show Validate ZK Proof Button when proof and signals are available */}
      {zkProof && publicSignals && (
        <button className="btn" onClick={validateProof}>
          Validate ZK Proof
        </button>
      )}

      {/* Display Verification Result */}
      {verificationResult && (
        <div className={`verification-result ${verificationResult.includes("Successful") ? "success" : "error"}`}>
          {verificationResult}
        </div>
      )}

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333;
        }

        .subtitle {
          font-size: 20px;
          margin-bottom: 10px;
          color: #555;
        }

        .file-input {
          margin-bottom: 20px;
        }

        .image-container {
          margin: 20px 0;
        }

        .image-preview {
          max-width: 300px;
          border: 2px solid #ddd;
          border-radius: 8px;
        }

        .btn {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-bottom: 20px;
        }

        .verification-result {
          font-size: 18px;
          padding: 10px;
          border-radius: 5px;
          margin-top: 20px;
          text-align: center;
        }

        .success {
          background-color: #d4edda;
          color: #155724;
        }

        .error {
          background-color: #f8d7da;
          color: #721c24;
        }
      `}</style>
    </div>
  );
};

export default Verify;
