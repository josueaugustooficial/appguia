import BottomNav from '@/components/layouts/BottomNav'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-deep)' }}>
      <main className="page-with-nav container-app">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
