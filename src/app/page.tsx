'use client';

import { Hero } from '@/features/home/components/Hero';
import { ParliamentaryCosts } from '@/features/home/components/ParliamentaryCosts';
import { ElectionSystem } from '@/features/home/components/ElectionSystem';
import { RankingsSection } from '@/features/home/components/RankingsSection';
import { QuotaDetails } from '@/features/home/components/QuotaDetails';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-24">
      <Hero />
      
      <ParliamentaryCosts />

      <ElectionSystem />

      <RankingsSection />

      <QuotaDetails />
    </div>
  );
}
