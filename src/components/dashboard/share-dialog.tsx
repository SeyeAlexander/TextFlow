"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Users, Check, AlertCircle } from "lucide-react";
import { shareDocument } from "@/actions/share";
import { toast } from "sonner";

interface ShareDialogProps {
  documentId: string;
  documentName: string;
  trigger?: React.ReactNode;
}

export function ShareDialog({ documentId, documentName, trigger }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    startTransition(async () => {
      const result = await shareDocument(documentId, email);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Invitation sent!");
        setEmail("");
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant='ghost' size='sm' className='h-8 gap-2'>
            <Share2 className='size-4' />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Share "{documentName}"</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleShare} className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Email address</Label>
            <Input
              id='email'
              placeholder='colleague@example.com'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className='flex justify-end gap-3'>
            <Button type='button' variant='outline' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? "Sharing..." : "Send Invite"}
            </Button>
          </div>
        </form>
        <div className='rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 text-xs text-yellow-800 dark:text-yellow-200 flex gap-2'>
          <AlertCircle className='size-4 shrink-0' />
          <p>Only existing TextFlow users can be invited for now.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
