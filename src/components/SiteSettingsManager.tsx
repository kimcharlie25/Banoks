import React, { useState } from 'react';
import { Save, Upload, X } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useImageUpload } from '../hooks/useImageUpload';

const SiteSettingsManager: React.FC = () => {
  const { siteSettings, loading, updateSiteSettings } = useSiteSettings();
  const { uploadImage, uploading } = useImageUpload();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    currency: '',
    currency_code: '',
    welcome_greeting: '',
    welcome_description: '',
    is_temporarily_closed: false
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  React.useEffect(() => {
    if (siteSettings) {
      setFormData({
        site_name: siteSettings.site_name,
        site_description: siteSettings.site_description,
        currency: siteSettings.currency,
        currency_code: siteSettings.currency_code,
        welcome_greeting: siteSettings.welcome_greeting,
        welcome_description: siteSettings.welcome_description,
        is_temporarily_closed: siteSettings.is_temporarily_closed
      });
      setLogoPreview(siteSettings.site_logo);
    }
  }, [siteSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      let logoUrl = logoPreview;
      
      // Upload new logo if selected
      if (logoFile) {
        const uploadedUrl = await uploadImage(logoFile, 'site-logo');
        logoUrl = uploadedUrl;
      }

      // Update all settings
      await updateSiteSettings({
        site_name: formData.site_name,
        site_description: formData.site_description,
        currency: formData.currency,
        currency_code: formData.currency_code,
        site_logo: logoUrl,
        welcome_greeting: formData.welcome_greeting,
        welcome_description: formData.welcome_description,
        is_temporarily_closed: String(formData.is_temporarily_closed)
      });

      setIsEditing(false);
      setLogoFile(null);
    } catch (error) {
      console.error('Error saving site settings:', error);
    }
  };

  const handleCancel = () => {
    if (siteSettings) {
      setFormData({
        site_name: siteSettings.site_name,
        site_description: siteSettings.site_description,
        currency: siteSettings.currency,
        currency_code: siteSettings.currency_code,
        welcome_greeting: siteSettings.welcome_greeting,
        welcome_description: siteSettings.welcome_description,
        is_temporarily_closed: siteSettings.is_temporarily_closed
      });
      setLogoPreview(siteSettings.site_logo);
    }
    setIsEditing(false);
    setLogoFile(null);
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_temporarily_closed: checked
    }));
  };

  if (loading) {
    return (
      <div className="bg-neutral-black-light border-2 border-neutral-black-lighter rounded-xl shadow-red-glow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-black-lighter rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-neutral-black-lighter rounded w-3/4"></div>
            <div className="h-4 bg-neutral-black-lighter rounded w-1/2"></div>
            <div className="h-4 bg-neutral-black-lighter rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-black-light border-2 border-neutral-black-lighter rounded-xl shadow-red-glow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-white">Site Settings</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-primary-red to-primary-red-dark text-white px-4 py-2 rounded-lg hover:from-primary-red-dark hover:to-primary-red transition-all duration-200 flex items-center space-x-2 font-semibold shadow-red-glow"
          >
            <Save className="h-4 w-4" />
            <span>Edit Settings</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="bg-neutral-black-lighter text-neutral-white px-4 py-2 rounded-lg hover:border-primary-red border-2 border-neutral-black-lighter transition-all duration-200 flex items-center space-x-2 font-semibold"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              className="bg-gradient-to-r from-primary-red to-primary-red-dark text-white px-4 py-2 rounded-lg hover:from-primary-red-dark hover:to-primary-red transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 font-semibold shadow-red-glow"
            >
              <Save className="h-4 w-4" />
              <span>{uploading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Temporarily Closed Toggle - Prominent at top */}
        <div className="bg-neutral-black-lighter border-2 border-primary-red rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-neutral-white mb-2 flex items-center">
                <span className="text-2xl mr-3">🚫</span>
                Temporarily Close Restaurant
              </h3>
              <p className="text-sm text-neutral-gray-light">
                When enabled, customers will see a "Temporarily Closed" modal and cannot order. Use this for holidays, maintenance, or temporary closures.
              </p>
            </div>
            <div className="ml-6">
              <label className={`relative inline-flex items-center ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                <input
                  type="checkbox"
                  checked={formData.is_temporarily_closed}
                  onChange={(e) => handleToggleChange(e.target.checked)}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className={`w-20 h-10 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-red transition-all duration-300 relative ${
                  formData.is_temporarily_closed 
                    ? 'bg-gradient-to-r from-primary-red to-primary-red-dark shadow-red-glow' 
                    : 'bg-neutral-gray border-2 border-neutral-black-lighter'
                } ${!isEditing ? 'opacity-50' : ''}`}>
                  <div className={`absolute top-1 left-1 bg-white rounded-full h-8 w-8 transition-transform duration-300 shadow-lg flex items-center justify-center ${
                    formData.is_temporarily_closed ? 'translate-x-10' : 'translate-x-0'
                  }`}>
                    {formData.is_temporarily_closed ? (
                      <span className="text-primary-red text-xl font-bold">✕</span>
                    ) : (
                      <span className="text-neutral-gray text-xl font-bold">○</span>
                    )}
                  </div>
                </div>
              </label>
            </div>
          </div>
          {formData.is_temporarily_closed && (
            <div className="mt-4 bg-primary-red/10 border-2 border-primary-red rounded-lg p-4">
              <p className="text-sm font-bold text-primary-red">⚠️ Restaurant is currently marked as TEMPORARILY CLOSED</p>
              <p className="text-xs text-neutral-gray-light mt-1">Customers will see a closure notice and cannot place orders</p>
            </div>
          )}
        </div>

        {/* Site Logo */}
        <div>
          <label className="block text-sm font-bold text-neutral-white mb-2">
            Site Logo
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-black-lighter flex items-center justify-center border-2 border-neutral-black-lighter">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Site Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-2xl text-neutral-gray">☕</div>
              )}
            </div>
            {isEditing && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="bg-neutral-black-lighter text-neutral-white px-4 py-2 rounded-lg hover:border-primary-red border-2 border-neutral-black-lighter transition-all duration-200 flex items-center space-x-2 cursor-pointer font-semibold"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Logo</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Site Name */}
        <div>
          <label className="block text-sm font-bold text-neutral-white mb-2">
            Site Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="site_name"
              value={formData.site_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
              placeholder="Enter site name"
            />
          ) : (
            <p className="text-lg font-bold text-neutral-white">{siteSettings?.site_name}</p>
          )}
        </div>

        {/* Site Description */}
        <div>
          <label className="block text-sm font-bold text-neutral-white mb-2">
            Site Description
          </label>
          {isEditing ? (
            <textarea
              name="site_description"
              value={formData.site_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
              placeholder="Enter site description"
            />
          ) : (
            <p className="text-neutral-gray-light">{siteSettings?.site_description}</p>
          )}
        </div>

        {/* Currency Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-neutral-white mb-2">
              Currency Symbol
            </label>
            {isEditing ? (
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                placeholder="e.g., ₱, $, €"
              />
            ) : (
              <p className="text-lg font-bold text-neutral-white">{siteSettings?.currency}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-white mb-2">
              Currency Code
            </label>
            {isEditing ? (
              <input
                type="text"
                name="currency_code"
                value={formData.currency_code}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
                placeholder="e.g., PHP, USD, EUR"
              />
            ) : (
              <p className="text-lg font-bold text-neutral-white">{siteSettings?.currency_code}</p>
            )}
          </div>
        </div>

        {/* Welcome Section Divider */}
        <div className="border-t-2 border-neutral-black-lighter pt-6 mt-2">
          <h3 className="text-xl font-bold text-neutral-white mb-4">Welcome Section (Menu Page)</h3>
        </div>

        {/* Welcome Greeting */}
        <div>
          <label className="block text-sm font-bold text-neutral-white mb-2">
            Welcome Greeting
          </label>
          {isEditing ? (
            <input
              type="text"
              name="welcome_greeting"
              value={formData.welcome_greeting}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
              placeholder="e.g., Maayong adlaw!"
            />
          ) : (
            <p className="text-lg font-bold text-neutral-white">{siteSettings?.welcome_greeting}</p>
          )}
          <p className="text-xs text-neutral-gray mt-1">The main greeting text shown at the top of the menu page</p>
        </div>

        {/* Welcome Description */}
        <div>
          <label className="block text-sm font-bold text-neutral-white mb-2">
            Welcome Description
          </label>
          {isEditing ? (
            <textarea
              name="welcome_description"
              value={formData.welcome_description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-neutral-white text-neutral-black border-2 border-neutral-black-lighter rounded-lg focus:ring-2 focus:ring-primary-red focus:border-primary-red transition-all duration-200 placeholder-neutral-gray font-medium"
              placeholder="Enter a description of your restaurant..."
            />
          ) : (
            <p className="text-neutral-gray-light">{siteSettings?.welcome_description}</p>
          )}
          <p className="text-xs text-neutral-gray mt-1">The description text shown below the greeting</p>
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsManager;
