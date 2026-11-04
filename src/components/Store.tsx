'use client';
import Link from 'next/link'; import Image from 'next/image'; import {createContext,useContext,useEffect,useMemo,useState} from 'react'; import {usePathname} from 'next/navigation'; import {products,collections,formatINR,Product} from '@/lib/catalog';
export function PageTransition({children}:{children:React.ReactNode}){const pathname=usePathname();return <div key={pathname} className="page-transition-in">{children}</div>}
export function MotionObserver(){useEffect(()=>{if(!('IntersectionObserver'in window)){document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el=>el.classList.add('is-visible'));return}const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.12,rootMargin:'0px 0px -36px 0px'});const watch=(root:ParentNode)=>{root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach(el=>observer.observe(el))};watch(document);document.documentElement.classList.add('motion-enabled');const mutations=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node instanceof HTMLElement){if(node.matches('[data-reveal]'))observer.observe(node);watch(node)}})));mutations.observe(document.body,{childList:true,subtree:true});return()=>{observer.disconnect();mutations.disconnect();document.documentElement.classList.remove('motion-enabled')}},[]);return null}
type CartItem={variantId:string; productId:string; quantity:number}; type CartCtx={items:CartItem[];add:(p:Product,variantId:string,q:number)=>void;remove:(id:string)=>void;setQty:(id:string,q:number)=>void;count:number};
const CartContext=createContext<CartCtx|null>(null);
export function CartProvider({children}:{children:React.ReactNode}){const [items,setItems]=useState<CartItem[]>([]);useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem('miy-cart')||'[]'))}catch{}},[]);useEffect(()=>{localStorage.setItem('miy-cart',JSON.stringify(items))},[items]);const value=useMemo(()=>({items,count:items.reduce((n,i)=>n+i.quantity,0),add:(p:Product,variantId:string,q:number)=>setItems(prev=>{const hit=prev.find(i=>i.variantId===variantId);return hit?prev.map(i=>i.variantId===variantId?{...i,quantity:Math.min(10,i.quantity+q)}:i):[...prev,{productId:p.id,variantId,quantity:q}]}),remove:(id:string)=>setItems(prev=>prev.filter(i=>i.variantId!==id)),setQty:(id:string,q:number)=>setItems(prev=>q<1?prev.filter(i=>i.variantId!==id):prev.map(i=>i.variantId===id?{...i,quantity:Math.min(10,q)}:i))}),[items]);return <CartContext.Provider value={value}>{children}</CartContext.Provider>}
export function useCart(){const ctx=useContext(CartContext);if(!ctx)throw new Error('CartProvider is missing');return ctx}
export function SiteHeader(){
  const {count}=useCart();
  const [mobileMenuOpen,setMobileMenuOpen]=useState(false);
  const pathname=usePathname();
  const mainCategories=collections.filter(c=>!c.parentSlug);
  const accessoryCategories=collections.filter(c=>c.parentSlug==='hijab-accessories');
  const closeMobileMenu=()=>setMobileMenuOpen(false);
  useEffect(()=>{setMobileMenuOpen(false)},[pathname]);
  return (
    <>
      <div className="announcement-bar">
        <span>MODESTY IS NOT JUST A FASHION. IT&apos;S YOUR IDENTITY.</span>
      </div>
      <header className="site-header">
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/collections">Our Collection</Link>
          <div className="nav-category-menu">
            <Link href="/collections" aria-haspopup="true">Categories</Link>
            <div className="nav-category-menu-panel">
              {mainCategories.map(c=><Link key={c.slug} href={`/collections/${c.slug}`}>{c.name}</Link>)}
              {accessoryCategories.map(c=><Link key={c.slug} className="nav-subcategory" href={`/collections/${c.slug}`}>{c.name}</Link>)}
            </div>
          </div>
          <Link href="/about">Our Story</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <Link className="brand-lockup" href="/" aria-label="Modestyinyou home">
          <Image src="/images/logo.png" alt="Modestyinyou" width={240} height={64} priority className="brand-logo" />
        </Link>
        <div className="header-actions">
          <Link className="search-link" href="/collections">Search</Link>
          <Link className="account-header-link" href="/account">Account</Link>
          <Link className="cart-link" href="/cart" aria-label={`Cart, ${count} items`}>Bag<span className="cart-count">{count}</span></Link>
        </div>
      </header>
      <div className="mobile-header">
        <button
          className="mobile-menu-btn"
          type="button"
          aria-label={mobileMenuOpen?'Close menu':'Open menu'}
          aria-controls="mobile-drawer"
          aria-expanded={mobileMenuOpen}
          onClick={()=>setMobileMenuOpen(open=>!open)}
        >
          <span/><span/><span/>
        </button>
        <Link className="mobile-brand" href="/" aria-label="Modestyinyou home">
          <Image src="/images/logo.png" alt="Modestyinyou" width={320} height={90} priority className="brand-logo" />
        </Link>
        <div className="mobile-right-actions">
          <Link href="/collections" aria-label="Search">Search</Link>
          <Link href="/account" aria-label="Account">Account</Link>
          <Link href="/cart" aria-label={`Cart, ${count} items`}>Bag<span className="cart-count">{count}</span></Link>
        </div>
      </div>
      <nav id="mobile-drawer" className={`mobile-drawer${mobileMenuOpen?' is-open':''}`} aria-label="Mobile navigation">
        <Link href="/collections" onClick={closeMobileMenu}>Our Collection</Link>
        <Link href="/categories" onClick={closeMobileMenu}>Categories</Link>
        <Link href="/about" onClick={closeMobileMenu}>Our Story</Link>
        <Link href="/contact" onClick={closeMobileMenu}>Contact</Link>
        <Link href="/account" onClick={closeMobileMenu}>Account</Link>
      </nav>
    </>
  );
}
export function SiteFooter(){return <footer className="footer"><div className="footer-main"><div><h3>Explore</h3><Link href="/collections">Our collection</Link><Link href="/about">Our story</Link><Link href="/contact">Contact</Link></div><div><h3>Help</h3><Link href="/shipping-returns">Shipping &amp; returns</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div><div><h3>Stay in touch</h3><p>New arrivals and considered styling, occasionally.</p><NewsletterForm/></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} ModestyInYou</span><span>Made for the moments that are yours.</span></div></footer>}
export function NewsletterForm(){const[message,setMessage]=useState('');return <><form className="newsletter" onSubmit={e=>{e.preventDefault();setMessage('Newsletter signup is not connected yet.')}}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required/><button aria-label="Join newsletter">Join</button></form>{message&&<small role="status">{message}</small>}</>}
export function ProductCard({product,index=0}:{product:Product;index?:number}){const variant=product.variants[0];const secondImg=product.images?.[1];const[hovered,setHovered]=useState(false);return <article className="product-card" data-reveal style={{'--reveal-delay':`${index*70}ms`} as React.CSSProperties}><Link href={`/products/${product.slug}`} className="product-image" onMouseEnter={()=>secondImg&&setHovered(true)} onMouseLeave={()=>setHovered(false)}><Image src={product.image} alt={product.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" style={{opacity:hovered?0:1,transition:'opacity 0.35s ease'}}/>{secondImg&&<Image src={secondImg} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" style={{opacity:hovered?1:0,transition:'opacity 0.35s ease'}}/> }<span className="image-label">{product.demo?'DEVELOPMENT SAMPLE':''}</span></Link><div className="product-meta"><div><Link href={`/products/${product.slug}`} className="product-name">{product.name}</Link><p>{product.category}</p></div><span>{formatINR(variant.pricePaise)}</span></div>{variant.stock===0&&<small className="stock-out">Sold out</small>}</article>}
export function ProductGrid({items}:{items:Product[]}){return items.length?<div className="product-grid">{items.map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}</div>:<div className="empty-state"><h2>No pieces found</h2><p>Try a different search or browse all collections.</p><Link className="button button-outline" href="/collections">View all</Link></div>}
export function AddToCart({product,variantId}:{product:Product;variantId:string}){const {add}=useCart();const v=product.variants.find(x=>x.id===variantId)!;const [added,setAdded]=useState(false);return <button className={`button button-dark full${added?' btn-added':''}`} disabled={!v.stock} onClick={()=>{add(product,variantId,1);setAdded(true);setTimeout(()=>setAdded(false),1700)}}>{!v.stock?'Currently unavailable':added?'Added to bag âœ“':'Add to bag'}</button>}
