import type { CatalogProduct } from "@/lib/catalog";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://sobji.com";

export const SITE_NAME = "sobji.com";

export const PRIMARY_SEO_KEYWORDS = [
  "sobji",
  "shobji",
  "shak",
  "sobji.com",
  "sobji bazar",
  "shobji bazar",
  "fresh sobji dhaka",
  "online sobji market bangladesh",
  "kacha bazar online",
  "online kacha bazar dhaka",
  "fresh vegetables dhaka",
  "deshi vegetables bangladesh",
  "formalin free vegetables dhaka",
  "leafy greens shak",
  "lal shak",
  "palong shak",
  "pui shak",
  "dhonepata",
  "deshi tomato",
  "munshiganj potato",
  "aloo",
  "lomba begun",
  "brinjal",
  "lau bottle gourd",
  "okra dherosh",
  "cauliflower fulkopi",
  "cucumber shosha",
  "sweet pumpkin misti kumra",
  "pointed gourd potol",
  "fresh fruits dhaka",
  "himsagar mango",
  "sagar kola banana",
  "rajshahi guava peyara",
  "ripe papaya pepe",
  "green coconut dab",
  "padma rui fish online",
  "chandpur ilish hilsa online",
  "bagda chingri prawn",
  "deshi sonali chicken",
  "duck eggs hasher dim",
  "pure spices moshla dhaka",
  "bogura turmeric holud",
  "pabna onion peyaj",
  "deshi garlic roshun",
  "deshi ginger ada",
  "kacha morich green chilli",
  "ghani mustard oil sorishar tel",
  "deshi moshur dal",
  "ready to cook vegetables dhaka",
  "সবজি",
  "শাক",
  "তাজা সবজি",
  "শাকসবজি",
  "ফলমূল",
  "মসলা",
  "মাছ মাংস",
  "অনলাইন কাঁচাবাজার",
  "সবজি বাজার ঢাকা",
  "লাল শাক",
  "পালং শাক",
  "পুঁই শাক",
  "ধনেপাতা",
  "পদ্মার রুই মাছ",
  "চাঁদপুরের ইলিশ",
  "সরিষার তেল",
  "হলুদ গুঁড়া",
  "ফরমালিন মুক্ত সবজি",
];

export interface CategorySeoInfo {
  titleEn: string;
  descriptionEn: string;
  summaryEn: string;
  summaryBn: string;
  keywords: string[];
}

