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
  const [needsKey, setNeedsKey] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      // Akses aman ke process.env.API_KEY
      const currentKey = (window as any).process?.env?.API_KEY;
      const isKeyPresent = currentKey && typeof currentKey === 'string' && currentKey !== "undefined" && currentKey !== "";

      if (isKeyPresent) {
        setNeedsKey(false);
        return;
      }

      // Jika env kosong, cek via helper aistudio
      if ((window as any).aistudio) {
        try {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setNeedsKey(!hasKey);
        } catch (e) {
          setNeedsKey(true);
        }
      } else {
        setNeedsKey(false);
      }
    };

    checkApiKey();
  }, []);

  const handleConnectKey = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setNeedsKey(false);
      } catch (e) {
        setError("Gagal membuka pemilihan kunci.");
      }
    }
  };

  const handleGenerate = async (input: PaperInput) => {
    setLoading(true);
    setError(null);
    try {
      const content = await generateAcademicPaper(input);
      setPaperData({ input, content });
    } catch (err: any) {
      console.error("Generate Error:", err);
      const msg = err.message || "";
      if (msg.includes("API Key") || msg.includes("API key")) {
        setError("API Key tidak terdeteksi. Silakan hubungkan melalui tombol di bawah.");
        setNeedsKey(true);
      } else {
        setError(msg || 'Terjadi kesalahan saat menyusun makalah.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPaperData(null);
    setError(null);
  };

  if (needsKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100 animate-shake">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-key text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">API Key Diperlukan</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            ScribeAkademik membutuhkan <strong>API_KEY</strong> Gemini untuk bekerja. Jika Anda sudah mengaturnya di Vercel, pastikan untuk melakukan Redeploy.
          </p>
          
          {(window as any).aistudio ? (
            <button
              onClick={handleConnectKey}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-3 mb-4"
            >
              <span>Pilih API Key Baru</span>
              <i className="fas fa-external-link-alt text-sm"></i>
            </button>
          ) : (
            <div className="bg-amber-50 p-4 rounded-lg text-amber-800 text-sm mb-6 border border-amber-200">
              <i className="fas fa-info-circle mr-2"></i>
              Tambahkan <code>API_KEY</code> di Vercel Dashboard dan pilih <strong>Redeploy</strong>.
            </div>
          )}
          
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-xs text-blue-500 underline">
            Info Penagihan & API Gemini
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <i className="fas fa-file-alt text-white text-xl"></i>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
                ScribeAkademik
              </span>
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
          <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Buat Makalah Otomatis</h1>
              <p className="text-lg text-gray-600">AI cerdas untuk membantu menyusun draf akademik Anda secara instan.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
                <i className="fas fa-exclamation-triangle mr-3"></i>
                <p>{error}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <PaperForm onSubmit={handleGenerate} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;