import LandingHeader from '../components/landing/LandingHeader';
import HeroSection from '../components/landing/HeroSection';
import LogoCloud from '../components/landing/LogoCloud';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
import CTASection from '../components/landing/CTASection';
import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0f1014] text-white overflow-x-hidden selection:bg-blue-500 selection:text-white">
            <LandingHeader />
            <HeroSection />
            <LogoCloud />
            <FeaturesSection />
            <HowItWorks />
            <CTASection />
            <LandingFooter />
        </div>
    );
}
