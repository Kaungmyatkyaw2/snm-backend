import { AdminPermissionModule } from "../generated/prisma/client";
import { auth } from "../src/server/better-auth/config";
import { db } from "../src/server/db";

const SUPER_ADMIN_ROLE_KEY = "super_admin";

const ADMIN_PERMISSION_MODULES: AdminPermissionModule[] = [
  AdminPermissionModule.dashboard,
  AdminPermissionModule.products,
  AdminPermissionModule.categories,
  AdminPermissionModule.brands,
  AdminPermissionModule.inventory,
  AdminPermissionModule.orders,
  AdminPermissionModule.customers,
  AdminPermissionModule.shipping,
  AdminPermissionModule.loyalty,
  AdminPermissionModule.promotions,
  AdminPermissionModule.content,
  AdminPermissionModule.finance,
  AdminPermissionModule.transactions,
  AdminPermissionModule.banking,
  AdminPermissionModule.reports,
  AdminPermissionModule.admin_users,
  AdminPermissionModule.admin_roles,
  AdminPermissionModule.order_export,
  AdminPermissionModule.notifications,
  AdminPermissionModule.settings,
];

const BRANDS = [
  { name: "Best", slug: "best", logoUrl: "/brands/best.png" },
  { name: "Ready", slug: "ready", logoUrl: "/brands/ready.png" },
  { name: "အိမ်ချက်", slug: "ein-chet", logoUrl: "/brands/ein-chat.png" },
  {
    name: "ဖိုးထောင်",
    slug: "pho-htaung",
    logoUrl: "/brands/phoe-htaung.png",
  },
  {
    name: "ပင်ပျိုရွက်နု",
    slug: "pin-pyo-ywe-nu",
    logoUrl: "/brands/pinpyo.png",
  },
  { name: "ဝင်း", slug: "win", logoUrl: "/brands/win.png" },
  { name: "မတုတ်မ", slug: "ma-tote-ma", logoUrl: "/brands/wa-tote.png" },
  {
    name: "စည်တော်ကြီး",
    slug: "si-daw-gyi",
    logoUrl: "/brands/c-taw-gyi.png",
  },
  {
    name: "စိန်ပလောင်",
    slug: "sein-palaung",
    logoUrl: "/brands/sein-palaung.png",
  },
  {
    name: "မင်းသားကြီး",
    slug: "min-tha-gyi",
    logoUrl: "/brands/minthargyi.png",
  },
  { name: "ရွှေတော", slug: "shwe-taw", logoUrl: "/brands/shwe-taw.png" },
  { name: "Tomo", slug: "tomo", logoUrl: "/brands/tomo.png" },
  { name: "လေးက", slug: "lay-ka", logoUrl: "/brands/lay-ka.png" },
  {
    name: "ရှမ်းရွှေတောင်",
    slug: "shan-shwe-taung",
    logoUrl: "/brands/shan-shwe.png",
  },
  { name: "ကြူကြူမ", slug: "kyu-kyu-ma", logoUrl: "/brands/kyukyu.png" },
  {
    name: "ဆုပုရစ်က",
    slug: "su-pu-yit-ka",
    logoUrl: "/brands/su.png",
  },
  { name: "Nivea", slug: "nivea", logoUrl: "/brands/nivea.png" },
  {
    name: "ရွှေပြည်နန်းသနပ်ခါး",
    slug: "shwe-pyi-nan",
    logoUrl: "/brands/shwe-pyi-nan.png",
  },
  { name: "Happy", slug: "happy", logoUrl: "/brands/happy.png" },
  { name: "Nuthouse", slug: "nuthouse", logoUrl: "/brands/nut-house.png" },
  { name: "A1", slug: "a1", logoUrl: "/brands/a1.png" },
  { name: "မယ်ဝ", slug: "mel-wa", logoUrl: "/brands/mel-wa.png" },
  { name: "Wao!", slug: "wao", logoUrl: "/brands/ma.png" },
  { name: "မ", slug: "ma", logoUrl: "/brands/ma.png" },
];

