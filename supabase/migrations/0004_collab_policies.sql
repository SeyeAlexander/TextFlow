ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- DOCUMENT COLLABORATORS:
-- View if owner of doc OR if self is the collaborator
CREATE POLICY "view_document_collaborators" ON document_collaborators FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  EXISTS (SELECT 1 FROM documents WHERE id = document_id AND owner_id = (select auth.uid()))
);

-- DOCUMENTS (Update existing policies to allow collaborators)
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;

-- View: Owner OR Collaborator
CREATE POLICY "view_documents_collab" ON documents FOR SELECT USING (
  owner_id = (select auth.uid()) OR
  EXISTS (SELECT 1 FROM document_collaborators WHERE document_id = id AND user_id = (select auth.uid())) OR
  is_public = true 
);

-- Update: Owner OR Collaborator
CREATE POLICY "update_documents_collab" ON documents FOR UPDATE USING (
  owner_id = (select auth.uid()) OR
  EXISTS (SELECT 1 FROM document_collaborators WHERE document_id = id AND user_id = (select auth.uid()))
);

-- NOTIFICATIONS:
-- View own
CREATE POLICY "view_own_notifications" ON notifications FOR SELECT USING (
  recipient_id = (select auth.uid())
);

-- Update own (mark as read)
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE USING (
  recipient_id = (select auth.uid())
);
