import { getImageCaption } from "@/lib/entry-images";

export type ProjectEntry = {
  id: string;
  year: string;
  name: string;
  type: string;
  summary: string;
  content: string;
  image?: string;
  ogImage?: string;
  polaroids?: string[];
  polaroidGallery?: boolean;
  polaroidGalleryOffsets?: Record<string, number>;
};

export const works: ProjectEntry[] = [
  {
    id: "shadowborne-characters",
    year: "2025",
    name: "Shadowborne Chronicles Characters",
    type: "Design & Writing",
    summary: "Making characters for the Shadowborne Chronicles animated series.",
    image: "/shadowborne-chronicles-characters-thumbnail.webp",
    ogImage: "/shadowborne-chronicles-character-sheets.webp",
    content: `
<img src="/shadowborne-chronicles-character-sheets.webp" alt="Shadowborne Chronicles character sheets" class="project-banner" />
<p>In 2025, my team and I started working on the Shadowborne Chronicles animated series. As the director of the series, I was in charge of creating the characters.</p>
<p>The show follows two leads, Umbriel and Aria, who fight against Zarka, the villain trying to take them down.</p>
<p>In order to take them from text to visuals, I worked with Daniel Matui, our amazing illustrator, to create their designs. Let's take a look at what we came up with:</p>
<img src="/shadowborne-aria-design.webp" alt="Aria" class="project-banner" />
<p>Aria's a human who can use both light and shadow magic at once, a talent that hadn't been seen for centuries. She doesn't realize how important that is yet, though.</p>
<p>She grew up in an orphanage after her parents left when she was very young. She trusts people fast, sometimes too fast, and that ends up being both her best trait and the thing that gets her hurt the most.</p>
<img src="/shadowborne-aria-concept.webp" alt="${getImageCaption("/shadowborne-aria-concept.webp")}" class="project-banner" />
<p>We wanted to visually showcase her character arc throughout the series, so we made her hair lose its dyed color and become more natural as the story progresses, going from blonde to dark brown.</p>
<img src="/shadowborne-aria-haircolor.webp" alt="${getImageCaption("/shadowborne-aria-haircolor.webp")}" class="project-banner" />
<p>Creating her was a very interesting challenge, since Umbriel's journey partner needed to be someone very special. Finding the balance between trauma and happiness was also a very complex task, but I hope you'll all like how she turned out.</p>
<img src="/shadowborne-umbriel-design.webp" alt="Umbriel" class="project-banner" />
<p>Umbriel is our other main character. He's the ex-leader of the Shadow Lieutenants, who got banished to the In-Between (a prison realm) and comes back centuries later thanks to Aria.</p>
<p>He starts out cold, formal, and can't stand being touched. After a season with Aria... Well, that changes.</p>
<p>His goal in Season One is to reclaim his powers, and make those who wronged him suffer eternally.</p>
<img src="/shadowborne-umbriel-evolution.webp" alt="${getImageCaption("/shadowborne-umbriel-evolution.webp")}" class="project-banner" />
<p>Umbriel was the character that started it all, and appeared to me one night while I was trying to fall asleep. I started to create the world and storyline that same day, and the rest of the characters came naturally after that.</p>
<p>I must say, I'm glad I wasn't able to sleep that night, because otherwise this story wouldn't exist.</p>
<img src="/shadowborne-zarka-design.webp" alt="Zarka" class="project-banner" />
<p>After Umbriel comes Zarka, the first season's villain. He used to be Umbriel's second-in-command, before he decided he deserved the throne more.</p>
<p>He's shorter than Umbriel, which people make fun of him for behind his back (not exactly intimidating), but his actions and words do terrify others.</p>
<img src="/shadowborne-zarka-evolution.webp" alt="${getImageCaption("/shadowborne-zarka-evolution.webp")}" class="project-banner" />
<p>Zarka got rejected once in his childhood and never recovered from it. Now he wants control over everyone, so that can never happen again.</p>
<br/>
<p>These are not all characters in the series, though. While designs for the rest are not public yet, they're being polished as you read this page, and I can't wait to share them all.</p>
<p>If you want to know more about Shadowborne Chronicles, check out the <a href="https://nixentertainment.com/shadowborne-chronicles" target="_blank" rel="noopener">official website</a>!</p>`
  },
  {
    id: "new-nix",
    year: "2025",
    name: "Nix Entertainment's new Branding",
    type: "Design & Branding",
    summary: "New logo, color palette and typography for Nix Entertainment's rebrand.",
    image: "/nix-rebrand-logo.png",
    content: `
<img src="/nix-rebrand-animation.gif" alt="${getImageCaption("/nix-rebrand-animation.gif")}" class="project-banner" />
<p>In November 2025, we decided to rename <img src="/nix.png" alt="" class="bio-inline-logo bio-inline-nix" draggable="false" />Nix Entertainment (called Nix Media at the time). Together with our name, we also wanted to renew our branding, and I was in charge of designing it.</p>
<p>Our old logo used plain white text with just a flat gradient on the smile. It was "fine" as a logo, but we thought it was too dull and didn't reflect who we are as a media group.</p>
<p>Since we still wanted to keep the essence of our old branding, we decided to maintain the logo's shape, but restyle its appearance to represent our uniqueness and creativity.</p>
<p>In order to do this, I hand-made a custom glass shader that's applied to the entire logo, which allows the gradient in the "smile" area to bleed through the "nix" letters.</p>
<img src="/nix-glass-shader-logo.png" alt="Example of the new glass shader" class="project-banner" />
<p>After adding our brand gradient to this new shader, the logo finally looked way more dynamic and interesting, just like we wanted.</p>
<p>Besides the better visual look, it gives us a way to change the logo's colors dynamically and even add animations without having to create multiple versions of it. Here are some examples of the logo in different scenarios:</p>
<img src="/nix-glass-effect-examples.png" alt="Examples of the new logo in 2 different scenarios" class="project-banner" />
<p>We also simplified our color palette and typography to go along with the new branding, and redesigned our website to reflect the new identity, which is available <a href="https://nixentertainment.com" target="_blank" rel="noopener">here</a>.</p>
<p>Finally, we redesigned our social media banner to match our new look, now including Umbriel and Aria, the main characters of our animated series Shadowborne Chronicles.</p>
<img src="/nix-entertainment-banner.jpg" alt="${getImageCaption("/nix-entertainment-banner.jpg")}" class="project-banner" />
<p>We're very happy with the new branding, and hope it will accompany us for many years to come!</p>
    `.trim()
  },
  {
    id: "dimensity",
    year: "2025",
    name: "Dimensity",
    type: "Code & Experimentation",
    summary: "An experimental JS terminal wrapper with autocompletion and more.",
    image: "/dimensity-cli-logo-icon.png",
    content: `<img src="/dimensity-cli-logo-banner.png" alt="Dimensity" class="project-banner" />
<p>Dimensity started as an experiment to see how well JS apps could be converted into standalone binaries across different operating systems and architectures, without needing Node installed on the machine.</p>
<p>After adding features for a while, it eventually became a full shell system that wraps your regular terminal and makes day-to-day usage a bit nicer.</p>
<p>It adds custom smart autocompletion for commands and files (with argument support), a proper command history you can browse with your keyboard, colored outputs, and nice messages and styling.</p>
<p>I was able to compile the same JS codebase into native binaries for macOS, Linux, and Windows on all chipsets, which meant the project was a success.</p>
<p>Dimensity was mostly an experiment and I'm not planning to keep adding features to it, but it ended up being quite a fun tool. It's open source, so if you want to try it or see its code, it's available <a href="https://github.com/justdanielndev/dimensity-oss" target="_blank" rel="noopener noreferrer">here</a>!</p>`
  }
];

export const workById = works.reduce<Record<string, ProjectEntry>>((acc, project) => {
  acc[project.id] = project;
  return acc;
}, {});
