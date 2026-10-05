import { useCallback, useEffect, useRef, useState } from "react";

// Manages getUserMedia lifecycle: permission prompts, stream start/stop,
// and the distinct error states the UI needs to explain to the user.
// Camera state: "off" | "loading" | "on" | "denied" | "not_found" | "error"
export function useWebcam(videoRef) {
  const [cameraState, setCameraState] = useState("off");
  const streamRef = useRef(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState("off");
  }, [videoRef]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("not_found");
      return;
    }
    setCameraState("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("on");
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraState("denied");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraState("not_found");
      } else {
        setCameraState("error");
      }
    }
  }, [videoRef]);

  useEffect(() => stop, [stop]);

  return { cameraState, start, stop };
}
