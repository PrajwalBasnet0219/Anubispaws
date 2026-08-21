"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/app/Context/UserContext";
import { useParams, useRouter } from "next/navigation";
import BlurryBlob from "@/components/background/blurry-blob"; // adjust path
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  weight: number;
  image_url?: string;
}

export default function BuyProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = typeof params.id === "string" ? params.id : undefined;

  const { user } = useUser();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    user_name:"",
    email:"",
    shipping_address: "",
    contact_phone: "",
    payment_method: "",
  });
useEffect(() => {
  if (!productId) return;

  setLoading(true);

  fetch(`/api/products/${productId}`)
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to product");
      }

      return data;
    })
    .then((data) => {
      setProduct(data.product);
    })
    .catch((err) => {
      console.error("FETCH ERROR:", err.message);
      setProduct(null);
    })
    .finally(() => setLoading(false));
}, [productId]);
  const handleBuy = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Login to proceed with purchase");

    const res = await fetch("/api/user/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pets: [],
        products: [{ id: productId, quantity }],
        customer_name: customerName,
        customer_email: customerEmail,
        contact_phone: formData.contact_phone,

      shipping_address: formData.shipping_address,
        payment_method: formData.payment_method.toLowerCase(),
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create order");

    alert("Product purchased!");
    router.push("/dashboard"); // redirect to dashboard to see the order
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Failed to submit request");
  } finally {
    setSubmitting(false);
  }
};
 



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="absolute -top-30 left-1/2 -translate-x-1/2 z-0">
                <BlurryBlob
                  className="animate-pop-blob"
                  firstBlobColor="bg-red-400"
                  secondBlobColor="bg-purple-400"
                />
              </div>
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <p className="text-white text-center mt-32">
        Product not found.
      </p>
    );
  }

  const total = product.price * quantity;
  const Weighttotal = product.weight * quantity;

  return (

    <div className="min-h-screen pt-32 px-4 pb-16">
      
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Purchase {product.name}
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Card */}
          <div className="bg-white/10 rounded-xl overflow-hidden">
            <div className="h-72 flex items-center justify-center bg-purple-600">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-7xl">🛍️</span>
              )}
            </div>

            <div className="p-6 text-white space-y-2">
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <p className="text-gray-300">{product.description}</p>
              <p>
                <b>Category:</b> {product.category}
              </p>
              <p>
                <b>Price:</b> NPR {product.price}
              </p>
              <p>
                <b>Weight(kg)</b> {product.weight}
              </p>
              <p>
                <b>Available Stock:</b> {product.stock}
              </p>
            </div>
          </div>

          {/* Order Form */}
          <form
            onSubmit={handleBuy}
            className="bg-white/10 rounded-xl p-6 space-y-4"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Order Details</h3>
              <p>Please enter the following details correctly:</p>
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-3 rounded bg-white/10 text-white border border-white/20"
              required
            />

            <input
              type="email"
              placeholder="Your email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full p-3 rounded bg-white/10 text-white border border-white/20"
              required
            />
          </div>
            <input
              required
              type="tel"
              placeholder="Contact Phone"
              className="w-full p-3 bg-white/10 text-white rounded border border-white/30"
              value={formData.contact_phone}
              onChange={(e) =>
                setFormData({ ...formData, contact_phone: e.target.value })
              }
            />

            <textarea
              required
              placeholder="Shipping Address"
              className="w-full p-3 bg-white/10 text-white rounded border border-white/30"
              rows={3}
              value={formData.shipping_address}
              onChange={(e) =>
                setFormData({ ...formData, shipping_address: e.target.value })
              }
            />

            <div>
              <label className="block text-white mb-2">Quantity</label>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-3 bg-white/10 text-white rounded border border-white/30"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) =>
                  setFormData({ ...formData, payment_method: e.target.value })
                }
                className="w-full p-3 bg-white/10 text-black rounded border border-white/30"
              >
                <option value="cash_on_delivery">Cash on Delivery</option>
                <option value="khalti">Khalti</option>
              </select>
            </div>
            <div className=" p-4 mt-6">
              <p className="text-white font-semibold text-lg">
                Total Weight: Kg {Weighttotal.toFixed(2)}
              </p>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mt-6">
              <p className="text-white font-semibold text-lg">
                Total Amount: NPR {total.toFixed(2)}
              </p>
            </div>


            <button
              type="submit"
              disabled={submitting || product.stock < quantity}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {submitting ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>
<div className="absolute -top-30 left-1/2 -translate-x-1/2 z-0">
        <BlurryBlob
          className="animate-pop-blob"
          firstBlobColor="bg-gray-400"
          secondBlobColor="bg-purple-400"
        />
      </div>
    </div>

  );
}
