import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface SubNavProps {
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ selectedCategory, onCategoryClick }) => {
  const { categories, loading } = useCategories();

  return (
    <div className="sticky top-16 z-40 bg-neutral-black-light border-b border-neutral-black-lighter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 overflow-x-auto py-4 scrollbar-hide">
          {loading ? (
            <div className="flex space-x-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-10 w-24 bg-neutral-black-lighter rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => onCategoryClick('all')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border-2 whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-primary-red to-primary-red-dark text-white border-primary-red shadow-red-glow'
                    : 'bg-neutral-black-lighter text-neutral-white border-neutral-black-lighter hover:border-primary-red hover:text-primary-red'
                }`}
              >
                All Menu
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border-2 flex items-center space-x-2 whitespace-nowrap ${
                    selectedCategory === c.id
                      ? 'bg-gradient-to-r from-primary-red to-primary-red-dark text-white border-primary-red shadow-red-glow'
                      : 'bg-neutral-black-lighter text-neutral-white border-neutral-black-lighter hover:border-primary-red hover:text-primary-red'
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubNav;


