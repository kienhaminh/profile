# CashflowSankey Component - Flow Visualization Fix

**Date**: 2026-01-11
**Component**: `apps/web/src/components/finance/CashflowSankey.tsx`
**Type**: Bug Fix + UX Enhancement

## Problems Fixed

### 1. Incomplete Exchange Flow
- **Before**: Exchange → VND Expenses (direct, confusing)
- **After**: Cash Flow → Exchange → VND Balance → VND Expenses + VND Remaining
- Shows clear conversion and balance tracking

### 2. Missing Deficit Links
- **Before**: Deficit node created but no links (orphan node)
- **After**: Cash Flow → Deficit link shows negative flow clearly

### 3. Conditional VND Display
- **Before**: VND expenses only visible if VND wallet exists
- **After**: Always show VND flow when exchanges exist, even if no expenses

### 4. Confusing Node Labels
- **Before**: Generic labels without currency indicators
- **After**: Clear labels with amounts and currency symbols

## Flow Architecture

```
Income Categories (KRW)
    ↓
Cash Flow (KRW)
    ├→ KRW Expense Categories
    ├→ Exchange to VND
    │   ↓
    │  VND Balance (₫amount)
    │   ├→ VND Expenses (₫amount)
    │   └→ VND Remaining (₫amount)
    └→ Surplus (₩amount) / Deficit (₩amount)
```

## Key Changes

### Node Structure
1. **Income** (left): Category nodes or single "Income" node
2. **Cash Flow (KRW)**: Central hub with currency indicator
3. **KRW Expenses** (right): Category breakdown
4. **Exchange Flow**:
   - Exchange to VND (violet)
   - VND Balance (amber) - shows converted amount
   - VND Expenses (red) - actual spending
   - VND Remaining (green) - balance after expenses
5. **Net Flow**: Surplus (green) or Deficit (red) with amounts

### Link Logic
1. Income → Cash Flow: All income sources
2. Cash Flow → KRW Expenses: Category-wise breakdown
3. Cash Flow → Exchange: KRW sent to exchange
4. Exchange → VND Balance: Converted amount
5. VND Balance → VND Expenses: Actual VND spending
6. VND Balance → VND Remaining: Unused VND balance
7. Cash Flow → Surplus/Deficit: Net KRW position

### Color Coding
- Income: Emerald (#10b981)
- Cash Flow: Blue (#3b82f6)
- Exchange: Violet (#8b5cf6)
- VND Balance: Amber (#f59e0b)
- VND Expenses: Red (#ef4444)
- VND Remaining: Green (#10b981)
- Surplus: Green (#10b981)
- Deficit: Red (#ef4444)
- KRW Expenses: Color palette (11 colors)

## UX Improvements

### Clarity
- Currency indicators in node names prevent confusion
- Explicit "Exchange to VND" step shows intent
- VND Balance node shows actual converted amount
- Amounts in node labels provide immediate context

### Completeness
- Always show full exchange flow when exchanges exist
- VND Remaining shows unspent balance
- Deficit now properly linked (was orphan)

### Visual Hierarchy
- Left to right flow: Income → Processing → Expenses/Savings
- Color coding indicates flow type and health
- Smaller font (11px) with medium weight for readability

## Technical Implementation

### Data Flow
```typescript
// Calculate totals
totalIncome = sum(incomeCategories) || stats.monthlyIncome
totalExpense = sum(expenseCategories)
exchangeToVND = sum(exchanges where toCurrency='VND').fromAmount
exchangeToVNDAmount = sum(exchanges where toCurrency='VND').toAmount
vndExpense = vndWallet?.monthlyExpense || 0
netFlow = totalIncome - totalExpense - exchangeToVND

// Build nodes in order
1. Income categories
2. Cash Flow (KRW)
3. KRW Expense categories
4. Exchange flow (if exchangeToVND > 0):
   - Exchange to VND
   - VND Balance
   - VND Expenses (always show)
   - VND Remaining (if balance > 0)
5. Surplus or Deficit (based on netFlow)
```

### Exchange Logic
- Shows full VND flow even when vndExpense = 0
- VND Remaining = exchangeToVNDAmount - vndExpense
- Only shows VND Remaining node if > 0
- Links always created for complete flow visualization

## Testing Scenarios

### Scenario 1: Normal Flow with Surplus
- Income: ₩5,000,000
- KRW Expenses: ₩2,000,000
- Exchange: ₩1,000,000 → ₫20,000,000
- VND Expenses: ₫15,000,000
- Result: Surplus ₩2,000,000, VND Remaining ₫5,000,000

### Scenario 2: Deficit
- Income: ₩3,000,000
- KRW Expenses: ₩2,500,000
- Exchange: ₩1,000,000
- Result: Deficit ₩500,000

### Scenario 3: No VND Spending
- Income: ₩5,000,000
- Exchange: ₩1,000,000 → ₫20,000,000
- VND Expenses: ₫0
- Result: Full VND balance remains, shows in VND Remaining

## Files Modified

- `apps/web/src/components/finance/CashflowSankey.tsx`
  - `transformToSankeyData()`: Complete rewrite
  - `getNodeColor()`: Added VND Balance, VND Remaining cases
  - Node rendering: Updated text positioning logic

## Migration Notes

No breaking changes. Existing data structures unchanged. Visual output improved without API changes.

## Future Enhancements

- Add interactive filtering (click to highlight flow)
- Show exchange rates in node labels
- Support multiple currencies
- Add animation on data change
- Export flow as image
