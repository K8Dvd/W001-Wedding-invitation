/**
 * W001 EVER AFTER — Kate Studio
 * THE ONLY FILE A CUSTOMER NEEDS TO EDIT.
 *
 * PHOTOS:      /public/photos/photo-01.jpg … photo-20.jpg
 * VIDEO:       /public/videos/couple-video.mp4
 * ARTWORK:     transparent PNGs in /public/elements/ (free Canva elements)
 * Missing PNGs show a dashed gold placeholder while showPlaceholders = true.
 * Set showPlaceholders = false before delivering to the customer.
 */

export const data = {
  showPlaceholders: true,

  // ---------- COUPLE ----------
  couple: {
    partnerOne: "Alex",
    partnerTwo: "Kate",
    displayName: "Alex & Kate",
    date: "Saturday, December 18, 2027",
    shortDate: "12.18.27",
    countdownDate: "2027-12-18T16:00:00+08:00",
    hashtag: "#AlexAndKate2027",
    groom: { name: "Alex", photo: 2 }, // portrait = photo-02.jpg
    bride: { name: "Kate", photo: 3 }, // portrait = photo-03.jpg
  },

  // Photo shown behind the envelope (blurred + glowing)
  envelope: { bgPhoto: 6 },

  // ---------- DECORATIVE PNGs (transparent) ----------
  els: {
    seal: "/elements/invitation-seal.png", // YOUR monogram seal
    cornerLeft: "/elements/corner-flower-left.png", // square corner bouquet
    cornerRight: "/elements/corner-flower-right.png", // square corner bouquet
    flowerBottomLeft: "/elements/envelope-flower-left.png", // under the envelope, left
    flowerBottomRight: "/elements/envelope-flower-right.png", // under the envelope, right
    ornament: "/elements/ornament-line.png", // thin gold divider, about 4:1
    brideMonogram: "/elements/bride-monogram.png", // letter K
    groomMonogram: "/elements/groom-monogram.png", // letter A
    alexCutout: "/elements/alex-cutout.png", // transparent PNG of Alex (3:5)
    kateCutout: "/elements/kate-cutout.png", // transparent PNG of Kate (3:5)
  },

  // ---------- FRAME PNGs (photo stays underneath) ----------
  frames: {
    royal: "/elements/royal-frame.png",
    floral: "/elements/floral-frame.png",
    editorial: "/elements/editorial-frame.png",
    polaroid: "/elements/polaroid-frame.png",
    ornate: "/elements/ornate-frame.png",
    minimal: "/elements/minimal-frame.png",
    arch: "/elements/arch-frame.png",
  },

  photos: Array.from({ length: 20 }, (_, i) => `/photos/photo-${String(i + 1).padStart(2, "0")}.jpg`),

  // ---------- VENUES (each has its own Google Maps embed) ----------
  venue: {
    bgPhoto: 8,
    ceremony: {
      label: "Ceremony", name: "Minor Basilica of the Immaculate Conception", address: "Intramuros, Manila",
      hour: "4", minute: "00", meridiem: "PM",
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4077.3116725289333!2d120.97081717510603!3d14.591742185893597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397ca17d22e6779%3A0x6a3a0ef7daa839d!2sMinor%20Basilica%20of%20the%20Immaculate%20Conception%20Manila!5e1!3m2!1sen!2sph!4v1791381115969!5m2!1sen!2sph",
      mapLink: "https://www.google.com/maps/search/?api=1&query=Minor+Basilica+of+the+Immaculate+Conception+Manila",
    },
    reception: {
      label: "Reception", name: "Okada Manila", address: "Entertainment City, Parañaque",
      hour: "6", minute: "00", meridiem: "PM",
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4078.743839484891!2d120.97760491083733!3d14.514232879126462!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cc1be21135ef%3A0x8cb7cb6671d7f4e9!2sOkada%20Manila!5e1!3m2!1sen!2sph!4v1791381148349!5m2!1sen!2sph",
      mapLink: "https://www.google.com/maps/search/?api=1&query=Okada+Manila",
    },
  },

  // ---------- ADD TO CALENDAR ----------
  // inviteImage = a picture of the invitation WITH the details. Guests can download it.
  calendar: { title: "Alex & Kate — Wedding", durationHours: 5, description: "Ceremony 4:00 PM · Reception 6:00 PM", inviteImage: "/elements/invitation-card.png" },

  // ---------- MUSIC ----------
  music: { title: "Our wedding song", youtubeId: "4Wxi4sVCeo0", youtubeUrl: "https://youtu.be/4Wxi4sVCeo0?si=kKXm31J27-Q9ADFu" },

  // ---------- STORY (photos = [large, small]) ----------
  story: [
    { year: "2019", title: "The Beginning", text: "We met at a friend's dinner and talked until the restaurant closed. Neither of us remembers what we ordered.", photos: [4, 5] },
    { year: "2021", title: "The Years Between", text: "Two apartments, one city, countless train rides. We learned each other's silences as well as each other's stories.", photos: [6, 7] },
    { year: "2026", title: "The Question", text: "On a quiet evening by the water, Alex asked. Kate said yes before he finished the sentence.", photos: [10, 11] },
  ],

  // ---------- ORDER OF THE DAY ----------
  itinerary: [
    { time: "4:00 PM", title: "Ceremony", note: "Minor Basilica of the Immaculate Conception" },
    { time: "5:00 PM", title: "Photo Session", note: "Family and entourage" },
    { time: "5:30 PM", title: "Cocktail", note: "" },
    { time: "6:00 PM", title: "Reception", note: "Okada Manila" },
    { time: "6:30 PM", title: "Dinner", note: "" },
    { time: "7:30 PM", title: "Speeches", note: "" },
    { time: "8:15 PM", title: "First Dance", note: "" },
    { time: "8:45 PM", title: "Cake", note: "" },
    { time: "9:00 PM", title: "Celebration", note: "" },
  ],

  // ---------- ATTIRE (strict) ----------
  attire: {
    title: "Attire Guide",
    strict: "Dress code is strictly observed. Guests who do not follow it may be asked to change.",
    colors: [
      { name: "Champagne", hex: "#e6d3b1" },
      { name: "Dusty Rose", hex: "#d4a8a0" },
      { name: "Sage", hex: "#a3ad92" },
      { name: "Espresso", hex: "#3b2a22" },
    ],
    // Put 2 PNGs per group (men / women) in /public/elements/
    groups: [
      { id: "sponsors", title: "Principal Sponsors", men: { label: "Men", note: "Barong Tagalog", image: "/elements/attire-sponsors-men.png" }, women: { label: "Women", note: "Filipiniana or long gown", image: "/elements/attire-sponsors-women.png" } },
      { id: "entourage", title: "Entourage", men: { label: "Men", note: "As provided by the couple", image: "/elements/attire-entourage-men.png" }, women: { label: "Women", note: "As provided by the couple", image: "/elements/attire-entourage-women.png" } },
      { id: "guests", title: "Wedding Guests", men: { label: "Men", note: "Barong or suit in the palette", image: "/elements/attire-guests-men.png" }, women: { label: "Women", note: "Formal dress or gown in the palette", image: "/elements/attire-guests-women.png" } },
    ],
    avoid: ["White and ivory", "Jeans and denim", "Shorts, slippers, sneakers", "Backless or very short dresses"],
  },

  // ---------- ENTOURAGE ----------
  entourage: {
    parents: { groom: ["Mr. Antonio Reyes", "Mrs. Lucia Reyes"], bride: ["Mr. Roberto David", "Mrs. Elena David"] },
    principal: [
      "Mr. Jose Villanueva", "Mrs. Carmen Villanueva", "Mr. Ramon Aquino", "Mrs. Teresa Aquino",
      "Mr. Eduardo Lim", "Mrs. Sofia Lim", "Mr. Fernando Cruz", "Mrs. Marites Cruz",
      "Mr. Ricardo Tan", "Mrs. Gloria Tan", "Mr. Alberto Ramos", "Mrs. Nena Ramos",
    ],
    secondary: [
      { role: "Candle", names: ["Mr. Paolo Santos", "Ms. Bianca Cruz"] },
      { role: "Veil", names: ["Mr. Ian Bautista", "Ms. Dana Uy"] },
      { role: "Cord", names: ["Mr. Luis Ramos", "Ms. Carla Lim"] },
    ],
    party: {
      groom: [
        { role: "Best Man", names: ["Paolo Rivera"] },
        { role: "Groomsmen", names: ["Marco Dela Cruz", "Ian Bautista", "Luis Ramos", "Noel Garcia", "Jed Mendoza", "Carlo Uy"] },
      ],
      bride: [
        { role: "Maid of Honor", names: ["Maria Santos"] },
        { role: "Bridesmaids", names: ["Anna Cruz", "Bea Reyes", "Carla Lim", "Dana Uy", "Ella Tan", "Faith Ong"] },
      ],
    },
    bearers: [
      { role: "Ring Bearer", names: ["Miguel Tan"] },
      { role: "Coin Bearer", names: ["Gabriel Cruz"] },
      { role: "Bible Bearer", names: ["Samuel Lim"] },
      { role: "Flower Girls", names: ["Lia Tan", "Mia Cruz"] },
    ],
  },

  video: { src: "/videos/couple-video.mp4", poster: 13 },

  // ---------- GIFTS ----------
  // number: "" hides the account number (QR only). qr = PNG/JPG in /public/elements/
  gifts: {
    title: "Gifts",
    intro: "Your presence is already the greatest gift.",
    sub: "For those who wish to give something, we have included the following options.",
    headlineLead: "For our new home, we would love",
    headline: "Appliances",
    headlineSub: "or anything you think we will use.",
    cashTitle: "Prefer to give cash?",
    options: [
      { title: "GCash", accountName: "Alexander Reyes", number: "", qr: "/elements/qr-gcash.png" },
      { title: "Maya", accountName: "Katherine David", number: "", qr: "/elements/qr-maya.png" },
      { title: "Bank Transfer", accountName: "Alexander Reyes", number: "", qr: "/elements/qr-bank.png" },
    ],
  },

  // ---------- REMINDERS & FAQ ----------
  reminders: [
    "Please arrive at least 30 minutes before the ceremony.",
    "Follow the attire guide. It is strictly observed.",
    "Reply to the RSVP by November 18, 2027.",
    "Seats are reserved for invited guests only.",
    "The ceremony is unplugged. Please keep phones away.",
  ],
  faq: [
    { q: "Can I bring a plus one?", a: "Only guests named on the invitation list can attend. The RSVP page shows who is invited under your name." },
    { q: "Are children welcome?", a: "Children listed on your invitation are welcome." },
    { q: "Is there parking?", a: "Parking is available at both venues. Please arrive early." },
    { q: "What if I cannot attend?", a: "Please still send a reply through the RSVP page so we can plan seating." },
  ],

  // ---------- RSVP ----------
  rsvp: {
    mode: "smart" as "standard" | "smart",
    endpoint: "https://script.google.com/macros/s/AKfycbzewTtHa3tEjQe9dAwVSaTBK8NRYij9Ys9qGE8taudz9bO-0kHf-JlbRBiWh842sgip/exec", // Google Apps Script web-app URL (see setup guide). "" = demo mode, this browser only.
    deadline: "Kindly reply by November 18, 2027",
    maxSeats: 4, // standard mode only
    smartGuests: [], // live mode reads the guest list from your Google Sheet; this is only used in demo mode
  },

  closing: { photo: 20, message: "Thank you for celebrating with us.", signoff: "With love," },
};

export type Data = typeof data;