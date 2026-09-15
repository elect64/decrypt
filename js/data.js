/* ==========================================================
   DECRYPT DATA
   Content only — never fabricated. Add real entries as
   information becomes available.
   ========================================================== */

const EDITION_DATA = [
  { id: "1.0", index: "01", name: "DECRYPT 1.0", theme: "The Code Behind Creativity", date: "October 2025", format: "7 Days · Virtual · Telegram", status: "unlocked", hasDetail: true },
  { id: "2.0", index: "02", name: "DECRYPT 2.0", theme: "The next chapter is forming",  date: "October 2026", format: "1 Day · Physical ",      status: "current",  hasDetail: false },
  { id: "3.0", index: "03", name: "DECRYPT 3.0", theme: "Undisclosed",                  date: "2027",         format: "Locked",                       status: "locked",   hasDetail: false },
  { id: "4.0", index: "04", name: "DECRYPT 4.0", theme: "Undisclosed",                  date: "2028",         format: "Locked",                       status: "locked",   hasDetail: false }
];

const SESSION_DATA = [
  { day: "PRE", track: "Pre-DECRYPT Conversation", title: "An opening conversation ahead of the 7-day conference." },
  { day: "01",  track: "Leadership",               title: "Unlocking Leadership: Vision, Influence, and Creative Impact with Victoria Chisom." },
  { day: "02",  track: "Entrepreneurship",          title: "From Startup to Scale: Building Business Foundations That Last with Mr Donanu Richard." },
  { day: "03",  track: "Graphic Design",            title: "Creativity with Your Phone with Mr. Victor A.I." },
  { day: "04",  track: "Forex",                     title: "Forex Fundamentals: Trading Smart, Trading Profitably. with Mr. Madu Marvelous" },
  { day: "05",  track: "Artificial Intelligence",   title: "A Beginner's Guide to Artificial Intelligence: Supercharging Creativity with AI with Mr. Emeka Okoro." },
  { day: "06",  track: "Video Editing",             title: "Mastering Basic Video Editing Principles with Mr. Elect Okezie" },
  { day: "07",  track: "Cybersecurity",             title: "Cybersecurity Decoded: Staying Safe in a Digital World with Mr. Ezirim Kingdom." }
];

const SPEAKER_DATA = [
  // img: path relative to index.html, e.g. "assets/images/speakers/ezirim-kingdom.jpg"
  // Leave img as "" and the card shows an initial-letter placeholder instead.
  { name: "Ezirim Kingdom",   role: "Cybersecurity",          note: "Face of Rivers Tech Awards 2025", img: "assets/sp-kingdom.png" },
  { name: "Emeka Okoro",      role: "Artificial Intelligence", note: "Front End Developer",             img: "assets/sp-emeka.png" },
  { name: "Victoria Chisom",  role: "Leadership",              note: "TedX Speaker, Published Author",  img: "assets/sp-chisom.png" },
  { name: "Mr Donanu Richard",role: "Entrepreneurship",        note: "Business Coach",                  img: "assets/sp-richard.png" },
  { name: "Mr. Victor A.I.",  role: "Graphic Design",          note: "Graphic Designer, Media Expert",  img: "assets/sp-victor.png" },
  { name: "Mr. Madu Marvelous",role: "Forex",                  note: "Forex Trader",                    img: "assets/sp-marvelous.png" },
  { name: "Mr. Elect Okezie", role: "Multi-faceted Creative",  note: "Founder, Decrypt",                img: "assets/sp-elect.png" }
];

const MOVEMENT_DATA = [
  { title: "Knowledge",   detail: "Practical, certified sessions across the skills young people actually need exposure to." },
  { title: "People",      detail: "Speakers, organizers and a community who show up with family energy even after the conference ends." },
  { title: "Ideas",       detail: "Space to ask, question, and connect concepts across disciplines instead of sitting in one lane." },
  { title: "Opportunity", detail: "Exposure and access that can change the trajectory of someone's environment-limited starting point." }
];

const ECOSYSTEM_DATA = [
  { title: "Community Meetups",  desc: "Regular gatherings between flagship editions." },
  { title: "Conferences",        desc: "The annual flagship expression DECRYPT 1.0 and onward." },
  { title: "Bootcamps",          desc: "Focused, hands-on skill-building sprints." },
  { title: "Creative Challenges", desc: "Prompts that push builders to ship and share." },
  { title: "Publications",       desc: "Writing and resources that outlast a single event." }
];

const KNOWLEDGE_DATA = [
  // pdf: path relative to index.html, e.g. "assets/pdfs/cybersecurity.pdf"
  // Leave pdf as "" (or status "Locked") and the folder opens a locked state instead.
  { id: "0001", category: "Video Editing",    title: "Mastering Basic Video editing Principles",   status: "From DECRYPT 1.0", pdf: "assets/video-editing.pdf" },
  { id: "0002", category: "Cybersecurity",    title: "Staying Safe In A Digital World",  status: "From DECRYPT 1.0", pdf: "assets/cybersecurity.pdf" },
  { id: "0003", category: "Leadership",       title: "Leadership Fundamentals",            status: "From DECRYPT 1.0", pdf: "assets/leadership.pdf" },
  { id: "0004", category: "Entrepreneurship", title: "Starting Before You're Ready",       status: "From DECRYPT 2.0", pdf: "" },
  { id: "0005", category: "Creative",         title: "Creativity with Your Phone",         status: "From DECRYPT 1.0", pdf: "assets/creativity.pdf" },
  { id: "0006", category: "Career",           title: "Filed for a future edition",         status: "From DECRYPT 2.0", pdf: "" }
];

/* ---- Registration page content (draft copy — edit freely) ---- */

const REGISTER_STEPS = [
  { title: "Request access", detail: "Fill in the form with your details and the tracks you're curious about." },
  { title: "Confirmation", detail: "You'll get an email with a unique access code confirming your spot in DECRYPT 2.0." },
  { title: "Details unlock", detail: "Full schedule, links and community access lands in your inbox as October 2026 approaches." },
  { title: "Show up & unlock", detail: "Join live, ask questions, meet the community. Knowledge should not stay locked." }
];

const FAQ_DATA = [
  { q: "Is DECRYPT free to join?", a: "Yes. DECRYPT chapters are free to attend. Registering simply reserves your spot and gets you the access details as the date approaches." },
  { q: "Who can register?", a: "Any young technology enthusiast, creative, learner or builder — no prior experience required. If you're curious, you're in." },
  { q: "What happens after I register?", a: "You'll receive a confirmation by email, then the full schedule and access links closer to October 2026." },
  { q: "Can I join from anywhere?", a: "Yes. DECRYPT sessions are virtual, so you can join from wherever you're starting." },
  { q: "I attended DECRYPT 1.0, do I need to register again?", a: "Yes, please. Each chapter needs its own registration so we can send you the correct schedule and links." },
  { q: "Can I only pick one track?", a: "No. Select as many tracks as you're curious about — sessions across different tracks won't clash." }
];
