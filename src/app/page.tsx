import { Hero, FeatureGrid, CTASection, Footer, MobileHero } from "@/components/landing";

export default function Home() {
  return (
    <main className='min-h-screen bg-background dark:bg-[#111]'>
      <div className='md:hidden'>
        <MobileHero />
      </div>
      <div className='hidden md:block'>
        <Hero />
        <FeatureGrid />
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}
