ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies --

-- CHATS: View if participant
CREATE POLICY "view_chats" ON chats FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = id AND user_id = auth.uid())
);

-- PARTICIPANTS: View if in same chat
CREATE POLICY "view_participants" ON chat_participants FOR SELECT USING (
  chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id = auth.uid())
);

-- MESSAGES: View if in chat
CREATE POLICY "view_messages" ON messages FOR SELECT USING (
  chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id = auth.uid())
);

-- MESSAGES: Insert if in chat (and sender is self)
CREATE POLICY "insert_messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = messages.chat_id AND user_id = auth.uid())
);

-- FUNCTION: Create Chat (Security Definer)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
