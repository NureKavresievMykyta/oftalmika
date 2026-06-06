import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api.js";

function DoctorCompletedVisitPage() {
    const navigate = useNavigate();
    const { visitId } = useParams();

    const [data, setData] = useState(null);
    const [message, setMessage] = useState("");

    const loadDetails = useCallback(async () => {
        try {
            const response = await api.get(`/api/doctor-appointments/completed-visit/${visitId}`);
            setData(response.data);
        } catch {
            setMessage("Не вдалося завантажити результати завершеного прийому");
        }
    }, [visitId]);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]);

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

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <h1>Oftalmika</h1>
                    <p>Результати завершеного прийому</p>
                </div>

                <button className="secondary-button" onClick={() => navigate("/doctor")}>
                    Назад
                </button>
            </header>

            <main className="dashboard-content">
                {message && <div className="error-message">{message}</div>}

                {!data ? (
                    <section className="dashboard-card">
                        <h2>Завантаження</h2>
                        <p>Зачекайте, будь ласка.</p>
                    </section>
                ) : (
                    <>
                        <section className="dashboard-card">
                            <h2>
                                Пацієнт: {data.patient.firstName} {data.patient.lastName}
                            </h2>

                            <div className="patient-info-grid visit-summary-grid">
                                <div>
                                    <span>Дата народження</span>
                                    <strong>{safe(data.patient.birthDate)}</strong>
                                </div>

                                <div>
                                    <span>Телефон</span>
                                    <strong>{safe(data.patient.phone)}</strong>
                                </div>

                                <div>
                                    <span>Email</span>
                                    <strong>{safe(data.patient.email)}</strong>
                                </div>

                                <div>
                                    <span>Адреса</span>
                                    <strong>{safe(data.patient.address)}</strong>
                                </div>

                                <div>
                                    <span>Дата прийому</span>
                                    <strong>{formatDateTime(data.visit.startTime)}</strong>
                                </div>

                                <div>
                                    <span>Статус</span>
                                    <strong>Завершено</strong>
                                </div>
                            </div>
                        </section>

                        <section className="dashboard-card">
                            <h2>Медична картка</h2>

                            <div className="details-grid">
                                <div>
                                    <span>Скарги</span>
                                    <strong>{safe(data.medicalRecord?.complaints)}</strong>
                                </div>

                                <div>
                                    <span>Анамнез</span>
                                    <strong>{safe(data.medicalRecord?.anamnesis)}</strong>
                                </div>

                                <div>
                                    <span>Діагноз</span>
                                    <strong>{safe(data.visit.diagnosis)}</strong>
                                </div>

                                <div>
                                    <span>Лікування</span>
                                    <strong>{safe(data.visit.treatment)}</strong>
                                </div>

                                <div>
                                    <span>Гострота зору</span>
                                    <strong>{safe(data.visit.visualAcuity)}</strong>
                                </div>
                            </div>
                        </section>

                        <section className="dashboard-card">
                            <h2>IoT-результати</h2>

                            {!data.measurement ? (
                                <div className="empty-state">
                                    <h3>IoT-дані відсутні</h3>
                                    <p>Цей прийом було завершено без автоматизованого обстеження.</p>
                                </div>
                            ) : (
                                <div className="iot-results-grid">
                                    <div className="eye-card">
                                        <h3>Праве око OD</h3>
                                        <div className="result-row"><span>SPH</span><strong>{safe(data.measurement.sphOd)}</strong></div>
                                        <div className="result-row"><span>CYL</span><strong>{safe(data.measurement.cylOd)}</strong></div>
                                        <div className="result-row"><span>AXIS</span><strong>{safe(data.measurement.axisOd)}</strong></div>
                                        <div className="result-row"><span>IOP</span><strong>{safe(data.measurement.iopOd)}</strong></div>
                                    </div>

                                    <div className="eye-card">
                                        <h3>Ліве око OS</h3>
                                        <div className="result-row"><span>SPH</span><strong>{safe(data.measurement.sphOs)}</strong></div>
                                        <div className="result-row"><span>CYL</span><strong>{safe(data.measurement.cylOs)}</strong></div>
                                        <div className="result-row"><span>AXIS</span><strong>{safe(data.measurement.axisOs)}</strong></div>
                                        <div className="result-row"><span>IOP</span><strong>{safe(data.measurement.iopOs)}</strong></div>
                                    </div>

                                    <div className="eye-card">
                                        <h3>Додатково</h3>
                                        <div className="result-row"><span>PD</span><strong>{safe(data.measurement.pd)}</strong></div>
                                        <div className="result-row"><span>Пристрій</span><strong>{safe(data.measurement.deviceSerial)}</strong></div>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="dashboard-card">
                            <h2>Рецепт</h2>

                            {!data.prescription ? (
                                <div className="empty-state">
                                    <h3>Рецепт не сформовано</h3>
                                    <p>Рецепт створюється після IoT-обстеження.</p>
                                </div>
                            ) : (
                                <div className="details-grid">
                                    <div>
                                        <span>Тип рецепта</span>
                                        <strong>{safe(data.prescription.prescriptionType)}</strong>
                                    </div>

                                    <div>
                                        <span>Оновлено</span>
                                        <strong>{formatDateTime(data.prescription.updatedAt || data.prescription.createdAt)}</strong>
                                    </div>

                                    <div>
                                        <span>Праве око OD</span>
                                        <strong>
                                            SPH {safe(data.prescription.sphOd)}, CYL {safe(data.prescription.cylOd)}, AXIS {safe(data.prescription.axisOd)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Ліве око OS</span>
                                        <strong>
                                            SPH {safe(data.prescription.sphOs)}, CYL {safe(data.prescription.cylOs)}, AXIS {safe(data.prescription.axisOs)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>PD</span>
                                        <strong>{safe(data.prescription.pd)}</strong>
                                    </div>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default DoctorCompletedVisitPage;
