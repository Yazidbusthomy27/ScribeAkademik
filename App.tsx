
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
  const [hasKey, setHasKey] = useState<boolean>(false);

  // Cek apakah API Key sudah tersedia saat aplikasi dimuat
  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const connected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(connected);
      } else if (process.env.API_KEY) {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleConnectKey = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setHasKey(true);
        setError(null);
      } catch (err) {
        console.error("Gagal membuka pemilihan kunci:", err);
      }
    } else {
      alert("Fitur pemilihan kunci otomatis tidak tersedia di browser ini.");
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
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key tidak valid atau project tidak ditemukan. Silakan hubungkan ulang.");
        setHasKey(false);
      } else if (err.message?.includes("API key")) {
        setError("API Key belum diset atau tidak valid. Klik tombol 'Hubungkan API Key' di atas.");
        setHasKey(false);
      } else {
        setError(err.message || 'Terjadi kesalahan saat menyusun makalah.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPaperData(null);
    setError(null);
  };

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
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                Buat Makalah Akademik AI
              </h1>
              <p className="text-lg text-gray-600">
                Gunakan API Key Anda sendiri untuk hasil yang lebih cepat dan stabil.
              </p>
            </div>

            {/* API Key Connection Section */}
            <div className={`mb-8 p-6 rounded-2xl border-2 transition-all ${hasKey ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200 shadow-lg animate-pulse'}`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasKey ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    <i className={`fas ${hasKey ? 'fa-check-circle' : 'fa-key'} text-xl`}></i>
                  </div>
                  <div>
                    <h3 className={`font-bold ${hasKey ? 'text-green-800' : 'text-amber-800'}`}>
                      {hasKey ? 'Koneksi AI Aktif' : 'Koneksi AI Diperlukan'}
                    </h3>
                    <p className={`text-sm ${hasKey ? 'text-green-600' : 'text-amber-600'}`}>
                      {hasKey ? 'Aplikasi siap digunakan dengan API Key Anda.' : 'Anda perlu menghubungkan API Key Gemini untuk membuat makalah.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleConnectKey}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 shadow-sm ${hasKey ? 'bg-white text-green-700 border border-green-200 hover:bg-green-100' : 'bg-amber-600 text-white hover:bg-amber-700'}`}
                >
                  <i className="fas fa-plug"></i>
                  <span>{hasKey ? 'Ganti API Key' : 'Hubungkan API Key'}</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center animate-shake">
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

      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} ScribeAkademik AI. Gunakan kunci dari <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="underline">Google AI Studio</a>.
        </div>
      </footer>
    </div>
  );
};

export default App;
