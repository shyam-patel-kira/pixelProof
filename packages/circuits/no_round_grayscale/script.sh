#!/bin/bash

# Generate input data
python generate_grayscale_inputs.py

# Compile the circuit
circom no_round.circom --r1cs --wasm --sym

# Generate witness
node no_round_js/generate_witness.js no_round_js/no_round.wasm input.json witness.wtns

# Setup zk-SNARK (assuming you've already generated pot12_final.ptau)
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
snarkjs groth16 setup no_round.r1cs pot12_final.ptau no_round_0000.zkey
snarkjs zkey contribute no_round_0000.zkey no_round_0001.zkey --name="1st Contributor Name" -v
snarkjs zkey export verificationkey no_round_0001.zkey verification_key.json

# Generate proof
snarkjs groth16 prove no_round_0001.zkey witness.wtns proof.json public.json

# Verify proof
snarkjs groth16 verify verification_key.json public.json proof.json

# Generate parameters
snarkjs generatecall >> parameters.json

# Check the exit status
if [ $? -eq 0 ]; then
    echo "Proof verified successfully!"
else
    echo "Proof verification failed."
fi