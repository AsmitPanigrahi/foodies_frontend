import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { menuAPI } from '../../api/menu.api';

const VALID_CATEGORIES = [
  'appetizers',
  'main courses',
  'desserts',
  'beverages',
  'sides'
];

const MenuForm = ({ onSubmit, onCancel, initialData = null, restaurantId, editingItem }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    category: initialData?.category || '',
    image: initialData?.image || '',
    isVegetarian: initialData?.isVegetarian || false,
    isVegan: initialData?.isVegan || false,
    isGlutenFree: initialData?.isGlutenFree || false,
    spicyLevel: initialData?.spicyLevel || 0,
    ingredients: initialData?.ingredients || [],
    allergens: initialData?.allergens || [],
    nutritionalInfo: initialData?.nutritionalInfo || {
      calories: '',
      protein: '',
      carbohydrates: '',
      fat: ''
    },
    isAvailable: initialData?.isAvailable ?? true,
    preparationTime: initialData?.preparationTime || 20,
    isPopular: initialData?.isPopular || false,
    isSpecial: initialData?.isSpecial || false,
    discount: initialData?.discount || 0,
    customization: initialData?.customization || []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      const requiredFields = {
        name: 'Name',
        price: 'Price',
        category: 'Category',
        preparationTime: 'Preparation Time'
      };

      // Check for missing required fields
      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !formData[key])
        .map(([, label]) => label);

      if (missingFields.length > 0) {
        toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Prepare form data
      const processedData = {
        ...formData,
        price: parseFloat(formData.price),
        preparationTime: parseInt(formData.preparationTime),
        discount: parseInt(formData.discount) || 0,
        restaurant: restaurantId
      };

      let response;
      if (editingItem && editingItem._id) {
        response = await menuAPI.updateItem(restaurantId, editingItem._id, processedData);
      } else {
        response = await menuAPI.createItem(restaurantId, processedData);
      }

      if (response) {
        toast.success(editingItem ? 'Menu item updated successfully' : 'Menu item added successfully');
        if (onSubmit) {
          onSubmit(response.data || response);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.includes('.')) {
      // Handle nested objects (e.g., nutritionalInfo.calories)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name === 'ingredients' || name === 'allergens') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim())
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      spicyLevel: 0,
      ingredients: [],
      allergens: [],
      nutritionalInfo: {
        calories: '',
        protein: '',
        carbohydrates: '',
        fat: ''
      },
      isAvailable: true,
      preparationTime: 20,
      isPopular: false,
      isSpecial: false,
      discount: 0,
      customization: []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a category</option>
            {VALID_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preparation Time (minutes)</label>
          <input
            type="number"
            name="preparationTime"
            value={formData.preparationTime}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Dietary Information */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900">Dietary Information</h3>
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isVegetarian"
                checked={formData.isVegetarian}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Vegetarian</span>
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="checkbox"
                name="isVegan"
                checked={formData.isVegan}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Vegan</span>
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="checkbox"
                name="isGlutenFree"
                checked={formData.isGlutenFree}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Gluten Free</span>
            </label>
          </div>
        </div>

        {/* Spicy Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Spicy Level</label>
          <input
            type="range"
            name="spicyLevel"
            value={formData.spicyLevel}
            onChange={handleChange}
            min="0"
            max="5"
            className="mt-1 block w-full"
          />
          <div className="text-xs text-gray-500 mt-1">Level: {formData.spicyLevel}</div>
        </div>

        {/* Ingredients and Allergens */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Ingredients (comma-separated)</label>
          <input
            type="text"
            name="ingredients"
            value={formData.ingredients.join(', ')}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Allergens (comma-separated)</label>
          <input
            type="text"
            name="allergens"
            value={formData.allergens.join(', ')}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Nutritional Information */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900">Nutritional Information</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Calories</label>
              <input
                type="number"
                name="nutritionalInfo.calories"
                value={formData.nutritionalInfo.calories}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
              <input
                type="number"
                name="nutritionalInfo.protein"
                value={formData.nutritionalInfo.protein}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Carbohydrates (g)</label>
              <input
                type="number"
                name="nutritionalInfo.carbohydrates"
                value={formData.nutritionalInfo.carbohydrates}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
              <input
                type="number"
                name="nutritionalInfo.fat"
                value={formData.nutritionalInfo.fat}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900">Additional Options</h3>
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Available</span>
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="checkbox"
                name="isPopular"
                checked={formData.isPopular}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Popular</span>
            </label>
            <label className="inline-flex items-center ml-4">
              <input
                type="checkbox"
                name="isSpecial"
                checked={formData.isSpecial}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2">Special</span>
            </label>
          </div>
        </div>

        {/* Discount */}
        <div className="col-span-2">
          <h3 className="text-lg font-medium text-gray-900">Discount</h3>
          <div className="mt-2 flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {editingItem ? 'Update' : 'Add'} Item
        </button>
      </div>
    </form>
  );
};

export default MenuForm;
