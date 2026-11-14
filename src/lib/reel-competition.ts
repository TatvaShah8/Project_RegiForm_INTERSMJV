/**
 * INTER SMJV 2026 — Official Reel Making Competition Regulations
 * Digital Challenge: "THE REEL ARENA – SMJV 2026"
 * Transcribed from official tournament documentation by SMJV Vadodara Organising Committee.
 * Note: PDF download is restricted; all rules are rendered natively for registered students.
 */

export interface ReelRule {
  id: number;
  number: string;
  title: string;
  summary: string;
  category: "eligibility" | "format" | "content" | "submission" | "fairplay";
  badge: string;
  iconName: string;
}

export interface JudgingCriterion {
  parameter: string;
  whatJudgesLookFor: string;
  marks: number;
  accent: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  highlight?: boolean;
}

export const REEL_COMPETITION = {
  presenter: "SMJV VADODARA PRESENTS",
  tagline: "BEFORE THE GAME BEGINS, THE REEL BATTLE BEGINS!",
  title: "THE REEL ARENA – SMJV 2026",
  subtitle: "12 SMJVs · ONE DIGITAL BATTLEFIELD · UNLIMITED CREATIVITY",
  edition: "THE FIRST-EVER SMJV INTER-SMJV REEL MAKING COMPETITION",
  
  mission: {
    heading: "THE COUNTDOWN STARTS BEFORE THE FIRST WHISTLE!",
    body: "The excitement of the Inter-SMJV Sports Tournament begins long before the players step onto the field. For the first time, SMJV is bringing all 12 SMJVs together for a creative digital challenge. Create a powerful Reel that builds hype, celebrates hostel spirit and gets everyone excited for 24, 25, 26 & 27 December 2026.",
    callToAction: "Your mission: Turn your creativity into tournament excitement. Tell a story, capture the spirit of sportsmanship and make your SMJV's voice stand out!",
  },

  quickSpecs: [
    { label: "FORMAT", value: "Vertical (9:16)", sub: "Instagram Reels & YouTube Shorts", icon: "Smartphone" },
    { label: "DURATION", value: "30 – 60 Seconds", sub: "Strict length enforcement", icon: "Clock" },
    { label: "PARTICIPANTS", value: "Max 3 People", sub: "Individual entry only", icon: "Users" },
    { label: "LANGUAGES", value: "Hindi / Gujarati / English", sub: "Multilingual allowed", icon: "Languages" },
    { label: "PLATFORMS", value: "Instagram & YouTube", sub: "Tag official SMJV account", icon: "Share2" },
    { label: "DEADLINE", value: "25 November 2026", sub: "Submit link & video file", icon: "CalendarAlert" },
  ],

  rules: [
    {
      id: 1,
      number: "01",
      title: "Individual Entry",
      summary: "This is an individual competition. Group entries or group submissions will not be accepted.",
      category: "eligibility",
      badge: "SOLO PARTICIPATION",
      iconName: "UserCheck",
    },
    {
      id: 2,
      number: "02",
      title: "People in the Reel",
      summary: "A maximum of 3 people may appear in the Reel, including the participant.",
      category: "eligibility",
      badge: "MAX 3 PERSONS",
      iconName: "Users",
    },
    {
      id: 3,
      number: "03",
      title: "Duration Requirement",
      summary: "Each Reel must be between 30 and 60 seconds.",
      category: "format",
      badge: "30-60 SECONDS",
      iconName: "Clock",
    },
    {
      id: 4,
      number: "04",
      title: "Aspect Ratio & Format",
      summary: "Reels must be vertical (9:16), suitable for Instagram Reels.",
      category: "format",
      badge: "VERTICAL 9:16",
      iconName: "Smartphone",
    },
    {
      id: 5,
      number: "05",
      title: "Strict Originality",
      summary: "Content must be original. Direct copying or reposting another creator's work is not allowed.",
      category: "content",
      badge: "100% ORIGINAL",
      iconName: "Sparkles",
    },
    {
      id: 6,
      number: "06",
      title: "Tournament Connection",
      summary: "The Reel must promote or relate to the Inter-SMJV Sports Tournament 2026, its sports, spirit, participants or build-up.",
      category: "content",
      badge: "INTER SMJV SPIRIT",
      iconName: "Flame",
    },
    {
      id: 7,
      number: "07",
      title: "Theme & Creative Brief",
      summary: "The official theme, content requirements and creative guidelines will be revealed on 15 November 2026. Reel creation may begin from 20 November 2026.",
      category: "content",
      badge: "THEME REVEAL: 15 NOV",
      iconName: "Compass",
    },
    {
      id: 8,
      number: "08",
      title: "Permitted Languages",
      summary: "Hindi, Gujarati or English may be used.",
      category: "content",
      badge: "HINDI · GUJARATI · ENGLISH",
      iconName: "Globe",
    },
    {
      id: 9,
      number: "09",
      title: "Creative Tools & Effects",
      summary: "Editing, transitions, cinematic shots, voice-overs, sound effects and background music are permitted.",
      category: "format",
      badge: "CINEMATIC & AUDIO OK",
      iconName: "Wand2",
    },
    {
      id: 10,
      number: "10",
      title: "Posting & Social Tagging",
      summary: "Participants must post their Reel on Instagram as well as YouTube, tag the official SMJV account and use the prescribed hashtag(s), which will be shared by the SMJV Vadodara Organising Committee.",
      category: "submission",
      badge: "INSTAGRAM & YOUTUBE",
      iconName: "Share2",
    },
    {
      id: 11,
      number: "11",
      title: "Final Submission Deadline",
      summary: "Every participant must submit the Reel link and original video file, and ensure the Reel is posted on Instagram as well as YouTube, on or before 25 November 2026.",
      category: "submission",
      badge: "BY 25 NOV 2026",
      iconName: "UploadCloud",
    },
    {
      id: 12,
      number: "12",
      title: "Fair Play & Anti-Bot Enforcement",
      summary: "Fake likes, purchased views, bots or any unfair engagement practices may lead to disqualification.",
      category: "fairplay",
      badge: "NO BOTS / FAKE LIKES",
      iconName: "ShieldAlert",
    },
    {
      id: 13,
      number: "13",
      title: "Appropriate Content",
      summary: "Offensive, misleading or disrespectful content will not be accepted.",
      category: "fairplay",
      badge: "RESPECTFUL & APPROPRIATE",
      iconName: "ShieldCheck",
    },
    {
      id: 14,
      number: "14",
      title: "Final Committee Authority",
      summary: "The SMJV Vadodara Organising Committee and judging panel reserve the right to verify entries and make the final decision.",
      category: "fairplay",
      badge: "FINAL BINDING DECISION",
      iconName: "Award",
    },
  ] as ReelRule[],

  judgingScorecard: [
    {
      parameter: "Creativity & Originality",
      whatJudgesLookFor: "Fresh concept, originality and innovative presentation.",
      marks: 25,
      accent: "#D97706",
    },
    {
      parameter: "Tournament Relevance",
      whatJudgesLookFor: "Clear connection with the Inter-SMJV Sports Tournament.",
      marks: 20,
      accent: "#0D9488",
    },
    {
      parameter: "Video Quality & Editing",
      whatJudgesLookFor: "Visual quality, framing, sound, editing and transitions.",
      marks: 20,
      accent: "#2563EB",
    },
    {
      parameter: "Storytelling & Impact",
      whatJudgesLookFor: "Engaging narrative, emotional connect and memorability.",
      marks: 15,
      accent: "#7C3AED",
    },
    {
      parameter: "Promotional Effectiveness",
      whatJudgesLookFor: "Ability to create awareness and excitement for the tournament.",
      marks: 10,
      accent: "#EA580C",
    },
    {
      parameter: "Audience Engagement",
      whatJudgesLookFor: "Genuine audience response, including relevant likes, comments, shares and reach.",
      marks: 10,
      accent: "#059669",
    },
  ] as JudgingCriterion[],

  fairJudgingNote: "The judging panel will award up to 90 marks across the first five criteria. Audience Engagement will carry 10 marks and will be assessed using genuine engagement only. Engagement will not override the quality and originality of the Reel.",

  timeline: [
    {
      date: "15 NOV 2026",
      title: "Official Theme Reveal",
      description: "Official theme, content requirements and creative guidelines revealed by the committee.",
    },
    {
      date: "20 NOV 2026",
      title: "Reel Creation Begins",
      description: "Cameras roll across all 12 SMJV branches. Shooting, editing, and creative storytelling begins.",
    },
    {
      date: "BY 25 NOV 2026",
      title: "Final Submission Deadline",
      description: "All Reels must be posted on Instagram as well as YouTube and submitted to SMJV Vadodara Organising Committee with the original video file.",
      highlight: true,
    },
    {
      date: "24–27 DEC 2026",
      title: "Inter-SMJV Sports Tournament 2026",
      description: "Live tournament action in Vadodara. Winners showcased on tournament big screens and social channels.",
    },
  ] as TimelineEvent[],

  quoteBanner: {
    primary: "THIS IS MORE THAN A REEL. THIS IS YOUR HOSTEL'S MOMENT TO SHINE.",
    secondary: "THINK CREATIVE. SHOOT UNIQUE. PROMOTE THE SPIRIT.",
    notice: "Official Instagram account, YouTube details, hashtag(s) and submission contact will be communicated by the SMJV Vadodara Organising Committee.",
  },
};
