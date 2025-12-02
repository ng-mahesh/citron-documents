import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2563eb',
          borderRadius: '50%',
        }}
      >
        <svg
          width="20"
          height="24"
          viewBox="0 0 14 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0" y="3" width="14" height="17" fill="white" rx="1" />
          <path d="M 11 0 L 14 3 L 11 3 Z" fill="#93c5fd" />
          <path
            d="M 0 3 L 11 3 L 11 0 L 1 0 C 0.45 0 0 0.45 0 1 Z"
            fill="white"
          />
          <line
            x1="3"
            y1="8"
            x2="11"
            y2="8"
            stroke="#2563eb"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="3"
            y1="11"
            x2="11"
            y2="11"
            stroke="#2563eb"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="3"
            y1="14"
            x2="8"
            y2="14"
            stroke="#2563eb"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
