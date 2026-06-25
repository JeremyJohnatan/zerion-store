import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const services = [
  // Jasa Joki
  {
    gameName: "Genshin Impact",
    category: "Eksplorasi",
    name: "100% Eksplorasi Natlan",
    description: "Layanan joki eksplorasi map Natlan hingga 100%. Mencakup semua chest, oculus, puzzle, dan world quest utama. Estimasi pengerjaan 2-4 hari.",
    basePrice: 150000,
    imageUrl: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=1000&auto=format&fit=crop",
    type: "JOKI",
    isFeatured: true,
  },
  {
    gameName: "Valorant",
    category: "Push Rank",
    name: "Iron ke Gold Joki Cepat",
    description: "Jasa joki rank Valorant terpercaya. Dikerjakan oleh pro player tier Immortal/Radiant. Winrate tinggi, akun aman 100%. Estimasi 1-3 hari.",
    basePrice: 250000,
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
    type: "JOKI",
    isFeatured: true,
  },
  {
    gameName: "Honkai: Star Rail",
    category: "Farming",
    name: "Farming Relic 1 Minggu",
    description: "Layanan farming relic sesuai request stats. Pengerjaan manual tanpa bot. Garansi akun aman.",
    basePrice: 100000,
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1000&auto=format&fit=crop",
    type: "JOKI",
    isFeatured: false,
  },
  {
    gameName: "Wuthering Waves",
    category: "Story Clear",
    name: "Clear Story Chapter 1-4",
    description: "Clear seluruh main story Chapter 1 sampai 4 beserta side quest penting. Estimasi 2-3 hari.",
    basePrice: 120000,
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop",
    type: "JOKI",
    isFeatured: true,
  },
  {
    gameName: "Mobile Legends",
    category: "Push Rank",
    name: "Epic ke Mythic Kilat",
    description: "Joki cepat Epic ke Mythic. Winrate dijamin naik. Dikerjakan oleh mantan pro player tier Mythical Glory.",
    basePrice: 200000,
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
    type: "JOKI",
    isFeatured: false,
  },
  {
    gameName: "PUBG Mobile",
    category: "Push Rank",
    name: "Ace to Conqueror",
    description: "Joki aman anti banned dari Ace tier ke Conqueror. Proses manual, tidak menggunakan cheat atau aplikasi pihak ketiga.",
    basePrice: 400000,
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
    type: "JOKI",
    isFeatured: true,
  },
  {
    gameName: "Dota 2",
    category: "Boosting MMR",
    name: "Boost MMR +500",
    description: "Tingkatkan MMR Dota 2 Anda dengan bantuan player rank Immortal. Garansi winrate tinggi dan aman dari banned.",
    basePrice: 350000,
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1000&auto=format&fit=crop",
    type: "JOKI",
    isFeatured: false,
  },
  // App Premium
  {
    gameName: "Netflix",
    category: "Streaming",
    name: "Netflix Premium 1 Bulan (Sharing)",
    description: "Akun Netflix Premium resolusi 4K. 1 Profil 1 Orang. Garansi penuh 1 bulan anti on-hold.",
    basePrice: 35000,
    imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=1000&auto=format&fit=crop",
    type: "APP_PREMIUM",
    isFeatured: true,
  },
  {
    gameName: "Spotify",
    category: "Music",
    name: "Spotify Premium Individual (Invite)",
    description: "Upgrade akun lama/baru menjadi Premium. Garansi 1 Bulan. Resmi dan aman tanpa password.",
    basePrice: 25000,
    imageUrl: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1000&auto=format&fit=crop",
    type: "APP_PREMIUM",
    isFeatured: true,
  },
  {
    gameName: "YouTube",
    category: "Streaming",
    name: "YouTube Premium 1 Bulan",
    description: "Bebas iklan, putar di latar belakang, dan YouTube Music Premium. Sistem invite family, aman 100%.",
    basePrice: 15000,
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
    type: "APP_PREMIUM",
    isFeatured: false,
  },
  {
    gameName: "Canva",
    category: "Productivity",
    name: "Canva Pro Invite 1 Tahun",
    description: "Akses semua fitur Canva Pro. Gabung ke tim edukasi kami. Garansi aktif 1 tahun.",
    basePrice: 45000,
    imageUrl: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1000&auto=format&fit=crop",
    type: "APP_PREMIUM",
    isFeatured: true,
  },
  {
    gameName: "Discord",
    category: "Social",
    name: "Discord Nitro 1 Bulan",
    description: "Tingkatkan pengalaman komunitas Discord dengan Nitro. Bebas upload besar, badge keren, dan server boost.",
    basePrice: 65000,
    imageUrl: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1000&auto=format&fit=crop",
    type: "APP_PREMIUM",
    isFeatured: false,
  },
  {
    gameName: "Zoom",
    category: "Productivity",
    name: "Zoom Pro 1 Bulan",
    description: "Meeting tanpa batas waktu dengan Zoom Pro. Termasuk fitur recording cloud dan co-host. Akun legal 100%.",
    basePrice: 95000,
    imageUrl: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1000&auto=format&fit=crop",
    type: "APP_PREMIUM",
    isFeatured: false,
  },
  {
    gameName: "Disney+ Hotstar",
    category: "Streaming",
    name: "Disney+ Premium 1 Bulan",
    description: "Tonton film dan series Marvel, Star Wars, Pixar, dll. Resolusi 4K. Privat, anti screen limit.",
    basePrice: 40000,
    imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=1000&auto=format&fit=crop",
    type: "APP_PREMIUM",
    isFeatured: true,
  },
  {
    gameName: "ChatGPT",
    category: "Productivity",
    name: "ChatGPT Plus 1 Bulan (Shared)",
    description: "Akses ke model GPT-4 dan fitur advanced data analysis. Sistem sharing akun, hemat dan terjangkau.",
    basePrice: 85000,
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
    type: "APP_PREMIUM",
    isFeatured: true,
  }
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing services
  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();

  for (const service of services) {
    const created = await prisma.service.create({ data: service });
    console.log(`  ✅ Created service: ${created.name} (${created.id})`);
  }

  console.log("✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
