import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { paymentsApi } from '../../api/payments';
import { bookingsApi } from '../../api/bookings';
import { routesApi } from '../../api/routes';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { CreditCardIcon, CheckCircleIcon, ArrowRightIcon, BusIcon } from '../../components/Icons';

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookings = await bookingsApi.getMyBookings();
        const found = bookings.find((b) => b.id === parseInt(bookingId, 10));
        if (found) {
          setBooking(found);
          if (found.status === 'confirmed') {
            toast.success('This booking is already confirmed!');
            navigate('/student/bookings');
            return;
          }
          if (found.route_id) {
            try {
              const routeData = await routesApi.getRouteById(found.route_id);
              setRoute(routeData);
            } catch (routeErr) {
              console.error('Could not fetch route details:', routeErr);
            }
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    try {
      // Step 1: Create Order on backend
      const orderData = await paymentsApi.createOrder(parseInt(bookingId, 10));

      // Step 2: Open Razorpay Checkout modal
      if (typeof window.Razorpay === 'undefined') {
        toast.error('Razorpay SDK failed to load. Please check your connection.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount * 100,
        currency: orderData.currency || 'INR',
        name: 'Smart Campus Bus',
        description: `Booking #${booking?.booking_reference || bookingId}`,
        order_id: orderData.razorpay_order_id,
        handler: async (response) => {
          try {
            // Step 3: Verify payment signature
            await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment verified! Your seat is confirmed.');
            navigate('/student/bookings');
          } catch (verifyErr) {
            console.error(verifyErr);
            toast.error(
              verifyErr.response?.data?.detail || 'Payment verification failed'
            );
          }
        },
        prefill: {
          name: user?.full_name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast('Payment cancelled', { icon: 'ℹ️' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        console.error(resp.error);
        toast.error(resp.error.description || 'Payment transaction failed');
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      const detail =
        err.response?.data?.detail || 'Failed to initiate payment gateway';
      toast.error(detail);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Loading payment invoice...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          to="/student/bookings"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
        >
          <span>← Back to Bookings</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
          Checkout & Payment
        </h1>
        <p className="text-sm text-slate-400">
          Complete payment using Razorpay to receive your digital QR boarding ticket.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Invoice Summary */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-slate-500 uppercase font-mono block">Booking Reference</span>
              <span className="text-base font-bold text-white font-mono">
                #{booking?.booking_reference || bookingId}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase font-mono">
              {booking?.status || 'Pending Payment'}
            </span>
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Passenger:</span>
              <span className="font-medium text-white">{user?.full_name}</span>
            </div>
            {route && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route:</span>
                  <span className="font-medium text-white">{route.route_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transit:</span>
                  <span className="font-medium text-slate-200 font-mono text-xs">
                    {route.origin} → {route.destination}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Travel Date:</span>
              <span className="font-medium text-white">
                {booking?.travel_date
                  ? new Date(booking.travel_date).toLocaleDateString()
                  : 'Upcoming'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Gateway:</span>
              <span className="font-medium text-indigo-400">Razorpay (Test / UPI / Cards)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-base font-bold text-slate-200">Total Payable Amount</span>
            <span className="text-3xl font-extrabold text-white">
              ₹{route?.fare ?? booking?.route?.fare ?? 50}
            </span>
          </div>
        </div>

        {/* Payment Action */}
        <div className="space-y-4 pt-2">
          <button
            onClick={handleRazorpayPayment}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CreditCardIcon className="w-5 h-5" />
                <span>Pay via Razorpay</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            🔒 Test Transactions: Supports test card & mock UPI credentials in test mode.
          </p>
        </div>
      </div>
    </div>
  );
}
