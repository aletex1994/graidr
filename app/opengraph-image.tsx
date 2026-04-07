import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'graidr — automatic code quality scores'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo box */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '28px',
            width: '160px',
            height: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginBottom: '48px',
          }}
        >
          <span
            style={{
              fontSize: '120px',
              fontWeight: 900,
              color: '#09090b',
              lineHeight: 1,
              marginTop: '16px',
            }}
          >
            g
          </span>
          {/* Orange dot */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '20px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: '#fb923c',
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-2px',
            marginBottom: '16px',
          }}
        >
          graidr
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            color: '#71717a',
            textAlign: 'center',
          }}
        >
          Automatic code quality scores for every push
        </div>
      </div>
    ),
    size
  )
}
