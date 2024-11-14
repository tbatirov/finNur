import React, { useState, useEffect } from 'react';
import { 
  Settings, HelpCircle, User, Building2, ChevronDown, 
  FileText, Cog, LogOut, DollarSign, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import CompanySelector from './CompanySelector';
import { Company } from '../types/company';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';
import { getFiscalYears } from '../services/api/fiscal-years';
import { getStatements } from '../services/api/statements';

export default function TopNavigation() {
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [lastPeriodMetrics, setLastPeriodMetrics] = useState<{
    revenue: number;
    profit: number;
    growth: number;
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { selectedCompany } = useCompany();

  useEffect(() => {
    const loadLastPeriodData = async () => {
      if (!selectedCompany) {
        setLastPeriodMetrics(null);
        return;
      }

      try {
        // Get fiscal years
        const years = await getFiscalYears(selectedCompany.id);
        if (!years.length) return;

        // Sort years by start date and get the most recent
        const sortedYears = years.sort((a, b) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        const currentYear = sortedYears[0];

        // Get current month
        const currentMonth = new Date().getMonth() + 1;

        // Get statements for the last period
        const statements = await getStatements(
          selectedCompany.id,
          currentYear.id,
          currentMonth
        );

        if (statements.length) {
          // Find income statement
          const incomeStatement = statements.find(s => s.type === 'income');
          if (incomeStatement?.data) {
            const revenue = incomeStatement.data.lineItems
              .filter((item: any) => item.section.startsWith('revenue'))
              .reduce((sum: number, item: any) => sum + item.amount, 0);

            const profit = incomeStatement.data.total;

            // Calculate growth (simplified - you might want to compare with previous period)
            const growth = profit > 0 ? (profit / revenue) * 100 : 0;

            setLastPeriodMetrics({
              revenue,
              profit,
              growth
            });
          }
        }
      } catch (error) {
        console.error('Failed to load last period data:', error);
      }
    };

    loadLastPeriodData();
  }, [selectedCompany]);

  const handleCompanySelect = (company: Company) => {
    setIsCompanyMenuOpen(false);
    navigate('/company/dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex space-x-4 items-center">
                {/* Company Menu */}
                <div className="relative">
                  <button 
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    {selectedCompany ? selectedCompany.name : 'Select Company'}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>

                  {isCompanyMenuOpen && (
                    <>
                      <div className="fixed inset-0" onClick={() => setIsCompanyMenuOpen(false)} />
                      <div className="absolute left-0 mt-1 w-64 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                        <CompanySelector 
                          onSelect={handleCompanySelect}
                          onClose={() => setIsCompanyMenuOpen(false)}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Last Period Metrics */}
                {selectedCompany && lastPeriodMetrics && (
                  <div className="flex items-center space-x-4 ml-4 border-l border-gray-200 pl-4">
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-gray-500">Revenue:</span>
                      <span className="font-medium ml-1">{formatCurrency(lastPeriodMetrics.revenue)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-gray-500">Profit:</span>
                      <span className="font-medium ml-1">{formatCurrency(lastPeriodMetrics.profit)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <ArrowUpRight className="w-4 h-4 text-purple-500 mr-1" />
                      <span className="text-gray-500">Growth:</span>
                      <span className="font-medium ml-1">{lastPeriodMetrics.growth.toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {/* Company-specific navigation */}
                {selectedCompany && (
                  <>
                    <Link 
                      to="/company/statements"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Statement Generator
                    </Link>

                    {/* Company Settings Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      >
                        <Cog className="w-4 h-4 mr-2" />
                        Company Settings
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>

                      {isSettingsMenuOpen && (
                        <>
                          <div className="fixed inset-0" onClick={() => setIsSettingsMenuOpen(false)} />
                          <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                            <Link
                              to="/company/profile"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsSettingsMenuOpen(false)}
                            >
                              Company Profile
                            </Link>
                            <Link
                              to="/company/fiscal-years"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsSettingsMenuOpen(false)}
                            >
                              Fiscal Years
                            </Link>
                            <Link
                              to="/company/chart-of-accounts"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsSettingsMenuOpen(false)}
                            >
                              Chart of Accounts
                            </Link>
                            <Link
                              to="/company/accounting-policies"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsSettingsMenuOpen(false)}
                            >
                              Accounting Policies
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
              <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <div className="flex items-center">
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}