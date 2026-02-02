DO $$ BEGIN
 ALTER TABLE chats ADD COLUMN document_id uuid REFERENCES documents(id) ON DELETE CASCADE;
 EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
