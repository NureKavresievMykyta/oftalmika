import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

function DoctorPrescriptionsPage() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("oftalmika_user_id");

    const [prescriptions, setPrescriptions] = useState([]);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    const loadPrescriptions = useCallback(async () => {
        try {
            const response = await api.get(`/api/doctor-data/prescriptions/${userId}`);
            setPrescriptions(response.data);
            setFilteredPrescriptions(response.data);
        } catch {
            setMessage("Не вдалося завантажити рецепти");
        }
    }, [userId]);

    const filterPrescriptions = (value) => {
        setSearch(value);

        const query = value.toLowerCase().trim();

        if (!query) {
            setFilteredPrescriptions(prescriptions);
            return;
        }

        const result = prescriptions.filter((prescription) => {
            const data = `
                ${prescription.patientFirstName || ""}
                ${prescription.patientLastName || ""}
                ${prescription.patientPhone || ""}
                ${prescription.patientEmail || ""}
                ${prescription.prescriptionType || ""}
            `.toLowerCase();

            return data.includes(query);
        });

        setFilteredPrescriptions(result);
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "не вказано";
        }

        return String(value).replace("T", " ");
    };

    const safe = (value) => {
        if (value === null || value === undefined || value === "") {
            return "Не вказано";
        }

        return value;
    };

    useEffect(() => {
        loadPrescriptions();
    }, [loadPrescriptions]);

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <h1>Oftalmika</h1>
                    <p>Рецепти пацієнтів</p>
                </div>

                <button className="secondary-button" onClick={() => navigate("/doctor")}>
                    Назад
                </button>
            </header>

            <main className="dashboard-content">
                <section className="dashboard-card">
                    <div className="section-header">
                        <div>
                            <h2>Рецепти</h2>
                            <p>Рецепти, сформовані після IoT-обстежень і завершених прийомів.</p>
                        </div>

                        <button className="primary-small-button" onClick={loadPrescriptions}>
                            Оновити
                        </button>
                    </div>

                    <div className="doctor-page-search">
                        <input
                            value={search}
                            onChange={(event) => filterPrescriptions(event.target.value)}
                            placeholder="Пошук за пацієнтом, телефоном, email"
                        />
                    </div>

                    {message && <div className="error-message">{message}</div>}

                    {filteredPrescriptions.length === 0 ? (
                        <div className="empty-state">
                            <h3>Рецептів поки немає</h3>
                            <p>Рецепти з’являться після завершення прийомів з IoT-обстеженням.</p>
                        </div>
                    ) : (
                        <div className="doctor-records-list">
                            {filteredPrescriptions.map((prescription) => (
                                <div className="doctor-record-card" key={prescription.prescriptionId}>
                                    <div className="doctor-record-header">
                                        <div>
                                            <h3>{prescription.patientFirstName} {prescription.patientLastName}</h3>
                                            <p>Оновлено: {formatDateTime(prescription.updatedAt || prescription.createdAt)}</p>
                                        </div>

                                        <div className="tag-blue">
                                            Рецепт
                                        </div>
                                    </div>

                                    <div className="details-grid">
                                        <div>
                                            <span>Тип рецепта</span>
                                            <strong>{safe(prescription.prescriptionType)}</strong>
                                        </div>

                                        <div>
                                            <span>Дата прийому</span>
                                            <strong>{formatDateTime(prescription.startTime)}</strong>
                                        </div>

                                        <div>
                                            <span>Праве око OD</span>
                                            <strong>
                                                SPH {safe(prescription.sphOd)}, CYL {safe(prescription.cylOd)}, AXIS {safe(prescription.axisOd)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Ліве око OS</span>
                                            <strong>
                                                SPH {safe(prescription.sphOs)}, CYL {safe(prescription.cylOs)}, AXIS {safe(prescription.axisOs)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>PD</span>
                                            <strong>{safe(prescription.pd)}</strong>
                                        </div>

                                        <div>
                                            <span>Контакти пацієнта</span>
                                            <strong>{safe(prescription.patientPhone)} · {safe(prescription.patientEmail)}</strong>
                                        </div>
                                    </div>

                                    <div className="doctor-record-actions">
                                        <button
                                            className="primary-small-button"
                                            onClick={() => navigate(`/doctor/completed-visit/${prescription.visitId}`)}
                                        >
                                            Переглянути прийом
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default DoctorPrescriptionsPage;
