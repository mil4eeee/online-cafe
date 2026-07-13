import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const login = () => {
        if (password === "admin123") {
            localStorage.setItem("isAdmin", "true");
            navigate("/admin");
        } else {
            setError("Wrong admin password.");
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <h1>Admin Login</h1>

                <input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") login();
                    }}
                />

                {error && <p>{error}</p>}

                <button onClick={login}>Login</button>
            </div>
        </div>
    );
}

export default AdminLoginPage;