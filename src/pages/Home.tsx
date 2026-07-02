import HeroSection from '../components/sections/HeroSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import RewardsSection from '../components/sections/RewardsSection';
import WhyJoinSection from '../components/sections/WhyJoinSection';
import StatisticsSection from '../components/sections/StatisticsSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <RewardsSection />
      <WhyJoinSection />
      <StatisticsSection />
      <TestimonialsSection />
    </>
  );
}
