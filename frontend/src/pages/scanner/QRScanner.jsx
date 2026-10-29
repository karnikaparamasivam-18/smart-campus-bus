import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { bookingsApi } from '../../api/bookings';
import toast from 'react-hot-toast';
import { QrIcon, CheckCircleIcon, XCircleIcon, RefreshIcon, UserIcon, BusIcon } from '../../components/Icons';

export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    // Initialize html5-qrcode scanner
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch((err) => console.error('Failed to clear scanner:', err));
    };
  }, []);

  const handleVerifyToken = async (token) => {
    setIsVerifying(true);
    try {
      const result = await bookingsApi.scanQR(token);
      setScanResult(result);
      if (result.valid) {
        toast.success(result.message || 'Ticket valid! Passenger verified.');
      } else {
        toast.error(result.message || 'Invalid ticket pass.');
      }
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Scan verification failed';
      setScanResult({
        valid: false,
        message: detail,
      });
      toast.error(detail);
    } finally {
      setIsVerifying(false);
    }
  };

  const onScanSuccess = (decodedText) => {
    if (!isVerifying && !scanResult) {
      handleVerifyToken(decodedText);
    }
  };

  const onScanFailure = () => {
    // Ignore frame-by-frame non-detections
  };

  const handleReset = () => {
    setScanResult(null);
    setManualToken('');
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleVerifyToken(manualToken.trim());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <span className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400">
            <QrIcon className="w-8 h-8" />
          </span>
          <span>Bus Coordinator Scanner</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Scan passenger digital QR tickets upon boarding for real-time validation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Camera Scanner Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Camera Stream</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">html5-qrcode</span>
          </div>

          {/* Target Element for Html5QrcodeScanner */}
          <div
            id="qr-reader"
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-300"
          />

          {/* Manual Input Fallback */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Manual Token / Reference
            </p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste QR token string..."
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                type="submit"
                disabled={isVerifying || !manualToken.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Validate
              </button>
            </form>
          </div>
        </div>

        {/* Scan Status & Verification Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl min-h-[380px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Validation Result
              </h3>

              {isVerifying ? (
                <div className="py-20 text-center text-slate-400 space-y-3">
                  <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium">Verifying passenger ticket with server...</p>
                </div>
              ) : scanResult ? (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Status Banner */}
                  <div
                    className={`p-6 rounded-2xl border flex items-center space-x-4 ${
                      scanResult.valid
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/20 shrink-0">
                      {scanResult.valid ? (
                        <CheckCircleIcon className="w-8 h-8" />
                      ) : (
                        <XCircleIcon className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">
                        {scanResult.valid ? 'Valid Boarding Pass' : 'Verification Rejected'}
                      </h4>
                      <p className="text-xs opacity-90 mt-0.5">{scanResult.message}</p>
                    </div>
                  </div>

                  {/* Passenger & Route Data */}
                  {scanResult.valid && (
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                      {scanResult.student_name && (
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                          <span className="text-slate-400">Passenger Name:</span>
                          <span className="font-bold text-white text-sm">
                            {scanResult.student_name}
                          </span>
                        </div>
                      )}
                      {scanResult.booking_reference && (
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                          <span className="text-slate-400">Booking Ref:</span>
                          <span className="font-mono font-semibold text-indigo-400">
                            #{scanResult.booking_reference}
                          </span>
                        </div>
                      )}
                      {scanResult.route_name && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Assigned Route:</span>
                          <span className="font-semibold text-white">
                            {scanResult.route_name}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center mx-auto text-slate-600 border border-slate-800">
                    <QrIcon className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">Waiting for QR Code</p>
                  <p className="text-xs max-w-xs mx-auto text-slate-500">
                    Hold the passenger's boarding QR pass in front of your camera to scan.
                  </p>
                </div>
              )}
            </div>

            {scanResult && (
              <button
                onClick={handleReset}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all mt-6"
              >
                <RefreshIcon className="w-4 h-4" />
                <span>Scan Next Passenger</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

