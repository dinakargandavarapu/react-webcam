import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [error, setError] = useState<string | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Fixed crop width (300px) and dynamic crop height (70% of video height)
  const cropWidth = 300;

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            const { videoWidth, videoHeight } = videoRef.current!;
            setVideoDimensions({ width: videoWidth, height: videoHeight });
          };
        }
      } catch (err) {
        setError("Unable to access the camera.");
        console.error(err);
      }
    };

    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

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

    // const cropHeight = videoHeight * 0.7; // Dynamic height (70% of video height)

    // Set canvas size to match crop area dimensions
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Calculate the crop position (centered in the video)
    // const cropX = (videoWidth - cropWidth) / 2;
    // const cropY = (videoHeight - cropHeight) / 2;

    // Draw the cropped area from the video onto the canvas
    context.drawImage(
      video,
      0,
      0,
      videoWidth,
      videoHeight,
    
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
          {!capturedImage && (
            <div className="camera-container">
              <video
                ref={videoRef}
                className="video"
                playsInline
                autoPlay
                style={{
                  transform: facingMode === "user" ? "scaleX(-1)" : "none", // Mirror for front camera
                }}
              ></video>
              <div className="overlay">
                <div className="crop-box">
                  <p>Position ID Here</p>
                </div>
              </div>
            </div>
          )}
          <div className="controls">
            {!capturedImage && (
              <button onClick={captureImage} className="capture-button">
                Capture
              </button>
            )}
            {!capturedImage && (
              <button onClick={toggleCamera} className="toggle-button">
                {facingMode === "user" ? "Switch to Rear Camera" : "Switch to Front Camera"}
              </button>
            )}
          </div>
        </>
      )}
      {capturedImage && (
        <div className="result">
          <h2>Cropped Image:</h2>
          <img src={capturedImage} alt="Cropped ID" />
          <button
            onClick={() => {
              setCapturedImage(null);
            }}
            className="retake-button"
          >
            Retake Photo
          </button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default App;