const CATEGORIES = [
  {
    name: "လက်ဖက်နှင့်အကြော်စုံ",
    slug: "lahpet-and-achan",
    imageUrl: "/categories/laphat.png",
  },
  {
    name: "စည်သွတ်ဘူး",
    slug: "canned-food",
    imageUrl: "/categories/ctoot.png",
  },
  {
    name: "ငပိ&ငါးခြောက်",
    slug: "ngapi-dried-fish",
    imageUrl: "/categories/fish.png",
  },
  {
    name: "မီးဖိုချောင်သုံးပစ္စည်းများ",
    slug: "kitchen-supplies",
    imageUrl: "/categories/kitchen.png",
  },
  {
    name: "ဆန်နှင့်ပဲအမျိုးမျိုး",
    slug: "rice-and-beans",
    imageUrl: "/categories/rice.png",
  },
  {
    name: "မုန့်&snack",
    slug: "biscuits-snacks",
    imageUrl: "/categories/snack.png",
  },
  {
    name: "Coffee & Tea & Juice",
    slug: "coffee-tea-juice",
    imageUrl: "/categories/coffee.png",
  },
  {
    name: "အသား၊ငါးနှင့်ပုစွန်",
    slug: "meat-fish-shrimp",
    imageUrl: "/categories/meat.png",
  },
  {
    name: "အသီးအရွက်",
    slug: "fruits-vegetables",
    imageUrl: "/categories/vegetable.png",
  },
  {
    name: "တိုင်းရင်းဆေး&အလှကုန်",
    slug: "traditional-medicine-beauty",
    imageUrl: "/categories/medicine.png",
  },
  {
    name: "မုန့်ဟင်းခါး&အုန်းနို့ခေါက်ဆွဲ&ခေါက်ဆွဲခြောက်",
    slug: "mohinga-coconut-noodles",
    imageUrl: "/categories/noodle.png",
  },
];

const SHIPPING_TYPES = [
  {
    name: "Dry",
    key: "dry",
    description: "Regular ambient delivery items",
    status: "active" as const,
    baseFee: 2500,
  },
  {
    name: "Frozen",
    key: "frozen",
    description: "Cold-chain required products",
    status: "active" as const,
    baseFee: 4000,
  },
  {
    name: "Heavy",
    key: "heavy",
    description: "Heavy-weight shipment products",
    status: "active" as const,
    baseFee: 5000,
  },
];

const HERO_BANNERS = [
  {
    id: "ban-1",
    title: "နွေဦးပေးကမ်းချင်းများ",
    subtitle: "ဆန်အမျိုးများတွင် ၁၀% လျှော့ဈေး",
    imageUrl:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop",
    buttonText: "Shop Now",
    buttonLink: "/products",
    startDate: "2026-05-01",
    endDate: "2026-06-10",
    sortOrder: 1,
    status: "active" as const,
  },
  {
    id: "ban-2",
    title: "ပင်လယ်ထွက်ကုန်သစ်များ",
    subtitle: "ပုဇွန်ခြောက်နှင့် ငါးခြောက်အသစ်များ",
    imageUrl:
      "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=1200&auto=format&fit=crop",
    buttonText: "Explore",
    buttonLink: "/products",
    startDate: "2026-05-05",
    endDate: "2026-06-25",
    sortOrder: 2,
    status: "active" as const,
  },
  {
    id: "ban-3",
    title: "လွန်ခဲ့သောနှစ်ဆန်းဦး",
    subtitle: "Special promotion ended",
    imageUrl: "",
    buttonText: "",
    buttonLink: "",
    startDate: "2026-01-01",
    endDate: "2026-03-01",
    sortOrder: 3,
    status: "inactive" as const,
  },
];

const PROMOTION_CARDS = [
  {
    id: "promo-1",
    title: "Best Sellers",
    description: "ရောင်းအားအမြင့်ဆုံး ကုန်ပစ္စည်းများ",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop",
    buttonText: "Shop",
    buttonLink: "/products",
    sortOrder: 1,
    status: "active" as const,
  },
  {
    id: "promo-2",
    title: "New Arrivals",
    description: "ကုန်ပစ္စည်းအသစ်များ ရောက်ရှိလာပြီ",
    imageUrl:
      "https://images.unsplash.com/photo-1618898909019-010e4e234c55?w=600&auto=format&fit=crop",
    buttonText: "Explore",
    buttonLink: "/products",
    sortOrder: 2,
    status: "active" as const,
  },
  {
    id: "promo-3",
    title: "Seasonal Specials",
    description: "ရာသီဆိုင်ရာ အထူးလျှော့ဈေးများ",
    imageUrl: "",
    buttonText: "See All",
    buttonLink: "/products",
    sortOrder: 3,
    status: "inactive" as const,
  },
];

const DEFAULT_ANNOUNCEMENT = {
  message: "🎉 ¥50,000 以上のご注文で送料無料！",
  link: "/promotions",
  status: "active" as const,
};

const parseDateOnly = (value: string): Date => {
  return new Date(`${value}T00:00:00.000Z`);
};

