import { SystemChrome } from '@/components/system-chrome'

export default function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SystemChrome>{children}</SystemChrome>
  )
}
