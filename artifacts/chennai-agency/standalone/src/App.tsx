import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Benefits from "./components/Benefits";
import Services from "./components/Services";
import Categories from "./components/Categories";
import CTABanner from "./components/CTABanner";
import Locations from "./components/Locations";
import FeaturedProfiles from "./components/FeaturedProfiles";
import HiringProcess from "./components/HiringProcess";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

function App() {
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
