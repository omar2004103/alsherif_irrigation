
DO $$
DECLARE
  admin_email text := 'oadel2004103@gmail.com';
  admin_password text := '2004103Om@';
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;

  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_id, 'authenticated', 'authenticated',
      admin_email, crypt(admin_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Omar Adel"}'::jsonb,
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', admin_email),
      'email', admin_id::text,
      now(), now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt(admin_password, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = admin_id;
  END IF;

  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (admin_id, 'Omar Adel', '01111661177')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
