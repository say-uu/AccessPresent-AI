import { useEffect, useRef } from "react";

// Standard MediaPipe Hands skeleton connections (21-point model).
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // index
  [5, 9], [9, 10], [10, 11], [11, 12], // middle
  [9, 13], [13, 14], [14, 15], [15, 16], // ring
  [13, 17], [17, 18], [18, 19], [19, 20], // pinky
  [0, 17], // palm base
];

/**
 * Draws the hand skeleton over the webcam feed. Landmarks are expected to
 * already be in the same coordinate space as the displayed video (i.e.
 * pre-mirrored upstream by the gesture engine when mirroring is enabled).
 */
export default function HandLandmarkOverlay({ landmarks, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    if (!landmarks) return;

    ctx.strokeStyle = "rgba(99, 102, 241, 0.85)";
    ctx.lineWidth = 2;
    for (const [a, b] of HAND_CONNECTIONS) {
      const p1 = landmarks[a];
      const p2 = landmarks[b];
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    }

    landmarks.forEach((lm, i) => {
      const isTip = [4, 8, 12, 16, 20].includes(i);
      ctx.beginPath();
      ctx.arc(lm.x * width, lm.y * height, isTip ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = isTip ? "#4f7cff" : "#ffffff";
      ctx.strokeStyle = "rgba(79, 124, 255, 0.9)";
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();
    });
  }, [landmarks]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={480}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
