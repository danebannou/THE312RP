alter table settings add column if not exists background_url text;
alter table items add column if not exists images text[] not null default '{}';
update items set images = array[image_url] where image_url is not null and images = '{}';
notify pgrst, 'reload schema';
