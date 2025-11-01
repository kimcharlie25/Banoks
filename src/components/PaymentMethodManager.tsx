import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, CreditCard, Upload } from 'lucide-react';
import { usePaymentMethods, PaymentMethod } from '../hooks/usePaymentMethods';
import ImageUpload from './ImageUpload';

interface PaymentMethodManagerProps {
  onBack: () => void;
}

const PaymentMethodManager: React.FC<PaymentMethodManagerProps> = ({ onBack }) => {
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, refetchAll } = usePaymentMethods();
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    account_number: '',
    account_name: '',
    qr_code_url: '',
    active: true,
    sort_order: 0
  });

  React.useEffect(() => {
    refetchAll();
  }, []);

  const handleAddMethod = () => {
    const nextSortOrder = Math.max(...paymentMethods.map(m => m.sort_order), 0) + 1;
    setFormData({
      id: '',
      name: '',
      account_number: '',
      account_name: '',
      qr_code_url: '',
      active: true,
      sort_order: nextSortOrder
    });
    setCurrentView('add');
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      id: method.id,
      name: method.name,
      account_number: method.account_number,
      account_name: method.account_name,
      qr_code_url: method.qr_code_url,
      active: method.active,
      sort_order: method.sort_order
    });
    setCurrentView('edit');
  };

  const handleDeleteMethod = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      try {
        await deletePaymentMethod(id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete payment method');
      }
    }
  };

  const handleSaveMethod = async () => {
    if (!formData.id || !formData.name || !formData.account_number || !formData.account_name || !formData.qr_code_url) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate ID format (kebab-case)
    const idRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!idRegex.test(formData.id)) {
      alert('Payment method ID must be in kebab-case format (e.g., "gcash", "bank-transfer")');
      return;
    }

    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, formData);
      } else {
        await addPaymentMethod(formData);
      }
      setCurrentView('list');
      setEditingMethod(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save payment method');
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingMethod(null);
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
                  {currentView === 'add' ? 'Add Payment Method' : 'Edit Payment Method'}
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
                  onClick={handleSaveMethod}
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
                <label className="block text-sm font-bold text-neutral-white mb-2">Payment Method Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                  placeholder="e.g., GCash, Maya, Bank Transfer"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-white mb-2">Method ID *</label>
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
                    ? 'Method ID cannot be changed after creation'
                    : 'Use kebab-case format (e.g., "gcash", "bank-transfer")'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-white mb-2">Account Number/Phone *</label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                  placeholder="09XX XXX XXXX or Account: 1234-5678-9012"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-white mb-2">Account Name *</label>
                <input
                  type="text"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                  placeholder="Banok's Restaurant"
                />
              </div>

              <div>
                <ImageUpload
                  currentImage={formData.qr_code_url}
                  onImageChange={(imageUrl) => setFormData({ ...formData, qr_code_url: imageUrl || '' })}
                />
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
                  Lower numbers appear first in the checkout
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
                  <span className="text-sm font-bold text-neutral-white">Active Payment Method</span>
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
              <h1 className="text-2xl font-bold text-neutral-white">Payment Methods</h1>
            </div>
            <button
              onClick={handleAddMethod}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary-red to-primary-red-dark text-white px-4 py-2 rounded-lg hover:from-primary-red-dark hover:to-primary-red transition-all duration-200 font-semibold shadow-red-glow"
            >
              <Plus className="h-4 w-4" />
              <span>Add Payment Method</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-neutral-black-light border-2 border-neutral-black-lighter rounded-xl shadow-red-glow overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-bold text-neutral-white mb-4">Payment Methods</h2>
            
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-neutral-gray mx-auto mb-4" />
                <p className="text-neutral-gray-light mb-4">No payment methods found</p>
                <button
                  onClick={handleAddMethod}
                  className="bg-gradient-to-r from-primary-red to-primary-red-dark text-white px-4 py-2 rounded-lg hover:from-primary-red-dark hover:to-primary-red transition-all duration-200 font-semibold shadow-red-glow"
                >
                  Add First Payment Method
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border-2 border-neutral-black-lighter bg-neutral-black-lighter rounded-lg hover:border-primary-red transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={method.qr_code_url}
                          alt={`${method.name} QR Code`}
                          className="w-16 h-16 rounded-lg border-2 border-neutral-black-lighter object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-white">{method.name}</h3>
                        <p className="text-sm text-neutral-gray-light font-mono">{method.account_number}</p>
                        <p className="text-sm text-neutral-gray-light">Account: {method.account_name}</p>
                        <p className="text-xs text-neutral-gray">ID: {method.id} • Order: #{method.sort_order}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        method.active 
                          ? 'bg-primary-red text-white' 
                          : 'bg-neutral-black-lighter text-neutral-gray border-2 border-neutral-black-lighter'
                      }`}>
                        {method.active ? 'Active' : 'Inactive'}
                      </span>
                      
                      <button
                        onClick={() => handleEditMethod(method)}
                        className="p-2 text-neutral-white hover:text-primary-red hover:bg-neutral-black-lighter rounded-lg transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteMethod(method.id)}
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

export default PaymentMethodManager;