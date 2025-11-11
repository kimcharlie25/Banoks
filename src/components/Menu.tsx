import React from 'react';
import { MenuItem, CartItem } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useSiteSettings } from '../hooks/useSiteSettings';
import MenuItemCard from './MenuItemCard';

// Preload images for better performance
const preloadImages = (items: MenuItem[]) => {
  items.forEach(item => {
    if (item.image) {
      const img = new Image();
      img.src = item.image;
    }
  });
};

interface MenuProps {
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
}

const Menu: React.FC<MenuProps> = ({ menuItems, addToCart, cartItems, updateQuantity }) => {
  const { categories } = useCategories();
  const { siteSettings, loading: settingsLoading } = useSiteSettings();
  const [activeCategory, setActiveCategory] = React.useState('hot-coffee');

  // Preload images when menu items change
  React.useEffect(() => {
    if (menuItems.length > 0) {
      // Preload images for visible category first
      const visibleItems = menuItems.filter(item => item.category === activeCategory);
      preloadImages(visibleItems);
      
      // Then preload other images after a short delay
      setTimeout(() => {
        const otherItems = menuItems.filter(item => item.category !== activeCategory);
        preloadImages(otherItems);
      }, 1000);
    }
  }, [menuItems, activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      const headerHeight = 64; // Header height
      const mobileNavHeight = 60; // Mobile nav height
      const offset = headerHeight + mobileNavHeight + 20; // Extra padding
      const elementPosition = element.offsetTop - offset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  React.useEffect(() => {
    if (categories.length > 0) {
      // Set default to dim-sum if it exists, otherwise first category
      const defaultCategory = categories.find(cat => cat.id === 'dim-sum') || categories[0];
      if (!categories.find(cat => cat.id === activeCategory)) {
        setActiveCategory(defaultCategory.id);
      }
    }
  }, [categories, activeCategory]);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map(cat => document.getElementById(cat.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveCategory(categories[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
      {/* Temporarily Closed Modal */}
      {siteSettings?.is_temporarily_closed && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-black-light border-4 border-primary-red rounded-2xl max-w-md w-full shadow-red-glow-lg animate-scale-in">
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="inline-block p-4 bg-primary-red/20 rounded-full mb-4">
                  <span className="text-6xl">🚫</span>
                </div>
                <h2 className="text-3xl font-bold text-neutral-white mb-3">
                  Temporarily Closed
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-primary-red to-primary-red-dark mx-auto mb-4 rounded-full"></div>
              </div>
              
              <p className="text-neutral-gray-light text-lg mb-6 leading-relaxed">
                We're currently closed for the moment. Please check back later or contact us for more information.
              </p>
              
              <div className="bg-neutral-black-lighter border-2 border-neutral-black-lighter rounded-lg p-4 mb-6">
                <p className="text-sm text-neutral-gray-light">
                  <span className="text-primary-red font-bold">📞 Need assistance?</span><br />
                  Feel free to reach out to us for inquiries or updates.
                </p>
              </div>

              <p className="text-sm text-neutral-gray">
                Thank you for your understanding! 🙏
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        {settingsLoading ? (
          <>
            <div className="h-14 bg-neutral-black-lighter rounded-lg mb-4 mx-auto max-w-md animate-pulse"></div>
            <div className="h-1 w-24 bg-neutral-black-lighter mx-auto mb-6 rounded-full animate-pulse"></div>
            <div className="h-24 bg-neutral-black-lighter rounded-lg mx-auto max-w-2xl animate-pulse"></div>
          </>
        ) : (
          <>
            <h2 className="text-5xl font-bold text-neutral-white mb-4 tracking-tight">
              {siteSettings?.welcome_greeting || 'Maayong adlaw!'}
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary-red to-primary-red-dark mx-auto mb-6 rounded-full"></div>
            <p className="text-neutral-gray-light max-w-2xl mx-auto text-lg">
              {siteSettings?.welcome_description || 'Welcome to our restaurant'}
            </p>
          </>
        )}
      </div>

      {categories.map((category) => {
        const categoryItems = menuItems.filter(item => item.category === category.id);
        
        if (categoryItems.length === 0) return null;
        
        return (
          <section key={category.id} id={category.id} className="mb-16">
            <div className="flex items-center mb-8 pb-4 border-b-2 border-neutral-black-lighter">
              <span className="text-4xl mr-4">{category.icon}</span>
              <h3 className="text-3xl font-bold text-neutral-white">{category.name}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryItems.map((item) => {
                const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
                return (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={addToCart}
                    quantity={cartItem?.quantity || 0}
                    onUpdateQuantity={updateQuantity}
                    isRestaurantClosed={siteSettings?.is_temporarily_closed || false}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
      </main>
    </>
  );
};

export default Menu;