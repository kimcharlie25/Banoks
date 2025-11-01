import React, { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { CartItem, PaymentMethod, ServiceType } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
  const { paymentMethods } = usePaymentMethods();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('dine-in');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pickupTime, setPickupTime] = useState('5-10');
  const [customTime, setCustomTime] = useState('');
  // Dine-in specific state
  const [partySize, setPartySize] = useState(1);
  const [dineInTime, setDineInTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set default payment method when payment methods are loaded
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].id as PaymentMethod);
    }
  }, [paymentMethods, paymentMethod]);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = () => {
    const timeInfo = serviceType === 'pickup' 
      ? (pickupTime === 'custom' ? customTime : `${pickupTime} minutes`)
      : '';
    
    const dineInInfo = serviceType === 'dine-in' 
      ? `👥 Party Size: ${partySize} person${partySize !== 1 ? 's' : ''}\n🕐 Preferred Time: ${new Date(dineInTime).toLocaleString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`
      : '';
    
    const orderDetails = `
🛒 Bonok's ORDER

👤 Customer: ${customerName}
📞 Contact: ${contactNumber}
📍 Service: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
${serviceType === 'delivery' ? `🏠 Address: ${address}${landmark ? `\n🗺️ Landmark: ${landmark}` : ''}` : ''}
${serviceType === 'pickup' ? `⏰ Pickup Time: ${timeInfo}` : ''}
${serviceType === 'dine-in' ? dineInInfo : ''}


📋 ORDER DETAILS:
${cartItems.map(item => {
  let itemDetails = `• ${item.name}`;
  if (item.selectedVariation) {
    itemDetails += ` (${item.selectedVariation.name})`;
  }
  if (item.selectedAddOns && item.selectedAddOns.length > 0) {
    itemDetails += ` + ${item.selectedAddOns.map(addOn => 
      addOn.quantity && addOn.quantity > 1 
        ? `${addOn.name} x${addOn.quantity}`
        : addOn.name
    ).join(', ')}`;
  }
  itemDetails += ` x${item.quantity} - ₱${item.totalPrice * item.quantity}`;
  return itemDetails;
}).join('\n')}

💰 TOTAL: ₱${totalPrice}
${serviceType === 'delivery' ? `🛵 DELIVERY FEE:` : ''}

💳 Payment: ${selectedPaymentMethod?.name || paymentMethod}
📸 Payment Screenshot: Please attach your payment receipt screenshot

${notes ? `📝 Notes: ${notes}` : ''}

Please confirm this order to proceed. Thank you for choosing Bonok's! 
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const messengerUrl = `https://m.me/banoks.ph?text=${encodedMessage}`;
    
    window.open(messengerUrl, '_blank');
    
  };

  const isDetailsValid = customerName && contactNumber && 
    (serviceType !== 'delivery' || address) && 
    (serviceType !== 'pickup' || (pickupTime !== 'custom' || customTime)) &&
    (serviceType !== 'dine-in' || (partySize > 0 && dineInTime));

  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
          onClick={onBack}
          className="flex items-center space-x-2 text-neutral-white hover:text-primary-red transition-colors duration-200 font-semibold"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-4xl font-bold text-neutral-white ml-8">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-neutral-black-light border-2 border-neutral-black-lighter rounded-xl shadow-red-glow p-6">
            <h2 className="text-2xl font-bold text-neutral-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b-2 border-neutral-black-lighter">
                  <div>
                    <h4 className="font-bold text-neutral-white">{item.name}</h4>
                    {item.selectedVariation && (
                      <p className="text-sm text-neutral-gray-light">Size: {item.selectedVariation.name}</p>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-sm text-neutral-gray-light">
                        Add-ons: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-neutral-gray">₱{item.totalPrice} x {item.quantity}</p>
                  </div>
                  <span className="font-bold text-primary-red">₱{(item.totalPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t-2 border-neutral-black-lighter pt-4">
              <div className="flex items-center justify-between text-3xl font-bold">
                <span className="text-neutral-white">Total:</span>
                <span className="text-primary-red">₱{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-neutral-black-light border-2 border-neutral-black-lighter rounded-xl shadow-red-glow p-6">
            <h2 className="text-2xl font-bold text-neutral-white mb-6">Customer Information</h2>
            
            <form className="space-y-6">
              {/* Customer Information */}
              <div>
                <label className="block text-sm font-bold text-neutral-white mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-white mb-2">Contact Number *</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-bold text-neutral-white mb-3">Service Type *</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'dine-in', label: 'Dine In', icon: '🪑' },
                    { value: 'pickup', label: 'Pickup', icon: '🚶' },
                    { value: 'delivery', label: 'Delivery', icon: '🛵' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setServiceType(option.value as ServiceType)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 font-semibold ${
                        serviceType === option.value
                          ? 'border-primary-red bg-gradient-to-r from-primary-red to-primary-red-dark text-white shadow-red-glow'
                          : 'border-neutral-black-lighter bg-neutral-black-lighter text-neutral-white hover:border-primary-red'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dine-in Details */}
              {serviceType === 'dine-in' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-neutral-white mb-2">Party Size *</label>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => setPartySize(Math.max(1, partySize - 1))}
                        className="w-10 h-10 rounded-lg border-2 border-primary-red flex items-center justify-center text-primary-red hover:bg-primary-red hover:text-white transition-all duration-200 font-bold"
                      >
                        -
                      </button>
                      <span className="text-2xl font-semibold text-neutral-white min-w-[3rem] text-center">{partySize}</span>
                      <button
                        type="button"
                        onClick={() => setPartySize(Math.min(20, partySize + 1))}
                        className="w-10 h-10 rounded-lg border-2 border-primary-red flex items-center justify-center text-primary-red hover:bg-primary-red hover:text-white transition-all duration-200 font-bold"
                      >
                        +
                      </button>
                      <span className="text-sm text-neutral-gray-light ml-2">person{partySize !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-white mb-2">Preferred Time *</label>
                    <input
                      type="datetime-local"
                      value={dineInTime}
                      onChange={(e) => setDineInTime(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 font-medium"
                      required
                    />
                    <p className="text-xs text-neutral-gray mt-1">Please select your preferred dining time</p>
                  </div>
                </>
              )}

              {/* Pickup Time Selection */}
              {serviceType === 'pickup' && (
                <div>
                  <label className="block text-sm font-bold text-neutral-white mb-3">Pickup Time *</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: '5-10', label: '5-10 minutes' },
                        { value: '15-20', label: '15-20 minutes' },
                        { value: '25-30', label: '25-30 minutes' },
                        { value: 'custom', label: 'Custom Time' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPickupTime(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-semibold ${
                            pickupTime === option.value
                              ? 'border-primary-red bg-gradient-to-r from-primary-red to-primary-red-dark text-white shadow-red-glow'
                              : 'border-neutral-black-lighter bg-neutral-black-lighter text-neutral-white hover:border-primary-red'
                          }`}
                        >
                          <Clock className="h-4 w-4 mx-auto mb-1" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                    
                    {pickupTime === 'custom' && (
                      <input
                        type="text"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                        placeholder="e.g., 45 minutes, 1 hour, 2:30 PM"
                        required
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {serviceType === 'delivery' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-neutral-white mb-2">Delivery Address *</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                      placeholder="Enter your complete delivery address"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-neutral-white mb-2">Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                      placeholder="e.g., Near McDonald's, Beside 7-Eleven, In front of school"
                    />
                  </div>
                </>
              )}

              {/* Special Notes */}
              <div>
                <label className="block text-sm font-bold text-neutral-white mb-2">Special Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 transform ${
                  isDetailsValid
                    ? 'bg-gradient-to-r from-primary-red to-primary-red-dark text-white hover:from-primary-red-dark hover:to-primary-red hover:scale-[1.02] shadow-red-glow hover:shadow-red-glow-lg'
                    : 'bg-neutral-black-lighter text-neutral-gray cursor-not-allowed border-2 border-neutral-black-lighter'
                }`}
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
            onClick={() => setStep('details')}
          className="flex items-center space-x-2 text-neutral-white hover:text-primary-red transition-colors duration-200 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Details</span>
        </button>
          <h1 className="text-4xl font-bold text-neutral-white ml-8">Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Method Selection */}
        <div className="bg-neutral-black-light border-2 border-neutral-black-lighter rounded-xl shadow-red-glow p-6">
          <h2 className="text-2xl font-bold text-neutral-white mb-6">Choose Payment Method</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 font-semibold ${
                  paymentMethod === method.id
                    ? 'border-primary-red bg-gradient-to-r from-primary-red to-primary-red-dark text-white shadow-red-glow'
                    : 'border-neutral-black-lighter bg-neutral-black-lighter text-neutral-white hover:border-primary-red'
                }`}
              >
                <span className="text-2xl">💳</span>
                <span className="font-medium">{method.name}</span>
              </button>
            ))}
          </div>

          {/* Payment Details with QR Code */}
          {selectedPaymentMethod && (
            <div className="bg-neutral-black-lighter rounded-lg p-6 mb-6 border-2 border-neutral-black-lighter">
              <h3 className="font-bold text-neutral-white mb-4">Payment Details</h3>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-neutral-gray-light mb-1">{selectedPaymentMethod.name}</p>
                  <p className="font-mono text-primary-red font-bold text-lg">{selectedPaymentMethod.account_number}</p>
                  <p className="text-sm text-neutral-gray-light mb-3">Account Name: {selectedPaymentMethod.account_name}</p>
                  <p className="text-2xl font-bold text-neutral-white">Amount: <span className="text-primary-red">₱{totalPrice.toFixed(2)}</span></p>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src={selectedPaymentMethod.qr_code_url} 
                    alt={`${selectedPaymentMethod.name} QR Code`}
                    className="w-32 h-32 rounded-lg border-2 border-red-300 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                    }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">Scan to pay</p>
                </div>
              </div>
            </div>
          )}

          {/* Reference Number */}
          <div className="bg-primary-red/10 border-2 border-primary-red rounded-lg p-4">
            <h4 className="font-bold text-primary-red mb-2">📸 Payment Proof Required</h4>
            <p className="text-sm text-neutral-white">
              After making your payment, please take a screenshot of your payment receipt and attach it when you send your order via Messenger. This helps us verify and process your order quickly.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-neutral-black-light border-2 border-neutral-black-lighter rounded-xl shadow-red-glow p-6">
          <h2 className="text-2xl font-bold text-neutral-white mb-6">Final Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="bg-neutral-black-lighter rounded-lg p-4 border-2 border-neutral-black-lighter">
              <h4 className="font-bold text-neutral-white mb-3">Customer Details</h4>
              <p className="text-sm text-neutral-gray-light"><span className="text-primary-red font-semibold">Name:</span> {customerName}</p>
              <p className="text-sm text-neutral-gray-light"><span className="text-primary-red font-semibold">Contact:</span> {contactNumber}</p>
              <p className="text-sm text-neutral-gray-light"><span className="text-primary-red font-semibold">Service:</span> {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}</p>
              {serviceType === 'delivery' && (
                <>
                  <p className="text-sm text-neutral-gray-light"><span className="text-primary-red font-semibold">Address:</span> {address}</p>
                  {landmark && <p className="text-sm text-neutral-gray-light"><span className="text-primary-red font-semibold">Landmark:</span> {landmark}</p>}
                </>
              )}
              {serviceType === 'pickup' && (
                <p className="text-sm text-neutral-gray-light">
                  <span className="text-primary-red font-semibold">Pickup Time:</span> {pickupTime === 'custom' ? customTime : `${pickupTime} minutes`}
                </p>
              )}
              {serviceType === 'dine-in' && (
                <>
                  <p className="text-sm text-neutral-gray-light">
                    <span className="text-primary-red font-semibold">Party Size:</span> {partySize} person{partySize !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-neutral-gray-light">
                    <span className="text-primary-red font-semibold">Preferred Time:</span> {dineInTime ? new Date(dineInTime).toLocaleString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'Not selected'}
                  </p>
                </>
              )}
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b-2 border-neutral-black-lighter">
                <div>
                  <h4 className="font-bold text-neutral-white">{item.name}</h4>
                  {item.selectedVariation && (
                    <p className="text-sm text-neutral-gray-light">Size: {item.selectedVariation.name}</p>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-sm text-neutral-gray-light">
                      Add-ons: {item.selectedAddOns.map(addOn => 
                        addOn.quantity && addOn.quantity > 1 
                          ? `${addOn.name} x${addOn.quantity}`
                          : addOn.name
                      ).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-neutral-gray">₱{item.totalPrice.toFixed(2)} x {item.quantity}</p>
                </div>
                <span className="font-bold text-primary-red">₱{(item.totalPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t-2 border-neutral-black-lighter pt-4 mb-6">
            <div className="flex items-center justify-between text-3xl font-bold">
              <span className="text-neutral-white">Total:</span>
              <span className="text-primary-red">₱{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-5 rounded-lg font-bold text-lg transition-all duration-200 transform bg-gradient-to-r from-primary-red to-primary-red-dark text-white hover:from-primary-red-dark hover:to-primary-red hover:scale-[1.02] shadow-red-glow hover:shadow-red-glow-lg"
          >
            Place Order via Messenger
          </button>
          
          <p className="text-xs text-neutral-gray text-center mt-3">
            You'll be redirected to Facebook Messenger to confirm your order. Don't forget to attach your payment screenshot!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;