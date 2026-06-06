import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

function DoctorRegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        specialization: "",
        cabinetNumber: ""
    });

    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const register = async (event) => {
        event.preventDefault();
        setMessage("");
        setSuccess(false);

        try {
            const response = await api.post("/api/web-auth/register-doctor", form);
            setMessage(response.data.message || "Заявку на реєстрацію надіслано адміністратору");
            setSuccess(true);

            setForm({
                username: "",
                password: "",
                firstName: "",
                lastName: "",
                specialization: "",
                cabinetNumber: ""
            });
        } catch (error) {
            if (error.response && error.response.data) {
                setMessage(error.response.data);
            } else {
                setMessage("Помилка підключення до сервера");
            }

            setSuccess(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="register-card">
                <div className="auth-logo-row">
                    <div className="auth-logo-mark">O</div>

                    <div>
                        <h1>Oftalmika</h1>
                        <p>Заявка на реєстрацію лікаря</p>
                    </div>
                </div>

                <div className="register-heading">
                    <h2>Реєстрація лікаря</h2>
                    <p>
                        Заповніть дані для створення заявки. Після перевірки адміністратор
                        підтвердить доступ до web-кабінету.
                    </p>
                </div>

                <form onSubmit={register} className="register-form">
                    <div className="register-section">
                        <h3>Дані для входу</h3>

                        <div className="form-grid two-columns">
                            <div className="form-field">
                                <label>Логін</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="Логін"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Пароль</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Пароль"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="register-section">
                        <h3>Професійна інформація</h3>

                        <div className="form-grid two-columns">
                            <div className="form-field">
                                <label>Ім’я</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    placeholder="Ім’я"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Прізвище</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    placeholder="Прізвище"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Спеціалізація</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={form.specialization}
                                    onChange={handleChange}
                                    placeholder="Спеціалізація"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Номер кабінету</label>
                                <input
                                    type="text"
                                    name="cabinetNumber"
                                    value={form.cabinetNumber}
                                    onChange={handleChange}
                                    placeholder="Номер кабінету"
                                />
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={success ? "success-message" : "error-message"}>
                            {message}
                        </div>
                    )}

                    <button type="submit" className="primary-button">
                        Надіслати заявку
                    </button>
                </form>

                <button
                    type="button"
                    className="back-link-button"
                    onClick={() => navigate("/login")}
                >
                    Повернутися до входу
                </button>
            </div>
        </div>
    );
}

export default DoctorRegisterPage;
