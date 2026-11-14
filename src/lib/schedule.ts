/* INTER SMJV 2026 — Tournament Schedule
 * Transcribed verbatim from the official schedule PDF.
 * 3 days · 8 sports · 7 teams.
 * Teams: Ahmedabad Attackers, Andheri Aces, Bhavnagar Warriors,
 *        Sandhurst Strikers, Spirit of Pune, Valorious VVN,
 *        Victorious Vadodara.
 */

export interface MatchPairing {
  /** "Team A VS Team B" for league matches, or "Semi Final 1" / "Final" for knockouts */
  label: string;
}

export interface ScheduleMatch {
  no: string;
  time: string;
  /** One or more concurrent pairings happening in this time slot */
  pairings: MatchPairing[];
}

export interface ScheduleSport {
  name: string;
  emoji: string;
  matches: ScheduleMatch[];
}

export interface ScheduleDay {
  day: string;
  date: string;
  label: string;
  sports: ScheduleSport[];
}

const TEAMS = {
  ahmedabad: "Ahmedabad Attackers",
  andheri: "Andheri Aces",
  bhavnagar: "Bhavnagar Warriors",
  sandhurst: "Sandhurst Strikers",
  pune: "Spirit of Pune",
  vvn: "Valorious VVN",
  vadodara: "Victorious Vadodara",
  rebels: "Surtified Rebels",
} as const;

const vs = (a: string, b: string) => `${a} VS ${b}`;

