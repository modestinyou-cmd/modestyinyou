import type {Metadata} from 'next';import Link from 'next/link';import {notFound} from 'next/navigation';import Image from 'next/image';import {collections,products} from '@/lib/catalog';import {ProductGrid} from '@/components/Store';
export function generateStaticParams(){return collections.map(c=>({slug:c.slug}))}
export async function generateMetadata({params}:{params:{slug:string}}):Promise<Metadata>{
  const collection=collections.find(c=>c.slug===params.slug);
  if(!collection) return {title:'Collection not found'};
  const title=`${collection.name} — Buy Online India`;
  const description=`Shop ${collection.name} at Modestyinyou. ${collection.description} Lightweight, comfortable hijabs crafted for everyday modest styling in India.`;
  return {
    title,
    description,
    alternates:{canonical:`/collections/${params.slug}`},
    openGraph:{title,description,url:`/collections/${params.slug}`,images:[{url:collection.image,alt:collection.name}]},
  };
}
export default function CollectionPage({params}:{params:{slug:string}}){
  const{slug}=params;
  const collection=collections.find(item=>item.slug===slug);
  if(!collection)notFound();
  const parent=collection.parentSlug?collections.find(item=>item.slug===collection.parentSlug):undefined;
  const subcategories=collections.filter(item=>item.parentSlug===slug);
  const childSlugs=subcategories.map(item=>item.slug);
  const items=products.filter(product=>product.categorySlug===slug||(childSlugs.length>0&&childSlugs.includes(product.categorySlug)));
  return <div className="page-shell collection-page">
    <p className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/collections">Our collection</Link> / {parent&&<><Link href={`/collections/${parent.slug}`}>{parent.name}</Link> / </>}{collection.name}</p>
    <div className="collection-hero">
      <Image src={collection.image} alt="" fill sizes="100vw" priority/>
      <div className="collection-copy"><h3>{collection.name}</h3><span>{collection.description}</span></div>
    </div>
    <h1 className="page-title">{collection.name}</h1>
    <p className="page-intro">{collection.description}</p>
    {subcategories.length>0&&<nav className="collection-subcategories" aria-label={`${collection.name} subcategories`}>
      {subcategories.map(subcategory=><Link key={subcategory.slug} href={`/collections/${subcategory.slug}`} className="button button-outline">{subcategory.name}</Link>)}
    </nav>}
    <ProductGrid items={items}/>
  </div>;
}
