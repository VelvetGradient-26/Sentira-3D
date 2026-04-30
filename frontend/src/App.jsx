import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";

// --- INLINE ICONS (Bypassing the lucide-react hook error) ---
const BrainCircuit = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M9 13a4.5 4.5 0 0 0 3-4" />
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
    <path d="M6 18a4 4 0 0 1-1.967-.516" />
    <path d="M12 13h4" />
    <path d="M12 18h6a2 2 0 0 1 2 2v1" />
    <path d="M12 8h8" />
    <path d="M16 8V5a2 2 0 0 1 2-2" />
    <circle cx="16" cy="13" r=".5" />
    <circle cx="18" cy="3" r=".5" />
    <circle cx="20" cy="21" r=".5" />
    <circle cx="20" cy="8" r=".5" />
  </svg>
);

const Send = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const Loader2 = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const Activity = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const AlertCircle = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
// -----------------------------------------------------------

export default function App() {
  const mountRef = useRef(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Mutable reference to hold our Three.js animation targets
  const animConfig = useRef({
    targetColor: new THREE.Color(0x60a5fa), // Brighter Blue (Tailwind Blue 400)
    targetScale: 1.0,
    speed: 0.0005, // Slower, soothing ambient speed
  });

  // --------------------------------------------------------
  // THREE.JS SCENE SETUP
  // --------------------------------------------------------
  useEffect(() => {
    const currentMount = mountRef.current;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // 2. Create Particle System
    const particleCount = 6000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    // Create a sphere of particles
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 4 * Math.random();
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i] = radius * Math.sin(phi) * Math.cos(theta); // x
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta); // y
      positions[i + 2] = radius * Math.cos(phi); // z
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05, // Increased size for brightness
      color: 0x60a5fa,
      transparent: true,
      opacity: 1.0, // Full opacity
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 10;

    // 3. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smoothly transition color (Lerp)
      material.color.lerp(animConfig.current.targetColor, 0.05);

      // Smoothly transition scale (Lerp)
      const targetScaleVector = new THREE.Vector3(
        animConfig.current.targetScale,
        animConfig.current.targetScale,
        animConfig.current.targetScale,
      );
      particles.scale.lerp(targetScaleVector, 0.05);

      // Rotate particles based on dynamic speed
      particles.rotation.y += animConfig.current.speed;
      particles.rotation.x += animConfig.current.speed * 0.2; // Slower secondary axis

      renderer.render(scene, camera);
    };

    animate();

    // 4. Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      currentMount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // --------------------------------------------------------
  // API INTEGRATION & LOGIC
  // --------------------------------------------------------
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const analyzeSentiment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    // Reset to neutral during loading
    animConfig.current.targetColor.setHex(0x8b5cf6); // Purple pulse for thinking
    animConfig.current.targetScale = 1.2;
    animConfig.current.speed = 0.003; // Smooth loading speed

    try {
      // Attempt to hit the local FastAPI server
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Backend unavailable");

      const data = await res.json();
      applySentimentTo3D(data);
    } catch (err) {
      console.error("Backend error:", err);
      setLoading(false);
      setError(
        "Model is offline. Please ensure the backend server is running.",
      );

      // Show error animation
      animConfig.current.targetColor.setHex(0xef4444); // Red for error
      animConfig.current.targetScale = 1.5;
      animConfig.current.speed = 0.002;
    }
  };

  const applySentimentTo3D = (data) => {
    setResult(data);
    setLoading(false);

    if (data.sentiment === "Positive") {
      animConfig.current.targetColor.setHex(0x10b981); // Tailwind Emerald 500
      animConfig.current.targetScale = 1.8;
      animConfig.current.speed = 0.005; // Gentle spin for result
    } else {
      animConfig.current.targetColor.setHex(0xef4444); // Tailwind Red 500
      animConfig.current.targetScale = 1.8;
      animConfig.current.speed = 0.005; // Gentle spin for result
    }
  };

  const resetState = () => {
    setText("");
    setResult(null);
    setError(null);
    animConfig.current.targetColor.setHex(0x60a5fa); // Back to brighter blue
    animConfig.current.targetScale = 1.0;
    animConfig.current.speed = 0.0005; // Back to ambient speed
  };

  // --------------------------------------------------------
  // UI RENDER
  // --------------------------------------------------------
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
          .font-modern { font-family: 'Plus Jakarta Sans', sans-serif; }
        `}
      </style>

      <div className="relative w-full h-screen bg-neutral-950 text-white overflow-hidden font-modern">
        {/* 3D Canvas Background */}
        <div ref={mountRef} className="absolute inset-0 z-0 opacity-100" />

        {/* Main UI Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 pointer-events-none">
          {/* Header */}
          <div className="absolute top-8 text-center animate-fade-in-down">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BrainCircuit className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Sentira-3D
              </h1>
            </div>
            <p className="text-neutral-400 text-sm tracking-widest uppercase">
              Sentiment Classification using DistilBERT
            </p>
          </div>

          {/* Central Glassmorphism Card */}
          <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl pointer-events-auto transition-all duration-500">
            <form onSubmit={analyzeSentiment} className="flex flex-col gap-4">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a tweet or sentence here..."
                  className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-400/30 resize-none h-32 transition-all"
                  disabled={loading}
                />
                <div className="absolute bottom-3 right-3 text-xs text-neutral-500 font-mono">
                  {text.length} / 140
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetState}
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 text-neutral-300 transition-all duration-300 text-sm font-medium"
                >
                  Reset
                </button>

                {/* Updated Glassmorphic Button */}
                <button
                  type="submit"
                  disabled={!text.trim() || loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 backdrop-blur-md disabled:bg-neutral-800/20 disabled:border-transparent disabled:text-neutral-600 disabled:shadow-none text-blue-50 rounded-xl py-3 font-medium transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Predict Sentiment
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Panel */}
            {error && (
              <div className="mt-8 p-5 bg-red-500/10 rounded-2xl border border-red-500/30 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-400">
                    Connection Error
                  </h3>
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>

                <div className="flex items-center">
                  <div>
                    <div className="text-lg font-semibold text-red-400">
                      {error}
                    </div>
                    <div className="text-xs text-neutral-500 mt-2">
                      Backend URL: {API_URL}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Panel */}
            {result && !error && (
              <div className="mt-8 p-5 bg-black/20 rounded-2xl border border-white/5 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-400">
                    Analysis Result
                  </h3>
                  <Activity
                    className={`w-5 h-5 ${result.sentiment === "Positive" ? "text-emerald-400" : "text-red-400"}`}
                  />
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div
                      className={`text-4xl font-bold ${result.sentiment === "Positive" ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {result.sentiment}
                    </div>
                    <div className="text-sm text-neutral-500 mt-1">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                      Inference Time
                    </div>
                    <div className="text-lg font-mono text-blue-300">
                      {result.inference_time_ms.toFixed(2)} ms
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