export const SCHEDULE: ScheduleDay[] = [
  {
    day: "DAY 1",
    date: "24 DECEMBER",
    label: "Opening Day",
    sports: [
      {
        name: "CRICKET",
        emoji: "🏏",
        matches: [
          { no: "1", time: "12.00 – 2.30", pairings: [{ label: vs(TEAMS.bhavnagar, TEAMS.vadodara) }] },
          { no: "2", time: "3.00 – 5.00", pairings: [{ label: vs(TEAMS.andheri, TEAMS.sandhurst) }] },
        ],
      },
      {
        name: "TABLE TENNIS",
        emoji: "🏓",
        matches: [
          { no: "1", time: "12.00 – 1.00", pairings: [
            { label: vs(TEAMS.pune, TEAMS.sandhurst) },
            { label: vs(TEAMS.ahmedabad, TEAMS.vvn) },
          ]},
          { no: "2", time: "2.00 – 4.00", pairings: [
            { label: vs(TEAMS.pune, TEAMS.andheri) },
            { label: vs(TEAMS.vadodara, TEAMS.vvn) },
          ]},
        ],
      },
      {
        name: "BADMINTON",
        emoji: "🏸",
        matches: [
          { no: "1", time: "12.00 – 1.00", pairings: [
            { label: vs(TEAMS.vvn, TEAMS.pune) },
            { label: vs(TEAMS.andheri, TEAMS.ahmedabad) },
          ]},
          { no: "2", time: "2.00 – 4.00", pairings: [
            { label: vs(TEAMS.vvn, TEAMS.sandhurst) },
            { label: vs(TEAMS.pune, TEAMS.vadodara) },
          ]},
        ],
      },
      {
        name: "CHESS",
        emoji: "♟️",
        matches: [
          { no: "1", time: "1.00 – 2.30", pairings: [
            { label: vs(TEAMS.vvn, TEAMS.pune) },
            { label: vs(TEAMS.vadodara, TEAMS.sandhurst) },
          ]},
          { no: "2", time: "3.30 – 5.00", pairings: [
            { label: vs(TEAMS.bhavnagar, TEAMS.vvn) },
            { label: vs(TEAMS.vadodara, TEAMS.ahmedabad) },
          ]},
        ],
      },
      {
        name: "VOLLEYBALL",
        emoji: "🏐",
        matches: [
          { no: "1", time: "6.00 – 6.55", pairings: [{ label: vs(TEAMS.vadodara, TEAMS.pune) }] },
          { no: "2", time: "6.55 – 7.35", pairings: [{ label: vs(TEAMS.bhavnagar, TEAMS.andheri) }] },
          { no: "3", time: "7.35 – 8.20", pairings: [{ label: vs(TEAMS.sandhurst, TEAMS.ahmedabad) }] },
          { no: "4", time: "8.20 – 9.00", pairings: [{ label: vs(TEAMS.andheri, TEAMS.vvn) }] },
        ],
      },
      {
        name: "FOOTBALL",
        emoji: "⚽",
        matches: [
          { no: "1", time: "6.00 – 6.50", pairings: [{ label: vs(TEAMS.pune, TEAMS.vvn) }] },
          { no: "2", time: "6.50 – 7.35", pairings: [{ label: vs(TEAMS.ahmedabad, TEAMS.sandhurst) }] },
          { no: "3", time: "7.35 – 8.20", pairings: [{ label: vs(TEAMS.pune, TEAMS.andheri) }] },
          { no: "4", time: "8.20 – 9.00", pairings: [{ label: vs(TEAMS.vadodara, TEAMS.ahmedabad) }] },
        ],
      },
      {
        name: "PICKLE BALL",
        emoji: "🥎",
        matches: [
          { no: "1", time: "6.00 – 7.40", pairings: [
            { label: vs(TEAMS.vadodara, TEAMS.pune) },
            { label: vs(TEAMS.sandhurst, TEAMS.vvn) },
          ]},
          { no: "2", time: "7.40 – 10.00", pairings: [
            { label: vs(TEAMS.bhavnagar, TEAMS.ahmedabad) },
            { label: vs(TEAMS.vvn, TEAMS.pune) },
          ]},
        ],
      },
      {
        name: "CARROM",
        emoji: "🎯",
        matches: [
          { no: "1", time: "1.00 – 3.00", pairings: [
            { label: vs(TEAMS.sandhurst, TEAMS.ahmedabad) },
            { label: vs(TEAMS.vadodara, TEAMS.pune) },
          ]},
          { no: "2", time: "3.00 – 5.00", pairings: [
            { label: vs(TEAMS.bhavnagar, TEAMS.vvn) },
            { label: vs(TEAMS.vadodara, TEAMS.sandhurst) },
          ]},
        ],
      },
    ],
  },
  {
    day: "DAY 2",
    date: "25 DECEMBER",
    label: "League & Semis",
    sports: [
      {
        name: "CRICKET",
        emoji: "🏏",
        matches: [
          { no: "1", time: "7.00 – 9.00", pairings: [{ label: vs(TEAMS.ahmedabad, TEAMS.vvn) }] },
          { no: "2", time: "9.00 – 11.00", pairings: [{ label: vs(TEAMS.pune, TEAMS.sandhurst) }] },
          { no: "3", time: "11.00 – 1.00", pairings: [{ label: vs(TEAMS.ahmedabad, TEAMS.bhavnagar) }] },
          { no: "4", time: "1.30 – 3.30", pairings: [{ label: vs(TEAMS.pune, TEAMS.andheri) }] },
          { no: "5", time: "3.30 – 6.00", pairings: [{ label: vs(TEAMS.vadodara, TEAMS.vvn) }] },
        ],
      },
      {
        name: "TABLE TENNIS",
        emoji: "🏓",
        matches: [
          { no: "1", time: "8.00 – 9.30", pairings: [
            { label: vs(TEAMS.vadodara, TEAMS.bhavnagar) },
            { label: vs(TEAMS.ahmedabad, TEAMS.bhavnagar) },
          ]},
          { no: "2", time: "9.30 – 1.00", pairings: [
            { label: vs(TEAMS.andheri, TEAMS.sandhurst) },
            { label: "Semi Final 1" },
            { label: "Semi Final 2" },
          ]},
        ],
      },
      {
        name: "BADMINTON",
        emoji: "🏸",
        matches: [
          { no: "1", time: "8.00 – 10.00", pairings: [
            { label: vs(TEAMS.vadodara, TEAMS.sandhurst) },
            { label: vs(TEAMS.bhavnagar, TEAMS.ahmedabad) },
          ]},
          { no: "2", time: "10.00 – 1.00", pairings: [
            { label: vs(TEAMS.andheri, TEAMS.bhavnagar) },
            { label: "Semi Final 1" },
            { label: "Semi Final 2" },
          ]},
        ],
      },
      {
        name: "CHESS",
        emoji: "♟️",
        matches: [
          { no: "1", time: "9.30 – 10.30", pairings: [
            { label: vs(TEAMS.bhavnagar, TEAMS.andheri) },
            { label: vs(TEAMS.ahmedabad, TEAMS.sandhurst) },
          ]},
          { no: "2", time: "1.00 – 3.00", pairings: [
            { label: vs(TEAMS.andheri, TEAMS.pune) },
            { label: "Semi Final 1" },
            { label: "Semi Final 2" },
          ]},
        ],
      },
      {
        name: "VOLLEYBALL",
        emoji: "🏐",
        matches: [
          { no: "1", time: "6.00 – 7.00", pairings: [{ label: vs(TEAMS.vvn, TEAMS.bhavnagar) }] },
          { no: "2", time: "7.00 – 8.00", pairings: [{ label: vs(TEAMS.pune, TEAMS.ahmedabad) }] },
          { no: "3", time: "8.00 – 9.00", pairings: [{ label: vs(TEAMS.vadodara, TEAMS.sandhurst) }] },
        ],
      },
      {
        name: "FOOTBALL",
        emoji: "⚽",
        matches: [
          { no: "1", time: "6.00 – 7.00", pairings: [{ label: vs(TEAMS.vadodara, TEAMS.sandhurst) }] },
          { no: "2", time: "7.00 – 8.00", pairings: [{ label: vs(TEAMS.bhavnagar, TEAMS.vvn) }] },
          { no: "3", time: "8.00 – 9.00", pairings: [{ label: vs(TEAMS.andheri, TEAMS.bhavnagar) }] },
        ],
      },
      {
        name: "PICKLE BALL",
        emoji: "🥎",
        matches: [
          { no: "1", time: "6.00 – 8.00", pairings: [
            { label: vs(TEAMS.andheri, TEAMS.ahmedabad) },
            { label: vs(TEAMS.vadodara, TEAMS.sandhurst) },
          ]},
          { no: "2", time: "8.00 – 9.00", pairings: [{ label: vs(TEAMS.andheri, TEAMS.bhavnagar) }] },
        ],
      },
      {
        name: "CARROM",
        emoji: "🎯",
        matches: [
          { no: "1", time: "9.30 – 11.00", pairings: [
            { label: vs(TEAMS.andheri, TEAMS.vvn) },
            { label: vs(TEAMS.pune, TEAMS.ahmedabad) },
          ]},
          { no: "2", time: "1.00 – 3.00", pairings: [
            { label: vs(TEAMS.bhavnagar, TEAMS.andheri) },
            { label: "Semi Final 1" },
            { label: "Semi Final 2" },
          ]},
        ],
      },
    ],
  },
  {
    day: "DAY 3",
    date: "26 DECEMBER",
    label: "Finals Day",
    sports: [
      {
        name: "CRICKET",
        emoji: "🏏",
        matches: [
          { no: "1", time: "7.30 – 9.30", pairings: [{ label: "Semi Final 1" }] },
          { no: "2", time: "9.30 – 11.30", pairings: [{ label: "Semi Final 2" }] },
          { no: "3", time: "3.00 – 5.00", pairings: [{ label: "Final" }] },
        ],
      },
      {
        name: "TABLE TENNIS",
        emoji: "🏓",
        matches: [
          { no: "Final", time: "8.00 – 10.00", pairings: [{ label: "Final" }] },
        ],
      },
      {
        name: "BADMINTON",
        emoji: "🏸",
        matches: [
          { no: "Final", time: "8.00 – 10.00", pairings: [{ label: "Final" }] },
        ],
      },
      {
        name: "CHESS",
        emoji: "♟️",
        matches: [
          { no: "Final", time: "11.00 – 12.00", pairings: [{ label: "Final" }] },
        ],
      },
      {
        name: "FOOTBALL",
        emoji: "⚽",
        matches: [
          { no: "1", time: "12.00 – 1.30", pairings: [{ label: "Semi Final 1" }] },
          { no: "2", time: "1.30 – 2.30", pairings: [{ label: "Semi Final 2" }] },
          { no: "3", time: "2.45 – 4.00", pairings: [{ label: "Final" }] },
        ],
      },
      {
        name: "VOLLEYBALL",
        emoji: "🏐",
        matches: [
          { no: "1", time: "6.00 – 7.00", pairings: [{ label: "Semi Final 1" }] },
          { no: "2", time: "7.00 – 8.00", pairings: [{ label: "Semi Final 2" }] },
          { no: "3", time: "8.00 – 9.30", pairings: [{ label: "Final" }] },
        ],
      },
      {
        name: "PICKLE BALL",
        emoji: "🥎",
        matches: [
          { no: "1", time: "6.00 – 7.00", pairings: [{ label: "Semi Final 1" }] },
          { no: "2", time: "7.00 – 8.00", pairings: [{ label: "Semi Final 2" }] },
          { no: "3", time: "8.00 – 9.30", pairings: [{ label: "Final" }] },
        ],
      },
      {
        name: "CARROM",
        emoji: "🎯",
        matches: [
          { no: "Final", time: "10.00 – 11.30", pairings: [{ label: "Final" }] },
        ],
      },
    ],
  },
];

