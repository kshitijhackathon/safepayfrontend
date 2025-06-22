import React, { useState } from 'react';
import { EnhancedQRScanner } from '@/components/scanner/enhanced-qr-scanner';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export default function QRScan() {
  const [, setLocation] = useLocation();
  const [showChoiceModal, setShowChoiceModal] = useState(true);
  const [mode, setMode] = useState<'scan' | 'upload' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleScan = (qrData: string) => {
    try {
      console.log('QR code scanned:', qrData);
      sessionStorage.setItem('lastScannedQR', qrData);
      setLocation('/scan?qrData=' + encodeURIComponent(qrData));
    } catch (error) {
      console.error('Error handling QR scan:', error);
    }
  };

  const handleClose = () => {
    setLocation('/'); // Navigate to home or any other appropriate route
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    // Basic validation: only allow images
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a valid image file.');
      return;
    }
    setUploadedFile(file);
    // Read the image and try to decode QR (use jsQR or backend API as needed)
    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new window.Image();
      img.onload = async () => {
        // Draw image to canvas and use jsQR
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return setUploadError('Canvas error.');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        // Dynamically import jsQR
        const jsQR = (await import('jsqr')).default;
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleScan(code.data);
        } else {
          setUploadError('No QR code detected in the image.');
        }
      };
      img.onerror = () => setUploadError('Failed to load image.');
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      {/* Choice Modal */}
      {showChoiceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-xs w-full flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4">How do you want to provide the QR code?</h2>
            <Button className="w-full mb-3" onClick={() => { setMode('scan'); setShowChoiceModal(false); }}>Scan QR Code using Camera</Button>
            <Button className="w-full" variant="outline" onClick={() => { setMode('upload'); setShowChoiceModal(false); }}>Upload QR Code Image</Button>
          </div>
        </div>
      )}
      {/* Scanner or Upload UI */}
      {!showChoiceModal && mode === 'scan' && (
        <div className="h-full w-full flex flex-col">
          <EnhancedQRScanner onScan={handleScan} onClose={handleClose} />
        </div>
      )}
      {!showChoiceModal && mode === 'upload' && (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center border border-gray-200 transition-all duration-300">
            {/* Modern QR Icon with gradient */}
            <div className="mb-4">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="qrGradient" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366F1"/>
                    <stop offset="1" stopColor="#60A5FA"/>
                  </linearGradient>
                </defs>
                <rect x="6" y="6" width="14" height="14" rx="4" stroke="url(#qrGradient)" strokeWidth="3"/>
                <rect x="36" y="6" width="14" height="14" rx="4" stroke="url(#qrGradient)" strokeWidth="3"/>
                <rect x="36" y="36" width="14" height="14" rx="4" stroke="url(#qrGradient)" strokeWidth="3"/>
                <rect x="6" y="36" width="14" height="14" rx="4" stroke="url(#qrGradient)" strokeWidth="3"/>
                <rect x="20" y="20" width="16" height="16" rx="2.5" stroke="url(#qrGradient)" strokeWidth="3"/>
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1 tracking-tight">Upload QR Code Image</h2>
            <p className="text-gray-500 text-sm mb-4 text-center">Select or drag a clear image of a QR code to scan for UPI details.</p>
            {/* Drag-and-drop area */}
            <label htmlFor="qr-upload" className="w-full flex flex-col items-center justify-center cursor-pointer bg-white/60 hover:bg-white/80 transition rounded-2xl border-2 border-dashed border-primary/40 py-8 mb-4 outline-none focus:ring-2 focus:ring-primary/40 group relative">
              <span className="text-primary font-semibold mb-2 text-lg transition-colors duration-200 group-hover:text-blue-600">{uploadedFile ? 'Change File' : 'Choose or Drag File Here'}</span>
              <input
                id="qr-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {/* Checkmark animation on file select */}
              {uploadedFile && (
                <div className="flex flex-col items-center w-full">
                  <img
                    src={URL.createObjectURL(uploadedFile)}
                    alt="Preview"
                    className="mt-2 rounded-xl shadow max-h-40 object-contain border border-gray-200 transition-all duration-300"
                  />
                  <div className="mt-2 flex items-center gap-2 animate-fade-in">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#4ade80"/><path d="M8 12.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-green-600 font-medium">Image selected!</span>
                  </div>
                </div>
              )}
            </label>
            {/* Helpful tip */}
            <div className="text-xs text-gray-400 mb-2 text-center">Tip: Make sure the QR code is not blurry or cropped for best results.</div>
            {uploadError && <div className="w-full bg-red-100 text-red-700 px-3 py-2 rounded mb-3 text-center text-sm border border-red-200 transition-all duration-300">{uploadError}</div>}
            {/* Improved back button */}
            <button type="button" className="w-28 flex items-center justify-center gap-2 mt-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow transition-all duration-200" onClick={() => { setShowChoiceModal(true); setMode(null); setUploadedFile(null); setUploadError(null); }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}