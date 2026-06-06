import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

function AdminDashboardPage() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("requests");
    const [stats, setStats] = useState(null);
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [visits, setVisits] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [message, setMessage] = useState("");

    const [doctorSearch, setDoctorSearch] = useState("");
    const [patientSearch, setPatientSearch] = useState("");
    const [visitFilter, setVisitFilter] = useState("ALL");

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const loadAll = useCallback(async () => {
        try {
            const [
                statsResponse,
                pendingResponse,
                doctorsResponse,
                patientsResponse,
                visitsResponse,
                measurementsResponse
            ] = await Promise.all([
                api.get("/api/admin/stats"),
                api.get("/api/admin/doctors/pending"),
                api.get("/api/admin/doctors"),
                api.get("/api/admin/patients"),
                api.get("/api/admin/visits"),
                api.get("/api/admin/measurements")
            ]);

            setStats(statsResponse.data);
            setPendingDoctors(pendingResponse.data);
            setDoctors(doctorsResponse.data);
            setPatients(patientsResponse.data);
            setVisits(visitsResponse.data);
            setMeasurements(measurementsResponse.data);
        } catch {
            setMessage("Не вдалося завантажити дані адміністративної панелі");
        }
    }, []);

    const approveDoctor = async (doctorUserId) => {
        try {
            await api.put(`/api/admin/doctors/${doctorUserId}/approve`);
            setMessage("Лікаря підтверджено");
            loadAll();
        } catch {
            setMessage("Не вдалося підтвердити лікаря");
        }
    };

    const rejectDoctor = async (doctorUserId) => {
        const confirmed = window.confirm("Відхилити заявку лікаря? Акаунт буде видалено.");

        if (!confirmed) {
            return;
        }

        try {
            await api.put(`/api/admin/doctors/${doctorUserId}/reject`);
            setMessage("Заявку лікаря відхилено");
            loadAll();
        } catch {
            setMessage("Не вдалося відхилити заявку");
        }
    };

    const toggleDoctor = async (doctorUserId) => {
        try {
            await api.put(`/api/admin/doctors/${doctorUserId}/toggle-active`);
            setMessage("Статус лікаря змінено");
            loadAll();
        } catch {
            setMessage("Не вдалося змінити статус лікаря");
        }
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

    const translateStatus = (status) => {
        if (status === "PLANNED") {
            return "Заплановано";
        }

        if (status === "COMPLETED") {
            return "Завершено";
        }

        if (status === "CANCELLED") {
            return "Скасовано";
        }

        return "Не вказано";
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

    const filteredDoctors = doctors.filter((doctor) => {
        const query = doctorSearch.toLowerCase().trim();

        if (!query) {
            return true;
        }

        const data = `
            ${doctor.username || ""}
            ${doctor.firstName || ""}
            ${doctor.lastName || ""}
            ${doctor.specialization || ""}
            ${doctor.cabinetNumber || ""}
        `.toLowerCase();

        return data.includes(query);
    });

    const filteredPatients = patients.filter((patient) => {
        const query = patientSearch.toLowerCase().trim();

        if (!query) {
            return true;
        }

        const data = `
            ${patient.firstName || ""}
            ${patient.lastName || ""}
            ${patient.phone || ""}
            ${patient.email || ""}
            ${patient.address || ""}
        `.toLowerCase();

        return data.includes(query);
    });

    const filteredVisits = visits.filter((visit) => {
        if (visitFilter === "ALL") {
            return true;
        }

        return visit.visitStatus === visitFilter;
    });

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <h1>Oftalmika</h1>
                    <p>Адміністративна панель</p>
                </div>

                <div className="admin-header-actions">
                    <button className="secondary-button" onClick={loadAll}>
                        Оновити
                    </button>

                    <button onClick={logout} className="secondary-button">
                        Вийти
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <section className="dashboard-card">
                    <h2>Вітаємо, адміністраторе</h2>
                    <p>
                        У цьому розділі можна контролювати заявки лікарів, акаунти лікарів,
                        пацієнтів, прийоми та IoT-обстеження медичного центру.
                    </p>
                </section>

                {message && <div className="info-message">{message}</div>}

                {stats && (
                    <section className="admin-stats-grid">
                        <div className="admin-stat-card">
                            <span>Пацієнти</span>
                            <strong>{stats.patientsCount}</strong>
                        </div>

                        <div className="admin-stat-card">
                            <span>Лікарі</span>
                            <strong>{stats.doctorsCount}</strong>
                        </div>

                        <div className="admin-stat-card">
                            <span>Заявки</span>
                            <strong>{stats.pendingDoctorsCount}</strong>
                        </div>

                        <div className="admin-stat-card">
                            <span>Заплановано</span>
                            <strong>{stats.plannedVisits}</strong>
                        </div>

                        <div className="admin-stat-card">
                            <span>Завершено</span>
                            <strong>{stats.completedVisits}</strong>
                        </div>

                        <div className="admin-stat-card">
                            <span>IoT</span>
                            <strong>{stats.measurementsCount}</strong>
                        </div>

                        <div className="admin-stat-card">
                            <span>Рецепти</span>
                            <strong>{stats.prescriptionsCount}</strong>
                        </div>
                    </section>
                )}

                <section className="dashboard-card">
                    <div className="admin-tabs">
                        <button
                            className={activeTab === "requests" ? "admin-tab active" : "admin-tab"}
                            onClick={() => setActiveTab("requests")}
                        >
                            Заявки лікарів
                        </button>

                        <button
                            className={activeTab === "doctors" ? "admin-tab active" : "admin-tab"}
                            onClick={() => setActiveTab("doctors")}
                        >
                            Лікарі
                        </button>

                        <button
                            className={activeTab === "patients" ? "admin-tab active" : "admin-tab"}
                            onClick={() => setActiveTab("patients")}
                        >
                            Пацієнти
                        </button>

                        <button
                            className={activeTab === "visits" ? "admin-tab active" : "admin-tab"}
                            onClick={() => setActiveTab("visits")}
                        >
                            Прийоми
                        </button>

                        <button
                            className={activeTab === "iot" ? "admin-tab active" : "admin-tab"}
                            onClick={() => setActiveTab("iot")}
                        >
                            IoT-обстеження
                        </button>
                    </div>

                    {activeTab === "requests" && (
                        <div>
                            <div className="section-header">
                                <div>
                                    <h2>Заявки лікарів</h2>
                                    <p>Лікарі, які очікують підтвердження адміністратором.</p>
                                </div>
                            </div>

                            {pendingDoctors.length === 0 ? (
                                <div className="empty-state">
                                    <h3>Нових заявок немає</h3>
                                    <p>Усі заявки лікарів уже оброблено.</p>
                                </div>
                            ) : (
                                <div className="table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Логін</th>
                                                <th>Ім’я</th>
                                                <th>Прізвище</th>
                                                <th>Спеціалізація</th>
                                                <th>Кабінет</th>
                                                <th>Дії</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {pendingDoctors.map((doctor) => (
                                                <tr key={doctor.userId}>
                                                    <td>{doctor.username}</td>
                                                    <td>{doctor.firstName}</td>
                                                    <td>{doctor.lastName}</td>
                                                    <td>{doctor.specialization}</td>
                                                    <td>{doctor.cabinetNumber || "не вказано"}</td>
                                                    <td>
                                                        <div className="admin-table-actions">
                                                            <button
                                                                className="primary-small-button"
                                                                onClick={() => approveDoctor(doctor.userId)}
                                                            >
                                                                Підтвердити
                                                            </button>

                                                            <button
                                                                className="danger-small-button"
                                                                onClick={() => rejectDoctor(doctor.userId)}
                                                            >
                                                                Відхилити
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "doctors" && (
                        <div>
                            <div className="section-header">
                                <div>
                                    <h2>Лікарі</h2>
                                    <p>Керування акаунтами лікарів та їх доступом до web-кабінету.</p>
                                </div>
                            </div>

                            <div className="admin-search">
                                <input
                                    value={doctorSearch}
                                    onChange={(event) => setDoctorSearch(event.target.value)}
                                    placeholder="Пошук лікаря"
                                />
                            </div>

                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Логін</th>
                                            <th>ПІБ</th>
                                            <th>Спеціалізація</th>
                                            <th>Кабінет</th>
                                            <th>Статус</th>
                                            <th>Дія</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredDoctors.map((doctor) => (
                                            <tr key={doctor.userId}>
                                                <td>{doctor.username}</td>
                                                <td>{doctor.firstName} {doctor.lastName}</td>
                                                <td>{doctor.specialization}</td>
                                                <td>{doctor.cabinetNumber || "не вказано"}</td>
                                                <td>
                                                    <span className={doctor.isActive ? "admin-status active" : "admin-status blocked"}>
                                                        {doctor.isActive ? "Активний" : "Неактивний"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className={doctor.isActive ? "danger-small-button" : "primary-small-button"}
                                                        onClick={() => toggleDoctor(doctor.userId)}
                                                    >
                                                        {doctor.isActive ? "Деактивувати" : "Активувати"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "patients" && (
                        <div>
                            <div className="section-header">
                                <div>
                                    <h2>Пацієнти</h2>
                                    <p>Перегляд пацієнтів, контактів та кількості прийомів.</p>
                                </div>
                            </div>

                            <div className="admin-search">
                                <input
                                    value={patientSearch}
                                    onChange={(event) => setPatientSearch(event.target.value)}
                                    placeholder="Пошук пацієнта"
                                />
                            </div>

                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ПІБ</th>
                                            <th>Дата народження</th>
                                            <th>Телефон</th>
                                            <th>Email</th>
                                            <th>Адреса</th>
                                            <th>Прийоми</th>
                                            <th>Завершено</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredPatients.map((patient) => (
                                            <tr key={patient.patientId}>
                                                <td>{patient.firstName} {patient.lastName}</td>
                                                <td>{safe(patient.birthDate)}</td>
                                                <td>{safe(patient.phone)}</td>
                                                <td>{safe(patient.email)}</td>
                                                <td>{safe(patient.address)}</td>
                                                <td>{patient.visitsCount}</td>
                                                <td>{patient.completedVisitsCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "visits" && (
                        <div>
                            <div className="section-header">
                                <div>
                                    <h2>Прийоми</h2>
                                    <p>Контроль запланованих і завершених прийомів у системі.</p>
                                </div>

                                <select
                                    className="calendar-filter-select admin-filter"
                                    value={visitFilter}
                                    onChange={(event) => setVisitFilter(event.target.value)}
                                >
                                    <option value="ALL">Усі</option>
                                    <option value="PLANNED">Заплановані</option>
                                    <option value="COMPLETED">Завершені</option>
                                    <option value="CANCELLED">Скасовані</option>
                                </select>
                            </div>

                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Пацієнт</th>
                                            <th>Лікар</th>
                                            <th>Дата</th>
                                            <th>Тип</th>
                                            <th>Статус</th>
                                            <th>Діагноз</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredVisits.map((visit) => (
                                            <tr key={visit.visitId}>
                                                <td>{visit.visitId}</td>
                                                <td>{safe(visit.patientName)}</td>
                                                <td>{safe(visit.doctorName)}</td>
                                                <td>{formatDateTime(visit.startTime)}</td>
                                                <td>{translateVisitType(visit.visitType)}</td>
                                                <td>{translateStatus(visit.visitStatus)}</td>
                                                <td>{safe(visit.diagnosis)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "iot" && (
                        <div>
                            <div className="section-header">
                                <div>
                                    <h2>IoT-обстеження</h2>
                                    <p>Усі вимірювання, отримані з пристрою Oftalmika Smart Vision Scanner.</p>
                                </div>
                            </div>

                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Пацієнт</th>
                                            <th>Лікар</th>
                                            <th>Дата прийому</th>
                                            <th>OD</th>
                                            <th>OS</th>
                                            <th>IOP</th>
                                            <th>PD</th>
                                            <th>Пристрій</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {measurements.map((item) => (
                                            <tr key={item.measurementsId}>
                                                <td>{item.measurementsId}</td>
                                                <td>{safe(item.patientName)}</td>
                                                <td>{safe(item.doctorName)}</td>
                                                <td>{formatDateTime(item.startTime)}</td>
                                                <td>SPH {safe(item.sphOd)}, CYL {safe(item.cylOd)}, AXIS {safe(item.axisOd)}</td>
                                                <td>SPH {safe(item.sphOs)}, CYL {safe(item.cylOs)}, AXIS {safe(item.axisOs)}</td>
                                                <td>OD {safe(item.iopOd)}, OS {safe(item.iopOs)}</td>
                                                <td>{safe(item.pd)}</td>
                                                <td>{safe(item.deviceSerial)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminDashboardPage;
