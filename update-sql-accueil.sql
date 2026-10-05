alter table settings add column if not exists hero_text text;
alter table settings add column if not exists stats jsonb default '[]';
notify pgrst, 'reload schema';
