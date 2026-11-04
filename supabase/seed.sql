-- Development-only examples. Catalogue content is explicitly illustrative, not verified merchandise.
insert into public.categories(name,slug,description) values
('Printed Hijabs','printed-hijabs','Expressive prints and considered patterns.'),
('Solid Hijabs','solid-hijabs','Timeless shades for effortless styling.'),
('Pashmina Hijabs','pashmina-hijabs','Soft layers for an elegant drape.'),
('Printed Jersey Hijabs','lace-hijabs','Expressive prints in soft, easy-to-style jersey.'),
('Hijab Accessories','hijab-accessories','Thoughtful finishing touches for every style.')
on conflict(slug) do update set name=excluded.name,description=excluded.description;
insert into public.categories(name,slug,description,parent_category_id)
select child.name,child.slug,child.description,parent.id
from (values
 ('Magnet Pins','magnet-pins','A secure, pin-free way to style your hijab.'),
 ('Hijab Pins','hijab-pins','Everyday essentials for a polished drape.'),
 ('Undercaps','undercaps','Comfortable foundations for easy styling.')
) child(name,slug,description)
join public.categories parent on parent.slug='hijab-accessories'
on conflict(slug) do update
set name=excluded.name,description=excluded.description,parent_category_id=excluded.parent_category_id;
with c as (select id,slug from public.categories)
insert into public.products(category_id,name,slug,description,is_published)
select c.id,x.name,x.slug,x.description,true from (values
('solid-hijabs','Sage Veil','sage-veil','Illustrative development sample; replace before launch.'),
('solid-hijabs','Cocoa Drape','cocoa-drape','Illustrative development sample; replace before launch.'),
('solid-hijabs','Ivory Muse','ivory-muse','Illustrative development sample; replace before launch.'),
('printed-hijabs','Rosewood Bloom','rosewood-bloom','Illustrative development sample; replace before launch.')
) x(category_slug,name,slug,description) join c on c.slug=x.category_slug
on conflict(slug) do update set category_id=excluded.category_id;
-- Insert variants manually after reviewing demo prices; disable or replace all samples before live sales.
