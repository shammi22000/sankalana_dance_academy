import heroDanceDuo from "./carousel/hero-dance-duo.jpeg";
import heroDanceHeritage from "./carousel/hero-dance-heritage.jpeg";
import heroDancePerformance from "./carousel/hero-dance-performance.jpeg";
import heroDanceSolo from "./carousel/hero-dance-solo.jpeg";

export const danceImages = {
  heroCarousel: [
    {
      src: heroDanceSolo,
      alt: "Young classical dancer in a magenta costume posing with raised hands",
      tag: "Classical Training",
      title: "Grace in Motion",
    },
    {
      src: heroDanceDuo,
      alt: "Two classical dancers in blue and magenta costumes performing together",
      tag: "Stage Ready",
      title: "Duet Discipline",
    },
    {
      src: heroDancePerformance,
      alt: "Group of young classical dancers performing on stage",
      tag: "Live Performance",
      title: "Academy Showcase",
    },
  ],
  story: [
    "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=520&q=85",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=520&q=85",
    "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=520&q=85",
    "https://images.unsplash.com/photo-1535525153412-5a42439a210d?auto=format&fit=crop&w=520&q=85",
  ],
  disciplines: [
    heroDanceHeritage,
    heroDanceDuo,
    heroDancePerformance,
    heroDanceSolo,
  ],
};
