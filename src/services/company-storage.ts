import { v4 as uuidv4 } from "uuid";

export interface Company {
  id: string;
  name: string;
  code: string;
  tax_id: string;
  address: string;
  industry: string;
  createdAt: string;
  updatedAt: string;
}

const COMPANIES_KEY = "companies";
const ACTIVE_COMPANY_KEY = "activeCompany";

export async function getAllCompanies(): Promise<Company[]> {
  const companiesJson = localStorage.getItem(COMPANIES_KEY);
  return companiesJson ? JSON.parse(companiesJson) : [];
}

export async function getCompanies(): Promise<Company[]> {
  return getAllCompanies();
}

export async function getCompany(id: string): Promise<Company | null> {
  const companies = await getAllCompanies();
  return companies.find(company => company.id === id) || null;
}

export async function addCompany(company: Omit<Company, "id" | "createdAt" | "updatedAt">): Promise<Company> {
  const companies = await getAllCompanies();
  const newCompany: Company = {
    ...company,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  companies.push(newCompany);
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
  return newCompany;
}

export async function updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
  const companies = await getAllCompanies();
  const index = companies.findIndex(c => c.id === id);
  
  if (index === -1) {
    throw new Error("Company not found");
  }
  
  const updatedCompany = {
    ...companies[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  companies[index] = updatedCompany;
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
  return updatedCompany;
}

export async function deleteCompany(id: string): Promise<void> {
  const companies = await getAllCompanies();
  const filteredCompanies = companies.filter(c => c.id !== id);
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(filteredCompanies));
  
  const activeCompany = await getActiveCompany();
  if (activeCompany?.id === id) {
    await setActiveCompany(null);
  }
}

export async function getCompanyById(id: string): Promise<Company | null> {
  return getCompany(id);
}

export async function setActiveCompany(company: Company | null): Promise<void> {
  if (company) {
    localStorage.setItem(ACTIVE_COMPANY_KEY, JSON.stringify(company));
  } else {
    localStorage.removeItem(ACTIVE_COMPANY_KEY);
  }
}

export async function getActiveCompany(): Promise<Company | null> {
  const activeCompanyJson = localStorage.getItem(ACTIVE_COMPANY_KEY);
  return activeCompanyJson ? JSON.parse(activeCompanyJson) : null;
}

export async function searchCompanies(query: string): Promise<Company[]> {
  const companies = await getAllCompanies();
  const searchTerm = query.toLowerCase();
  
  return companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm) ||
    company.code.toLowerCase().includes(searchTerm) ||
    company.taxId.toLowerCase().includes(searchTerm)
  );
}