async function seedBrands(adminId: string) {
  for (const brand of BRANDS) {
    await db.brand.upsert({
      where: { slug: brand.slug },
      create: {
        name: brand.name,
        slug: brand.slug,
        status: "active",
        createdById: adminId,
        logoUrl: brand.logoUrl,
      },
      update: {
        name: brand.name,
        logoUrl: brand.logoUrl,
        status: "active",
      },
    });
    console.log(`✅ Brand synced: ${brand.name}`);
  }
}
async function seedCategories(adminId: string) {
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i]!;
    await db.category.upsert({
      where: { slug: cat.slug },
      create: {
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.imageUrl,
        sortOrder: i + 1,
        status: "active",
        createdById: adminId,
      },
      update: {
        name: cat.name,
        imageUrl: cat.imageUrl,
        sortOrder: i + 1,
      },
    });
    console.log(`✅ Category synced: ${cat.name}`);
  }
}

async function seedShipping(adminId: string) {
  const defaultZone = await db.shippingZone.upsert({
    where: { id: "zone-default" },
    create: {
      id: "zone-default",
      name: "Standard Zone",
      deliveryDays: 3,
      locations: ["Tokyo", "Kanagawa", "Saitama"],
      surcharge: 0,
      createdById: adminId,
    },
    update: {
      name: "Standard Zone",
      deliveryDays: 3,
      locations: ["Tokyo", "Kanagawa", "Saitama"],
      surcharge: 0,
    },
    select: { id: true },
  });

  for (const type of SHIPPING_TYPES) {
    await db.shippingType.upsert({
      where: { key: type.key },
      create: {
        name: type.name,
        key: type.key,
        description: type.description,
        status: type.status,
        createdById: adminId,
      },
      update: {
        name: type.name,
        description: type.description,
        status: type.status,
      },
    });

    await db.shippingFeeRule.upsert({
      where: {
        shippingTypeKey_zoneId: {
          shippingTypeKey: type.key,
          zoneId: defaultZone.id,
        },
      },
      create: {
        shippingTypeKey: type.key,
        zoneId: defaultZone.id,
        baseFee: type.baseFee,
        createdById: adminId,
      },
      update: {
        baseFee: type.baseFee,
      },
    });
    console.log(`✅ Shipping type + fee synced: ${type.key} (${type.baseFee})`);
  }
}

type SeedProductVariant = {
  sku: string;
  costPerUnit?: number;
  price: number;
  stock: number;
  weightValue: number | null;
  weightUnit: string | null;
  lowStockThreshold?: number;
};

