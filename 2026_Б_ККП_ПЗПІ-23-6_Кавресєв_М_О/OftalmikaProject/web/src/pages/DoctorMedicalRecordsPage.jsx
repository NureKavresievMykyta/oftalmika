import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

function DoctorMedicalRecordsPage() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("oftalmika_user_id");

    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    const loadRecords = useCallback(async () => {
        try {
            const response = await api.get(`/api/doctor-data/medical-records/${userId}`);
            setRecords(response.data);
            setFilteredRecords(response.data);
        } catch {
            setMessage("Не вдалося завантажити медичні записи");
        }
    }, [userId]);

    const filterRecords = (value) => {
        setSearch(value);

        const query = value.toLowerCase().trim();

        if (!query) {
            setFilteredRecords(records);
            return;
        }

        const result = records.filter((record) => {
            const data = `
                ${record.patientFirstName || ""}
                ${record.patientLastName || ""}
                ${record.patientPhone || ""}
                ${record.patientEmail || ""}
                ${record.diagnosis || ""}
                ${record.treatment || ""}
            `.toLowerCase();

            return data.includes(query);
        });

        setFilteredRecords(result);
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
        loadRecords();
    }, [loadRecords]);

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <h1>Oftalmika</h1>
                    <p>Медичні записи лікаря</p>
                </div>

                <button className="secondary-button" onClick={() => navigate("/doctor")}>
                    Назад
                </button>
            </header>

            <main className="dashboard-content">
                <section className="dashboard-card">
                    <div className="section-header">
                        <div>
                            <h2>Медичні записи</h2>
                            <p>Завершені прийоми, діагнози, лікування та IoT-дані пацієнтів.</p>
                        </div>

                        <button className="primary-small-button" onClick={loadRecords}>
                            Оновити
                        </button>
                    </div>

                    <div className="doctor-page-search">
                        <input
                            value={search}
                            onChange={(event) => filterRecords(event.target.value)}
                            placeholder="Пошук за пацієнтом, телефоном, email, діагнозом"
                        />
                    </div>

                    {message && <div className="error-message">{message}</div>}

                    {filteredRecords.length === 0 ? (
                        <div className="empty-state">
                            <h3>Медичних записів поки немає</h3>
                            <p>Після завершення прийомів вони з’являться тут.</p>
                        </div>
                    ) : (
                        <div className="doctor-records-list">
                            {filteredRecords.map((record) => (
                                <div className="doctor-record-card" key={record.visitId}>
                                    <div className="doctor-record-header">
                                        <div>
                                            <h3>{record.patientFirstName} {record.patientLastName}</h3>
                                            <p>{formatDateTime(record.startTime)}</p>
                                        </div>

                                        <div className={record.hasIot ? "iot-online" : "iot-offline"}>
                                            {record.hasIot ? "IoT-дані є" : "Без IoT"}
                                        </div>
                                    </div>

                                    <div className="details-grid">
                                        <div>
                                            <span>Діагноз</span>
                                            <strong>{safe(record.diagnosis)}</strong>
                                        </div>

                                        <div>
                                            <span>Лікування</span>
                                            <strong>{safe(record.treatment)}</strong>
                                        </div>

                                        <div>
                                            <span>Гострота зору</span>
                                            <strong>{safe(record.visualAcuity)}</strong>
                                        </div>

                                        <div>
                                            <span>Скарги</span>
                                            <strong>{safe(record.complaints)}</strong>
                                        </div>

                                        <div>
                                            <span>Анамнез</span>
                                            <strong>{safe(record.anamnesis)}</strong>
                                        </div>

                                        <div>
                                            <span>IoT-пристрій</span>
                                            <strong>{safe(record.deviceSerial)}</strong>
                                        </div>
                                    </div>

                                    <div className="doctor-record-actions">
                                        <button
                                            className="primary-small-button"
                                            onClick={() => navigate(`/doctor/completed-visit/${record.visitId}`)}
                                        >
                                            Переглянути деталі
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

export default DoctorMedicalRecordsPage;
