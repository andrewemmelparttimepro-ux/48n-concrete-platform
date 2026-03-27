export type WorkSlide = {
  word: string;
  title: string;
  description: string;
  image: string;
  alt: string;
};

export const workSlides: WorkSlide[] = [
  {
    word: "Commercial",
    title: "Commercial jobs that still have to finish clean",
    description:
      "Pads, slabs, and site concrete still have to look right after turnover. Clean placement and finish quality matter as much as getting the pour down.",
    image: "/media/commercial-aerial.webp",
    alt: "Commercial concrete project completed by 48 North Concrete",
  },
  {
    word: "Flatwork",
    title: "Flatwork customers can judge with their eyes",
    description:
      "Driveways, slabs, and exterior flatwork sell themselves when the finish work, edge quality, and cleanup are visible in the final surface.",
    image: "/media/flatwork-finish.webp",
    alt: "48 North Concrete crew member finishing a slab",
  },
  {
    word: "Foundations",
    title: "Foundations and ICF built for this climate",
    description:
      "Footings, walls, and ICF work have to be laid out for North Dakota conditions from the start, not patched together after the pour is already moving.",
    image: "/media/icf-detail.webp",
    alt: "48 North Concrete crew member placing concrete into ICF forms",
  },
  {
    word: "Footprint",
    title: "Bigger slabs and wider sites still need control",
    description:
      "Large pours read best when you can see the footprint, the sequencing, and the finish discipline all in the same shot.",
    image: "/media/aerial-slab.webp",
    alt: "Aerial view of a large slab project by 48 North Concrete",
  },
  {
    word: "Finish",
    title: "Placement and finish work have to move together",
    description:
      "The work sells better when customers can see the crew in motion instead of hearing abstract promises about quality.",
    image: "/media/concrete-hero.webp",
    alt: "48 North Concrete crew finishing a slab",
  },
  {
    word: "Results",
    title: "Finished work should look like finished work",
    description:
      "Final photos matter because they show the level of care after the pour is done, not just the activity while it is happening.",
    image: "/media/taco-johns.webp",
    alt: "Completed Taco John's project finished by 48 North Concrete",
  },
];
