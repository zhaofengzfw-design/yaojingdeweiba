import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { SiteDataProvider } from '@/data/site-data';
import { ActiveClassProvider } from './ActiveClassContext';
import HeroSection from './sections/HeroSection';
import SeatStatsSection from './sections/SeatStatsSection';
import WelcomeGiftSection from './sections/WelcomeGiftSection';
import KpiOverviewSection from './sections/KpiOverviewSection';
import ClassShowcaseSection from './sections/ClassShowcaseSection';
import OnlineActivitySection from './sections/OnlineActivitySection';
import MembersSection from './sections/MembersSection';
import InsightsSection from './sections/InsightsSection';
import JoinSection from './sections/JoinSection';

export default function HomePage() {
  return (
    <SiteDataProvider>
      <ActiveClassProvider>
        <div id="top" className="min-h-screen bg-[#fff8e7] pb-20 md:pb-0">
          <Header />
          <main className="space-y-0">
            <HeroSection />
            <SeatStatsSection />
            <WelcomeGiftSection />
            <KpiOverviewSection />
            <ClassShowcaseSection />
            <OnlineActivitySection />
            <MembersSection />
            <InsightsSection />
            <JoinSection />
          </main>
          <Footer />
          <BottomNav />
        </div>
      </ActiveClassProvider>
    </SiteDataProvider>
  );
}
