import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthCodeError() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4 text-center'>
      <h1 className='text-2xl font-bold'>Authentication Error</h1>
      <p className='mt-2 text-muted-foreground'>
        There was a problem signing you in. Please try again.
      </p>
      <Link href='/login' className='mt-6'>
        <Button>Return to Login</Button>
      </Link>
    </div>
  );
}
