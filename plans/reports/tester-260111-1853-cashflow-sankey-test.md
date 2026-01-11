# CashflowSankey Component Test Report
**Date:** 2026-01-11
**Component:** `apps/web/src/components/finance/CashflowSankey.tsx`
**Status:** FAILED - TypeScript Compilation Error

---

## Test Results Overview

| Category | Result | Details |
|----------|--------|---------|
| **TypeScript Compilation** | ❌ FAILED | Type error in link renderer prop |
| **Next.js Build** | ❌ FAILED | Blocked by TypeScript error |
| **Runtime** | ⏸️ NOT TESTED | Cannot test until compilation succeeds |

---

## Critical Issue Found

### Type Error: Line 449-450

**Location:** `apps/web/src/components/finance/CashflowSankey.tsx` (link renderer)

**Error:**
```
./src/components/finance/CashflowSankey.tsx:449:51
Type error: Type 'SankeyNode' cannot be used as an index type.

const sourceName = sankeyData.nodes[payload?.source]?.name || '';
                                                    ^
```

**Root Cause:**
In the Sankey component's `link` prop renderer, the `payload` parameter contains source/target as node objects from recharts, not numeric indices. The code incorrectly attempts to use these objects as array indices:

```typescript
// INCORRECT - payload.source is a node object, not an index
const sourceName = sankeyData.nodes[payload?.source]?.name || '';
const targetName = sankeyData.nodes[payload?.target]?.name || '';
```

**Impact:**
- Build fails immediately with TypeScript strict mode enabled
- Component cannot be compiled to production
- No runtime validation possible until fixed

---

## Code Analysis

### Props Structure (Correct)
```typescript
interface CashflowSankeyProps {
  stats: FinanceStats;
  exchanges?: FinanceExchange[];
  wallets?: WalletStats[];
}
```
✅ All props are properly typed from `@/types/finance`

### Type Definitions Check
✅ `FinanceStats` - Properly defined with `byCategory` array
✅ `FinanceExchange` - Properly defined with currency fields
✅ `WalletStats` - Properly defined with exchange tracking

### Component Logic Review
✅ `transformToSankeyData()` function correctly builds nodes array with numeric indices
✅ Node creation with `nodeMap` tracking is logically sound
✅ Link creation properly references node indices (uses `nodeMap.get()`)
✅ Data structure passed to Sankey component is correct

### Issue: Link Renderer Props

The Sankey component's `link` prop handler receives a `payload` object with structure:
```typescript
// payload from recharts link renderer
{
  source: number;      // Index in nodes array
  target: number;      // Index in nodes array
  value: number;       // Link flow value
}
```

But the code destructures and accesses it incorrectly at line 449:
```typescript
const sourceName = sankeyData.nodes[payload?.source]?.name || '';
```

The optional chaining `payload?.source` returns either a number or undefined, but TypeScript strict type checking fails here because recharts types may define source/target differently.

---

## Error Log Extract

```
Creating an optimized production build ...
✓ Compiled successfully in 11.1s
Running TypeScript ...
Failed to compile.

./src/components/finance/CashflowSankey.tsx:449:51
Type error: Type 'SankeyNode' cannot be used as an index type.

447 |
448 |               // Check if this is an exchange link (KRW Wallet → VND Wallet)
449 |               const sourceName = sankeyData.nodes[payload?.source]?.name || '';
                                                                  ^
450 |               const targetName = sankeyData.nodes[payload?.target]?.name || '';
451 |               const isExchangeLink = sourceName === 'KRW Wallet' && targetName === 'VND Wallet';
452 |

Next.js build worker exited with code: 1 and signal: null
```

---

## TypeScript Configuration

**Path:** `apps/web/tsconfig.json`

Configuration is strict and correct:
- `"strict": true` - Enforces type safety
- `"noEmit": true` - Prevents output on errors
- ES2017 target with proper React JSX support
- Path aliases configured correctly (`@/*` → `src/*`)

---

## Files Examined

1. **CashflowSankey.tsx** - Component implementation (479 lines)
   - Imports: Correct (recharts, react, types)
   - Props: Well-typed
   - Data transformation: Logically sound
   - Rendering: Issue in link prop renderer

2. **finance.ts** (types) - All required types present and correctly defined
   - `FinanceStats`
   - `FinanceExchange`
   - `WalletStats`
   - `FinanceCategory`

3. **package.json** - Dependencies correct
   - recharts ^3.3.0 - Compatible
   - @types/recharts ^2.0.1 - Type definitions available

---

## Recommendations

### Required Fix (BLOCKING)

The link renderer needs type-safe access to payload properties. Use explicit casting or type narrowing:

**Option 1: Type Guard (Recommended)**
```typescript
link={(props) => {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, payload } = props;

  // Safe type access
  const sourceIndex = typeof payload?.source === 'number' ? payload.source : -1;
  const targetIndex = typeof payload?.target === 'number' ? payload.target : -1;

  const sourceName = sourceIndex >= 0 ? sankeyData.nodes[sourceIndex]?.name || '' : '';
  const targetName = targetIndex >= 0 ? sankeyData.nodes[targetIndex]?.name || '' : '';
  const isExchangeLink = sourceName === 'KRW Wallet' && targetName === 'VND Wallet';

  // ... rest of renderer
}}
```

**Option 2: Direct Property Access**
```typescript
const sourceName = sankeyData.nodes[(payload as any)?.source]?.name || '';
const targetName = sankeyData.nodes[(payload as any)?.target]?.name || '';
```

**Option 3: Use Payload Data Directly**
If recharts payload contains additional context, access it directly without array lookup:
```typescript
const isExchangeLink = (payload?.['source'] as any) === 'KRW Wallet' &&
                       (payload?.['target'] as any) === 'VND Wallet';
```

---

## Next Steps (Prioritized)

1. **CRITICAL** - Fix TypeScript type error in link renderer (line 449-451)
   - Apply type guard or explicit casting
   - Re-run `pnpm -F @portfolio/web build` to verify

2. **HIGH** - Validate runtime behavior
   - Test with sample data containing exchanges
   - Test with mixed KRW/VND wallets
   - Verify exchange link highlighting works correctly
   - Check tooltip displays correct formatting

3. **MEDIUM** - Edge case testing
   - Test with zero income/expense
   - Test with only one wallet (KRW or VND)
   - Test with no exchange data
   - Verify surplus/deficit display accuracy

4. **MEDIUM** - Performance validation
   - Verify responsiveness with large category lists
   - Check memory usage with multiple renders
   - Validate animation smoothness

5. **LOW** - Documentation
   - Document expected shape of stats/exchanges/wallets props
   - Add JSDoc comments for transformation function
   - Document color scheme and node types

---

## Unresolved Questions

1. What is the exact type signature of `payload` in recharts Sankey link renderer?
   - Affects fix approach selection
   - May need to check recharts source/types package

2. Should the component validate that `sankeyData.nodes` indices are valid before access?
   - Current implementation doesn't guard against out-of-bounds access
   - Could cause runtime errors with malformed data

3. Is the exchange link color logic complete?
   - Currently only checks for "KRW Wallet" → "VND Wallet"
   - Should reverse direction (VND → KRW) also be highlighted?
