import { BackgroundBeams } from "@/components/background-beams";
import { HeroText } from "@/components/HeroText";
import { Navbar } from "@/components/Navbar";
import { TerminalImage } from "@/components/TerminalImage";
import Image from "next/image";

export default function Home() {
  return (
  <div>
    {/* Navbar */}
    <Navbar />

    {/* Hero Section Text */}
    <HeroText />

    {/*Background beams*/}
    <BackgroundBeams />
    

  {/* Terminal image*/}
    <div className="absolute bottom-[-50vh] left-1/2 transform -translate-x-1/2 z-20">
      <TerminalImage
        imagePath="/terminal.png"
        width={1080}
        height={650}
        alt="Sample img"
      />
    </div>

  </div>
  );
}

