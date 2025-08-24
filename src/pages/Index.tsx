import Hero from "@/components/Hero";
import Header from "@/components/Header";
import RouteOptimization from "@/components/RouteOptimization";
import SafetyFeatures from "@/components/SafetyFeatures";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <RouteOptimization />
        <SafetyFeatures />
      </main>
      <Footer />
    </>
  );
};

export default Index;