export const CATEGORY_SEO_META: Record<string, CategorySeoInfo> = {
  "fresh-vegetables": {
    titleEn: "Fresh Vegetables (Sobji / Shobji) Online in Dhaka",
    descriptionEn:
      "Order dawn-harvested tomato, potato (aloo), begun, lau, okra (dherosh), cauliflower (fulkopi), cucumber, pumpkin & potol online in Dhaka starting 6:00 AM.",
    summaryEn:
      "sobji.com delivers 100% formalin-free daily vegetables (sobji / shobji) including Deshi Tomato, Munshiganj Potato, Lomba Begun, Kacha Lau, Dherosh, Fulkopi, Shosha, Misti Kumra, and Potol straight from partner farms in Bogura, Narsingdi, and Munshiganj.",
    summaryBn:
      "বগুড়া, নরসিংদী ও মুন্সিগঞ্জের কৃষকদের কাছ থেকে ভোর ৫টায় তোলা টমেটো, আলু, লম্বা বেগুন, লাউ, ঢেঁড়স, ফুলকপি, শসা, মিষ্টি কুমড়া ও পটল ঢাকায় সকাল ৬টা থেকেই হোম ডেলিভারি পান।",
    keywords: [
      "fresh vegetables dhaka",
      "sobji",
      "shobji",
      "tomato",
      "potato",
      "begun",
      "lau",
      "okra",
      "cauliflower",
      "cucumber",
      "pumpkin",
      "potol",
      "সবজি",
      "তাজা সবজি ঢাকা",
    ],
  },
  "leafy-greens": {
    titleEn: "Fresh Shak & Leafy Greens (Lal Shak, Palong Shak, Pui Shak)",
    descriptionEn:
      "Buy pesticide-screened Bangladeshi leafy greens (shak): Red Amaranth (Lal Shak), Spinach (Palong Shak), Malabar Spinach (Pui Shak), and fresh Coriander (Dhonepata).",
    summaryEn:
      "Cut before sunrise in Narayanganj and Savar, sobji.com delivers crisp Lal Shak, Palong Shak, Pui Shak, and aromatic Dhonepata across Dhaka with zero chemical preservatives.",
    summaryBn:
      "সূর্যোদয়ের আগে কাটা সতেজ লাল শাক, পালং শাক, পুঁই শাক ও সুগন্ধি ধনেপাতা কোনো কেমিক্যাল ছাড়াই সকাল ৬টা থেকে ঢাকার বাসায় পৌঁছে দেওয়া হয়।",
    keywords: [
      "shak",
      "lal shak",
      "palong shak",
      "pui shak",
      "dhonepata",
      "leafy greens dhaka",
      "শাক",
      "লাল শাক",
      "পালং শাক",
      "পুঁই শাক",
    ],
  },
  "ready-to-cook": {
    titleEn: "Ready-to-Cook Cut Vegetables & Peeled Garlic-Ginger Packs",
    descriptionEn:
      "Save kitchen prep time with washed, hand-chopped mixed bhaji packs and freshly peeled garlic-ginger combos hygienically packed at Kawran Bazar Dawn Hub.",
    summaryEn:
      "Our Ready-to-Cook packs feature washed mixed bhaji cuts and fresh peeled deshi garlic-ginger combos prepped every dawn for busy Dhaka kitchens.",
    summaryBn:
      "ব্যস্ত সময়ে ঝামেলা ছাড়া রান্নার জন্য ধোয়া ও কাটা মিক্সড ভাজি প্যাক এবং খোসা ছাড়ানো দেশি আদা-রসুন কম্বো প্রতিদিন সকালে স্বাস্থ্যসম্মতভাবে প্যাক করা হয়।",
    keywords: [
      "ready to cook vegetables dhaka",
      "chopped vegetables",
      "peeled garlic ginger",
      "mixed bhaji pack",
      "রেডি টু কুক সবজি",
    ],
  },
  "fresh-fruits": {
    titleEn: "Fresh Bangladeshi Fruits (Mango, Banana, Guava, Papaya, Coconut)",
    descriptionEn:
      "Carbide-free Rajshahi Himsagar Mango, Narsingdi Sagar Kola banana, crisp Thai/Rajshahi Guava, Ripe Papaya & Kacha Dab green coconut online in Dhaka.",
    summaryEn:
      "Naturally ripened Rajshahi mangoes, Narsingdi Sagar Kola bananas, crispy guavas, sweet papayas, and hydrating Kacha Dab coconuts screened 100% formalin and carbide free.",
    summaryBn:
      "কার্বাইড ও ফরমালিন মুক্ত রাজশাহীর হিমসাগর আম, নরসিংদীর সাগর কলা, তাজা পেয়ারা, পাকা পেঁপে ও কচি ডাব সরাসরি বাগান থেকে সংগ্রহ করা হয়।",
    keywords: [
      "fresh fruits dhaka",
      "himsagar mango",
      "sagar kola banana",
      "guava peyara",
      "papaya pepe",
      "green coconut dab",
      "তাজা ফল",
      "আম কলা পেয়ারা",
    ],
  },
  "river-fish": {
    titleEn: "Fresh Padma River Fish (Rui, Chandpur Ilish, Bagda Chingri)",
    descriptionEn:
      "Order ice-packed, formalin-free Padma Rui cuts, whole Chandpur Ilish (Hilsa), and fresh Bagda Tiger Prawns (Chingri) cleaned and home-delivered in Dhaka.",
    summaryEn:
      "Directly sourced from Padma, Meghna, and Khulna landing ghats, sobji.com packs Padma Rui, Chandpur Ilish steaks, and Bagda Chingri prawns in food-grade ice without formalin.",
    summaryBn:
      "পদ্মা, মেঘনা ও খুলনা ঘাট থেকে সরাসরি সংগ্রহ করা ফরমালিন মুক্ত তাজা রুই মাছ, চাঁদপুরের ইলিশ ও বাগদা চিংড়ি আইস-প্যাকে ঢাকায় ডেলিভারি হয়।",
    keywords: [
      "fresh fish dhaka",
      "padma rui fish",
      "chandpur ilish hilsa",
      "bagda chingri prawns",
      "তাজা নদীর মাছ",
      "রুই মাছ",
      "ইলিশ মাছ",
      "চিংড়ি",
    ],
  },
  "meat-eggs": {
    titleEn: "Deshi Sonali Chicken & Farm Fresh Duck Eggs Online in Dhaka",
    descriptionEn:
      "Halal-certified farm Sonali chicken (dressed cuts) and nutrient-rich deshi duck eggs delivered chilled across Dhaka every morning.",
    summaryEn:
      "Antibiotic-free Deshi Sonali chicken and daily-gathered deshi duck eggs packed hygienically in chilled crates for safe Dhaka family cooking.",
    summaryBn:
      "হরমোন ও অ্যান্টিবায়োটিক মুক্ত দেশি সোনালী মুরগি এবং খামারের তাজা হাঁসের ডিম চিলড বক্সে করে আপনার বাসায় পৌঁছে দেওয়া হয়।",
    keywords: [
      "sonali chicken dhaka",
      "deshi chicken online",
      "duck eggs bd",
      "meat and eggs dhaka",
      "সোনালী মুরগি",
      "হাঁসের ডিম",
    ],
  },
  "spices-herbs": {
    titleEn: "Pure Spices & Kitchen Aromatics (Onion, Garlic, Ginger, Chilli, Turmeric)",
    descriptionEn:
      "Buy Pabna deshi onion (peyaj), deshi garlic (roshun), ginger (ada), Bogura green chillies (kacha morich), and stone-ground pure turmeric powder (holud).",
    summaryEn:
      "Every Bangladeshi curry starts with aromatic Pabna onions, potent deshi garlic and ginger, crisp kacha morich, and lab-tested Bogura turmeric powder with zero artificial color.",
    summaryBn:
      "পাবনার দেশি পেঁয়াজ, দেশি রসুন, ঝাঁঝালো আদা, কাঁচা মরিচ এবং রঙ-ভেজাল মুক্ত বগুড়ার খাঁটি হলুদ গুঁড়া এখন পাবেন একসাথে।",
    keywords: [
      "spices dhaka",
      "moshla online bangladesh",
      "pabna onion",
      "deshi garlic roshun",
      "ginger ada",
      "turmeric powder holud",
      "kacha morich",
      "মসলা",
      "পেঁয়াজ রসুন আদা হলুদ",
    ],
  },
  "organic-pantry": {
    titleEn: "Organic Pantry (Cold-Pressed Ghani Mustard Oil & Deshi Moshur Dal)",
    descriptionEn:
      "Shop cold-pressed wooden ghani pure mustard oil (khati sorishar tel) and unpolished protein-rich deshi moshur dal online at sobji.com.",
    summaryEn:
      "Traditional cold-pressed wooden Ghani mustard oil and unpolished small-grain deshi Moshur Dal crafted without chemical bleaching or palm-oil adulteration.",
    summaryBn:
      "কাঠের ঘানিতে ভাঙানো খাঁটি সরিষার তেল এবং কেমিক্যাল পলিশ ছাড়া দেশি মসুর ডাল প্রতিদিন তাজা প্যাক করা হয়।",
    keywords: [
      "ghani mustard oil dhaka",
      "khati sorishar tel",
      "deshi moshur dal",
      "organic pantry bangladesh",
      "খাঁটি সরিষার তেল",
      "দেশি মসুর ডাল",
    ],
  },
};

