export type FinanceTransactionType = 'income' | 'expense';
export type FinancePriority = 'must_have' | 'nice_to_have' | 'waste';
export type Currency = 'KRW' | 'VND';

export interface FinanceCategory {
  id: string;
  name: string;
  createdAt: Date;
}

export interface FinanceTransaction {
  id: string;
  createdAt: Date;
  type: FinanceTransactionType;
  amount: string;
  currency: Currency;
  categoryId: string | null;
  category?: FinanceCategory | null; // Joined
  priority: FinancePriority | null;
  description: string | null;
  date: string; // ISO date string
}

export interface CreateTransactionDTO {
  type: FinanceTransactionType;
  amount: number;
  currency: Currency;
  categoryId?: string;
  priority?: FinancePriority;
  description?: string;
  date: Date;
}

export interface UpdateTransactionDTO extends Partial<CreateTransactionDTO> {
  id: string;
}

export interface FinanceFilter {
  categoryId?: string;
  priority?: FinancePriority;
  currency?: Currency;
  startDate?: string;
  endDate?: string;
}

export interface FinanceStats {
  monthlyIncome: number;
  monthlyExpense: number;
  weeklyExpense: number;
  byCategory: { name: string; value: number; type: FinanceTransactionType }[];
  byPriority: { name: string; value: number }[];
}

export interface WalletStats {
  currency: Currency;
  monthlyIncome: number;
  monthlyExpense: number;
  exchangeIn: number;
  exchangeOut: number;
  balance: number;
}

export interface FinanceBudget {
  id: string;
  categoryId: string;
  category?: FinanceCategory | null;
  amount: string;
  currency: Currency;
  month: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBudgetDTO {
  categoryId: string;
  amount: number;
  currency: Currency;
  month: string; // YYYY-MM-01 format
}

export interface BudgetProgress {
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  remaining: number;
  currency: Currency;
}

export interface FinanceExchange {
  id: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount: string;
  toAmount: string;
  rate: string;
  date: string;
  description: string | null;
  createdAt: Date;
}

export interface CreateExchangeDTO {
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount: number;
  toAmount: number;
  date: Date;
  description?: string;
}

// ==================== LOANS ====================

export type LoanType = 'borrow' | 'lend';
export type LoanStatus = 'active' | 'settled';

export interface FinanceLoan {
  id: string;
  type: LoanType;
  counterparty: string;
  amount: string;
  currency: Currency;
  status: LoanStatus;
  date: string;
  dueDate: string | null;
  settledDate: string | null;
  description: string | null;
  createdAt: Date;
}

export interface CreateLoanDTO {
  type: LoanType;
  counterparty: string;
  amount: number;
  currency: Currency;
  date: Date;
  dueDate?: Date;
  description?: string;
}

export interface UpdateLoanDTO extends Partial<CreateLoanDTO> {
  id: string;
  status?: LoanStatus;
  settledDate?: Date;
}

// ==================== INVESTMENTS ====================

export type InvestmentStatus = 'active' | 'sold' | 'matured';

export interface FinanceInvestment {
  id: string;
  name: string;
  type: string | null;
  amount: string;
  currentValue: string | null;
  currency: Currency;
  status: InvestmentStatus;
  date: string;
  soldDate: string | null;
  soldAmount: string | null;
  description: string | null;
  createdAt: Date;
}

export interface CreateInvestmentDTO {
  name: string;
  type?: string;
  amount: number;
  currentValue?: number;
  currency: Currency;
  date: Date;
  description?: string;
}

export interface UpdateInvestmentDTO extends Partial<CreateInvestmentDTO> {
  id: string;
  status?: InvestmentStatus;
  soldDate?: Date;
  soldAmount?: number;
}
