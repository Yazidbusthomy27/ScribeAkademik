
import React, { useState, useEffect } from 'react';
import { PaperInput, PaperData, EducationLevel, LanguageStyle } from './types';
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
      // Prioritaskan API_KEY dari environment
      if (process.env.API_KEY && process.env.API_KEY !== "") {
        setNeedsKey(false);
        return;
      }

      // Jika tidak ada di env, periksa apakah sudah dipilih via dialog aistudio
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setNeedsKey(true);
        }
      } else {
        // Jika bukan di lingkungan aistudio dan env kosong, kita tetap tampilkan form 
        // tapi kemungkinan akan error saat generate.
        setNeedsKey(false);
      }
    };

    checkApiKey();
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Asumsikan pemilihan berhasil sesuai panduan race condition
      setNeedsKey(false);
    }
  };

  const handleGenerate = async (input: PaperInput) => {
    setLoading(true);
    setError(null);
    try {
      const content = await generateAcademicPaper(input);
      setPaperData({ input, content });
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key tidak valid atau project tidak ditemukan. Mohon pilih kunci kembali.");
        setNeedsKey(true);
      } else {
        setError(err.message || 'Terjadi kesalahan saat memproses data.');
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
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-key text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Siapkan ScribeAkademik</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Untuk menggunakan model AI Gemini 3 Pro, Anda perlu menghubungkan API Key dari Google AI Studio (Project Berbayar).
          </p>
          <button
            onClick={handleConnectKey}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-3 mb-4"
          >
            <span>Hubungkan API Key</span>
            <i className="fas fa-external-link-alt text-sm"></i>
          </button>
          <p className="text-xs text-slate-400 italic">
            Pelajari tentang <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline text-blue-500">penagihan API Gemini</a>.
          </p>
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
            <div className="hidden md:block">
              <span className="text-sm text-gray-500 italic">
                Solusi cerdas penyusunan makalah
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
                Buat Makalah Akademik Otomatis
              </h1>
              <p className="text-lg text-gray-600">
                Masukkan detail topik Anda, dan AI kami akan menyusun draf makalah lengkap dengan struktur baku akademik Indonesia.
              </p>
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
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-check-circle text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-800">Struktur Baku</h3>
                <p className="text-sm text-gray-500">Otomatis menyusun Cover hingga Daftar Pustaka.</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-shield-alt text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-800">Orisinalitas Tinggi</h3>
                <p className="text-sm text-gray-500">Konten unik hasil pemikiran AI cerdas.</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-file-word text-xl"></i>
                </div>
                <h3 className="font-semibold text-gray-800">Export DOCX</h3>
                <p className="text-sm text-gray-500">Hasil bisa langsung diunduh dalam format Word.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} ScribeAkademik AI. Membantu Literasi Bangsa.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
