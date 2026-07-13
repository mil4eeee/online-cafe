
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Price = {
    amount_mkd: number;
    option: string | null;
};

type MenuItem = {
    id: string;
    name: string;
    category: string;
    prices: Price[];
    temperature: string;
    caffeine: boolean;
    available: boolean;
    sweetness: string;
    allergens: string[];
    flavor_profile: string[];
    description: string;
};

const emptyForm: MenuItem = {
    id: "",
    name: "",
    category: "hot_drinks",
    prices: [{ amount_mkd: 0, option: null }],
    temperature: "hot",
    caffeine: false,
    available: true,
    sweetness: "none",
    allergens: [],
    flavor_profile: [],
    description: "",
};

function AdminPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [form, setForm] = useState<MenuItem>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);

    const loadItems = () => {
        fetch("http://localhost:8080/api/admin/menu")
            .then((res) => res.json())
            .then((data) => setItems(data))
            .catch(() => setItems([]));
    };

    useEffect(() => {
        loadItems();
    }, []);

    const updateForm = (field: keyof MenuItem, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const saveItem = async () => {
        const url = editingId
            ? `http://localhost:8080/api/admin/menu/${editingId}`
            : "http://localhost:8080/api/admin/menu";

        const method = editingId ? "PUT" : "POST";

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        resetForm();
        loadItems();
    };
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("isAdmin") !== "true") {
            navigate("/admin-login");
        }
    }, [navigate]);

    const editItem = (item: MenuItem) => {
        setForm({
            ...item,
            prices: item.prices?.length ? item.prices : [{ amount_mkd: 0, option: null }],
            allergens: item.allergens || [],
            flavor_profile: item.flavor_profile || [],
        });

        setEditingId(item.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteItem = async (id: string) => {
        await fetch(`http://localhost:8080/api/admin/menu/${id}`, {
            method: "DELETE",
        });

        loadItems();
    };

    const toggleAvailable = async (item: MenuItem) => {
        await fetch(`http://localhost:8080/api/admin/menu/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...item,
                available: !item.available,
            }),
        });

        loadItems();
    };

    return (
        <div className="admin-page">
            <nav className="navbar menu-navbar">
                <div className="brand">
                    <img src="/logo.png" alt="logo" className="logo-image" />
                    <span>Admin Dashboard</span>
                </div>

                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/menu">Menu</Link>
                    <Link to="/orders">Orders</Link>
                </div>
                <button
                    className="admin-logout-btn"
                    onClick={() => {
                        localStorage.removeItem("isAdmin");
                        navigate("/admin-login");
                    }}
                >
                    Logout
                </button>


            </nav>

            <div className="admin-container">
                <h1>Menu Admin</h1>

                <div className="admin-grid">
                    <div className="admin-form">
                        <h2>{editingId ? "Edit Menu Item" : "Add Menu Item"}</h2>

                        <input
                            placeholder="ID example: iced_latte"
                            value={form.id}
                            disabled={!!editingId}
                            onChange={(e) => updateForm("id", e.target.value)}
                        />

                        <input
                            placeholder="Name"
                            value={form.name}
                            onChange={(e) => updateForm("name", e.target.value)}
                        />

                        <select
                            value={form.category}
                            onChange={(e) => updateForm("category", e.target.value)}
                        >
                            <option value="hot_drinks">Hot Drinks</option>
                            <option value="cold_drinks">Cold Drinks</option>
                            <option value="soft_drinks">Soft Drinks</option>
                            <option value="smoothies">Smoothies</option>
                            <option value="alcoholic_drinks">Alcoholic Drinks</option>
                            <option value="cocktails">Cocktails</option>
                            <option value="beer">Beer</option>
                            <option value="wine">Wine</option>
                            <option value="whiskey">Whiskey</option>
                            <option value="food">Food</option>
                        </select>

                        <input
                            type="number"
                            placeholder="Price MKD"
                            value={form.prices[0]?.amount_mkd || 0}
                            onChange={(e) =>
                                updateForm("prices", [
                                    {
                                        ...form.prices[0],
                                        amount_mkd: Number(e.target.value),
                                    },
                                ])
                            }
                        />

                        <input
                            placeholder="Price option, optional"
                            value={form.prices[0]?.option || ""}
                            onChange={(e) =>
                                updateForm("prices", [
                                    {
                                        ...form.prices[0],
                                        option: e.target.value || null,
                                    },
                                ])
                            }
                        />

                        <select
                            value={form.temperature}
                            onChange={(e) => updateForm("temperature", e.target.value)}
                        >
                            <option value="hot">Hot</option>
                            <option value="cold">Cold</option>
                            <option value="room temperature">Room temperature</option>
                            <option value="warm">Warm</option>
                        </select>

                        <select
                            value={form.sweetness}
                            onChange={(e) => updateForm("sweetness", e.target.value)}
                        >
                            <option value="none">None</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>

                        <label className="admin-checkbox">
                            <input
                                type="checkbox"
                                checked={form.caffeine}
                                onChange={(e) => updateForm("caffeine", e.target.checked)}
                            />
                            Contains caffeine
                        </label>

                        <label className="admin-checkbox">
                            <input
                                type="checkbox"
                                checked={form.available}
                                onChange={(e) => updateForm("available", e.target.checked)}
                            />
                            Available
                        </label>

                        <input
                            placeholder="Allergens, comma separated"
                            value={form.allergens.join(", ")}
                            onChange={(e) =>
                                updateForm(
                                    "allergens",
                                    e.target.value
                                        .split(",")
                                        .map((x) => x.trim())
                                        .filter(Boolean)
                                )
                            }
                        />

                        <input
                            placeholder="Flavors, comma separated"
                            value={form.flavor_profile.join(", ")}
                            onChange={(e) =>
                                updateForm(
                                    "flavor_profile",
                                    e.target.value
                                        .split(",")
                                        .map((x) => x.trim())
                                        .filter(Boolean)
                                )
                            }
                        />

                        <textarea
                            placeholder="Description"
                            value={form.description}
                            onChange={(e) => updateForm("description", e.target.value)}
                        />

                        <button className="admin-save-btn" onClick={saveItem}>
                            {editingId ? "Save Changes" : "Add Item"}
                        </button>


                        {editingId && (
                            <button className="admin-cancel-btn" onClick={resetForm}>
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <div className="admin-list">
                        <h2>Current Menu Items</h2>

                        {items.map((item) => (
                            <div className="admin-item-card" key={item.id}>
                                <div>
                                    <h3>{item.name}</h3>
                                    <p>{item.category}</p>
                                    <p>{item.description}</p>
                                    <strong>
                                        {item.prices?.[0]?.amount_mkd || 0} MKD
                                    </strong>

                                    <p>
                                        Status:{" "}
                                        <b className={item.available ? "status-on" : "status-off"}>
                                            {item.available ? "Available" : "Unavailable"}
                                        </b>
                                    </p>
                                </div>

                                <div className="admin-card-actions">
                                    <button
                                        className="admin-edit-btn"
                                        onClick={() => editItem(item)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="admin-toggle-btn"
                                        onClick={() => toggleAvailable(item)}
                                    >
                                        {item.available ? "Mark Unavailable" : "Mark Available"}
                                    </button>

                                    <button
                                        className="admin-delete-btn"
                                        onClick={() => deleteItem(item.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPage;