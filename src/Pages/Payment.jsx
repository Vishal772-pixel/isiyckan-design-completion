import React, { useState } from 'react';
import PaymentForm from '../components/Payment/PaymentForm';
import OrderSummary from '../components/Payment/OrderSummary';
import AddressSelection from '../components/Payment/AddressSelection';
import ShippingMethods from '../components/Payment/ShippingMethods';
import PromoCode from'../components/Payment/PromoCode';
import GiftCard from '../components/Payment/GiftCard';
import LoyaltyPoints from '../components/Payment/LoyaltyPoints';
import SecurityBadge from '../components/Payment/SecurityBadge';

function Payment() {
  const [orderTotal, setOrderTotal] = useState(99.99);
  const [shippingCost, setShippingCost] = useState(5.99);
  const [discount, setDiscount] = useState(0);

  const handleShippingChange = (cost) => {
    setShippingCost(cost);
  };

  const handlePromoCode = (discountAmount) => {
    setDiscount(discountAmount);
  };

  const handleGiftCard = (giftCardAmount) => {
    setOrderTotal(prevTotal => Math.max(0, prevTotal - giftCardAmount));
  };

  const handleLoyaltyPoints = (pointsAmount) => {
    setOrderTotal(prevTotal => Math.max(0, prevTotal - pointsAmount));
  };

  const handlePaymentSubmit = (paymentData) => {
    console.log('Payment submitted:', paymentData);
    alert('Payment successful! Thank you for your order.');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3 space-y-6">
              <AddressSelection />
              <ShippingMethods onShippingChange={handleShippingChange} />
              <PaymentForm onSubmit={handlePaymentSubmit} />
            </div>
            <div className="md:w-1/3 space-y-6">
              <OrderSummary 
                subtotal={orderTotal} 
                shipping={shippingCost}
                discount={discount}
                total={orderTotal + shippingCost - discount}
              />
              <PromoCode onApply={handlePromoCode} />
              <GiftCard onApply={handleGiftCard} />
              <LoyaltyPoints onApply={handleLoyaltyPoints} />
              <SecurityBadge />
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-white shadow mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2025 Your E-commerce Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Payment;

