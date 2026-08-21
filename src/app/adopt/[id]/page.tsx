"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams} from "next/navigation";
import { useUser } from "@/app/Context/UserContext";
import BlurryBlob from "@/components/background/blurry-blob"; 
import { LightRays } from "@/components/ui/light-rays"
interface Pet {
  price: any;
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  description: string;
  status: string;
  image_url?: string;
}

export default function AdoptPetPage() {
  const router = useRouter();
  const { user } = useUser();


const params = useParams();
const petId = params.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
 const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [formData, setFormData] = useState({
    contact_phone: "",
    payment_method: "Cash_on_Delivery",
    shipping_address: "",
    reason: "",
    experience: "",
  });

  // Wait for user context
  useEffect(() => {
    const t = setTimeout(() => setCheckingAuth(false), 300);
    return () => clearTimeout(t);
  }, []);

  // Auth + fetch
  useEffect(() => {
    if (checkingAuth) return;

    if (!user) {
      alert("Please login to adopt a pet");
      router.push("/auth?tab=login");
      return;
    }

    fetchPet();
  }, [checkingAuth, user]);

  const fetchPet = async () => {
    try {
      const res = await fetch(`/api/pets/${petId}`);

      if (!res.ok) throw new Error("Pet not found");

      const data = await res.json();
      setPet(data.pet);
    } catch (err) {
      console.error("Failed to fetch pet:", err);
      alert("Pet not found");
      router.push("/adoption");
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Login to proceed with adoption");

    const res = await fetch("/api/user/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pets: [{ id: Number(petId) }], // ✅ force number
        products: [],
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        contact_phone: formData.contact_phone.trim(),
        shipping_address: formData.shipping_address.trim(),
        payment_method: formData.payment_method.toLowerCase(),

        // // OPTIONAL but recommended (if backend supports it)
        // adoption_reason: formData.reason.trim(),
        // adoption_experience: formData.experience?.trim() || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("ORDER ERROR:", data);
      throw new Error(data.error || "Failed to create order");
    }

    alert("Adoption request submitted!");
    router.push("/dashboard");
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
        Loading...
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="min-h-screen pt-32 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Adopt {pet.name}
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pet Card */}
          <div className="bg-white/10 rounded-xl overflow-hidden">
            <div className="h-72 flex items-center justify-center bg-purple-600">
              {pet.image_url ? (
                <img
                  src={pet.image_url}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-7xl">🐾</span>
              )}
            </div>

            <div className="p-6 text-white space-y-2">
              <p><b>Breed:</b> {pet.breed}</p>
              <p><b>Age:</b> {pet.age}</p>
              <p><b>Gender:</b> {pet.gender}</p>
              <p className="text-gray-300 mt-2">{pet.description}</p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/10 rounded-xl p-6 space-y-4"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Order Details</h3>
          <div className="space-y-4 mb-6">
            <p>Please enter the following details correctly:</p>
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
              placeholder="Phone"
              className="w-full p-3 bg-white/10 text-white rounded"
              value={formData.contact_phone}
              onChange={(e) =>
                setFormData({ ...formData, contact_phone: e.target.value })
              }
            />
            
            <textarea
              required
              placeholder="Address"
              className="w-full p-3 bg-white/10 text-white rounded"
              value={formData.shipping_address}
              onChange={(e) =>
                setFormData({ ...formData, shipping_address: e.target.value })
              }
            />
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

            <button
              disabled={submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded"
            >
              {submitting ? "Submitting..." : `Submit Adoption Request (Price: ${pet.price} NPR)`}
            </button>
          </form>
        </div>
      </div>
            <LightRays />
    </div>
  );
}
