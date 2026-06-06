import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

function DoctorProfilePage() {
    const navigate = useNavigate();

    const userId = localStorage.getItem("oftalmika_user_id");

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        specialization: "",
        cabinetNumber: ""
    });

    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const updateField = (field, value) => {
        setForm({
            ...form,
            [field]: value
        });
    };

    const loadProfile = useCallback(async () => {
        try {
            const response = await api.get(`/api/doctor-profile/${userId}`);
            const doctor = response.data;

            setForm({
                firstName: doctor.firstName || "",
                lastName: doctor.lastName || "",
                specialization: doctor.specialization || "",
                cabinetNumber: doctor.cabinetNumber || ""
            });
        } catch {
            setMessage("Не вдалося завантажити профіль лікаря");
            setSuccess(false);
        }
    }, [userId]);

    const saveProfile = async (event) => {
        event.preventDefault();
        setMessage("");
        setSuccess(false);

        if (!form.firstName || !form.lastName || !form.specialization) {
            setMessage("Заповніть ім'я, прізвище та спеціалізацію");
            return;
        }

        try {
            const response = await api.put(`/api/doctor-profile/${userId}`, form);
            const doctor = response.data;
            const displayName = `${doctor.firstName} ${doctor.lastName}`;

            localStorage.setItem("oftalmika_display_name", displayName);

            setMessage("Профіль оновлено");
            setSuccess(true);
        } catch {
            setMessage("Не вдалося оновити профіль");
            setSuccess(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <h1>Oftalmika</h1>
                    <p>Профіль лікаря</p>
                </div>

                <button
                    className="secondary-button"
                    onClick={() => navigate("/doctor")}
                >
                    Назад
                </button>
            </header>

            <main className="dashboard-content">
                <section className="dashboard-card profile-card">
                    <h2>Редагування профілю</h2>
                    <p>
                        Тут можна змінити особисті та професійні дані лікаря.
                    </p>

                    <form onSubmit={saveProfile} className="form profile-form">
                        <div className="form-grid">
                            <div>
                                <label>Ім'я</label>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={(event) => updateField("firstName", event.target.value)}
                                />
                            </div>

                            <div>
                                <label>Прізвище</label>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(event) => updateField("lastName", event.target.value)}
                                />
                            </div>

                            <div>
                                <label>Спеціалізація</label>
                                <input
                                    type="text"
                                    value={form.specialization}
                                    onChange={(event) => updateField("specialization", event.target.value)}
                                />
                            </div>

                            <div>
                                <label>Номер кабінету</label>
                                <input
                                    type="text"
                                    value={form.cabinetNumber}
                                    onChange={(event) => updateField("cabinetNumber", event.target.value)}
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={success ? "success-message" : "error-message"}>
                                {message}
                            </div>
                        )}

                        <button type="submit" className="primary-button">
                            Зберегти зміни
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default DoctorProfilePage;
