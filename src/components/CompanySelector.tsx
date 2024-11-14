import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Check } from 'lucide-react';
import { Company } from '../types/company';
import { useCompany } from '../contexts/CompanyContext';

interface Props {
  onSelect?: (company: Company) => void;
  onClose?: () => void;
}

export default function CompanySelector({ onSelect, onClose }: Props) {
  const navigate = useNavigate();
  const { companies, selectedCompany, setSelectedCompany } = useCompany();

  const handleCompanySelect = async (company: Company) => {
    setSelectedCompany(company);
    onSelect?.(company);
    onClose?.();
    navigate('/company/dashboard');
  };

  const handleAddCompany = () => {
    onClose?.();
    navigate('/company/new');
  };

  return (
    <div className="w-full">
      <div className="px-4 py-2 border-b">
        <h3 className="text-sm font-medium text-gray-700">Select Company</h3>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {companies.map(company => (
          <button
            key={company.id}
            onClick={() => handleCompanySelect(company)}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{company.name}</span>
            </div>
            {selectedCompany?.id === company.id && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </button>
        ))}
      </div>

      <div className="border-t my-2"></div>

      <button
        onClick={handleAddCompany}
        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Add New Company</span>
      </button>
    </div>
  );
}