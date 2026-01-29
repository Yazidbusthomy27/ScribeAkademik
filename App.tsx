
import React, { useState } from 'react';
import { PaperInput, PaperData, EducationLevel, LanguageStyle } from './types';
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
      setError(err.message || 'Terjadi kesalahan saat memproses data.');
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
      {/* Navbar */}
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
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
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
