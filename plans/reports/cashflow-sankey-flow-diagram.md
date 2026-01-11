# CashflowSankey Flow Diagram

## Visual Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     WALLET-BASED CASHFLOW                           │
└─────────────────────────────────────────────────────────────────────┘

                 ┌──────────────┐
                 │ KRW Income   │ (Emerald)
                 │  or          │
                 │ [Categories] │
                 └──────┬───────┘
                        │
                        ▼
            ┏━━━━━━━━━━━━━━━━━━━┓
            ┃   KRW WALLET      ┃ (Blue, Bold)
            ┗━━━━━━━━┳━━━━━━━━━━┛
                     │
         ┌───────────┼───────────┬──────────────┐
         │           │           │              │
         ▼           ▼           ▼              ▼
    ┌────────┐  ┌────────┐  [Exchange]   ┌──────────┐
    │Category│  │Category│   (Violet)    │KRW       │
    │Expense │  │Expense │      │        │Surplus/  │
    │   1    │  │   2    │      │        │Deficit   │
    └────────┘  └────────┘      │        └──────────┘
                                 │
                                 ▼
                     ┏━━━━━━━━━━━━━━━━━━━┓
    ┌──────────┐     ┃   VND WALLET      ┃ (Amber, Bold)
    │VND Income│────▶┗━━━━━━━━┳━━━━━━━━━━┛
    └──────────┘              │
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
              ┌──────────┐        ┌──────────┐
              │   VND    │        │   VND    │
              │ Expenses │        │ Surplus  │
              └──────────┘        └──────────┘
```

## Color Legend

| Element          | Color         | Hex Code  | Usage                    |
|------------------|---------------|-----------|--------------------------|
| KRW Wallet       | Blue          | #3b82f6   | Central hub for KRW      |
| VND Wallet       | Amber         | #f59e0b   | Central hub for VND      |
| Income           | Emerald       | #10b981   | All income sources       |
| Exchange Link    | Violet        | #8b5cf6   | KRW→VND exchange         |
| Surplus          | Green         | #10b981   | Positive balance         |
| Deficit          | Red           | #ef4444   | Negative balance         |
| Expenses         | Red→Pink      | Various   | 11-color palette         |

## Node Types

### Wallet Nodes (Central Hubs)
- **Style:** Bold text, white text color, full opacity, 2px stroke
- **Position:** Center-aligned labels
- **Function:** Receive income, distribute to expenses/exchanges/surplus

### Income Nodes
- **Options:** Category breakdown OR aggregated
- **Logic:** Use categories if `stats.byCategory` has income data
- **Position:** Left side of wallet

### Expense Nodes
- **Options:** Category breakdown OR aggregated
- **Logic:** Use categories if `stats.byCategory` has expense data
- **Position:** Right side of wallet

### Surplus/Deficit Nodes
- **Format:** Includes amount in label (e.g., "KRW Surplus (₩123,456)")
- **Logic:** Calculated as: Income - Expenses - Exchanges
- **Position:** Right edge

## Link Types

### Income → Wallet
- Width: Proportional to income amount
- Color: Gray (#888, opacity 0.3)

### Wallet → Expenses
- Width: Proportional to expense amount
- Color: Gray (#888, opacity 0.3)

### KRW Wallet → VND Wallet (Exchange)
- Width: Proportional to exchange amount
- **Color: Violet (#8b5cf6, opacity 0.6)** ← Special styling
- Value: VND amount (not KRW)

### Wallet → Surplus/Deficit
- Width: Proportional to net flow
- Color: Gray (#888, opacity 0.3)

## Data Flow Priority

1. **Wallet Data (Primary Source)**
   ```typescript
   krwWallet: {
     monthlyIncome: number,
     monthlyExpense: number,
     exchangeOut: number  // Money leaving KRW
   }
   vndWallet: {
     monthlyIncome: number,
     monthlyExpense: number,
     exchangeIn: number   // Money entering VND
   }
   ```

2. **Category Breakdown (Secondary)**
   ```typescript
   stats.byCategory: [
     { name: string, value: number, type: 'income'|'expense' }
   ]
   ```
   ⚠️ **Note:** May be filtered to single currency

3. **Exchange Details (Tertiary)**
   ```typescript
   exchanges: [
     { fromCurrency, toCurrency, fromAmount, toAmount }
   ]
   ```
   Used for: VND display amount in exchange link

## Edge Case Handling

| Case                     | Behavior                                      |
|--------------------------|-----------------------------------------------|
| No VND Income            | Only show VND from KRW exchange               |
| No KRW Expenses          | All KRW flows to exchange + surplus           |
| Categories filtered      | Use aggregated wallet amounts                 |
| No wallet data           | Show empty state                              |
| Zero income/expense      | Skip that node entirely                       |
| Negative net flow        | Show deficit node instead of surplus          |

## Calculation Examples

### Example 1: Complete Flow
```
KRW Income: ₩1,000,000
KRW Expenses: ₩300,000
Exchange: ₩500,000 → ₫11,500,000
VND Expenses: ₫5,000,000

Flow:
- KRW Income (₩1,000,000) → KRW Wallet
- KRW Wallet → KRW Expenses (₩300,000)
- KRW Wallet → VND Wallet (₫11,500,000)
- KRW Wallet → KRW Surplus (₩200,000)
- VND Wallet → VND Expenses (₫5,000,000)
- VND Wallet → VND Surplus (₫6,500,000)
```

### Example 2: No VND Income
```
KRW Income: ₩1,000,000
Exchange: ₩700,000 → ₫16,100,000
VND Expenses: ₫10,000,000

Flow:
- KRW Income (₩1,000,000) → KRW Wallet
- KRW Wallet → VND Wallet (₫16,100,000)
- KRW Wallet → KRW Surplus (₩300,000)
- VND Wallet → VND Expenses (₫10,000,000)
- VND Wallet → VND Surplus (₫6,100,000)
```

### Example 3: Deficit Scenario
```
KRW Income: ₩500,000
KRW Expenses: ₩800,000

Flow:
- KRW Income (₩500,000) → KRW Wallet
- KRW Wallet → KRW Expenses (₩800,000)
- KRW Wallet → KRW Deficit (₩300,000)  ← Negative balance
```

## Implementation Notes

- Node indices managed via `Map<string, number>` for O(1) lookup
- Links built after all nodes to ensure valid indices
- Category breakdown used when available AND currency matches
- Exchange amount uses VND value for visual clarity
- Wallet nodes always created (even with zero values)
