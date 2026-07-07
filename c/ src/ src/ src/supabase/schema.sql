create extension if not exists "uuid-ossp";

create table if not exists students (
  id uuid primary key default uuid_generate_v4(),
  prenom text not null,
  nom text not null,
  date_naissance date not null,
  sexe text default 'M',
  parent text,
  telephone text,
  date_inscription date default current_date,
  actif boolean default true,
  created_at timestamptz default now()
);

create table if not exists attendance (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade,
  date date not null,
  present boolean default false,
  unique (student_id, date)
);

create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade,
  month text not null,
  paid boolean default false,
  amount numeric default 0,
  date_paid date,
  unique (student_id, month)
);

create table if not exists registrations (
  id uuid primary key default uuid_generate_v4(),
  status text default 'pending',
  submitted_at timestamptz default now(),
  kelas text,
  full_name text,
  birth_place text,
  birth_date date,
  gender text,
  nationality text,
  address text,
  phone text,
  email text,
  current_school text,
  school_grade text,
  father_name text,
  father_phone text,
  father_job text,
  mother_name text,
  mother_phone text,
  mother_job text,
  emergency_name text,
  emergency_relation text,
  emergency_phone text,
  blood_type text,
  height numeric,
  weight numeric,
  jersey_size text,
  jersey_number text,
  shoe_size text,
  position text,
  experience text,
  previous_club text,
  achievements text,
  allergies text,
  asthma text,
  previous_injury text,
  special_disease text,
  on_treatment text,
  treatment_detail text,
  current_medication text,
  other_notes text,
  parent_name_consent text,
  agree boolean default false
);

create table if not exists settings (
  id int primary key default 1,
  academy_name text default 'Prima Soccer School Indonesia',
  fee numeric default 150000,
  registration_fee numeric default 300000,
  admin_password text default 'prima2018',
  website text default 'primasoccerschool.com',
  email text default 'primasoccerschool@gmail.com',
  address text default 'Jl. Griya Asri Raya - Kel. Jelupang - Serpong - Tangerang Selatan',
  youtube text default 'prima soccer school Indonesia',
  tiktok text default 'prima soccer school Indonesia',
  facebook text default 'Prima Soccer School Indonesia',
  instagram text default '@primasoccerschoolindonesia',
  phone1 text default '0853 4288 3803',
  phone2 text default '0822 1000 3063',
  session1 text default 'Rabu · 15.45 – 17.45 (Semua Usia)',
  session2 text default 'Sabtu · 07.45 – 10.45 (Semua Usia)',
  lang text default 'fr'
);

insert into settings (id) values (1) on conflict (id) do nothing;

alter table students enable row level security;
alter table attendance enable row level security;
alter table payments enable row level security;
alter table registrations enable row level security;
alter table settings enable row level security;

create policy "public read/write students" on students for all using (true) with check (true);
create policy "public read/write attendance" on attendance for all using (true) with check (true);
create policy "public read/write payments" on payments for all using (true) with check (true);
create policy "public read/write registrations" on registrations for all using (true) with check (true);
create policy "public read/write settings" on settings for all using (true) with check (true);
