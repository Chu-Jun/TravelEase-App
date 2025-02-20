export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-8 mb-8 lg:px-16 lg:py-8 text-primary">{children}</div>
  );
}
