'use client'

import { useEffect } from 'react'

export function ThemeInitializer() {
  useEffect(() => {
    const stored = localStorage.getItem('music_bar_admin_theme')
    if (stored === 'light') {
      document.documentElement.classList.add('light-theme')
    } else {
      document.documentElement.classList.remove('light-theme')
    }
  }, [])

  return null
}
