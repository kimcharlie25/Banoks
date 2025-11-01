import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, GripVertical } from 'lucide-react';
import { useCategories, Category } from '../hooks/useCategories';

interface CategoryManagerProps {
  onBack: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onBack }) => {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useCategories();
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    icon: '☕',
    sort_order: 0,
    active: true
  });

  const handleAddCategory = () => {
    const nextSortOrder = Math.max(...categories.map(c => c.sort_order), 0) + 1;
    setFormData({
      id: '',
      name: '',
      icon: '☕',
      sort_order: nextSortOrder,
      active: true
    });
    setCurrentView('add');
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      id: category.id,
      name: category.name,
      icon: category.icon,
      sort_order: category.sort_order,
      active: category.active
    });
    setCurrentView('edit');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete category');
      }
    }
  };

  const handleSaveCategory = async () => {
    if (!formData.id || !formData.name || !formData.icon) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate ID format (kebab-case)
    const idRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!idRegex.test(formData.id)) {
      alert('Category ID must be in kebab-case format (e.g., "hot-drinks", "cold-beverages")');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await addCategory(formData);
      }
      setCurrentView('list');
      setEditingCategory(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingCategory(null);
  };

  const generateIdFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      id: currentView === 'add' ? generateIdFromName(name) : formData.id
    });
  };

  // Form View (Add/Edit)
  if (currentView === 'add' || currentView === 'edit') {
    return (
      <div className="min-h-screen bg-neutral-black">
        <div className="bg-neutral-black-light shadow-red-glow border-b-2 border-neutral-black-lighter">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-neutral-white hover:text-primary-red transition-colors duration-200 font-semibold"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
                <h1 className="text-2xl font-bold text-neutral-white">
                  {currentView === 'add' ? 'Add New Category' : 'Edit Category'}
                </h1>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border-2 border-neutral-black-lighter bg-neutral-black-lighter text-neutral-white rounded-lg hover:border-primary-red transition-all duration-200 flex items-center space-x-2 font-semibold"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-gradient-to-r from-primary-red to-primary-red-dark text-white rounded-lg hover:from-primary-red-dark hover:to-primary-red transition-all duration-200 flex items-center space-x-2 font-semibold shadow-red-glow"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-neutral-black-light border-2 border-neutral-black-lighter rounded-xl shadow-red-glow p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-white mb-2">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-white mb-2">Category ID *</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium disabled:bg-neutral-black-lighter disabled:text-neutral-gray disabled:cursor-not-allowed"
                  placeholder="kebab-case-id"
                  disabled={currentView === 'edit'}
                />
                <p className="text-xs text-neutral-gray mt-1">
                  {currentView === 'edit' 
                    ? 'Category ID cannot be changed after creation'
                    : 'Use kebab-case format (e.g., "hot-drinks", "cold-beverages")'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-white mb-2">Icon *</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="flex-1 px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                    placeholder="Enter emoji or icon"
                  />
                  <div className="w-12 h-12 bg-neutral-black-lighter border-2 border-neutral-black-lighter rounded-lg flex items-center justify-center text-2xl">
                    {formData.icon}
                  </div>
                </div>
                <p className="text-xs text-neutral-gray mt-1">
                  Use an emoji or icon character (e.g., ☕, 🧊, 🫖, 🥐)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-white mb-2">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                  placeholder="0"
                />
                <p className="text-xs text-neutral-gray mt-1">
                  Lower numbers appear first in the menu
                </p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-neutral-black-lighter text-primary-red focus:ring-primary-red"
                  />
                  <span className="text-sm font-bold text-neutral-white">Active Category</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-neutral-black">
      <div className="bg-neutral-black-light shadow-red-glow border-b-2 border-neutral-black-lighter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-neutral-white hover:text-primary-red transition-colors duration-200 font-semibold"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold text-neutral-white">Manage Categories</h1>
            </div>
            <button
              onClick={handleAddCategory}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary-red to-primary-red-dark text-white px-4 py-2 rounded-lg hover:from-primary-red-dark hover:to-primary-red transition-all duration-200 font-semibold shadow-red-glow"
            >
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-neutral-black-light border-2 border-neutral-black-lighter rounded-xl shadow-red-glow overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-white mb-4">Categories</h2>
            
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-gray-light mb-4">No categories found</p>
                <button
                  onClick={handleAddCategory}
                  className="bg-gradient-to-r from-primary-red to-primary-red-dark text-white px-4 py-2 rounded-lg hover:from-primary-red-dark hover:to-primary-red transition-all duration-200 font-semibold shadow-red-glow"
                >
                  Add First Category
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border-2 border-neutral-black-lighter bg-neutral-black-lighter rounded-lg hover:border-primary-red transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-neutral-gray cursor-move">
                        <GripVertical className="h-4 w-4" />
                        <span className="text-sm font-semibold">#{category.sort_order}</span>
                      </div>
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <h3 className="font-bold text-neutral-white">{category.name}</h3>
                        <p className="text-sm text-neutral-gray">ID: {category.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        category.active 
                          ? 'bg-primary-red text-white' 
                          : 'bg-neutral-black-lighter text-neutral-gray border-2 border-neutral-black-lighter'
                      }`}>
                        {category.active ? 'Active' : 'Inactive'}
                      </span>
                      
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-neutral-white hover:text-primary-red hover:bg-neutral-black-lighter rounded-lg transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-primary-red hover:text-white hover:bg-primary-red rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
