
import React, { useState, useEffect } from 'react';
import { PaperInput, PaperData } from './types';
import { generateAcademicPaper } from './services/geminiService';
import PaperForm from './components/PaperForm';
import PaperPreview from './components/PaperPreview';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paperData, setPaperData] = useState<PaperData | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState(false);

  // Load API Key dari local storage saat start
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else if (process.env.API_KEY) {
      setApiKey(process.env.API_KEY);
    }
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem('gemini_api_key', newKey);
  };

  const handleGenerate = async (input: PaperInput) => {
    if (!apiKey.trim()) {
      setError("Silakan masukkan API Key Gemini Anda terlebih dahulu.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const content = await generateAcademicPaper(input, apiKey);
      setPaperData({ input, content });
    } catch (err: any) {
      console.error("Generate Error:", err);
      const msg = err.message || "";
      if (msg.includes("API_KEY_INVALID") || msg.includes("not found") || msg.includes("401") || msg.includes("403")) {
        setError("API Key tidak valid atau tidak memiliki izin. Periksa kembali kunci Anda.");
      } else {
        setError(msg || 'Terjadi kesalahan sistem saat menyusun makalah.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPaperData(null);
    setError(null);
  };

  const isKeyReady = apiKey.trim().length > 10;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                <i className="fas fa-graduation-cap text-white text-xl"></i>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Scribe<span className="text-blue-600">Akademik</span>
                </span>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 leading-none mt-1">AI Research Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {loading ? (
          <LoadingScreen />
        ) : paperData ? (
          <PaperPreview data={paperData} onReset={handleReset} />
        ) : (
          <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Penyusun Makalah <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Otomatis</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Platform cerdas untuk membantu pelajar dan mahasiswa menyusun draf makalah akademik lengkap dengan struktur baku dan bahasa ilmiah formal.
              </p>
            </div>

            {/* Form Input API Key */}
            <div className={`mb-10 overflow-hidden rounded-3xl border-2 transition-all duration-500 ${isKeyReady ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-white border-blue-100 shadow-xl shadow-blue-100/50'}`}>
              <div className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all ${isKeyReady ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    <i className={`fas ${isKeyReady ? 'fa-key' : 'fa-lock'} text-2xl`}></i>
                  </div>
                  <div className="flex-grow w-full">
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Gemini API Key Anda</label>
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-semibold">Dapatkan Kunci Gratis &rarr;</a>
                    </div>
                    <div className="relative group">
                      <input
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={handleApiKeyChange}
                        placeholder="Masukkan API Key (AIza...)"
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all pr-12 font-mono text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2"
                      >
                        <i className={`fas ${showKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400 italic">
                      * Kunci Anda disimpan secara lokal di browser ini dan tidak dikirim ke server kami.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 flex items-start space-x-4 animate-shake shadow-sm">
                <div className="mt-0.5">
                  <i className="fas fa-circle-exclamation text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Terjadi Masalah</h4>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
            )}

            <div className={`transition-all duration-700 ${!isKeyReady ? 'opacity-40 grayscale pointer-events-none scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100 relative">
                {!isKeyReady && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/10 backdrop-blur-[1px]">
                    <div className="bg-white/95 px-6 py-4 rounded-2xl shadow-2xl border border-blue-50 text-blue-600 font-bold flex flex-col items-center space-y-2">
                      <i className="fas fa-key animate-bounce text-2xl"></i>
                      <span>Masukkan API Key untuk Membuka Form</span>
                    </div>
                  </div>
                )}
                <PaperForm onSubmit={handleGenerate} />
              </div>
            </div>

            {/* Bagian Keunggulan / Kelebihan Aplikasi - Sekarang Hanya 3 */}
            <div className="mt-24 space-y-16">
              <div className="text-center">
                <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Keunggulan ScribeAkademik</h2>
                <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <i className="fas fa-sitemap text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Struktur Baku</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Setiap makalah disusun dengan format akademik standar Indonesia, lengkap mulai dari Cover hingga Daftar Pustaka otomatis.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                    <i className="fas fa-spell-check text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Bahasa Formal</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    AI kami menggunakan tata bahasa Indonesia formal (PUEBI/EYD) yang kaku dan objektif, sesuai dengan kaidah penulisan ilmiah.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                    <i className="fas fa-file-export text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Export DOCX</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Unduh hasil makalah langsung ke format Microsoft Word (.docx) dengan margin standar dan font Times New Roman 12pt siap cetak.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            &copy; {new Date().getFullYear()} ScribeAkademik
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
