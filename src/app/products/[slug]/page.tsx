import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, products } from '@/lib/catalog';
import ProductClient from './ProductClient';

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = getProduct(params.slug);
  if (!product) return { title: 'Product not found' };
  const price = (product.variants[0].pricePaise / 100).toFixed(0);
  const title = `${product.name} — ${product.category} | Buy Online India`;
  const description = `${product.description.slice(0, 148)}... Shop ${product.name} at ₹${price}. Free shipping available in India.`;
  return {
    title,
    description,
    alternates: { canonical: `/products/${params.slug}` },
    openGraph: {
      title,
      description,
      url: `/products/${params.slug}`,
      type: 'website',
      images: product.images.map((img, i) => ({ url: img, alt: i === 0 ? product.alt : `${product.name} view ${i + 1}` })),
    },
    twitter: { card: 'summary_large_image', title, description, images: [product.image] },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(img => `${siteUrl}${img}`),
    url: `${siteUrl}/products/${product.slug}`,
    brand: { '@type': 'Brand', name: 'Modestyinyou' },
    offers: product.variants.map(v => ({
      '@type': 'Offer',
      price: (v.pricePaise / 100).toFixed(2),
      priceCurrency: 'INR',
      availability: v.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Modestyinyou' },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductClient slug={params.slug} />
    </>
  );
}