export interface HomeFaqItem {
  questionEn: string;
  answerEn: string;
  questionBn: string;
  answerBn: string;
}

export const HOME_FAQS: HomeFaqItem[] = [
  {
    questionEn: "Why order fresh sobji (shobji) and shak online from sobji.com?",
    answerEn:
      "sobji.com sources farm-fresh vegetables (sobji / shobji), leafy greens (shak like Lal Shak, Palong Shak, and Pui Shak), fruits, Padma river fish, meat, eggs, and pure spices (moshla) straight from partner farms in Bogura, Narsingdi, Munshiganj, Pabna, and Rajshahi at 5:00 AM with zero middlemen.",
    questionBn: "কেন sobji.com থেকে অনলাইনে তাজা সবজি ও শাক অর্ডার করবেন?",
    answerBn:
      "sobji.com প্রতিদিন ভোর ৫টায় বগুড়া, নরসিংদী, মুন্সিগঞ্জ, পাবনা ও রাজশাহীর পার্টনার কৃষকদের ক্ষেত থেকে মধ্যস্বত্বভোগী ছাড়া তাজা সবজি, লাল শাক, পালং শাক, পুঁই শাক, ফল, নদীর মাছ, মুরগি, ডিম ও খাঁটি মসলা সংগ্রহ করে সরাসরি আপনার বাসায় পৌঁছে দেয়।",
  },
  {
    questionEn: "Which Dhaka areas get 6:00 AM morning sobji and express delivery?",
    answerEn:
      "We deliver fresh sobji, shak, fruits, fish, meat, and moshla across Dhanmondi, Gulshan, Banani, Baridhara, Uttara, Mirpur, Mohammadpur, Bashundhara R/A, Badda, Rampura, Khilgaon, and Motijheel starting from 6:00 AM daily, plus 60-minute Dhaka Express slots.",
    questionBn: "ঢাকার কোন কোন এলাকায় সকাল ৬টা থেকে তাজা সবজি ও এক্সপ্রেস ডেলিভারি পাওয়া যায়?",
    answerBn:
      "ধানমন্ডি, গুলশান, বনানী, বারিধারা, উত্তরা, মিরপুর, মোহাম্মদপুর, বসুন্ধরা আবাসিক এলাকা, বাড্ডা, রামপুরা, খিলগাঁও এবং মতিঝিলে প্রতিদিন সকাল ৬টা থেকে রাত ১০টা পর্যন্ত ডেলিভারি এবং ৬০ মিনিট এক্সপ্রেস স্লট চালু আছে।",
  },
  {
    questionEn: "How does sobji.com keep vegetables, shak, fruits, and fish 100% formalin-free?",
    answerEn:
      "Every dawn batch goes through freshness grading and formalin-free screening at our Kawran Bazar Dawn Hub. If any vegetable, shak bunch, fruit, or Padma river fish cut fails your doorstep inspection, our 24h Freshness Promise gives an instant free replacement or full refund.",
    questionBn: "sobji.com-এর সবজি, শাক, ফল ও মাছ কীভাবে ১০০% ফরমালিন মুক্ত রাখা হয়?",
    answerBn:
      "প্রতিদিন ভোরের ব্যাচ আমাদের কারওয়ান বাজার হাবে মান যাচাই ও ফরমালিন মুক্ত স্ক্রিনিং শেষে প্যাক করা হয়। দরজায় পৌঁছে দেওয়ার পর যেকোনো পণ্যের মান পছন্দ না হলে ২৪ ঘণ্টার মধ্যে ফ্রি রিপ্লেসমেন্ট বা রিফান্ড পাবেন।",
  },
  {
    questionEn: "Can I buy fresh Padma Rui, Chandpur Ilish, Bagda Chingri, and Sonali chicken together?",
    answerEn:
      "Yes! Alongside daily sobji and shak, sobji.com stocks ice-packed Padma Rui fish cuts, whole Chandpur Ilish (Hilsa), Bagda Tiger Prawns, dressed Deshi Sonali chicken, and farm duck eggs so your entire kacha bazar arrives in one morning basket.",
    questionBn: "একই অর্ডারে কি পদ্মার রুই, চাঁদপুরের ইলিশ, বাগদা চিংড়ি ও সোনালী মুরগি পাওয়া যায়?",
    answerBn:
      "জি হ্যাঁ! প্রতিদিনের শাকসবজির সাথে একই ঝুড়িতে আইস-প্যাক করা পদ্মার রুই, চাঁদপুরের ইলিশ, বাগদা চিংড়ি, দেশি সোনালী মুরগি ও হাঁসের ডিম একসাথে ডেলিভারি নিতে পারবেন।",
  },
  {
    questionEn: "What pure spices (moshla) and pantry staples are available on sobji.com?",
    answerEn:
      "You can order Pabna deshi onion (peyaj), deshi garlic (roshun), ginger (ada), Bogura green chilli (kacha morich), pure turmeric powder (holud), cold-pressed wooden Ghani mustard oil (sorishar tel), and unpolished deshi Moshur Dal with clear per-kg and 250g/500g pricing.",
    questionBn: "sobji.com-এ কী কী খাঁটি মসলা ও গ্রোসারি পাওয়া যায়?",
    answerBn:
      "পাবনার দেশি পেঁয়াজ, দেশি রসুন, ঝাঁঝালো আদা, কাঁচা মরিচ, ভেজালমুক্ত বগুড়ার হলুদ গুঁড়া, কাঠের ঘানির খাঁটি সরিষার তেল এবং আনপলিশড দেশি মসুর ডাল পরিষ্কার ওজন ও দামে পাবেন।",
  },
  {
    questionEn: "How do free delivery, Cash on Delivery, bKash, Nagad, and Live Chat work?",
    answerEn:
      "Standard Dhaka delivery is free on orders ৳499+ (or ৳299+ for Sobji Club members) and ৳49 otherwise. Pay with Cash on Delivery, bKash, Nagad, or Visa/Mastercard, and message our support team directly via Live Chat or +880 1885-592511.",
    questionBn: "ফ্রি ডেলিভারি, ক্যাশ অন ডেলিভারি, বিকাশ, নগদ ও লাইভ চ্যাট কীভাবে কাজ করে?",
    answerBn:
      "৪৯৯৳+ অর্ডারে (এবং সবজি ক্লাব মেম্বারদের ২৯৯৳+ অর্ডারে) ফ্রি ডেলিভারি, এর নিচে মাত্র ৪৯৳। ক্যাশ অন ডেলিভারি, বিকাশ, নগদ ও কার্ডে পেমেন্ট করতে পারবেন এবং লাইভ চ্যাট বা ০১৮৮৫-৫৯২৫১১ নম্বরে সরাসরি যোগাযোগ করতে পারবেন।",
  },
];

