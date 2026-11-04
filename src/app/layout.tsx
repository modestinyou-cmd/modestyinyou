import type {Metadata} from 'next'; import type {Viewport} from 'next'; import './globals.css'; import {CartProvider,SiteHeader,SiteFooter,MotionObserver,PageTransition} from '@/components/Store';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata:Metadata={
  metadataBase: new URL(siteUrl),
  title: { default: 'Modestyinyou â€” Hijabs & Modest Fashion India', template: '%s | Modestyinyou' },
  description: 'Shop lightweight, comfortable hijabs and modest fashion in India. Printed, solid, pashmina and jersey hijabs crafted for everyday wear. Free shipping available.',
  keywords: ['hijab','hijabs India','modest fashion India','printed hijab','pashmina hijab','solid hijab','buy hijab online India','Modestyinyou','modest wear','hijab shop'],
  authors: [{ name: 'Modestyinyou' }],
  creator: 'Modestyinyou',
  publisher: 'Modestyinyou',
  category: 'fashion',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Modestyinyou',
    title: 'Modestyinyou â€” Hijabs & Modest Fashion India',
    description: 'Lightweight, comfortable hijabs and modest fashion crafted for everyday wear in India.',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: 'Modestyinyou â€” Hijabs & Modest Fashion India' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modestyinyou â€” Hijabs & Modest Fashion India',
    description: 'Lightweight, comfortable hijabs and modest fashion crafted for everyday wear in India.',
    images: ['/images/og-default.jpg'],
  },
  alternates: { canonical: siteUrl },
  icons: { icon: '/images/navbar-monogram.png', apple: '/images/navbar-monogram.png' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
};
export const viewport:Viewport={width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Modestyinyou',
    url: siteUrl,
    logo: `${siteUrl}/images/logo-main.png`,
    description: 'Lightweight, comfortable hijabs and modest fashion crafted for everyday wear in India.',
    contactPoint: { '@type': 'ContactPoint', email: 'modestinyou@gmail.com', contactType: 'customer service' },
    sameAs: [],
  };
  return <html lang="en"><head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/></head><body><CartProvider><MotionObserver/><SiteHeader/><main>{children}</main><SiteFooter/></CartProvider></body></html>;
}
