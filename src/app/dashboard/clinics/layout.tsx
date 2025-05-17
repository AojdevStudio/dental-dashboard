// - src/styles/: All styling concerns including global CSS, themes, and component styles
// - src/components/: Reusable React components, organized by domain and function
//- src/hooks/: Custom React hooks, organized by domain and function
//- src/lib/: Utility functions, organized by domain and function
//- src/types/: Type definitions, organized by domain and function
//- src/utils/: Utility functions, organized by domain and function
//- src/hooks/: Custom React hooks, organized by domain and function
//- src/lib/: Utility functions, organized by domain and function
//- src/types/: Type definitions, organized by domain and function
//- src/utils/: Utility functions, organized by domain and function
export default function ClinicsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <h1>Clinics</h1>
      <p>Clinics content goes here</p>
      {children}
    </div>
  );
}
