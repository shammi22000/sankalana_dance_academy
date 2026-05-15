import { danceImages } from "../assets/danceImages";
export const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Dance Forms", href: "#disciplines" },
    { label: "Events", href: "#events" },
    { label: "Learning Material", href: "#learning-material" },
    { label: "Enroll", href: "#enroll" },
    { label: "Location", href: "#contact" },
];
export const storyImages = danceImages.story;
export const disciplines = [
    {
        title: "Kandyan Dancing",
        description: "Traditional dance from Sri Lankan highlands",
        image: danceImages.disciplines[0],
        imagePosition: "center",
    },
    {
        title: "Low Country Dancing",
        description: "Coastal folk dance tradition",
        image: danceImages.disciplines[1],
        imagePosition: "center",
    },
    {
        title: "Sabaragamu",
        description: "Regional dance from central Sri Lanka",
        image: danceImages.disciplines[2],
        imagePosition: "center",
    },
    {
        title: "Contemporary",
        description: "Modern fusion of traditional forms",
        image: danceImages.disciplines[3],
        imagePosition: "center",
    },
];
export const upcomingEvents = [
    {
        title: "SheershabhiBharana Mangalyaya",
        date: "Oct 15, 2026",
        time: "6:00 PM",
        venue: "Cultural Center Auditorium",
        type: "Performance",
    },
    {
        title: "New Year Festival",
        date: "Nov 3, 2026",
        time: "5:30 PM",
        venue: "Temple Hall",
        type: "Celebration",
        featured: true,
    },
    {
        title: "Dancing Concert",
        date: "Nov 20, 2026",
        time: "10:00 AM",
        venue: "Sankalana Studio",
        type: "Concert",
    },
    {
        title: "Dance Daily's Summer Performance",
        date: "Dec 10, 2026",
        time: "4:00 PM",
        venue: "Main Auditorium",
        type: "Showcase",
    },
];
export const learningMaterials = [
    {
        title: "Video Catalog",
        description: "Access our comprehensive collection of dance tutorials and performances.",
        count: "150+ Videos",
        action: "Browse",
        type: "video",
    },
    {
        title: "Documents",
        description: "Download study materials, choreography notes, and reference guides.",
        count: "80+ Resources",
        action: "Browse",
        type: "documents",
    },
];
export const footerLinks = {
    Legal: ["Privacy Policy", "Terms of Service"],
    Support: ["Contact Support", "Instagram", "YouTube"],
};
export const academyLocation = {
    name: "Tampere Dance Studio",
    addressLine1: "Hämeenpuisto 17",
    addressLine2: "33210 Tampere, Finland",
    mapEmbedUrl: "https://www.google.com/maps?q=H%C3%A4meenpuisto%2017%2C%2033210%20Tampere%2C%20Finland&output=embed",
    directionsUrl: "https://www.google.com/maps/search/?api=1&query=H%C3%A4meenpuisto%2017%2C%2033210%20Tampere%2C%20Finland",
};
