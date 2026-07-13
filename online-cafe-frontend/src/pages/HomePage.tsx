import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import cartIcon from "../assets/cart.png";
import coffeeImage from "../assets/coffee.png";
import cafeImage from "../assets/gallery/IMG_0649.jpeg";

const galleryImages = import.meta.glob("../assets/gallery/*.{png,jpg,jpeg,webp}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const galleryImageList = Object.values(galleryImages);

const menuImages = import.meta.glob("../assets/menu/**/*.{png,jpg,jpeg,webp}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const normalizeText = (value: string) =>
    value
        .toLowerCase()
        .replace(/\.(png|jpg|jpeg|webp)$/g, "")
        .replace(/[^a-z0-9]+/g, "");

const getMenuImage = (itemName: string) => {
    const normalizedItemName = normalizeText(itemName);

    const match = Object.entries(menuImages).find(([path]) => {
        const fileName = path.split("/").pop() || "";
        return normalizeText(fileName) === normalizedItemName;
    });

    return match ? match[1] : "";
};

type ChatItem = {
    id: string;
    name: string;
    price: string;
    image: string;
};

type Message = {
    sender: "user" | "bot";
    text: string;
    items?: ChatItem[];
};

type Price = {
    amount_mkd: number;
    option: string | null;
};

type MenuItem = {
    id: string;
    name: string;
    prices: Price[];
};

function HomePage() {
    const [chatOpen, setChatOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    const { addToCart, cartCount } = useCart();
    const { isLoggedIn, logout, user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([
        {
            sender: "bot",
            text:
                "Hi! Welcome to My Grandparents House Cafe.\n\n" +
                "Try asking:\n" +
                "• Recommend a sweet dessert\n" +
                "• I want something without caffeine\n" +
                "• Suggest a refreshing cocktail\n" +
                "• Add 2 Espresso to my cart",
            items: [],
        },
    ]);

    useEffect(() => {
        fetch("http://localhost:8080/api/menu")
            .then((response) => response.json())
            .then((data) => {
                setMenuItems(data.menu_items || []);
            })
            .catch(() => {
                setMenuItems([]);
            });
    }, []);

    const extractQuantity = (message: string) => {
        const match = message.match(/\d+/);
        return match ? Number(match[0]) : 1;
    };

    const extractRequestedItemText = (message: string) => {
        return message
            .toLowerCase()
            .replace(/\badd\b/g, "")
            .replace(/\bto\b/g, "")
            .replace(/\bmy\b/g, "")
            .replace(/\bthe\b/g, "")
            .replace(/\bcart\b/g, "")
            .replace(/\d+/g, "")
            .trim();
    };

    const findMenuItemFromMessage = (message: string) => {
        const normalizedMessage = normalizeText(message);
        const requestedText = extractRequestedItemText(message);
        const normalizedRequestedText = normalizeText(requestedText);

        const sortedItems = [...menuItems].sort(
            (a, b) => a.name.length - b.name.length
        );

        let item = sortedItems.find(
            (menuItem) => normalizeText(menuItem.name) === normalizedRequestedText
        );

        if (item) return item;

        item = sortedItems.find(
            (menuItem) => normalizeText(menuItem.id) === normalizedRequestedText
        );

        if (item) return item;

        item = sortedItems.find((menuItem) =>
            normalizedMessage.includes(normalizeText(menuItem.name))
        );

        if (item) return item;

        item = sortedItems.find((menuItem) =>
            normalizedMessage.includes(normalizeText(menuItem.id))
        );

        if (item) return item;

        item = sortedItems.find((menuItem) =>
            normalizeText(menuItem.name).includes(normalizedRequestedText)
        );

        if (item) return item;

        return null;
    };

    const tryAddToCartFromMessage = (message: string) => {
        const lowerMessage = message.toLowerCase();

        if (!lowerMessage.includes("add") || !lowerMessage.includes("cart")) {
            return false;
        }

        if (menuItems.length === 0) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "Menu is still loading. Please try again in a second.",
                    items: [],
                },
            ]);

            return true;
        }

        const item = findMenuItemFromMessage(message);
        const quantity = extractQuantity(message);

        if (!item) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text:
                        "I couldn't find that item in the menu. Try writing the item name like Espresso, Latte, Mojito, or Croissant.",
                    items: [],
                },
            ]);

            return true;
        }

        const selectedPrice = item.prices?.[0];

        if (!selectedPrice) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: `${item.name} does not have a price available.`,
                    items: [],
                },
            ]);

            return true;
        }

        for (let i = 0; i < quantity; i++) {
            addToCart({
                id: item.id,
                name: item.name,
                price: selectedPrice.amount_mkd,
                quantity: 1,
            });
        }

        setMessages((prev) => [
            ...prev,
            {
                sender: "bot",
                text: `Added to your cart: ${quantity}x ${item.name}.`,
                items: [
                    {
                        id: item.id,
                        name: item.name,
                        price: `${selectedPrice.amount_mkd} MKD`,
                        image: "",
                    },
                ],
            },
        ]);

        return true;
    };

    const sendMessage = async (customMessage?: string) => {
        const messageToSend = customMessage || input;

        if (!messageToSend.trim()) return;

        setMessages((prev) => [
            ...prev,
            { sender: "user", text: messageToSend, items: [] },
        ]);

        setInput("");
        setLoading(true);

        const handledCartAction = tryAddToCartFromMessage(messageToSend);

        if (handledCartAction) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: messageToSend,
                }),
            });

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: data.reply,
                    items: data.items || [],
                },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "Backend is not responding.",
                    items: [],
                },
            ]);
        }

        setLoading(false);
    };

    return (
        <div className="app">
            <header className="hero-section">
                <nav className="navbar">
                    <div className="brand">
                        <img src="/logo.png" alt="logo" className="logo-image" />
                        <span>My Grandparents House Cafe</span>
                    </div>

                    <div className="nav-links">
                        <Link to="/menu">Menu</Link>
                        <Link to="/about">About</Link>

                        <a href="#gallery">Gallery</a>
                        <a href="#locations">Locations</a>
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
                            <img src={cartIcon} alt="Cart" className="cart-icon" />
                        </Link>
                    </div>
                </nav>

                <div className="hero-content">
                    <div className="hero-text-block">
                        <h1>
                            Take a peek and,
                            <br />
                            get yourself something to drink!
                        </h1>

                        <p>
                            Indulge in handcrafted coffee, fresh drinks,
                            sweet desserts, and a welcoming atmosphere
                            designed to inspire and unwind.
                        </p>

                        <div className="hero-actions">
                            <Link to="/menu" className="primary-btn">
                                View Menu
                            </Link>

                            <a href="#locations" className="secondary-btn">
                                Find Location
                            </a>
                        </div>
                    </div>

                    <div className="hero-image-placeholder">
                        <img src="/logo.png" alt="Coffee Cup Header Logo" />
                    </div>
                </div>
            </header>

            <main>
                <section id="menu" className="dark-section split-section">
                    <div className="image-placeholder">
                        <img
                            src={coffeeImage}
                            alt="Coffee"
                            className="section-image"
                        />
                    </div>

                    <div className="section-text">
                        <p className="eyebrow">Freshly prepared</p>

                        <h2>Handmade Just For You</h2>

                        <p>
                            Explore our carefully prepared menu with hot drinks,
                            iced coffees, smoothies, cocktails, desserts, wines,
                            beers, and food options.
                        </p>

                        <button
                            className="outline-btn"
                            onClick={() => setChatOpen(true)}
                        >
                            Ask our assistant →
                        </button>
                    </div>
                </section>

                <section id="about" className="dark-section split-section reverse">
                    <div className="section-text">
                        <p className="eyebrow">Our story</p>

                        <h2>Made For Coffee Lovers</h2>

                        <p>
                            A cozy digital cafe experience where guests can
                            explore the menu, check allergens, and receive drink
                            recommendations through a smart assistant.
                        </p>

                        <Link to="/about" className="outline-btn">
                            Our Story →
                        </Link>
                    </div>

                    <div className="image-placeholder">
                        <img
                            src={cafeImage}
                            alt="Cafe Interior"
                            className="section-image"
                        />
                    </div>
                </section>

                <section className="social-strip">
                    <div>
                        <strong>Facebook</strong>
                        <p>
                            <a
                                href="https://www.facebook.com/search/top?q=apartments%20my%20grandparents%20house"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link"
                            >
                                @MyGrandparentsHouse
                            </a>
                        </p>
                    </div>

                    <div>
                        <strong>Instagram</strong>
                        <p>
                            <a
                                href="https://www.instagram.com/mygrandparentshousecafe/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link"
                            >
                                @mygrandparentshousecafe
                            </a>
                        </p>
                    </div>
                </section>

                <section id="gallery" className="gallery-scroll-section">
                    <div className="gallery-scroll">
                        {galleryImageList.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Gallery ${index + 1}`}
                            />
                        ))}
                    </div>
                </section>

                <section id="locations" className="locations-section">
                    <h2>Location</h2>

                    <div className="locations-grid">
                        <div>
                            <h3>Ohrid</h3>
                            <p>Old Town</p>
                            <p>Open daily: 08:00 - 23:00</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div>
                    <div className="brand footer-brand">
                        <img src="/logo.png" alt="logo" className="logo-image" />
                        <span>My Grandparents House Cafe</span>
                    </div>

                    <p>Brewed to perfection, served with love.</p>
                </div>

                <div className="newsletter">
                    <p>Join our newsletter for updates and offers.</p>

                    <div>
                        <input placeholder="Enter your email" />
                        <button>Subscribe</button>
                    </div>
                </div>
            </footer>

            <button
                className="chat-floating-button"
                onClick={() => setChatOpen(!chatOpen)}
            >
                💬
            </button>

            {chatOpen && (
                <div className="chat-popup">
                    <div className="chat-header">
                        <div>
                            <strong>Cafe Assistant</strong>
                            <p>Ask about menu, allergens, drinks, or cart</p>
                        </div>

                        <button onClick={() => setChatOpen(false)}>×</button>
                    </div>

                    <div className="quick-buttons">
                        <button onClick={() => sendMessage("What coffee drinks do you have?")}>
                             Coffee
                        </button>

                        <button onClick={() => sendMessage("Recommend a cocktail")}>
                             Cocktails
                        </button>

                        <button onClick={() => sendMessage("What desserts do you have?")}>
                             Desserts
                        </button>

                        <button
                            onClick={() =>
                                sendMessage("What options are vegan or allergen friendly?")
                            }
                        >
                             Dietary
                        </button>
                    </div>

                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <div>{msg.text}</div>

                                {msg.items && msg.items.length > 0 && (
                                    <div className="chat-item-list">
                                        {msg.items.map((item) => {
                                            const imageSrc = getMenuImage(item.name);

                                            return (
                                                <div className="chat-item-card" key={item.id}>
                                                    {imageSrc && (
                                                        <img src={imageSrc} alt={item.name} />
                                                    )}

                                                    <div>
                                                        <strong>{item.name}</strong>
                                                        <p>{item.price}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && <div className="message bot">Typing...</div>}
                    </div>

                    <div className="input-row">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                            placeholder="Ask something..."
                        />

                        <button onClick={() => sendMessage()}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;