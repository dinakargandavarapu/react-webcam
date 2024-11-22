import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user", // Use "environment" for rear camera
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // videoRef.current.play();
        }
      } catch (err) {
        setError("Unable to access the camera.");
        console.error(err);
      }
    };

    startCamera();

    return () => {
      // Stop the video stream when component unmounts
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas reference is not available.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Unable to get canvas context.");
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (!videoWidth || !videoHeight) {
      console.error("Video dimensions are not available.");
      return;
    }

    const cropWidth = 300; // Desired width of the cropped image
    const cropHeight = 150; // Desired height of the cropped image

    // Set canvas size for cropping
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Calculate the center crop area
    const cropX = (videoWidth - cropWidth) / 2;
    const cropY = (videoHeight - cropHeight) / 2;

    // Draw the cropped area onto the canvas
    context.drawImage(
      video,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Convert the canvas content to a base64 image
    const croppedImage = canvas.toDataURL("image/png");
    setCapturedImage(croppedImage);
  };

  return (
    <div className="App">
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          {!capturedImage && (<><div className="camera-container">
            <video ref={videoRef} className="video" playsInline autoPlay></video>
            <div className="overlay">
              <div className="crop-box">
                <p>Position ID Here</p>
              </div>
            </div>
          </div>
          <button onClick={captureImage} className="capture-button">
            Capture
          </button></>)}
        </>
      )}
      {capturedImage && (
        <div className="result">
          <h2>Cropped Image:</h2>
          <img src={capturedImage} alt="Cropped ID" />
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default App;