async function clearAndSeedProducts(adminId: string) {
  // Delete all products (cascades to variants, images, inventory logs)
  await db.product.deleteMany({});
  console.log("🗑️  All products cleared.");

  // Fetch seeded slugs to resolve IDs
  const [categories, brands] = await Promise.all([
    db.category.findMany({ select: { id: true, slug: true } }),
    db.brand.findMany({ select: { id: true, slug: true } }),
  ]);

  const catId = (slug: string) => categories.find((c) => c.slug === slug)?.id;
  const brandId = (slug: string) => brands.find((b) => b.slug === slug)?.id;

  const PRODUCTS: Array<{
    name: string;
    slug: string;
    categorySlug: string;
    brandSlug: string | null;
    shippingTypeKey: string;
    variants: SeedProductVariant[];
  }> = [
    {
      name: "ဆန်ဖြူ ကျပ်စပါး",
      slug: "white-rice-kyat-spa",
      categorySlug: "rice-and-beans",
      brandSlug: "shwe-taw",
      shippingTypeKey: "heavy",
      variants: [
        {
          sku: "RICE-5KG",
          price: 7500,
          stock: 100,
          weightValue: 5,
          weightUnit: "kg",
        },
        {
          sku: "RICE-10KG",
          price: 14500,
          stock: 50,
          weightValue: 10,
          weightUnit: "kg",
        },
      ],
    },
    {
      name: "Best Biscuit Original",
      slug: "best-biscuit-original",
      categorySlug: "biscuits-snacks",
      brandSlug: "best",
      shippingTypeKey: "dry",
      variants: [
        {
          sku: "BEST-BISC-50G",
          price: 500,
          stock: 200,
          weightValue: 50,
          weightUnit: "g",
        },
        {
          sku: "BEST-BISC-100G",
          price: 950,
          stock: 150,
          weightValue: 100,
          weightUnit: "g",
        },
      ],
    },
    {
      name: "Ready ခေါက်ဆွဲခြောက်",
      slug: "ready-instant-noodle",
      categorySlug: "mohinga-coconut-noodles",
      brandSlug: "ready",
      shippingTypeKey: "dry",
      variants: [
        {
          sku: "READY-NDL-65G",
          price: 600,
          stock: 300,
          weightValue: 65,
          weightUnit: "g",
        },
        {
          sku: "READY-NDL-5PK",
          price: 2800,
          stock: 80,
          weightValue: 325,
          weightUnit: "g",
        },
      ],
    },
    {
      name: "ငါးပိကောင်း",
      slug: "ngapi-kaung",
      categorySlug: "ngapi-dried-fish",
      brandSlug: "ma-tote-ma",
      shippingTypeKey: "dry",
      variants: [
        {
          sku: "NGAPI-250G",
          price: 3500,
          stock: 60,
          weightValue: 250,
          weightUnit: "g",
        },
        {
          sku: "NGAPI-500G",
          price: 6500,
          stock: 30,
          weightValue: 500,
          weightUnit: "g",
        },
      ],
    },
    {
      name: "Nivea Body Lotion",
      slug: "nivea-body-lotion",
      categorySlug: "traditional-medicine-beauty",
      brandSlug: "nivea",
      shippingTypeKey: "dry",
      variants: [
        {
          sku: "NIVEA-BL-200ML",
          price: 8500,
          stock: 40,
          weightValue: 200,
          weightUnit: "ml",
        },
        {
          sku: "NIVEA-BL-400ML",
          price: 15000,
          stock: 20,
          weightValue: 400,
          weightUnit: "ml",
        },
      ],
    },
    {
      name: "ကြက်ဥ",
      slug: "chicken-egg",
      categorySlug: "meat-fish-shrimp",
      brandSlug: null,
      shippingTypeKey: "dry",
      variants: [
        {
          sku: "EGG-10PCS",
          price: 3500,
          stock: 50,
          weightValue: null,
          weightUnit: null,
        },
        {
          sku: "EGG-30PCS",
          price: 9500,
          stock: 20,
          weightValue: null,
          weightUnit: null,
        },
      ],
    },
    {
      name: "ဆိတ်ထောပတ်",
      slug: "butter-natural",
      categorySlug: "kitchen-supplies",
      brandSlug: "a1",
      shippingTypeKey: "frozen",
      variants: [
        {
          sku: "BUTTER-200G",
          price: 4500,
          stock: 30,
          weightValue: 200,
          weightUnit: "g",
        },
      ],
    },
    {
      name: "Coffee Mix 3-in-1",
      slug: "coffee-mix-3in1",
      categorySlug: "coffee-tea-juice",
      brandSlug: "tomo",
      shippingTypeKey: "dry",
      variants: [
        {
          sku: "COFFEE-20PK",
          price: 3500,
          stock: 120,
          weightValue: 300,
          weightUnit: "g",
        },
        {
          sku: "COFFEE-50PK",
          price: 8000,
          stock: 60,
          weightValue: 750,
          weightUnit: "g",
        },
      ],
    },
    {
      name: "ဆန်းကြယ်ဆန် (ချိုင်းနိုင်း)",
      slug: "jasmine-rice-chain-nine",
      categorySlug: "rice-and-beans",
      brandSlug: "shwe-taw",
      shippingTypeKey: "heavy",
      variants: [
        {
          sku: "JASMINE-5KG",
          price: 9500,
          stock: 80,
          weightValue: 5,
          weightUnit: "kg",
        },
        {
          sku: "JASMINE-25KG",
          price: 44000,
          stock: 15,
          lowStockThreshold: 20,
          weightValue: 25,
          weightUnit: "kg",
        },
      ],
    },
    {
      name: "မြိတ်ပုဇွန်ခြောက်",
      slug: "myeik-dried-shrimp",
      categorySlug: "ngapi-dried-fish",
      brandSlug: null,
      shippingTypeKey: "dry",
      variants: [
        {
          sku: "SHRIMP-DRY-100G",
          price: 5000,
          stock: 45,
          weightValue: 100,
          weightUnit: "g",
        },
        {
          sku: "SHRIMP-DRY-250G",
          price: 11500,
          stock: 12,
          lowStockThreshold: 10,
          weightValue: 250,
          weightUnit: "g",
        },
      ],
    },
  ];

  for (const p of PRODUCTS) {
    const product = await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        categoryId: p.categorySlug ? catId(p.categorySlug) : null,
        brandId: p.brandSlug ? brandId(p.brandSlug) : null,
        shippingTypeKey: p.shippingTypeKey,
        status: "active",
        createdById: adminId,
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku,
            costPerUnit: v.costPerUnit ?? 0,
            price: v.price,
            stockQuantity: v.stock,
            lowStockThreshold: v.lowStockThreshold ?? 10,
            lowStockAlertEnabled: true,
            weightValue: v.weightValue,
            weightUnit: v.weightUnit,
            isActive: true,
          })),
        },
      },
    });
    console.log(`✅ Product seeded: ${product.name}`);
  }
}