export function buildHomeJsonLd(products: CatalogProduct[]) {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;

  const topItems = products.slice(0, 16).map((p, idx) => {
    const defVar = p.variants.find((v) => v.isDefault) ?? p.variants[0];
    return {
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/products/${p.slug}`,
      name: `${p.nameEn} (${p.nameBn})`,
      ...(defVar
        ? { description: `${p.subtitleEn} - ৳${defVar.priceBdt} / ${defVar.label}` }
        : {}),
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "GroceryStore", "LocalBusiness"],
        "@id": organizationId,
        name: "sobji.com",
        alternateName: [
          "Sobji",
          "Shobji",
          "Sobji Bazar",
          "Shobji Bazar",
          "সবজি",
          "সবজি ডট কম",
          "শাকসবজি",
        ],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/images/sobji-logo.png`,
          width: 512,
          height: 512,
        },
        image: [
          `${SITE_URL}/images/hero-basket.jpg`,
          `${SITE_URL}/images/farm-origin.jpg`,
          `${SITE_URL}/images/fresh-fish-spices.jpg`,
        ],
        description:
          "Bangladesh farm-direct online sobji (shobji), shak, fresh vegetables, fruits, Padma river fish, deshi chicken, duck eggs, pure spices (moshla) & ghani mustard oil marketplace with 6:00 AM Dhaka delivery.",
        telephone: "+8801885592511",
        email: "care@sobji.com",
        priceRange: "৳৳",
        currenciesAccepted: "BDT",
        paymentAccepted: "Cash, bKash, Nagad, Visa, Mastercard",
        knowsAbout: [
          "Fresh Vegetables (Sobji / Shobji)",
          "Leafy Greens (Shak: Lal Shak, Palong Shak, Pui Shak)",
          "Fresh Bangladeshi Fruits",
          "Padma River Fish (Rui, Ilish, Chingri)",
          "Deshi Chicken and Farm Eggs",
          "Pure Spices (Moshla) and Ghani Mustard Oil",
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: "Kawran Bazar Dawn Hub",
          addressLocality: "Dhaka",
          addressRegion: "Dhaka",
          postalCode: "1215",
          addressCountry: "BD",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 23.7515,
          longitude: 90.3932,
        },
        hasMap: "https://maps.google.com/?q=23.7515,90.3932",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+8801885592511",
          contactType: "customer service",
          availableLanguage: ["English", "Bengali"],
          areaServed: "BD",
        },
        areaServed: [
          "Dhanmondi",
          "Gulshan",
          "Banani",
          "Baridhara",
          "Uttara",
          "Mirpur",
          "Mohammadpur",
          "Bashundhara R/A",
          "Badda",
          "Rampura",
          "Khilgaon",
          "Motijheel",
          "Dhaka",
        ].map((area) => ({ "@type": "Place", name: area })),
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "06:00",
            closes: "22:00",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_URL,
        name: "sobji.com",
        alternateName: ["Sobji", "Shobji", "সবজি"],
        publisher: { "@id": organizationId },
        inLanguage: ["en", "bn"],
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: "sobji.com | Fresh Vegetables (Shobji), Shak & Online Kacha Bazar",
        isPartOf: { "@id": websiteId },
        about: { "@id": organizationId },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "[data-speakable='true']"],
        },
      },
      {
        "@type": "ItemList",
        name: "Fresh Sobji, Shobji, Shak, Fruits, Fish & Moshla Catalog on sobji.com",
        itemListElement: topItems,
      },
      {
        "@type": "FAQPage",
        mainEntity: HOME_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.questionEn,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answerEn,
          },
        })),
      },
      {
        "@type": "HowTo",
        name: "How to Order Fresh Sobji, Shobji & Shak Online in Dhaka from sobji.com",
        description:
          "Three simple steps to order formalin-free dawn-harvested vegetables, shak, fruits, river fish, and spices with 6:00 AM delivery across Dhaka.",
        totalTime: "PT2M",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Choose Fresh Produce by Exact Weight",
            text: "Browse fresh vegetables (sobji / shobji), shak, fruits, Padma fish, or moshla and select 250g, 500g, or 1kg pack weights.",
            url: `${SITE_URL}/#catalog`,
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Select Your Dhaka Area & 6:00 AM Delivery Slot",
            text: "Pick Dhanmondi, Gulshan, Banani, Uttara, Mirpur, or other Dhaka zones and choose a 6:00 AM morning or 60-minute express slot.",
            url: `${SITE_URL}/#slots`,
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Pay via Cash on Delivery, bKash, Nagad or Card & Track Live",
            text: "Checkout with free delivery on orders ৳499+ and track your harvest dispatch live using your order code.",
            url: `${SITE_URL}/track`,
          },
        ],
      },
    ],
  };
}