export const BOYS_SCHEDULE = SCHEDULE;

export const GIRLS_SCHEDULE: ScheduleDay[] = [
  {
    day: "DAY 1",
    date: "24 DECEMBER",
    label: "Opening Day",
    sports: [
      {
        name: "BADMINTON",
        emoji: "🏸",
        matches: [
          { no: "1", time: "12.00 – 1.00", pairings: [{ label: vs(TEAMS.vadodara, TEAMS.pune) }] },
          { no: "2", time: "1.00 – 2.00", pairings: [{ label: vs(TEAMS.ahmedabad, TEAMS.rebels) }] },
          { no: "Semi 1", time: "2.00 – 3.00", pairings: [{ label: vs(TEAMS.vvn + " (Bye)", "Winner M1") }] },
          { no: "Semi 2", time: "3.00 – 4.00", pairings: [{ label: "Semi Final 2" }] },
        ],
      },
      {
        name: "TABLE TENNIS",
        emoji: "🏓",
        matches: [
          { no: "1", time: "12.00 – 1.00", pairings: [{ label: vs(TEAMS.vadodara, TEAMS.ahmedabad) }] },
          { no: "2", time: "1.00 – 2.00", pairings: [{ label: vs(TEAMS.vvn, TEAMS.rebels) }] },
          { no: "Semi 1", time: "2.00 – 3.00", pairings: [{ label: vs(TEAMS.pune + " (Bye)", "Winner M1") }] },
          { no: "Semi 2", time: "3.00 – 4.00", pairings: [{ label: "Semi Final 2" }] },
        ],
      },
      {
        name: "CRICKET",
        emoji: "🏏",
        matches: [
          { no: "1", time: "4.00 – 5.00", pairings: [{ label: vs(TEAMS.vadodara, TEAMS.vvn) }] },
          { no: "2", time: "5.00 – 6.00", pairings: [{ label: vs(TEAMS.pune, TEAMS.ahmedabad) }] },
        ],
      },
      {
        name: "CHESS",
        emoji: "♟️",
        matches: [
          { no: "1", time: "4.00 – 5.00", pairings: [{ label: vs(TEAMS.ahmedabad, TEAMS.vvn) }] },
          { no: "2", time: "5.00 – 6.00", pairings: [{ label: vs(TEAMS.rebels, TEAMS.pune) }] },
          { no: "Semi 1", time: "6.00 – 7.00", pairings: [{ label: vs(TEAMS.vadodara + " (Bye)", "Winner M1") }] },
          { no: "Semi 2", time: "7.00 – 8.00", pairings: [{ label: "Semi Final 2" }] },
        ],
      },
    ],
  },
  {
    day: "DAY 2",
    date: "25 DECEMBER",
    label: "Semis & Knockouts",
    sports: [
      {
        name: "TUG OF WAR",
        emoji: "🪢",
        matches: [
          { no: "1", time: "7.00 – 7.15", pairings: [{ label: vs(TEAMS.vadodara, TEAMS.rebels) }] },
          { no: "2", time: "7.15 – 7.30", pairings: [{ label: vs(TEAMS.pune, TEAMS.vvn) }] },
          { no: "Semi 1", time: "7.30 – 7.45", pairings: [{ label: vs(TEAMS.ahmedabad + " (Bye)", "Winner M1") }] },
          { no: "Semi 2", time: "7.45 – 8.00", pairings: [{ label: "Semi Final 2" }] },
          { no: "Final", time: "8.00 – 8.15", pairings: [{ label: "Grand Final" }] },
        ],
      },
      {
        name: "KHO-KHO",
        emoji: "🏃",
        matches: [
          { no: "1", time: "8.00 – 9.00", pairings: [{ label: vs(TEAMS.rebels, TEAMS.ahmedabad) }] },
          { no: "2", time: "9.00 – 10.00", pairings: [{ label: vs(TEAMS.pune, TEAMS.vvn) }] },
          { no: "Semi 1", time: "10.00 – 11.00", pairings: [{ label: vs(TEAMS.vadodara + " (Bye)", "Winner M1") }] },
          { no: "Semi 2", time: "11.00 – 12.00", pairings: [{ label: "Semi Final 2" }] },
          { no: "Final", time: "12.00 – 1.00", pairings: [{ label: "Grand Final" }] },
        ],
      },
      {
        name: "THROW BALL",
        emoji: "🏐",
        matches: [
          { no: "1", time: "2.00 – 3.00", pairings: [{ label: vs(TEAMS.vadodara, TEAMS.pune) }] },
          { no: "2", time: "3.00 – 4.00", pairings: [{ label: vs(TEAMS.vvn, TEAMS.ahmedabad) }] },
          { no: "Semi 1", time: "4.00 – 5.00", pairings: [{ label: vs(TEAMS.rebels + " (Bye)", "Winner M1") }] },
        ],
      },
      {
        name: "CRICKET",
        emoji: "🏏",
        matches: [
          { no: "Semi 1", time: "4.00 – 5.00", pairings: [{ label: vs(TEAMS.rebels + " (Bye)", "Winner M1") }] },
          { no: "Semi 2", time: "5.00 – 6.00", pairings: [{ label: "Semi Final 2" }] },
        ],
      },
      {
        name: "CARROM",
        emoji: "🎯",
        matches: [
          { no: "1", time: "2.00 – 3.00", pairings: [{ label: vs(TEAMS.vadodara, TEAMS.rebels) }] },
          { no: "2", time: "3.00 – 4.00", pairings: [{ label: vs(TEAMS.ahmedabad, TEAMS.vvn) }] },
          {
            no: "Semis",
            time: "4.00 – 5.00",
            pairings: [
              { label: vs(TEAMS.pune + " (Bye)", "Winner M1") },
              { label: "Semi Final 2" },
            ],
          },
        ],
      },
      {
        name: "PICKLE BALL",
        emoji: "🥎",
        matches: [
          { no: "1", time: "7.00 – 7.40", pairings: [{ label: vs(TEAMS.vadodara, TEAMS.rebels) }] },
          { no: "2", time: "7.40 – 8.20", pairings: [{ label: vs(TEAMS.pune, TEAMS.ahmedabad) }] },
          { no: "Semi 1", time: "8.20 – 9.00", pairings: [{ label: vs(TEAMS.vvn + " (Bye)", "Winner M1") }] },
        ],
      },
      {
        name: "CHESS",
        emoji: "♟️",
        matches: [
          { no: "Final", time: "10.30 – 12.00", pairings: [{ label: "Grand Final" }] },
        ],
      },
    ],
  },
  {
    day: "DAY 3",
    date: "26 DECEMBER",
    label: "Championship Finals",
    sports: [
      {
        name: "CRICKET",
        emoji: "🏏",
        matches: [
          { no: "Final", time: "10.00 – 12.00", pairings: [{ label: "Grand Final" }] },
        ],
      },
      {
        name: "BADMINTON",
        emoji: "🏸",
        matches: [
          { no: "Final", time: "12.00 – 1.00", pairings: [{ label: "Grand Final" }] },
        ],
      },
      {
        name: "TABLE TENNIS",
        emoji: "🏓",
        matches: [
          { no: "Final", time: "12.00 – 1.00", pairings: [{ label: "Grand Final" }] },
        ],
      },
      {
        name: "CARROM",
        emoji: "🎯",
        matches: [
          { no: "Final", time: "2.00 – 3.00", pairings: [{ label: "Grand Final" }] },
        ],
      },
      {
        name: "THROW BALL",
        emoji: "🏐",
        matches: [
          { no: "Semi 2", time: "2.00 – 3.00", pairings: [{ label: "Semi Final 2" }] },
          { no: "Final", time: "3.30 – 5.00", pairings: [{ label: "Grand Final" }] },
        ],
      },
      {
        name: "PICKLE BALL",
        emoji: "🥎",
        matches: [
          { no: "Semi 2", time: "6.00 – 7.00", pairings: [{ label: "Semi Final 2" }] },
          { no: "Final", time: "7.00 – 8.00", pairings: [{ label: "Grand Final" }] },
        ],
      },
    ],
  },
];

