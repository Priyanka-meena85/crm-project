import { PrismaClient, ProductCategory, UserRole, PaymentMethod, UdhaarStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Priya Boutique CRM database...");

  const ownerHash = await bcrypt.hash("Priya@Boutique#2026", 12);
  const rajuHash = await bcrypt.hash("Raju@Staff#2026", 12);
  const poojaHash = await bcrypt.hash("Pooja@Staff#2026", 12);

  // 1. Seed Staff (Owner Priya, Staff Raju & Pooja)
  const priya = await prisma.staff.upsert({
    where: { email: "owner@priya.com" },
    update: {},
    create: {
      name: "Priya",
      phone: "9829012345",
      email: "owner@priya.com",
      passwordHash: ownerHash,
      role: UserRole.OWNER,
      target_monthly: 250000,
      commission_percent: 0,
      current_sale: 45000,
    },
  });

  const raju = await prisma.staff.upsert({
    where: { email: "raju@priya.com" },
    update: {},
    create: {
      name: "Raju",
      phone: "9829012346",
      email: "raju@priya.com",
      passwordHash: rajuHash,
      role: UserRole.STAFF,
      target_monthly: 100000,
      commission_percent: 2,
      current_sale: 28000,
    },
  });

  const pooja = await prisma.staff.upsert({
    where: { email: "pooja@priya.com" },
    update: {},
    create: {
      name: "Pooja",
      phone: "9829012347",
      email: "pooja@priya.com",
      passwordHash: poojaHash,
      role: UserRole.STAFF,
      target_monthly: 100000,
      commission_percent: 2,
      current_sale: 17000,
    },
  });

  // 2. Seed Customers
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const anjali = await prisma.customer.upsert({
    where: { phone: "9876543210" },
    update: {},
    create: {
      name: "Anjali Sharma",
      phone: "9876543210",
      city: "Nathdwara",
      birthday: tomorrow,
      size: "M",
      pasand: "Red & Maroon Bridal Wear, Banarasi Silk",
      total_kharida: 55000,
      last_visit: new Date(),
      is_vip: true,
      is_inactive: false,
    },
  });

  const sunita = await prisma.customer.upsert({
    where: { phone: "9876543211" },
    update: {},
    create: {
      name: "Sunita Devi",
      phone: "9876543211",
      city: "Nathdwara",
      size: "L",
      pasand: "Cotton Kurti, Pastel Suits",
      total_kharida: 52000,
      last_visit: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      is_vip: true,
      is_inactive: false,
    },
  });

  const ramesh = await prisma.customer.upsert({
    where: { phone: "9876543212" },
    update: {},
    create: {
      name: "Ramesh Kumar",
      phone: "9876543212",
      city: "Rajsamand",
      size: "XL",
      pasand: "Festive Kurta & Family Sarees",
      total_kharida: 18500,
      last_visit: sixMonthsAgo,
      is_vip: false,
      is_inactive: true,
    },
  });

  // 3. Seed Products & Stock
  const productsData = [
    {
      name: "Red Kurti",
      category: ProductCategory.Kurti,
      price: 1200,
      photo_url: "/products/red-kurti.png",
      stocks: [
        { size: "S", quantity: 5 },
        { size: "M", quantity: 1 },
        { size: "L", quantity: 3 },
        { size: "XL", quantity: 4 },
      ],
    },
    {
      name: "Red Lehenga",
      category: ProductCategory.Lehenga,
      price: 15000,
      photo_url: "/products/red-lehenga.png",
      stocks: [
        { size: "S", quantity: 2 },
        { size: "M", quantity: 3 },
        { size: "L", quantity: 1 },
      ],
    },
    {
      name: "Blue Saree",
      category: ProductCategory.Saree,
      price: 3500,
      photo_url: "/products/blue-saree.svg",
      stocks: [
        { size: "M", quantity: 6 },
        { size: "L", quantity: 4 },
      ],
    },
    {
      name: "Gold Anarkali Suit",
      category: ProductCategory.Suit,
      price: 4800,
      photo_url: "/products/gold-anarkali.png",
      stocks: [
        { size: "S", quantity: 3 },
        { size: "M", quantity: 1 },
        { size: "L", quantity: 5 },
      ],
    },
    {
      name: "Maroon Velvet Gown",
      category: ProductCategory.Gown,
      price: 8900,
      photo_url: "/products/maroon-gown.svg",
      stocks: [
        { size: "M", quantity: 2 },
        { size: "L", quantity: 2 },
      ],
    },
  ];

  const createdProducts = [];
  for (const item of productsData) {
    const existing = await prisma.product.findFirst({
      where: { name: item.name },
    });
    if (!existing) {
      const product = await prisma.product.create({
        data: {
          name: item.name,
          category: item.category,
          price: item.price,
          photo_url: item.photo_url,
          stocks: {
            create: item.stocks.map((s) => ({
              size: s.size,
              quantity: s.quantity,
              low_stock_threshold: 2,
            })),
          },
        },
      });
      createdProducts.push(product);
    } else {
      createdProducts.push(existing);
    }
  }

  // 4. Seed Initial Bill starting at 1024 (so next generated bill is 1025!)
  const existingBill = await prisma.bill.findUnique({
    where: { bill_no: 1024 },
  });
  if (!existingBill && createdProducts.length > 0) {
    await prisma.bill.create({
      data: {
        bill_no: 1024,
        customer_id: anjali.id,
        staff_id: raju.id,
        total: 15000,
        discount: 0,
        final_total: 15000,
        payment_method: PaymentMethod.UPI,
        status: "Paid",
        items: {
          create: [
            {
              product_id: createdProducts[1].id,
              size: "M",
              qty: 1,
              price: 15000,
            },
          ],
        },
      },
    });
  }

  // 5. Seed Udhaar
  const existingUdhaar = await prisma.udhaar.count();
  if (existingUdhaar === 0) {
    await prisma.udhaar.createMany({
      data: [
        {
          customer_id: ramesh.id,
          amount: 2000,
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: UdhaarStatus.Pending,
        },
        {
          customer_id: sunita.id,
          amount: 3500,
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: UdhaarStatus.Pending,
        },
      ],
    });
  }

  // 6. Seed Measurements
  const existingMeasurements = await prisma.measurement.count();
  if (existingMeasurements === 0) {
    await prisma.measurement.createMany({
      data: [
        {
          customer_id: anjali.id,
          blouse: "34",
          sleeve: "11",
          length: "14.5",
          waist: "28",
          shoulder: "14",
          status: "Sil Raha Hai",
          delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
        {
          customer_id: sunita.id,
          blouse: "38",
          sleeve: "9",
          length: "15",
          waist: "32",
          shoulder: "15",
          status: "Ready Hai",
          delivery_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  // 7. Seed Marketing Campaigns
  const existingCampaigns = await prisma.marketingCampaign.count();
  if (existingCampaigns === 0) {
    await prisma.marketingCampaign.create({
      data: {
        title: "Diwali Special Offer",
        template:
          "Namaste! Priya Boutique Nathdwara me Diwali New Stock aa gaya hai. VIP customers ke liye 20% OFF!",
        sent_to_count: 500,
      },
    });
  }

  console.log("Seed completed successfully!");
  console.log("Demo Owner:", priya.email, "/ 123456");
  console.log("Demo Staff:", raju.email, "/ 123456", "|", pooja.email, "/ 123456");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
