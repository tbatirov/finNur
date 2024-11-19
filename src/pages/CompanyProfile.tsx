import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Globe, Calendar } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';
import { updateCompany } from '../services/api/companies';
import { useAuth } from '../contexts/AuthContext';
import { INDUSTRIES } from '../utils/industries';

export default function CompanyProfile() {
  const { selectedCompany, loadCompanies } = useCompany();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    tax_id: '',
    address: '',
    industry: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      setFormData({
        name: selectedCompany.name || '',
        code: selectedCompany.code || '',
        tax_id: selectedCompany.tax_id || '',
        address: selectedCompany.address || '',
        industry: selectedCompany.industry || ''
      });
    }
  }, [selectedCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      await updateCompany(selectedCompany.id, formData, user.id);
      await loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!selectedCompany) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-yellow-700">Please select a company first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
              <p className="text-sm text-gray-500">Manage your company information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tax ID</label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}