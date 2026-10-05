import { useEffect, useRef, useState } from "react";

const SpeechRecognitionApi =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

/**
 * Wraps the browser's SpeechRecognition API into a live-captions feed: the
 * text of whatever the presenter is currently saying, replacing itself as
 * new speech comes in rather than accumulating a full transcript. Entirely
 * separate from the gesture engine — driven by the microphone, not the
 * camera — so it can run independently of camera/gesture state.
 *
 * Chrome/Edge only (no Firefox/Safari support at time of writing); callers
 * should check `supported` and degrade gracefully when it's false.
 */
export function useLiveCaptions({ active, language = "en-US" }) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const shouldListenRef = useRef(false);

  useEffect(() => {
    if (!SpeechRecognitionApi || !active) {
      setText("");
      return undefined;
    }

    shouldListenRef.current = true;
    setError(null);

    const recognition = new SpeechRecognitionApi();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let combined = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        combined += event.results[i][0].transcript;
      }
      setText(combined.trim());
    };

    // Chrome ends the recognition session periodically even in continuous
    // mode (e.g. after a stretch of silence); restart it for as long as
    // captions are still meant to be on, so they stay live for a whole talk.
    recognition.onend = () => {
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch {
          // Already starting; ignore.
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldListenRef.current = false;
        setError("Microphone access was denied.");
      }
      // Other errors (e.g. transient "no-speech") are left to onend's restart.
    };

    try {
      recognition.start();
    } catch {
      // Ignore double-start.
    }

    return () => {
      shouldListenRef.current = false;
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.stop();
      setText("");
    };
  }, [active, language]);

  return { supported: Boolean(SpeechRecognitionApi), text, error };
}
