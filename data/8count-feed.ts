export interface NewsletterSpotlight {
  title: string
  description: string
  image: string
  ctaText: string
  ctaLink: string
}

export interface NewsletterContent {
  heroImage: {
    desktop: string
    mobile: string
  }
  foundersNote: {
    text: string
    image: string
  }
  lastMonthGif: string
  spotlights: NewsletterSpotlight[]
  featuredPost: {
    title: string
    image: string
    content: string
  }
  theDropGif: string
  upcomingEvent: {
    title: string
    description: string
    image: string
    ctaText: string
    ctaLink: string
  }
}

export interface FeedItem {
  id: string
  date: string
  title: string
  type: "video" | "article" | "podcast" | "newsletter" | "fight-recap" | "training" | "news" | "community"
  summary: string
  authors: string[]
  topics: string[]
  link: string
  slug: string
  ogImage: string
  content?: string
  image?: string
  readTime?: number
  published?: boolean
  newsletterContent?: NewsletterContent
}

export const feedItems: FeedItem[] = [
  {
    id: "1",
    date: "2025.6.02",
    title: "The Road to RGVSW",
    type: "newsletter",
    summary:
      "You can't tell meaningful stories from a distance which is why our team headed to Brownsville for RGV Startup Week 2025.",
    authors: ["Digital Canvas Team"],
    topics: ["Community", "Innovation", "Creative"],
    link: "/thefeed/the-road-to-rgvsw",
    slug: "the-road-to-rgvsw",
    ogImage: "/images/feed/rgvsw-og.png",
    content: "You can't tell meaningful stories from a distance which is why our team headed to Brownsville for RGV Startup Week 2025. This wasn't a one-off trip. We've been building relationships in the Rio Grande Valley for months.",
    image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/junehero.jpg",
    readTime: 8,
    published: true,
    newsletterContent: {
      heroImage: {
        desktop: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/junehero.jpg",
        mobile: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/june-mobile.png",
      },
      foundersNote: {
        text: "Whether it’s SDOH work in the Valley, closing the digital gap with TechBloc, supporting ecosystem builders at Emerge and Rise, or sharing a message with a connected community — it all comes back to one thing: access. Access to health, tech, capital, or simply a seat at the table. The stories we tell are about real people building real things. Actions Speak Louder!",
        image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/june-founder.png",
      },
      lastMonthGif: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/motion.gif",
      spotlights: [
        {
          title: "Emerge and Rise Open House ",
          description:
            "Vemos Vamos & DevSA link up with Lina Rugova and Christine Colburn for a closer look at the vision behind Emerge and Rise.",
          image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/emergeopenhouse.jpeg",
          ctaText: "Learn More",
          ctaLink: "https://emergeandrise.org/",
        },
        {
          title: "Cine Las Americas",
          description: "Our very own Miguel Cedillo struck a chord at this years Cine Las Americas International Film Festival.",
          image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/cinemiguel.jpeg",
          ctaText: "Learn More",
          ctaLink: "https://cinelasamericas.org/",
        },
        {
          title: "Closing the Digital Gap",
          description: "What happens when 110 families suddenly get access to tech they never had? TechBloc, Human-I-T, and SA Hope Center teamed up to find out. See how access to technology is still reshaping health and economic equity.",
          image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/closinggap.jpg",
          ctaText: "Learn More",
          ctaLink: "https://www.sanantoniotechday.com/",
        },
      ],
      featuredPost: {
        title: "The Road to RGVSW: Proximity Matters",
        image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/junefeatured.jpeg",
        content:
          "You can’t tell meaningful stories from a distance which is why our team headed to Brownsville for RGV Startup Week 2025. This wasn’t a one-off trip. We’ve been building relationships in the Rio Grande Valley for months. <br/><br/> At 434 Media, we believe storytelling is a team sport. It takes care, consistency, and cultural awareness to bring someone else’s vision to life, especially when those stories are shaping the future of public health, economic opportunity, and innovation. <br/><br/><strong>Que es SDOH? Glad you asked!</strong>",
      },
      theDropGif: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/drop.gif",
      upcomingEvent: {
        title: "AIM 2025 Health R&D Summit",
        description:
          "Never miss a meetup. Explore our new community events page. Events are added weekly so check back often!",
        image: "https://ampd-asset.s3.us-east-2.amazonaws.com/aim-group.jpg",
        ctaText: "Explore Events",
        ctaLink: "https://www.434media.com/events",
      },
    },
  },
  {
    id: "2",
    date: "2025.11.03",
    title: "434 Crashes SASW 10th Year",
    type: "newsletter",
    summary:
      "If SASW 2025 proved anything, it's that San Antonio has incredible momentum right now and it's fueled by those bold enough to imagine what's next.",
    authors: ["Digital Canvas Team"],
    topics: ["Development", "Design", "Technology"],
    link: "/thefeed/434-crashes-sasw-10th-year",
    slug: "434-crashes-sasw-10th-year",
    ogImage: "/images/feed/434-crashes-sasw-10th-year-og.png",
    content: "As the sun set over downtown from the top of 300 Main, our team joined hundreds of founders, creators, and dreamers at TechBloc's networking mixer during San Antonio Startup Week 2025.",
    image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/November+Cover_Desktop.jpg",
    readTime: 10,
    published: true,
    newsletterContent: {
      heroImage: {
        desktop: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/November+Cover_Desktop.jpg",
        mobile: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/November+Cover.jpg",
      },
      foundersNote: {
        text: "It’s been a busy month! From <strong>Texas Venture Fest</strong>, where we talked a lil’ pinche, through <strong>San Antonio Startup Week</strong>, one theme kept echoing: <br/> <br/> <strong>San Antonio Rising!</strong> <br/> <br/> As we stand on the precipice of a historic vote (read: <a href=\"https://sanantonioreport.org/what-is-prop-a-prop-b-bexar-county-venue-tax-election-ballot-language-explainer/\" style=\"color: blue; text-decoration: underline;\">What are Prop A and Prop B</a>), I’m reminded of the confidence we found in the people and partners shaping this city’s future. The energy, ambition, and creativity we witnessed this week — and in so many others working to leave a legacy that’s both rich and enriching — are proof that San Antonio’s future is as bright as the minds fueling the current conversation. <br/> <br/> As for 11/4: <strong>Don’t be a Goober…</strong><a href=\"https://sanantonioreport.org/uber-leave-san-antonio-lyft-fence/\" style=\"color: blue; text-decoration: underline;\">again</a>.",
        image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/Marcos5.PNG",
      },
      lastMonthGif: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/motion.gif",
      spotlights: [
        {
          title: "Expanding the Mission of Collaboration",
          description:
            "<strong>AIM 2026</strong> returns with an expanded focus on creating an always-on environment that connects AIM programming to the broader innovation ecosystem through <strong>VelocityTX</strong> and community partnerships. <br/> <br/> This year-round approach strengthens collaboration across academia, industry, and the military—cementing San Antonio’s position as a national hub for bioscience, dual-use innovation, and economic growth. Curious about innovating in the Federal space?",
          image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/aimannounced.png",
          ctaText: "Register Now!",
          ctaLink: "https://www.aimsatx.com/",
        },
        {
          title: "Vemos Vamos Launches The Culture Deck",
          description:
            "You’re early — and that’s a good thing. This growing library functions like a hand of cards, a set of creative insights and cultural drops you can use to play smarter in business and storytelling. Be the first to receive The Culture Deck when it launches.",
          image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/vemosinsights.jpg",
          ctaText: "Subscribe Here",
          ctaLink: "https://www.vemosvamos.com/",
        },
        {
          title: "learn2AI Launched with a Bold Vision for the 210",
          description:
            "<strong>San Antonio Startup Week</strong> may have wrapped, but the momentum continues. This year, <a href=\"https://www.learn2ai.co/\" style=\"color: blue; text-decoration: underline;\">Learn2AI</a>, <a href=\"https://www.434media.com/\" style=\"color: blue; text-decoration: underline;\">434 MEDIA</a>, and <a href=\"https://www.devsa.community/\" style=\"color: blue; text-decoration: underline;\">DEVSA</a> set out to make San Antonio one of the most AI-literate cities by 2030. <br/> <br/> The collaboration debuted with an interactive workshop where founders and small businesses got a peek under the hood of agenticAI, exploring the technical layers behind how functional AI agents are built and applied in real-world use cases. <br/> <br/>  Read the full story and see what’s next for this collaboration.",
          image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/agents.png",
          ctaText: "Learn More",
          ctaLink: "https://www.434media.com/blog/a-new-chapter-for-san-antonios-tech-community",
        },
      ],
      featuredPost: {
        title: "434 Crashes SASW 10th Year",
        image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/saswcrash.jpeg",
        content:
          "As the sun set over downtown from the top of 300 Main, our team joined hundreds of founders, creators, and dreamers at TechBloc’s networking mixer during <strong>San Antonio Startup Week 2025</strong>. The space was alive with conversation, ideas traded hands as easily as handshakes, and the view mirrored the energy of a city on the rise. <br/> <br/> It was also a night of milestones, as <strong>Beto Altamirano</strong> took the mic for his first public address as <strong>TechBloc’s new CEO</strong>, sharing a message that resonated across the rooftop: <br/> <br/> “The next Rackspace, the next tech company to put San Antonio on the global map is already taking shape.” <br/> <br/> During <strong>San Antonio Startup Week</strong>, we teamed up with <strong>VelocityTX</strong>, <strong>Univision San Antonio</strong>, and <strong>Methodist Healthcare Ministries</strong> to lead conversations around innovation and inclusion reaching over <strong>800,000</strong> impressions across platforms. <br/> <br/> If SASW 2025 proved anything, it’s that San Antonio has incredible momentum right now and it’s fueled by those bold enough to imagine what’s next.",
      },
      theDropGif: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/drop.gif",
      upcomingEvent: {
        title: "The First Python Conference in San Antonio",
        description:
          "Alamo Python, the PyTexas Foundation, and DEVSA are excited to activate the first-ever Python conference in San Antonio!",
        image: "https://ampd-asset.s3.us-east-2.amazonaws.com/The+Feed/flyers-11-python.png",
        ctaText: "Explore Events",
        ctaLink: "https://www.434media.com/events",
      },
    },
  },
]

export const feedTypes = ["video", "article", "podcast", "newsletter", "fight-recap", "training", "news", "community"] as const
export const feedTopics = [
  "Community",
  "Innovation", 
  "Creative",
  "Development",
  "Design",
  "Technology",
  "Collaboration",
  "Trends",
  "Review",
  "Milestones",
  "Podcast",
  "Creators",
  "Interviews",
  "Technique",
  "Champions",
  "History",
  "Equipment", 
  "Nutrition",
  "Psychology",
  "Legends",
  "Upcoming",
  "Training",
] as const
export const feedAuthors = ["Digital Canvas Team", "Dev Team", "Creative Team", "Podcast Team"] as const