import Hero from "@/components/Hero";
import Header from "@/components/Header";
import RouteOptimization from "@/components/RouteOptimization";
import SafetyFeatures from "@/components/SafetyFeatures";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <RouteOptimization />
        <SafetyFeatures />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default Index;