async function seedContent(adminId: string) {
  for (const banner of HERO_BANNERS) {
    await db.heroBanner.upsert({
      where: { id: banner.id },
      create: {
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.imageUrl || null,
        buttonText: banner.buttonText || null,
        buttonLink: banner.buttonLink || null,
        startDate: parseDateOnly(banner.startDate),
        endDate: parseDateOnly(banner.endDate),
        sortOrder: banner.sortOrder,
        status: banner.status,
        createdById: adminId,
      },
      update: {
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.imageUrl || null,
        buttonText: banner.buttonText || null,
        buttonLink: banner.buttonLink || null,
        startDate: parseDateOnly(banner.startDate),
        endDate: parseDateOnly(banner.endDate),
        sortOrder: banner.sortOrder,
        status: banner.status,
      },
    });
    console.log(`✅ Hero banner synced: ${banner.title}`);
  }

  for (const card of PROMOTION_CARDS) {
    await db.promotionCard.upsert({
      where: { id: card.id },
      create: {
        id: card.id,
        title: card.title,
        description: card.description,
        imageUrl: card.imageUrl || null,
        buttonText: card.buttonText || null,
        buttonLink: card.buttonLink || null,
        sortOrder: card.sortOrder,
        status: card.status,
        createdById: adminId,
      },
      update: {
        title: card.title,
        description: card.description,
        imageUrl: card.imageUrl || null,
        buttonText: card.buttonText || null,
        buttonLink: card.buttonLink || null,
        sortOrder: card.sortOrder,
        status: card.status,
      },
    });
    console.log(`✅ Promotion card synced: ${card.title}`);
  }

  await db.announcementBar.upsert({
    where: { scope: "default" },
    create: {
      scope: "default",
      message: DEFAULT_ANNOUNCEMENT.message,
      link: DEFAULT_ANNOUNCEMENT.link,
      status: DEFAULT_ANNOUNCEMENT.status,
      createdById: adminId,
    },
    update: {
      message: DEFAULT_ANNOUNCEMENT.message,
      link: DEFAULT_ANNOUNCEMENT.link,
      status: DEFAULT_ANNOUNCEMENT.status,
    },
  });
  console.log("✅ Announcement bar synced: default");
}

async function seedSuperAdminRole(superAdminUserId: string) {
  const role = await db.adminRole.upsert({
    where: { key: SUPER_ADMIN_ROLE_KEY },
    create: {
      key: SUPER_ADMIN_ROLE_KEY,
      name: "Super Admin",
      description: "Full access to all modules",
      permissions: ADMIN_PERMISSION_MODULES,
      isSystem: true,
      createdById: superAdminUserId,
    },
    update: {
      name: "Super Admin",
      description: "Full access to all modules",
      permissions: ADMIN_PERMISSION_MODULES,
      isSystem: true,
    },
  });

  await db.user.update({
    where: { id: superAdminUserId },
    data: { adminRoleId: role.id },
  });

  console.log(
    `✅ Super admin role synced (${ADMIN_PERMISSION_MODULES.length} modules) and linked to user`,
  );
}

async function main() {
  const email = "superadmin@snm.com";

  const existing = await db.user.findUnique({ where: { email } });

  let adminId: string;

  if (!existing) {
    const result = await auth.api.signUpEmail({
      body: {
        name: "Super Admin",
        email,
        password: "root64@Admin",
      },
      headers: new Headers(),
    });

    await db.user.update({
      where: { id: result.user.id },
      data: { role: "admin", emailVerified: true },
    });

    adminId = result.user.id;
    console.log("✅ Super admin seeded:", email);
  } else {
    // Ensure existing user has correct role
    if (existing.role !== "admin") {
      await db.user.update({
        where: { id: existing.id },
        data: { role: "admin", emailVerified: true },
      });
      console.log("✅ Super admin role updated:", email);
    } else {
      console.log("⏭️  Super admin already exists, skipping.");
    }
    adminId = existing.id;
  }

  await seedSuperAdminRole(adminId);

  await seedBrands(adminId);
  await seedCategories(adminId);
  await seedShipping(adminId);
  await clearAndSeedProducts(adminId);
  await seedContent(adminId);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
