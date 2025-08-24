import React, { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  Smartphone,
  Gamepad2,
  Settings,
  Cpu,
  AlertCircle,
  Loader,
  Target,
  MousePointerClick,
  Volume2,
  Pause,
  Eye,
  BrainCircuit,
  Swords,
  Shield,
  Youtube,
  Lock,
  BarChart2,
  User,
  Key,
  Zap,
  Star,
  Trophy,
  Send,
  Wifi,
  BatteryCharging,
  Search,
  MemoryStick,
  ChevronRight,
  Crosshair,
  Dumbbell,
  Info,
  Rabbit,
  Save,
  Plus,
  Trash2,
} from "lucide-react";

// --- Firebase Configuration ---
// This will be populated by the environment
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  // The value of `databaseURL` depends on the location of the database
  databaseURL: "https://DATABASE_NAME.firebaseio.com",
  projectId: "PROJECT_ID",
  // The value of `storageBucket` depends on when you provisioned your default bucket (learn more)
  storageBucket: "PROJECT_ID.firebasestorage.app",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
  // For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is an optional field
  measurementId: "G-MEASUREMENT_ID",
};

const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// --- Firebase Initialization ---
let app;
let db;
let auth;
const isFirebaseConfigured = firebaseConfig && firebaseConfig.apiKey;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error(
      "Firebase initialization failed. Please check your config.",
      error
    );
  }
} else {
  console.warn(
    "Firebase is not configured. Analytics and Owner's Panel will be disabled."
  );
}

// --- List of common mobile phones for suggestions ---
const MOBILE_PHONE_MODELS = [
    "iPhone 15 Pro Max", "iPhone 15", "iPhone 14 Pro", "iPhone 13", "iPhone SE",
    "Samsung Galaxy S24 Ultra", "Samsung Galaxy S23 FE", "Samsung Galaxy Z Fold 5", "Samsung Galaxy A54",
    "Google Pixel 8 Pro", "Google Pixel 7a", "Google Pixel Fold",
    "OnePlus 12", "OnePlus Open", "OnePlus Nord 3",
    "Xiaomi 14 Ultra", "Xiaomi 13T Pro", "Redmi Note 13 Pro+", "Poco X6 Pro",
    "Asus ROG Phone 8 Pro", "Asus Zenfone 10",
    "Realme GT 5 Pro", "Realme 12 Pro+",
    "Oppo Find X7 Ultra", "Vivo X100 Pro", "Nothing Phone (2)", "Motorola Razr+",
];

// --- Helper function to call the Gemini API ---
const callGenerativeApi = async (prompt, generationConfig, retries = 3, delay = 1000) => {
    const API_KEY = "AIzaSyCbqnoNwuA7u4uGOd_u9XMeKRY2f6ApMyU"; // Handled by environment
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig
    };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

    for (let i = 0; i < retries; i++) {
      try {
          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          if (!response.ok) {
              if (response.status === 429 || response.status >= 500) {
                  throw new Error(`API error: ${response.statusText}`);
              } else {
                  const errorResult = await response.json();
                  console.error("API request failed with non-retriable error:", errorResult);
                  throw new Error(`API error: ${response.statusText}`);
              }
          }
          return await response.json();
      } catch (e) {
          if (i === retries - 1) throw e;
          await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
      }
    }
};

// --- Audio Helper Functions ---
const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

const pcmToWav = (pcmData, sampleRate) => {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length * pcmData.BYTES_PER_ELEMENT;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataSize, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // "fmt " sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Sub-chunk size
    view.setUint16(20, 1, true); // Audio format (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataSize, true);

    // Write PCM data
    const pcm = new Int16Array(buffer, 44);
    pcm.set(pcmData);

    return new Blob([view], { type: 'audio/wav' });
};

// --- Reusable UI Components ---
const InfoCard = ({ title, icon, children, gradient = "from-cyan-500/20 to-purple-500/20" }) => (
    <div className="group relative bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm p-8 rounded-3xl border border-gray-600/30 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:border-cyan-500/50 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-orbitron">
          <span className="text-cyan-400 group-hover:scale-110 transition-transform duration-300">{icon}</span>
          {title}
        </h2>
        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
          {children}
        </div>
      </div>
    </div>
);

const SensitivityItem = ({ label, value, icon }) => (
    <div className="group relative bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm p-6 rounded-2xl flex flex-col items-center justify-center text-center transform hover:scale-105 transition-all duration-300 shadow-lg border border-gray-600/30 hover:border-cyan-500/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="text-cyan-400 mb-3 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <p className="text-sm text-gray-400 font-semibold capitalize mb-2">
          {label.replace(/([A-Z])/g, ' $1')}
        </p>
        <p className="text-3xl font-bold text-white font-orbitron group-hover:text-cyan-300 transition-colors duration-300">
          {value}
        </p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </div>
);

const SpeechButton = ({ textToSpeak }) => {
    const [status, setStatus] = useState('idle'); // idle, loading, playing
    const audioRef = useRef(null);

    const handlePlayback = async () => {
        if (status === 'playing' && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setStatus('idle');
            return;
        }

        setStatus('loading');
        try {
            const payload = {
                contents: [{ parts: [{ text: `Say in a clear, encouraging voice for a gamer: ${textToSpeak}` }] }],
                generationConfig: { responseModalities: ["AUDIO"] },
                model: "gemini-2.5-flash-preview-tts"
            };
            const API_KEY = "AIzaSyCbqnoNwuA7u4uGOd_u9XMeKRY2f6ApMyU"; // Handled by environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            const part = result?.candidates?.[0]?.content?.parts?.[0];
            const audioData = part?.inlineData?.data;
            const mimeType = part?.inlineData?.mimeType;

            if (audioData && mimeType && mimeType.startsWith("audio/")) {
                const sampleRateMatch = mimeType.match(/rate=(\d+)/);
                const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
                const pcmData = base64ToArrayBuffer(audioData);
                const pcm16 = new Int16Array(pcmData);
                const wavBlob = pcmToWav(pcm16, sampleRate);
                const audioUrl = URL.createObjectURL(wavBlob);
                
                audioRef.current = new Audio(audioUrl);
                audioRef.current.play();
                setStatus('playing');
                audioRef.current.onended = () => setStatus('idle');
            } else {
                throw new Error("Invalid audio data received.");
            }
        } catch (error) {
            console.error("TTS generation failed:", error);
            setStatus('idle');
        }
    };

    return (
        <button onClick={handlePlayback} className="p-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors">
            {status === 'loading' && <Loader size={20} className="text-cyan-300 animate-spin" />}
            {status === 'playing' && <Pause size={20} className="text-cyan-300" />}
            {status === 'idle' && <Volume2 size={20} className="text-cyan-300" />}
        </button>
    );
};

