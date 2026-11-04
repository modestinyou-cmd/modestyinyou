'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const slideCount = 3;

const slides = [
  {
    images: [
      { src: '/images/C83CC959-03E8-4BCB-9203-F29EEAA6A21C.JPG', alt: 'Fall collection look one', pos: 'center 20%' },
      { src: '/images/65747338-F3AD-4EF6-A1D4-899A9AA6E339.JPG', alt: 'Fall collection look two', pos: 'center 15%' },
    ],
    eyebrow: 'Fall Collection',
    heading: 'Fall ready look starts with\nperfect hijab',
    cta: { label: 'Explore Fall Collection', href: '/collections/fall-edit' },
  },
  {
    images: [
      { src: '/images/Brown plaid 1.JPG', alt: 'Brown plaid hijab', pos: 'center 18%' },
      { src: '/images/Brown polka dot 3.JPG', alt: 'Brown polka dot hijab', pos: 'center 18%' },
    ],
    eyebrow: null,
    heading: 'From my wardrobe\nto yours',
    cta: { label: 'Explore Collection', href: '/collections' },
  },
  {
    images: [
      { src: '/images/Naqs-e-gul 2.jpg', alt: 'Naqs-e-gul printed hijab', pos: 'center 20%' },
      { src: '/images/Gulkari.jpg', alt: 'Gulkari hijab', pos: 'center 15%' },
    ],
    eyebrow: null,
    heading: 'Pashmina modal hijab',
    cta: { label: 'Explore Collection', href: '/collections' },
  },
];

export function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = window.setInterval(() => {
      setActiveSlide((c) => (c + 1) % slideCount);
    }, 7000);
    return () => window.clearInterval(interval);
  }, [activeSlide, isPaused]);

  return (
    <section
      className="hero hero-carousel"
      data-reveal
      aria-label="Featured collections"
      aria-roledescription="carousel"
      style={{ background: '#1a1410' }}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`hero-slide${activeSlide === i ? ' is-active' : ''}`}
          role="group"
          aria-hidden={activeSlide !== i}
          aria-label={`${i + 1} of ${slideCount}`}
          aria-roledescription="slide"
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Two images side by side */}
          <div className="hero-slide-copy" style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
          }}>
            {slide.images.map((img, j) => (
              <div key={j} style={{ position: 'relative', overflow: 'hidden' }}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="50vw"
                  priority={i === 0}
                  unoptimized
                  style={{ objectFit: 'cover', objectPosition: img.pos }}
                />
              </div>
            ))}
          </div>

          {/* Thin centre divider */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 2,
            background: 'rgba(255,255,255,0.18)',
            zIndex: 2,
            transform: 'translateX(-50%)',
          }} />

          {/* Gradient overlay — heavier at bottom for legibility */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(20,16,12,0.08) 0%, rgba(20,16,12,0.12) 40%, rgba(20,16,12,0.72) 78%, rgba(20,16,12,0.88) 100%)',
            zIndex: 3,
          }} />

          {/* Eyebrow — top of slide */}
          {slide.eyebrow && (
            <div style={{
              position: 'absolute',
              top: '28%',
              left: 0,
              right: 0,
              zIndex: 4,
              textAlign: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.82)',
                display: 'inline-block',
                fontWeight: 900,
              }}>
                {slide.eyebrow}
              </span>
            </div>
          )}

          {/* Copy — centred at bottom */}
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            padding: '0 24px',
            textAlign: 'center',
            color: '#fff',
          }}>
            {slide.heading && (
              <h1 style={{
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                fontSize: 'clamp(28px, 4vw, 52px)',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                color: '#fff',
                whiteSpace: 'pre-line',
              }}>
                {slide.heading.split('\n').map((line, lineIndex) => (
                  <span
                    key={line}
                    style={{ display: 'block', whiteSpace: line === 'perfect hijab' ? 'nowrap' : 'normal' }}
                  >
                    {line}
                  </span>
                ))}
              </h1>
            )}
            <Link
              className="button"
              href={slide.cta.href}
              style={{
                marginTop: slide.heading ? 8 : 0,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.75)',
                color: '#fff',
                borderRadius: 999,
                minHeight: 36,
                padding: '0 20px',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                backdropFilter: 'blur(6px)',
                transition: 'background 0.2s, border-color 0.2s',
              }}
            >
              {slide.cta.label}
            </Link>
          </div>
        </div>
      ))}

      {/* Carousel controls */}
      <div className="hero-carousel-controls" role="group" aria-label="Carousel controls">
        <button type="button" onClick={() => setActiveSlide((c) => (c - 1 + slideCount) % slideCount)} aria-label="Previous slide">‹</button>
        {Array.from({ length: slideCount }, (_, index) => (
          <button
            key={index}
            type="button"
            className={`hero-carousel-dot${activeSlide === index ? ' is-active' : ''}`}
            onClick={() => setActiveSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={activeSlide === index ? 'true' : undefined}
          />
        ))}
        <button type="button" onClick={() => setActiveSlide((c) => (c + 1) % slideCount)} aria-label="Next slide">›</button>
        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
          aria-pressed={isPaused}
        >
          {isPaused ? 'Play' : 'Pause'}
        </button>
      </div>
    </section>
  );
}
