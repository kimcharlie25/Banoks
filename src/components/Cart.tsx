import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  onContinueShopping,
  onCheckout
}) => {
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-3xl font-bold text-neutral-white mb-3">Your cart is empty</h2>
          <p className="text-neutral-gray-light mb-8 text-lg">Add some delicious items to get started!</p>
          <button
            onClick={onContinueShopping}
            className="bg-gradient-to-r from-primary-red to-primary-red-dark text-white px-8 py-4 rounded-lg hover:from-primary-red-dark hover:to-primary-red transition-all duration-200 font-bold shadow-red-glow hover:shadow-red-glow-lg transform hover:scale-105"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onContinueShopping}
          className="flex items-center space-x-2 text-neutral-white hover:text-primary-red transition-all duration-200 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Continue Shopping</span>
        </button>
        <h1 className="text-4xl font-bold text-neutral-white">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-primary-red hover:text-primary-red-light transition-colors duration-200 font-semibold"
        >
          Clear All
        </button>
      </div>

      <div className="bg-neutral-black-light border-2 border-neutral-black-lighter rounded-xl shadow-red-glow overflow-hidden mb-8">
        {cartItems.map((item, index) => (
          <div key={item.id} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b-2 border-neutral-black-lighter' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-neutral-white mb-2">{item.name}</h3>
                {item.selectedVariation && (
                  <p className="text-sm text-neutral-gray-light mb-1">
                    <span className="text-primary-red font-semibold">Size:</span> {item.selectedVariation.name}
                  </p>
                )}
                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <p className="text-sm text-neutral-gray-light mb-2">
                    <span className="text-primary-red font-semibold">Add-ons:</span> {item.selectedAddOns.map(addOn => 
                      addOn.quantity && addOn.quantity > 1 
                        ? `${addOn.name} x${addOn.quantity}`
                        : addOn.name
                    ).join(', ')}
                  </p>
                )}
                <p className="text-lg font-bold text-neutral-white">₱{item.totalPrice.toFixed(2)} <span className="text-sm text-neutral-gray">each</span></p>
              </div>
              
              <div className="flex items-center space-x-4 ml-4">
                <div className="flex items-center space-x-3 bg-neutral-black-lighter border-2 border-primary-red rounded-lg p-1 shadow-red-glow">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-primary-red rounded-md transition-all duration-200 text-neutral-white hover:text-white"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-neutral-white min-w-[32px] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-primary-red rounded-md transition-all duration-200 text-neutral-white hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-right min-w-[100px]">
                  <p className="text-xl font-bold text-primary-red">₱{(item.totalPrice * item.quantity).toFixed(2)}</p>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-primary-red hover:text-white hover:bg-primary-red rounded-lg transition-all duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-neutral-black-light border-2 border-neutral-black-lighter rounded-xl shadow-red-glow p-6">
        <div className="flex items-center justify-between text-3xl font-bold mb-6 pb-4 border-b-2 border-neutral-black-lighter">
          <span className="text-neutral-white">Total:</span>
          <span className="text-primary-red">₱{parseFloat(getTotalPrice() || 0).toFixed(2)}</span>
        </div>
        
        <button
          onClick={onCheckout}
          className="w-full bg-gradient-to-r from-primary-red to-primary-red-dark text-white py-5 rounded-lg hover:from-primary-red-dark hover:to-primary-red transition-all duration-200 transform hover:scale-[1.02] font-bold text-lg shadow-red-glow hover:shadow-red-glow-lg"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
