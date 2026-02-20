export type ProjectEntry = {
  id: string;
  year: string;
  name: string;
  type: string;
  summary: string;
  content: string;
};

export const projects: ProjectEntry[] = [
  {
    id: "nixentertainment",
    year: "202X",
    name: "Nix Entertainment",
    type: "Media Group",
    summary: "Indie media group focused on webcomics and animated shows.",
    content:
      "Nix Entertainment is a media (animation, games and other categories) studio I created with a small group of amazing people. Our mission is to entertain the world in new ways, to help make it fun and enjoyable again.<br/><br/>Our first and current animated series is Shadowborne Chronicles. Its story goes around Umbriel and Aria, two... friends? maybe we could call it that...<br/>Who unexpectedly meet, and go on a journey to fight against Zarka, the leader of the Shadow Lieutenants and main antagonist of Season 1.<br/>Across their journey they'll discover more about themselves, about their world and about their past, and maybe even learn to accept each other.<br/><br/>We're working on Season 1 at the moment, and once the series is finished, we have some more ideas we'll work on! Stay tuned!<br/><br/>If you want to know more about Nix Entertainment, check it out <a href='https://nixentertainment.com' target='_blank' rel='noopener noreferrer'>here</a>! I must say, the website is fire."
  },
  {
    id: "daydream-valencia",
    year: "2025",
    name: "Daydream Valencia",
    type: "Game Jam",
    summary: "Spain's largest teen Game Jam ever.",
    content:
      "On 2025 I had the pleasure of organising <a href='https://daydream.hackclub.com/valencia' target='_blank' rel='noopener noreferrer'>Daydream Valencia</a>, the largest Game Jam ever for students under 18 in Spain. It was an amazing experience working with Hack Club and our team to create such a fun environment, and all the projects were amazing!<br/><br/>Everyone had an incredible time, and I was so happy to see the creativity and talent of all the participants. We had a lot of fun, and got sponsors like Yubico, AVAST, Hack Club (of couse, they were co-organizers after all).<br/><br/>I hope to organise more events like this in the future (who knows, maybe a \"mediathon\" with Nix Entertainment?)."
  },
  {
    id: "soundchestai",
    year: "2025",
    name: "SoundChestAI (The Challenge 2025)",
    type: "Competition",
    summary: "AI stethoscope prototype for anomaly detection in lung sounds.",
    content:
      "This 2025 my team and I participated in The Challenge, a competition aimed at creating projects that helped fulfill the purposes of the SDGs. Our project, SoundChestAI, was a digital phonendoscope that used AI to help detect possible illnesses in the respiratory system by analyzing sounds with a custom AI model built by me.<br/><br/>We were able to get a ticket to Barcelona (selected out of 3000+ participants) to present our project! It was a very nice experience to showcase our work, and we got to know lots of people that loved our project and encouraged us to keep improving the world.<br/><br/>Quite an amazing experience!"
  },
  {
    id: "goCalp",
    year: "2024",
    name: "goCalp Project Proposal",
    type: "Competition",
    summary: "Horizontal and vertical pop-up garden corridors, inspired by the native microbiome and flora.",
    content:
      "In 2024 I won the \"goCalp\" competition created by Global Omnium, which asked participants to find innovative solutions for cities around the world. My proposal was to create horizontal and vertical pop-up garden corridors, with native microbiome and flora, to enhance biodiversity and provide green spaces for residents and wildlife.<br/><br/>The best 2 projects competed in Calpe, and my project was awarded first price! It was even announced that my idea would be implemented in the future, which is very exciting!<br/><br/>As a side note, I might be participating in too many SDG-related competitions :D but hey I care about the world and want to help :P"
  }
];

export const projectsById = projects.reduce<Record<string, ProjectEntry>>((acc, project) => {
  acc[project.id] = project;
  return acc;
}, {});
