import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        }}
      >
        <div
          style={{
            width: '50%',
            height: '65%',
            background: 'white',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            gap: '12px',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '100%', height: '4px', background: '#2563eb', borderRadius: '2px' }} />
          <div style={{ width: '100%', height: '4px', background: '#2563eb', borderRadius: '2px' }} />
          <div style={{ width: '100%', height: '4px', background: '#2563eb', borderRadius: '2px' }} />
          <div style={{ width: '100%', height: '4px', background: '#2563eb', borderRadius: '2px' }} />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
