import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick }) => {
  const { siteSettings, loading } = useSiteSettings();

  return (
    <header className="sticky top-0 z-50 bg-neutral-black border-b border-neutral-black-lighter shadow-red-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={onMenuClick}
            className="flex items-center space-x-3 text-neutral-white hover:text-primary-red transition-colors duration-200 group"
          >
            {loading ? (
              <div className="w-10 h-10 bg-neutral-black-lighter rounded-lg animate-pulse" />
            ) : (
              <img 
                src={siteSettings?.site_logo || "/logo.jpg"} 
                alt={siteSettings?.site_name || "Your Restaurant"}
                className="w-10 h-10 rounded-lg object-cover ring-2 ring-primary-red group-hover:ring-primary-red-light transition-all duration-200"
                onError={(e) => {
                  e.currentTarget.src = "/logo.jpg";
                }}
              />
            )}
            <h1 className="text-2xl font-bold tracking-tight">
              {loading ? (
                <div className="w-32 h-7 bg-neutral-black-lighter rounded animate-pulse" />
              ) : (
                <span className="text-neutral-white group-hover:text-gradient-red transition-all duration-200">
                  {siteSettings?.site_name || "Your Restaurant"}
                </span>
              )}
            </h1>
          </button>

          <div className="flex items-center space-x-2">
            <button 
              onClick={onCartClick}
              className="relative p-3 text-neutral-white hover:text-primary-red hover:bg-neutral-black-lighter rounded-xl transition-all duration-200 group"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-primary-red to-primary-red-dark text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-red-glow animate-bounce-gentle">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;