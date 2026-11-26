import { NextResponse } from "next/server";
import { ProductCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadProductPhoto } from "@/lib/cloudinary";
import { demoStore } from "@/lib/demo-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || "";

  try {
    const products = await prisma.product.findMany({
      where: search
        ? { name: { contains: search, mode: "insensitive" } }
        : undefined,
      include: { stocks: { orderBy: { size: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch {
    const q = search.toLowerCase();
    const products = demoStore.products.filter(
      (p) => !q || p.name.toLowerCase().includes(q)
    );
    return NextResponse.json({ products });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, price, photo_url, size, quantity } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Product naam aur price zaroori hai." },
        { status: 400 }
      );
    }

    const uploaded = await uploadProductPhoto(photo_url || "");

    try {
      const product = await prisma.product.create({
        data: {
          name: String(name).trim(),
          category: (category as ProductCategory) || ProductCategory.Kurti,
          price: Number(price),
          photo_url: uploaded.url,
          stocks: {
            create: [
              {
                size: size || "M",
                quantity: Number(quantity ?? 5),
                low_stock_threshold: 2,
              },
            ],
          },
        },
        include: { stocks: true },
      });
      return NextResponse.json({ product }, { status: 201 });
    } catch {
      const product = {
        id: `prod-${Date.now()}`,
        name: String(name).trim(),
        category: String(category || "Kurti"),
        price: Number(price),
        photo_url: uploaded.url,
        stocks: [
          {
            id: `st-${Date.now()}`,
            size: size || "M",
            quantity: Number(quantity ?? 5),
            low_stock_threshold: 2,
          },
        ],
      };
      demoStore.products.unshift(product);
      return NextResponse.json({ product }, { status: 201 });
    }
  } catch {
    return NextResponse.json(
      { error: "Product add nahi ho paya." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { product_id, size, addQuantity, price } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: "product_id zaroori hai." },
        { status: 400 }
      );
    }

    try {
      if (price !== undefined) {
        const updatedProduct = await prisma.product.update({
          where: { id: product_id },
          data: { price: Number(price) },
        });
        if (!size || !addQuantity) {
          return NextResponse.json({ product: updatedProduct });
        }
      }

      if (!size || !addQuantity) {
        return NextResponse.json(
          { error: "size aur addQuantity zaroori hai." },
          { status: 400 }
        );
      }

      const stock = await prisma.stock.upsert({
        where: { product_id_size: { product_id, size } },
        update: { quantity: { increment: Number(addQuantity) } },
        create: {
          product_id,
          size,
          quantity: Number(addQuantity),
          low_stock_threshold: 2,
        },
      });
      return NextResponse.json({ stock });
    } catch {
      const prod = demoStore.products.find((p) => p.id === product_id);
      if (prod) {
        if (price !== undefined) {
          prod.price = Number(price);
        }
        if (size && addQuantity) {
          const st = prod.stocks.find((s) => s.size === size);
          if (st) {
            st.quantity += Number(addQuantity);
          } else {
            prod.stocks.push({
              id: `st-${Date.now()}`,
              size,
              quantity: Number(addQuantity),
              low_stock_threshold: 2,
            });
          }
        }
      }
      return NextResponse.json({ ok: true });
    }
  } catch {
    return NextResponse.json(
      { error: "Stock update nahi ho paya." },
      { status: 500 }
    );
  }
}
