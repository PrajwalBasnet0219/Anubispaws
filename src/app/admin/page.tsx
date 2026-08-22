"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LightRays } from "@/components/ui/light-rays"
import BlurryBlob from "@/components/background/blurry-blob"; 



export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<
  "users" | "pets" | "products" | "orders">("users");


  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth?tab=login");
        return;
      }

      try {
        const res = await fetch("/api/user/verify-admin", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          alert("Access denied: Admins only");
          router.push("/");
          return;
        }

        setIsAdmin(true);
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center to-gray-900">
        <div className="absolute -top-30 left-1/2 -translate-x-1/2 z-0">
                <BlurryBlob
                  className="animate-pop-blob"
                  firstBlobColor="bg-red-400"
                  secondBlobColor="bg-purple-400"
                />
              </div>
        <div className="text-white text-2xl">Loading Admin Panel...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen via-purple-900 to-gray-900 pt-32 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Manage your pet care platform</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {[
            { id: "users", label: "Users", icon: "👥" },
            { id: "pets", label: "Pet Adoptions", icon: "🐾" },
            { id: "products", label: "Products", icon: "🛍️" },
            { id: "orders", label: "Orders", icon: "📦" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-purple-900"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
          {activeTab === "users" && <UsersManager />}
          {activeTab === "pets" && <PetsManager />}
          {activeTab === "products" && <ProductsManager />}
          {activeTab === "orders" && <OrdersManager />}
        </div>
      </div>

      <LightRays />
    </div>
  );
}

// ==================== USERS MANAGER ====================
function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("User deleted successfully");
        fetchUsers();
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) return <div className="text-white text-center">Loading users...</div>;

  if (users.length === 0) {
    return <div className="text-white text-center">No users found</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Users Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Verified</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-3">{user.id}</td>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-purple-500/30 rounded text-sm">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.isVerified ? "✅" : "❌"}
                </td>
                <td className="px-4 py-3">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== PETS MANAGER ====================
function PetsManager() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: "",
    gender: "male",
    description: "",
    status: "available",
    image_url: "",
    price: "", // ✅ FIX
  });


  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/pets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPets(data.pets || []);
    } catch (err) {
      console.error("Failed to fetch pets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/pets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          species: formData.species,
          breed: formData.breed,
          age: parseInt(formData.age), // ✅ Convert to number
          gender: formData.gender,
          description: formData.description,
          status: formData.status,
          image_url: formData.image_url,
          price: parseInt(formData.price), // ✅ Include image_url
        }),
      });

      if (res.ok) {
        alert("Pet added successfully!");
        setShowAddForm(false);
        setFormData({
          name: "",
          species: "dog",
          breed: "",
          age: "1",
          gender: "male",
          description: "",
          status: "available",
          image_url: "",
          price: "", // ✅ FIX
        });

        fetchPets();
      } else {
        const errorData = await res.json();
        alert("Failed to add pet: " + (errorData.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Add error:", err);
      alert("Error adding pet");
    }
  };
const startEdit = (pet: any) => {
  setEditingPetId(pet.id);
  setEditForm({ ...pet });
};

const cancelEdit = () => {
  setEditingPetId(null);
  setEditForm({});
};

const savePet = async (id: number) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/pets/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: editForm.name,
        species: editForm.species,
        breed: editForm.breed,
        age: Number(editForm.age),
        gender: editForm.gender,
        status: editForm.status,
        price: Number(editForm.price),
        image_url: editForm.image_url,
        description: editForm.description,
      }),
    });

    if (res.ok) {
      alert("Pet updated successfully");
      setEditingPetId(null);
      fetchPets();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to update pet");
    }
  } catch (err) {
    console.error(err);
    alert("Update failed");
  }
};

  const deletePet = async (id: number) => {
    if (!confirm("Are you sure you want to delete this pet listing?")) return;

    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch(`/api/admin/pets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });


      if (res.ok) {
        alert("Pet listing deleted successfully");
        fetchPets();
      } else {
        const error = await res.json();
        console.error("Delete error:", error);
        alert("Failed to delete pet listing: " + (error.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting pet");
    }
  };

  if (loading) return <div className="text-white text-center">Loading pets...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">
          Pet Adoptions Management
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
        >
          {showAddForm ? "Cancel" : "+ Add New Pet"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 p-6 rounded-lg mb-6"
        >
          {/* Image Preview */}
          {formData.image_url && (
            <div className="mb-4 flex justify-center">
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Pet Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="p-3 rounded bg-white/10 text-white border border-white/20"
              required
            />

            <select
              value={formData.species}
              onChange={(e) =>
                setFormData({ ...formData, species: e.target.value })
              }
              className="p-3 rounded text-black border border-white/20"
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="bird">Bird</option>
              <option value="rabbit">Rabbit</option>
              <option value="hamster">Hamster</option>
              <option value="other">Other</option>
            </select>

            <input
              type="text"
              placeholder="Breed"
              value={formData.breed}
              onChange={(e) =>
                setFormData({ ...formData, breed: e.target.value })
              }
              className="p-3 rounded bg-white/10 text-white border border-white/20"
              required
            />

            <input
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              className="p-3 rounded bg-white/10 text-white border border-white/20"
              min="0"
              required
            />
            <input
              type="number"
              placeholder="Adoption Price (NPR)"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="p-3 rounded bg-white/10 text-white border border-white/20"
              min="1"
              required
            />

            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="p-3 rounded  text-black border border-white/20"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="p-3 rounded bg-white/10 text-white border border-white/20"
            >
              <option value="available">Available</option>
              <option value="adopted">Adopted</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Image URL Input */}
          <input
            type="url"
            placeholder="Image URL (e.g., https://example.com/dog.jpg)"
            value={formData.image_url}
            onChange={(e) =>
              setFormData({ ...formData, image_url: e.target.value })
            }
            className="w-full p-3 rounded bg-white/10 text-white border border-white/20 mt-4"
          />
          <p className="text-gray-400 text-sm mt-1">
            💡 Tip: Upload your image to{" "}
            <a
              href="https://imgur.com"
              target="_blank"
              className="text-blue-400 underline"
            >
              Imgur
            </a>{" "}
            or use a direct image URL
          </p>

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-3 rounded bg-white/10 text-white border border-white/20 mt-4"
            rows={3}
          />

          <button
            type="submit"
            className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            Add Pet
          </button>
        </form>
      )}

      {/* Pets Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Species</th>
              <th className="px-4 py-3 text-left">Breed</th>
              <th className="px-4 py-3 text-left">Age</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pets.map((pet) => (
              <tr
                key={pet.id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="px-4 py-3">
                  {pet.image_url ? (
                    <img
                      src={pet.image_url}
                      alt={pet.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                      🐾
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">{pet.id}</td>
                <td className="px-4 py-3">
                  {editingPetId === pet.id ? (
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="bg-black/40 border px-2 py-1 rounded"
                    />
                  ) : (
                    pet.name
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingPetId === pet.id ? (
                    <input
                      value={editForm.species}
                      onChange={(e) =>
                        setEditForm({ ...editForm, species: e.target.value })
                      }
                      className="bg-black/40 border px-2 py-1 rounded"
                    />
                  ) : (
                    pet.species
                  )}
                </td>

                <td className="px-4 py-3">
                  {editingPetId === pet.id ? (
                    <input
                      value={editForm.breed}
                      onChange={(e) =>
                        setEditForm({ ...editForm, breed: e.target.value })
                      }
                      className="bg-black/40 border px-2 py-1 rounded"
                    />
                  ) : (
                    pet.breed
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingPetId === pet.id ? (
                    <input
                      value={editForm.age}
                      onChange={(e) =>
                        setEditForm({ ...editForm, age: e.target.value })
                      }
                      className="bg-black/40 border px-2 py-1 rounded"
                    />
                  ) : (
                    pet.age
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingPetId === pet.id ? (
                    <input
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: e.target.value })
                      }
                      className="bg-black/40 border px-2 py-1 rounded"
                    />
                  ) : (
                    pet.price
                  )}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      pet.status === "available"
                        ? "bg-green-500/30"
                        : "bg-yellow-500/30"
                    }`}
                  >
                    {pet.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {editingPetId === pet.id ? (
                    <>
                      <button
                        onClick={() => savePet(pet.id)}
                        className="px-3 py-2 bg-green-500 rounded-lg mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-2 bg-gray-500 rounded-lg"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(pet)}
                        className="px-3 py-2 bg-blue-500 rounded-lg mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletePet(pet.id)}
                        className="px-3 py-2 bg-red-500 rounded-lg"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ==================== PRODUCTS MANAGER ====================
function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "food",
    stock: "",
    image_url: "",
    weight: "", 
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          stock: parseInt(formData.stock),
          image_url: formData.image_url,
          weight: parseFloat(formData.weight),
        }),
      });

      if (res.ok) {
        
        alert("Product added successfully!");
        setShowAddForm(false);
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "food",
          stock: "",
          image_url: "",
          weight: "", 
        });
        fetchProducts();
      } else {
        const errorData = await res.json();
        alert("Failed to add product: " + (errorData.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Add error:", err);
      alert("Error adding product");
    }
  };
const startEdit = (product: any) => {
  setEditingId(product.id);
  setEditData({
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    weight: product.weight,
  });
};

const cancelEdit = () => {
  setEditingId(null);
  setEditData({});
};

const saveEdit = async (id: number) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editData),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to update product");
      return;
    }

    alert("Product updated successfully");
    setEditingId(null);
    fetchProducts();
  } catch (err) {
    console.error("Update error:", err);
    alert("Error updating product");
  }
};

  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Product deleted successfully");
        fetchProducts();
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) return <div className="text-white text-center">Loading products...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Products Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
        >
          {showAddForm ? "Cancel" : "+ Add New Product"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 p-6 rounded-lg mb-6"
        >
          {/* Image Preview */}
          {formData.image_url && (
            <div className="mb-4 flex justify-center">
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="p-3 rounded bg-white/10 text-white border border-white/20"
              required
            />

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="p-3 rounded bg-white/10 text-black border border-white/20"
            >
              <option value="food">Food</option>
              <option value="toys">Toys</option>
              <option value="accessories">Accessories</option>
              <option value="medicine">Medicine</option>
              <option value="grooming">Grooming</option>
            </select>

            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="p-3 rounded bg-white/10 text-white border border-white/20"
              step="0.01"
              min="0"
              required
            />

            <input
              type="number"
              placeholder="Stock"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              className="p-3 rounded bg-white/10 text-white border border-white/20"
              min="0"
              required
            />
          </div>
          <input
            type="number"
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={(e) =>
              setFormData({ ...formData, weight: e.target.value })
            }
            className="p-3 mt-4 rounded bg-white/10 text-white border border-white/20"
            step="0.01"
            min="0"
            required
          />

          {/* Image URL Input */}
          <input
            type="url"
            placeholder="Image URL (e.g., https://example.com/product.jpg)"
            value={formData.image_url}
            onChange={(e) =>
              setFormData({ ...formData, image_url: e.target.value })
            }
            className="w-full p-3 rounded bg-white/10 text-white border border-white/20 mt-4"
          />
          <p className="text-gray-400 text-sm mt-1">
            💡 Tip: Upload your image to{" "}
            <a
              href="https://imgur.com"
              target="_blank"
              className="text-blue-400 underline"
            >
              Imgur
            </a>{" "}
            or use a direct image URL
          </p>

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-3 rounded bg-white/10 text-white border border-white/20 mt-4"
            rows={3}
          />

          <button
            type="submit"
            className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            Add Product
          </button>
        </form>
      )}

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Weight</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="px-4 py-3">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                      🛍️
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">{product.id}</td>
                <td className="px-4 py-3">
                  {editingId === product.id ? (
                    <input
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="p-2 scale-90 rounded bg-white/10 text-white border border-white/20"
                    />
                  ) : (
                    product.name
                  )}
                </td>


                <td className="px-4 py-3">
                  {editingId === product.id ? (
                    <input
                      value={editData.category}
                      onChange={(e) =>
                        setEditData({ ...editData, category: e.target.value })
                      }
                      className="p-2 scale-90 rounded bg-white/10 text-white border border-white/20"
                    />
                  ) : (
                    product.category
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === product.id ? (
                    <input
                      value={editData.price}
                      onChange={(e) =>
                        setEditData({ ...editData, price: e.target.value })
                      }
                      className="p-2 scale-90 rounded bg-white/10 text-white border border-white/20"
                    />
                  ) : (
                    product.price
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === product.id ? (
                    <input
                      value={editData.stock}
                      onChange={(e) =>
                        setEditData({ ...editData, stock: e.target.value })
                      }
                      className="p-2 scale-90 rounded bg-white/10 text-white border border-white/20"
                    />
                  ) : (
                    product.stock
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === product.id ? (
                    <input
                      value={editData.weight}
                      onChange={(e) =>
                        setEditData({ ...editData, weight: e.target.value })
                      }
                      className="p-1 scale-90 rounded bg-white/10 text-white border border-white/20"
                    />
                  ) : (
                    product.weight
                  )}
                </td>
                <td className="px-2 py-2 text-center space-x-2">
                  {editingId === product.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(product.id)}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(product)}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== ORDERS MANAGER (Enhanced) ====================
function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appliedEmail, setAppliedEmail] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
const [statusFilter, setStatusFilter] = useState<
  "all" | "pending" | "processing" | "completed" | "cancelled"
>("all");



  useEffect(() => {
    fetchOrders();
  }, []);
  const applyFilters = () => {
  setAppliedEmail(searchEmail);
  setAppliedFromDate(fromDate);
  setAppliedToDate(toDate);
};

const resetFilters = () => {
  setSearchEmail("");
  setFromDate("");
  setToDate("");

  setAppliedEmail("");
  setAppliedFromDate("");
  setAppliedToDate("");
};
const filteredOrders = orders.filter((order) => {
  const emailActive = appliedEmail.trim() !== "";
  const fromActive = appliedFromDate !== "";
  const toActive = appliedToDate !== "";
  
  
  // Email match
    const emailMatch =
      !emailActive ||
      order.customer_email
        ?.toLowerCase()
        .includes(appliedEmail.toLowerCase());

  // Order date (YYYY-MM-DD)
  const orderDate = new Date(order.created_at)
    .toISOString()
    .slice(0, 10);

  const fromMatch = !fromActive || orderDate >= appliedFromDate;
  const toMatch = !toActive || orderDate <= appliedToDate;
 const statusMatch =
    statusFilter === "all" || order.status === statusFilter;

  // ✅ ALL conditions must pass
  return emailMatch && fromMatch && toMatch && statusMatch;
});


  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveOrder = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Order approved successfully");
        fetchOrders();
        setEditingOrder(null);
      } else {
        alert("Failed to approve order: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Approve error:", err);
      alert("Error approving order");
    }
  };
