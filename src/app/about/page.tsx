import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata:Metadata={title:'Our Story â€” Nahid Warsi, Founder of Modestyinyou',description:'Learn how Modestyinyou began â€” a personal hijab journey in 2021 that became a mission to make modest fashion comfortable, beautiful and effortless for every hijabi in India.',alternates:{canonical:'/about'},openGraph:{title:'Our Story | Modestyinyou',description:'How a personal hijab journey became a modest fashion brand built for every hijabi in India.',url:'/about'}};

export default function About() {
  return (
    <article className="page-shell about-page">
      <p className="breadcrumbs"><Link href="/">Home</Link> / Our story</p>

      {/* â”€â”€ Hero intro â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="story-introduction" aria-labelledby="story-title">
        <div className="story-introduction-copy">
          <p className="eyebrow">Our story</p>
          <h1 className="page-title" id="story-title">It began with a feeling.</h1>
          <p className="story-lead">
            What if wearing a hijab could feel as beautiful and comfortable as it feels meaningful?
          </p>
          <p>
            My hijab journey began in 2021. It was a beautiful and deeply personal change in my life,
            one that brought me closer to my faith. But along the way, I also faced struggles that
            many hijabi girls can relate to.
          </p>
          <p>
            The heavy fabrics, the summer heat, the sweat, and the discomfort of wearing a hijab for
            long hours made me wonder why something so meaningful had to feel so difficult sometimes.
          </p>
        </div>
        <figure className="story-portrait">
          <Image
            src="/images/story-naqs-e-gul.jpg"
            alt="A campaign portrait featuring a model in a soft pink hijab"
            fill
            priority
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 48vw, 560px"
          />
          <figcaption className="story-founder">
            <span>Nahid Warsi</span>
            Founder, Modestyinyou
          </figcaption>
        </figure>
      </section>


      {/* â”€â”€ What we believe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="story-philosophy" aria-labelledby="story-philosophy-title">
        <div className="story-philosophy-heading">
          <p className="eyebrow">What we believe</p>
          <h2 className="section-title" id="story-philosophy-title">
            Modesty is personal.<br />Comfort should be, too.
          </h2>
        </div>
        <div className="story-philosophy-copy">
          <p>
            Modesty is more than a fashion choice. It&apos;s part of our identity, connected to our faith,
            our values, and who we are. We believe that journey deserves to feel beautiful in
            everyday life.
          </p>
          <p>
            You shouldn&apos;t have to give up your personal style to feel comfortable, or compromise on
            the coverage that matters to you. Whether you love colour, keep things simple, or need a
            little more ease from morning to evening â€” you deserve pieces that fit naturally into
            your life.
          </p>
          <p>
            That&apos;s why every piece we create is inspired by the same thought that started it all:
            to make modesty feel effortless, without losing the beauty of it. This brand began with
            something I needed, but the dream has always been bigger than me. It&apos;s about every
            hijabi feeling understood, confident, and beautiful in her own way.
          </p>
        </div>
      </section>

      {/* â”€â”€ Pull quote â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <blockquote className="story-quote">
        <p>Modesty is your identity, and your comfort matters.</p>
        <cite>Modestyinyou</cite>
      </blockquote>

      {/* â”€â”€ Closing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="story-closing" aria-labelledby="story-closing-title">
        <p className="eyebrow">A little thought, shared with you</p>
        <h2 className="section-title" id="story-closing-title">Welcome to Modestyinyou.</h2>
        <p>We&apos;re glad you&apos;re here. Find something that feels like you.</p>
        <Link className="button button-dark story-shopping-link" href="/collections">
          Explore the collection
        </Link>
        <p className="story-contact">
          Have a question or an idea to share?{' '}
          <Link className="text-link" href="/contact">We&apos;d love to hear from you.</Link>
        </p>
      </section>
    </article>
  );
}
