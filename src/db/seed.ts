import { eq } from "drizzle-orm";
import { getDb } from "./index";
import {
  categories,
  farmers,
  products,
  productVariants,
  deliverySlots,
  coupons,
  reviews,
  orders,
  orderItems,
  user,
} from "./schema";
import { auth } from "@/lib/auth";

async function seed() {
  const db = getDb();
  console.log("Seeding sobji.com database...");

  // 1. Seed Categories
  const categoryData = [
    {
      slug: "fresh-vegetables",
      nameEn: "Fresh Vegetables",
      nameBn: "তাজা সবজি",
      descriptionEn: "Dawn-harvested everyday vegetables straight from Bogura & Narsingdi fields.",
      descriptionBn: "বগুড়া ও নরসিংদীর ক্ষেত থেকে ভোরে সংগৃহীত তাজা সবজি।",
      iconName: "carrot",
      accentColor: "#15803d",
      sortOrder: 1,
    },
    {
      slug: "leafy-greens",
      nameEn: "Leafy Greens (Shak)",
      nameBn: "তাজা শাক-পাতা",
      descriptionEn: "Crisp chemical-free lal shak, palong, pui shak & coriander.",
      descriptionBn: "কেমিক্যালমুক্ত লাল শাক, পালং, পুঁই ও ধনেপাতা।",
      iconName: "leaf",
      accentColor: "#16a34a",
      sortOrder: 2,
    },
    {
      slug: "ready-to-cook",
      nameEn: "Ready to Cook",
      nameBn: "রেডি-টু-কুক",
      descriptionEn: "Washed, peeled & hygienically chopped vegetable packs for busy kitchens.",
      descriptionBn: "ধোয়া, খোসা ছাড়ানো ও কাটা সবজির ঝামেলাহীন প্যাক।",
      iconName: "utensils",
      accentColor: "#0d9488",
      sortOrder: 3,
    },
    {
      slug: "fresh-fruits",
      nameEn: "Seasonal Fruits",
      nameBn: "মৌসুমি ফল",
      descriptionEn: "Carbide-free mangoes, Sagar kola, Thai guava & sweet papaya.",
      descriptionBn: "কার্বাইডমুক্ত আম, সাগর কলা, পেয়ারা ও পাকা পেঁপে।",
      iconName: "apple",
      accentColor: "#d97706",
      sortOrder: 4,
    },
    {
      slug: "river-fish",
      nameEn: "Fresh River Fish",
      nameBn: "তাজা নদীর মাছ",
      descriptionEn: "Formalin-free Padma Rui, Katla, Pangash & Chingri cleaned to order.",
      descriptionBn: "ফরমালিনমুক্ত পদ্মার রুই, কাতলা ও বাগদা চিংড়ি।",
      iconName: "fish",
      accentColor: "#0284c7",
      sortOrder: 5,
    },
    {
      slug: "meat-eggs",
      nameEn: "Deshi Meat & Eggs",
      nameBn: "দেশি মুরগি ও ডিম",
      descriptionEn: "Free-range Sonali & Deshi chicken plus farm-fresh brown eggs.",
      descriptionBn: "মুক্ত পরিবেশে পালিত সোনালি-দেশি মুরগি ও খামারের ডিম।",
      iconName: "egg",
      accentColor: "#ea580c",
      sortOrder: 6,
    },
    {
      slug: "spices-herbs",
      nameEn: "Spices & Aromatics",
      nameBn: "মসলা ও ভেষজ",
      descriptionEn: "Deshi onion, Bogura garlic, Sylheti ginger, turmeric & green chillies.",
      descriptionBn: "দেশি পেঁয়াজ, রসুন, আদা, হলুদ ও ঝাল কাঁচামরিচ।",
      iconName: "flame",
      accentColor: "#b45309",
      sortOrder: 7,
    },
    {
      slug: "organic-pantry",
      nameEn: "Oil, Dal & Pantry",
      nameBn: "তেল, ডাল ও গ্রোসারি",
      descriptionEn: "Cold-pressed ghani mustard oil, deshi moshur dal & dry staples.",
      descriptionBn: "ঘানি ভাঙা সরিষার তেল, দেশি মসুর ডাল ও শুকনো পণ্য।",
      iconName: "jar",
      accentColor: "#65a30d",
      sortOrder: 8,
    },
  ];

  const existingCats = await db.select().from(categories);
  if (existingCats.length === 0) {
    await db.insert(categories).values(categoryData);
  }
  const allCats = await db.select().from(categories);
  const catBySlug = new Map(allCats.map((c) => [c.slug, c.id]));

  // 2. Seed Farmers
  const farmerData = [
    {
      name: "Md. Abdul Karim",
      nameBn: "মোঃ আব্দুল করিম",
      district: "Bogura",
      upazila: "Shibganj",
      specialty: "Organic Potatoes, Brinjal & Tomatoes",
      yearsActive: 14,
      verified: true,
      storyEn:
        "Farming chemical-free vegetables on 6 acres of fertile Karatoya riverbank soil using vermicompost and neem pest control.",
      storyBn:
        "করতোয়া নদীর তীরে ৬ একর জমিতে কেঁচো সার ও প্রাকৃতিক নিম ব্যবহার করে ১৪ বছর ধরে বিষমুক্ত সবজি চাষ করছেন।",
    },
    {
      name: "Rahima Khatun",
      nameBn: "রহিমা খাতুন",
      district: "Narsingdi",
      upazila: "Belabo",
      specialty: "Leafy Greens, Bottle Gourd & Okra",
      yearsActive: 11,
      verified: true,
      storyEn:
        "Leads a 22-women farmer cooperative harvesting crisp shak and lau at 4:30 AM daily for direct Dhaka morning dispatch.",
      storyBn:
        "২২ জন নারী কৃষকের সমবায় নিয়ে প্রতিদিন ভোর ৪:৩০-এ তাজা শাক ও লাউ সংগ্রহ করে সরাসরি ঢাকায় পাঠান।",
    },
    {
      name: "Haji Rafiqul Islam",
      nameBn: "হাজী রফিকুল ইসলাম",
      district: "Munshiganj",
      upazila: "Sirajdikhan",
      specialty: "Diamond Potatoes & Winter Roots",
      yearsActive: 19,
      verified: true,
      storyEn:
        "Third-generation potato grower preserving heirloom Munshiganj varieties without cold-storage chemical coatings.",
      storyBn:
        "তিন প্রজন্ম ধরে মুন্সিগঞ্জের ঐতিহ্যবাহী ডায়মন্ড ও লাল আলু প্রাকৃতিক পদ্ধতিতে সংরক্ষণ ও সরবরাহ করছেন।",
    },
    {
      name: "Sajjad Hossain",
      nameBn: "সাজ্জাদ হোসেন",
      district: "Rajshahi",
      upazila: "Charghat",
      specialty: "Carbide-Free Mangoes & Papaya",
      yearsActive: 9,
      verified: true,
      storyEn:
        "Tree-ripened Padma valley orchards certified formalin and carbide free with batch harvest tagging.",
      storyBn:
        "পদ্মার চর এলাকায় কার্বাইড ও ফরমালিন ছাড়াই গাছে পাকা আম ও পেঁপে চাষ ও সরাসরি সরবরাহ করেন।",
    },
    {
      name: "Kamrul Bepari",
      nameBn: "কামরুল বেপারী",
      district: "Chandpur",
      upazila: "Sadar",
      specialty: "Live Padma-Meghna River Fish",
      yearsActive: 16,
      verified: true,
      storyEn:
        "Sources morning-catch river Rui, Katla & Bagda packed immediately in crushed RO-water ice without preservatives.",
      storyBn:
        "চাঁদপুরের পদ্মা-মেঘনার ভোরের তাজা রুই, কাতলা ও চিংড়ি কোনো প্রিজারভেটিভ ছাড়াই বরফে প্যাক করে পাঠান।",
    },
    {
      name: "Anwara Begum",
      nameBn: "আনোয়ারা বেগম",
      district: "Pabna",
      upazila: "Santhia",
      specialty: "Deshi Onion, Garlic & Cold-Pressed Oil",
      yearsActive: 12,
      verified: true,
      storyEn:
        "Supplies sun-cured Pabna deshi onions, turmeric, and pure wooden-ghani mustard oil from family farms.",
      storyBn:
        "পাবনার রোদে শুকানো দেশি পেঁয়াজ, হলুদ ও কাঠের ঘানি ভাঙা খাঁটি সরিষার তেল সরাসরি সরবরাহ করেন।",
    },
  ];

  const existingFarmers = await db.select().from(farmers);
  if (existingFarmers.length === 0) {
    await db.insert(farmers).values(farmerData);
  }
  const allFarmers = await db.select().from(farmers);
  const farmerByDistrict = new Map(allFarmers.map((f) => [f.district, f.id]));

  // 3. Seed Products + Variants
  const existingProducts = await db.select().from(products);
  if (existingProducts.length === 0) {
    const productSeed = [
      {
        slug: "deshi-vine-tomato",
        categoryId: catBySlug.get("fresh-vegetables")!,
        farmerId: farmerByDistrict.get("Bogura")!,
        nameEn: "Deshi Vine Tomato",
        nameBn: "দেশি টমেটো",
        subtitleEn: "Juicy, sun-ripened Bogura tomatoes",
        subtitleBn: "বগুড়ার রসালো ও টাটকা দেশি টমেটো",
        descriptionEn:
          "Handpicked at dawn in Shibganj, Bogura. Naturally sweet-tangy flavor ideal for daily curries, salads, and bhorta with zero artificial ripening.",
        descriptionBn:
          "বগুড়ার শিবগঞ্জ থেকে ভোরে সংগ্রহ করা প্রাকৃতিকভাবে পাকা দেশি টমেটো। ভর্তা, সালাদ ও তরকারির জন্য অতুলনীয়।",
        visualKey: "tomato",
        badge: "Organic",
        isFeatured: true,
        isFlashDeal: true,
        isMemberBogo: false,
        harvestTime: "Today, 5:00 AM • Bogura",
        storageTipEn: "Keep at cool room temperature for 3 days or refrigerate in paper bag.",
        storageTipBn: "ঠান্ডা জায়গায় ৩ দিন বা কাগজের ব্যাগে ফ্রিজে ৭ দিন পর্যন্ত তাজা থাকে।",
        ratingAvg: 4.9,
        reviewCount: 48,
        variants: [
          { label: "500g", priceBdt: 42, compareAtBdt: 55, stockQty: 90, isDefault: true },
          { label: "1kg", priceBdt: 78, compareAtBdt: 105, stockQty: 75, isDefault: false },
          { label: "2kg", priceBdt: 150, compareAtBdt: 200, stockQty: 40, isDefault: false },
        ],
      },
      {
        slug: "munshiganj-diamond-potato",
        categoryId: catBySlug.get("fresh-vegetables")!,
        farmerId: farmerByDistrict.get("Munshiganj")!,
        nameEn: "Munshiganj Diamond Potato",
        nameBn: "মুন্সিগঞ্জের ডায়মন্ড আলু",
        subtitleEn: "Soil-brushed fresh harvest potatoes",
        subtitleBn: "সরাসরি খামারের বাছাইকৃত ডায়মন্ড আলু",
        descriptionEn:
          "Firm, creamy-flesh Diamond potatoes from Sirajdikhan, Munshiganj. Sorted by hand so every piece is blemish-free.",
        descriptionBn:
          "সিরাজদিখানের সেরা ডায়মন্ড আলু — হাতে বাছাইকৃত ও পোকামাকড়মুক্ত।",
        visualKey: "potato",
        badge: "Farm Direct",
        isFeatured: true,
        isFlashDeal: true,
        isMemberBogo: false,
        harvestTime: "Yesterday, 4:30 PM • Munshiganj",
        storageTipEn: "Store in a dry, dark ventilated basket away from onions.",
        storageTipBn: "শুকনো ও আলো-বাতাসযুক্ত ঝুড়িতে পেঁয়াজ থেকে আলাদা রাখুন।",
        ratingAvg: 4.8,
        reviewCount: 64,
        variants: [
          { label: "1kg", priceBdt: 48, compareAtBdt: 60, stockQty: 180, isDefault: true },
          { label: "2kg", priceBdt: 92, compareAtBdt: 115, stockQty: 120, isDefault: false },
          { label: "5kg", priceBdt: 220, compareAtBdt: 280, stockQty: 60, isDefault: false },
        ],
      },
      {
        slug: "narsingdi-lomba-begun",
        categoryId: catBySlug.get("fresh-vegetables")!,
        farmerId: farmerByDistrict.get("Narsingdi")!,
        nameEn: "Deshi Purple Brinjal (Begun)",
        nameBn: "দেশি লম্বা বেগুন",
        subtitleEn: "Glossy, seed-tender purple brinjal",
        subtitleBn: "কচি ও বীজ-নরম তাজা বেগুন",
        descriptionEn:
          "Tender, glossy purple brinjals picked before sunrise in Belabo. Great for begun bhaja, bhorta, or ilish curry.",
        descriptionBn:
          "বেলাব থেকে সূর্যোদয়ের আগে তোলা কচি লম্বা বেগুন — ভাজি, ভর্তা ও মাছের ঝোলের জন্য চমৎকার।",
        visualKey: "brinjal",
        badge: "Deshi",
        isFeatured: true,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Today, 4:45 AM • Narsingdi",
        storageTipEn: "Keep dry in vegetable crisper drawer for up to 5 days.",
        storageTipBn: "শুকনো অবস্থায় ফ্রিজের ভেজিটেবল ড্রয়ারে ৫ দিন ভালো থাকে।",
        ratingAvg: 4.7,
        reviewCount: 31,
        variants: [
          { label: "500g", priceBdt: 45, compareAtBdt: 58, stockQty: 70, isDefault: true },
          { label: "1kg", priceBdt: 85, compareAtBdt: 110, stockQty: 55, isDefault: false },
        ],
      },
      {
        slug: "kacha-lao-bottle-gourd",
        categoryId: catBySlug.get("fresh-vegetables")!,
        farmerId: farmerByDistrict.get("Narsingdi")!,
        nameEn: "Tender Bottle Gourd (Lau)",
        nameBn: "কচি দেশি লাউ",
        subtitleEn: "Dew-fresh trellis-grown bottle gourd",
        subtitleBn: "মাচার কচি ও মিষ্টি লাউ",
        descriptionEn:
          "Harvested tender with soft skin from bamboo trellises in Narsingdi. Ideal for lau chingri and light summer curries.",
        descriptionBn:
          "নরসিংদীর মাচার কচি লাউ — খোসা নরম এবং লাউ-চিংড়ি বা ডাল-লাউয়ের জন্য দারুণ।",
        visualKey: "gourd",
        badge: "Farm Direct",
        isFeatured: true,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Today, 5:10 AM • Narsingdi",
        storageTipEn: "Store whole in a cool corner or fridge for 5–7 days.",
        storageTipBn: "আস্ত অবস্থায় ঠান্ডা স্থানে বা ফ্রিজে ৫-৭ দিন তাজা থাকে।",
        ratingAvg: 4.9,
        reviewCount: 27,
        variants: [
          { label: "1 pc (~1.1kg)", priceBdt: 65, compareAtBdt: 80, stockQty: 45, isDefault: true },
          { label: "2 pcs", priceBdt: 124, compareAtBdt: 155, stockQty: 25, isDefault: false },
        ],
      },
      {
        slug: "lal-shak-red-amaranth",
        categoryId: catBySlug.get("leafy-greens")!,
        farmerId: farmerByDistrict.get("Narsingdi")!,
        nameEn: "Organic Lal Shak (Red Spinach)",
        nameBn: "অর্গানিক লাল শাক",
        subtitleEn: "Root-trimmed crisp morning bundle",
        subtitleBn: "শেকড় পরিষ্কার করা ভোরের তাজা লাল শাক",
        descriptionEn:
          "Vibrant crimson-leaf lal shak harvested at 4:30 AM and misted with clean well water — never soaked in chemical dyes.",
        descriptionBn:
          "কোনো কৃত্রিম রঙ বা কেমিক্যাল ছাড়া ভোর ৪:৩০-এ তোলা টাটকা লাল শাকের আঁটি।",
        visualKey: "spinach",
        badge: "Organic",
        isFeatured: true,
        isFlashDeal: true,
        isMemberBogo: true,
        harvestTime: "Today, 4:30 AM • Narsingdi",
        storageTipEn: "Wrap in damp paper towel inside fridge; cook within 48 hours.",
        storageTipBn: "হালকা ভেজা কাগজে মুড়ে ফ্রিজে রাখুন এবং ৪৮ ঘণ্টার মধ্যে রান্না করুন।",
        ratingAvg: 4.9,
        reviewCount: 53,
        variants: [
          { label: "1 Bundle (~300g)", priceBdt: 28, compareAtBdt: 38, stockQty: 110, isDefault: true },
          { label: "2 Bundles", priceBdt: 52, compareAtBdt: 72, stockQty: 75, isDefault: false },
        ],
      },
      {
        slug: "palong-shak-spinach",
        categoryId: catBySlug.get("leafy-greens")!,
        farmerId: farmerByDistrict.get("Narsingdi")!,
        nameEn: "Deshi Palong Shak (Spinach)",
        nameBn: "দেশি পালং শাক",
        subtitleEn: "Tender green iron-rich leaves",
        subtitleBn: "কচি সবুজ ও পুষ্টিকর পালং শাক",
        descriptionEn:
          "Broad, tender palong leaves washed free of sand and bundled fresh every morning.",
        descriptionBn:
          "বালুমুক্ত কচি পালং শাক — প্রতিদিন সকালে খেত থেকে সরাসরি আসে।",
        visualKey: "spinach",
        badge: "Organic",
        isFeatured: false,
        isFlashDeal: false,
        isMemberBogo: true,
        harvestTime: "Today, 4:40 AM • Narsingdi",
        storageTipEn: "Keep unwashed in perforated bag in the fridge for 3 days.",
        storageTipBn: "ছিদ্রযুক্ত ব্যাগে ফ্রিজে ৩ দিন পর্যন্ত তাজা থাকে।",
        ratingAvg: 4.8,
        reviewCount: 22,
        variants: [
          { label: "1 Bundle (~350g)", priceBdt: 32, compareAtBdt: 40, stockQty: 90, isDefault: true },
          { label: "2 Bundles", priceBdt: 60, compareAtBdt: 78, stockQty: 60, isDefault: false },
        ],
      },
      {
        slug: "dhonepata-fresh-coriander",
        categoryId: catBySlug.get("leafy-greens")!,
        farmerId: farmerByDistrict.get("Bogura")!,
        nameEn: "Aromatic Deshi Dhonepata",
        nameBn: "দেশি সুগন্ধি ধনেপাতা",
        subtitleEn: "Fragrant small-leaf coriander",
        subtitleBn: "তীব্র সুগন্ধযুক্ত দেশি ধনেপাতা",
        descriptionEn:
          "True deshi coriander with intense aroma — just a pinch elevates bhorta, dal, and fish curries.",
        descriptionBn:
          "আসল সুগন্ধযুক্ত দেশি ধনেপাতা — ভর্তা, ডাল ও তরকারির স্বাদ দ্বিগুণ করে।",
        visualKey: "coriander",
        badge: "Deshi",
        isFeatured: false,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Today, 5:00 AM • Bogura",
        storageTipEn: "Keep stems in a glass of water in the fridge.",
        storageTipBn: "ডাঁটা পানিতে ডুবিয়ে ফ্রিজে রাখলে ৭ দিন সতেজ থাকে।",
        ratingAvg: 4.9,
        reviewCount: 39,
        variants: [
          { label: "100g", priceBdt: 22, compareAtBdt: 30, stockQty: 140, isDefault: true },
          { label: "250g", priceBdt: 48, compareAtBdt: 65, stockQty: 80, isDefault: false },
        ],
      },
      {
        slug: "kacha-morich-green-chilli",
        categoryId: catBySlug.get("spices-herbs")!,
        farmerId: farmerByDistrict.get("Bogura")!,
        nameEn: "Bogura Kacha Morich",
        nameBn: "বগুড়ার ঝাল কাঁচামরিচ",
        subtitleEn: "Crisp, aromatic green chillies",
        subtitleBn: "টাটকা ও সুগন্ধি কাঁচামরিচ",
        descriptionEn:
          "Bright green, aromatic chillies picked crisp in Bogura — balanced heat and fresh crunch.",
        descriptionBn:
          "বগুড়ার টাটকা কাঁচামরিচ — চমৎকার ঝাল ও সুঘ্রাণ।",
        visualKey: "chilli",
        badge: "Farm Direct",
        isFeatured: true,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Today, 5:15 AM • Bogura",
        storageTipEn: "Remove stems and store in an airtight box lined with tissue.",
        storageTipBn: "বোটা ছাড়িয়ে টিস্যু বিছানো বক্সে ফ্রিজে রাখুন।",
        ratingAvg: 4.8,
        reviewCount: 44,
        variants: [
          { label: "250g", priceBdt: 45, compareAtBdt: 55, stockQty: 120, isDefault: true },
          { label: "500g", priceBdt: 85, compareAtBdt: 105, stockQty: 85, isDefault: false },
        ],
      },
      {
        slug: "pabna-deshi-onion",
        categoryId: catBySlug.get("spices-herbs")!,
        farmerId: farmerByDistrict.get("Pabna")!,
        nameEn: "Pabna Deshi Onion (Peyaj)",
        nameBn: "পাবনার দেশি পেঁয়াজ",
        subtitleEn: "Pungent, sun-cured local bulbs",
        subtitleBn: "ঝাঁঝালো ও রোদে শুকানো দেশি পেঁয়াজ",
        descriptionEn:
          "Authentic Santhia, Pabna deshi red onions — dry outer skins, tight layers, rich cooking aroma.",
        descriptionBn:
          "পাবনার সাঁথিয়ার খাঁটি দেশি পেঁয়াজ — রান্নায় আনে আসল স্বাদ।",
        visualKey: "onion",
        badge: "Deshi",
        isFeatured: true,
        isFlashDeal: true,
        isMemberBogo: false,
        harvestTime: "Sun-Cured Batch • Pabna",
        storageTipEn: "Store in an open mesh bag in a cool dry spot.",
        storageTipBn: "খোলা ঝুড়ি বা জাল ব্যাগে শুকনো জায়গায় রাখুন।",
        ratingAvg: 4.9,
        reviewCount: 82,
        variants: [
          { label: "500g", priceBdt: 52, compareAtBdt: 65, stockQty: 200, isDefault: false },
          { label: "1kg", priceBdt: 98, compareAtBdt: 120, stockQty: 150, isDefault: true },
          { label: "2kg", priceBdt: 190, compareAtBdt: 235, stockQty: 90, isDefault: false },
        ],
      },
      {
        slug: "deshi-garlic-roshun",
        categoryId: catBySlug.get("spices-herbs")!,
        farmerId: farmerByDistrict.get("Pabna")!,
        nameEn: "Deshi Garlic (Roshun)",
        nameBn: "দেশি রসুন",
        subtitleEn: "Aromatic local small-clove garlic",
        subtitleBn: "সুগন্ধি ছোট কোয়ার দেশি রসুন",
        descriptionEn:
          "Rich essential-oil deshi garlic bulbs from Pabna — far more fragrant than imported large garlic.",
        descriptionBn:
          "পাবনার ছোট কোয়ার খাঁটি দেশি রসুন — তীব্র ঘ্রাণ ও ভেষজ গুণে সমৃদ্ধ।",
        visualKey: "garlic",
        badge: "Deshi",
        isFeatured: false,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Cured Batch • Pabna",
        storageTipEn: "Keep dry in ventilated pantry basket.",
        storageTipBn: "শুকনো ও বাতাস চলাচল করে এমন পাত্রে রাখুন।",
        ratingAvg: 4.8,
        reviewCount: 36,
        variants: [
          { label: "250g", priceBdt: 58, compareAtBdt: 70, stockQty: 130, isDefault: true },
          { label: "500g", priceBdt: 112, compareAtBdt: 135, stockQty: 95, isDefault: false },
          { label: "1kg", priceBdt: 215, compareAtBdt: 260, stockQty: 50, isDefault: false },
        ],
      },
      {
        slug: "ready-to-cook-mixed-bhaji",
        categoryId: catBySlug.get("ready-to-cook")!,
        farmerId: farmerByDistrict.get("Bogura")!,
        nameEn: "Ready-to-Cook Mix Bhaji Pack",
        nameBn: "রেডি-টু-কুক মিক্স সবজি প্যাক",
        subtitleEn: "Washed & julienned 5-veg morning pack",
        subtitleBn: "ধোয়া ও কাটা ৫ রকমের সবজির ভাজি প্যাক",
        descriptionEn:
          "RO-water washed, peeled, and evenly julienned potato, carrot, beans, papaya & cabbage. Straight into the pan in 30 seconds.",
        descriptionBn:
          "পরিশোধিত পানিতে ধোয়া ও সমান করে কাটা আলু, গাজর, বরবটি, পেঁপে ও বাঁধাকপি — সরাসরি কড়াইয়ে দিন।",
        visualKey: "ready-mix",
        badge: "Hygienic Pack",
        isFeatured: true,
        isFlashDeal: false,
        isMemberBogo: true,
        harvestTime: "Cut at 5:30 AM • Dhaka Hub",
        storageTipEn: "Refrigerate immediately and cook within 24 hours for peak crunch.",
        storageTipBn: "ফ্রিজে রাখুন এবং ২৪ ঘণ্টার মধ্যে রান্না করুন।",
        ratingAvg: 4.9,
        reviewCount: 41,
        variants: [
          { label: "500g Pack", priceBdt: 75, compareAtBdt: 95, stockQty: 60, isDefault: true },
          { label: "1kg Family Pack", priceBdt: 140, compareAtBdt: 180, stockQty: 35, isDefault: false },
        ],
      },
      {
        slug: "ready-to-cook-peeled-garlic-ginger",
        categoryId: catBySlug.get("ready-to-cook")!,
        farmerId: farmerByDistrict.get("Pabna")!,
        nameEn: "Peeled Deshi Garlic & Ginger Combo",
        nameBn: "খোসা ছাড়ানো রসুন ও আদা কম্বো",
        subtitleEn: "Hand-peeled, ready to blend",
        subtitleBn: "হাতে খোসা ছাড়ানো বাটা-উপযোগী প্যাক",
        descriptionEn:
          "Save 30 minutes of kitchen prep! Hygienically peeled deshi garlic cloves and washed ginger root.",
        descriptionBn:
          "রান্নার প্রস্তুতিতে ৩০ মিনিট সময় বাঁচান — পরিষ্কার খোসা ছাড়ানো দেশি রসুন ও আদা।",
        visualKey: "garlic",
        badge: "Time Saver",
        isFeatured: false,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Prepped 6:00 AM • Dhaka Hub",
        storageTipEn: "Keep chilled in airtight jar up to 5 days.",
        storageTipBn: "এয়ারটাইট বক্সে ফ্রিজে ৫ দিন ভালো থাকে।",
        ratingAvg: 4.8,
        reviewCount: 29,
        variants: [
          { label: "250g Combo", priceBdt: 88, compareAtBdt: 110, stockQty: 75, isDefault: true },
          { label: "500g Combo", priceBdt: 168, compareAtBdt: 210, stockQty: 45, isDefault: false },
        ],
      },
      {
        slug: "rajshahi-himsagar-mango",
        categoryId: catBySlug.get("fresh-fruits")!,
        farmerId: farmerByDistrict.get("Rajshahi")!,
        nameEn: "Rajshahi Himsagar Mango",
        nameBn: "রাজশাহীর হিমসাগর আম",
        subtitleEn: "Tree-ripened, 100% carbide-free",
        subtitleBn: "গাছে পাকা ১০০% কার্বাইডমুক্ত হিমসাগর",
        descriptionEn:
          "Sweet, fiberless Himsagar mangoes direct from Charghat orchards. Tested negative for calcium carbide & formalin.",
        descriptionBn:
          "চারঘাটের বাগান থেকে সরাসরি আসা আঁশবিহীন ও মধুর মতো মিষ্টি হিমসাগর আম।",
        visualKey: "mango",
        badge: "Carbide Free",
        isFeatured: true,
        isFlashDeal: true,
        isMemberBogo: false,
        harvestTime: "Harvested 48h Ago • Rajshahi",
        storageTipEn: "Keep in breathable carton until fragrant, then chill before serving.",
        storageTipBn: "বাতাস চলাচল করে এমন ঝুড়িতে রাখুন, খাওয়ার আগে ঠান্ডা করুন।",
        ratingAvg: 5.0,
        reviewCount: 76,
        variants: [
          { label: "1kg (4-5 pcs)", priceBdt: 155, compareAtBdt: 195, stockQty: 80, isDefault: true },
          { label: "3kg Crate", priceBdt: 440, compareAtBdt: 560, stockQty: 45, isDefault: false },
        ],
      },
      {
        slug: "narsingdi-sagar-kola",
        categoryId: catBySlug.get("fresh-fruits")!,
        farmerId: farmerByDistrict.get("Narsingdi")!,
        nameEn: "Narsingdi Sagar Kola (Banana)",
        nameBn: "নরসিংদীর সাগর কলা",
        subtitleEn: "Naturally ripened creamy bananas",
        subtitleBn: "প্রাকৃতিকভাবে পাকা মিষ্টি সাগর কলা",
        descriptionEn:
          "Classic Narsingdi Sagar bananas ripened slowly without chemical sprays. High potassium and natural sweetness.",
        descriptionBn:
          "কেমিক্যাল ছাড়া প্রাকৃতিকভাবে পাকা নরসিংদীর বিখ্যাত সাগর কলা।",
        visualKey: "banana",
        badge: "Organic",
        isFeatured: false,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Today, 5:20 AM • Narsingdi",
        storageTipEn: "Hang or place on counter away from direct sun.",
        storageTipBn: "রোদ থেকে দূরে স্বাভাবিক তাপমাত্রায় রাখুন।",
        ratingAvg: 4.8,
        reviewCount: 34,
        variants: [
          { label: "1 Dozen (12 pcs)", priceBdt: 115, compareAtBdt: 140, stockQty: 70, isDefault: true },
          { label: "Half Dozen (6 pcs)", priceBdt: 62, compareAtBdt: 75, stockQty: 90, isDefault: false },
        ],
      },
      {
        slug: "padma-rui-fish-cut",
        categoryId: catBySlug.get("river-fish")!,
        farmerId: farmerByDistrict.get("Chandpur")!,
        nameEn: "Fresh Padma Rui (Cleaned & Cut)",
        nameBn: "তাজা পদ্মার রুই মাছ (কাটা)",
        subtitleEn: "Morning river catch, zero formalin",
        subtitleBn: "ভোরের তাজা নদীর রুই, আঁশ ও নাড়িভুঁড়ি পরিষ্কার",
        descriptionEn:
          "Sweet-flesh 2kg+ Padma river Rui caught before dawn at Chandpur, hygienically descaled and cut into Bengali curry steaks.",
        descriptionBn:
          "চাঁদপুরের ২ কেজি+ তাজা নদীর রুই মাছ — সুন্দরভাবে কেটে ধুয়ে বরফসহ ডেলিভারি।",
        visualKey: "fish",
        badge: "Morning Catch",
        isFeatured: true,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Today, 4:00 AM • Chandpur",
        storageTipEn: "Cook same day or freeze immediately at -18°C.",
        storageTipBn: "আজই রান্না করুন অথবা ডিপ ফ্রিজে সংরক্ষণ করুন।",
        ratingAvg: 4.9,
        reviewCount: 57,
        variants: [
          { label: "500g Steaks", priceBdt: 245, compareAtBdt: 290, stockQty: 40, isDefault: true },
          { label: "1kg Steaks", priceBdt: 470, compareAtBdt: 560, stockQty: 30, isDefault: false },
        ],
      },
      {
        slug: "deshi-sonali-chicken",
        categoryId: catBySlug.get("meat-eggs")!,
        farmerId: farmerByDistrict.get("Bogura")!,
        nameEn: "Free-Range Sonali Chicken (Dressed)",
        nameBn: "খামারের সোনালি মুরগি (ড্রেসড)",
        subtitleEn: "Antibiotic-free, skin-off curry cut",
        subtitleBn: "অ্যান্টিবায়োটিক-মুক্ত, চামড়া ছাড়ানো পিস",
        descriptionEn:
          "Raised naturally on grain feed in Bogura without growth hormones. Cleaned and cut into traditional curry pieces.",
        descriptionBn:
          "বগুড়ার মুক্ত খামারে লালিত অ্যান্টিবায়োটিকমুক্ত সোনালি মুরগি — কারি কাট পিস।",
        visualKey: "chicken",
        badge: "Safe Meat",
        isFeatured: true,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Chilled Fresh • Today 5:30 AM",
        storageTipEn: "Keep chilled at 0–4°C and cook within 24 hours.",
        storageTipBn: "০-৪° সে. তাপমাত্রায় রাখুন এবং ২৪ ঘণ্টার মধ্যে রান্না করুন।",
        ratingAvg: 4.8,
        reviewCount: 44,
        variants: [
          { label: "750g Dressed", priceBdt: 295, compareAtBdt: 340, stockQty: 35, isDefault: true },
          { label: "1kg Dressed", priceBdt: 385, compareAtBdt: 445, stockQty: 25, isDefault: false },
        ],
      },
      {
        slug: "deshi-duck-farm-eggs",
        categoryId: catBySlug.get("meat-eggs")!,
        farmerId: farmerByDistrict.get("Narsingdi")!,
        nameEn: "Deshi Free-Range Brown Eggs",
        nameBn: "দেশি লাল ডিম (খামারের তাজা)",
        subtitleEn: "Deep-orange yolk, omega-rich eggs",
        subtitleBn: "গাঢ় কুসুমযুক্ত পুষ্টিকর দেশি লাল ডিম",
        descriptionEn:
          "Laid by free-roaming hens in Narsingdi village co-ops. Rich golden yolks packed securely in biodegradable pulp trays.",
        descriptionBn:
          "নরসিংদীর মুক্ত মুরগির গাঢ় কুসুমের তাজা লাল ডিম — নিরাপদ ট্রেতে ডেলিভারি।",
        visualKey: "egg",
        badge: "Farm Direct",
        isFeatured: false,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Collected Yesterday • Narsingdi",
        storageTipEn: "Store pointed-end down in refrigerator egg tray.",
        storageTipBn: "ফ্রিজে সরু অংশ নিচে রেখে ২ সপ্তাহ পর্যন্ত ভালো থাকে।",
        ratingAvg: 4.9,
        reviewCount: 62,
        variants: [
          { label: "12 pcs (1 Dozen)", priceBdt: 165, compareAtBdt: 185, stockQty: 95, isDefault: true },
          { label: "24 pcs (2 Dozen)", priceBdt: 320, compareAtBdt: 360, stockQty: 50, isDefault: false },
        ],
      },
      {
        slug: "ghani-pure-mustard-oil",
        categoryId: catBySlug.get("organic-pantry")!,
        farmerId: farmerByDistrict.get("Pabna")!,
        nameEn: "Wooden-Ghani Pure Mustard Oil",
        nameBn: "কাঠের ঘানি ভাঙা খাঁটি সরিষার তেল",
        subtitleEn: "Cold-pressed, unfiltered Pabna mustard oil",
        subtitleBn: "পাবনার খাঁটি ঝাঁঝালো সরিষার তেল",
        descriptionEn:
          "Pressed slowly in traditional wooden kolhu/ghani from black deshi mustard seeds. Zero mineral oil or artificial essence.",
        descriptionBn:
          "ঐতিহ্যবাহী কাঠের ঘানিতে ভাঙা ১০০% খাঁটি সরিষার তেল — ভর্তা ও আচারের সেরা সঙ্গী।",
        visualKey: "mustard-oil",
        badge: "Pure Ghani",
        isFeatured: true,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Fresh Press • This Week",
        storageTipEn: "Keep tightly capped away from stove heat.",
        storageTipBn: "মুখ ভালোভাবে বন্ধ করে চুলার তাপ থেকে দূরে রাখুন।",
        ratingAvg: 5.0,
        reviewCount: 71,
        variants: [
          { label: "500ml", priceBdt: 195, compareAtBdt: 225, stockQty: 65, isDefault: true },
          { label: "1 Litre", priceBdt: 375, compareAtBdt: 430, stockQty: 50, isDefault: false },
        ],
      },
      {
        slug: "deshi-moshur-dal",
        categoryId: catBySlug.get("organic-pantry")!,
        farmerId: farmerByDistrict.get("Pabna")!,
        nameEn: "Deshi Choto Moshur Dal",
        nameBn: "দেশি ছোট মসুর ডাল",
        subtitleEn: "Unpolished, quick-cooking red lentils",
        subtitleBn: "পলিশ-মুক্ত আসল দেশি ছোট মসুর ডাল",
        descriptionEn:
          "Small-grain deshi moshur dal that melts smoothly into creamy aromatic dal without artificial oil polishing.",
        descriptionBn:
          "কোনো কৃত্রিম তেল পালিশ ছাড়া দ্রুত সেদ্ধ হওয়া সুস্বাদু দেশি ছোট মসুর ডাল।",
        visualKey: "lentils",
        badge: "Unpolished",
        isFeatured: false,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Harvest Batch • Pabna",
        storageTipEn: "Store in airtight glass or steel container.",
        storageTipBn: "শুকনো এয়ারটাইট জারে ৬ মাস পর্যন্ত ভালো থাকে।",
        ratingAvg: 4.9,
        reviewCount: 38,
        variants: [
          { label: "500g", priceBdt: 78, compareAtBdt: 90, stockQty: 120, isDefault: false },
          { label: "1kg", priceBdt: 148, compareAtBdt: 170, stockQty: 100, isDefault: true },
        ],
      },
      {
        slug: "bogura-pure-turmeric-powder",
        categoryId: catBySlug.get("spices-herbs")!,
        farmerId: farmerByDistrict.get("Bogura")!,
        nameEn: "Stone-Ground Deshi Turmeric",
        nameBn: "দেশি খাঁটি হলুদের গুঁড়া",
        subtitleEn: "High-curcumin, lead-chromate free",
        subtitleBn: "রঙমুক্ত ও নিজস্ব মিলে ভাঙানো খাঁটি হলুদ",
        descriptionEn:
          "Sun-dried Bogura turmeric fingers milled in small batches. Bright natural golden color with zero synthetic dye.",
        descriptionBn:
          "বগুড়ার রোদে শুকানো হলুদ নিজস্ব মিলে ভাঙানো — ক্ষতিকর রঙ বা ভেজালমুক্ত।",
        visualKey: "turmeric",
        badge: "Lab Tested",
        isFeatured: false,
        isFlashDeal: false,
        isMemberBogo: false,
        harvestTime: "Freshly Milled • This Week",
        storageTipEn: "Keep sealed in dark glass jar.",
        storageTipBn: "আলো থেকে দূরে এয়ারটাইট বয়ামে রাখুন।",
        ratingAvg: 4.9,
        reviewCount: 45,
        variants: [
          { label: "200g", priceBdt: 85, compareAtBdt: 105, stockQty: 90, isDefault: true },
          { label: "500g", priceBdt: 198, compareAtBdt: 240, stockQty: 55, isDefault: false },
        ],
      },
    ];

    for (const item of productSeed) {
      const { variants, ...prodData } = item;
      const [inserted] = await db.insert(products).values(prodData).returning();
      await db.insert(productVariants).values(
        variants.map((v) => ({
          ...v,
          productId: inserted.id,
        }))
      );
      await db.insert(reviews).values([
        {
          productId: inserted.id,
          authorName: "Farhana Rahman (Dhanmondi)",
          rating: 5,
          comment: `Arrived crisp in the 6 AM morning slot! Best ${inserted.nameEn.toLowerCase()} quality I have ordered online in Dhaka.`,
          verifiedPurchase: true,
        },
        {
          productId: inserted.id,
          authorName: "Tanvir Ahmed (Uttara)",
          rating: 5,
          comment: "Super clean packaging, exact weight, and great farm-direct price.",
          verifiedPurchase: true,
        },
      ]);
    }
  }

  // 4. Seed Delivery Slots
  const existingSlots = await db.select().from(deliverySlots);
  if (existingSlots.length === 0) {
    await db.insert(deliverySlots).values([
      {
        labelEn: "Early Bird Dawn Slot",
        labelBn: "ভোরের আর্লি স্লট",
        windowText: "6:00 AM – 8:00 AM",
        isExpress: false,
        capacity: 60,
        sortOrder: 1,
        isActive: true,
      },
      {
        labelEn: "Morning Kitchen Slot",
        labelBn: "সকালের বাজার স্লট",
        windowText: "8:00 AM – 11:00 AM",
        isExpress: false,
        capacity: 90,
        sortOrder: 2,
        isActive: true,
      },
      {
        labelEn: "Express 60-Min Delivery",
        labelBn: "এক্সপ্রেস ৬০ মিনিট ডেলিভারি",
        windowText: "Within 60 mins",
        isExpress: true,
        capacity: 40,
        sortOrder: 3,
        isActive: true,
      },
      {
        labelEn: "Afternoon Slot",
        labelBn: "দুপুরের স্লট",
        windowText: "2:00 PM – 5:00 PM",
        isExpress: false,
        capacity: 80,
        sortOrder: 4,
        isActive: true,
      },
      {
        labelEn: "Evening Bazar Slot",
        labelBn: "সন্ধ্যার বাজার স্লট",
        windowText: "6:00 PM – 9:00 PM",
        isExpress: false,
        capacity: 85,
        sortOrder: 5,
        isActive: true,
      },
    ]);
  }

  // 5. Seed Coupons
  const existingCoupons = await db.select().from(coupons);
  if (existingCoupons.length === 0) {
    await db.insert(coupons).values([
      {
        code: "SOBJI10",
        discountType: "percent",
        discountValue: 10,
        minOrderBdt: 350,
        maxDiscountBdt: 150,
        descriptionEn: "10% off on orders ৳350+ (up to ৳150)",
        isActive: true,
      },
      {
        code: "FRESH50",
        discountType: "fixed",
        discountValue: 50,
        minOrderBdt: 499,
        maxDiscountBdt: 50,
        descriptionEn: "Flat ৳50 off on orders ৳499+",
        isActive: true,
      },
      {
        code: "MORNING15",
        discountType: "percent",
        discountValue: 15,
        minOrderBdt: 800,
        maxDiscountBdt: 250,
        descriptionEn: "15% off on family bazar ৳800+",
        isActive: true,
      },
    ]);
  }

  // 6. Seed Demo Admin & Customer Accounts via Better Auth
  const existingAdmin = await db
    .select()
    .from(user)
    .where(eq(user.email, "admin@sobji.com"));
  if (existingAdmin.length === 0) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          name: "Sobji Operations Admin",
          email: "admin@sobji.com",
          password: "SobjiAdmin2026!",
        },
      });
      if (res?.user?.id) {
        await db
          .update(user)
          .set({ role: "admin", isMember: true, phone: "01700-000001" })
          .where(eq(user.id, res.user.id));
      }
    } catch (e) {
      console.log("Admin user seed note:", e);
    }
  }

  let customerId: string | null = null;
  const existingCustomer = await db
    .select()
    .from(user)
    .where(eq(user.email, "customer@sobji.com"));
  if (existingCustomer.length === 0) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          name: "Nusrat Jahan",
          email: "customer@sobji.com",
          password: "SobjiUser2026!",
        },
      });
      if (res?.user?.id) {
        customerId = res.user.id;
        await db
          .update(user)
          .set({
            role: "customer",
            isMember: true,
            memberSince: new Date(),
            phone: "01711-223344",
          })
          .where(eq(user.id, res.user.id));
      }
    } catch (e) {
      console.log("Customer user seed note:", e);
    }
  } else {
    customerId = existingCustomer[0].id;
  }

  // 7. Seed Demo Trackable Order (SBJ-DEMO01)
  const existingDemoOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.orderCode, "SBJ-DEMO01"));
  if (existingDemoOrder.length === 0) {
    const slots = await db.select().from(deliverySlots);
    const firstSlot = slots[0];
    const [demoOrder] = await db
      .insert(orders)
      .values({
        orderCode: "SBJ-DEMO01",
        userId: customerId,
        customerName: "Nusrat Jahan",
        customerPhone: "01711-223344",
        customerEmail: "customer@sobji.com",
        deliveryArea: "Dhanmondi",
        deliveryAddress: "House 24, Road 9/A, Dhanmondi, Dhaka 1209",
        deliveryNotes: "Call on arrival at gate",
        slotId: firstSlot?.id ?? null,
        slotLabel: firstSlot
          ? `${firstSlot.labelEn} (${firstSlot.windowText})`
          : "6:00 AM – 8:00 AM",
        deliveryDate: new Date().toISOString().slice(0, 10),
        paymentMethod: "bkash",
        paymentStatus: "paid",
        paymentRef: "BKX982341",
        status: "out_for_delivery",
        subtotalBdt: 365,
        discountBdt: 37,
        deliveryFeeBdt: 0,
        totalBdt: 328,
        couponCode: "SOBJI10",
        isRecurringWeekly: true,
      })
      .returning();

    await db.insert(orderItems).values([
      {
        orderId: demoOrder.id,
        productNameEn: "Deshi Vine Tomato",
        productNameBn: "দেশি টমেটো",
        variantLabel: "1kg",
        visualKey: "tomato",
        unitPriceBdt: 78,
        quantity: 1,
        lineTotalBdt: 78,
      },
      {
        orderId: demoOrder.id,
        productNameEn: "Organic Lal Shak (Red Spinach)",
        productNameBn: "অর্গানিক লাল শাক",
        variantLabel: "2 Bundles",
        visualKey: "spinach",
        unitPriceBdt: 52,
        quantity: 1,
        lineTotalBdt: 52,
      },
      {
        orderId: demoOrder.id,
        productNameEn: "Fresh Padma Rui (Cleaned & Cut)",
        productNameBn: "তাজা পদ্মার রুই মাছ (কাটা)",
        variantLabel: "500g Steaks",
        visualKey: "fish",
        unitPriceBdt: 235,
        quantity: 1,
        lineTotalBdt: 235,
      },
    ]);
  }

  console.log("Seed complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
