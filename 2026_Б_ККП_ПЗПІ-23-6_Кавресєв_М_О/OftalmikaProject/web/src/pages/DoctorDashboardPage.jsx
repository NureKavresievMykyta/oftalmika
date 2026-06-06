import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import DoctorStatsPanel from "../components/DoctorStatsPanel.jsx";

function DoctorDashboardPage() {
    const navigate = useNavigate();

    const userId = localStorage.getItem("oftalmika_user_id");
    const displayName = localStorage.getItem("oftalmika_display_name");

    const [appointments, setAppointments] = useState([]);
    const [message, setMessage] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [iotInfo, setIotInfo] = useState(null);
    const [weekStart, setWeekStart] = useState(getMonday(new Date()));
    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const [calendarFilter, setCalendarFilter] = useState("ALL");
    const [patientSearchQuery, setPatientSearchQuery] = useState("");
    const [patientSearchResults, setPatientSearchResults] = useState([]);
    const [patientSearchMessage, setPatientSearchMessage] = useState("");
    const [selectedPatientCard, setSelectedPatientCard] = useState(null);

    const workHours = [
        "08:00", "08:30",
        "09:00", "09:30",
        "10:00", "10:30",
        "11:00", "11:30",
        "12:00", "12:30",
        "13:00", "13:30",
        "14:00", "14:30",
        "15:00", "15:30"
    ];

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const loadAppointments = useCallback(async () => {
        try {
            const from = formatDate(weekStart);
            const to = formatDate(addDays(weekStart, 5));

            const response = await api.get(
                `/api/doctor-appointments/calendar/${userId}?from=${from}&to=${to}&status=${calendarFilter}`
            );

            setAppointments(response.data);
        } catch {
            setMessage("Не вдалося завантажити прийоми");
        }
    }, [userId, weekStart, calendarFilter]);

    const loadIotInfo = useCallback(async () => {
        try {
            const response = await api.get("/api/iot/status");
            setIotInfo(response.data);
        } catch {
            setIotInfo({
                status: "OFFLINE",
                deviceName: "Oftalmika Smart Vision Scanner",
                message: "IoT-пристрій недоступний"
            });
        }
    }, []);

    const refreshPageData = () => {
        loadAppointments();
        loadIotInfo();
        setMessage("Дані оновлено");
    };

    const previousWeek = () => {
        setWeekStart(addDays(weekStart, -7));
    };

    const currentWeek = () => {
        setWeekStart(getMonday(new Date()));
    };

    const nextWeek = () => {
        setWeekStart(addDays(weekStart, 7));
    };

    const searchPatients = async () => {
        const query = patientSearchQuery.trim();

        if (!query) {
            setPatientSearchMessage("Введіть ім’я, прізвище, телефон або email пацієнта");
            setPatientSearchResults([]);
            return;
        }

        try {
            const response = await api.get(`/api/doctor-appointments/patients/search?query=${encodeURIComponent(query)}`);
            setPatientSearchResults(response.data);

            if (response.data.length === 0) {
                setPatientSearchMessage("Пацієнтів не знайдено");
            } else {
                setPatientSearchMessage("");
            }
        } catch {
            setPatientSearchMessage("Не вдалося виконати пошук");
        }
    };

    const openPatientCard = async (patientId) => {
        try {
            const response = await api.get(`/api/doctor-appointments/patients/${patientId}/card`);
            setSelectedPatientCard(response.data);
        } catch {
            setPatientSearchMessage("Не вдалося відкрити картку пацієнта");
        }
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "не вказано";
        }

        return String(value).replace("T", " ");
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

    const getWeekDays = () => {
        return [
            weekStart,
            addDays(weekStart, 1),
            addDays(weekStart, 2),
            addDays(weekStart, 3),
            addDays(weekStart, 4),
            addDays(weekStart, 5)
        ];
    };

    const getAppointmentForSlot = (day, time) => {
        const date = formatDate(day);

        return appointments.find((visit) => {
            if (!visit.startTime) {
                return false;
            }

            const [visitDate, visitTimeFull] = visit.startTime.split("T");
            const visitTime = visitTimeFull ? visitTimeFull.substring(0, 5) : "";

            return visitDate === date && visitTime === time;
        });
    };

    const getStatusClass = (status) => {
        if (status === "COMPLETED") {
            return "calendar-event completed";
        }

        if (status === "CANCELLED") {
            return "calendar-event cancelled";
        }

        return "calendar-event planned";
    };

    const getIotStatus = () => {
        if (!iotInfo) {
            return "CHECKING";
        }

        return iotInfo.status || "OFFLINE";
    };

    const getLastScan = () => {
        if (!iotInfo || !iotInfo.lastScan) {
            return null;
        }

        return iotInfo.lastScan;
    };

    const getCalendarTitle = () => {
        return `${formatDate(weekStart)} - ${formatDate(addDays(weekStart, 5))}`;
    };

    useEffect(() => {
        loadAppointments();
        loadIotInfo();
    }, [loadAppointments, loadIotInfo]);

    const weekDays = getWeekDays();
    const lastScan = getLastScan();
    const iotStatus = getIotStatus();

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <h1>Oftalmika</h1>
                    <p>Кабінет лікаря</p>
                </div>

                <div className="profile-menu-wrapper">
                    <button
                        className="profile-button"
                        onClick={() => setProfileOpen(!profileOpen)}
                    >
                        {displayName || "Профіль"}
                    </button>

                    {profileOpen && (
                        <div className="profile-dropdown">
                            <button onClick={() => navigate("/doctor/profile")}>
                                Редагувати профіль
                            </button>

                            <button onClick={logout}>
                                Вийти
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="dashboard-content">
                <section className="dashboard-card">
                    <h2>Вітаємо, {displayName || "лікарю"}</h2>
                    <p>
                        У цьому кабінеті лікар може переглядати розклад прийомів,
                        відкривати інформацію про пацієнтів та проводити обстеження.
                    </p>
                </section>
                <DoctorStatsPanel />

                <section className={calendarExpanded ? "dashboard-card calendar-card-expanded" : "dashboard-card calendar-card-compact"}>
                    <div className="calendar-top-panel">
                        <div>
                            <h2>Календар прийомів</h2>

                            <div className="calendar-week-switcher">
                                <button className="calendar-arrow-button" onClick={previousWeek}>
                                    ‹
                                </button>

                                <div className="calendar-week-title">
                                    <span>Тиждень</span>
                                    <strong>{getCalendarTitle()}</strong>
                                </div>

                                <button className="calendar-arrow-button" onClick={nextWeek}>
                                    ›
                                </button>
                            </div>
                        </div>

                        <div className="calendar-side-actions">
                            <button className="secondary-small-button" onClick={currentWeek}>
                                Поточний тиждень
                            </button>

                            <select
                                className="calendar-filter-select"
                                value={calendarFilter}
                                onChange={(event) => setCalendarFilter(event.target.value)}
                            >
                                <option value="ALL">Усі записи</option>
                                <option value="PLANNED">Заплановані</option>
                                <option value="COMPLETED">Завершені</option>
                            </select>

                            <button className="primary-small-button" onClick={refreshPageData}>
                                Оновити записи
                            </button>

                            <button
                                className="secondary-small-button"
                                onClick={() => setCalendarExpanded(!calendarExpanded)}
                            >
                                {calendarExpanded ? "Згорнути календар" : "Розгорнути календар"}
                            </button>
                        </div>
                    </div>

                    {message && <div className="info-message">{message}</div>}

                    <div className="calendar-legend">
                        <span><b className="legend-dot planned-dot"></b> Заплановано</span>
                        <span><b className="legend-dot completed-dot"></b> Завершено</span>
                    </div>

                    <div className="calendar-scroll-area">
                        <div className="doctor-calendar">
                            <div className="calendar-time-header"></div>

                            {weekDays.map((day) => (
                                <div className="calendar-day-header" key={formatDate(day)}>
                                    <strong>{getDayName(day)}</strong>
                                    <span>{formatDate(day)}</span>
                                </div>
                            ))}

                            {workHours.map((time) => (
                                <div className="calendar-row-fragment" key={time}>
                                    <div className="calendar-time-cell">{time}</div>

                                    {weekDays.map((day) => {
                                        const visit = getAppointmentForSlot(day, time);

                                        return (
                                            <div className="calendar-cell" key={formatDate(day) + time}>
                                                {visit && (
                                                    <div
                                                        className={getStatusClass(visit.visitStatus)}
                                                        onClick={() => setSelectedVisit(visit)}
                                                    >
                                                        <strong>
                                                            {visit.patientFirstName} {visit.patientLastName}
                                                        </strong>
                                                        <span>{translateVisitType(visit.visitType)}</span>
                                                        <em>{translateStatus(visit.visitStatus)}</em>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="dashboard-grid">
                    <div className="small-card action-card" onClick={() => navigate("/doctor/medical-records")}>
                        <h3>Медичні записи</h3>
                        <p>Перегляд завершених прийомів, медичних карток, діагнозів та IoT-результатів.</p>
                        <button className="secondary-small-button" type="button">
                            Відкрити записи
                        </button>
                    </div>

                    <div className="small-card action-card" onClick={() => navigate("/doctor/prescriptions")}>
                        <h3>Рецепти</h3>
                        <p>Перегляд рецептів пацієнтів, сформованих після IoT-обстежень.</p>
                        <button className="secondary-small-button" type="button">
                            Відкрити рецепти
                        </button>
                    </div>

                    <div className="small-card iot-small-card">
                        <h3>IoT-дані</h3>

                        <div className={iotStatus === "ONLINE" ? "iot-online" : "iot-offline"}>
                            {iotStatus === "ONLINE" ? "IoT-пристрій онлайн" : "IoT-пристрій офлайн"}
                        </div>

                        <p className="iot-device-name">
                            Модель: {iotInfo?.deviceName || "Oftalmika Smart Vision Scanner"}
                        </p>

                        {lastScan ? (
                            <div className="iot-last-data">
                                <p>Останнє обстеження:</p>
                                <p>Пацієнт: {lastScan.patientFullName || "не вказано"}</p>
                                <p>Час: {formatDateTime(lastScan.scanTime)}</p>
                                <p>OD: SPH {lastScan.sphOd}, CYL {lastScan.cylOd}, AXIS {lastScan.axisOd}, IOP {lastScan.iopOd}</p>
                                <p>OS: SPH {lastScan.sphOs}, CYL {lastScan.cylOs}, AXIS {lastScan.axisOs}, IOP {lastScan.iopOs}</p>
                                <p>PD: {lastScan.pd}</p>
                            </div>
                        ) : (
                            <p className="iot-last-data">Останніх IoT-результатів поки немає.</p>
                        )}
                    </div>
                </section>

                <section className="dashboard-card" id="doctorPatientSearchBlock">
                    <div className="section-header">
                        <div>
                            <h2>Пошук пацієнта</h2>
                            <p>Знайдіть пацієнта за ім’ям, прізвищем, телефоном або email.</p>
                        </div>
                    </div>

                    <div className="patient-search-panel">
                        <input
                            type="text"
                            value={patientSearchQuery}
                            onChange={(event) => setPatientSearchQuery(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    searchPatients();
                                }
                            }}
                            placeholder="Пошук за пацієнтом"
                        />

                        <button className="primary-small-button" onClick={searchPatients}>
                            Знайти
                        </button>
                    </div>

                    {patientSearchMessage && <div className="info-message">{patientSearchMessage}</div>}

                    {patientSearchResults.length > 0 && (
                        <div className="patient-search-results">
                            {patientSearchResults.map((patient) => (
                                <div className="patient-search-card" key={patient.patientId}>
                                    <div>
                                        <h3>{patient.firstName} {patient.lastName}</h3>
                                        <p>{patient.phone || "Телефон не вказано"} · {patient.email || "Email не вказано"}</p>
                                    </div>

                                    <button
                                        className="secondary-small-button"
                                        onClick={() => openPatientCard(patient.patientId)}
                                    >
                                        Відкрити картку
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {selectedVisit && (
                <div className="modal-backdrop" onClick={() => setSelectedVisit(null)}>
                    <div className="patient-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>
                                    {selectedVisit.patientFirstName} {selectedVisit.patientLastName}
                                </h2>
                                <p>Детальна інформація про пацієнта та запис</p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setSelectedVisit(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="patient-info-grid">
                            <div>
                                <span>Дата народження</span>
                                <strong>{selectedVisit.patientBirthDate || "не вказано"}</strong>
                            </div>

                            <div>
                                <span>Телефон</span>
                                <strong>{selectedVisit.patientPhone || "не вказано"}</strong>
                            </div>

                            <div>
                                <span>Email</span>
                                <strong>{selectedVisit.patientEmail || "не вказано"}</strong>
                            </div>

                            <div>
                                <span>Адреса</span>
                                <strong>{selectedVisit.patientAddress || "не вказано"}</strong>
                            </div>

                            <div>
                                <span>Дата і час прийому</span>
                                <strong>{formatDateTime(selectedVisit.startTime)}</strong>
                            </div>

                            <div>
                                <span>Тип прийому</span>
                                <strong>{translateVisitType(selectedVisit.visitType)}</strong>
                            </div>

                            <div>
                                <span>Статус</span>
                                <strong>{translateStatus(selectedVisit.visitStatus)}</strong>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="secondary-small-button"
                                onClick={() => openPatientCard(selectedVisit.patientId)}
                            >
                                Картка пацієнта
                            </button>

                            {selectedVisit.visitStatus === "PLANNED" && (
                                <button
                                    className="primary-small-button"
                                    onClick={() => navigate(`/doctor/visit/${selectedVisit.visitId}`)}
                                >
                                    Провести прийом
                                </button>
                            )}

                            {selectedVisit.visitStatus === "COMPLETED" && (
                                <button
                                    className="primary-small-button"
                                    onClick={() => navigate(`/doctor/completed-visit/${selectedVisit.visitId}`)}
                                >
                                    Переглянути результати
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedPatientCard && (
                <div className="modal-backdrop" onClick={() => setSelectedPatientCard(null)}>
                    <div className="patient-modal large-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>
                                    {selectedPatientCard.patient.firstName} {selectedPatientCard.patient.lastName}
                                </h2>
                                <p>Картка пацієнта</p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setSelectedPatientCard(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="patient-info-grid">
                            <div>
                                <span>Дата народження</span>
                                <strong>{selectedPatientCard.patient.birthDate || "не вказано"}</strong>
                            </div>

                            <div>
                                <span>Телефон</span>
                                <strong>{selectedPatientCard.patient.phone || "не вказано"}</strong>
                            </div>

                            <div>
                                <span>Email</span>
                                <strong>{selectedPatientCard.patient.email || "не вказано"}</strong>
                            </div>

                            <div>
                                <span>Адреса</span>
                                <strong>{selectedPatientCard.patient.address || "не вказано"}</strong>
                            </div>
                        </div>

                        <div className="patient-card-section">
                            <h3>Актуальний рецепт</h3>

                            {!selectedPatientCard.actualPrescription ? (
                                <p>Актуального рецепта поки немає.</p>
                            ) : (
                                <div className="details-grid">
                                    <div>
                                        <span>Тип</span>
                                        <strong>{selectedPatientCard.actualPrescription.prescriptionType}</strong>
                                    </div>

                                    <div>
                                        <span>Праве око OD</span>
                                        <strong>
                                            SPH {selectedPatientCard.actualPrescription.sphOd}, CYL {selectedPatientCard.actualPrescription.cylOd}, AXIS {selectedPatientCard.actualPrescription.axisOd}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Ліве око OS</span>
                                        <strong>
                                            SPH {selectedPatientCard.actualPrescription.sphOs}, CYL {selectedPatientCard.actualPrescription.cylOs}, AXIS {selectedPatientCard.actualPrescription.axisOs}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>PD</span>
                                        <strong>{selectedPatientCard.actualPrescription.pd || "не вказано"}</strong>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="patient-card-section">
                            <h3>Останні IoT-дані</h3>

                            {!selectedPatientCard.lastMeasurement ? (
                                <p>IoT-даних для цього пацієнта поки немає.</p>
                            ) : (
                                <div className="details-grid">
                                    <div>
                                        <span>Праве око OD</span>
                                        <strong>
                                            SPH {selectedPatientCard.lastMeasurement.sphOd}, CYL {selectedPatientCard.lastMeasurement.cylOd}, AXIS {selectedPatientCard.lastMeasurement.axisOd}, IOP {selectedPatientCard.lastMeasurement.iopOd}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Ліве око OS</span>
                                        <strong>
                                            SPH {selectedPatientCard.lastMeasurement.sphOs}, CYL {selectedPatientCard.lastMeasurement.cylOs}, AXIS {selectedPatientCard.lastMeasurement.axisOs}, IOP {selectedPatientCard.lastMeasurement.iopOs}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>PD</span>
                                        <strong>{selectedPatientCard.lastMeasurement.pd || "не вказано"}</strong>
                                    </div>

                                    <div>
                                        <span>Пристрій</span>
                                        <strong>{selectedPatientCard.lastMeasurement.deviceSerial || "не вказано"}</strong>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="patient-card-section">
                            <h3>Завершені обстеження</h3>

                            {selectedPatientCard.completedVisits.length === 0 ? (
                                <p>Завершених обстежень поки немає.</p>
                            ) : (
                                <div className="patient-history-list">
                                    {selectedPatientCard.completedVisits.map((visit) => (
                                        <div className="patient-history-item" key={visit.visitId}>
                                            <div>
                                                <strong>{formatDateTime(String(visit.startTime))}</strong>
                                                <p>Діагноз: {visit.diagnosis || "Не вказано"}</p>
                                            </div>

                                            <button
                                                className="secondary-small-button"
                                                onClick={() => navigate(`/doctor/completed-visit/${visit.visitId}`)}
                                            >
                                                Переглянути
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function getMonday(date) {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    current.setDate(diff);
    current.setHours(0, 0, 0, 0);
    return current;
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getDayName(date) {
    const days = [
        "Неділя",
        "Понеділок",
        "Вівторок",
        "Середа",
        "Четвер",
        "П’ятниця",
        "Субота"
    ];

    return days[date.getDay()];
}

export default DoctorDashboardPage;
