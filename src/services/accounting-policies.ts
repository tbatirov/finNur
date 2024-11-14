import { logger } from './logger';

export interface AccountingPolicy {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  lastUpdated: string;
  source: string;
  sourceUrl: string;
}

const API_BASE_URL = 'https://buxgalter.uz/api';

export async function fetchAccountingPolicies(): Promise<AccountingPolicy[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounting-policies`);
    if (!response.ok) {
      throw new Error('Failed to fetch accounting policies');
    }
    return response.json();
  } catch (error) {
    logger.log('Error fetching accounting policies:', error);
    // Fallback to local data if API is unavailable
    return getFallbackPolicies();
  }
}

export async function fetchPolicyDetails(id: string): Promise<AccountingPolicy | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounting-policies/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch policy details');
    }
    return response.json();
  } catch (error) {
    logger.log('Error fetching policy details:', error);
    return null;
  }
}

function getFallbackPolicies(): AccountingPolicy[] {
  return [
    {
      id: '1',
      title: 'Основные средства',
      description: 'Учет основных средств',
      content: 'Основные средства учитываются по первоначальной стоимости за вычетом накопленной амортизации...',
      category: 'Assets',
      lastUpdated: '2024-03-15',
      source: 'buxgalter.uz',
      sourceUrl: 'https://buxgalter.uz/policies/fixed-assets'
    },
    {
      id: '2',
      title: 'Запасы',
      description: 'Учет материально-производственных запасов',
      content: 'Запасы оцениваются по наименьшей из двух величин: себестоимости и чистой стоимости реализации...',
      category: 'Inventory',
      lastUpdated: '2024-03-15',
      source: 'buxgalter.uz',
      sourceUrl: 'https://buxgalter.uz/policies/inventory'
    },
    {
      id: '3',
      title: 'Выручка',
      description: 'Признание выручки',
      content: 'Выручка признается в момент передачи контроля над товарами или услугами покупателю...',
      category: 'Revenue',
      lastUpdated: '2024-03-15',
      source: 'buxgalter.uz',
      sourceUrl: 'https://buxgalter.uz/policies/revenue'
    }
  ];
}