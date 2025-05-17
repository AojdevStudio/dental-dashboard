export default function MetricsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <h1>Metrics</h1>
      <p>Metrics content goes here</p>
      {children}
    </div>
  );
}
