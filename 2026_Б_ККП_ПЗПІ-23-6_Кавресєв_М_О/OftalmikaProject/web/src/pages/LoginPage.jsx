import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const login = async (event) => {
        event.preventDefault();
        setMessage("");

        try {
            const response = await api.post("/api/web-auth/login", form);
            const user = response.data;

            localStorage.clear();

            localStorage.setItem("oftalmika_user_id", user.userId);
            localStorage.setItem("oftalmika_username", user.username);
            localStorage.setItem("oftalmika_role", user.role);
            localStorage.setItem("oftalmika_display_name", user.displayName);

            if (user.role === "ADMIN") {
                navigate("/admin");
                return;
            }

            if (user.role === "DOCTOR") {
                navigate("/doctor");
                return;
            }

            setMessage("Для цього користувача web-кабінет недоступний");
        } catch (error) {
            if (error.response && error.response.data) {
                setMessage(error.response.data);
            } else {
                setMessage("Помилка підключення до сервера");
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo-row">
                    <div className="auth-logo-mark">O</div>

                    <div>
                        <h1>Oftalmika</h1>
                        <p>Web-кабінет медичного центру</p>
                    </div>
                </div>

                <h2>Вхід у систему</h2>

                <form onSubmit={login} className="auth-form">
                    <label>Логін</label>
                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Введіть логін"
                        required
                    />

                    <label>Пароль</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Введіть пароль"
                        required
                    />

                    {message && <div className="error-message">{message}</div>}

                    <button type="submit" className="primary-button">
                        Увійти
                    </button>
                </form>

                <div className="auth-bottom-row">
                    <span>Ви лікар клініки?</span>

                    <button
                        type="button"
                        className="link-button"
                        onClick={() => navigate("/doctor-register")}
                    >
                        Подати заявку на реєстрацію
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
