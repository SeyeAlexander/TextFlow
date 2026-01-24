import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-8'>
      <div className='absolute top-6 right-6'>
        <ThemeToggle />
      </div>

      <div className='text-center max-w-2xl'>
        <h1 className='text-4xl font-bold mb-4'>TextFlow</h1>
        <p className='text-lg text-muted-foreground mb-8'>
          A real-time collaborative block-based editor for teams.
        </p>

        <div className='flex gap-4 justify-center'>
          <Link
            href='/login'
            className='inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
          >
            Sign In
          </Link>
          <Link
            href='/signup'
            className='inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-6 border hover:bg-accent transition-colors'
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
