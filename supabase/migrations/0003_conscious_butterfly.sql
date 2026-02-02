ALTER TABLE "chats" ADD COLUMN "document_id" uuid;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "is_starred" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;