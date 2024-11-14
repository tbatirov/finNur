-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    tax_id VARCHAR(50) NOT NULL,
    address TEXT,
    industry VARCHAR(100),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE UNIQUE INDEX idx_companies_code ON companies(code);
CREATE UNIQUE INDEX idx_companies_tax_id ON companies(tax_id);

-- Fiscal years table
CREATE TABLE fiscal_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes
CREATE INDEX idx_fiscal_years_company_id ON fiscal_years(company_id);

-- Statements table
CREATE TABLE statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes
CREATE INDEX idx_statements_company_id ON statements(company_id);
CREATE INDEX idx_statements_fiscal_year_id ON statements(fiscal_year_id);
CREATE UNIQUE INDEX idx_statements_unique_monthly ON statements(company_id, fiscal_year_id, month, type);

-- Add RLS policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE statements ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view their own companies"
    ON companies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companies"
    ON companies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies"
    ON companies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies"
    ON companies FOR DELETE
    USING (auth.uid() = user_id);

-- Fiscal years policies
CREATE POLICY "Users can view fiscal years of their companies"
    ON fiscal_years FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = fiscal_years.company_id
        AND companies.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert fiscal years for their companies"
    ON fiscal_years FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = fiscal_years.company_id
        AND companies.user_id = auth.uid()
    ));

CREATE POLICY "Users can update fiscal years of their companies"
    ON fiscal_years FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = fiscal_years.company_id
        AND companies.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete fiscal years of their companies"
    ON fiscal_years FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = fiscal_years.company_id
        AND companies.user_id = auth.uid()
    ));

-- Statements policies
CREATE POLICY "Users can view statements of their companies"
    ON statements FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = statements.company_id
        AND companies.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert statements for their companies"
    ON statements FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = statements.company_id
        AND companies.user_id = auth.uid()
    ));

CREATE POLICY "Users can update statements of their companies"
    ON statements FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = statements.company_id
        AND companies.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete statements of their companies"
    ON statements FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = statements.company_id
        AND companies.user_id = auth.uid()
    ));