import { useState } from "react";
import AgeGate from "./components/AgeGate";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import QuickNav from "./components/QuickNav";
import About from "./components/About";
import LocationsGrid from "./components/LocationsGrid";
import CTABanner from "./components/CTABanner";
import AboutExtended from "./components/AboutExtended";
import Pricing from "./components/Pricing";
import WhyChooseUs from "./components/WhyChooseUs";
import Gallery from "./components/Gallery";
import Categories from "./components/Categories";
import LocationsText from "./components/LocationsText";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";

export default function App() {
  const [ageVerified, setAgeVerified] = useState(false);

  if (!ageVerified) {
    return <AgeGate onEnter={() => setAgeVerified(true)} />;
  }

  return (
    <div className="bg-site min-h-screen">
      <Navbar />
      <Hero />
      <QuickNav />
      <About />
      <LocationsGrid />
      <CTABanner />
      <AboutExtended />
      <Pricing />
      <WhyChooseUs />
      <Gallery />
      <Categories />
      <LocationsText />
      <FAQ />
      <Footer />
      <FloatingContact />
    </div>
  );
}
