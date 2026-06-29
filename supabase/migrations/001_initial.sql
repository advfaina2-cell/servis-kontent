-- profiles: extends auth.users
CREATE TABLE profiles (
  id                       uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email                    text,
  language                 text NOT NULL DEFAULT 'ru',
  generation_count         integer NOT NULL DEFAULT 0,
  is_subscribed            boolean NOT NULL DEFAULT false,
  ls_customer_id           text,
  has_completed_onboarding boolean NOT NULL DEFAULT false,
  created_at               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own profile"
  ON profiles FOR ALL USING (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- voices: writing style profiles
CREATE TABLE voices (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  name        text NOT NULL DEFAULT 'Мой голос',
  style_json  jsonb,
  is_default  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE voices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own voices"
  ON voices FOR ALL USING (user_id = auth.uid());

-- style_examples: raw text examples used to build a voice
CREATE TABLE style_examples (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  voice_id   uuid NOT NULL REFERENCES voices ON DELETE CASCADE,
  content    text NOT NULL,
  source     text NOT NULL DEFAULT 'paste', -- 'paste' | 'audio' | 'file'
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE style_examples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own examples"
  ON style_examples FOR ALL USING (user_id = auth.uid());

-- generations: history of all generated posts
CREATE TABLE generations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  voice_id   uuid REFERENCES voices,
  topic      text NOT NULL,
  platform   text NOT NULL, -- 'linkedin' | 'telegram' | 'instagram' | 'twitter'
  tone       text NOT NULL DEFAULT 'default',
  results    jsonb NOT NULL, -- [{text: string, variant: number}]
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own generations"
  ON generations FOR ALL USING (user_id = auth.uid());
