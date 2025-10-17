// TODO: Implement proper auth layout for authentication-related pages
// This layout is currently a passthrough but could be enhanced to provide:
// - Shared auth context/provider for auth pages (login, register, password reset, etc.)
// - Consistent styling/layout for auth pages
// - Auth state management across auth flows
// - Redirect logic for already authenticated users
//
// Currently unused - consider removing if no auth pages beyond login are planned,
// or implement the above features if expanding auth functionality.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
