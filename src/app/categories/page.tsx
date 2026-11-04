import Image from 'next/image';
import Link from 'next/link';
import {collections} from '@/lib/catalog';

export const metadata = {
  title: 'Shop Hijab Categories â€” Modestyinyou',
  description: 'Browse hijab categories by style, fabric and accessory.',
};

export default function CategoriesPage() {
  const categories = collections.filter(collection => !collection.parentSlug && !collection.editorial);
  const accessories = collections.find(collection => collection.slug === 'hijab-accessories');
  const accessoryCategories = collections.filter(collection => collection.parentSlug === 'hijab-accessories');

  return (
    <main className="page-shell categories-page">
      <span className="eyebrow">Browse by style</span>
      <h1 className="page-title">Categories</h1>
      <p className="page-intro">Find the perfect hijab for the way you dress, every day.</p>

      <div className="categories-page-grid">
        {categories.filter(collection => collection.slug !== 'hijab-accessories').map(collection => (
          <Link key={collection.slug} href={`/collections/${collection.slug}`} className="categories-page-card">
            <div className="categories-page-image">
              <Image src={collection.image} alt={collection.name} fill sizes="(max-width: 640px) 50vw, 25vw" />
            </div>
            <span>{collection.name}</span>
          </Link>
        ))}
      </div>

      {accessories && (
        <section className="categories-accessories" aria-labelledby="categories-accessories-title">
          <h2 id="categories-accessories-title">Accessories</h2>
          <div className="categories-page-grid categories-page-grid-accessories">
            {accessoryCategories.map(collection => (
              <Link key={collection.slug} href={`/collections/${collection.slug}`} className="categories-page-card">
                <div className="categories-page-image">
                  <Image src={collection.image} alt={collection.name} fill sizes="(max-width: 640px) 50vw, 25vw" />
                </div>
                <span>{collection.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
