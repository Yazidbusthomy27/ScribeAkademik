import React, { useState } from 'react';
import { PaperInput, PaperData } from './types';
import { generateAcademicPaper } from './services/geminiService';
import PaperForm from './components/PaperForm';
import PaperPreview from './components/PaperPreview';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paperData, setPaperData] = useState<PaperData | null>(null);

  const handleGenerate = async (input: PaperInput) => {
    setLoading(true);
    setError(null);
    try {
      const content = await generateAcademicPaper(input);
      setPaperData({ input, content });
    } catch (err: any) {
      console.error("Generate Error:", err);
      // Menampilkan pesan error yang lebih bersih bagi pengguna
      const errorMessage = err.message || 'Terjadi kesalahan saat menyusun makalah.';
      if (errorMessage.includes("API key")) {
        setError("Kesalahan API Key: Pastikan variabel lingkungan API_KEY telah dikonfigurasi dengan benar di dashboard deployment Anda.");
      } else {
        setError(errorMessage);
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
            <div className="hidden md:block">
              <span className="text-sm text-gray-500 italic">
                Penyusun Makalah Otomatis
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
                Solusi instan untuk menyusun draf makalah lengkap dengan struktur formal Bahasa Indonesia.
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
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} ScribeAkademik AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;