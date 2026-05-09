'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Play, Music, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Play, label: 'เล่นเพลง' },
  { href: '/admin', icon: Settings, label: 'จัดการ' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-xl transition-all duration-200 min-w-[72px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                isActive
                  ? 'bg-primary/15 scale-105'
                  : 'bg-transparent'
              )}>
                <item.icon className={cn('w-5 h-5 transition-all', isActive && 'drop-shadow-[0_0_6px_var(--primary)]')} />
              </div>
              <span className={cn('text-[10px] font-medium tracking-wide', isActive && 'text-primary')}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
