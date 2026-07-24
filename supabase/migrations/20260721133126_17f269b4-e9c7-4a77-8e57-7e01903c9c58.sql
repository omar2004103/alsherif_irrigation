
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'oadel2004103@gmail.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
      'oadel2004103@gmail.com', crypt('2004103Om@', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"عادل شريف"}'::jsonb,
      false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'oadel2004103@gmail.com', 'email_verified', true),
      'email', 'oadel2004103@gmail.com', now(), now(), now());
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'oadel2004103@gmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
