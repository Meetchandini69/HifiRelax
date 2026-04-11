import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Benefits from "./components/Benefits";
import Services from "./components/Services";
import Categories from "./components/Categories";
import Locations from "./components/Locations";
import FeaturedProfiles from "./components/FeaturedProfiles";
import HiringProcess from "./components/HiringProcess";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import CTABanner from "./components/CTABanner";

function App() {
  useEffect(() => {
    document.title = "Chennai Call Girls Services Agency | Premium Escort Services in Chennai";
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content = "Top-rated Chennai Call Girls Services Agency offering premium escort services in Adyar, T Nagar, Nungambakkam, Velachery & ECR. Discreet, verified profiles. Book now.";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Benefits />
        <Services />
        <Categories />
        <CTABanner />
        <Locations />
        <FeaturedProfiles />
        <HiringProcess />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;
