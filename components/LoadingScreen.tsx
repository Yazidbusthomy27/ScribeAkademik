
import React, { useState, useEffect } from 'react';

const messages = [
  "Menganalisis topik makalah...",
  "Menyusun struktur pendahuluan...",
  "Mengumpulkan data pembahasan akademik...",
  "Menyelaraskan gaya bahasa formal...",
  "Membuat daftar pustaka standar APA...",
  "Merancang format cover profesional...",
  "Menyelesaikan draf akhir..."
];

const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        return prev + 1;
      });
    }, 200);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="relative mb-12">
        <div className="w-32 h-32 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-32 h-32 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-32 h-32 flex items-center justify-center">
          <i className="fas fa-book-reader text-4xl text-blue-600 animate-pulse"></i>
        </div>
      </div>

      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Sedang Menulis...</h2>
        <p className="text-blue-600 font-medium h-8 transition-all duration-500">
          {messages[messageIndex]}
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-8 overflow-hidden">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">
          Proses ini biasanya memakan waktu 15-30 detik tergantung kompleksitas topik.
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
