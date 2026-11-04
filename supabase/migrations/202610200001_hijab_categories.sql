alter table public.categories
  add column if not exists parent_category_id uuid references public.categories(id) on delete set null;

insert into public.categories(name,slug,description)
values
  ('Printed Hijabs','printed-hijabs','Expressive prints and considered patterns.'),
  ('Solid Hijabs','solid-hijabs','Timeless shades for effortless styling.'),
  ('Pashmina Hijabs','pashmina-hijabs','Soft layers for an elegant drape.'),
  ('Lace Hijabs','lace-hijabs','Delicate details for a refined finish.'),
  ('Hijab Accessories','hijab-accessories','Thoughtful finishing touches for every style.')
on conflict(slug) do update
set name=excluded.name,description=excluded.description;

insert into public.categories(name,slug,description,parent_category_id)
select child.name,child.slug,child.description,parent.id
from (values
  ('Magnet Pins','magnet-pins','A secure, pin-free way to style your hijab.'),
  ('Hijab Pins','hijab-pins','Everyday essentials for a polished drape.'),
  ('Undercaps','undercaps','Comfortable foundations for easy styling.')
) child(name,slug,description)
join public.categories parent on parent.slug='hijab-accessories'
on conflict(slug) do update
set name=excluded.name,
    description=excluded.description,
    parent_category_id=excluded.parent_category_id;
