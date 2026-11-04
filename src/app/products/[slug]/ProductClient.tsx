'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProduct, products, formatINR } from '@/lib/catalog';
import { AddToCart, ProductGrid } from '@/components/Store';
import { WishlistToggle } from '@/components/AccountForms';

export default function ProductClient({ slug }: { slug: string }) {
  const product = getProduct(slug);
  const router = useRouter();
  const [variantId, setVariant] = useState(product?.variants[0]?.id ?? '');
  const [activeImg, setActiveImg] = useState(0);

  if (!product) return (
    <div className="page-shell">
      <h1>Piece not found</h1>
      <Link href="/collections">Browse all pieces</Link>
    </div>
  );

  const variant = product.variants.find(v => v.id === variantId) ?? product.variants[0];
  const images = product.images?.length ? product.images : [product.image];

  return (
    <div className="page-shell">
      <p className="breadcrumbs">
        <button onClick={() => router.back()} style={{background:'none',border:0,padding:0,cursor:'pointer',color:'inherit',fontSize:'inherit'}}>← Back</button> / <Link href={`/collections/${product.categorySlug}`}>{product.category}</Link> / {product.name}
      </p>
      <div className="product-detail" data-reveal>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ position: 'relative', aspectRatio: '4/5', background: 'var(--ivory)', overflow: 'hidden', borderRadius: 4 }}>
            <Image src={images[activeImg]} alt={product.alt} fill priority sizes="(max-width:700px) 100vw, 55vw" style={{ objectFit: 'cover', objectPosition: 'center top', transition: 'opacity 0.3s ease' }} />
          </div>
          {images.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${images.length}, 1fr)`, gap: 8 }}>
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', border: 'none', outline: activeImg === i ? '2px solid var(--espresso)' : '2px solid transparent', outlineOffset: 2, cursor: 'pointer', background: 'var(--ivory)', borderRadius: 3, padding: 0 }} aria-label={`View image ${i + 1}`}>
                  <Image src={src} alt="" fill sizes="20vw" style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-info" data-reveal style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="detail-price">{formatINR(variant.pricePaise)}</div>
          <p>{product.description}</p>
          <span className="eyebrow">Colour · {variant.color}</span>
          <div className="variant-list">
            {product.variants.map(v => (
              <button key={v.id} className={`variant-option${v.id === variantId ? ' selected' : ''}`} onClick={() => setVariant(v.id)} aria-pressed={v.id === variantId}>
                <span className="swatch" style={{ backgroundColor: v.hex }} />{v.color}
              </button>
            ))}
          </div>
          <div className="stock">{variant.stock > 0 ? 'In stock' : 'Currently out of stock'}</div>
          <AddToCart product={product} variantId={variant.id} />
          <WishlistToggle slug={product.slug} />
          <div className="accordions">
            <details open><summary>Details</summary><p>{product.description}</p></details>
            <details open><summary>Materials</summary><ul style={{margin:'8px 0',paddingLeft:18,fontSize:12,lineHeight:1.9}}><li>Scarf — 100% Premium Modal with Single Stitch Edge</li><li>Transparency — Non-sheer</li><li>Standard size: 70 × 30</li></ul></details>
            <details><summary>Care</summary><p>{product.care ?? 'Hand wash cold. Do not tumble dry. Iron on low heat.'}</p></details>
            <details><summary>Shipping &amp; returns</summary><p>Shipping options and return eligibility are confirmed during checkout. See our <Link className="text-link" href="/shipping-returns">shipping &amp; returns information</Link>.</p></details>
          </div>
        </div>
      </div>
      <section className="section" data-reveal>
        <div className="section-heading">
          <span className="eyebrow">Keep exploring</span>
          <h2 className="section-title">You may also like</h2>
        </div>
        <ProductGrid items={products.filter(p => p.id !== product.id).slice(0, 4)} />
      </section>
    </div>
  );
}
