import numpy as np
from PIL import Image
import json

def generate_input_json(color_image, bw_image):
    # Open and convert images to numpy arrays
    original = np.array(color_image.convert('RGB'))
    gray = np.array(bw_image.convert('L'))

    # Ensure images are the same size
    assert original.shape[:2] == gray.shape, "Images must have the same dimensions"

    # Reshape arrays
    original = original.reshape(-1, 3)
    gray = gray.flatten()

    # Calculate expected grayscale values (full scale)
    calc_full = np.dot(original, [30, 59, 11])

    # Calculate remainders (corrected)
    remainders = calc_full - (gray * 100)

    # Split remainders into positive and negative (corrected)
    positive_remainders = np.maximum(remainders, 0)
    negative_remainders = np.maximum(-remainders, 0)

    # Prepare inputs in the format expected by the circuit
    inputs = {
        "orig": original.tolist(),
        "gray": gray.tolist(),
        "positiveRemainder": positive_remainders.tolist(),
        "negativeRemainder": negative_remainders.tolist()
    }

    # Print debug information
    print("Debug Information:")
    for i in range(len(gray)):
        print(f"\nPixel {i}:")
        print(f"  Original RGB: {original[i]}")
        print(f"  Calculated grayscale (full scale): {calc_full[i]}")
        print(f"  Given grayscale: {gray[i]}")
        print(f"  Scaled given grayscale (100 * gray): {gray[i] * 100}")
        print(f"  Remainder: {remainders[i]}")
        print(f"  Positive remainder: {positive_remainders[i]}")
        print(f"  Negative remainder: {negative_remainders[i]}")

    return inputs

# Process the images
color_img = Image.open('demo.jpeg')
bw_img = Image.open('demo-gray.jpg')

# Generate input JSON
input_data = generate_input_json(color_img, bw_img)

# Save inputs to JSON file
with open('input.json', 'w') as f:
    json.dump(input_data, f)

print("\nInput data generated and saved to input.json")
print(f"Number of pixels processed: {len(input_data['gray'])}")