export default function ProvidersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <h1>Providers</h1>
      <p>Providers content goes here</p>
      {children}
    </div>
  );
}