// --- Subscription Modal Component ---
const SubscriptionModal = ({ onUnlock, channelUrl }) => {
  const handleSubscribeClick = () => {
    window.open(channelUrl, '_blank');
    onUnlock();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-2xl p-8 text-center max-w-md w-full transform hover:scale-105 transition-all duration-500 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 right-4 w-16 h-16 bg-cyan-500/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-purple-500/10 rounded-full animate-ping"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5"></div>
        </div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <Lock size={32} className="text-white" />
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4 font-orbitron">
            Unlock Pro Settings
          </h2>
          
          <p className="text-gray-300 mb-8 leading-relaxed">
            Access premium sensitivity configurations by subscribing to our YouTube channel. 
            Your support fuels our mission to create better gaming content!
          </p>
          
          <button
            onClick={handleSubscribeClick}
            className="group w-full bg-gradient-to-r from-red-600 via-red-500 to-pink-500 hover:from-red-500 hover:via-red-400 hover:to-pink-400 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <Youtube size={24} />
            <span>Subscribe to Unlock</span>
            <Star size={20} className="animate-pulse" />
          </button>
          
          <div className="mt-4 text-sm text-gray-400">
            ✨ Premium features • Advanced configs • Pro support
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Admin Login Modal ---
const AdminLoginModal = ({ onLogin, onClose }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (id === 'loadingpc2003' && password === 'loading=accuracy@20112003') {
      onLogin();
    } else {
      setError('Invalid ID or password.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl shadow-2xl p-8 text-center max-w-md w-full overflow-hidden">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all"
        >
          ×
        </button>
        
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
          <BarChart2 size={32} className="text-white" />
        </div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-8 font-orbitron">
          Owner's Panel
        </h2>
        
        <div className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
            <input 
              type="text" 
              placeholder="Administrator ID" 
              value={id} 
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-white placeholder-gray-400"
            />
          </div>
          
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
            <input 
              type="password" 
              placeholder="Access Key" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-white placeholder-gray-400"
            />
          </div>
        </div>
        
        {error && (
          <div className="mt-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <button 
          onClick={handleLogin} 
          className="w-full mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Access Dashboard
        </button>
      </div>
    </div>
  );
};

// --- Owner Panel ---
const OwnerPanel = ({ onClose, initialPresets, initialCharacters, onDataUpdate }) => {
    const [presets, setPresets] = useState(initialPresets);
    const [characters, setCharacters] = useState(initialCharacters);
    const [newCharacter, setNewCharacter] = useState('');
    const [newPreset, setNewPreset] = useState({ ram: '', dpi: '', settings: { general: 100, redDot: 100, twoXScope: 100, fourXScope: 100, sniperScope: 100, freeLook: 100 } });
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('sensitivity');
    const [stats, setStats] = useState({ totalUsers: 0 });

    useEffect(() => {
        const requiredRamSizes = ['2', '3', '4', '6', '8', '12'];
        let presetsUpdated = false;
        const updatedPresets = { ...initialPresets };
        const defaultSettings = { dpi: 'Default', settings: { general: 100, redDot: 100, twoXScope: 100, fourXScope: 100, sniperScope: 100, freeLook: 100 } };

        requiredRamSizes.forEach(ram => {
            if (!updatedPresets[ram]) {
                updatedPresets[ram] = defaultSettings;
                presetsUpdated = true;
            }
        });

        if (presetsUpdated) {
            setPresets(updatedPresets);
        }
    }, [initialPresets]);
    
    useEffect(() => {
        if (activeTab === 'analytics' && isFirebaseConfigured) {
            const fetchStats = async () => {
                try {
                    const docRef = doc(db, "artifacts", appId, "public/data", "analytics", "usage");
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setStats(docSnap.data());
                    } else {
                        setStats({ totalUsers: 0 });
                    }
                } catch (error) {
                    console.error("Error fetching analytics:", error);
                    setStats({ totalUsers: 'Error' });
                }
            };
            fetchStats();
        }
    }, [activeTab]);

    const handlePresetChange = (ram, field, value) => {
        setPresets(prev => ({
            ...prev,
            [ram]: {
                ...prev[ram],
                ...(field === 'dpi' ? { dpi: value } : { settings: { ...prev[ram].settings, [field]: parseInt(value) || 0 } })
            }
        }));
    };
    
    const handleDeletePreset = (ramToDelete) => {
        const newPresets = { ...presets };
        delete newPresets[ramToDelete];
        setPresets(newPresets);
    };

    const handleNewPresetChange = (field, value) => {
        if (field === 'ram' || field === 'dpi') {
            setNewPreset(prev => ({ ...prev, [field]: value }));
        } else {
            setNewPreset(prev => ({ ...prev, settings: { ...prev.settings, [field]: parseInt(value) || 0 } }));
        }
    };

    const saveAllChanges = async () => {
        if (!isFirebaseConfigured) return;
        setIsSaving(true);
        try {
            const presetsRef = doc(db, "artifacts", appId, "public/data", "sensitivityPresets", "allPresets");
            await setDoc(presetsRef, presets);
            
            const gameDataRef = doc(db, "artifacts", appId, "public/data", "gameData", "main");
            await setDoc(gameDataRef, { popularCharacters: characters }, { merge: true });

            onDataUpdate({ presets, characters });
        } catch (error) {
            console.error("Error saving all data:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const addNewPreset = () => {
        if (!newPreset.ram || !newPreset.dpi) {
            console.error("Please fill in RAM and DPI for the new preset.");
            return;
        }
        const updatedPresets = { ...presets, [newPreset.ram.replace(/\D/g, '')]: { dpi: newPreset.dpi, settings: newPreset.settings } };
        setPresets(updatedPresets);
        setNewPreset({ ram: '', dpi: '', settings: { general: 100, redDot: 100, twoXScope: 100, fourXScope: 100, sniperScope: 100, freeLook: 100 } });
    };

    const addNewCharacter = () => {
        if (!newCharacter.trim()) return;
        const updatedCharacters = [...characters, newCharacter.trim()];
        setCharacters(updatedCharacters);
        setNewCharacter('');
    };

    const handleDeleteCharacter = (charToDelete) => {
        const updatedCharacters = characters.filter(char => char !== charToDelete);
        setCharacters(updatedCharacters);
    };
    
    const sortedPresetEntries = Object.entries(presets).sort(([ramA], [ramB]) => parseInt(ramA) - parseInt(ramB));

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl shadow-2xl p-8 max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all z-20">×</button>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-6 text-center font-orbitron">Owner's Dashboard</h2>
                
                <div className="flex justify-center border-b border-gray-700 mb-6">
                    <button onClick={() => setActiveTab('sensitivity')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'sensitivity' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>Sensitivity</button>
                    <button onClick={() => setActiveTab('characters')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'characters' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>Characters</button>
                    <button onClick={() => setActiveTab('analytics')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'analytics' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>Analytics</button>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                    {activeTab === 'sensitivity' && (
                        <div className="space-y-8">
                            {sortedPresetEntries.map(([ram, data]) => (
                                <div key={ram} className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-2xl font-bold text-cyan-300">{ram} GB RAM</h3>
                                        <button onClick={() => handleDeletePreset(ram)} disabled={isSaving} className="p-2 text-red-500 hover:bg-red-500/20 rounded-full transition-colors disabled:opacity-50">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">DPI</label>
                                            <input type="text" value={data.dpi} onChange={(e) => handlePresetChange(ram, 'dpi', e.target.value)} className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-2 focus:ring-cyan-400 focus:border-cyan-400" />
                                        </div>
                                        {Object.entries(data.settings).map(([key, value]) => (
                                            <div key={key}>
                                                <label className="block text-sm text-gray-400 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                                <input type="number" value={value} onChange={(e) => handlePresetChange(ram, key, e.target.value)} className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-2 focus:ring-cyan-400 focus:border-cyan-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                             <div className="p-6 bg-green-800/20 rounded-2xl border border-green-700">
                                <h3 className="text-2xl font-bold text-green-300 mb-4">Add New Preset</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">RAM (GB)</label>
                                        <input type="number" placeholder="e.g., 16" value={newPreset.ram} onChange={(e) => handleNewPresetChange('ram', e.target.value)} className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">DPI</label>
                                        <input type="text" placeholder="e.g., 500" value={newPreset.dpi} onChange={(e) => handleNewPresetChange('dpi', e.target.value)} className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-2" />
                                    </div>
                                    {Object.keys(newPreset.settings).map(key => (
                                        <div key={key}>
                                            <label className="block text-sm text-gray-400 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                            <input type="number" value={newPreset.settings[key]} onChange={(e) => handleNewPresetChange(key, e.target.value)} className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-2" />
                                        </div>
                                    ))}
                                    <button onClick={addNewPreset} className="col-span-2 md:col-span-1 h-10 mt-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <Plus size={20} /> Add to List
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                     {activeTab === 'characters' && (
                        <div>
                             <div className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700 mb-6">
                                <h3 className="text-2xl font-bold text-cyan-300 mb-4">Manage Characters</h3>
                                <div className="flex gap-4">
                                    <input type="text" value={newCharacter} onChange={(e) => setNewCharacter(e.target.value)} placeholder="New character name" className="flex-1 bg-gray-900/70 border border-gray-600 rounded-lg p-3 focus:ring-cyan-400 focus:border-cyan-400" />
                                    <button onClick={addNewCharacter} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <Plus size={20} />
                                        <span>Add to List</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-4">Current List</h3>
                                <ul className="space-y-2 max-h-96 overflow-y-auto">
                                    {characters.map((char, index) => (
                                        <li key={index} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg text-gray-300">
                                            <span>{char}</span>
                                            <button onClick={() => handleDeleteCharacter(char)} className="p-1 text-red-500 hover:bg-red-500/20 rounded-full transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    {activeTab === 'analytics' && (
                        <div className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                            <h3 className="text-2xl font-bold text-cyan-300 mb-6 text-center">Site Statistics</h3>
                            <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-600/30 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                                    <Trophy size={28} className="text-white" />
                                </div>
                                <p className="text-gray-400 text-lg mb-2">Total Settings Generated</p>
                                <p className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-orbitron">
                                    {stats.totalUsers}
                                </p>
                                <div className="mt-4 text-sm text-gray-500">
                                    This number increments each time a user generates settings.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                 <div className="pt-6 mt-auto border-t border-gray-700 text-center">
                    <button onClick={saveAllChanges} disabled={isSaving} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-colors w-full md:w-auto mx-auto disabled:opacity-50">
                        {isSaving ? <Loader className="animate-spin" /> : <Save size={20} />}
                        <span>Save All Changes to Database</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- AI Assistant Panel ---
const AIAssistantPanel = ({ mobileModel, selectedRam, generatedSettings, popularCharacters }) => {
    const [playstyle, setPlaystyle] = useState('Rusher');
    const [character, setCharacter] = useState('Alok');
    const [weaponLoadout, setWeaponLoadout] = useState(null);
    const [trainingPlan, setTrainingPlan] = useState(null);
    const [optimizationTips, setOptimizationTips] = useState(null);
    const [strategy, setStrategy] = useState(null);
    const [synergy, setSynergy] = useState(null);
    const [loadingFeature, setLoadingFeature] = useState(null);

    useEffect(() => {
        if (popularCharacters && popularCharacters.length > 0 && !popularCharacters.includes(character)) {
            setCharacter(popularCharacters[0]);
        }
    }, [popularCharacters, character]);

    const handleFeatureGeneration = async (feature) => {
        setLoadingFeature(feature);
        let prompt = '';
        let jsonKeyCheck = '';

        switch(feature) {
            case 'loadout':
                setWeaponLoadout(null);
                prompt = `You are a Free Fire expert. A player is using a ${mobileModel} with ${selectedRam}. Their preferred playstyle is "${playstyle}". Suggest an optimal primary and secondary weapon loadout. Explain why this combination is effective. The output must be a valid JSON object with keys "loadoutName", "primaryWeapon", "secondaryWeapon", and "rationale".`;
                jsonKeyCheck = 'loadoutName';
                break;
            case 'training':
                setTrainingPlan(null);
                prompt = `You are a professional Free Fire e-sports coach. Create a 3-day aim training plan for a player using a ${mobileModel} with ${selectedRam}. The plan should be concise and focus on improving headshot accuracy and reaction time. The output must be a valid JSON object with keys "day1", "day2", and "day3", where each key's value is a single string describing the training for that day.`;
                jsonKeyCheck = 'day1';
                break;
            case 'optimization':
                setOptimizationTips(null);
                prompt = `You are a mobile gaming optimization expert. A user has a "${mobileModel}" with these specs: "${generatedSettings.deviceSpecs}". Generate a concise, actionable guide to optimize their phone for Free Fire. The output must be a valid JSON object with three keys: "performanceTips", "displayTips", and "networkTips".`;
                jsonKeyCheck = 'performanceTips';
                break;
            case 'strategy':
                setStrategy(null);
                prompt = `You are a professional Free Fire e-sports coach. A player is using a device with these specs: "${generatedSettings.deviceSpecs}". Their sensitivity settings are: General: ${generatedSettings.fixedSensitivity.general}, Red Dot: ${generatedSettings.fixedSensitivity.redDot}. Generate a concise, actionable strategy guide. The output must be a valid JSON object with three keys: "earlyGame", "midGame", and "lateGame".`;
                jsonKeyCheck = 'earlyGame';
                break;
            case 'synergy':
                setSynergy(null);
                prompt = `You are a Free Fire expert. A player's main character is ${character} and their playstyle is ${playstyle}. Recommend the best combination of 3 passive skills and a pet to create the perfect synergy. Explain the strategy behind this combination. The output must be a valid JSON object with keys "combinationName", "passiveSkills" (an array of 3 strings), "pet", and "synergyRationale".`;
                jsonKeyCheck = 'combinationName';
                break;
            default:
                setLoadingFeature(null);
                return;
        }

        try {
            const result = await callGenerativeApi(prompt, { responseMimeType: "application/json", temperature: 0.5 });
            const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textResponse) throw new Error(`No content received from API for ${feature}.`);
            
            const parsedData = JSON.parse(textResponse.replace(/```json/g, '').replace(/```/g, '').trim());
            
            if (!parsedData[jsonKeyCheck]) throw new Error(`Invalid data structure for ${feature}.`);

            switch(feature) {
                case 'loadout': setWeaponLoadout(parsedData); break;
                case 'training': setTrainingPlan(parsedData); break;
                case 'optimization': setOptimizationTips(parsedData); break;
                case 'strategy': setStrategy(parsedData); break;
                case 'synergy': setSynergy(parsedData); break;
            }
        } catch (e) {
            console.error(`Error fetching ${feature}:`, e);
        } finally {
            setLoadingFeature(null);
        }
    };

    return (
        <InfoCard title="AI Assistant Panel" icon={<BrainCircuit size={28} />} gradient="from-purple-500/10 to-indigo-500/10">
            <div className="space-y-8">
                {/* Weapon Loadout & Synergy */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="block text-lg font-medium text-cyan-300 mb-2">Weapon Loadout</label>
                        <select value={playstyle} onChange={(e) => setPlaystyle(e.target.value)} className="w-full bg-gray-900/50 border-2 border-gray-600/50 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all">
                            <option>Rusher</option>
                            <option>Sniper</option>
                            <option>Support</option>
                        </select>
                        <button onClick={() => handleFeatureGeneration('loadout')} disabled={loadingFeature} className="w-full group relative bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50">
                            {loadingFeature === 'loadout' ? <Loader className="animate-spin" size={20} /> : <Crosshair size={20} />}
                            <span>✨ Suggest Loadout</span>
                        </button>
                        {weaponLoadout && <div className="p-4 bg-black/20 rounded-lg animate-fadeIn">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-cyan-300 text-xl mb-2">{weaponLoadout.loadoutName}</h4>
                                <SpeechButton textToSpeak={`Loadout: ${weaponLoadout.loadoutName}. Primary: ${weaponLoadout.primaryWeapon}. Secondary: ${weaponLoadout.secondaryWeapon}. Rationale: ${weaponLoadout.rationale}`} />
                            </div>
                            <p><strong>Primary:</strong> {weaponLoadout.primaryWeapon}</p>
                            <p><strong>Secondary:</strong> {weaponLoadout.secondaryWeapon}</p>
                            <p className="mt-2 text-gray-400">{weaponLoadout.rationale}</p>
                        </div>}
                    </div>
                    <div className="space-y-4">
                        <label className="block text-lg font-medium text-cyan-300 mb-2">Character Synergy</label>
                        <select value={character} onChange={(e) => setCharacter(e.target.value)} className="w-full bg-gray-900/50 border-2 border-gray-600/50 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all">
                            {popularCharacters.map(char => <option key={char}>{char}</option>)}
                        </select>
                        <button onClick={() => handleFeatureGeneration('synergy')} disabled={loadingFeature} className="w-full group relative bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50">
                            {loadingFeature === 'synergy' ? <Loader className="animate-spin" size={20} /> : <Rabbit size={20} />}
                            <span>✨ Find Synergy</span>
                        </button>
                        {synergy && <div className="p-4 bg-black/20 rounded-lg animate-fadeIn">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-cyan-300 text-xl mb-2">{synergy.combinationName}</h4>
                                <SpeechButton textToSpeak={`Synergy: ${synergy.combinationName}. Skills: ${synergy.passiveSkills.join(', ')}. Pet: ${synergy.pet}. Rationale: ${synergy.synergyRationale}`} />
                            </div>
                            <p><strong>Passive Skills:</strong> {synergy.passiveSkills.join(', ')}</p>
                            <p><strong>Pet:</strong> {synergy.pet}</p>
                            <p className="mt-2 text-gray-400">{synergy.synergyRationale}</p>
                        </div>}
                    </div>
                </div>

                {/* Other Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => handleFeatureGeneration('training')} disabled={loadingFeature} className="w-full group relative bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50">
                        {loadingFeature === 'training' ? <Loader className="animate-spin" size={20} /> : <Dumbbell size={20} />}
                        <span>✨ Create Aim Plan</span>
                    </button>
                    <button onClick={() => handleFeatureGeneration('optimization')} disabled={loadingFeature} className="w-full group relative bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50">
                        {loadingFeature === 'optimization' ? <Loader className="animate-spin" size={20} /> : <Zap size={20} />}
                        <span>✨ Get Device Tips</span>
                    </button>
                    <button onClick={() => handleFeatureGeneration('strategy')} disabled={loadingFeature} className="w-full group relative bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50">
                        {loadingFeature === 'strategy' ? <Loader className="animate-spin" size={20} /> : <Swords size={20} />}
                        <span>✨ Get Strategy</span>
                    </button>
                </div>
                
                {trainingPlan && <div className="p-4 bg-black/20 rounded-lg animate-fadeIn">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-cyan-300 text-xl mb-2">Your 3-Day Aim Training Plan</h4>
                        <SpeechButton textToSpeak={`Your 3-Day Aim Training Plan. Day 1: ${trainingPlan.day1}. Day 2: ${trainingPlan.day2}. Day 3: ${trainingPlan.day3}.`} />
                    </div>
                    <p><strong>Day 1:</strong> {trainingPlan.day1}</p>
                    <p><strong>Day 2:</strong> {trainingPlan.day2}</p>
                    <p><strong>Day 3:</strong> {trainingPlan.day3}</p>
                </div>}
                {optimizationTips && <div className="p-4 bg-black/20 rounded-lg animate-fadeIn">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-cyan-300 text-xl mb-2">Device Optimization Tips</h4>
                        <SpeechButton textToSpeak={`Device Optimization Tips. Performance: ${optimizationTips.performanceTips}. Display: ${optimizationTips.displayTips}. Network: ${optimizationTips.networkTips}.`} />
                    </div>
                    <p><strong>Performance:</strong> {optimizationTips.performanceTips}</p>
                    <p><strong>Display:</strong> {optimizationTips.displayTips}</p>
                    <p><strong>Network:</strong> {optimizationTips.networkTips}</p>
                </div>}
                {strategy && <div className="p-4 bg-black/20 rounded-lg animate-fadeIn">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-cyan-300 text-xl mb-2">AI Game Strategy</h4>
                        <SpeechButton textToSpeak={`AI Game Strategy. Early Game: ${strategy.earlyGame}. Mid Game: ${strategy.midGame}. Late Game: ${strategy.lateGame}.`} />
                    </div>
                    <p><strong>Early Game:</strong> {strategy.earlyGame}</p>
                    <p><strong>Mid Game:</strong> {strategy.midGame}</p>
                    <p><strong>Late Game:</strong> {strategy.lateGame}</p>
                </div>}
            </div>
        </InfoCard>
    );
};

// --- AI Chat Box Component ---
const AIChatBox = ({ settings }) => {
    const [messages, setMessages] = useState([
        { from: 'ai', text: 'Ask me about Free Fire, sensitivity, or mobile optimization!' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput) return;

        const newMessages = [...messages, { from: 'user', text: trimmedInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsTyping(true);

        const prompt = `
            You are a specialized AI assistant for the "Loading PC Free Sensi" application. Your purpose is to answer questions ONLY about the following topics: general Free Fire gameplay, Free Fire sensitivity settings, and mobile optimization for Android gaming. The user has these sensitivity settings: General: ${settings.general}, Red Dot: ${settings.redDot}, DPI: ${settings.dpi}.

            Analyze the user's question: "${trimmedInput}"

            1. First, determine if the question is related to Free Fire gameplay, sensitivity settings (DPI, scopes, recoil), or Android mobile optimization for gaming.
            2. If the question IS about one of these topics, provide a helpful and concise answer.
            3. If the question is NOT about these topics (e.g., it's about other games, personal questions, or anything unrelated), you MUST respond with the exact phrase: "ask questions related to free fire sensitivity" and nothing else.
        `;

        try {
            const result = await callGenerativeApi(prompt, { temperature: 0.2 });
            let aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!aiResponse) {
                aiResponse = "I couldn't process that. Please ask a relevant question.";
            }
            aiResponse = aiResponse.replace(/\*/g, '');
            setMessages(prev => [...prev, { from: 'ai', text: aiResponse }]);
        } catch (error) {
            console.error("Chat API error:", error);
            setMessages(prev => [...prev, { from: 'ai', text: "Sorry, I'm having trouble connecting. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <InfoCard title="Sensitivity AI Chat" icon={<BrainCircuit size={28} />} gradient="from-green-500/10 to-teal-500/10">
            <div className="flex flex-col h-96">
                <div className="flex-1 space-y-4 p-4 overflow-y-auto bg-black/20 rounded-lg">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.from === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && <div className="flex justify-start"><div className="px-4 py-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none animate-pulse">AI is typing...</div></div>}
                    <div ref={messagesEndRef} />
                </div>
                <div className="mt-4 flex gap-4">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about sensitivity..."
                        className="w-full bg-gray-900/50 border-2 border-gray-600/50 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-lg"
                    />
                    <button onClick={handleSendMessage} disabled={isTyping} className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold p-4 rounded-lg flex items-center justify-center transition-all transform hover:scale-105 disabled:opacity-50">
                        <Send size={24} />
                    </button>
                </div>
            </div>
        </InfoCard>
    );
};


// --- Main App Component ---
function App() {
  const [mobileModel, setMobileModel] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [deviceSpecs, setDeviceSpecs] = useState(null);
  const [ramOptions, setRamOptions] = useState([]);
  const [selectedRam, setSelectedRam] = useState('');
  const [generatedSettings, setGeneratedSettings] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentStep, setCurrentStep] = useState('input'); // 'input', 'ram_selection', 'results'
  const [sensitivityPresets, setSensitivityPresets] = useState({});
  const [popularCharacters, setPopularCharacters] = useState([]);

  const YOUTUBE_CHANNEL_LINK = "https://www.youtube.com/@loadingpcff";
  
  // FIX: Defined a constant for fallback presets to ensure they are always available.
  // The values for 12GB RAM are set to the specific values requested.
  const FALLBACK_PRESETS = {
    "12": { dpi: "400", settings: { general: 163, redDot: 150, twoXScope: 122, fourXScope: 165, sniperScope: 160, freeLook: 165 }},
    "8": { dpi: "420", settings: { general: 175, redDot: 160, twoXScope: 130, fourXScope: 145, sniperScope: 150, freeLook: 140 }},
    "6": { dpi: "430", settings: { general: 178, redDot: 150, twoXScope: 130, fourXScope: 145, sniperScope: 65, freeLook: 60 }},
    "4": { dpi: "480", settings: { general: 185, redDot: 151, twoXScope: 135, fourXScope: 145, sniperScope: 35, freeLook: 66 }},
    "3": { dpi: "Default", settings: { general: 191, redDot: 181, twoXScope: 170, fourXScope: 155, sniperScope: 110, freeLook: 126 }},
    "2": { dpi: "Default", settings: { general: 198, redDot: 185, twoXScope: 160, fourXScope: 165, sniperScope: 120, freeLook: 130 }}
  };
  
  useEffect(() => {
    if (!isFirebaseConfigured) {
        setIsAuthReady(true);
        // Use the fallback constant when Firebase is not configured.
        setSensitivityPresets(FALLBACK_PRESETS);
        setPopularCharacters(["Alok", "Chrono", "Wukong", "Skyler", "K"]);
        return;
    }
    const initAuth = async () => {
        try {
            const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
            if (token) {
                await signInWithCustomToken(auth, token);
            } else {
                await signInAnonymously(auth);
            }
        } catch (e) {
            console.error("Authentication failed:", e);
            if (e.code === 'auth/invalid-custom-token') {
                await signInAnonymously(auth);
            }
        }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setIsAuthReady(true);
        } else {
            initAuth();
        }
    });

    return () => unsubscribe();
  }, []);

  // --- Fetch dynamic data from Firestore on load ---
  useEffect(() => {
    if (!isFirebaseConfigured || !isAuthReady) {
        return;
    }

    const fetchData = async () => {
        try {
            const presetsRef = doc(db, "artifacts", appId, "public/data", "sensitivityPresets", "allPresets");
            const presetsSnap = await getDoc(presetsRef);
            
            // FIX: Merge Firestore data with the local fallback.
            // This ensures that if a preset (like 12GB) is missing from Firestore,
            // the local version is used, preventing the "not found" error.
            let finalPresets = { ...FALLBACK_PRESETS }; 
            if (presetsSnap.exists()) {
                finalPresets = { ...finalPresets, ...presetsSnap.data() };
            } else {
                 console.warn("No presets document in Firestore, using local fallback data.");
                 // Optionally, you could write the fallback presets to Firestore here if they don't exist.
                 // await setDoc(presetsRef, FALLBACK_PRESETS);
            }
            setSensitivityPresets(finalPresets);

            const gameDataRef = doc(db, "artifacts", appId, "public/data", "gameData", "main");
            const gameDataSnap = await getDoc(gameDataRef);
            if (gameDataSnap.exists()) {
                setPopularCharacters(gameDataSnap.data().popularCharacters || []);
            } else {
                const initialChars = ["Alok", "Chrono", "Wukong", "Skyler", "K"];
                await setDoc(gameDataRef, { popularCharacters: initialChars });
                setPopularCharacters(initialChars);
            }
        } catch (error) {
            console.error("Error fetching dynamic data:", error);
            // If fetching fails, still set the fallback presets
            setSensitivityPresets(FALLBACK_PRESETS);
        }
    };
    
    fetchData();
  }, [isAuthReady]);


  const recordUsage = async () => {
    if (!isFirebaseConfigured || !isAuthReady) return;
    
    try {
      const docRef = doc(db, "artifacts", appId, "public/data", "analytics", "usage");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentCount = docSnap.data().totalUsers || 0;
        await updateDoc(docRef, { totalUsers: currentCount + 1, lastUpdated: serverTimestamp() });
      } else {
        await setDoc(docRef, { totalUsers: 1, lastUpdated: serverTimestamp() });
      }
    } catch (error) {
      console.error("Failed to record usage:", error);
    }
  };

  const handleModelChange = (e) => {
    const value = e.target.value;
    setMobileModel(value);
    if (value.length > 1) {
        const filteredSuggestions = MOBILE_PHONE_MODELS.filter(phone =>
            phone.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
        setShowSuggestions(true);
    } else {
        setSuggestions([]);
        setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMobileModel(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const checkDeviceAndGetSpecs = async () => {
    const trimmedModel = mobileModel.trim();
    if (!trimmedModel) {
        setError('Please enter your mobile brand and model.');
        return;
    }

    if (trimmedModel.toLowerCase().includes('iphone')) {
        setError("For Iphone Sensi Will Be Updated Soon");
        return;
    }

    setLoading(true);
    setError('');
    
    const prompt = `
        You are a mobile device expert. Analyze the following text: "${trimmedModel}".
        1. Determine if this is a known or plausible mobile phone model name.
        2. If it is, provide a brief summary of its key specifications (like Processor, Display type).
        3. List its common RAM configurations (e.g., 4GB, 6GB, 8GB). If RAM is fixed (like iPhones), list that single option.
        
        Respond with a single JSON object with the following structure:
        {
          "isModelValid": boolean,
          "modelName": "string",
          "specsSummary": "string",
          "ramOptions": ["string"]
        }
        If the model is not valid, set "isModelValid" to false and the other fields to empty strings or empty arrays.
    `;

    try {
        const result = await callGenerativeApi(prompt, { responseMimeType: "application/json", temperature: 0.0 });
        const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResponse) throw new Error("AI validation failed.");
        
        const parsedData = JSON.parse(textResponse.replace(/```json/g, '').replace(/```/g, '').trim());
        
        if (parsedData.isModelValid && parsedData.ramOptions.length > 0) {
            setDeviceSpecs(parsedData);
            setRamOptions(parsedData.ramOptions);
            setSelectedRam(parsedData.ramOptions[0]);
            setCurrentStep('ram_selection');
        } else {
            setError(`No mobile name found for "${trimmedModel}". Please check the spelling and try again.`);
        }
    } catch (e) {
        console.error("Error checking device:", e);
        setError('Failed to verify the device. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const getSensitivity = async () => {
  if (!selectedRam) {
    setError('Please select a RAM configuration.');
    return;
  }

  setLoading(true);
  setError('');
  setGeneratedSettings(null);
  setIsUnlocked(false);

  const ramValue = selectedRam.replace(/\D/g, '');
  
  // First check if we have a preset for this RAM
  let preset = sensitivityPresets[ramValue];
  
  // If not found, use fallback presets
  if (!preset) {
    preset = FALLBACK_PRESETS[ramValue];
  }

  if (!preset) {
    setError(`Sorry, no preset sensitivity found for ${selectedRam} RAM.`);
    setLoading(false);
    return;
  }
  
  await new Promise(res => setTimeout(res, 500));

  setGeneratedSettings({
    deviceSpecs: `Settings optimized for ${mobileModel} with ${selectedRam} RAM.`,
    fixedSensitivity: preset.settings,
    dpi: preset.dpi
  });
  
  await recordUsage();
  setCurrentStep('results');
  setLoading(false);
};
  
  const resetApp = () => {
    setMobileModel('');
    setSuggestions([]);
    setShowSuggestions(false);
    setDeviceSpecs(null);
    setRamOptions([]);
    setSelectedRam('');
    setGeneratedSettings(null);
    setIsUnlocked(false);
    setError('');
    setCurrentStep('input');
  };

  const handleDataUpdate = (data) => {
      if (data.presets) setSensitivityPresets(data.presets);
      if (data.characters) setPopularCharacters(data.characters);
  };

  const sensitivityIcons = {
    general: <Settings size={32}/>,
    redDot: <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow-lg"></div>,
    twoXScope: <div className="text-2xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">2×</div>,
    fourXScope: <div className="text-2xl font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">4×</div>,
    sniperScope: <div className="text-lg font-bold font-orbitron bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AWM</div>,
    freeLook: <Eye size={32} />
  };
  
  const mainStyle = {
    backgroundImage: `url('https://i.postimg.cc/6QXDwwC4/08181-ezgif-com-video-to-gif-converter-1.gif')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <div style={mainStyle} className="min-h-screen text-white font-roboto flex flex-col items-center relative overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/70 to-black/80"></div>
      
      <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/10 rounded-full animate-float"></div>
      <div className="absolute top-60 right-20 w-24 h-24 bg-purple-500/10 rounded-full animate-float-delayed"></div>
      <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-cyan-500/5 rounded-full animate-pulse"></div>
      
      <div className="relative z-10 w-full p-4 sm:p-6 md:p-8">
        {currentStep === 'results' && !isUnlocked && <SubscriptionModal onUnlock={() => setIsUnlocked(true)} channelUrl={YOUTUBE_CHANNEL_LINK} />}
        {showAdminLogin && <AdminLoginModal onLogin={() => { setShowAdminLogin(false); setShowOwnerPanel(true); }} onClose={() => setShowAdminLogin(false)} />}
        {showOwnerPanel && <OwnerPanel onClose={() => setShowOwnerPanel(false)} initialPresets={sensitivityPresets} initialCharacters={popularCharacters} onDataUpdate={handleDataUpdate} />}
        
        <div className="w-full max-w-6xl mx-auto">
          <header className="text-center mb-12 animate-fadeInDown">
            <div className="relative w-40 h-40 mx-auto mb-8 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative bg-gray-900 rounded-3xl p-2 h-full w-full flex items-center justify-center">
                    <img
                        src="https://i.postimg.cc/tg584W4h/DOC-20250604-WA0024-1.jpg"
                        alt="Loading PC Free Sensi Logo"
                        className="h-32 w-auto object-cover rounded-2xl drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/000000/00f5ff?text=Loading+PC'; }}
                    />
                </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-wider mb-4 font-orbitron">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x drop-shadow-2xl">
                Loading PC Free Sensi
              </span>
            </h1>
            
            <p className="text-gray-300 text-xl mb-6 max-w-2xl mx-auto leading-relaxed">
              Revolutionary AI-powered Free Fire sensitivity optimizer for peak performance
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-cyan-400" />
                <span>AI Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-purple-400" />
                <span>Pro Grade</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-yellow-400" />
                <span>Competitive Ready</span>
              </div>
            </div>
          </header>

          {currentStep === 'input' && (
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-lg p-8 rounded-3xl shadow-2xl mb-12 border border-gray-600/30 animate-fadeInUp">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="relative w-full lg:flex-1">
                  <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400 z-10" size={24} />
                  <input 
                    type="text" 
                    value={mobileModel} 
                    onChange={handleModelChange} 
                    placeholder="Enter your device model (e.g., Samsung Galaxy S21)" 
                    className="w-full bg-gray-900/50 backdrop-blur-sm border-2 border-gray-600/50 rounded-2xl py-5 pl-16 pr-6 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-lg placeholder-gray-400 hover:border-cyan-500/50" 
                    onKeyPress={(e) => e.key === 'Enter' && checkDeviceAndGetSpecs()} 
                    autoComplete="off"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  {showSuggestions && suggestions.length > 0 && (
                      <ul className="absolute z-20 w-full mt-2 bg-gray-800/90 backdrop-blur-md border border-gray-600 rounded-2xl max-h-60 overflow-y-auto shadow-2xl animate-fadeIn">
                          {suggestions.map((suggestion, index) => (
                              <li 
                                  key={index} 
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="px-6 py-4 text-lg text-gray-300 hover:bg-cyan-500/10 cursor-pointer transition-colors duration-200 flex items-center gap-4"
                              >
                                  <Search size={18} className="text-cyan-400" />
                                  {suggestion}
                              </li>
                          ))}
                      </ul>
                  )}
                </div>
                
                <button 
                  onClick={checkDeviceAndGetSpecs} 
                  disabled={loading} 
                  className="group relative w-full lg:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-5 px-12 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl text-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center gap-3">
                    {loading ? <Loader className="animate-spin" size={24} /> : <Search size={24} />}
                    <span>Check Device</span>
                    <ChevronRight size={24} />
                  </span>
                </button>
              </div>
            </div>
          )}

          {currentStep === 'ram_selection' && deviceSpecs && (
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-lg p-8 rounded-3xl shadow-2xl mb-12 border border-gray-600/30 animate-fadeInUp">
                <h2 className="text-3xl font-bold text-center mb-2 font-orbitron bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{deviceSpecs.modelName}</h2>
                <p className="text-center text-gray-400 mb-8 text-lg">{deviceSpecs.specsSummary}</p>

                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3 font-orbitron text-cyan-300">
                        <MemoryStick size={28}/>
                        Select Your RAM Configuration
                    </h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {ramOptions.map(ram => (
                            <button
                                key={ram}
                                onClick={() => setSelectedRam(ram)}
                                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 border-2 ${selectedRam === ram ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-cyan-500/20 shadow-lg' : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700/80 hover:border-gray-500'}`}
                            >
                                {ram}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center">
                    <button 
                        onClick={getSensitivity} 
                        disabled={loading} 
                        className="group relative w-full md:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-5 px-12 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl text-lg overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <span className="relative z-10 flex items-center gap-3">
                        {loading ? (
                            <>
                            <Loader className="animate-spin" size={24} />
                            <span>Generating...</span>
                            </>
                        ) : (
                            <>
                            <Target size={24} />
                            <span>Generate Pro Settings</span>
                            </>
                        )}
                        </span>
                    </button>
                </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-400 flex items-center gap-3 backdrop-blur-sm animate-fadeIn">
              <AlertCircle size={24} className="flex-shrink-0" />
              <p className="text-lg">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-16 animate-fadeIn">
              <div className="relative">
                <div className="w-32 h-32 mx-auto mb-8 relative">
                  <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-4 border-4 border-purple-500/30 rounded-full"></div>
                  <div className="absolute inset-4 border-4 border-purple-500 rounded-full border-t-transparent animate-spin animate-reverse"></div>
                  <Gamepad2 size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-orbitron mb-4">
                  {currentStep === 'input' ? 'Analyzing Device...' : 'Generating Pro Settings...'}
                </h3>
                <p className="text-gray-400 text-lg">AI is working its magic...</p>
              </div>
            </div>
          )}

          {currentStep === 'results' && generatedSettings && isUnlocked && (
            <div className="animate-fadeIn space-y-10">
              <InfoCard 
                title="Device Analysis" 
                icon={<Cpu size={28} />}
                gradient="from-cyan-500/10 to-blue-500/10"
              >
                <p className="text-xl">{generatedSettings.deviceSpecs}</p>
              </InfoCard>

              <div>
                <h2 className="text-4xl font-bold mb-8 text-center flex items-center justify-center gap-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-orbitron">
                  <Target className="text-cyan-400" size={36} />
                  <span>Optimized Sensitivity ({mobileModel} - {selectedRam})</span>
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(generatedSettings.fixedSensitivity).map(([key, value]) => (
                    <SensitivityItem key={key} label={key} value={value} icon={sensitivityIcons[key]} />
                  ))}
                </div>
              </div>

                <div className="group relative bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm p-8 rounded-3xl border border-gray-600/30 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:border-purple-500/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 text-center">
                        <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-orbitron">
                            <MousePointerClick size={28} />
                            <span>DPI Configuration</span>
                        </h2>
                        <p className="text-gray-400 mb-6 text-lg">Recommended Smallest Width</p>
                        <p className="text-8xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent font-orbitron drop-shadow-lg">
                            {generatedSettings.dpi}
                        </p>
                    </div>
                </div>

                <InfoCard title="How to Change Your DPI" icon={<Info size={28} />} gradient="from-gray-700/20 to-gray-600/20">
                    <ol className="list-decimal list-inside space-y-4 text-lg">
                        <li>Go to <strong className="text-cyan-400">Settings</strong> on your phone, then find and tap on <strong className="text-cyan-400">"About Phone"</strong>.</li>
                        <li>Find the <strong className="text-cyan-400">"Build Number"</strong> and tap on it 7 times in a row. You'll see a message saying "You are now a developer!"</li>
                        <li>Go back to the main Settings menu and find the new <strong className="text-cyan-400">"Developer Options"</strong> menu (it might be under "System" or "Additional Settings").</li>
                        <li>Inside Developer Options, scroll down to the "Drawing" section and find <strong className="text-cyan-400">"Smallest width"</strong> or <strong className="text-cyan-400">"Minimum width"</strong>.</li>
                        <li>Tap on it and enter the recommended DPI value shown above.</li>
                    </ol>
                    <p className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 text-base">
                        <strong>Warning:</strong> Be careful! Entering a very high DPI value can make your screen unreadable. Only use the recommended value.
                    </p>
                </InfoCard>
              
              <AIAssistantPanel mobileModel={mobileModel} selectedRam={selectedRam} generatedSettings={generatedSettings} popularCharacters={popularCharacters}/>

              <AIChatBox settings={{...generatedSettings.fixedSensitivity, dpi: generatedSettings.dpi}} />

                <div className="text-center mt-12">
                    <button onClick={resetApp} className="text-cyan-400 hover:text-white text-lg font-semibold transition-colors duration-300">
                        Search for another device
                    </button>
                </div>
            </div>
          )}
        </div>
        
        <footer className="w-full max-w-6xl mx-auto text-center text-gray-400 mt-20 py-8">
          {isFirebaseConfigured && (
            <button 
              onClick={() => setShowAdminLogin(true)} 
              className="group bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm hover:from-purple-600/20 hover:to-indigo-600/20 text-gray-400 hover:text-white py-3 px-6 rounded-xl mb-6 transition-all duration-300 border border-gray-600/30 hover:border-purple-500/50"
            >
              <div className="flex items-center gap-2">
                <BarChart2 size={18} className="group-hover:scale-110 transition-transform duration-300" />
                <span>Owner's Dashboard</span>
              </div>
            </button>
          )}
          <div className="space-y-2 text-sm">
            <p>&copy; {new Date().getFullYear()} Loading PC Free Sensi. All rights reserved.</p>
            <p className="text-cyan-400">Loading PC AI</p>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap');
        .font-orbitron { font-family: 'Orbitron', monospace; }
        .font-roboto { font-family: 'Inter', sans-serif; }
        
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        
        @keyframes fadeInDown { 
          from { opacity: 0; transform: translateY(-30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }

        @keyframes tilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards 0.2s; animation-fill-mode: both; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite 2s; }
        .animate-gradient-x { animation: gradient-x 3s ease infinite; }
        .animate-reverse { animation-direction: reverse; }
        .animate-tilt { animation: tilt 10s infinite linear; }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #8b5cf6);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #0891b2, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default App;
