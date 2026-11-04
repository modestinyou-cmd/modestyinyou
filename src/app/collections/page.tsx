'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {collections,products} from '@/lib/catalog';
import {ProductGrid} from '@/components/Store';

export default function Collections(){
  const[q,setQ]=useState('');
  const[sort,setSort]=useState('featured');
  const list=useMemo(()=>{
    const filtered=products.filter(p=>`${p.name} ${p.category}`.toLowerCase().includes(q.toLowerCase()));
    if(sort==='low')return [...filtered].sort((x,y)=>x.variants[0].pricePaise-y.variants[0].pricePaise);
    if(sort==='high')return [...filtered].sort((x,y)=>y.variants[0].pricePaise-x.variants[0].pricePaise);
    return filtered;
  },[q,sort]);
  const mainCategories=collections.filter(collection=>!collection.parentSlug);
  const accessories=collections.find(collection=>collection.slug==='hijab-accessories');
  const accessoryCategories=collections.filter(collection=>collection.parentSlug==='hijab-accessories');

  return <div className="page-shell collection-page">
    <p className="breadcrumbs">Home / Our collection</p>
    <span className="eyebrow">The collection</span>
    <h1 className="page-title">Our collection</h1>
    <p className="page-intro">Explore printed, solid, pashmina and printed jersey hijabs, alongside thoughtful accessories for your everyday styling.</p>
    <nav id="categories" className="category-browse" aria-label="Browse categories">
      <div className="category-browse-main">
        {mainCategories.filter(collection=>collection.slug!=='hijab-accessories').map(collection=>(
          <Link key={collection.slug} href={`/collections/${collection.slug}`} className="collection-card">
            <Image src={collection.image} alt="" fill sizes="(max-width: 640px) 50vw, 20vw"/>
            <div className="collection-copy"><h3>{collection.name}</h3><span>{collection.description}</span></div>
          </Link>
        ))}
      </div>
      {accessories&&<div className="category-browse-accessories">
        <Link href={`/collections/${accessories.slug}`} className="category-browse-heading">{accessories.name}</Link>
        <div className="category-browse-subcategories">
          {accessoryCategories.map(collection=>(
            <Link key={collection.slug} href={`/collections/${collection.slug}`} className="category-browse-subcategory">
              <Image src={collection.image} alt="" fill sizes="(max-width: 640px) 50vw, 20vw"/>
              <span>{collection.name}</span>
            </Link>
          ))}
        </div>
      </div>}
    </nav>
    <h2 className="section-title category-results-title">All pieces</h2>
    <div className="search-box"><label className="sr-only" htmlFor="product-search">Search products</label><input id="product-search" placeholder="Search pieces or collections" value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div className="collection-toolbar"><span>{list.length} pieces</span><label>Sort by <select aria-label="Sort products" value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
    <ProductGrid items={list}/>
  </div>;
}
