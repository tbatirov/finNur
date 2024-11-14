import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Company } from '../types/supabase';
import { getCompanies, deleteCompany } from '../services/api/companies';
import AddCompanyDialog from '../components/AddCompanyDialog';
import EditCompanyDialog from '../components/EditCompanyDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

export default function CompanyList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (user) {
      loadCompanies();
    }
  }, [user]);

  const loadCompanies = async () => {
    try {
      const data = await getCompanies(user.id);
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const handleCompanyClick = (company: Company) => {
    navigate(`/company/${company.id}/dashboard`);
  };

  const handleEditClick = (e: React.MouseEvent, company: Company) => {
    e.stopPropagation();
    setSelectedCompany(company);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, company: Company) => {
    e.stopPropagation();
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (selectedCompany) {
      try {
        await deleteCompany(selectedCompany.id, user.id);
        await loadCompanies();
        setIsDeleteDialogOpen(false);
        setSelectedCompany(null);
      } catch (error) {
        console.error('Failed to delete company:', error);
      }
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Companies
          </h1>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map(company => (
          <div
            key={company.id}
            onClick={() => handleCompanyClick(company)}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                <p className="text-sm text-gray-500">Code: {company.code}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleEditClick(e, company)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, company)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Tax ID: {company.tax_id}</p>
              <p>Address: {company.address}</p>
            </div>
          </div>
        ))}

        {filteredCompanies.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'No companies found matching your search.' : 'No companies added yet.'}
            </p>
          </div>
        )}
      </div>

      <AddCompanyDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onCompanyAdded={loadCompanies}
      />

      {selectedCompany && (
        <>
          <EditCompanyDialog
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedCompany(null);
            }}
            company={selectedCompany}
            onCompanyUpdated={loadCompanies}
          />

          <DeleteConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedCompany(null);
            }}
            onConfirm={handleDelete}
            title="Delete Company"
            message={`Are you sure you want to delete ${selectedCompany.name}? This action cannot be undone.`}
          />
        </>
      )}
    </div>
  );
}