import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import cartIcon from "../assets/cart.png";

type OrderItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

type Order = {
    id: string;
    customerName?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    items: OrderItem[];
    total: number;
    createdAt?: string;
};

function ProfilePage() {
    const { user, isLoggedIn, logout } = useAuth();
    const { cartCount } = useCart();

    const orders: Order[] = JSON.parse(localStorage.getItem("orders") || "[]");

    const userOrders = orders.filter((order) => {
        if (!user?.email) return false;
        return order.email === user.email;
    });

    return (
        <div className="profile-page">
            <nav className="navbar menu-navbar">
                <div className="brand">
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
                        <img src={cartIcon} alt="Cart" className="cart-icon" />
                    </Link>
                </div>
            </nav>

            <section className="profile-hero">
                <h1>My Profile</h1>
                <p>Your account details and order history.</p>
            </section>

            {!isLoggedIn ? (
                <div className="profile-card">
                    <h2>You are not logged in</h2>
                    <p>Please sign in to see your profile.</p>
                    <Link to="/login" className="primary-btn">
                        Sign In
                    </Link>
                </div>
            ) : (
                <main className="profile-container">
                    <section className="profile-card">
                        <h2>Account Information</h2>

                        <div className="profile-info-row">
                            <strong>Name</strong>
                            <span>{user?.name}</span>
                        </div>

                        <div className="profile-info-row">
                            <strong>Email</strong>
                            <span>{user?.email}</span>
                        </div>
                    </section>

                    <section className="profile-card">
                        <h2>Order History</h2>

                        {userOrders.length === 0 ? (
                            <p className="profile-empty">
                                You do not have any orders yet.
                            </p>
                        ) : (
                            <div className="profile-orders">
                                {userOrders.map((order) => (
                                    <div className="profile-order-card" key={order.id}>
                                        <div className="profile-order-header">
                                            <div>
                                                <h3>Order #{order.id}</h3>
                                                <p>{order.createdAt || "Date not available"}</p>
                                            </div>

                                            <strong>{order.total} MKD</strong>
                                        </div>

                                        <div className="profile-order-items">
                                            {order.items.map((item) => (
                                                <div
                                                    className="profile-order-item"
                                                    key={`${order.id}-${item.id}`}
                                                >
                                                    <span>
                                                        {item.quantity}x {item.name}
                                                    </span>

                                                    <strong>
                                                        {item.price * item.quantity} MKD
                                                    </strong>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            )}
        </div>
    );
}

export default ProfilePage;