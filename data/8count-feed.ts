export interface FeedItem {
  id: string
  slug: string
  date: string
  title: string
  type: "fight-recap" | "training" | "news" | "community"
  summary: string
  content: string
  authors: string[]
  topics: string[]
  readTime?: number
  image?: string
}

export const feedItems: FeedItem[] = [
  {
    id: "1",
    slug: "fury-vs-usyk-rematch-breakdown",
    date: "2025.01.20",
    title: "Fury vs Usyk II: The Rematch That Will Define a Generation",
    type: "fight-recap",
    summary:
      "A comprehensive breakdown of the highly anticipated rematch between Tyson Fury and Oleksandr Usyk. Technical analysis of the first fight's key moments and what adjustments both camps need to make for the rematch.",
    content: `The heavyweight division hasn't seen this level of skill and drama in decades. When Fury and Usyk first met, we witnessed a masterclass in boxing IQ from both fighters. Now, with the rematch looming, the chess match continues.

Key Takeaways from Fight One:
- Usyk's ability to switch stances disrupted Fury's rhythm
- Fury's size advantage was neutralized by Usyk's movement
- The championship rounds will be crucial

What to expect in the rematch: Both fighters will come with new game plans. Fury needs to establish his jab earlier, while Usyk must find ways to conserve energy for the later rounds.`,
    authors: ["Marcus Stone", "Elena Rodriguez"],
    topics: ["Champions", "Technique"],
    readTime: 8,
  },
  {
    id: "2",
    slug: "mayweather-defensive-masterclass",
    date: "2025.01.18",
    title: "The Shoulder Roll: Breaking Down Mayweather's Defensive Genius",
    type: "training",
    summary:
      "An in-depth technical guide to Floyd Mayweather's signature defensive technique. Learn the fundamentals of the shoulder roll and how to incorporate it into your own game.",
    content: `Floyd Mayweather Jr. redefined defensive boxing with his perfection of the shoulder roll technique. This wasn't just natural talent - it was thousands of hours of deliberate practice.

The Fundamentals:
1. Positioning - Keep your lead shoulder high
2. Weight distribution - Stay on the balls of your feet
3. Head movement - Roll with punches, don't just block

Common Mistakes:
Many fighters try to copy the shoulder roll without understanding the footwork beneath it. The roll is useless without proper positioning.`,
    authors: ["Coach James Williams"],
    topics: ["Technique", "Training"],
    readTime: 12,
  },
  {
    id: "3",
    slug: "ali-legacy-60-years",
    date: "2025.01.15",
    title: "Muhammad Ali: 60 Years Since 'I Shook Up The World'",
    type: "news",
    summary:
      "Reflecting on Muhammad Ali's victory over Sonny Liston and how it changed boxing forever. The cultural impact of Ali's career extends far beyond the ring.",
    content: `Sixty years ago, a young Cassius Clay shocked the world by defeating the seemingly invincible Sonny Liston. What followed was more than boxing history - it was a cultural revolution.

Ali's Impact:
- Brought unprecedented showmanship to boxing
- Used his platform for social justice
- Inspired generations of athletes to speak out

His fighting style - the float and sting - was revolutionary. He proved heavyweights could move like middleweights.`,
    authors: ["Dr. Sarah Thompson"],
    topics: ["History", "Legends", "Champions"],
    readTime: 10,
  },
  {
    id: "4",
    slug: "nutrition-guide-fight-camp",
    date: "2025.01.12",
    title: "Fueling the Fighter: Nutrition Strategies for Fight Camp",
    type: "training",
    summary:
      "A comprehensive nutrition guide for fighters preparing for competition. Learn how to optimize your diet for performance, recovery, and making weight safely.",
    content: `Making weight while maintaining strength and energy is one of the biggest challenges fighters face. Here's how the pros do it.

Phase 1: Building Phase (12-8 weeks out)
- High protein intake (1.2g per lb bodyweight)
- Complex carbs for energy
- Healthy fats for hormone production

Phase 2: Cutting Phase (8-4 weeks out)
- Gradual calorie reduction
- Increase water intake
- Monitor weight daily

Phase 3: Peak Week
- Strategic water manipulation
- Sodium management
- Final weight cut protocols`,
    authors: ["Dr. Michael Chen", "Nutritionist Lisa Park"],
    topics: ["Nutrition", "Training"],
    readTime: 15,
  },
  {
    id: "5",
    slug: "local-gym-spotlight-broadway",
    date: "2025.01.10",
    title: "Gym Spotlight: Broadway Boxing's Impact on Community",
    type: "community",
    summary:
      "How one local boxing gym is changing lives and keeping kids off the streets. The story of Broadway Boxing and its founder's mission to give back.",
    content: `In the heart of the city, Broadway Boxing stands as more than just a gym - it's a sanctuary for youth who need direction.

Founder Tony Martinez opened the gym 15 years ago with a simple mission: provide a safe space for kids to learn discipline, respect, and self-defense.

The Impact:
- 200+ youth served annually
- 15 amateur champions produced
- 2 current pros who started here
- 0% of members involved in gang activity

"Boxing saved my life," says Martinez. "Now I'm using it to save others."`,
    authors: ["Community Reporter Jessica Adams"],
    topics: ["Community"],
    readTime: 6,
  },
  {
    id: "6",
    slug: "hand-wrapping-ultimate-guide",
    date: "2025.01.08",
    title: "The Art of Hand Wrapping: Protect Your Most Important Tools",
    type: "training",
    summary:
      "Master the essential skill of hand wrapping. Different wrapping techniques for training, sparring, and competition explained step-by-step.",
    content: `Your hands are your weapons. Protecting them properly isn't optional - it's mandatory.

Why Hand Wraps Matter:
- Prevent boxer's fracture
- Support wrist joint
- Compress knuckles
- Absorb sweat

Classic Wrap Technique (180"):
1. Loop around thumb
2. Three wraps around wrist
3. Three wraps around knuckles
4. Between each finger
5. Lock it down around wrist

Pro tip: Always wrap the same way every time. Build muscle memory.`,
    authors: ["Coach Ramon Vasquez"],
    topics: ["Technique", "Equipment", "Training"],
    readTime: 7,
  },
  {
    id: "7",
    slug: "tyson-prime-vs-ali-prime",
    date: "2025.01.05",
    title: "The Eternal Question: Prime Tyson vs Prime Ali",
    type: "news",
    summary:
      "A deep dive into the greatest hypothetical matchup in boxing history. Breaking down styles, attributes, and what would happen if these legends met in their primes.",
    content: `It's the debate that never dies. Two of the greatest heavyweights of all time, separated by decades. Who would win?

Mike Tyson's Advantages:
- Explosive power
- Peek-a-boo defense
- Intimidation factor
- First-round knockout ability

Muhammad Ali's Advantages:
- Superior footwork
- Reach and height
- Endurance
- Ring IQ

The Verdict: Ali's movement would frustrate Tyson early. If Tyson couldn't catch him in the first 4 rounds, Ali would take over and outbox him. Ali by late TKO or decision.`,
    authors: ["Fight Analyst Robert Cruz"],
    topics: ["Legends", "History"],
    readTime: 11,
  },
  {
    id: "8",
    slug: "crawford-vs-canelo-possibility",
    date: "2025.01.03",
    title: "Crawford at 168? Breaking Down the Canelo Super Fight",
    type: "news",
    summary:
      "Terence Crawford hints at moving up to super middleweight to face Canelo Álvarez. Is this fight realistic, and what would need to happen to make it a reality?",
    content: `Terence "Bud" Crawford shocked the boxing world with recent comments about facing Canelo Álvarez at 168 pounds. Is this fight possible?

The Reality Check:
- Crawford is naturally 147-154 lbs
- Canelo fights at 168 lbs
- That's a 20+ pound difference
- Crawford is 37 years old

Historical Context:
Remember when Roy Jones Jr. moved up to heavyweight? He won, but the move ultimately damaged his legacy when he came back down.

The Verdict: It's a money fight, but not a smart fight for Crawford's legacy. Sometimes the best fights are the ones that don't happen.`,
    authors: ["Senior Writer David Kim"],
    topics: ["Champions", "Upcoming"],
    readTime: 9,
  },
  {
    id: "9",
    slug: "mental-game-championship-rounds",
    date: "2025.01.01",
    title: "The Mental Game: Winning When Your Body Says Quit",
    type: "training",
    summary:
      "Sports psychology insights for fighters. How champions develop mental toughness and what you can learn from their approach to pressure situations.",
    content: `The fight is won in training, but championships are won in the mind. When both fighters are exhausted, who has the mental edge?

Mental Training Techniques:
1. Visualization - See yourself winning before you step in the ring
2. Breathing control - Calm your mind under pressure
3. Positive self-talk - Your inner voice matters
4. Embracing discomfort - Learn to love the grind

Championship Rounds:
Rounds 10-12 are where legends are made. Your body will beg you to quit. Your mind must be stronger.

Practice mental toughness in every training session. The mind is a muscle too.`,
    authors: ["Sports Psychologist Dr. Amanda Foster"],
    topics: ["Psychology", "Training", "Champions"],
    readTime: 13,
  },
  {
    id: "10",
    slug: "glove-buyers-guide-2025",
    date: "2024.12.28",
    title: "Boxing Gloves Buyer's Guide: Finding Your Perfect Pair",
    type: "training",
    summary:
      "Everything you need to know about boxing gloves. From size selection to brand comparisons, make an informed decision on your next glove purchase.",
    content: `Not all gloves are created equal. Here's how to choose the right pair for your needs.

Glove Weight Guide:
- 8-10 oz: Competition only
- 12 oz: Light sparring
- 14 oz: Standard sparring
- 16 oz: Heavy sparring/heavy bag

Top Brands Compared:
1. Winning - The gold standard (price: $$$)
2. Cleto Reyes - Puncher's glove (price: $$)
3. Everlast - Budget-friendly (price: $)
4. Grant - Custom fit perfection (price: $$$)

What to Look For:
- Proper wrist support
- Quality stitching
- Comfortable padding
- Break-in period

Investment tip: Buy once, cry once. Quality gloves last years.`,
    authors: ["Equipment Expert Tom Bradley"],
    topics: ["Equipment", "Training"],
    readTime: 10,
  },
]

