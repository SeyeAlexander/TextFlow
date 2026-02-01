import { Hero, FeatureGrid, CTASection, Footer } from "@/components/landing";

export default function Home() {
  return (
    <main className='min-h-screen bg-background dark:bg-[#111]'>
      <Hero />
      <FeatureGrid />
      <CTASection />
      <Footer />
    </main>
  );
}
