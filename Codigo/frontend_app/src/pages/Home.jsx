import Hero from "../components/home/Hero";
import Stats from "../components/home/Stats";
import Portfolio from "../components/portfolio/Portfolio";
import "../styles/home.css";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Portfolio />
    </>
  );
}