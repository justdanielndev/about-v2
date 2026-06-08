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
    content: `
<img src="/nixbanner.jpg" alt="Nix Entertainment" class="project-banner" />
<p>Nix Entertainment is a media (animation, games and other categories) studio I created with a small group of amazing people. Our mission is to entertain the world in new ways, to help make it fun and enjoyable again.</p>
<p>Our first and current animated series is Shadowborne Chronicles. Its story follows Umbriel and Aria, two... friends? Maybe we could call it that...<br/>They unexpectedly meet, and go on a journey to fight against Zarka, the leader of the Shadow Lieutenants and main antagonist of Season 1.<br/>Across their journey they'll discover more about themselves, about their world and about their past, and maybe even learn to accept each other.</p>
<p>We're working on Season 1 at the moment, and once the series is finished, we have some more ideas we'll work on! Stay tuned!</p>
<p>If you want to know more about Nix Entertainment, check it out <a href="https://nixentertainment.com" target="_blank" rel="noopener noreferrer">here</a>!</p>
    `.trim()
  },
  {
    id: "le-node",
    year: "202X",
    name: "Le Node (Company-grade in-house server)",
    type: "Personal Project",
    summary: "My personal homelab composed of more than 4 servers.",
    content: `
<p>Mostly everything you'll see from me runs on this system.</p>
<p>Le Node is my personal homelab, and is composed of a Proxmox server, a NAS, three Raspberry Pis, a couple of desktop PCs, and a Mac Mini. It runs 24/7 with 99.9% uptime across (currently) 10TB of storage.</p>
<p>In total it has 100+ GB of RAM, with 64 of those being DDR5. It allows me to have coverage of all CPU archs, since it has nodes with Intel, AMD and ARM chips, and runs Windows, Linux, and macOS natively.</p>
<p>Le Node hosts most of my websites, some Nix Entertainment infrastructure, Hack Club projects such as HC Wrapped, some media servers, Home Assistant, a gaming server, and AI experiments.</p>
<p>Deployments are launched via both Coolify containers and Proxmox VMs and LXC containers.</p>
    `.trim()
  },
  {
    id: "daydream-valencia",
    year: "2025",
    name: "Daydream Valencia",
    type: "Game Jam",
    summary: "Spain's largest teen Game Jam ever.",
    content: `
<img src="/daydreambanner.jpg" alt="Daydream Valencia" class="project-banner" />
<p>In 2025 I had the pleasure of organising <a href="https://daydream.hackclub.com/valencia" target="_blank" rel="noopener noreferrer">Daydream Valencia</a>, the largest Game Jam ever for students under 18 in Spain. It was an amazing experience working with Hack Club and our team to create such a fun environment, and all the projects were amazing!</p>
<p>Everyone had an incredible time, and I was so happy to see the creativity and talent of all the participants. We had a lot of fun, and got sponsors like Yubico, AVAST, Hack Club (of course, they were co-organizers after all).</p>
<p>I hope to organise more events like this in the future (who knows, maybe a "mediathon" with Nix Entertainment?).</p>
    `.trim()
  },
  {
    id: "soundchestai",
    year: "2025",
    name: "SoundChestAI (The Challenge 2025)",
    type: "Competition",
    summary: "AI stethoscope prototype for anomaly detection in lung sounds.",
    content: `
<img src="/challengebanner.jpg" alt="SoundChestAI — The Challenge 2025" class="project-banner" />
<p>In 2025, my team and I participated in The Challenge, a competition aimed at creating projects that helped fulfill the purposes of the SDGs. Our project, SoundChestAI, was a digital stethoscope that used AI to help detect possible illnesses in the respiratory system by analyzing sounds with a custom AI model built by me.</p>
<p>Out of 3000+ participants, our team was selected to present in Barcelona. We got to showcase the project to hundreds of people around the country and see what others were building across the competition. Everyone was very friendly, and we had a great time!</p>
    `.trim()
  },
  {
    id: "goCalp",
    year: "2024",
    name: "goCalp Project Proposal",
    type: "Competition",
    summary: "Horizontal and vertical pop-up garden corridors, inspired by the native microbiome and flora.",
    content: `
<img src="/gocalpbanner.jpg" alt="goCalp" class="project-banner" />
<p>In 2024 I won the "goCalp" competition created by Global Omnium, which asked participants to find innovative solutions for cities around the world. My proposal was to create horizontal and vertical pop-up garden corridors, with native microbiome and flora, to enhance biodiversity and provide green spaces for residents and wildlife.</p>
<p>The best projects competed in Calpe, and mine was awarded first prize! It was even announced that my idea would be implemented in the future.</p>
<p>I keep coming back to SDG-focused competitions, I guess there are a lot of problems worth solving!</p>
    `.trim()
  }
];

export const projectsById = projects.reduce<Record<string, ProjectEntry>>((acc, project) => {
  acc[project.id] = project;
  return acc;
}, {});