export function buildCategoryJsonLd(
  category: { slug: string; nameEn: string; nameBn: string; descriptionEn: string },
  products: CatalogProduct[]
) {
  const url = `${SITE_URL}/bazar/${category.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "sobji.com",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: `${category.nameEn} (${category.nameBn})`,
            item: url,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        url,
        name: `${category.nameEn} (${category.nameBn}) | sobji.com`,
        description: category.descriptionEn,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "[data-speakable='true']"],
        },
      },
      {
        "@type": "ItemList",
        name: `${category.nameEn} items on sobji.com`,
        itemListElement: products.map((p, idx) => {
          const defVar = p.variants.find((v) => v.isDefault) ?? p.variants[0];
          return {
            "@type": "ListItem",
            position: idx + 1,
            url: `${SITE_URL}/products/${p.slug}`,
            name: `${p.nameEn} (${p.nameBn})${defVar ? ` - ৳${defVar.priceBdt}` : ""}`,
          };
        }),
      },
    ],
  };
}

export interface ProductSeoInput {
  slug: string;
  nameEn: string;
  nameBn: string;
  subtitleEn: string;
  descriptionEn: string;
  imageUrl?: string | null;
  harvestTime?: string;
  storageTipEn?: string;
  storageTipBn?: string;
  ratingAvg: number;
  reviewCount: number;
  category?: { slug: string; nameEn: string } | null;
  categorySlug?: string;
  categoryNameEn?: string;
  farmer?: { district: string; upazila: string } | null;
  farmerDistrict?: string;
  variants: Array<{
    label?: string;
    priceBdt: number;
    stockQty: number;
    isDefault: boolean;
  }>;
  reviews?: Array<{
    authorName: string;
    rating: number;
    comment: string;
    createdAt: string | Date;
  }>;
}

export function buildProductFaqs(product: ProductSeoInput): HomeFaqItem[] {
  const district = product.farmer?.district ?? product.farmerDistrict ?? "Bogura";
  const upazila = product.farmer?.upazila ?? "partner farm hub";
  const defVar = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const variantSummary = product.variants
    .map((v) => `${v.label || "pack"} (৳${v.priceBdt})`)
    .join(", ");
  const priceText = defVar ? `৳${defVar.priceBdt} for ${defVar.label || "pack"}` : "farm-direct daily pricing";
  const harvest = product.harvestTime || "5:00 AM Dawn Harvest";
  const storageEn =
    product.storageTipEn ||
    "Keep refrigerated in a breathable vegetable pouch for crisp morning freshness.";
  const storageBn =
    product.storageTipBn ||
    "সতেজ রাখতে ফ্রিজে বাতাস চলাচল করে এমন পাত্রে সংরক্ষণ করুন।";

  return [
    {
      questionEn: `What is today's price of ${product.nameEn} (${product.nameBn}) in Dhaka on sobji.com?`,
      answerEn: `Today's fresh ${product.nameEn} (${product.nameBn}) starts at ${priceText}. Available pack options: ${variantSummary}. Orders ৳499+ qualify for free Dhaka home delivery.`,
      questionBn: `sobji.com-এ আজ ${product.nameBn} (${product.nameEn})-এর দাম কত?`,
      answerBn: `আজ তাজা ${product.nameBn} (${product.nameEn})-এর দাম শুরু ${priceText} থেকে। ৪৯৯৳+ অর্ডারে ঢাকায় ফ্রি হোম ডেলিভারি পাওয়া যাবে।`,
    },
    {
      questionEn: `Where is ${product.nameEn} sourced from and is it formalin-free?`,
      answerEn: `Our ${product.nameEn} is sourced directly from ${upazila}, ${district} (${harvest}) and screened 100% formalin-free before dispatch with a 24h doorstep freshness replacement guarantee.`,
      questionBn: `${product.nameBn} কোথা থেকে সংগ্রহ করা হয় এবং এটি কি ফরমালিন মুক্ত?`,
      answerBn: `${product.nameBn} সরাসরি ${district}-র কৃষকদের খামার থেকে (${harvest}) সংগ্রহ করা হয় এবং ১০০% ফরমালিন মুক্ত যাচাইয়ের পর ডেলিভারি করা হয়।`,
    },
    {
      questionEn: `How do I store ${product.nameEn} and when does Dhaka delivery arrive?`,
      answerEn: `${storageEn} Choose a 6:00 AM dawn slot or 60-minute Dhaka express slot across Dhanmondi, Gulshan, Banani, Uttara, Mirpur, Mohammadpur, and Bashundhara R/A.`,
      questionBn: `${product.nameBn} কীভাবে সংরক্ষণ করব এবং কখন ডেলিভারি পাব?`,
      answerBn: `${storageBn} ভোর ৬টা মর্নিং স্লট অথবা ৬০ মিনিট ঢাকা এক্সপ্রেস স্লটে ডেলিভারি নিতে পারবেন।`,
    },
  ];
}

