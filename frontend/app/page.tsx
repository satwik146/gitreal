"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Send,
  Wifi,
  Lock,
  ChevronRight,
  Eye,
  EyeOff,
  Upload,
  ArrowRight,
  FileText,
  Code
} from 'lucide-react';
import axios from 'axios';

// --- CUSTOM CSS (Merged: Matrix Theme + User's Glitch/Typewriter Effects) ---
const customStyles = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');

:root {
  --neon-green: #00FF41;
  --neon-red: #FF1744;
  --neon-blue: #00FFFF;
  --neon-yellow: #FFFF33;
  --dark-bg: #050505;
}

body {
  background-color: var(--dark-bg);
  color: var(--neon-green);
  font-family: 'JetBrains Mono', monospace;
  overflow-x: hidden;
}

/* --- CRT & GLOBAL GLITCH EFFECTS --- */
.scanlines::before {
  content: " ";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(
    to bottom,
    rgba(18, 16, 16, 0) 50%,
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 4px;
  z-index: 10;
  pointer-events: none;
}

@keyframes flicker {
  0% { opacity: 0.99; }
  5% { opacity: 0.98; }
  10% { opacity: 0.97; }
  15% { opacity: 0.98; }
  20% { opacity: 0.99; }
  50% { opacity: 0.98; }
  100% { opacity: 0.99; }
}

.crt-flicker {
  animation: flicker 0.2s infinite;
}

/* Scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #000; }
::-webkit-scrollbar-thumb { background: #003300; border: 1px solid #00FF41; }

/* --- MORPHEUS SPECIFIC STYLES --- */
.morpheus-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* --- PREMIUM GLITCH EFFECT (User Provided) --- */
.glasses-text {
  position: absolute;
  top: 13%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2.5rem;
  font-weight: 1000;
  letter-spacing: 3px;
  z-index: 20;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 0px; /* Reduced gap */
  align-items: center;
  /* Ensure container doesn't block clicks if needed, though text is pointer-events: none usually */
  pointer-events: none;
}

.glitch {
  position: relative;
  color: white; /* Base color */
  mix-blend-mode: hard-light;
  background: black;
  /* Equalize box sizes */
  width: 100px;
  text-align: center;
  display: inline-block;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black; /* Opaque background masks the original */
}

.glitch::before {
  left: 2px;
  text-shadow: -1px 0 red;
  animation: noise-anim 2s infinite linear alternate-reverse;
}

.glitch::after {
  left: -2px;
  text-shadow: -1px 0 blue;
  animation: noise-anim 2s infinite linear alternate-reverse;
  animation-delay: 1s; /* Offset for variation */
}

@keyframes noise-anim {
  0% { clip-path: inset(40% 0 61% 0); }
  20% { clip-path: inset(92% 0 1% 0); }
  40% { clip-path: inset(43% 0 1% 0); }
  60% { clip-path: inset(25% 0 58% 0); }
  80% { clip-path: inset(54% 0 7% 0); }
  100% { clip-path: inset(58% 0 43% 0); }
}

/* Specific Colors for GIT and REAL */
.text-git {
  color: #FF1744;
}
.text-real {
  color: #00FFFF;
}

/* Override shadows for the glitch layers to match the text color roughly or keep red/blue as requested? 
   User code had red/blue hardcoded. I will keep red/blue as per user snippet. 
   But the base text has specific colors. 
   I will let the base text color shine through or be overridden?
   User said "don't make text glitch but background will be glitch".
   The pseudo elements have background: black. 
   So they will cover the text.
   And they have text-shadow.
   So the visible text will be the pseudo-elements mostly?
   Or the clip-path reveals the underlying text?
   clip-path: inset(...) cuts the element.
   So the pseudo-element is mostly invisible (clipped out), revealing the base text.
   Where it is NOT clipped, it shows black background + colored text shadow.
   This creates the "glitch" effect on top of the base text.
   Correct.
*/

.pill-zone {
  position: absolute;
  width: 14%; 
  height: 14%;
  border-radius: 50%;
  cursor: pointer;
  z-index: 30;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* RED PILL (User's LEFT / Morpheus' Right Hand) */
.pill-red {
  top: 77%; 
  left: 12%;
  box-shadow: 0 0 20px rgba(255, 23, 68, 0);
}
.pill-red:hover {
  box-shadow: 0 0 100px rgba(255, 23, 68, 1), 0 0 150px rgba(255, 23, 68, 0.5);
  background: radial-gradient(circle, rgba(255,23,68,0.4) 0%, rgba(0,0,0,0) 70%);
  transform: scale(1.05);
}

/* BLUE PILL (User's RIGHT / Morpheus' Left Hand) */
.pill-blue {
  top: 77%; 
  right: 11%;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0);
}
.pill-blue:hover {
  box-shadow: 0 0 100px rgba(0, 255, 255, 1), 0 0 150px rgba(0, 255, 255, 0.5);
  background: radial-gradient(circle, rgba(0,255,255,0.4) 0%, rgba(0,0,0,0) 70%);
  transform: scale(1.05);
}

.tooltip {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'JetBrains Mono';
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
  background: rgba(0,0,0,0.95);
  border: 2px solid currentColor;
  padding: 10px 16px;
  pointer-events: none;
  z-index: 40;
  backdrop-filter: blur(10px);
}

.pill-zone:hover .tooltip {
  opacity: 1;
}

@keyframes fadeInText {
  to { opacity: 1; }
}

/* Cursor Blink */
.cursor-blink {
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Glitch Text Effect */
.glitch {
  position: relative;
}
.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.glitch::before {
  left: 2px;
  text-shadow: -1px 0 var(--neon-red);
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim 5s infinite linear alternate-reverse;
}
.glitch::after {
  left: -2px;
  text-shadow: -1px 0 var(--neon-green);
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim2 5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
  0% { clip: rect(42px, 9999px, 44px, 0); }
  5% { clip: rect(12px, 9999px, 59px, 0); }
  10% { clip: rect(48px, 9999px, 29px, 0); }
  15% { clip: rect(42px, 9999px, 73px, 0); }
  20% { clip: rect(63px, 9999px, 27px, 0); }
  25% { clip: rect(34px, 9999px, 55px, 0); }
  30% { clip: rect(86px, 9999px, 73px, 0); }
  35% { clip: rect(20px, 9999px, 20px, 0); }
  40% { clip: rect(26px, 9999px, 60px, 0); }
  45% { clip: rect(25px, 9999px, 66px, 0); }
  50% { clip: rect(57px, 9999px, 98px, 0); }
  55% { clip: rect(5px, 9999px, 46px, 0); }
  60% { clip: rect(82px, 9999px, 31px, 0); }
  65% { clip: rect(54px, 9999px, 27px, 0); }
  70% { clip: rect(28px, 9999px, 99px, 0); }
  75% { clip: rect(45px, 9999px, 69px, 0); }
  80% { clip: rect(23px, 9999px, 85px, 0); }
  85% { clip: rect(54px, 9999px, 84px, 0); }
  90% { clip: rect(45px, 9999px, 47px, 0); }
  95% { clip: rect(37px, 9999px, 20px, 0); }
  100% { clip: rect(4px, 9999px, 91px, 0); }
}
@keyframes glitch-anim2 {
  0% { clip: rect(65px, 9999px, 100px, 0); }
  100% { clip: rect(0px, 9999px, 30px, 0); }
}
`;

// --- HELPER COMPONENTS ---

const Typewriter = ({ text, speed = 50, onComplete }: { text: string, speed?: number, onComplete?: () => void }) => {
  const [displayText, setDisplayText] = useState('');
  const onCompleteRef = useRef(onComplete);

  // Update ref when onComplete changes to avoid re-triggering effect
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setDisplayText(''); // Clear text on start
    let index = 0;

    const interval = setInterval(() => {
      // Use slice to ensure we don't duplicate text on re-renders
      index++;
      setDisplayText(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayText}
      {/* Updated Cursor: Larger height and width to match 6xl text */}
      <span
        className="cursor-blink inline-block bg-[#00FF41] ml-1 align-middle mb-2"
        style={{ width: '12px', height: '40px', display: 'inline-block' }}
      ></span>
    </span>
  );
};

// --- VIEW 1: UPLOAD LANDING (Typewriter + Upload) ---
const UploadLanding = ({ onUploadComplete }: { onUploadComplete: (file: File) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const handleSubmit = () => {
    if (!file) return;
    setLoading(true);
    // Simulate upload/processing
    setTimeout(() => {
      setLoading(false);
      onUploadComplete(file);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-20">
      <div className="mb-12 text-center max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-[#00FF41] drop-shadow-[0_0_10px_rgba(0,255,65,0.5)] mb-8">
          <Typewriter
            text="RECRUITERS ARE LYING TO YOU. WAKE UP."
            speed={75}
            onComplete={() => setShowUpload(true)}
          />
        </h1>
      </div>

      {showUpload && (
        <>
          <div className="w-full max-w-xl mx-auto border-2 border-[#00FF41] bg-black p-8 shadow-[0_0_40px_rgba(0,255,65,0.2)] animate-fade-in">
            <h3 className="text-xl mb-8 border-b-2 border-[#00FF41] pb-3 flex items-center gap-3">
              <Terminal size={24} /> UPLOAD_CANDIDATE_DATA
            </h3>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm uppercase flex items-center gap-2 text-gray-300 font-bold">
                  <FileText size={16} /> Upload Resume (PDF)
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full bg-[#0a0a0a] border-2 border-[#003300] p-4 text-sm focus:border-[#00FF41] outline-none text-gray-300 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00FF41] file:text-black hover:file:bg-white"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !file}
                className="w-full bg-[#00FF41] text-black font-bold py-4 text-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,255,65,0.5)] hover:shadow-[0_0_50px_rgba(0,255,65,0.8)]"
              >
                {loading ? "PROCESSING..." : "INITIALIZE SYSTEM"}
                {!loading && <ArrowRight size={20} />}
              </button>
            </div>
          </div>
          <div className="absolute bottom-8 font-mono text-xs text-green-900 tracking-widest animate-fade-in">
            SYSTEM VERSION 4.2.4 // UNAUTHORIZED ACCESS DETECTED
          </div>
        </>
      )
      }


    </div >
  );
};

// --- VIEW 2: MORPHEUS CHOICE ---
const MorpheusChoice = ({ onNavigate }: { onNavigate: (view: string) => void }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-20 overflow-hidden">
      <div className="mb-6 text-center text-[#00FF41] animate-pulse font-mono text-sm md:text-base tracking-[0.2em]">
        CHOOSE YOUR REALITY
      </div>

      <div className="morpheus-container">
        <img
          src="/morpheus.png"
          alt="Morpheus"
          className="w-full h-auto object-contain opacity-90 drop-shadow-[0_0_30px_rgba(0,255,65,0.3)]"
        />

        {/* Glasses Text with Premium Glitch */}
        <div className="glasses-text">
          <span className="text-git glitch" data-text="GIT">GIT</span>
          <span className="text-real glitch" data-text="REAL">REAL</span>
        </div>

        {/* Red Pill (Roast) */}
        <div
          className="pill-zone pill-red"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="tooltip text-red-500 border-red-500 shadow-[0_0_20px_red]">
            [ ROAST ME ]
            <br />
            <span className="text-[10px] text-gray-400">See the harsh truth</span>
          </div>
        </div>

        {/* Blue Pill (Rewrite) */}
        <div
          className="pill-zone pill-blue"
          onClick={() => onNavigate('chat')}
        >
          <div className="tooltip text-cyan-400 border-cyan-400 shadow-[0_0_20px_cyan]">
            [ REWRITE ME ]
            <br />
            <span className="text-[10px] text-gray-400">Upgrade your career</span>
          </div>
        </div>
      </div>

      <div className="mt-8 font-mono text-xs text-green-900">
        WAITING FOR INPUT...
      </div>
    </div>
  );
};

// --- VIEW 3: DASHBOARD (ROAST) ---
const Dashboard = ({ onNavigate, uploadedFile }: { onNavigate: (view: string) => void, uploadedFile: File | null }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!uploadedFile) {
        // Fallback mock data if no file (shouldn't happen in flow)
        setData({
          matches: ["Verified Python skills", "React expertise confirmed"],
          red_flags: ["Claimed 'Expert' but code is basic"],
          missing_gems: ["Docker skills not mentioned"]
        });
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("file", uploadedFile);
      // No github_url needed, backend extracts it

      try {
        const res = await axios.post("http://localhost:8000/analyze", formData);
        // The backend returns { status: "success", data: { ... } }
        // The inner data is ALREADY a dict, not a string, based on main.py:70
        // But wait, main.py says: analysis_json = brain.analyze_resume_vs_code(...)
        // If brain.py returns a dict, then res.data.data is a dict.
        // If brain.py returns a string, then we might need parsing.
        // Let's assume it returns a dict for now, but handle string just in case.
        const responseData = res.data.data;
        setData(typeof responseData === 'string' ? JSON.parse(responseData) : responseData);
      } catch (e) {
        console.error(e);
        // Fallback to mock data on error for demo purposes
        setData({
          matches: ["Verified Python skills", "React expertise confirmed"],
          red_flags: ["Claimed 'Expert' but code is basic"],
          missing_gems: ["Docker skills not mentioned"]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uploadedFile]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-[#00FF41] font-mono animate-pulse flex flex-col items-center gap-4">
          <Terminal size={48} />
          <div className="text-xl">ANALYZING CANDIDATE DATA...</div>
          <div className="text-sm text-green-800">CROSS-REFERENCING GITHUB...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 relative z-20">
      <header className="flex justify-between items-center mb-12 border-b border-[#003300] pb-4">
        <h2 className="text-2xl md:text-3xl text-[#00FF41] flex items-center gap-3">
          <Lock className="w-6 h-6 animate-pulse" />
          SECURITY CLEARANCE: <span className="text-red-500">LEVEL 1</span>
        </h2>
        <button onClick={() => onNavigate('landing')} className="text-xs hover:text-white">[ DISCONNECT ]</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

        {/* Critique */}
        <div className="bg-black border border-[#00FF41] p-6 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#00FF41]">
            <AlertTriangle className="w-5 h-5" /> REAL WORLD CRITIQUE
          </h3>
          <ul className="space-y-2 text-sm text-green-300/80 font-mono">
            {data.project_critique?.map((m: string, i: number) => (
              <li key={i} className="flex items-start gap-2"><div className="w-1 h-1 bg-[#00FF41] mt-2"></div>{m}</li>
            )) || <li>No critique available.</li>}
          </ul>
        </div>

        {/* False Claims */}
        <div className="bg-black border border-red-600 p-6 shadow-[0_0_15px_rgba(255,50,50,0.1)]">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-500 glitch" data-text="LIES DETECTED">
            <ShieldAlert className="w-5 h-5" /> FALSE CLAIMS
          </h3>
          <ul className="space-y-2 text-sm text-red-300/80 font-mono">
            {data.false_claims?.map((m: string, i: number) => (
              <li key={i} className="flex items-start gap-2"><div className="w-1 h-1 bg-red-500 mt-2"></div>{m}</li>
            )) || <li>No false claims detected.</li>}
          </ul>
        </div>

        {/* Suggestions */}
        <div className="bg-black border border-yellow-400 p-6 shadow-[0_0_15px_rgba(255,255,50,0.1)]">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
            <CheckCircle className="w-5 h-5" /> RESUME ADDITIONS
          </h3>
          <ul className="space-y-2 text-sm text-yellow-200/80 font-mono">
            {data.resume_suggestions?.map((m: string, i: number) => (
              <li key={i} className="flex items-start gap-2"><div className="w-1 h-1 bg-yellow-500 mt-2"></div>{m}</li>
            )) || <li>No suggestions.</li>}
          </ul>
        </div>

      </div>

      <div className="flex justify-center gap-6 mt-8">
        {/* The Rewrite Button (Blue Pill) */}
        <button
          onClick={() => onNavigate('chat')}
          className="relative px-8 py-4 bg-transparent border border-cyan-500 text-cyan-500 font-bold text-lg hover:bg-cyan-500 hover:text-black transition-all duration-200 shadow-[0_0_20px_rgba(0,255,255,0.2)] flex items-center gap-2"
        >
          <Wifi className="w-5 h-5" />
          REWRITE RESUME
        </button>

        {/* The DEFENSE MODE Button (Red Pill Logic) */}
        <button
          onClick={async () => {
            console.log("🔴 Defense Mode Clicked");
            try {
              // Set loading state
              localStorage.setItem('interview_loading', 'true');
              onNavigate('interview'); // Navigate immediately to show loading

              const res = await axios.post("http://localhost:8000/interview_start");
              console.log("🔴 Backend Response:", res.data);

              if (res.data.status === 'error') {
                localStorage.removeItem('interview_loading');
                alert("Error: " + res.data.message + "\nPlease upload your resume again.");
                onNavigate('dashboard');
                return;
              }

              localStorage.setItem('interview_intro', res.data.question);
              localStorage.removeItem('interview_loading');
              console.log("🔴 Question loaded");
              // Trigger a re-render by updating a dummy state or just let the useEffect handle it
              window.dispatchEvent(new Event('storage'));
            } catch (e) {
              console.error("🔴 Defense Mode Error:", e);
              localStorage.removeItem('interview_loading');
              alert("Backend Offline or Connection Failed");
              onNavigate('dashboard');
            }
          }}
          className="relative px-8 py-4 bg-[#FF1744] text-black font-bold text-lg hover:bg-white hover:scale-105 transition-all duration-200 shadow-[0_0_20px_rgba(255,23,68,0.4)] flex items-center gap-2"
        >
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          PROVE YOU CODED THIS
        </button>
      </div>
    </div>
  );
};

// --- VIEW 4: CHAT (VOICE ENABLED) ---
const ChatInterface = ({ onNavigate, uploadedFile, mode }: { onNavigate: (view: string) => void, uploadedFile: File | null, mode: string }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  // Repo Input State
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [repoLoading, setRepoLoading] = useState(false);
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const interviewInitialized = useRef(false);
  const previousMode = useRef(mode);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Check for interview loading
  useEffect(() => {
    const loading = typeof window !== 'undefined' ? localStorage.getItem('interview_loading') : null;
    setIsInterviewLoading(loading === 'true');
  }, [messages]);

  // Reset when mode changes (but not on initial mount)
  useEffect(() => {
    if (previousMode.current !== mode) {
      // Clear messages when switching modes
      setMessages([]);
      setInitialized(false);
      interviewInitialized.current = false;
      previousMode.current = mode;
    }
  }, [mode]);

  // Check for Interview Mode question on load
  useEffect(() => {
    const interviewQuestion = typeof window !== 'undefined' ? localStorage.getItem('interview_intro') : null;
    if (interviewQuestion && !interviewInitialized.current) {
      // INTERVIEW MODE - Don't call handleInit
      interviewInitialized.current = true;
      setInitialized(true);
      setMessages([
        { id: 1, type: 'system', text: '⚠️ DEFENSE MODE INITIATED. INTERROGATION LOGGED.' },
        { id: 2, type: 'ai', text: interviewQuestion }
      ]);
      localStorage.removeItem('interview_intro');
    } else if (uploadedFile && !initialized && !interviewQuestion && mode === 'chat') {
      // CHAT MODE ONLY - Initialize with file
      handleInit(uploadedFile, "");
    }
  }, [uploadedFile, mode]);

  // Listen for storage events (when interview question is loaded)
  useEffect(() => {
    const handleStorageChange = () => {
      const interviewQuestion = localStorage.getItem('interview_intro');
      if (interviewQuestion && mode === 'interview' && !interviewInitialized.current) {
        interviewInitialized.current = true;
        setInitialized(true);
        setMessages([
          { id: 1, type: 'system', text: '⚠️ DEFENSE MODE INITIATED. INTERROGATION LOGGED.' },
          { id: 2, type: 'ai', text: interviewQuestion }
        ]);
        localStorage.removeItem('interview_intro');
        localStorage.removeItem('interview_loading');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [mode]);

  useEffect(scrollToBottom, [messages]);

  const handleInit = async (file: File, url: string) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("github_url", url);

    try {
      const res = await axios.post("http://localhost:8000/analyze", formData);
      setInitialized(true);
      const starAnalysis = res.data.initial_chat || "Analysis complete.";
      setMessages(prev => [
        { id: 1, type: 'system', text: 'ENCRYPTED CHANNEL ESTABLISHED.' },
        { id: 2, type: 'system', text: 'ASSETS ANALYZED. MEMORY LOADED.' },
        { id: 3, type: 'ai', text: starAnalysis }
      ]);
    } catch (e: any) {
      // alert(`Init Failed: ${e.message}`);
      setMessages(prev => [...prev, { id: 3, type: 'system', text: `❌ ERROR: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent | null, overrideInput?: string) => {
    if (e) e.preventDefault();
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), type: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const history = messages.filter(m => m.type !== 'system').map(m => ({ type: m.type, text: m.text }));
      const res = await axios.post("http://localhost:8000/chat", {
        message: textToSend,
        history: history
      });
      const aiResponse = res.data.response;
      const aiMsg = { id: Date.now() + 1, type: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMsg]);

    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now(), type: 'system', text: 'CONNECTION DROPPED. RETRY.' }]);
    }
  };

  // Add Repo Logic (Kept same)
  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoUrl) return;
    setRepoLoading(true);
    setShowRepoInput(false);
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: `Scanning Repo: ${newRepoUrl}` }]);

    try {
      const res = await axios.post("http://localhost:8000/add_repo", { github_url: newRepoUrl });
      const bullets = res.data.bullets;
      const msgText = `Extracted Data:\n\n${bullets}\n\nAdd this to 'Projects'?`;
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: msgText }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'system', text: "FAILED TO ACCESS REPO." }]);
    } finally {
      setRepoLoading(false);
      setNewRepoUrl("");
    }
  }

  // --- COMPILE ATS RESUME ---
  const handleCompile = async () => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: "COMPILE FINAL ATS DRAFT" }]);
    setMessages(prev => [...prev, { id: Date.now() + 1, type: 'system', text: "COMPILING DATA STREAMS... PLEASE WAIT..." }]);

    try {
      const res = await axios.post("http://localhost:8000/generate_resume");
      const resumeText = res.data.resume;

      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        type: 'ai',
        isResume: true, // Special Flag
        text: resumeText
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 3, type: 'system', text: "COMPILATION FAILED." }]);
    }
  };

  return (
    <div className="h-screen p-4 md:p-8 flex flex-col md:flex-row gap-6 relative z-20">

      {/* Left: Resume Preview (Mock) - Kept for visual balance */}
      <div className="w-full md:w-1/2 bg-[#0a0a0a] border border-[#003300] flex flex-col relative overflow-hidden hidden md:flex">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#00FF41]/50"></div>
        <div className="bg-[#0f0f0f] p-3 border-b border-[#003300] flex justify-between items-center">
          <span className="text-xs text-gray-500 font-mono">RESUME_V1_FINAL_REAL.PDF</span>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-900/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-900/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-900/50"></div>
          </div>
        </div>
        <div className="p-8 opacity-60 text-[10px] leading-relaxed font-sans text-gray-400 select-none overflow-y-auto custom-scrollbar">
          {isInterviewLoading ? (
            // LOADING ANIMATION FOR INTERVIEW
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-[#00FF41] text-center space-y-6">
                <div className="text-2xl font-bold animate-pulse">ANALYZING CODE...</div>
                <div className="text-sm opacity-70">GENERATING INTERROGATION PROTOCOL</div>

                {/* Matrix Rain Effect */}
                <div className="relative w-full h-64 overflow-hidden border border-[#00FF41]/30">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 text-[#00FF41] text-xs font-mono opacity-30 animate-[fall_2s_linear_infinite]"
                      style={{
                        left: `${i * 5}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    >
                      {Array.from({ length: 20 }, () => String.fromCharCode(33 + Math.random() * 94)).join('\n')}
                    </div>
                  ))}
                </div>

                {/* Scanning Lines */}
                <div className="w-full h-2 bg-[#001100] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF41] to-transparent animate-[scan_1.5s_linear_infinite]"></div>
                </div>
              </div>
              <style>{`
                @keyframes fall {
                  0% { transform: translateY(-100%); }
                  100% { transform: translateY(400%); }
                }
                @keyframes scan {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
              `}</style>
            </div>
          ) : (
            // NORMAL RESUME PREVIEW
            <>
              <div className="w-full h-8 bg-[#1a1a1a] mb-6"></div>
              <div className="flex gap-4 mb-6">
                <div className="w-1/3 h-64 bg-[#1a1a1a]"></div>
                <div className="w-2/3 space-y-4">
                  <div className="w-full h-4 bg-[#1a1a1a]"></div>
                  <div className="w-5/6 h-4 bg-[#1a1a1a]"></div>
                  <div className="w-full h-4 bg-[#1a1a1a]"></div>
                  <div className="w-4/5 h-4 bg-[#1a1a1a]"></div>
                  <div className="w-full h-20 bg-[#1a1a1a] mt-4"></div>
                </div>
              </div>
              <div className="w-full h-40 bg-[#1a1a1a]"></div>
            </>
          )}
        </div>

        {/* Overlay scanning line */}
        <div className="absolute inset-0 border-b-2 border-[#00FF41]/30 animate-[scan_3s_linear_infinite] pointer-events-none bg-gradient-to-b from-transparent to-[#00FF41]/5"></div>
        <style>{`
            @keyframes scan {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
            }
        `}</style>
      </div>

      <div className="w-full md:w-1/2 flex flex-col border border-[#00FF41] bg-black/90 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative">

        {/* REPO POPUP */}
        {showRepoInput && (
          <div className="absolute bottom-20 left-4 right-4 bg-black border border-[#00FF41] p-4 shadow-[0_0_20px_rgba(0,255,65,0.2)] z-50 animate-fade-in">
            <div className="text-xs text-[#00FF41] mb-2 font-bold">PASTE REPOSITORY LINK:</div>
            <form onSubmit={handleAddRepo} className="flex gap-2">
              <input type="text" value={newRepoUrl} onChange={(e) => setNewRepoUrl(e.target.value)} placeholder="https://github.com/..." className="flex-1 bg-[#0a0a0a] border border-[#003300] p-2 text-sm text-white focus:border-[#00FF41] outline-none" autoFocus />
              <button type="submit" className="bg-[#003300] text-[#00FF41] px-4 py-2 text-xs hover:bg-[#00FF41] hover:text-black transition-colors">{repoLoading ? "SCANNING..." : "SCAN"}</button>
              <button type="button" onClick={() => setShowRepoInput(false)} className="text-red-500 text-xs px-2">X</button>
            </form>
          </div>
        )}

        <div className="p-4 border-b border-[#00FF41] flex justify-between items-center bg-[#001100]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse"></div>
            <span className="text-sm font-bold tracking-widest">LIVE UPLINK</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-xs hover:text-[#00FF41] transition-colors border border-transparent hover:border-[#00FF41] px-2 py-1"
            >
              [ VIEW DASHBOARD ]
            </button>
            <button onClick={() => onNavigate('morpheus')} className="text-xs hover:text-white">[ EXIT TERMINAL ]</button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4 font-mono text-sm custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[95%] p-4 ${msg.type === 'user'
                ? 'border border-cyan-500 text-cyan-400 bg-cyan-950/20'
                : msg.isResume
                  ? 'bg-white text-black font-sans border-4 border-green-500 shadow-[0_0_30px_rgba(255,255,255,0.2)]' // RESUME PAPER STYLE
                  : msg.type === 'system'
                    ? 'border-none text-gray-500 italic text-xs w-full text-center'
                    : 'border-[#00FF41] text-[#00FF41] bg-[#001100]'
                }`}>
                {!msg.isResume && (
                  <span className="font-bold opacity-50 mr-2 block mb-2">
                    {msg.type === 'user' ? '> USER' : msg.type === 'ai' ? '> GITREAL' : ''}
                  </span>
                )}
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR */}
        <div className="p-4 border-t border-[#00FF41] bg-black">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setShowRepoInput(!showRepoInput)} className="text-xs text-gray-500 hover:text-cyan-400 flex items-center gap-1 border border-gray-800 hover:border-cyan-400 px-2 py-1 transition-all"><Code className="w-3 h-3" /> Add Repo</button>
            <button onClick={handleCompile} className="text-xs text-gray-500 hover:text-green-400 flex items-center gap-1 border border-gray-800 hover:border-green-400 px-2 py-1 transition-all"><FileText className="w-3 h-3" /> COMPILE ATS DRAFT</button>
          </div>
          <form onSubmit={(e) => handleSend(e)} className="flex gap-2 items-center">
            <ChevronRight className="w-5 h-5 text-[#00FF41]" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type command..."
              className="flex-1 bg-transparent border-none outline-none text-[#00FF41] placeholder-green-900 font-mono h-10"
              autoFocus
            />

            <button type="submit" className="text-[#00FF41] hover:text-white">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [enableEffects, setEnableEffects] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleUploadComplete = (file: File) => {
    setUploadedFile(file);
    setCurrentView('morpheus');
  };

  return (
    <div className={`min-h-screen bg-[#050505] text-[#00FF41] font-mono selection:bg-[#00FF41] selection:text-black ${enableEffects ? 'crt-flicker' : ''}`}>
      <style>{customStyles}</style>

      {/* Background Matrix Effect */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>
      {enableEffects && <div className="scanlines fixed inset-0 pointer-events-none z-50"></div>}

      <div className="absolute top-4 right-4 z-50 flex gap-4 items-center">
        <button
          onClick={() => setEnableEffects(!enableEffects)}
          className="text-xs flex items-center gap-2 border border-[#003300] px-2 py-1 hover:border-[#00FF41] hover:text-[#00FF41] transition-colors text-[#003300]"
        >
          {enableEffects ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {enableEffects ? 'DISABLE FX' : 'ENABLE FX'}
        </button>
      </div>

      <main className="relative z-10">
        {currentView === 'landing' && <UploadLanding onUploadComplete={handleUploadComplete} />}
        {currentView === 'morpheus' && <MorpheusChoice onNavigate={setCurrentView} />}
        {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} uploadedFile={uploadedFile} />}
        {(currentView === 'chat' || currentView === 'interview') && <ChatInterface onNavigate={setCurrentView} uploadedFile={uploadedFile} mode={currentView} />}
      </main>
    </div>
  );
}