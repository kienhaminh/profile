---
trigger: glob
globs: "**/*.{tsx,jsx,ts}"
---

# React Expert Guidelines

**Enforcement**: STRICT for all React code.

## 1. 🏗 Architecture & File Structure

- **Feature-First Architecture**: Group components by Feature (e.g., `features/auth/components/LoginForm.tsx`) rather than generic top-level 'components' folders for complex apps.
- **Naming Conventions**:
  - Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
  - Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`)
  - Utilities: `kebab-case.ts` (e.g., `date-formatter.ts`)
  - Types: `types.ts` or `PascalCase.types.ts`
- **Exports**: Use **Named Exports** (`export const Component = ...`) to ensure consistent naming across the codebase. Avoid `default export`.

## 2. ⚛️ Component Patterns

- **Functional Components Only**: No Class components.
- **Composition**: Use `children` prop heavily. Avoid "God Components" that take 20 props.
- **Single Responsibility**: Each component should do one thing well. Extract sub-components for layout/logic separation.
- **Props Interface**:
  - Always define a `Props` interface (or `type`).
  - Use `React.ReactNode` for children.
  - **Destructure props** in the function signature.
  - **Readability**: Keep render logic clean. Extract complex conditions to helper variables.

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
}

export const Button = ({
  label,
  onClick,
  variant = "primary",
  icon,
}: ButtonProps) => {
  const isPrimary = variant === "primary";
  // ...
};
```

## 3. 🎣 Hooks & State Management

- **Custom Hooks**: Extract business logic and side effects into custom hooks (e.g., `useLoginForm`, `useFetchUser`). The component should mainly focus on UI.
- **Derived State**: **NEVER** use `useState` + `useEffect` for data that can be calculated from existing props/state.
  - _Bad_: `const [fullName, setFullName] = useState(''); useEffect(() => setFullName(first + last), [first, last]);`
  - _Good_: `const fullName = ${first} ${last};`
- **Rules of Hooks**: Strict adherence (top level only, no loops/conditions).
- **Server State**: Prefer libraries like TanStack Query (React Query) or SWR for async data over manual `useEffect` fetching.

## 4. ⚡ Performance & Optimization

- **Referential Equality**: Use `useCallback` for event handlers passed to deep or memoized children.
- **Memoization**: Use `useMemo` for expensive calculations (filtering large lists, complex transformations). Don't premature optimize simple primitives.
- **Stable Keys**: Use unique IDs (e.g., `user.id`). **NEVER** use array index as a key for dynamic lists.
- **Code Splitting**: Lazy load routes and heavy components using `React.lazy` and `Suspense`.

## 5. 🛡 Typescript & Safety

- **Strict Types**: No `any`. Use `unknown` or specific types if unsure.
- **Event Types**: use `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent`, etc., instead of generic `any`.
- **Null Safety**: Handle `null` and `undefined` explicitly. Optional chaining `?.` is your friend.
- **Input Validation**: Sanitize user inputs. Use libraries like `zod` for schema validation if complex.

## 6. 🧪 Testing

- **React Testing Library**: Test **behavior**, not implementation details.
- **Selectors**: Prioritize Accessibility (A11y) selectors:
  1. `getByRole` (e.g., `getByRole('button', { name: /submit/i })`)
  2. `getByLabelText`
  3. `getByPlaceholderText`
  4. `getByText`
  5. `getByTestId` (Last resort)

## 7. 💅 Styling

- **Consistency**: Follow the project's styling paradigm (CSS Modules, Tailwind, or Styled Components).
- **Conditional Classes**: Use `clsx` or `cn` (shadcn-like utility) for cleaner conditional class logic.
- **Avoid Inline Styles**: Use classes for performance and maintainability.

---
