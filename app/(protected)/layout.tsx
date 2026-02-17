// Prevent static prerender so Convex env is only needed at request time
export const dynamic = 'force-dynamic'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

