import React, { useState, useEffect } from "react";
import { Building2, X } from "lucide-react";
import { CompanyUpdate } from "../types/supabase";
import { updateCompany } from "../services/api/companies";
import { useAuth } from "../contexts/AuthContext";
import { INDUSTRIES } from "../utils/industries";

interface Props {
  isOpen: boolean;
  company: CompanyUpdate & { id: string };
  onClose: () => void;
  onCompanyUpdated: () => void;
}

export default function EditCompanyDialog({ isOpen, company, onClose, onCompanyUpdated }: Props) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CompanyUpdate>({
    name: company.name || "",
    code: company.code || "",
    tax_id: company.tax_id || "",
    address: company.address || "",
    industry: company.industry || ""
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        code: company.code || "",
        tax_id: company.tax_id || "",
        address: company.address || "",
        industry: company.industry || ""
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateCompany(company.id, formData, user.id);
      onCompanyUpdated();
      onClose();
      setError(null);
    } catch (err) {
      console.error("Error updating company:", err);
      setError(err.message || "An unexpected error occurred.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Edit Company</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <select
              required
              value={formData.industry || ''}
              onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {INDUSTRIES.map(industry => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Company Code</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tax ID</label>
            <input
              type="text"
              required
              value={formData.tax_id}
              onChange={e => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              required
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Update Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}