"use client";

import { DestinationProvider } from "./components/state/DestinationContext";
import ScrollProvider from "./components/ui/ScrollProvider";
import Preloader from "./components/ui/Preloader";
import Header from "./components/Header";
import HeroSection from "./components/sections/HeroSection";
import IntroStripSection from "./components/sections/IntroStripSection";
import StoryReelSection from "./components/sections/StoryReelSection";
import DiscoverSection from "./components/sections/DiscoverSection";
import SeasonalSection from "./components/sections/SeasonalSection";
import MapSection from "./components/sections/MapSection";
import LocalNoteSection from "./components/sections/LocalNoteSection";
import FooterSection from "./components/sections/FooterSection";
import PageProgress from "./components/ui/PageProgress";
import SectionCounter from "./components/ui/SectionCounter";
import CursorFollower from "./components/ui/CursorFollower";
import DestinationModal from "./components/ui/DestinationModal";
import SavedDrawer from "./components/ui/SavedDrawer";
import Toast from "./components/ui/Toast";

export default function HomePage() {
  return (
    <DestinationProvider>
      <ScrollProvider>
        <PageProgress />
        <SectionCounter />
        <CursorFollower />
        <Preloader />
        <Header />
        <main id="top">
          <HeroSection />
          <IntroStripSection />
          <StoryReelSection />
          <DiscoverSection />
          <SeasonalSection />
          <MapSection />
          <LocalNoteSection />
          <FooterSection />
        </main>
        <Toast />
        <DestinationModal />
        <SavedDrawer />
      </ScrollProvider>
    </DestinationProvider>
  );
}