export interface ByeInfo {
  team: string;
  branch: string;
  sports: string[];
  color: string;
}

/** Official Seeding Byes for Girls Division (from official schedule Page 4) */
export const GIRLS_BYES: ByeInfo[] = [
  { team: "Spirit of Pune", branch: "Pune", sports: ["Table Tennis", "Carrom"], color: "#15803D" },
  { team: "Valorious VVN", branch: "VVN", sports: ["Badminton", "Pickle Ball"], color: "#B45309" },
  { team: "Victorious Vadodara", branch: "Vadodara", sports: ["Kho-Kho", "Chess"], color: "#1D4ED8" },
  { team: "Surtified Rebels", branch: "Surat", sports: ["Cricket", "Throw Ball"], color: "#E11D48" },
  { team: "Ahmedabad Attackers", branch: "Ahmedabad", sports: ["Tug of War"], color: "#D97706" },
];

/** Team color mapping for the schedule badges */
export const TEAM_COLORS: Record<string, string> = {
  "Ahmedabad Attackers": "#D97706",
  "Ahmedabad": "#D97706",
  "Andheri Aces": "#0D7377",
  "Andheri": "#0D7377",
  "Bhavnagar Warriors": "#B91C1C",
  "Bhavnagar": "#B91C1C",
  "Sandhurst Strikers": "#7C3AED",
  "Sandhurst": "#7C3AED",
  "Spirit of Pune": "#15803D",
  "Pune": "#15803D",
  "Valorious VVN": "#B45309",
  "VVN": "#B45309",
  "Victorious Vadodara": "#1D4ED8",
  "Vadodara": "#1D4ED8",
  "Surtified Rebels": "#E11D48",
  "Surat": "#E11D48",
};
