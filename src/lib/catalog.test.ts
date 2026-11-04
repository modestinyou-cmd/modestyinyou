import {describe,expect,it} from 'vitest';
import {collections,products} from './catalog';

describe('hijab collection taxonomy',()=>{
  it('defines the four primary hijab categories and separate accessories category',()=>{
    const mainCategories=collections.filter(collection=>!collection.parentSlug&&!collection.editorial);
    expect(mainCategories.map(collection=>collection.name)).toEqual([
      'Printed Hijabs',
      'Solid Hijabs',
      'Pashmina Hijabs',
      'Printed Jersey Hijabs',
      'Hijab Accessories'
    ]);
  });

  it('groups the three accessory categories under Hijab Accessories',()=>{
    const accessories=collections.filter(collection=>collection.parentSlug==='hijab-accessories');
    expect(accessories.map(collection=>collection.name)).toEqual(['Magnet Pins','Hijab Pins','Undercaps']);
  });

  it('defines The Fall Edit as an editorial collection without unassigned products',()=>{
    const fallEdit=collections.find(collection=>collection.slug==='fall-edit');
    expect(fallEdit).toMatchObject({name:'The Fall Edit',editorial:true,image:'/images/fall-collection-launch.jpeg'});
    expect(products.filter(product=>product.categorySlug==='fall-edit')).toEqual([]);
  });

  it('assigns each development product to a defined collection',()=>{
    const collectionSlugs=new Set(collections.map(collection=>collection.slug));
    expect(products.every(product=>collectionSlugs.has(product.categorySlug))).toBe(true);
  });
});
