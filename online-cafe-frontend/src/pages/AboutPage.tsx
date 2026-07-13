import { Link } from "react-router-dom";
import cartIcon from "../assets/cart.png";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const galleryImages = import.meta.glob("../assets/gallery/*.{png,jpg,jpeg,webp}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

const galleryImageList = Object.values(galleryImages);

function AboutPage() {
    const { cartCount } = useCart();
    const { isLoggedIn, logout, user } = useAuth();

    return (
        <div className="about-page">
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


                            <button
                                className="logout-btn"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="signin-btn"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="register-btn"
                            >
                                Register
                            </Link>
                        </>
                    )}

                    <Link
                        to="/cart"
                        className="cart-icon-link"
                    >
                        <span className="cart-count-badge">
                            {cartCount}
                        </span>

                        <img
                            src={cartIcon}
                            alt="cart"
                            className="cart-icon"
                        />
                    </Link>
                </div>
            </nav>

            <section className="about-hero">
                <p className="menu-kicker">
                    My Grandparents House
                </p>

                <h1>
                    A House Full of Memories
                </h1>

                <p>
                    Built on generations of warmth,
                    hospitality and shared moments.
                </p>
            </section>

            <section className="about-content-section">
                <div className="about-text">
                    <h2>
                        Our Story
                    </h2>

                    <p>
                        My Grandparents House Cafe is a family-owned
                        cafe built on generations of memories,
                        warmth, and hospitality.
                    </p>

                    <p>
                        What started as a beloved family home
                        has become a place where people can
                        slow down, connect, and feel at home.
                    </p>

                    <p>
                        The house originally belonged to my
                        mother's grandmother, which is where
                        the name My Grandparents House comes from.
                    </p>

                    <p>
                        For our family, it has always been a place
                        filled with stories, laughter, and shared
                        moments around the table.
                    </p>

                    <p>
                        Today, our family works together to continue
                        that tradition. From our parents and brother
                        to our close friends Gabi and Teodor,
                        every person contributes to creating
                        the welcoming atmosphere that makes
                        this place special.
                    </p>

                    <p>
                        Our goal is simple: to offer great coffee,
                        delicious food, and an experience that feels
                        genuine, personal, and memorable for every guest.
                    </p>
                </div>

                <div className="about-gallery-box">
                    {galleryImageList.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Cafe gallery ${index + 1}`}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default AboutPage;