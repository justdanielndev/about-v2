import { getImageCaption } from "@/lib/entry-images";

export type ProjectEntry = {
  id: string;
  year: string;
  name: string;
  type: string;
  summary: string;
  content: string;
  polaroids?: string[];
  polaroidGallery?: boolean;
  polaroidGalleryOffsets?: Record<string, number>;
};

export const projects: ProjectEntry[] = [
  {
    id: "nixentertainment",
    year: "202X",
    name: "Nix Entertainment",
    type: "Media Group",
    summary: "Indie media group focused on webcomics and animated shows.",
    polaroids: ["/nix1.jpg", "/nix-umbriel-reveal.jpg", "/nix-aria-reveal.jpg", "/nix-zarka-reveal.jpg"],
    content: `
<img src="/nix-entertainment-banner.jpg" alt="${getImageCaption("/nix-entertainment-banner.jpg")}" class="project-banner" />
<p><a href="https://nixentertainment.com" target="_blank" rel="noopener">Nix Entertainment</a> is an indie media (animation, games and other categories) studio I founded in 2023. It started as Nix Media doing client work, and as we grew and started working on our own content we rebranded (read more about the process <a href="/work/new-nix">here</a>).</p>
<p>Our team is composed of four volunteers and freelancers who we hire per-project, like our artist Daniel Matui who does most of the illustration work. We're funded by donations and we prefer quality over speed, so we might be a bit slower than what you're used to.</p>
<p>Our first and current animated series is <a href="https://nixentertainment.com/shadowborne-chronicles" target="_blank" rel="noopener">Shadowborne Chronicles</a>, a dark fantasy story following Umbriel and Aria, two (reluctant) travel companions on a journey to fight against Zarka, the leader of the Shadow Lieutenants. All eight episodes of Season One are drafted and four are fully written.</p>
<p>Nothing we make uses generative AI. It looks bad, it can't hold consistency, and it's expensive for the "slop" it makes. But more importantly, we believe if you let AI do your creative work it means you don't care about the project.</p>
    `.trim()
  },
  {
    id: "le-node",
    year: "2026",
    name: "Le Node (Company-grade in-house server)",
    type: "Personal Project",
    summary: "My personal homelab composed of more than 4 servers.",
    content: `
<p>Mostly everything you'll see from me runs on this system.</p>
<p>Le Node is my personal homelab, and is composed of a Proxmox server, a NAS, three Raspberry Pis, a couple of desktop PCs, and a Mac Mini. It runs 24/7 with 99.9% uptime across (currently) 10TB of storage.</p>
<p>In total it has 100+ GB of RAM, with 64 of those being DDR5. It allows me to have coverage of all CPU archs, since it has nodes with Intel, AMD and ARM chips, and runs Windows, Linux, and macOS natively.</p>
<p>Le Node hosts most of my websites, some Nix Entertainment infrastructure, Hack Club projects such as HC Wrapped, some media servers, Home Assistant, a gaming server, and AI experiments.</p>
<p>Deployments are launched via Coolify containers, Proxmox VMs, and LXC containers.</p>
    `.trim()
  },
  {
    id: "daydream-valencia",
    year: "2025",
    name: "Daydream Valencia",
    type: "Game Jam",
    summary: "Spain's first Game Jam for <18 students.",
    polaroids: ["/daydream-valencia-blue-room.jpg", "/daydream-valencia-daniel-mentoring.jpg", "/daydream-valencia-gathering.jpg", "/daydream-valencia-red-room.jpg"],
    polaroidGallery: true,
    content: `
<img src="/daydream-valencia-banner.jpg" alt="${getImageCaption("/daydream-valencia-banner.jpg")}" class="project-banner" />
<p>In September 2025 I organized <a href="https://daydream.hackclub.com/valencia" target="_blank" rel="noopener noreferrer">Daydream Valencia</a>, part of Hack Club's global Daydream weekend, and the first ever game jam in Spain for students under 18.</p>
<p>With around 70 teenagers present, we doubled Hack Club's original predictions, which they kept despite our warnings.</p>
<p>Dealing with this mismatch during the two days meant we needed to spin up extra Wi-Fi networks due to the number of devices, open an extra room to get more floor space, and other similar changes.</p>
<p>The catering budget we were given was only around 500€ for more than 70 people, but the team at <a href="https://asociacion-avast.org/" target="_blank" rel="noopener noreferrer">AVAST</a> kindly offered to cover the rest.</p>
<p>Together with this amazing contribution, their team also worked with us to promote the event around the city, as well as connect us with what would end up being our venue, <a href="https://www.auladeciencia.com/" target="_blank" rel="noopener noreferrer">Aula de Ciencia</a>.</p>
<p><a href="https://www.yubico.com/" target="_blank" rel="noopener noreferrer">Yubico</a> also acted as an event sponsor, giving us a big batch of Yubikeys to distribute to event participants. Thankfully they understood our attendance projection, so we had enough gifts for everyone.</p>
<p>I also want to thank specific people by name, because their contributions were the reason the event worked.</p>
<p>Mariel Navarro and Alex Negre's help was essential to fixing all issues we faced during the event and keeping it running smoothly, and Lisardo Fernández, AVAST vice-president, was the one who made sure everyone was able to have enough food and drinks for the entirety of the event, plus much more.</p>
<p>Despite the multiple issues we faced, we got a very positive NPS of 68/100 from 53 feedback submissions, and lots of interesting suggestions that we'll use to improve future events.</p>
<p>I might organize another competition in the future, but if I do it would be independent, with no global branding or organization, so that we can actually make the best event we can possibly think of.</p>
    `.trim()
  },
  {
    id: "soundchestai",
    year: "2025",
    name: "SoundChestAI (The Challenge 2025)",
    type: "Competition",
    summary: "AI stethoscope prototype selected from 2,034 entries at The Challenge 2025.",
    polaroids: ["/soundchestai-challenge-meeting.jpg", "/soundchestai-challenge-indoors.jpg", "/soundchestai-challenge-photo-backdrop.jpg", "/soundchestai-challenge-matching-shirts.jpg"],
    polaroidGallery: true,
    polaroidGalleryOffsets: {
      "/soundchestai-challenge-meeting.jpg": 90,
      "/soundchestai-challenge-indoors.jpg": 25,
      "/soundchestai-challenge-photo-backdrop.jpg": 20,
      "/soundchestai-challenge-matching-shirts.jpg": 40
    },
    content: `
<img src="/soundchestai-challenge-outdoors.jpg" alt="${getImageCaption("/soundchestai-challenge-outdoors.jpg")}" class="project-banner" />
<p>In May 2025 I presented SoundChestAI at The Challenge's Barcelona campus, as one of 100 teams selected from 2,034 projects across Spain and Portugal.</p>
<p>SoundChestAI is a DIY digital stethoscope that records lung sounds and classifies them with a custom model. I was the team's developer, building the recording chain, model and app, alongside Sandra Palazón, Mónica Arribas and Elisa Asensi.</p>
<p>Around 43% of people worldwide cannot reach a health facility within an hour on foot, and respiratory diseases are among the most common causes of severe illness and death. Our device is designed to let those people know if a visit to a far-away hospital is worth it.</p>
<p>Our device records chest audio, classifies what it hears (wheezes, crackles...), explains what those sounds could mean, and then routes the recording to a clinician for confirmation.</p>
<p>We can record sounds with high precision thanks to Francisco José Martínez Zaldívar, a telecom professor at the UPV. He helped build our sound filtering engine, and without him the audio we record would only be noise.</p>
<p>SoundChestAI costs about 15€ to build, using only a PVC tube, an ESP32, an INMP441 mic, a Rappaport diaphragm, and a 3D-printed bell. This last one was designed by Ludosaurus, who made it cheaper to print and smaller while not distorting audio.</p>
<p>Other digital stethoscopes cost between 250€ and 400€, meaning they are huge expenses for individuals in rural or underdeveloped areas. Despite their price tag, they only amplify sound instead of classifying it.</p>
<p>Because its output is visual, it also works for users with hearing loss. To be able to present our project to those audiences directly, Josep Gimeno taught Mónica sign language.</p>
<p>Our dataset was labelled and cross-checked by clinical teams at Padre Jofre and Quirónsalud. Our testing indicated around 96% accuracy with our proof-of-concept dataset, but a broader rollout would require a wider dataset and testing system with validated clinical organisations.</p>
<p>Building SoundChestAI gave me experience with multi-modal prototypes, machine learning in a healthcare context, and presenting technical work to large audiences.</p>
<p>There was no 2026 edition of The Challenge and the official website is now gone, which is very sad to see. It's the only competition that's really surprised me. Branded venues, a party, merch, a museum visit... Educational but fun. If you find something similar, my advice is to participate.</p>
    `.trim()
  },
  {
    id: "goCalp",
    year: "2024",
    name: "BioDiversiTeam (GoCalp 2024)",
    type: "Competition",
    summary: "Horizontal and vertical pop-up garden corridors, first prize at the II Concurso #goCalp.",
    polaroids: ["/gocalp-project-graph-present.jpg", "/gocalp-first-prize.jpg", "/gocalp3.jpg"],
    polaroidGallery: true,
    content: `
<img src="/gocalp-project-main-presentation.jpg" alt="${getImageCaption("/gocalp-project-main-presentation.jpg")}" class="project-banner" />
<p>In December 2024 my project (BioDiversiTeam) won the II #goCalp Urbanistas por la Sostenibilidad competition, run by Global Omnium and the Ajuntament de Calp.</p>
<p>The contest asked students over 14 to propose solutions to climate problems in their communities. The first prize was 5,000€, and the second 3,000€.</p>
<p>My proposal was a network of pop-up micro-parks (planters of native flora with living space for fauna too) that formed horizontal green corridors designed to link peri-urban vegetation to city centres.</p>
<p>The design principle was microbiological, bringing high diversity within each planter and randomised composition between them, so pollinators and birds could carry microbiota from outside the city.</p>
<p>Planters were designed to be 45×45×80cm and produced from marine-recovered plastic, at 290€ per unit. They were spaced a maximum of 50m apart (based on pollinator dispersal ranges) and required no irrigation.</p>
<p>My proof-of-concept proposed 34 planters running from the Peñón de Ifac into central Calpe. The cost totalled 9,860€ in units, 3,000€ in substrate, and 50€ in seed and mycorrhiza (12,910€ total), with no maintenance required beyond litter collection. This meant that, in the long run, it could be cheaper than the usual decorative planters cities implement.</p>
<p>Each micro-park would also carry a QR code linking to a page showing its flora and fauna as well as letting others sponsor a unit and receive updates from it.</p>
<p>While the organizers said that no first prize had been planned for that edition, they ended up reinstating it after seeing the top two entries.</p>
<p>At the award ceremony, Global Omnium's sustainability director also informed attendees that they were merging the 1st and 2nd prize projects into a pilot under development, to be implemented in Calpe and other Spanish cities.</p>
    `.trim()
  }
];

export const projectsById = projects.reduce<Record<string, ProjectEntry>>((acc, project) => {
  acc[project.id] = project;
  return acc;
}, {});
