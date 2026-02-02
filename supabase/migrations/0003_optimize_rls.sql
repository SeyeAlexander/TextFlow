-- 1. Fix Function Security (Search Path)
CREATE OR REPLACE FUNCTION create_chat_with_participants(
  p_type text,
  p_name text,
  p_participant_ids uuid[]
) RETURNS uuid AS $$
DECLARE
  v_chat_id uuid;
  v_pid uuid;
BEGIN
  -- Create Chat
  INSERT INTO chats (type, name) VALUES (p_type, p_name) RETURNING id INTO v_chat_id;

  -- Add Participants
  FOREACH v_pid IN ARRAY p_participant_ids LOOP
    INSERT INTO chat_participants (chat_id, user_id) VALUES (v_chat_id, v_pid);
  END LOOP;

  RETURN v_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. Optimize ALL RLS Policies (Cache auth.uid)

-- Drop existing heavily used policies to recreate them optimized
DROP POLICY IF EXISTS "view_chats" ON chats;
DROP POLICY IF EXISTS "view_participants" ON chat_participants;
DROP POLICY IF EXISTS "view_messages" ON messages;
DROP POLICY IF EXISTS "insert_messages" ON messages;

-- CHATS
CREATE POLICY "view_chats" ON chats FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = id AND user_id = (select auth.uid()))
);

-- PARTICIPANTS
CREATE POLICY "view_participants" ON chat_participants FOR SELECT USING (
  chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id = (select auth.uid()))
);

-- MESSAGES
CREATE POLICY "view_messages" ON messages FOR SELECT USING (
  chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id = (select auth.uid()))
);

CREATE POLICY "insert_messages" ON messages FOR INSERT WITH CHECK (
  (select auth.uid()) = sender_id AND
  EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = messages.chat_id AND user_id = (select auth.uid()))
);

-- Also fix Folders/Documents if they exist (Addressing reported issue)
-- Note: Requires knowledge of previous policy names. Assuming standard names or generic Drop/Create logic.
-- Since I don't know the exact names of the folder policies created earlier, I will use a safe "CREATE OR REPLACE" approach isn't available for policies.
-- I'll try to drop common names.

-- FOLDERS
DROP POLICY IF EXISTS "Users can insert own folders" ON folders;
DROP POLICY IF EXISTS "Users can view own folders" ON folders;
DROP POLICY IF EXISTS "Users can update own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete own folders" ON folders;

CREATE POLICY "Users can insert own folders" ON folders FOR INSERT WITH CHECK (
  owner_id = (select auth.uid())
);

CREATE POLICY "Users can view own folders" ON folders FOR SELECT USING (
  owner_id = (select auth.uid())
);

CREATE POLICY "Users can update own folders" ON folders FOR UPDATE USING (
  owner_id = (select auth.uid())
);

CREATE POLICY "Users can delete own folders" ON folders FOR DELETE USING (
  owner_id = (select auth.uid())
);

-- DOCUMENTS (Do the same for completeness)
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (
  owner_id = (select auth.uid())
);

CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (
  owner_id = (select auth.uid())
);

CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (
  owner_id = (select auth.uid())
);

CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (
  owner_id = (select auth.uid())
);
