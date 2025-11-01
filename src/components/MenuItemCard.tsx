import React, { useState } from 'react';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[]) => void;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, 
  onAddToCart, 
  quantity, 
  onUpdateQuantity 
}) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
    item.variations?.[0]
  );
  const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);

  const calculatePrice = () => {
    // Use effective price (discounted or regular) as base
    let price = item.effectivePrice || item.basePrice;
    if (selectedVariation) {
      price = (item.effectivePrice || item.basePrice) + selectedVariation.price;
    }
    selectedAddOns.forEach(addOn => {
      price += addOn.price * addOn.quantity;
    });
    return price;
  };

  const handleAddToCart = () => {
    if (item.variations?.length || item.addOns?.length) {
      setShowCustomization(true);
    } else {
      onAddToCart(item, 1);
    }
  };

  const handleCustomizedAddToCart = () => {
    // Convert selectedAddOns back to regular AddOn array for cart
    const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn => 
      Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
    );
    onAddToCart(item, 1, selectedVariation, addOnsForCart);
    setShowCustomization(false);
    setSelectedAddOns([]);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  const updateAddOnQuantity = (addOn: AddOn, quantity: number) => {
    setSelectedAddOns(prev => {
      const existingIndex = prev.findIndex(a => a.id === addOn.id);
      
      if (quantity === 0) {
        // Remove add-on if quantity is 0
        return prev.filter(a => a.id !== addOn.id);
      }
      
      if (existingIndex >= 0) {
        // Update existing add-on quantity
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        // Add new add-on with quantity
        return [...prev, { ...addOn, quantity }];
      }
    });
  };

  const groupedAddOns = item.addOns?.reduce((groups, addOn) => {
    const category = addOn.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addOn);
    return groups;
  }, {} as Record<string, AddOn[]>);

  return (
    <>
      <div className={`bg-neutral-black-light rounded-xl shadow-lg hover:shadow-red-glow transition-all duration-300 overflow-hidden group animate-scale-in border-2 ${!item.available ? 'opacity-60 border-neutral-black-lighter' : 'border-neutral-black-lighter hover:border-primary-red'}`}>
        {/* Image Container with Badges */}
        <div className="relative h-52 bg-neutral-black-lighter">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center ${item.image ? 'hidden' : ''}`}>
            <div className="text-6xl opacity-10 text-neutral-gray">🍽️</div>
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {item.isOnDiscount && item.discountPrice && (
              <div className="bg-gradient-to-r from-primary-red to-primary-red-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-red-glow animate-pulse">
                🔥 SALE
              </div>
            )}
            {item.popular && (
              <div className="bg-gradient-to-r from-primary-red-light to-primary-red text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-red-glow">
                ⭐ POPULAR
              </div>
            )}
          </div>
          
          {!item.available && (
            <div className="absolute top-3 right-3 bg-neutral-gray text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
              UNAVAILABLE
            </div>
          )}
          
          {/* Discount Percentage Badge */}
          {item.isOnDiscount && item.discountPrice && (
            <div className="absolute bottom-3 right-3 bg-white text-primary-red text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
              {Math.round(((item.basePrice - item.discountPrice) / item.basePrice) * 100)}% OFF
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-lg font-bold text-neutral-white leading-tight flex-1 pr-2">{item.name}</h4>
            {item.variations && item.variations.length > 0 && (
              <div className="text-xs text-neutral-gray bg-neutral-black-lighter px-2 py-1 rounded-lg whitespace-nowrap">
                {item.variations.length} sizes
              </div>
            )}
          </div>
          
          <p className={`text-sm mb-4 leading-relaxed ${!item.available ? 'text-neutral-gray' : 'text-neutral-gray-light'}`}>
            {!item.available ? 'Currently Unavailable' : item.description}
          </p>
          
          {/* Pricing Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              {item.isOnDiscount && item.discountPrice ? (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary-red">
                      ₱{item.discountPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-neutral-gray line-through">
                      ₱{item.basePrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-primary-red-light font-semibold">
                    Save ₱{(item.basePrice - item.discountPrice).toFixed(2)}
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-neutral-white">
                  ₱{item.basePrice.toFixed(2)}
                </div>
              )}
              
              {item.variations && item.variations.length > 0 && (
                <div className="text-xs text-neutral-gray mt-1">
                  Starting price
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex-shrink-0">
              {!item.available ? (
                <button
                  disabled
                  className="bg-neutral-black-lighter text-neutral-gray px-4 py-2.5 rounded-lg cursor-not-allowed font-semibold text-sm border border-neutral-black-lighter"
                >
                  Unavailable
                </button>
              ) : quantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="bg-gradient-to-r from-primary-red to-primary-red-dark text-white px-6 py-2.5 rounded-lg hover:from-primary-red-dark hover:to-primary-red transition-all duration-200 transform hover:scale-105 font-bold text-sm shadow-red-glow hover:shadow-red-glow-lg"
                >
                  {item.variations?.length || item.addOns?.length ? 'Customize' : 'Add to Cart'}
                </button>
              ) : (
                <div className="flex items-center space-x-2 bg-neutral-black-lighter rounded-lg p-1 border-2 border-primary-red shadow-red-glow">
                  <button
                    onClick={handleDecrement}
                    className="p-2 hover:bg-primary-red rounded-md transition-all duration-200 hover:scale-110 text-neutral-white hover:text-white"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-neutral-white min-w-[28px] text-center text-sm">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="p-2 hover:bg-primary-red rounded-md transition-all duration-200 hover:scale-110 text-neutral-white hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add-ons indicator */}
          {item.addOns && item.addOns.length > 0 && (
            <div className="flex items-center space-x-1 text-xs text-neutral-gray-light bg-neutral-black-lighter px-3 py-2 rounded-lg border border-neutral-black-lighter">
              <span className="text-primary-red font-bold">+</span>
              <span>{item.addOns.length} add-on{item.addOns.length > 1 ? 's' : ''} available</span>
            </div>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-black-light border-2 border-neutral-black-lighter rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-red-glow-lg">
            <div className="sticky top-0 bg-neutral-black-light border-b-2 border-neutral-black-lighter p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-neutral-white">Customize {item.name}</h3>
                <p className="text-sm text-neutral-gray-light mt-1">Choose your preferences</p>
              </div>
              <button
                onClick={() => setShowCustomization(false)}
                className="p-2 hover:bg-neutral-black-lighter hover:text-primary-red rounded-lg transition-all duration-200 text-neutral-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Size Variations */}
              {item.variations && item.variations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-neutral-white mb-4">Choose Size</h4>
                  <div className="space-y-3">
                    {item.variations.map((variation) => (
                      <label
                        key={variation.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedVariation?.id === variation.id
                            ? 'border-primary-red bg-primary-red/10 shadow-red-glow'
                            : 'border-neutral-black-lighter hover:border-primary-red/50 bg-neutral-black-lighter hover:bg-neutral-black-lighter/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="variation"
                            checked={selectedVariation?.id === variation.id}
                            onChange={() => setSelectedVariation(variation)}
                            className="text-primary-red focus:ring-primary-red bg-neutral-black-lighter border-neutral-black-lighter"
                          />
                          <span className="font-semibold text-neutral-white">{variation.name}</span>
                        </div>
                        <span className="text-neutral-white font-bold">
                          ₱{((item.effectivePrice || item.basePrice) + variation.price).toFixed(2)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-neutral-white mb-4">Add-ons</h4>
                  {Object.entries(groupedAddOns).map(([category, addOns]) => (
                    <div key={category} className="mb-4">
                      <h5 className="text-sm font-semibold text-neutral-gray-light mb-3 capitalize">
                        {category.replace('-', ' ')}
                      </h5>
                      <div className="space-y-3">
                        {addOns.map((addOn) => (
                          <div
                            key={addOn.id}
                            className="flex items-center justify-between p-4 border-2 border-neutral-black-lighter rounded-lg hover:border-primary-red/50 bg-neutral-black-lighter transition-all duration-200"
                          >
                            <div className="flex-1">
                              <span className="font-semibold text-neutral-white">{addOn.name}</span>
                              <div className="text-sm text-neutral-gray-light">
                                {addOn.price > 0 ? `₱${addOn.price.toFixed(2)} each` : 'Free'}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {selectedAddOns.find(a => a.id === addOn.id) ? (
                                <div className="flex items-center space-x-2 bg-primary-red/20 rounded-lg p-1 border-2 border-primary-red">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 1) - 1);
                                    }}
                                    className="p-1.5 hover:bg-primary-red rounded-md transition-all duration-200 text-primary-red hover:text-white"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="font-bold text-neutral-white min-w-[24px] text-center text-sm">
                                    {selectedAddOns.find(a => a.id === addOn.id)?.quantity || 0}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 0) + 1);
                                    }}
                                    className="p-1.5 hover:bg-primary-red rounded-md transition-all duration-200 text-primary-red hover:text-white"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateAddOnQuantity(addOn, 1)}
                                  className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-primary-red to-primary-red-dark text-white rounded-lg hover:from-primary-red-dark hover:to-primary-red transition-all duration-200 text-sm font-bold shadow-red-glow"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t-2 border-neutral-black-lighter pt-4 mb-6">
                <div className="flex items-center justify-between text-2xl font-bold">
                  <span className="text-neutral-white">Total:</span>
                  <span className="text-primary-red">₱{calculatePrice().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCustomizedAddToCart}
                className="w-full bg-gradient-to-r from-primary-red to-primary-red-dark text-white py-4 rounded-lg hover:from-primary-red-dark hover:to-primary-red transition-all duration-200 font-bold flex items-center justify-center space-x-2 shadow-red-glow hover:shadow-red-glow-lg transform hover:scale-105"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart - ₱{calculatePrice().toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItemCard;
