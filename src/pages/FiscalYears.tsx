import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Company, FiscalYear } from '../types/company';
import { getFiscalYears, addFiscalYear, updateFiscalYear, deleteFiscalYear } from '../services/api/fiscal-years';
import { getFiscalYearStatements } from '../services/statement-storage';
import { useCompany } from '../contexts/CompanyContext';

export default function FiscalYears() {
  const [company, setCompany] = useState<Company | null>(null);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<FiscalYear | null>(null);
  const { selectedCompany } = useCompany();
  const [formData, setFormData] = useState( {
    name: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!selectedCompany) {
          setError('No company selected');
          return;
        }

        setCompany(selectedCompany);
        const years = await getFiscalYears(selectedCompany.id);
        setFiscalYears(years);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fiscal years');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddYear = async () => {
    if (!company) return;

    try {
      const newYear = await addFiscalYear({
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        company_id: company.id
      });

      setFiscalYears([...fiscalYears, newYear]);
      setIsAddModalOpen(false);
      setFormData({ name: '', start_date: '', end_date: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add fiscal year');
    }
  };

  const handleEditYear = async () => {
    if (!selectedYear) return;

    try {
      const updatedYear = await updateFiscalYear(selectedYear.id, {
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date
      });

      setFiscalYears(fiscalYears.map(year => 
        year.id === updatedYear.id ? updatedYear : year
      ));
      setIsEditModalOpen(false);
      setSelectedYear(null);
      setFormData({ name: '', start_date: '', end_date: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update fiscal year');
    }
  };

  const handleDeleteYear = async () => {
    if (!company || !selectedYear) return;

    try {
      await deleteFiscalYear(selectedYear.id);
      setFiscalYears(fiscalYears.filter(year => year.id !== selectedYear.id));
      setIsDeleteModalOpen(false);
      setSelectedYear(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete fiscal year');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Error</h2>
        </div>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Fiscal Years</h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Fiscal Year
        </button>
      </div>

      {fiscalYears.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No fiscal years defined</h3>
          <p className="text-gray-500">Add a fiscal year to start managing financial statements.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {fiscalYears.map(year => (
            <div
              key={year.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">{year.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedYear(year);
                      setFormData({
                        name: year.name,
                        start_date: year.start_date,
                        end_date: year.end_date
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedYear(year);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Start Date: {new Date(year.start_date).toLocaleDateString()}</p>
                <p>End Date: {new Date(year.end_date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isAddModalOpen ? 'Add Fiscal Year' : 'Edit Fiscal Year'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedYear(null);
                  setFormData({ name: '', start_date: '', end_date: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={isAddModalOpen ? handleAddYear : handleEditYear}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {isAddModalOpen ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Delete Fiscal Year</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this fiscal year? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedYear(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteYear}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}