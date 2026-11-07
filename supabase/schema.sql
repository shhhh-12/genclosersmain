-- GenClosers Stage 2 setup (Supabase / Postgres). Run once in Supabase: SQL Editor -> New query -> paste -> Run. Row-level security: students see only their own data; admins see all.

-- People ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  whatsapp text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Applications (from the site form) -----------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  whatsapp text not null,
  email text not null,
  occupation text, goal text, experience text, seriousness text, decision_maker text, readiness text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text, page text,
  status text not null default 'new' check (status in ('new', 'qualified', 'paid', 'not_paid')),
  status_changed_at timestamptz,
  notes text,
  user_id uuid references auth.users on delete set null, -- set when the login is created on "paid"
  invited_at timestamptz
);

-- Batches ------------------------------------------------------------------------
create table public.batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- e.g. "1 December 2026"
  starts_at timestamptz not null,
  seats int not null default 10
);

create table public.enrolments (
  student_id uuid references public.profiles on delete cascade,
  batch_id uuid references public.batches on delete cascade,
  enrolled_at timestamptz not null default now(),
  access_until timestamptz,           -- 90 days access (course copy)
  primary key (student_id, batch_id)
);

-- Course content -------------------------------------------------------------------
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,         -- 0..20
  title text not null
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules on delete cascade,
  position int not null default 0,
  type text not null check (type in ('mcq', 'repeat', 'written', 'recording')),
  title text not null,
  prompt text not null,
  -- mcq: {options: [...], answer: n} | repeat: {phrase: "..."} | written/recording: {rubric: "..."}
  config jsonb not null default '{}',
  max_points int not null default 10,
  ai_scoring boolean not null default false,
  attempts_allowed int not null default 3,
  is_sample boolean not null default false,  -- SAMPLE content until the owner adds real activities
  published boolean not null default true
);

-- Student work ----------------------------------------------------------------------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities on delete cascade,
  student_id uuid not null references public.profiles on delete cascade,
  attempt int not null check (attempt between 1 and 10),
  answer jsonb not null default '{}',   -- mcq choice, transcript, text...
  file_path text,                       -- storage path for recordings
  auto_score numeric,                   -- mcq / repeat-the-words
  ai_score numeric, ai_feedback text,   -- written (and transcripts later)
  admin_score numeric, admin_feedback text,
  status text not null default 'submitted' check (status in ('submitted', 'scored')),
  created_at timestamptz not null default now(),
  unique (activity_id, student_id, attempt)
);

-- Row-level security ----------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.batches enable row level security;
alter table public.enrolments enable row level security;
alter table public.modules enable row level security;
alter table public.activities enable row level security;
alter table public.submissions enable row level security;

create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "admin profiles" on public.profiles for all using (public.is_admin());

-- Applications are written by the server (service role) and read/managed by admins only
create policy "admin applications" on public.applications for all using (public.is_admin());

create policy "read batches" on public.batches for select using (auth.uid() is not null);
create policy "admin batches" on public.batches for all using (public.is_admin());
create policy "own enrolment" on public.enrolments for select using (student_id = auth.uid() or public.is_admin());
create policy "admin enrolments" on public.enrolments for all using (public.is_admin());

create policy "read modules" on public.modules for select using (auth.uid() is not null);
create policy "admin modules" on public.modules for all using (public.is_admin());
create policy "read activities" on public.activities for select using (auth.uid() is not null and published);
create policy "admin activities" on public.activities for all using (public.is_admin());

create policy "own submissions read" on public.submissions for select using (student_id = auth.uid() or public.is_admin());
-- Students do not write submissions directly: the server checks attempts and scores, then saves.
create policy "admin submissions" on public.submissions for all using (public.is_admin());

-- New login -> profile row. Admin emails get the admin role.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, whatsapp, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'whatsapp',
    case when lower(new.email) = any (array['shashank1341@gmail.com']) then 'admin' else 'student' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage: private bucket "recordings", path = <student_id>/<activity_id>/<attempt>.webm
insert into storage.buckets (id, name, public, file_size_limit)
values ('recordings', 'recordings', false, 52428800) -- 50 MB per file
on conflict (id) do nothing;

create policy "students upload own recordings" on storage.objects for insert
  with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "students read own recordings" on storage.objects for select
  using (bucket_id = 'recordings' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- Seed ------------------------------------------------------------------------------
insert into public.batches (name, starts_at, seats) values ('1 December 2026', '2026-12-01 00:00:00+05:30', 10);

insert into public.modules (number, title) values
  (0, 'Introduction'),

  (1, 'What Sales Really Is'),

  (2, 'How Your Practice Works'),

  (3, 'Why Sales Exists and How People Buy'),

  (4, 'Trust and Liking'),

  (5, 'Tonality'),

  (6, 'Reciprocation'),

  (7, 'The Call Flow and Opening'),

  (8, 'Qualification (PACT)'),

  (9, 'Finding the Real Need (PNS)'),

  (10, 'Giving Value'),

  (11, 'Benefits'),

  (12, 'Objection Handling'),

  (13, 'Closing and Follow Up'),

  (14, 'The Sales Rope'),

  (15, 'Before the Call, After the Sale, and Other Channels'),

  (16, 'Building Your Own Script'),

  (17, 'Tracking Your Numbers'),

  (18, 'Reviewing Your Calls'),

  (19, 'Key Points to Remember'),

  (20, 'Final Mock Call');

-- SAMPLE activities (is_sample = true) so every activity type can be tried. Replace in the admin panel.
insert into public.activities (module_id, position, type, title, prompt, config, max_points, ai_scoring, is_sample)
select id, 1, 'mcq', 'SAMPLE: What sales really is',
  'Which of these is the real definition of sales used in this course?',
  '{"options": ["Convincing anyone to buy", "Helping a friend who is in need", "Talking fast and confidently", "Pushing until they say yes"], "answer": 1}',
  10, false, true from public.modules where number = 1;

insert into public.activities (module_id, position, type, title, prompt, config, max_points, ai_scoring, is_sample)
select id, 1, 'repeat', 'SAMPLE: Repeat the line',
  'Say this line out loud, with energy and a smile.',
  '{"phrase": "Hi Priya, thanks for taking the time today. I have heard a lot about what you are building."}',
  10, false, true from public.modules where number = 5;

insert into public.activities (module_id, position, type, title, prompt, config, max_points, ai_scoring, is_sample)
select id, 1, 'mcq', 'SAMPLE: PACT',
  'In PACT qualification, what does the C stand for?',
  '{"options": ["Confidence", "Capital", "Closing", "Contact"], "answer": 1}',
  10, false, true from public.modules where number = 8;

insert into public.activities (module_id, position, type, title, prompt, config, max_points, ai_scoring, is_sample)
select id, 1, 'written', 'SAMPLE: Write your opening',
  'Write the first 3 lines you would say when opening a call for the fitness program brief.',
  '{"rubric": "Uses the prospect''s name, sets the agenda, shows energy, asks permission to continue."}',
  20, true, true from public.modules where number = 7;

insert into public.activities (module_id, position, type, title, prompt, config, max_points, ai_scoring, is_sample)
select id, 1, 'recording', 'SAMPLE: Record your opening',
  'Record yourself (audio or video, up to 2 minutes) opening a call for the fitness program brief.',
  '{"rubric": "Tone, energy, clarity, confidence and flow."}',
  20, false, true from public.modules where number = 20;