const setOrderPending = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "pending" }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Order set to pending successfully");
        fetchOrders();
        setEditingOrder(null);
      } else {
        alert("Failed to set order to pending: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Set pending error:", err);
      alert("Error setting order to pending");
    }
  };
  const deleteOrder = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        alert("Order deleted successfully");
        fetchOrders();
        setEditingOrder(null);
      } else {
        alert("Failed to delete order: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting order");
    }
  };

  if (loading) return <div className="text-white text-center">Loading orders...</div>;
  if (!orders.length) return <div className="text-white text-center">No orders found</div>;



  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Orders Management</h2>
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        
  {/* Email */}
  <div>
    <label className="block text-sm text-gray-300 mb-1">User Email</label>
    <input
      type="text"
      placeholder="example@gmail.com"
      value={searchEmail}
      onChange={(e) => setSearchEmail(e.target.value)}
      className="px-4 py-2 rounded-lg bg-white/10 text-white"
    />
  </div>

  {/* Date */}
  {/* From Date */}
  <div>
  <label className="block text-sm text-gray-300 mb-1">From Date</label>
  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    className="px-4 py-2 rounded-lg bg-white/10 text-white"
  />
  </div>

  {/* To Date */}
  <div>
  <label className="block text-sm text-gray-300 mb-1">To Date</label>
  <input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    className="px-4 py-2 rounded-lg bg-white/10 text-white"
  />
  </div>

  {/* Search */}
  <button
    onClick={applyFilters}
    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
  >
    Search
  </button>

  {/* Reset */}
  <button
    onClick={resetFilters}
    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-white"
  >
    Reset
  </button>
   <div>
    <label className="block text-sm text-gray-300 mb-1">Order Status</label>
   
  <select
  
    value={statusFilter}
    onChange={(e) =>
      setStatusFilter(e.target.value as typeof statusFilter)
    }
    className="px-4 py-2 rounded-lg  text-black border border-white/20"
  >
    <option value="all">All</option>
    <option value="pending">Pending</option>
    <option value="processing">Processing</option>
    <option value="completed">Completed</option>
    <option value="cancelled">Cancelled</option>
  </select>
  </div>
