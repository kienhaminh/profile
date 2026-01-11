# CashflowSankey Component Redesign - Wallet-Based Flow

**Date:** 2026-01-11
**Component:** `apps/web/src/components/finance/CashflowSankey.tsx`
**Type:** Component Redesign

## Summary

Redesigned CashflowSankey to show wallet-based cashflow combining income, expenses, AND exchange transactions. Previous implementation treated exchanges as separate branch; new design shows wallets as central hubs with exchanges as links between them.

## Design Changes

### Flow Architecture

**Previous Flow:**
```
Income → Cash Flow → {Expenses, Exchange → VND Balance → VND Expenses}
```

**New Flow:**
```
KRW Income → KRW Wallet → {KRW Expenses, Exchange (link) → VND Wallet, KRW Surplus}
VND Income → VND Wallet → {VND Expenses, VND Surplus}
```

### Node Structure

**Wallet Nodes (Central Hubs):**
- `KRW Wallet` - Blue (#3b82f6) - Receives KRW income, distributes to expenses/exchanges
- `VND Wallet` - Amber (#f59e0b) - Receives from exchanges + VND income, distributes to expenses

**Income Nodes:**
- Category breakdown (if available) or aggregated `KRW Income`/`VND Income`
- Color: Emerald (#10b981)

**Expense Nodes:**
- Category breakdown (if available) or aggregated `KRW Expenses`/`VND Expenses`
- Colors: Red through Pink palette (11 colors)

**Surplus/Deficit Nodes:**
- `KRW Surplus` / `KRW Deficit` - Green (#10b981) / Red (#ef4444)
- `VND Surplus` - Green (#10b981)
- Show amounts in node name with currency symbol

### Link Styling

**Exchange Links:** KRW Wallet → VND Wallet
- Color: Violet (#8b5cf6)
- Opacity: 0.6 (higher than normal)
- Visual distinction from regular flows

**Regular Links:**
- Color: Gray (#888)
- Opacity: 0.3

### Visual Hierarchy

**Wallet Nodes:**
- Bold text, white color
- Full opacity (1.0)
- 2px stroke for emphasis
- Centered labels

**Other Nodes:**
- Medium weight text
- 0.9 opacity
- Left/right aligned labels

## Data Source Priority

1. **Primary:** `wallets` array (WalletStats)
   - `monthlyIncome`, `monthlyExpense`, `exchangeOut`, `exchangeIn`, `balance`
2. **Secondary:** `stats.byCategory` for breakdown
   - Used ONLY if currency matches wallet
   - Filtered data might contain only KRW OR VND categories
3. **Tertiary:** `exchanges` array for exchange amounts
   - Extract `toAmount` for VND display values

## Edge Cases Handled

1. **No VND Income:** Only show VND from exchanges
2. **No KRW Expenses:** All money flows to exchange + surplus
3. **Category Filtering:** stats.byCategory filtered to one currency
4. **No Wallet Data:** Return empty visualization
5. **Zero Flows:** Skip nodes/links with zero values

## Technical Implementation

### Node Management
- `Map<string, number>` for node index tracking
- `addNode()` helper prevents duplicates
- Sequential building: Income → Wallet → Expenses → Surplus

### Link Building
- Income → Wallet (with category breakdown if available)
- Wallet → Expenses (with category breakdown if available)
- KRW Wallet → VND Wallet (exchange, uses VND amount)
- Wallet → Surplus/Deficit

### Color Logic
```typescript
getNodeColor(nodeName):
  - Wallet nodes: Blue/Amber
  - Surplus/Deficit: Green/Red
  - Income: Emerald
  - Expenses: Palette rotation
```

## Files Modified

- `apps/web/src/components/finance/CashflowSankey.tsx`
  - Renamed `CASHFLOW_COLOR` → `KRW_WALLET_COLOR`
  - Added `VND_WALLET_COLOR`, renamed `EXCHANGE_COLOR` → `EXCHANGE_LINK_COLOR`
  - Complete rewrite of `transformToSankeyData()` function (205 lines)
  - Updated `getNodeColor()` for wallet nodes
  - Enhanced node rendering with wallet emphasis
  - Added exchange link highlighting

## Design Rationale

### Wallet-Centric Model
- Reflects real-world mental model of separate currency wallets
- Clarifies exchange impact on both currencies
- Shows complete money flow including cross-currency

### Visual Clarity
- Wallet nodes as central hubs are visually emphasized
- Exchange links distinctly colored (violet) for easy identification
- Currency symbols in node labels for quick recognition

### Data Accuracy
- Uses wallet data as source of truth
- Handles category filtering edge case
- Correctly maps exchange amounts to VND value

## UX Improvements

1. **Comprehensive View:** Single chart shows entire cashflow across currencies
2. **Exchange Visibility:** Exchange shown as direct wallet link, not separate branch
3. **Balance Tracking:** Surplus/deficit for each currency clearly visible
4. **Category Breakdown:** Income/expense categories preserved when available
5. **Responsive Labels:** Wallet labels centered, others positioned contextually

## Performance Considerations

- `useMemo` for sankey data transformation
- Client-side only rendering (`'use client'`)
- Skeleton loader during mount
- No unnecessary re-renders

## Unresolved Questions

None. Implementation complete and handles all specified requirements.
