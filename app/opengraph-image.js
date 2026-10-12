import { ImageResponse } from 'next/og';
export const alt = 'ToursTaxi - Sawai Madhopur taxis and Rajasthan tours';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', padding: 80, background: '#12233f', color: 'white' }}>
      <div style={{ display: 'flex', color: '#5eead4', fontSize: 76, fontWeight: 700 }}>ToursTaxi</div>
      <div style={{ display: 'flex', marginTop: 28, fontSize: 48 }}>Your Rajasthan journey starts here</div>
      <div style={{ display: 'flex', marginTop: 30, fontSize: 28, color: '#cbd5e1' }}>Sawai Madhopur ? Ranthambore ? Jaipur</div>
      <div style={{ display: 'flex', marginTop: 18, fontSize: 26, color: '#fbbf24' }}>Taxi bookings ? Airport transfers ? Tour packages</div>
    </div>, size
  );
}
