import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.tsx";
import { useAuth } from "../context/AuthContext";

function CartPage() {
    const {
        cartItems,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartTotal,
    } = useCart();

    const { user, isLoggedIn } = useAuth();



    return (
        <div className="cart-page">
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
                        <Link to="/profile" className="profile-link">
                            {user?.name}
                        </Link>
                    ) : (
                        <Link to="/login" className="signin-btn">
                            Sign In
                        </Link>
                    )}


                </div>
            </nav>

            <div className="cart-container">
                <h1>Your Cart</h1>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty.</p>
                        <Link to="/menu" className="primary-btn">
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div className="cart-item" key={item.id}>
                                    <div>
                                        <h3>{item.name}</h3>
                                        <p>{item.price} MKD each</p>
                                    </div>

                                    <div className="cart-controls">
                                        <button onClick={() => decreaseQuantity(item.id)}>
                                            -
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button onClick={() => increaseQuantity(item.id)}>
                                            +
                                        </button>
                                    </div>

                                    <strong>{item.price * item.quantity} MKD</strong>

                                    <button
                                        className="remove-btn"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h2>Total: {cartTotal} MKD</h2>

                            <div>
                                <button className="clear-cart-btn" onClick={clearCart}>
                                    Clear Cart
                                </button>

                                <Link to="/checkout" className="checkout-btn">
                                    Checkout
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CartPage;