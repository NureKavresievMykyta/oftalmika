import { useCallback, useEffect, useState } from "react";
import api from "../api/api.js";

function DoctorStatsPanel() {
    const userId = localStorage.getItem("oftalmika_user_id");

    const [stats, setStats] = useState(null);
    const [message, setMessage] = useState("");

    const loadStats = useCallback(async () => {
        try {
            const response = await api.get(`/api/doctor-data/stats/${userId}`);
            setStats(response.data);
        } catch {
            setMessage("Не вдалося завантажити статистику");
        }
    }, [userId]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    if (message) {
        return (
            <section className="dashboard-card">
                <div className="error-message">{message}</div>
            </section>
        );
    }

    if (!stats) {
        return (
            <section className="dashboard-card">
                <h2>Статистика</h2>
                <p>Завантаження статистики...</p>
            </section>
        );
    }

    return (
        <section className="doctor-stats-grid">
            <div className="doctor-stat-card">
                <span>Сьогодні</span>
                <strong>{stats.todayAppointments}</strong>
                <p>прийомів</p>
            </div>

            <div className="doctor-stat-card">
                <span>Заплановано</span>
                <strong>{stats.weekPlanned}</strong>
                <p>цього тижня</p>
            </div>

            <div className="doctor-stat-card">
                <span>Завершено</span>
                <strong>{stats.weekCompleted}</strong>
                <p>цього тижня</p>
            </div>

            <div className="doctor-stat-card">
                <span>IoT</span>
                <strong>{stats.weekIot}</strong>
                <p>обстежень</p>
            </div>

            <div className="doctor-stat-card">
                <span>Пацієнти</span>
                <strong>{stats.totalPatients}</strong>
                <p>у лікаря</p>
            </div>

            <div className="doctor-stat-card">
                <span>Усього</span>
                <strong>{stats.totalCompleted}</strong>
                <p>завершено</p>
            </div>
        </section>
    );
}

export default DoctorStatsPanel;
