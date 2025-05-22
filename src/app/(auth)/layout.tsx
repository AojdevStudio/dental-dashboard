/**
 * Auth Layout Component
 *
 * This layout component wraps all pages within the (auth) route group,
 * such as login and registration pages. It can provide a consistent
 * structure or styling for authentication-related screens.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The page content (e.g., Login page, Register page)
 * @returns {JSX.Element} The layout structure for authentication pages
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      {children}
    </div>
  );
}