export function buildProductJsonLd(product: ProductSeoInput) {
  const categoryName =
    product.category?.nameEn ?? product.categoryNameEn ?? "Fresh Vegetables";
  const categorySlug =
    product.category?.slug ?? product.categorySlug ?? "fresh-vegetables";
  const defVar = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const prices = product.variants.map((v) => v.priceBdt);
  const lowPrice = prices.length > 0 ? Math.min(...prices) : defVar?.priceBdt ?? 0;
  const highPrice = prices.length > 0 ? Math.max(...prices) : defVar?.priceBdt ?? 0;
  const inStock = product.variants.some((v) => v.stockQty > 0);
  const imgUrl = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${SITE_URL}${product.imageUrl}`
    : `${SITE_URL}/images/hero-basket.jpg`;

  const shippingDetails = {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: 49,
      currency: "BDT",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "BD",
      addressRegion: "Dhaka",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 0,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "DAY",
      },
    },
  };

  const returnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "BD",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 1,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
  };

  const priceValidUntil = "2027-12-31";
  const availability = inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "sobji.com",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: categoryName,
            item: `${SITE_URL}/bazar/${categorySlug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${product.nameEn} (${product.nameBn})`,
            item: `${SITE_URL}/products/${product.slug}`,
          },
        ],
      },
      {
        "@type": "Product",
        name: `${product.nameEn} (${product.nameBn})`,
        description: `${product.subtitleEn}. ${product.descriptionEn}`,
        sku: product.slug,
        mpn: product.slug,
        image: [imgUrl],
        category: categoryName,
        itemCondition: "https://schema.org/NewCondition",
        brand: {
          "@type": "Brand",
          name: "sobji.com",
        },
        offers:
          prices.length > 1
            ? {
                "@type": "AggregateOffer",
                priceCurrency: "BDT",
                lowPrice,
                highPrice,
                offerCount: prices.length,
                priceValidUntil,
                availability,
                url: `${SITE_URL}/products/${product.slug}`,
                seller: { "@id": `${SITE_URL}/#organization` },
                shippingDetails,
                hasMerchantReturnPolicy: returnPolicy,
              }
            : {
                "@type": "Offer",
                priceCurrency: "BDT",
                price: lowPrice,
                priceValidUntil,
                availability,
                url: `${SITE_URL}/products/${product.slug}`,
                seller: { "@id": `${SITE_URL}/#organization` },
                shippingDetails,
                hasMerchantReturnPolicy: returnPolicy,
              },
        aggregateRating:
          product.reviewCount > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: product.ratingAvg,
                reviewCount: product.reviewCount,
                bestRating: 5,
                worstRating: 1,
              }
            : undefined,
        ...(product.reviews && product.reviews.length > 0
          ? {
              review: product.reviews.slice(0, 5).map((r) => ({
                "@type": "Review",
                author: {
                  "@type": "Person",
                  name: r.authorName,
                },
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: r.rating,
                  bestRating: 5,
                  worstRating: 1,
                },
                reviewBody: r.comment,
                datePublished: new Date(r.createdAt).toISOString().slice(0, 10),
              })),
            }
          : {}),
      },
      {
        "@type": "FAQPage",
        mainEntity: buildProductFaqs(product).map((faq) => ({
          "@type": "Question",
          name: faq.questionEn,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answerEn,
          },
        })),
      },
    ],
  };
}
