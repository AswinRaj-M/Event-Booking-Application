import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PaymentSuccessView from '../../components/user/PaymentSuccessView';
import PaymentFailureView from '../../components/user/PaymentFailureView';

const PaymentStatusPage = () => {
  const location = useLocation();
  const state = location.state || {};
  const { status, payment, event, reason, orderId, checkoutState } = state;

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-[#080612] text-white font-sans flex flex-col justify-between selection:bg-purple-500/30">
      <div>
        <Navbar />

        <main className="pt-28 pb-20 max-w-7xl mx-auto px-4 md:px-8">
          {isSuccess ? (
            <PaymentSuccessView payment={payment} event={event} />
          ) : (
            <PaymentFailureView 
              reason={reason} 
              orderId={orderId} 
              checkoutState={checkoutState} 
            />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentStatusPage;
