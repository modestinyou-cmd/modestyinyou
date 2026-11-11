export type Variant = { id: string; sku: string; color: string; hex: string; pricePaise: number; stock: number };
export type Product = {
  id: string; slug: string; name: string; category: string; categorySlug: string;
  description: string; image: string; images: string[]; alt: string;
  material?: string; care?: string; variants: Variant[]; featured?: boolean; demo?: boolean;
};
export type Collection = { name: string; slug: string; image: string; description: string; parentSlug?: string; editorial?: boolean };

export const products: Product[] = [

  // ── Printed Hijabs ───────────────────────────────────────────────────────────
  {
    id: 'p-naqs-e-gul', slug: 'naqs-e-gul', name: 'Naqsh-e-Gul', category: 'Printed Hijabs', categorySlug: 'printed-hijabs',
    description: 'Inspired by the timeless beauty of floral artistry, Naqsh-e-Gul tells a story of heritage, grace, and elegance. Every flower, flowing vine, and delicate detail is thoughtfully designed to celebrate traditional artistry while embracing a modern aesthetic. A beautiful blend of tradition and contemporary design, created for the woman who finds beauty in every detail. Tradition, beautifully reimagined for today.',
    image: '/images/Naqs-e-GUL.jpg',
    images: ['/images/Naqs-e-GUL.jpg', '/images/Naqs-e-gul 2.jpg', '/images/Naqs-e-gul-1.jpg'],
    alt: 'Naqsh-e-Gul printed hijab', featured: true,
    variants: [{ id: 'v-naqs-1', sku: 'MIU-NAQS-01', color: 'Floral', hex: '#B89A7A', pricePaise: 99900, stock: 10 }],
  },
  {
    id: 'p-gulkari', slug: 'gulkari', name: 'Gulkari', category: 'Printed Hijabs', categorySlug: 'printed-hijabs',
    description: 'Inspired by the beauty of historic tombs, intricate calligraphy, delicate floral patterns, and the rich colours of heritage architecture, Gulkari brings the charm of the past into the present. Every detail reflects the beauty of traditional artistry, created for those who love the old-world aesthetic with a modern touch. A timeless design that carries the elegance of history into your everyday style.',
    image: '/images/Gulkari.jpg',
    images: ['/images/Gulkari.jpg', '/images/gulkari  Hijab.jpg', '/images/gulkari closeup.jpg'],
    alt: 'Gulkari printed hijab', featured: true,
    variants: [{ id: 'v-gulkari-1', sku: 'MIU-GULKARI-01', color: 'Embroidered', hex: '#8B6F5E', pricePaise: 99900, stock: 10 }],
  },
  {
    id: 'p-leopard', slug: 'leopard-print', name: 'Leopard', category: 'Printed Hijabs', categorySlug: 'printed-hijabs',
    description: 'Inspired by the classic leopard pattern, this hijab adds a bold touch to your everyday look. Its unique print is perfect for those who love trying something different while keeping their style simple and elegant.',
    image: '/images/leopard.jpg',
    images: ['/images/leopard.jpg', '/images/leopard HIJAB.jpg', '/images/leopard-1.jpg'],
    alt: 'Leopard print hijab', featured: true,
    variants: [{ id: 'v-leopard-1', sku: 'MIU-LEOPARD-01', color: 'Leopard', hex: '#A0784A', pricePaise: 99900, stock: 10 }],
  },
  {
    id: 'p-gulbahar', slug: 'gulbahar', name: 'Gulbahar', category: 'Printed Hijabs', categorySlug: 'printed-hijabs',
    description: 'Gulbahar brings the beauty of nature into every fold. Every petal, every leaf, and every little detail comes together to create a design that feels soft, elegant, and timeless. Because some girls don\'t just love flowers — they love wearing them.',
    image: '/images/Gulbahar.jpg',
    images: ['/images/Gulbahar.jpg', '/images/gulbahar_.jpg', '/images/gulbahr (1).jpg'],
    alt: 'Gulbahar printed hijab', featured: true,
    variants: [{ id: 'v-gulbahar-1', sku: 'MIU-GULBAHAR-01', color: 'Floral', hex: '#C4A882', pricePaise: 99900, stock: 10 }],
  },
  {
    id: 'p-sunset', slug: 'sunset', name: 'Sunset Grid', category: 'Printed Hijabs', categorySlug: 'printed-hijabs',
    description: 'Inspired by the warm colours of sunset and a classic grid pattern.',
    image: '/images/sunset.jpg',
    images: ['/images/sunset.jpg', '/images/sunset Grid.jpg'],
    alt: 'Sunset Grid printed hijab',
    variants: [{ id: 'v-sunset-1', sku: 'MIU-SUNSET-01', color: 'Sunset', hex: '#C4784A', pricePaise: 79900, stock: 10 }],
  },

  // ── Fall Edit ────────────────────────────────────────────────────────────────
  {
    id: 'p-brown-plaid', slug: 'brown-plaid', name: 'Espresso Plaid', category: 'The Fall Edit', categorySlug: 'fall-edit',
    description: 'A mix of brown tones and classic plaid patterns, inspired by the warm colours of autumn. Perfect for pairing with cozy knits, neutral outfits, and your favourite fall looks. A must-have for girls who love a classic style with a modern touch.',
    image: '/images/Brown plaid 1.JPG',
    images: ['/images/Brown plaid 1.JPG', '/images/Brown plaid 2.JPG', '/images/Brown plaid 3.JPG'],
    alt: 'Espresso Plaid hijab', featured: true,
    variants: [{ id: 'v-plaid-1', sku: 'MIU-PLAID-01', color: 'Brown Plaid', hex: '#7A5C3E', pricePaise: 99900, stock: 10 }],
  },
  {
    id: 'p-brown-polka', slug: 'brown-polka-dot', name: 'Brown Polka Dot', category: 'The Fall Edit', categorySlug: 'fall-edit',
    description: 'A classic polka dot design with a beautiful mix of brown and beige. Made from our signature modal fabric, this hijab is soft, lightweight, and easy to style. Perfect for everyday wear or when you want to add a little detail to your outfit.',
    image: '/images/Brown polka dot.JPG',
    images: ['/images/Brown polka dot.JPG', '/images/Brown polka dot 2.JPG', '/images/Brown polka dot 3.JPG', '/images/Brown polka dot 4.JPG'],
    alt: 'Brown Polka Dot hijab', featured: true,
    variants: [{ id: 'v-polka-1', sku: 'MIU-POLKA-01', color: 'Brown Polka', hex: '#8B6347', pricePaise: 99900, stock: 10 }],
  },

  // ── Solid Hijabs ─────────────────────────────────────────────────────────────
  {
    id: 'p-solid-black', slug: 'jet-black', name: 'Jet Black', category: 'Solid Hijabs', categorySlug: 'solid-hijabs',
    description: 'Our classic jet-black solid hijab is the perfect everyday staple, effortlessly complementing every outfit and occasion. Simple, versatile, and endlessly elegant, it\'s the one hijab every wardrobe needs.',
    image: '/images/71CEDEEE-78B1-4094-A2F6-9DB1D570704D.JPG',
    images: ['/images/71CEDEEE-78B1-4094-A2F6-9DB1D570704D.JPG', '/images/31250DDC-E1C1-45A5-B9EB-ACB6B9FDF24E.JPG', '/images/3E4B2E43-1D1C-4F7E-90E6-2855ADE6DD75.JPG'],
    alt: 'Jet Black solid hijab', featured: true,
    variants: [{ id: 'v-black-1', sku: 'MIU-BLACK-01', color: 'Jet Black', hex: '#1a1a1a', pricePaise: 59900, stock: 10 }],
  },
];

