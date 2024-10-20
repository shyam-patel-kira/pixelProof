# PixelProof Documentation

PixelProof is a zero-knowledge proof system for verifying grayscale image conversions without revealing the original images. This document provides setup instructions, explains the architecture, and details the zero-knowledge technology used.

## Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Architecture Overview](#architecture-overview)
3. [Component Details](#component-details)
4. [Zero-Knowledge Technology Explanation](#zero-knowledge-technology-explanation)
5. [Usage Guide](#usage-guide)

## Setup Instructions

1. **Prerequisites**:
   - Node.js (v14 or later)
   - npm (v6 or later)

2. **Installation**:
   ```bash
   git clone https://github.com/your-username/pixelproof.git
   cd pixelproof
   npm install
   ```

3. **Install Circom**:
   Follow the installation instructions from the [Circom documentation](https://docs.circom.io/getting-started/installation/).

4. **Install snarkjs**:
   ```bash
   npm install -g snarkjs
   ```

## Architecture Overview

PixelProof consists of several key components:

1. **Input Images**: Original color image and its grayscale conversion.
2. **Node.js Input Generator**: Processes images and generates JSON input.
3. **Circom Circuit**: Defines the constraints for grayscale verification.
4. **snarkjs**: Generates and verifies zero-knowledge proofs.
5. **ZK Proof**: The generated proof that can be verified without revealing the original data.
6. **Verifier**: Verifies the ZK proof.

## Component Details

### 1. Input Images
- Provide a color image and its grayscale conversion.
- Supported formats: PNG, JPEG.

### 2. Node.js Input Generator (`generate_input.js`)
- Extracts pixel data from both images.
- Calculates grayscale values and remainders.
- Outputs a JSON file with structured data for the Circom circuit.

### 3. Circom Circuit (`grayscale_checker.circom`)
- Implements the grayscale verification logic.
- Checks each pixel using the formula: 30R + 59G + 11B = 100 * gray + remainder.
- Ensures remainders are within acceptable bounds.

### 4. snarkjs
- Compiles the Circom circuit.
- Generates a zero-knowledge proof based on the circuit and input data.
- Provides verification functionality.

### 5. ZK Proof
- A cryptographic proof that the grayscale conversion is correct.
- Does not reveal any information about the original images.

### 6. Verifier
- Uses snarkjs to verify the generated proof.
- Confirms the validity of the grayscale conversion without accessing the original data.

## Zero-Knowledge Technology Explanation

PixelProof uses zk-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) to prove the correctness of grayscale conversion without revealing the actual image data.

Key concepts:
- **Zero-Knowledge**: The proof verifies the computation without revealing any information about the inputs.
- **Succinctness**: The proof is small and quick to verify, regardless of the computation's complexity.
- **Non-interactive**: The proof can be verified without further interaction with the prover.

The Circom language allows us to express the grayscale conversion constraints in a way that can be compiled into a zk-SNARK circuit. This circuit defines the rules that the proof must satisfy.

## Usage Guide

1. **Prepare Images**:
   Place your color image (`original.png`) and grayscale image (`grayscale.png`) in the project directory.

2. **Generate Input**:
   ```bash
   node generate_input.js
   ```
   This creates `input.json`.

3. **Compile Circom Circuit**:
   ```bash
   circom grayscale_checker.circom --r1cs --wasm --sym
   ```

4. **Generate ZK Proof**:
   ```bash
   snarkjs groth16 setup grayscale_checker.r1cs pot12_final.ptau grayscale_checker_0000.zkey
   snarkjs zkey contribute grayscale_checker_0000.zkey grayscale_checker_0001.zkey --name="First contribution" -v
   snarkjs zkey export verificationkey grayscale_checker_0001.zkey verification_key.json
   snarkjs groth16 prove grayscale_checker_0001.zkey witness.wtns proof.json public.json
   ```

5. **Verify Proof**:
   ```bash
   snarkjs groth16 verify verification_key.json public.json proof.json
   ```

   If the verification is successful, it confirms that the grayscale conversion is correct without revealing the original images.