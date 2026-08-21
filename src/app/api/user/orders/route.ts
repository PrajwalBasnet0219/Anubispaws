import { NextRequest, NextResponse } from "next/server";
import pool from "@/db/db";
import { parseToken } from "@/lib/auth";

// Safe JSON parse utility
function safeJsonParse(value: any, defaultValue: any = []) {
  try {
    if (!value) return defaultValue;
    if (typeof value !== "string") return defaultValue;
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const decoded = parseToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Get all orders for user
 // Inside GET /api/user/orders
const [orders]: any = await pool.execute(
  "SELECT * FROM orders WHERE user_id=? ORDER BY id DESC",
  [decoded.id]
);

// Enrich orders
const detailedOrders = await Promise.all(
  orders.map(async (order: any) => {
    const petItems = typeof order.order_pets === "string" ? JSON.parse(order.order_pets) : order.order_pets;
    const productItems = typeof order.order_products === "string" ? JSON.parse(order.order_products) : order.order_products;

    let pets: [] = [];
    let products: [] = [];
    let payment: any = null;

    // Fetch pets details
    if (petItems.length > 0) {
      const ids = petItems.map((p: any) => Number(p.id));
      const [rows]: any = await pool.execute(
        `SELECT id, name, species, breed, age, gender, status, price, image_url
         FROM pets WHERE id IN (${ids.map(() => "?").join(",")})`,
        ids
      );

      pets = rows.map((p: any) => ({
        id: Number(p.id),
        name: p.name,
        species: p.species,
        breed: p.breed,
        age: p.age,
        gender: p.gender,
        status: p.status,
        price: Number(p.price),
        image_url: p.image_url,
      }));
    }

    // Fetch products details
    if (productItems.length > 0) {
      const ids = productItems.map((p: any) => Number(p.id));
      const [rows]: any = await pool.execute(
        `SELECT id, name, price, image_url, weight
         FROM products WHERE id IN (${ids.map(() => "?").join(",")})`,
        ids
      );

      products = rows.map((p: any) => {
        const item = productItems.find((i: any) => Number(i.id) === Number(p.id));
        return {
          id: Number(p.id),
          name: p.name,
          price: Number(p.price),
          quantity: Number(item?.quantity ?? 1),
          image_url: p.image_url,
          weight: Number(p.weight)
        };
      });
    }
      /* ───── PAYMENT (IMPORTANT PART) ───── */
        const [paymentRows]: any = await pool.execute(
          `
          SELECT
            payment_method,
            payment_status,
            khalti_transaction_id,
            khalti_pidx
          FROM payments
          WHERE order_id = ?
          ORDER BY created_at DESC
          LIMIT 1
          `,
          [order.id]
        );

        payment = paymentRows?.[0] || null;
    

    return {
      ...order,
      order_pets: pets,
      order_products: products,
       khalti_transaction_id: payment?.khalti_transaction_id ?? null,
    };
  })
);

return NextResponse.json({ orders: detailedOrders });

  } catch (err) {
    console.error("GET orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}




export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const decoded = parseToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();

    const {
      pets = [],
      products = [],
      shipping_address,
      payment_method,
      contact_phone,
      customer_name: customerName,
      customer_email: customerEmail,
    } = body;

    // 🔒 VALIDATION
// ───────── Name ─────────
if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
  return NextResponse.json(
    { error: "Customer name is required" },
    { status: 400 }
  );
}

// ───────── Email ─────────
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (
  !customerEmail ||
  typeof customerEmail !== "string" ||
  !emailRegex.test(customerEmail)
) {
  return NextResponse.json(
    { error: "Valid email address is required" },
    { status: 400 }
  );
}

// ───────── Phone ─────────
const phoneRegex = /^[0-9]{7,15}$/; // works for Nepal + intl
if (
  !contact_phone ||
  typeof contact_phone !== "string" ||
  !phoneRegex.test(contact_phone)
) {
  return NextResponse.json(
    { error: "Valid contact phone number is required" },
    { status: 400 }
  );
}

// ───────── Shipping Address ─────────
if (!shipping_address || shipping_address.trim().length < 5) {
  return NextResponse.json(
    { error: "Shipping address is required" },
    { status: 400 }
  );
}


    if (pets.length === 0 && products.length === 0) {
      return NextResponse.json({ error: "No items to order" }, { status: 400 });
    }

    let totalAmount = 0;
    const petsPayload: any[] = [];
    const productsPayload: any[] = [];

    // 🐾 PETS
    for (const pet of pets) {
      const [rows]: any = await pool.execute(
        "SELECT price, status FROM pets WHERE id=?",
        [pet.id]
      );

      if (!rows.length)
        return NextResponse.json({ error: "Pet not found" }, { status: 404 });

      if (rows[0].status !== "available")
        return NextResponse.json({ error: "Pet not available" }, { status: 400 });

      totalAmount += Number(rows[0].price);

      await pool.execute(
        "UPDATE pets SET status='pending', owner_id=? WHERE id=?",
        [decoded.id, pet.id]
      );

      petsPayload.push({ id: pet.id });
    }

    // 📦 PRODUCTS
    for (const product of products) {
      const [rows]: any = await pool.execute(
        "SELECT price, stock FROM products WHERE id=?",
        [product.id]
      );

      if (!rows.length)
        return NextResponse.json({ error: "Product not found" }, { status: 404 });

      if (rows[0].stock < product.quantity)
        return NextResponse.json({ error: "Not enough stock" }, { status: 400 });

      totalAmount += Number(rows[0].price) * product.quantity;

      await pool.execute(
        "UPDATE products SET stock = stock - ? WHERE id=?",
        [product.quantity, product.id]
      );

      productsPayload.push({ id: product.id, quantity: product.quantity });
    }

    // ✅ CORRECT INSERT (ORDER MATCHES VALUES)
    const [result]: any = await pool.execute(
      `
      INSERT INTO orders
      (
        user_id,
        order_pets,
        order_products,
        total_amount,
        status,
        shipping_address,
        payment_method,
        customer_name,
        customer_email,
        contact_phone
      )
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)
      `,
      [
        decoded.id,
        JSON.stringify(petsPayload),
        JSON.stringify(productsPayload),
        totalAmount,
        shipping_address || null,
        payment_method || null,
        customerName.trim(),
        customerEmail.trim(),
        contact_phone.trim(),
      ]
    );

    return NextResponse.json({
      message: "Order created",
      orderId: result.insertId,
    });
  } 


catch (err: any) {
    console.error("CREATE ORDER ERROR:", err);

    return NextResponse.json(
      {
        error: err.message || "Internal server error",
      },
      { status: 500 }
    );
  }

}