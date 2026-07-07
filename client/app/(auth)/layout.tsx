export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-start md:items-center justify-center p-4 md:p-8 pt-6 md:pt-8">
      {children}
    </div>
  )
}
