import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.tsx";
import { useAuth } from "../context/AuthContext";
import cartIcon from "../assets/cart.png";

function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user, isLoggedIn,  } = useAuth();

    const totalItems = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    const [notes, setNotes] = useState("");
    const [orderPlaced, setOrderPlaced] = useState(false);

    const placeOrder = () => {
        const order = {
            id: Date.now().toString(),
            name,
            customerName: name,
            email,
            phone,
            pickupTime,
            notes,
            items: cartItems,
            total: cartTotal,
            createdAt: new Date().toLocaleString(),
        };

        const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
        localStorage.setItem("orders", JSON.stringify([...savedOrders, order]));

        clearCart();
        setOrderPlaced(true);
    };

    const Navbar = () => (
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
                {isLoggedIn && (
                    <>
                        <Link to="/profile" className="profile-link">
                            {user?.name}
                        </Link>




                    </>
                )}

                <Link to="/cart" className="cart-icon-link">
                    <span className="cart-count-badge">
                        {totalItems}
                    </span>

                    <img
                        src={cartIcon}
                        alt="cart"
                        className="cart-icon"
                    />
                </Link>
            </div>
        </nav>
    );

    if (orderPlaced) {
        return (
            <div className="cart-page">
                <Navbar />

                <div className="checkout-container">
                    <div className="order-success">
                        <h1>Order Placed</h1>

                        <p>Thank you! Your order has been saved successfully.</p>

                        <Link to="/profile" className="primary-btn">
                            View Order History
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <Navbar />

            <div className="checkout-container">
                <h1>Checkout</h1>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty.</p>

                        <Link to="/menu" className="primary-btn">
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div className="checkout-grid">
                        <div className="checkout-form">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />

                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                            />

                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Phone number"
                            />

                            <input
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                placeholder="Pickup time"
                            />

                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Special notes"
                            />

                            <button
                                className="checkout-btn"
                                onClick={placeOrder}
                                disabled={!name || !email || !phone}
                            >
                                Place Order
                            </button>
                        </div>

                        <div className="checkout-summary-box">
                            <h2>Order Summary</h2>

                            {cartItems.map((item) => (
                                <div className="checkout-summary-item" key={item.id}>
                                    <span>
                                        {item.quantity}x {item.name}
                                    </span>

                                    <strong>
                                        {item.price * item.quantity} MKD
                                    </strong>
                                </div>
                            ))}

                            <div className="checkout-total">
                                <span>Total</span>
                                <strong>{cartTotal} MKD</strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CheckoutPage;