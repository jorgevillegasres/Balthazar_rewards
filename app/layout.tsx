import type { Metadata, Viewport } from 'next';
import './fonts.css';
import './globals.css';
import './console.css';
export const metadata: Metadata = {title:'Balthazar · Asistente personal',description:'Asistente personal de Jorge. Misiones, enfoque y recompensas en un espacio propio.',appleWebApp:{capable:true,title:'Balthazar',statusBarStyle:'black'},icons:{icon:'/favicon.svg',apple:'/icon-180.png'}};
export const viewport: Viewport={width:'device-width',initialScale:1,themeColor:'#0b0a0f'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><head><link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials"/></head><body>{children}</body></html>}
