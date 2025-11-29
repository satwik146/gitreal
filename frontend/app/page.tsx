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
  Github,
  ArrowRight,
  Code,
  FileText
} from 'lucide-react';
import axios from 'axios';

// --- CUSTOM CSS (Matrix + Morpheus + Premium Glitch) ---
const customStyles = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');

:root {
  --neon-green: #00FF41;
  --neon-red: #FF3333;
  --neon-blue: #00FFFF;
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

/* --- CHAOTIC GREY/BLACK GLITCH OVERLAY --- */
.glasses-glitch-overlay {
  position: absolute;
  top: 39%;
  left: 50%;
  transform: translateX(-50%);
  width: 32%; 
  height: 10%; 
  background: repeating-linear-gradient(
    0deg,
    #000000,
    #000000 3px,
    #333333 3px,
    #333333 5px,
    #1a1a1a 5px,
    #1a1a1a 8px
  );
  z-index: 19;
  opacity: 0;
  pointer-events: none;
  animation: fadeInText 0.5s forwards 1.5s, chaotic-glitch-anim 0.4s infinite linear alternate-reverse;
  mix-blend-mode: hard-light;
}

@keyframes chaotic-glitch-anim {
  0% { clip-path: inset(10% 0 10% 0); transform: translateX(-50%) skew(2deg); }
  20% { clip-path: inset(30% 0 50% 0); transform: translateX(-50%) skew(-2deg); }
  40% { clip-path: inset(5% 0 80% 0); transform: translateX(-52%) skew(1deg); background: repeating-linear-gradient(90deg, #000, #555 10%); }
  60% { clip-path: inset(70% 0 5% 0); transform: translateX(-48%) skew(-1deg); }
  80% { clip-path: inset(20% 0 40% 0); transform: translateX(-50%) skew(3deg); background: #222; }
  100% { clip-path: inset(50% 0 20% 0); transform: translateX(-50%) skew(-3deg); }
}

.glasses-text {
  position: absolute;
  top: 38%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 2px;
  z-index: 20;
  pointer-events: none;
  opacity: 0;
  animation: fadeInText 2s forwards 1s;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 55px;
  align-items: center;
}

.text-git {
    color: #FF0000;
    text-shadow: 0 0 5px #FF0000, 0 0 15px #FF0000;
}
.text-real {
    color: #00FFFF;
    text-shadow: 0 0 5px #00FFFF, 0 0 15px #00FFFF;
}

.pill-zone {
  position: absolute;
  width: 14%; 
  height: 14%;
  border-radius: 50%;
  cursor: pointer;
  z-index: 30;
  transition: all 0.3s ease;
}

.pill-red {
  top: 65%; left: 17%;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0);
}
.pill-red:hover {
  box-shadow: 0 0 60px rgba(255, 0, 0, 1);
  background: radial-gradient(circle, rgba(255,0,0,0.3) 0%, rgba(0,0,0,0) 70%);
}

.pill-blue {
  top: 65%; right: 17%;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0);
}
.pill-blue:hover {
  box-shadow: 0 0 60px rgba(0, 255, 255, 1);
  background: radial-gradient(circle, rgba(0,255,255,0.3) 0%, rgba(0,0,0,0) 70%);
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
  background: #000;
  border: 1px solid currentColor;
  padding: 8px 12px;
  pointer-events: none;
  z-index: 40;
}

.pill-zone:hover .tooltip { opacity: 1; }

@keyframes fadeInText { to { opacity: 1; } }
`;

// --- HELPER: TYPEWRITER ---
const Typewriter = ({ text, speed = 50, onComplete }: { text: string, speed?: number, onComplete?: () => void }) => {
  const [displayText, setDisplayText] = useState('');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    setDisplayText('');
    let index = 0;
    const interval = setInterval(() => {
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
      <span className="cursor-blink inline-block w-2 h-4 bg-[#00FF41] ml-1 align-middle"></span>
    </span>
  );
};

// --- COMPONENT: INPUT MODAL (Reused) ---
const InputTerminal = ({ onSubmit, loading }: { onSubmit: (f: File, u: string) => void, loading: boolean }) => {
    const [url, setUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);

    return (
        <div className="w-full max-w-2xl mx-auto border border-[#00FF41] bg-black p-6 shadow-[0_0_20px_rgba(0,255,65,0.1)]">
            <h3 className="text-xl mb-6 border-b border-[#00FF41] pb-2 flex items-center gap-2">
                <Terminal size={20} /> INITIALIZE_DATA_STREAM
            </h3>
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase flex items-center gap-2 text-gray-400">
                        <Upload size={14} /> Upload Resume (PDF)
                    </label>
                    <input 
                        type="file" accept=".pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full bg-[#0a0a0a] border border-[#003300] p-3 text-sm focus:border-[#00FF41] outline-none text-gray-300"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase flex items-center gap-2 text-gray-400">
                        <Github size={14} /> GitHub Repository URL
                    </label>
                    <input 
                        type="text" placeholder="https://github.com/username/repo"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-[#003300] p-3 text-sm focus:border-[#00FF41] outline-none font-mono text-[#00FF41]"
                    />
                </div>
                <button 
                    onClick={() => file && url && onSubmit(file, url)}
                    disabled={loading || !file || !url}
                    className="w-full bg-[#00FF41] text-black font-bold py-3 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? "PROCESSING..." : "EXECUTE ANALYSIS"}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </div>
        </div>
    )
}

// --- VIEW 1: UPLOAD LANDING ---
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
    }, 1000);
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
                    className="w-full bg-[#0a0a0a] border-2 border-[#003300] p-4 text-sm focus:border-[#00FF41] outline-none text-gray-300 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00FF41] file:text-black hover:file:bg-white"
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
      )}
    </div>
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
        <img src="/morpheus.png" alt="Morpheus" className="w-full h-auto object-contain opacity-90 drop-shadow-[0_0_20px_rgba(0,255,65,0.2)]"/>
        <div className="glasses-glitch-overlay"></div>
        <div className="glasses-text">
          <span className="text-git">GIT</span>
          <span className="text-real">REAL</span>
        </div>
        <div className="pill-zone pill-red" onClick={() => onNavigate('dashboard')}>
          <div className="tooltip text-red-500 border-red-500 shadow-[0_0_10px_red]">
            [ ROAST ME ]<br/><span className="text-[10px] text-gray-400">See the harsh truth</span>
          </div>
        </div>
        <div className="pill-zone pill-blue" onClick={() => onNavigate('chat')}>
          <div className="tooltip text-cyan-400 border-cyan-400 shadow-[0_0_10px_cyan]">
            [ REWRITE ME ]<br/><span className="text-[10px] text-gray-400">Upgrade your career</span>
          </div>
        </div>
      </div>
      <div className="mt-8 font-mono text-xs text-green-900">WAITING FOR INPUT...</div>
    </div>
  );
};

// --- VIEW 3: DASHBOARD (ROAST - REAL BACKEND) ---
const Dashboard = ({ onNavigate, uploadedFile }: { onNavigate: (view: string) => void, uploadedFile: File | null }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Auto-analyze if file came from Landing Page
  useEffect(() => {
    const fetchData = async () => {
      if (!uploadedFile) return; // Wait for manual input if no file

      setLoading(true);
      const formData = new FormData();
      formData.append("file", uploadedFile);
      // Dummy URL because we haven't asked for Repo yet in this flow
      // The backend will try to extract from Resume, or fallback.
      formData.append("github_url", ""); 

      try {
        const res = await axios.post("http://localhost:8000/analyze", formData);
        if(res.data.status === "error") throw new Error(res.data.message);
        // Ensure data is parsed if it's a string, or used directly if dict
        const responseData = typeof res.data.data === 'string' ? JSON.parse(res.data.data) : res.data.data;
        setData(responseData); 
      } catch (e: any) {
        console.error("Auto-analyze failed (expected if no GitHub)", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uploadedFile]);

  // Manual Analyze (If they didn't upload or want to try again)
  const handleAnalyze = async (file: File, url: string) => {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("github_url", url);

      try {
          // REAL BACKEND CALL
          const res = await axios.post("http://localhost:8000/analyze", formData);
          if(res.data.status === "error") throw new Error(res.data.message);
          const responseData = typeof res.data.data === 'string' ? JSON.parse(res.data.data) : res.data.data;
          setData(responseData); 
      } catch (e: any) {
          alert(`Analysis Failed: ${e.message || "Is Backend Running?"}`);
      } finally {
          setLoading(false);
      }
  };

  if (!data) {
      return (
          <div className="min-h-screen flex items-center justify-center p-4">
               <div className="absolute top-4 left-4">
                  <button onClick={() => onNavigate('landing')} className="text-xs hover:text-white">[ BACK ]</button>
               </div>
               {/* If loading auto-analysis, show loading. Else show input. */}
               {loading ? (
                   <div className="text-[#00FF41] font-mono animate-pulse flex flex-col items-center gap-4">
                        <Terminal size={48} />
                        <div className="text-xl">ANALYZING UPLOADED DATA...</div>
                   </div>
               ) : (
                   <InputTerminal onSubmit={handleAnalyze} loading={loading} />
               )}
          </div>
      )
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
        <div className="bg-black border border-[#00FF41] p-6 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#00FF41]">
            <CheckCircle className="w-5 h-5" /> VERIFIED SKILLS
          </h3>
          <ul className="space-y-2 text-sm text-green-300/80 font-mono">
            {data.matches?.map((m: string, i: number) => (
                 <li key={i} className="flex items-start gap-2"><div className="w-1 h-1 bg-[#00FF41] mt-2"></div>{m}</li>
            )) || <li>No matches found.</li>}
          </ul>
        </div>

        <div className="bg-black border border-red-600 p-6 shadow-[0_0_15px_rgba(255,50,50,0.1)]">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-500 glitch" data-text="LIES DETECTED">
            <ShieldAlert className="w-5 h-5" /> RED FLAGS
          </h3>
          <ul className="space-y-2 text-sm text-red-300/80 font-mono">
            {data.red_flags?.map((m: string, i: number) => (
                 <li key={i} className="flex items-start gap-2"><div className="w-1 h-1 bg-red-500 mt-2"></div>{m}</li>
            )) || <li>No red flags. Good job.</li>}
          </ul>
        </div>

        <div className="bg-black border border-yellow-400 p-6 shadow-[0_0_15px_rgba(255,255,50,0.1)]">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5" /> MISSING GEMS
          </h3>
          <ul className="space-y-2 text-sm text-yellow-200/80 font-mono">
            {data.missing_gems?.map((m: string, i: number) => (
                 <li key={i} className="flex items-start gap-2"><div className="w-1 h-1 bg-yellow-500 mt-2"></div>{m}</li>
            )) || <li>Nothing missing.</li>}
          </ul>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={() => onNavigate('chat')} className="relative px-8 py-4 bg-[#00FF41] text-black font-bold text-lg hover:bg-white hover:scale-105 transition-all duration-200 shadow-[0_0_20px_rgba(0,255,65,0.4)] flex items-center gap-2">
          <Wifi className="w-5 h-5 animate-pulse" />
          INITIATE SYSTEM REPAIR (FIX THIS)
        </button>
      </div>
    </div>
  );
};

// --- VIEW 4: CHAT (REWRITE - REAL CONNECTED) ---
const ChatInterface = ({ onNavigate }: { onNavigate: (view: string) => void }) => {
  const [messages, setMessages] = useState<any[]>([
    { id: 1, type: 'system', text: 'ENCRYPTED CHANNEL ESTABLISHED.' },
    { id: 2, type: 'system', text: 'ANALYZING CODEBASE...' } // Waiting message
  ]);
  const [input, setInput] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Repo Input State
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [repoLoading, setRepoLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  // INITIAL UPLOAD FOR CHAT CONTEXT
  const handleInit = async (file: File, url: string) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("github_url", url);

    try {
        // CALL BACKEND
        const res = await axios.post("http://localhost:8000/analyze", formData);
        
        setInitialized(true);
        
        // --- THE FIX: USE BACKEND'S STAR ANALYSIS AS FIRST MESSAGE ---
        const starAnalysis = res.data.initial_chat || "Analysis complete. Ready for input.";
        
        setMessages(prev => [
            { id: 1, type: 'system', text: 'ENCRYPTED CHANNEL ESTABLISHED.' },
            { id: 2, type: 'system', text: 'ASSETS ANALYZED. MEMORY LOADED.' },
            { id: 3, type: 'ai', text: starAnalysis } // <--- THE REAL ANALYSIS
        ]);

    } catch (e: any) {
        alert(`Init Failed: ${e.message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleAddRepo = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newRepoUrl) return;
      setRepoLoading(true);
      setShowRepoInput(false);
      
      setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: `Scanning Repo: ${newRepoUrl}` }]);

      try {
          const res = await axios.post("http://localhost:8000/add_repo", { github_url: newRepoUrl });
          const bullets = res.data.bullets;
          setMessages(prev => [...prev, { 
              id: Date.now() + 1, 
              type: 'ai', 
              text: `Extracted Data from Repo:\n\n${bullets}\n\nAdd this to 'Projects'?` 
          }]);
      } catch (e) {
          setMessages(prev => [...prev, { id: Date.now() + 1, type: 'system', text: "FAILED TO ACCESS REPO." }]);
      } finally {
          setRepoLoading(false);
          setNewRepoUrl("");
      }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
        const res = await axios.post("http://localhost:8000/chat", {
            message: input,
            history: messages.filter(m => m.type !== 'system') 
        });
        const aiMsg = { id: Date.now() + 1, type: 'ai', text: res.data.response };
        setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
        setMessages(prev => [...prev, { id: Date.now(), type: 'system', text: 'CONNECTION DROPPED.' }]);
    }
  };

  if (!initialized) {
      return (
          <div className="min-h-screen flex items-center justify-center p-4">
              <div className="absolute top-4 left-4">
                  <button onClick={() => onNavigate('landing')} className="text-xs hover:text-white">[ BACK ]</button>
               </div>
              <InputTerminal onSubmit={handleInit} loading={loading} />
          </div>
      )
  }

  return (
    <div className="h-screen p-4 md:p-8 flex flex-col md:flex-row gap-6 relative z-20">
      <div className="w-full flex flex-col border border-[#00FF41] bg-black/90 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative">
        
        {showRepoInput && (
            <div className="absolute bottom-20 left-4 right-4 bg-black border border-[#00FF41] p-4 shadow-[0_0_20px_rgba(0,255,65,0.2)] z-50 animate-fade-in">
                <div className="text-xs text-[#00FF41] mb-2 font-bold">PASTE REPOSITORY LINK:</div>
                <form onSubmit={handleAddRepo} className="flex gap-2">
                    <input 
                        type="text" 
                        value={newRepoUrl}
                        onChange={(e) => setNewRepoUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="flex-1 bg-[#0a0a0a] border border-[#003300] p-2 text-sm text-white focus:border-[#00FF41] outline-none"
                        autoFocus
                    />
                    <button type="submit" className="bg-[#003300] text-[#00FF41] px-4 py-2 text-xs hover:bg-[#00FF41] hover:text-black transition-colors">
                        {repoLoading ? "SCANNING..." : "SCAN"}
                    </button>
                    <button type="button" onClick={() => setShowRepoInput(false)} className="text-red-500 text-xs px-2">X</button>
                </form>
            </div>
        )}

        <div className="p-4 border-b border-[#00FF41] flex justify-between items-center bg-[#001100]">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse"></div>
                <span className="text-sm font-bold tracking-widest">LIVE UPLINK</span>
            </div>
            <button onClick={() => onNavigate('dashboard')} className="text-xs hover:text-white">[ EXIT ]</button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-4 font-mono text-sm custom-scrollbar">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 border ${
                        msg.type === 'user' 
                        ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' 
                        : msg.type === 'system'
                        ? 'border-none text-gray-500 italic text-xs w-full text-center'
                        : 'border-[#00FF41] text-[#00FF41] bg-[#001100]'
                    }`}>
                        <span className="font-bold opacity-50 mr-2">
                            {msg.type === 'user' ? '>' : msg.type === 'ai' ? 'GITREAL:' : ''}
                        </span>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                    </div>
                </div>
            ))}
            {repoLoading && <div className="text-xs text-[#00FF41] animate-pulse text-center">... INGESTING NEW DATA STREAM ...</div>}
            <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-[#00FF41] bg-black">
             <div className="flex items-center gap-2 mb-2">
                <button 
                    onClick={() => setShowRepoInput(!showRepoInput)}
                    className="text-xs text-gray-500 hover:text-cyan-400 flex items-center gap-1 border border-gray-800 hover:border-cyan-400 px-2 py-1 transition-all"
                >
                    <Code className="w-3 h-3" /> Add Repo
                </button>
                <button className="text-xs text-gray-500 hover:text-cyan-400 flex items-center gap-1 border border-gray-800 hover:border-cyan-400 px-2 py-1 transition-all">
                    <FileText className="w-3 h-3" /> Paste JD
                </button>
             </div>
            <form onSubmit={handleSend} className="flex gap-2 items-center">
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
        {currentView === 'chat' && <ChatInterface onNavigate={setCurrentView} />}
      </main>
    </div>
  );
}