// Helper function to count items by type
function countByType(type: FeedItem["type"]): number {
  return feedItems.filter((item) => item.type === type).length
}

// Helper function to count items by topic
function countByTopic(topic: string): number {
  return feedItems.filter((item) => item.topics.some((t) => t.toLowerCase() === topic.toLowerCase())).length
}

// Dynamically generated feed types with actual counts
export const feedTypes = [
  { id: "fight-recap", label: "Fight Recap", count: countByType("fight-recap") },
  { id: "training", label: "Training", count: countByType("training") },
  { id: "news", label: "News", count: countByType("news") },
  { id: "community", label: "Community", count: countByType("community") },
]

// Dynamically generated feed topics with actual counts
export const feedTopics = [
  { id: "technique", label: "Technique", count: countByTopic("Technique") },
  { id: "champions", label: "Champions", count: countByTopic("Champions") },
  { id: "history", label: "History", count: countByTopic("History") },
  { id: "equipment", label: "Equipment", count: countByTopic("Equipment") },
  { id: "nutrition", label: "Nutrition", count: countByTopic("Nutrition") },
  { id: "psychology", label: "Psychology", count: countByTopic("Psychology") },
  { id: "legends", label: "Legends", count: countByTopic("Legends") },
  { id: "upcoming", label: "Upcoming", count: countByTopic("Upcoming") },
  { id: "training", label: "Training", count: countByTopic("Training") },
  { id: "community", label: "Community", count: countByTopic("Community") },
]