export const collections: Collection[] = [
  { name: 'The Fall Edit', slug: 'fall-edit', image: '/images/Brown plaid 1.JPG', description: '', editorial: true },
  { name: 'Printed Hijabs', slug: 'printed-hijabs', image: '/images/gulbahar_.jpg', description: '' },
  { name: 'Solid Hijabs', slug: 'solid-hijabs', image: '/images/71CEDEEE-78B1-4094-A2F6-9DB1D570704D.JPG', description: '' },
  { name: 'Pashmina Hijabs', slug: 'pashmina-hijabs', image: '/images/Gulkari.jpg', description: '' },
  { name: 'Printed Jersey Hijabs', slug: 'lace-hijabs', image: '/images/coming-soon-1.jpg', description: '' },
  { name: 'Hijab Accessories', slug: 'hijab-accessories', image: '/images/coming-soon-1.jpg', description: '' },
  { name: 'Magnet Pins', slug: 'magnet-pins', parentSlug: 'hijab-accessories', image: '/images/coming-soon-1.jpg', description: 'A secure, pin-free way to style your hijab.' },
  { name: 'Hijab Pins', slug: 'hijab-pins', parentSlug: 'hijab-accessories', image: '/images/coming-soon-1.jpg', description: 'Everyday essentials for a polished drape.' },
  { name: 'Undercaps', slug: 'undercaps', parentSlug: 'hijab-accessories', image: '/images/coming-soon-1.jpg', description: 'Comfortable foundations for easy styling.' },
];

export const formatINR = (paise: number) => 'INR ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(paise / 100);
export function getProduct(slug: string) { return products.find(p => p.slug === slug); }
