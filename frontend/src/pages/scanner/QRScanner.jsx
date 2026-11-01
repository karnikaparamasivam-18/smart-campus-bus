
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from 'html5-qrcode';
import { bookingsApi } from '../../api/bookings';
import toast from 'react-hot-toast';
import {
  QrIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshIcon,
} from '../../components/Icons';

export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);

  const cameraRef = useRef(null);
  const fileScannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const verificationLock = useRef(false);
  const mountedRef = useRef(false);

  const handleVerifyToken = useCallback(async (rawToken) => {
    const token = String(rawToken || '').trim();

    if (!token || verificationLock.current) return;

    verificationLock.current = true;
    setIsVerifying(true);
    setScanResult(null);

    try {
      const result = await bookingsApi.scanQR(token);
      if (!mountedRef.current) return;

      setScanResult(result);

      if (result.valid) {
        toast.success(result.message || 'Ticket valid! Passenger verified.');
      } else {
        toast.error(result.message || 'Invalid ticket pass.');
      }
    } catch (err) {
      if (!mountedRef.current) return;

      console.error('QR verification error:', err);

      const detail =
        err.response?.data?.detail || 'Scan verification failed';

      setScanResult({
        valid: false,
        message: typeof detail === 'string'
          ? detail
          : JSON.stringify(detail),
      });

      toast.error(
        typeof detail === 'string' ? detail : 'Verification failed'
      );
    } finally {
      verificationLock.current = false;
      if (mountedRef.current) setIsVerifying(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      const camera = cameraRef.current;
      cameraRef.current = null;

      if (camera) {
        camera.stop()
          .catch(() => {})
          .finally(() => {
            try {
              camera.clear();
            } catch {
              // Scanner already cleared
            }
          });
      }

      const fileScanner = fileScannerRef.current;
      fileScannerRef.current = null;

      if (fileScanner) {
        try {
          fileScanner.clear();
        } catch {
          // Scanner already cleared
        }
      }
    };
  }, []);

  const stopCamera = async () => {
    const scanner = cameraRef.current;
    if (!scanner) return;

    cameraRef.current = null;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch (err) {
      console.error('Camera stop error:', err);
    } finally {
      if (mountedRef.current) setCameraActive(false);
    }
  };

  const startCamera = async () => {
    if (cameraBusy || cameraActive) return;

    setCameraBusy(true);

    try {
      const scanner = new Html5Qrcode('qr-camera-reader');
      cameraRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (!verificationLock.current) {
            // Prevent repeated scanning of the same ticket
            stopCamera();
            handleVerifyToken(decodedText);
          }
        },
        () => {
          // Ignore frames without a QR code
        }
      );

      if (mountedRef.current) setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Unable to start camera. Check camera permissions.');
      await stopCamera();
    } finally {
      if (mountedRef.current) setCameraBusy(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || imageBusy || verificationLock.current) return;

    setImageBusy(true);

    try {
      // Stop camera before scanning an uploaded file
      await stopCamera();

      const scanner = new Html5Qrcode('qr-file-reader', {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
      });
      fileScannerRef.current = scanner;

      const decodedText = await scanner.scanFile(file, true);

      console.log('QR image decoded successfully');
      toast.success('QR detected. Verifying ticket...');

      await handleVerifyToken(decodedText);
    } catch (err) {
      console.error('QR image decoding failed:', err);
      toast.error(
        'Could not detect a QR code. Upload a clear, complete QR image.'
      );
    } finally {
      const scanner = fileScannerRef.current;
      fileScannerRef.current = null;

      if (scanner) {
        try {
          scanner.clear();
        } catch {
          // Scanner already cleared
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (mountedRef.current) setImageBusy(false);
    }
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    if (!manualToken.trim()) return;

    handleVerifyToken(manualToken.trim());
  };

  const handleReset = () => {
    setScanResult(null);
    setManualToken('');
    verificationLock.current = false;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400">
            <QrIcon className="w-8 h-8" />
          </span>
          Bus Coordinator Scanner
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Scan passenger QR tickets for real-time boarding validation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-4">
              QR Ticket Scanner
            </h2>

            <div
              id="qr-camera-reader"
              className="overflow-hidden rounded-xl bg-slate-950 text-slate-300"
            />

            <div className="mt-4">
              {cameraActive ? (
                <button
                  onClick={stopCamera}
                  className="w-full py-3 rounded-xl bg-rose-600 text-white font-semibold"
                >
                  Stop Camera
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  disabled={cameraBusy || isVerifying}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50"
                >
                  {cameraBusy ? 'Starting Camera...' : 'Start Camera Scanner'}
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5">
            <h3 className="text-sm font-semibold text-white mb-3">
              Upload QR Image
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageBusy || isVerifying}
              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white"
            />

            <div
              id="qr-file-reader"
              className="mt-3 overflow-hidden rounded-xl text-slate-300"
            />

            {imageBusy && (
              <p className="text-xs text-indigo-400 mt-3">
                Processing QR image...
              </p>
            )}

            <p className="text-xs text-slate-500 mt-3">
              Upload a clear PNG, JPG, or screenshot containing the complete QR code.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Manual Token / Reference
            </h3>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste QR token..."
                className="min-w-0 flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />

              <button
                type="submit"
                disabled={isVerifying || !manualToken.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                Validate
              </button>
            </form>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl min-h-[380px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6">
              Validation Result
            </h3>

            {isVerifying ? (
              <div className="py-16 text-center text-indigo-400">
                Verifying passenger ticket...
              </div>
            ) : scanResult ? (
              <div className="space-y-5">
                <div
                  className={`p-5 rounded-2xl border flex items-center gap-3 ${
                    scanResult.valid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {scanResult.valid ? (
                    <CheckCircleIcon className="w-9 h-9 shrink-0" />
                  ) : (
                    <XCircleIcon className="w-9 h-9 shrink-0" />
                  )}

                  <div>
                    <h4 className="font-bold">
                      {scanResult.valid
                        ? 'Valid Boarding Pass'
                        : 'Verification Rejected'}
                    </h4>
                    <p className="text-xs mt-1">{scanResult.message}</p>
                  </div>
                </div>

                {scanResult.valid && (
                  <div className="bg-slate-950 rounded-xl p-5 space-y-3 text-sm">
                    {scanResult.student_name && (
                      <p className="text-white">
                        Passenger: {scanResult.student_name}
                      </p>
                    )}

                    {scanResult.booking_reference && (
                      <p className="text-indigo-400">
                        Booking: #{scanResult.booking_reference}
                      </p>
                    )}

                    {scanResult.route_name && (
                      <p className="text-white">
                        Route: {scanResult.route_name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-4">
                <QrIcon className="w-14 h-14 mx-auto text-slate-600" />
                <p className="font-medium">Waiting for QR Code</p>
                <p className="text-xs text-slate-500">
                  Scan using your camera, upload a QR image, or enter a token.
                </p>
              </div>
            )}
          </div>

          {scanResult && (
            <button
              onClick={handleReset}
              className="w-full mt-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2"
            >
              <RefreshIcon className="w-4 h-4" />
              Scan Next Passenger
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
