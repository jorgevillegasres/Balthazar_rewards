-- Source for root agent to create/apply a managed Supabase migration.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('balthazar-supports','balthazar-supports',false,8388608,array[
 'application/pdf','image/png','image/jpeg','image/webp','text/plain',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]) on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy balthazar_supports_read on storage.objects for select to authenticated using (
 bucket_id='balthazar-supports'
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and array_length(storage.foldername(name),1)=2
 and exists(select 1 from public.balthazar_allowed_emails where email=lower((select auth.jwt())->>'email'))
 and exists(select 1 from public.balthazar_state s, jsonb_array_elements(s.data->'tasks') t where s.user_id=(select auth.uid()) and t->>'id'=(storage.foldername(name))[2])
);
create policy balthazar_supports_insert on storage.objects for insert to authenticated with check (
 bucket_id='balthazar-supports'
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and array_length(storage.foldername(name),1)=2
 and storage.filename(name) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[a-zA-Z0-9._ -]{1,120}$'
 and lower(storage.extension(name)) in ('pdf','png','jpg','jpeg','webp','txt','docx','xlsx','pptx')
 and exists(select 1 from public.balthazar_allowed_emails where email=lower((select auth.jwt())->>'email'))
 and exists(select 1 from public.balthazar_state s, jsonb_array_elements(s.data->'tasks') t where s.user_id=(select auth.uid()) and t->>'id'=(storage.foldername(name))[2])
);
create policy balthazar_supports_delete on storage.objects for delete to authenticated using (
 bucket_id='balthazar-supports'
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and array_length(storage.foldername(name),1)=2
 and exists(select 1 from public.balthazar_allowed_emails where email=lower((select auth.jwt())->>'email'))
);
-- No UPDATE: uploads never overwrite an existing object. DELETE intentionally
-- allows the owner to clean up an object after concurrent task removal.

-- The app checks twenty files before/after upload and compensates on overflow.
-- The authorized owner can bypass that app count via direct Storage API calls;
-- privacy, formats and byte size remain enforced by the bucket and RLS.