</div>


      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">User_ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Customer email</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-2 text-left">Payment_method</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
<tbody>
  {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="px-4 py-3">#{order.id}</td>
                <td className="px-4 py-3">{order.user_id}</td>
                <td className="px-4 py-3">{order.customer_name}</td>
                <td className="px-4 py-3">{order.customer_email || "Unknown"}</td>
                <td className="px-4 py-3">{order.contact_phone}</td>
                <td className="px-4 py-3 capitalize">{order.payment_method}</td>
                <td className="px-4 py-3 font-semibold">
                  NPR {order.total_amount}
                </td>
                <td className="px-4 py-3 capitalize">{order.status}</td>
                <td className="px-4 py-3">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center relative">
                  <button
                    onClick={() =>
                      setEditingOrder(
                        editingOrder === order.id ? null : order.id,
                      )
                    }
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
                  >
                    Edit
                  </button>

                  {editingOrder === order.id && (
                    <div className="absolute right-0 mt-2 bg-gray-900 border border-white/20 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => approveOrder(order.id)}
                        className="block w-full text-left px-4 py-2 hover:bg-white/10"
                      >
                        ✅ Approve (Completed)
                      </button>

                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/20"
                      >
                        🗑 Delete
                      </button>

                      {order.status !== "pending" && (
                        <button
                          onClick={() => setOrderPending(order.id)}
                          className="block w-full text-left px-4 py-2 text-yellow-400 hover:bg-white/10"
                        >
                          ⏳ Set Pending
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
