import Image from 'next/image';

const socialLinks = [
  { name: 'Instagram', href: 'https://www.instagram.com/Modestyinyou1?cplk=MWdtOWU2NWpxcWN3cg%3D%3D&utm_source=qr' },
  { name: 'Pinterest', href: 'https://pin.it/4iJrD8C0v' },
  { name: 'WhatsApp', href: process.env.NEXT_PUBLIC_WHATSAPP_URL }
].filter((link): link is { name: string; href: string } => Boolean(link.href));

const collageImages = [
  {
    src: '/images/Gulkari.jpg',
    alt: 'Burgundy floral hijab styled with a black outfit',
    className: 'social-card social-card-left'
  },
  {
    src: '/images/Naqs-e-GUL.jpg',
    alt: 'Red patterned hijab styled in a close-up portrait',
    className: 'social-card social-card-center'
  },
  {
    src: '/images/Gulbahar.jpg',
    alt: 'Pink floral hijab styled as a flowing, full-coverage look',
    className: 'social-card social-card-right'
  }
];

export function SocialEditorialCollage() {
  return (
    <section className="social-editorial" data-reveal aria-labelledby="social-editorial-title">
      <span className="social-editorial-backdrop" aria-hidden="true">Modestyinyou</span>
      <div className="social-editorial-stage" role="group" aria-label="Modestyinyou style portraits">
        {collageImages.map((image, index) => (
          <div
            key={image.src}
            className={image.className}
            style={{ '--social-stagger': `${index * 130}ms` } as React.CSSProperties}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 58vw, (max-width: 900px) 34vw, 300px"
            />
          </div>
        ))}
      </div>
      <div className="social-editorial-copy">
        <span className="eyebrow">A little inspiration, every day</span>
        <h2 id="social-editorial-title">Follow Our Journey</h2>
        <p>Discover everyday styling inspiration, new collections and a closer look at the world of Modestyinyou.</p>
        <nav className="social-editorial-links" aria-label="Follow Modestyinyou">
          {socialLinks.map((link) => (
            <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.name}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
