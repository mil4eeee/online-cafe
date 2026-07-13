import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type OrderItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

type Order = {
    id: number;
    name: string;
    phone: string;
    pickupTime: string;
    notes: string;
    items: OrderItem[];
    total: number;
    createdAt: string;
};

function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
        setOrders(savedOrders.reverse());
    }, []);

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
                    <Link to="/cart">Cart</Link>
                    <Link to="/orders">Orders</Link>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem("orders");
                        setOrders([]);
                        alert("Order history cleared");
                    }}
                >
                    Clear Order History
                </button>
            </nav>

            <div className="orders-container">
                <h1>Order History</h1>

                {orders.length === 0 ? (
                    <div className="empty-cart">
                        <p>No orders yet.</p>
                        <Link to="/menu" className="primary-btn">
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div className="order-card" key={order.id}>
                                <div className="order-card-header">
                                    <div>
                                        <h2>Order #{order.id}</h2>
                                        <p>{order.createdAt}</p>
                                    </div>

                                    <strong>{order.total} MKD</strong>
                                </div>

                                <div className="order-customer">
                                    <p><strong>Name:</strong> {order.name}</p>
                                    <p><strong>Phone:</strong> {order.phone}</p>
                                    <p><strong>Pickup:</strong> {order.pickupTime || "Not specified"}</p>
                                    {order.notes && (
                                        <p><strong>Notes:</strong> {order.notes}</p>
                                    )}
                                </div>

                                <div className="order-items">
                                    {order.items.map((item) => (
                                        <div className="order-item" key={item.id}>
                                            <span>
                                                {item.quantity}x {item.name}
                                            </span>

                                            <strong>{item.price * item.quantity} MKD</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrdersPage;