'use client'
import Image from 'next/image'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon' | 'text'
}

const sizes = {
  sm: { width: 80, height: 24 },
  md: { width: 120, height: 36 },
  lg: { width: 160, height: 48 },
}

export function Logo({ size = 'md', variant = 'full' }: LogoProps) {
  if (variant === 'icon') {
    return <Image src="/favicon.svg" alt="graidr" width={32} height={32} />
  }

  if (variant === 'text') {
    const fontSizes = { sm: '1rem', md: '1.25rem', lg: '1.75rem' }
    return (
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: fontSizes[size], letterSpacing: '-0.05em', color: '#ffffff' }}>
        grai<span style={{ color: '#7F77DD' }}>i</span>dr
      </span>
    )
  }

  return (
    <Image
      src="/logo.svg"
      alt="graidr"
      width={sizes[size].width}
      height={sizes[size].height}
    />
  )
}
