import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api.js";

function DoctorConductVisitPage() {
    const navigate = useNavigate();
    const { visitId } = useParams();

    const [visit, setVisit] = useState(null);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [iotResult, setIotResult] = useState(null);
    const [iotLoading, setIotLoading] = useState(false);
    const [iotStatus, setIotStatus] = useState("CHECKING");

    const [form, setForm] = useState({
        complaints: "",
        anamnesis: "",
        diagnosis: "",
        treatment: "",
        visualAcuity: ""
    });

    const updateField = (field, value) => {
        setForm({
            ...form,
            [field]: value
        });
    };

    const loadVisit = useCallback(async () => {
        try {
            const response = await api.get(`/api/doctor-appointments/visit/${visitId}`);
            setVisit(response.data);
        } catch {
            setMessage("Не вдалося завантажити дані прийому");
            setSuccess(false);
        }
    }, [visitId]);

    const loadIotStatus = useCallback(async () => {
        try {
            const response = await api.get("/api/iot/status");

            if (response.data.status === "ONLINE") {
                setIotStatus("ONLINE");
            } else {
                setIotStatus("OFFLINE");
            }
        } catch {
            setIotStatus("OFFLINE");
        }
    }, []);

    const getIotResults = async () => {
        setMessage("");
        setSuccess(false);
        setIotLoading(true);

        try {
            const response = await api.post(`/api/iot/scan/${visitId}`);
            setIotResult(response.data);
            setIotStatus("ONLINE");
            setMessage("Результати з IoT-пристрою отримано та збережено");
            setSuccess(true);
        } catch (error) {
            setIotStatus("OFFLINE");

            if (error.response && error.response.data) {
                setMessage(error.response.data);
            } else {
                setMessage("Не вдалося отримати результати з IoT-пристрою");
            }

            setSuccess(false);
        } finally {
            setIotLoading(false);
        }
    };

    const finishVisit = async (event) => {
        event.preventDefault();
        setMessage("");
        setSuccess(false);

        let hasIot = Boolean(iotResult);

        try {
            const response = await api.get(`/api/doctor-appointments/visit/${visitId}/has-iot`);
            hasIot = hasIot || response.data.hasIot === true;
        } catch {
            hasIot = Boolean(iotResult);
        }

        if (!hasIot) {
            const confirmed = window.confirm(
                "Для цього прийому ще не отримано IoT-результати. Ви дійсно хочете завершити прийом без автоматизованого обстеження?"
            );

            if (!confirmed) {
                return;
            }
        }

        try {
            await api.put(`/api/doctor-appointments/${visitId}/finish`, form);
            setMessage("Прийом завершено. Запис перенесено в історію обстежень пацієнта.");
            setSuccess(true);

            setTimeout(() => {
                navigate("/doctor");
            }, 1200);
        } catch {
            setMessage("Не вдалося завершити прийом");
            setSuccess(false);
        }
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "не вказано";
        }

        return value.replace("T", " ");
    };

    const translateVisitType = (type) => {
        if (type === "CONSULTATION") {
            return "Консультація";
        }

        if (type === "EXAMINATION") {
            return "Обстеження";
        }

        if (type === "CONTROL") {
            return "Контрольний прийом";
        }

        return "Прийом";
    };

    useEffect(() => {
        loadVisit();
        loadIotStatus();
    }, [loadVisit, loadIotStatus]);

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <h1>Oftalmika</h1>
                    <p>Проведення прийому</p>
                </div>

                <button
                    className="secondary-button"
                    onClick={() => navigate("/doctor")}
                >
                    Назад
                </button>
            </header>

            <main className="dashboard-content">
                {!visit ? (
                    <section className="dashboard-card">
                        <h2>Завантаження прийому</h2>
                        <p>Зачекайте, будь ласка.</p>
                        {message && <div className="error-message">{message}</div>}
                    </section>
                ) : (
                    <>
                        <section className="dashboard-card">
                            <h2>
                                Прийом пацієнта: {visit.patientFirstName} {visit.patientLastName}
                            </h2>

                            <div className="patient-info-grid visit-summary-grid">
                                <div>
                                    <span>Дата і час</span>
                                    <strong>{formatDateTime(visit.startTime)}</strong>
                                </div>

                                <div>
                                    <span>Тип прийому</span>
                                    <strong>{translateVisitType(visit.visitType)}</strong>
                                </div>

                                <div>
                                    <span>Телефон</span>
                                    <strong>{visit.patientPhone || "не вказано"}</strong>
                                </div>

                                <div>
                                    <span>Email</span>
                                    <strong>{visit.patientEmail || "не вказано"}</strong>
                                </div>

                                <div>
                                    <span>Дата народження</span>
                                    <strong>{visit.patientBirthDate || "не вказано"}</strong>
                                </div>

                                <div>
                                    <span>Адреса</span>
                                    <strong>{visit.patientAddress || "не вказано"}</strong>
                                </div>
                            </div>
                        </section>

                        <section className="dashboard-card">
                            <div className="section-header">
                                <div>
                                    <h2>Результати IoT-обстеження</h2>
                                    <p>
                                        Дані автоматично отримуються з контейнера Oftalmika Smart Vision Scanner.
                                    </p>
                                </div>

                                <div className="iot-header-actions">
                                    <span className={iotStatus === "ONLINE" ? "iot-online" : "iot-offline"}>
                                        {iotStatus === "ONLINE" ? "IoT-пристрій онлайн" : "IoT-пристрій офлайн"}
                                    </span>

                                    <button
                                        className="primary-small-button"
                                        onClick={getIotResults}
                                        disabled={iotLoading || iotStatus !== "ONLINE"}
                                    >
                                        {iotLoading ? "Сканування..." : "Отримати результати з IoT-пристрою"}
                                    </button>
                                </div>
                            </div>

                            {!iotResult ? (
                                <div className="empty-state">
                                    <h3>Результати ще не отримані</h3>
                                    <p>Натисніть кнопку, щоб запустити автоматизоване обстеження.</p>
                                </div>
                            ) : (
                                <div className="iot-results-grid">
                                    <div className="eye-card">
                                        <h3>Праве око OD</h3>
                                        <div className="result-row">
                                            <span>SPH</span>
                                            <strong>{iotResult.sphOd}</strong>
                                        </div>
                                        <div className="result-row">
                                            <span>CYL</span>
                                            <strong>{iotResult.cylOd}</strong>
                                        </div>
                                        <div className="result-row">
                                            <span>AXIS</span>
                                            <strong>{iotResult.axisOd}</strong>
                                        </div>
                                        <div className="result-row">
                                            <span>IOP</span>
                                            <strong>{iotResult.iopOd}</strong>
                                        </div>
                                    </div>

                                    <div className="eye-card">
                                        <h3>Ліве око OS</h3>
                                        <div className="result-row">
                                            <span>SPH</span>
                                            <strong>{iotResult.sphOs}</strong>
                                        </div>
                                        <div className="result-row">
                                            <span>CYL</span>
                                            <strong>{iotResult.cylOs}</strong>
                                        </div>
                                        <div className="result-row">
                                            <span>AXIS</span>
                                            <strong>{iotResult.axisOs}</strong>
                                        </div>
                                        <div className="result-row">
                                            <span>IOP</span>
                                            <strong>{iotResult.iopOs}</strong>
                                        </div>
                                    </div>

                                    <div className="eye-card">
                                        <h3>Додатково</h3>
                                        <div className="result-row">
                                            <span>PD</span>
                                            <strong>{iotResult.pd}</strong>
                                        </div>
                                        <div className="result-row">
                                            <span>Пристрій</span>
                                            <strong>{iotResult.deviceSerial}</strong>
                                        </div>
                                        <div className="result-row">
                                            <span>Час</span>
                                            <strong>{formatDateTime(iotResult.scanTime)}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="dashboard-card">
                            <h2>Медична картка прийому</h2>
                            <p>
                                Поля можна залишити порожніми. Якщо лікар не заповнить певні дані,
                                у картці пацієнта буде показано "Не вказано".
                            </p>

                            <form className="visit-form" onSubmit={finishVisit}>
                                <label>Скарги пацієнта</label>
                                <textarea
                                    value={form.complaints}
                                    onChange={(event) => updateField("complaints", event.target.value)}
                                    placeholder=""
                                />

                                <label>Анамнез</label>
                                <textarea
                                    value={form.anamnesis}
                                    onChange={(event) => updateField("anamnesis", event.target.value)}
                                    placeholder=""
                                />

                                <label>Діагноз</label>
                                <textarea
                                    value={form.diagnosis}
                                    onChange={(event) => updateField("diagnosis", event.target.value)}
                                    placeholder=""
                                />

                                <label>Лікування та рекомендації</label>
                                <textarea
                                    value={form.treatment}
                                    onChange={(event) => updateField("treatment", event.target.value)}
                                    placeholder=""
                                />

                                <label>Гострота зору</label>
                                <input
                                    type="text"
                                    value={form.visualAcuity}
                                    onChange={(event) => updateField("visualAcuity", event.target.value)}
                                    placeholder=""
                                />

                                {message && (
                                    <div className={success ? "success-message" : "error-message"}>
                                        {message}
                                    </div>
                                )}

                                <div className="visit-form-actions">
                                    <button
                                        type="button"
                                        className="secondary-small-button"
                                        onClick={() => navigate("/doctor")}
                                    >
                                        Скасувати
                                    </button>

                                    <button type="submit" className="primary-button">
                                        Завершити прийом
                                    </button>
                                </div>
                            </form>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default DoctorConductVisitPage;
