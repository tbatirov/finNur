import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { AccountingPolicy, fetchAccountingPolicies } from '../services/accounting-policies';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';

export default function AccountingPolicies() {
  const [policies, setPolicies] = useState<AccountingPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true);
        const data = await fetchAccountingPolicies();
        setPolicies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load accounting policies');
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, []);

  const categories = [...new Set(policies.map(policy => policy.category))];
  
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || policy.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card
        title="Учетная политика"
        description="Управление учетной политикой и процедурами"
        icon={BookOpen}
        iconColor="text-blue-600"
      >
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Поиск политик..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'all', label: 'Все категории' },
                ...categories.map(category => ({
                  value: category,
                  label: category
                }))
              ]}
              icon={Filter}
            />
          </div>
        </div>

        {/* Policies List */}
        <div className="space-y-4">
          {filteredPolicies.map((policy) => (
            <div
              key={policy.id}
              className="bg-gray-50 rounded-lg overflow-hidden"
            >
              {/* Policy Header */}
              <button
                onClick={() => setExpandedPolicy(
                  expandedPolicy === policy.id ? null : policy.id
                )}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {expandedPolicy === policy.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-gray-900">
                      {policy.title}
                    </h3>
                    <p className="text-sm text-gray-500">{policy.description}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(policy.lastUpdated).toLocaleDateString()}
                </span>
              </button>

              {/* Policy Content */}
              {expandedPolicy === policy.id && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="prose max-w-none">
                    <p className="text-gray-600 mb-4">{policy.content}</p>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <ExternalLink className="w-4 h-4" />
                      <a
                        href={policy.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Подробнее на {policy.source}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredPolicies.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Политики не найдены
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}