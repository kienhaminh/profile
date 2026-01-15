'use server';

import { z } from 'zod';
import { getCategories, createTransaction } from '@/app/actions/finance';
import { requireAdminAuth } from '@/lib/server-auth';
import { generateText } from '@/lib/ai';

// Type for parsed transaction
export interface ParsedTransaction {
  type: 'income' | 'expense';
  amount: number;
  currency: 'KRW' | 'VND';
  categoryName?: string;
  priority?: 'must_have' | 'nice_to_have' | 'waste';
  description?: string;
  date: string;
}

// Schema for validation
const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive(),
  currency: z.enum(['KRW', 'VND']),
  categoryName: z.string().nullable().optional(),
  priority: z
    .enum(['must_have', 'nice_to_have', 'waste'])
    .nullable()
    .optional(),
  description: z.string().nullable().optional(),
  date: z.string(),
});

interface TransactionResult {
  success: boolean;
  data?: ParsedTransaction;
  error?: string;
}

/**
 * Process natural language input and parse it into a transaction
 */
export async function processTransactionInput(
  text: string
): Promise<TransactionResult> {
  await requireAdminAuth();

  try {
    // Fetch categories to provide context
    const categories = await getCategories();
    const categoryNames = categories.map((c) => c.name).join(', ');

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];

    const prompt = `You are a financial transaction parser. Parse the following natural language input into a structured transaction.

INPUT: "${text}"

RULES:
1. Detect transaction type:
   - "spent", "paid", "bought", "purchased", "cost" → expense
   - "received", "earned", "got", "income", "salary" → income
2. Extract amount: Look for numbers with currency symbols (₩, ₫) or text (KRW, VND, 원, 동)
3. Default currency: KRW if not specified
4. Date parsing:
   - "today" or "오늘" → ${today}
   - "yesterday" or "어제" → ${yesterday}
   - Specific dates → YYYY-MM-DD format
   - Default to ${today} if not specified
5. Try to match category from the following list: ${categoryNames}
6. Priority keywords (ONLY for expenses): 
   - "must have", "필수", "essential" → must_have
   - "nice to have" → nice_to_have
   - "waste", "낭비", "unnecessary" → waste

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "type": "income" or "expense",
  "amount": number,
  "currency": "KRW" or "VND",
  "categoryName": "category name if it matches one from the list" or null,
  "priority": "must_have", "nice_to_have", or "waste" (only for expenses, null otherwise),
  "description": "extracted description" or null,
  "date": "YYYY-MM-DD"
}`;

    const response = await generateText(prompt);

    // Parse the response
    const cleanedResponse = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedResponse);
    } catch {
      console.error('Failed to parse AI response:', cleanedResponse);
      return {
        success: false,
        error: 'Failed to parse AI response. Please try a clearer input.',
      };
    }

    // Validate with zod
    const validated = transactionSchema.safeParse(parsed);
    if (!validated.success) {
      console.error('Validation failed:', validated.error);
      return {
        success: false,
        error: 'Invalid transaction data. Please try again.',
      };
    }

    return {
      success: true,
      data: validated.data as ParsedTransaction,
    };
  } catch (error) {
    console.error('Error processing transaction input:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process input',
    };
  }
}

/**
 * Confirm and create the parsed transaction
 */
export async function confirmTransaction(
  transaction: ParsedTransaction
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAuth();

  try {
    const categories = await getCategories();
    const category = transaction.categoryName
      ? categories.find(
          (c) =>
            c.name.toLowerCase() === transaction.categoryName?.toLowerCase()
        )
      : undefined;

    await createTransaction({
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      categoryId: category?.id,
      priority: transaction.priority || undefined,
      description: transaction.description || undefined,
      date: new Date(transaction.date),
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create transaction',
    };
  }
}
