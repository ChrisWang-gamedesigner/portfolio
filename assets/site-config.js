/*
 * Site content. Edit this file to change text, projects, images and carousel
 * behaviour. Page structure lives in index.html, styling in assets/site.css,
 * behaviour in assets/site.js.
 */
window.SITE = {
  name: "Chris Wang",

  nav: [
    { label: "Work", href: "#work" },
    { label: "Contact", href: "#contact" }
  ],

  hero: {
    // Three tiers, largest to smallest.
    line1: "When things became abnormal.",
    line2: "But you didn't notice then.",
    line3: "Games by Chris Wang.",
    // Temporary: cropped Gonggong capture. Replace with a dedicated render.
    background: "assets/images/hero-temp.jpg",
    // Alternates kept for later:
    // "At the time, it all seemed normal."
    // "It didn't feel strange at the time."
    // "Nobody noticed when it changed."
  },

  carousel: {
    interval: 5500,        // ms per image
    transition: "fade",    // "fade" | "slide"
    pauseOnHover: true
  },

  // Order here = order in the carousel. Project 1 plays first.
  projects: [
    {
      id: "gonggong",
      title: "The Wrath of Gonggong",
      meta: "Level & gameplay design · UE 5.7 · Playable V0.2",
      // One line under the title in the reel caption.
      summary: "A third-person level where one tool — creating ice — keeps changing its role: crossing, choosing, escaping, fighting.",
      link: "gonggong.html",
      linkLabel: "View project",
      images: [
        { src: "assets/images/ice-learning.jpg", alt: "Created ice platforms form a route through the cave pool" },
        { src: "assets/images/ice-choice.jpg", alt: "Annotated bridge route and direct water route at Taoyuan waters" },
        { src: "assets/images/troll-after.jpg", alt: "Troll encounter with the ice wall visible behind the enemies" },
        { src: "assets/images/avalanche-after.jpg", alt: "Denser and larger snowballs form the revised avalanche front" },
        { src: "assets/images/ice-pressure.jpg", alt: "The player faces the river and distant cave during the escape" },
        { src: "assets/images/ice-combat.jpg", alt: "The player stands on a created ice platform during the boss encounter" }
      ]
    },
    {
      id: "blessing",
      title: "Blessing",
      meta: "Incremental game · In development",
      link: null,
      // No images yet: shown as a text slide.
      note: "A small shop grows into a corporation. Every efficiency upgrade costs someone.",
      images: []
    },
    {
      id: "codepunk",
      title: "CodePunk",
      meta: "Branching narrative · In development",
      link: null,
      note: "Ordinary life, three years, a phone that decides where you may go.",
      images: []
    }
  ],

  info: {
    email: "contact@chriswang-gamedesigner.com",
    role: "Game designer — level, systems, narrative.",
    colophon: "Set in serif and mono. Built by hand."
  }
};
