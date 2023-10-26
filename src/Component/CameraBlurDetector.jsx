/* eslint-disable no-undef */

import React, { useState, useRef, useEffect } from "react";
import openCV from 'react-opencvjs'

const CameraBlurDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageDivRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(()=>{
    openCV({
      onLoaded: () => console.log('open cv loaded'),
      onFailed: () => console.log('open cv failed to load'),
      version: '4.5.1'
    })
  },[])
  
  useEffect(() => {
    return () => {
      if (stream) {
        stopCamera();
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const constraints = { video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      videoRef.current.srcObject = stream;

      videoRef.current.oncanplay = () => {
        videoRef.current.play();
        setIsCameraOn(true);
        setStream(stream);
        document.getElementById("p1").innerHTML =
          "Click on Capture Image button to click the image";
      };
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  const captureImage = () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const ctx = canvasElement.getContext("2d");

    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;

    ctx.drawImage(
      videoElement,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    const imgData = canvasElement.toDataURL("image/jpeg");

    const imgElement = new Image();
    imgElement.onload = () => {
      detectBlur(imgElement);
      imageDivRef.current.innerHTML = "";
      imageDivRef.current.appendChild(imgElement);
    };
    imgElement.src = imgData;
  };

  const stopCamera = () => {
    if (stream) {
      const videoElement = videoRef.current;
      videoElement.srcObject = null;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraOn(false);
      setStream(null);
      document.getElementById("p1").innerHTML =
        "Click on Start Camera button to start the transaction";
      imageDivRef.current.innerHTML = "";
    }
  };

  const detectBlur = (imgElement) => {
    const src = cv.imread(imgElement)
    const dst = new cv.Mat();
    const men = new cv.Mat();
    const menO = new cv.Mat();

    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
    const t = cv.Laplacian(src, dst, cv.CV_64F, 1, 1, 0, cv.BORDER_DEFAULT);

    console.log(
      t,
      cv.meanStdDev(dst, menO, men),
      menO.data64F[0],
      men.data64F[0]
    );
    if (men.data64F[0] > 10) {
      document.getElementById("p1").innerHTML = "Perfect, you are good to go!";
    } else {
      document.getElementById("p1").innerHTML =
        "Blur, please try again with better quality";
    }

    src.delete();
    dst.delete();
    men.delete();
    menO.delete();
  };

  return (
    <div>
      <video ref={videoRef} autoPlay={isCameraOn}></video>
      {isCameraOn ? (
        <>
          <button onClick={captureImage}>Capture Image</button>
          <button onClick={stopCamera}>Stop Camera</button>
        </>
      ) : (
        <button onClick={startCamera}>Start Camera</button>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      <p id="p1">Click on Start Camera button to start the transaction</p>
      <div ref={imageDivRef}></div>
    </div>
  );
};


export default CameraBlurDetector;
