import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import piexif, {TagValues, dump, insert} from "piexif-ts";

// Define styled components for styling
const WebcamContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const WebcamVideo = styled.video`
  width: 100%;
  border-radius: 10px;
  /* Apply specific styles only for mobile devices */
  @media (max-width: 767px) {
    height: 100vh;
    object-fit: cover;
    border-radius: 0;
  }
`;

const PreviewImg = styled.img`
  width: 100%;
  border-radius: 10px;
  @media (max-width: 767px) {
    height: 100vh;
    object-fit: cover;
    border-radius: 0;
  }
`;

const WebcamCanvas = styled.canvas`
  display: none; /* Hide canvas by default */
`;

const WebcamButton = styled.button`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  color: #333;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WebcamCapture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // useEffect(() => {
  //   startWebcam();
  // }, []);

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

  // Function to stop the webcam
  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
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
  
        // Extract pixel data from the canvas and convert to matrix
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data; // This contains RGBA values in a single array
  
        // Convert the data array into a matrix format
        const matrix = [];
        for (let y = 0; y < canvas.height; y++) {
          const row = [];
          for (let x = 0; x < canvas.width; x++) {
            const offset = (y * canvas.width + x) * 4;
            const red = data[offset];
            const green = data[offset + 1];
            const blue = data[offset + 2];
            const alpha = data[offset + 3];
            row.push([red, green, blue, alpha]); // Each pixel as [R, G, B, A]
          }
          matrix.push(row); // Add the row to the matrix
        }
  
        // Log the matrix to the console
        console.log("Pixel Matrix:", matrix);
  
        // Convert DataURL to binary string
        let imageDataBinary = imageDataUrl.replace("data:image/jpeg;base64,", "");
  
        // Add EXIF metadata (e.g., UserComment or ImageDescription)
        let exifObj = {
          "0th": {
            [TagValues.ImageIFD.Make]: "Custom Webcam",
            [TagValues.ImageIFD.Model]: "Webcam Capture",
            [TagValues.ImageIFD.ImageDescription]: "Captured using webcam",
            [TagValues.ImageIFD.Software]: "Custom App v1.0",
          },
          "Exif": {
            [TagValues.ExifIFD.UserComment]: "This is a custom comment.",
          },
        };
  
        // Convert EXIF object to binary
        let exifBytes = dump(exifObj);
  
        // Insert EXIF data into the image binary string
        let newImageData = insert(exifBytes, imageDataUrl);
  
        // Set the captured image with metadata
        setCapturedImage(newImageData);
        
        saveImage(newImageData, "captured_image_with_metadata");
        
        // Stop the webcam
        stopWebcam();
      }
    }
  };
  
  

  const saveImage = (imageDataUrl: any, fileName: any) => {
    // Create a Blob from the Data URL
    const link = document.createElement("a");
    link.href = imageDataUrl; // Set the URL for the Blob
    link.download = `${fileName}.jpg`; // Set the filename for download
    document.body.appendChild(link); // Append to body (required for Firefox)
    link.click(); // Trigger the download
    document.body.removeChild(link); // Clean up
  };

  // Function to reset state (clear media stream and refs)
  const resetState = () => {
    stopWebcam(); // Stop the webcam if it's active
    setCapturedImage(null); // Reset captured image
  };

  return (
    <WebcamContainer>
      {capturedImage ? (
        <>
          <PreviewImg src={capturedImage} className="captured-image" />
          <WebcamButton onClick={resetState}>Reset</WebcamButton>
        </>
      ) : (
        <>
          <WebcamVideo ref={videoRef} autoPlay muted />
          <WebcamCanvas ref={canvasRef} />
          {!videoRef.current ? (
            <>
              <WebcamButton
                onClick={startWebcam}
                style={{ backgroundColor: "#333", color: "#fff" }}
              >
                Start Webcam
              </WebcamButton>
            </>
          ) : (
            <WebcamButton onClick={captureImage}>Capture Image</WebcamButton>
          )}
        </>
      )}
    </WebcamContainer>
  );
};

export default WebcamCapture;
