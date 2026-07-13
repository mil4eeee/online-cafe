import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import cartIcon from "../assets/cart.png";

const menuImages = import.meta.glob("../assets/menu/**/*.{png,jpg,jpeg,webp}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const normalize = (value: string) =>
    value
        .toLowerCase()
        .replace(/\.(png|jpg|jpeg|webp)$/g, "")
        .replace(/[^a-z0-9]+/g, "");

const getMenuImage = (itemName: string, category: string) => {
    const normalizedItemName = normalize(itemName);
    const normalizedCategory = normalize(category);

    const exactCategoryMatch = Object.entries(menuImages).find(([path]) => {
        const fileName = path.split("/").pop() || "";
        const folderPath = path.toLowerCase();

        return (
            normalize(fileName) === normalizedItemName &&
            normalize(folderPath).includes(normalizedCategory)
        );
    });

    if (exactCategoryMatch) return exactCategoryMatch[1];

    const exactNameMatch = Object.entries(menuImages).find(([path]) => {
        const fileName = path.split("/").pop() || "";
        return normalize(fileName) === normalizedItemName;
    });

    if (exactNameMatch) return exactNameMatch[1];

    return "";
};

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

type MenuResponse = {
    cafe_name: string;
    currency: string;
    version: string;
    menu_items: MenuItem[];
};

type CartAddItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

const categoryLabels: Record<string, string> = {
    hot_drinks: "Coffee & Hot Drinks",
    cold_drinks: "Iced & Cold Drinks",
    soft_drinks: "Soft Drinks",
    smoothies: "Smoothies",
    alcoholic_drinks: "Alcoholic Drinks",
    whiskey: "Whiskey",
    cocktails: "Cocktails",
    beer: "Beer",
    wine: "Wine",
    food: "Pastry & Food",
};

const categoryDescriptions: Record<string, string> = {
    hot_drinks: "Warm classics, espresso favorites, and cozy café drinks.",
    cold_drinks: "Refreshing iced coffees and chilled drinks.",
    soft_drinks: "Simple refreshing soft drinks.",
    smoothies: "Fruit-based blends made for a fresh sweet break.",
    alcoholic_drinks: "Selected alcoholic drinks for evening moments.",
    whiskey: "Smooth whiskey selections.",
    cocktails: "Refreshing cocktails with bright flavors.",
    beer: "Cold beer options.",
    wine: "Wine selections for a relaxed café evening.",
    food: "Desserts, croissants, snacks, and sweet bites.",
};

function MenuCard({
                      item,
                      addToCart,
                      decreaseQuantity,
                  }: {
    item: MenuItem;
    addToCart: (item: CartAddItem) => void;
    decreaseQuantity: (id: string) => void;
}) {
    const [selectedPrice, setSelectedPrice] = useState<Price>(
        item.prices?.[0] || { amount_mkd: 0, option: null }
    );

    const [quantity, setQuantity] = useState(0);

    const imageSrc = getMenuImage(item.name, item.category);

    const cartId = selectedPrice.option
        ? `${item.id}-${selectedPrice.option}`
        : item.id;

    const cartName = selectedPrice.option
        ? `${item.name} (${selectedPrice.option})`
        : item.name;

    const handleAdd = () => {
        addToCart({
            id: cartId,
            name: cartName,
            price: selectedPrice.amount_mkd,
            quantity: 1,
        });

        setQuantity((prev) => prev + 1);
    };

    const handleMinus = () => {
        decreaseQuantity(cartId);
        setQuantity((prev) => Math.max(prev - 1, 0));
    };

    return (
        <div className="menu-card">
            <div className="menu-card-image">
                {imageSrc && (
                    <img src={imageSrc} alt={item.name} className="menu-card-img" />
                )}

                <div className="menu-card-quantity-controls">
                    {quantity > 0 && (
                        <>
                            <button className="menu-card-minus" onClick={handleMinus}>
                                -
                            </button>

                            <span className="menu-card-quantity">{quantity}</span>
                        </>
                    )}

                    <button className="menu-card-plus" onClick={handleAdd}>
                        +
                    </button>
                </div>
            </div>

            <div className="menu-card-body">
                <div className="menu-card-title-row">
                    <h3>{item.name}</h3>
                    <strong>{selectedPrice.amount_mkd} MKD</strong>
                </div>

                <p>{item.description}</p>

                {item.prices.length > 1 && (
                    <div className="price-options">
                        {item.prices.map((price) => (
                            <button
                                key={`${item.id}-${price.option || price.amount_mkd}`}
                                className={
                                    selectedPrice.option === price.option
                                        ? "selected-price-option"
                                        : ""
                                }
                                onClick={() => setSelectedPrice(price)}
                            >
                                {price.option || "Regular"} — {price.amount_mkd} MKD
                            </button>
                        ))}
                    </div>
                )}

                <div className="menu-card-tags">
                    <span>
                        {item.temperature === "hot"
                            ? "Hot"
                            : item.temperature === "cold"
                                ? "Cold"
                                : "Room temp"}
                    </span>

                    <span>{item.caffeine ? "Caffeine" : "No caffeine"}</span>
                    <span>{item.sweetness} sweet</span>
                </div>

                {item.flavor_profile?.length > 0 && (
                    <div className="menu-flavors">
                        {item.flavor_profile.slice(0, 3).map((flavor) => (
                            <span key={flavor}>{flavor}</span>
                        ))}
                    </div>
                )}

                {item.allergens?.length > 0 && (
                    <p className="menu-allergen-note">
                        Contains: {item.allergens.join(", ")}
                    </p>
                )}

                <button className="menu-add-btn" onClick={handleAdd}>
                    Add to Cart
                </button>
            </div>
        </div>
    );
}

function MenuPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [noCaffeineOnly, setNoCaffeineOnly] = useState(false);
    const [allergenFreeOnly, setAllergenFreeOnly] = useState(false);
    const [coldOnly, setColdOnly] = useState(false);
    const [hotOnly, setHotOnly] = useState(false);
    const [sweetOnly, setSweetOnly] = useState(false);
    const [alcoholFreeOnly, setAlcoholFreeOnly] = useState(false);
    const [foodOnly, setFoodOnly] = useState(false);

    const [loading, setLoading] = useState(true);

    const { addToCart, decreaseQuantity, cartCount } = useCart();
    const { isLoggedIn, logout, user } = useAuth();

    useEffect(() => {
        fetch("http://localhost:8080/api/menu")
            .then((response) => response.json())
            .then((data: MenuResponse) => {
                setMenuItems(data.menu_items || []);
                setLoading(false);
            })
            .catch(() => {
                setMenuItems([]);
                setLoading(false);
            });
    }, []);

    const categories = useMemo(
        () => Array.from(new Set(menuItems.map((item) => item.category))),
        [menuItems]
    );

    const visibleCategories =
        activeCategory === "all" ? categories : [activeCategory];

    const clearFilters = () => {
        setNoCaffeineOnly(false);
        setAllergenFreeOnly(false);
        setColdOnly(false);
        setHotOnly(false);
        setSweetOnly(false);
        setAlcoholFreeOnly(false);
        setFoodOnly(false);
    };

    const itemMatchesFilters = (item: MenuItem) => {
        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !search ||
            item.name.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search) ||
            item.sweetness.toLowerCase().includes(search) ||
            item.flavor_profile.join(" ").toLowerCase().includes(search) ||
            item.allergens.join(" ").toLowerCase().includes(search);

        const matchesNoCaffeine = !noCaffeineOnly || item.caffeine === false;
        const matchesAllergenFree = !allergenFreeOnly || item.allergens.length === 0;
        const matchesCold = !coldOnly || item.temperature === "cold";
        const matchesHot = !hotOnly || item.temperature === "hot";

        const matchesSweet =
            !sweetOnly ||
            item.sweetness.toLowerCase() === "high" ||
            item.sweetness.toLowerCase() === "medium" ||
            item.flavor_profile.join(" ").toLowerCase().includes("sweet");

        const alcoholCategories = [
            "cocktails",
            "beer",
            "wine",
            "whiskey",
            "alcoholic_drinks",
        ];

        const matchesAlcoholFree =
            !alcoholFreeOnly || !alcoholCategories.includes(item.category);

        const matchesFood = !foodOnly || item.category === "food";

        return (
            matchesSearch &&
            matchesNoCaffeine &&
            matchesAllergenFree &&
            matchesCold &&
            matchesHot &&
            matchesSweet &&
            matchesAlcoholFree &&
            matchesFood
        );
    };

    return (
        <div className="menu-page">
            <nav className="navbar menu-navbar">
                <div className="brand">
                    <img src="/logo.png" alt="logo" className="logo-image" />
                    <span>My Grandparents House Cafe</span>
                </div>

                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/menu">Menu</Link>
                    <Link to="/about">About</Link>

                </div>

                <div className="nav-actions">
                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" className="profile-link">
                                {user?.name}
                            </Link>


                            <button className="logout-btn" onClick={logout}>
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="signin-btn">
                                Sign In
                            </Link>

                            <Link to="/register" className="register-btn">
                                Register
                            </Link>
                        </>
                    )}

                    <Link to="/cart" className="cart-icon-link">
                        <span className="cart-count-badge">{cartCount}</span>

                        <img
                            src={cartIcon}
                            alt="Cart"
                            className="cart-icon"
                        />
                    </Link>
                </div>
            </nav>

            <header className="menu-hero">
                <p className="menu-kicker">My Grandparents House Café</p>
                <h1>The Menu</h1>
                <p>
                    Everything is prepared with care — simple ingredients,
                    honest flavours, and a little bit of love.
                </p>
            </header>

            {loading && <p className="menu-loading">Loading menu...</p>}

            {!loading && (
                <>
                    <div className="menu-tabs">
                        <button
                            className={activeCategory === "all" ? "active-tab" : ""}
                            onClick={() => setActiveCategory("all")}
                        >
                            All Items
                        </button>

                        {categories.map((category) => (
                            <button
                                key={category}
                                className={activeCategory === category ? "active-tab" : ""}
                                onClick={() => setActiveCategory(category)}
                            >
                                {categoryLabels[category] || category.replace("_", " ")}
                            </button>
                        ))}
                    </div>

                    <div className="menu-search-wrapper">
                        <input
                            type="text"
                            placeholder="Search coffee, smoothies, desserts, allergens..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="menu-search-input"
                        />
                    </div>

                    <div className="menu-filter-row">
                        <button
                            className={noCaffeineOnly ? "filter-active" : ""}
                            onClick={() => setNoCaffeineOnly(!noCaffeineOnly)}
                        >
                            No Caffeine
                        </button>

                        <button
                            className={allergenFreeOnly ? "filter-active" : ""}
                            onClick={() => setAllergenFreeOnly(!allergenFreeOnly)}
                        >
                            Allergen Free
                        </button>

                        <button
                            className={coldOnly ? "filter-active" : ""}
                            onClick={() => {
                                setColdOnly(!coldOnly);
                                if (!coldOnly) setHotOnly(false);
                            }}
                        >
                            Cold Only
                        </button>

                        <button
                            className={hotOnly ? "filter-active" : ""}
                            onClick={() => {
                                setHotOnly(!hotOnly);
                                if (!hotOnly) setColdOnly(false);
                            }}
                        >
                            Hot Only
                        </button>

                        <button
                            className={sweetOnly ? "filter-active" : ""}
                            onClick={() => setSweetOnly(!sweetOnly)}
                        >
                            Sweet
                        </button>

                        <button
                            className={alcoholFreeOnly ? "filter-active" : ""}
                            onClick={() => setAlcoholFreeOnly(!alcoholFreeOnly)}
                        >
                            Alcohol Free
                        </button>

                        <button
                            className={foodOnly ? "filter-active" : ""}
                            onClick={() => setFoodOnly(!foodOnly)}
                        >
                            Food Only
                        </button>

                        <button onClick={clearFilters}>Clear Filters</button>
                    </div>

                    <main className="menu-content">
                        {visibleCategories.map((category) => {
                            const items = menuItems.filter(
                                (item) =>
                                    item.available &&
                                    item.category === category &&
                                    itemMatchesFilters(item)
                            );

                            if (items.length === 0) return null;

                            return (
                                <section className="menu-category-section" key={category}>
                                    <div className="menu-section-header">
                                        <div>
                                            <h2>
                                                {categoryLabels[category] ||
                                                    category.replace("_", " ")}
                                            </h2>

                                            <p>
                                                {categoryDescriptions[category] ||
                                                    "Freshly prepared café favorites."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="menu-card-grid">
                                        {items.map((item) => (
                                            <MenuCard
                                                key={item.id}
                                                item={item}
                                                addToCart={addToCart}
                                                decreaseQuantity={decreaseQuantity}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </main>
                </>
            )}
        </div>
    );
}

export default MenuPage;