import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {products,collections} from '@/lib/catalog';
import {ProductGrid} from '@/components/Store';
import {SocialEditorialCollage} from '@/components/SocialEditorialCollage';
import {HeroCarousel} from '@/components/HeroCarousel';
import {CampaignImageSlider} from '@/components/CampaignImageSlider';

export const metadata: Metadata = {
  title: 'Hijabs & Modest Fashion India â€” Modestyinyou',
  description: 'Discover lightweight printed, solid, pashmina and jersey hijabs made for everyday comfort and style. Shop Modestyinyou â€” modest fashion crafted with love in India.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Modestyinyou â€” Hijabs & Modest Fashion India',
    description: 'Discover lightweight printed, solid, pashmina and jersey hijabs made for everyday comfort and style.',
    url: '/',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: 'Modestyinyou hijab collection' }],
  },
};

const featuredProducts = [
  products.find(p => p.categorySlug === 'fall-edit' && p.featured)!,
  ...products.filter(p => p.featured && p.categorySlug !== 'fall-edit').slice(0, 3),
].filter(Boolean);
const categoryHighlights = [
  { name: 'Printed Hijabs', description: 'Expressive prints and considered patterns.', slug: 'printed-hijabs', image: '/images/gulbahar_.jpg' },
  { name: 'Solid Hijabs', description: 'Timeless shades for effortless styling.', slug: 'solid-hijabs', image: '/images/71CEDEEE-78B1-4094-A2F6-9DB1D570704D.JPG' },
  { name: 'Pashmina Hijabs', description: 'Soft layers for an elegant drape.', slug: 'pashmina-hijabs', image: '/images/Gulkari.jpg' },
  { name: 'Printed Jersey Hijabs', description: 'Expressive prints in soft, easy-to-style jersey.', slug: 'lace-hijabs', image: '/images/coming-soon-1.jpg' },
  { name: 'Hijab Accessories', description: 'Thoughtful finishing touches for every style.', slug: 'hijab-accessories', image: '/images/coming-soon-1.jpg' }
];

const hijabQuestions = [
  {
    title: 'How Do I Style My Hijab?',
    answer: 'Looking for new ways to style your hijab? Weâ€™ve got you covered! Follow us on our social media platforms for styling inspiration, everyday looks, tutorials, and tips to help you make the most of your MIU hijabs.'
  },
  {
    title: 'Should I Choose Solid Colours or Printed Hijabs?',
    answer: 'The answer is simple: both have their own charm! Solid hijabs pair beautifully with printed or detailed outfits, while printed hijabs add personality to simple, solid-coloured looks. For more styling inspiration and outfit ideas, follow us on social media and stay updated with our latest looks.'
  },
  {
    title: 'Which Hijab Fabric Is Best for Everyday Wear?',
    answer: 'The best hijab is the one that makes you feel comfortable and confident. Whether you prefer the softness of jersey or the elegant feel of modal, choose a fabric that suits your lifestyle and personal style. At MIU, we believe comfort and modesty should always go hand in hand.'
  }
];

export default function Home() {
  return (
    <div className="home-page">
      <HeroCarousel />

      <section className="selector-section section" data-reveal>
        <div className="section-heading narrow">
          <span className="eyebrow">Find your signature</span>
        </div>
        <div className="circle-selector">
          {collections.filter((collection) => !collection.parentSlug && !collection.editorial).map((collection, index) => (
            <Link key={collection.slug} href={`/collections/${collection.slug}`} className="selector-item" style={{'--reveal-delay': `${index * 90}ms`} as React.CSSProperties}>
              <div className="selector-image-wrap">
                <Image src={collection.image} alt={collection.name} fill sizes="(max-width: 640px) 120px, 150px" style={{objectFit:'cover',objectPosition:'center top'}} />
              </div>
              <span>{collection.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="fall-edit" data-reveal aria-labelledby="fall-edit-title">
        <div className="fall-edit-layout">
          <div className="fall-edit-visual">
            <Image
              className="fall-edit-image"
              src="/images/fall-collection-launch.jpeg"
              alt="Autumn hijab collection editorial collage featuring warm patterned scarves and outdoor styling"
              fill
              loading="eager"
              sizes="(max-width: 640px) 88vw, (max-width: 900px) 44vw, 38vw"
            />
          </div>
          <div className="fall-edit-copy">
            <span className="eyebrow">A seasonal collection</span>
            <h2 id="fall-edit-title">The Fall Edit</h2>
            <p className="fall-edit-description">Discover the beauty of autumn through a palette of rich, earthy tones. From chocolate brown and espresso to warm mocha and every shade in between, each hijab is thoughtfully curated to complement your wardrobe and effortlessly elevate every outfit.</p>
            <Link className="button button-dark fall-edit-cta" href="/collections/fall-edit">Explore the Fall Edit</Link>
          </div>
        </div>
      </section>

      <section className="section product-showcase" data-reveal>
        <div className="section-heading">
          <h2 className="section-title">Thoughtfully Chosen</h2>
        </div>
        <ProductGrid items={featuredProducts} />
        <div className="cta-row">
          <Link className="button button-outline" href="/collections">View all products</Link>
        </div>
      </section>

      <section className="campaign-comparison section" data-reveal aria-labelledby="campaign-comparison-title">
        <div className="section-heading narrow">
          <span className="eyebrow">A closer look</span>
          <h2 id="campaign-comparison-title" className="section-title">More than a hijab</h2>
        </div>
        <CampaignImageSlider />
      </section>

      <section className="editorial-split" data-reveal>
        <div className="split-copy">
          <span className="eyebrow">Find your modest signature</span>
          <h2 className="satoshi-display-heading">Comfort, story and ease in every layer.</h2>
          <p>Explore mindful pieces designed to hold their place in your wardrobe â€” quiet, polished and made to be worn often.</p>
        </div>
        <div className="category-grid">
          {categoryHighlights.map((item) => (
            <Link key={item.slug} href={`/collections/${item.slug}`} className="category-card">
              <div className="category-image">
                <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 100vw, 18vw" />
              </div>
              <div className="category-copy">
                <h3>{item.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="campaign-banner" data-reveal>
        <div className="campaign-visual">
          <Image src="/images/leopard.jpg" alt="Model styling a leopard-print hijab" fill sizes="(max-width: 900px) 100vw, 55vw" />
        </div>
        <div className="campaign-copy">
          <span className="eyebrow">Curated modest fashion</span>
          <h2 className="satoshi-display-heading">Effortless, every day</h2>
          <p>Pieces designed to complement the way you dress, style and express yourself.</p>
          <Link className="button button-dark" href="/collections">Our collection</Link>
        </div>
      </section>

      <SocialEditorialCollage />

      <section className="journal-section section" data-reveal>
        <div className="section-heading narrow">
          <span className="eyebrow">Stories &amp; inspiration</span>
          <h2 className="section-title">The World of Modestyinyou</h2>
        </div>
        <div className="journal-grid journal-grid-single">
          <article className="journal-card journal-card-single">
            <span className="journal-kicker">Editorial</span>
            <div className="journal-questions">
              {hijabQuestions.map((question) => (
                <div className="journal-question" key={question.title}>
                  <h3 className={`journal-question-title${question.title === 'How Do I Style My Hijab?' || question.title === 'Should I Choose Solid Colours or Printed Hijabs?' || question.title === 'Which Hijab Fabric Is Best for Everyday Wear?' ? ' hijab-style-heading' : ''}`}>{question.title}</h3>
                  <p className="journal-question-answer">{question.answer}</p>
                </div>
              ))}
            </div>
            <Link href="/collections">Explore the collection</Link>
          </article>
        </div>
      </section>
    </div>
  );
}
