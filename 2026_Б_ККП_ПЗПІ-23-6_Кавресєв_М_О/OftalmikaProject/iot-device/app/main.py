from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from datetime import datetime
import random
import time

app = FastAPI(title="Oftalmika Smart Vision Scanner")

DEVICE_SERIAL = "OFT-SCANNER-001"
DEVICE_NAME = "Oftalmika Smart Vision Scanner"

device_state = {
    "deviceName": DEVICE_NAME,
    "deviceSerial": DEVICE_SERIAL,
    "deviceStatus": "ONLINE",
    "scanStatus": "READY",
    "currentStep": "Очікування запиту на сканування",
    "lastScanTime": None,
    "lastPatientId": None,
    "lastPatientFullName": None,
    "lastVisitId": None,
    "lastResults": None,
    "logs": [
        "Пристрій запущено",
        "Стан: ONLINE",
        "Готовий до сканування"
    ]
}


class ScanRequest(BaseModel):
    visitId: int
    patientId: int | None = None
    patientFullName: str | None = None


class ScanResult(BaseModel):
    deviceName: str
    deviceSerial: str
    scanTime: str
    visitId: int
    patientId: int | None
    patientFullName: str | None
    sphOd: float
    cylOd: float
    axisOd: int
    sphOs: float
    cylOs: float
    axisOs: int
    iopOd: int
    iopOs: int
    pd: int


def add_log(message):
    time_text = datetime.now().strftime("%H:%M:%S")
    device_state["logs"].insert(0, f"{time_text} - {message}")
    device_state["logs"] = device_state["logs"][:12]


def set_step(step):
    device_state["currentStep"] = step
    add_log(step)
    print(step, flush=True)


def generate_measurement():
    return {
        "sphOd": round(random.uniform(-3.0, 1.0) * 4) / 4,
        "cylOd": round(random.uniform(-2.0, 0.0) * 4) / 4,
        "axisOd": random.randrange(0, 181, 5),
        "sphOs": round(random.uniform(-3.0, 1.0) * 4) / 4,
        "cylOs": round(random.uniform(-2.0, 0.0) * 4) / 4,
        "axisOs": random.randrange(0, 181, 5),
        "iopOd": random.randint(12, 21),
        "iopOs": random.randint(12, 21),
        "pd": random.randint(58, 68)
    }


@app.get("/", response_class=HTMLResponse)
def device_panel():
    return """
<!doctype html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <title>Oftalmika Smart Vision Scanner</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f4f7fb;
            color: #1f2937;
        }

        .page {
            min-height: 100vh;
            padding: 32px;
        }

        .header {
            background: #ffffff;
            border-radius: 24px;
            padding: 28px;
            box-shadow: 0 14px 35px rgba(31, 41, 55, 0.08);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            margin-bottom: 24px;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .logo {
            width: 58px;
            height: 58px;
            border-radius: 18px;
            background: #1e5aa8;
            color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 28px;
            font-weight: 700;
        }

        h1 {
            margin: 0;
            color: #1e5aa8;
            font-size: 30px;
        }

        .subtitle {
            margin: 5px 0 0;
            color: #6b7280;
        }

        .status-pill {
            padding: 12px 18px;
            border-radius: 999px;
            background: #dcfce7;
            color: #166534;
            font-weight: 700;
        }

        .grid {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 24px;
        }

        .card {
            background: #ffffff;
            border-radius: 24px;
            padding: 26px;
            box-shadow: 0 14px 35px rgba(31, 41, 55, 0.08);
        }

        .card h2 {
            margin: 0 0 18px;
            color: #1e5aa8;
        }

        .scan-status {
            font-size: 22px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 12px;
        }

        .step {
            background: #e5eef9;
            color: #1e5aa8;
            padding: 16px;
            border-radius: 16px;
            font-weight: 700;
            margin-bottom: 20px;
        }

        .progress {
            width: 100%;
            height: 12px;
            background: #e5e7eb;
            border-radius: 999px;
            overflow: hidden;
            margin-bottom: 22px;
        }

        .progress-bar {
            height: 100%;
            width: 0;
            background: #1e5aa8;
            transition: width 0.4s ease;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-top: 18px;
        }

        .info-item {
            background: #f4f7fb;
            border-radius: 16px;
            padding: 16px;
        }

        .info-item span {
            display: block;
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 6px;
        }

        .info-item strong {
            display: block;
            color: #111827;
            font-size: 16px;
        }

        .results {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
        }

        .eye-card {
            background: #f4f7fb;
            border-radius: 18px;
            padding: 18px;
        }

        .eye-card h3 {
            margin: 0 0 12px;
            color: #1e5aa8;
        }

        .result-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #e5e7eb;
            padding: 8px 0;
            gap: 12px;
        }

        .result-row:last-child {
            border-bottom: none;
        }

        .logs {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 340px;
            overflow-y: auto;
        }

        .log-item {
            background: #f4f7fb;
            border-radius: 12px;
            padding: 10px 12px;
            color: #374151;
            font-size: 14px;
        }

        .empty {
            color: #6b7280;
            background: #f4f7fb;
            padding: 18px;
            border-radius: 16px;
        }

        @media (max-width: 900px) {
            .grid {
                grid-template-columns: 1fr;
            }

            .results {
                grid-template-columns: 1fr;
            }

            .header {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <div class="brand">
                <div class="logo">O</div>
                <div>
                    <h1>Oftalmika Smart Vision Scanner</h1>
                    <p class="subtitle">IoT-пристрій автоматизованого офтальмологічного обстеження</p>
                </div>
            </div>

            <div class="status-pill" id="deviceStatus">ONLINE</div>
        </div>

        <div class="grid">
            <div>
                <div class="card">
                    <h2>Стан сканування</h2>
                    <div class="scan-status" id="scanStatus">READY</div>
                    <div class="step" id="currentStep">Очікування запиту на сканування</div>

                    <div class="progress">
                        <div class="progress-bar" id="progressBar"></div>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <span>Серійний номер</span>
                            <strong id="deviceSerial">OFT-SCANNER-001</strong>
                        </div>

                        <div class="info-item">
                            <span>Останнє сканування</span>
                            <strong id="lastScanTime">Немає</strong>
                        </div>

                        <div class="info-item">
                            <span>ID прийому</span>
                            <strong id="lastVisitId">Немає</strong>
                        </div>

                        <div class="info-item">
                            <span>Пацієнт</span>
                            <strong id="lastPatient">Немає</strong>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-top: 24px;">
                    <h2>Результати останнього обстеження</h2>

                    <div id="emptyResults" class="empty">
                        Результатів ще немає. Запустіть сканування з web-кабінету лікаря.
                    </div>

                    <div id="resultsBlock" class="results" style="display: none;">
                        <div class="eye-card">
                            <h3>Праве око OD</h3>
                            <div class="result-row"><span>SPH</span><strong id="sphOd"></strong></div>
                            <div class="result-row"><span>CYL</span><strong id="cylOd"></strong></div>
                            <div class="result-row"><span>AXIS</span><strong id="axisOd"></strong></div>
                            <div class="result-row"><span>IOP</span><strong id="iopOd"></strong></div>
                        </div>

                        <div class="eye-card">
                            <h3>Ліве око OS</h3>
                            <div class="result-row"><span>SPH</span><strong id="sphOs"></strong></div>
                            <div class="result-row"><span>CYL</span><strong id="cylOs"></strong></div>
                            <div class="result-row"><span>AXIS</span><strong id="axisOs"></strong></div>
                            <div class="result-row"><span>IOP</span><strong id="iopOs"></strong></div>
                        </div>

                        <div class="eye-card">
                            <h3>Додатково</h3>
                            <div class="result-row"><span>PD</span><strong id="pd"></strong></div>
                            <div class="result-row"><span>Пристрій</span><strong id="resultDeviceSerial"></strong></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <h2>Журнал роботи пристрою</h2>
                <div class="logs" id="logs"></div>
            </div>
        </div>
    </div>

    <script>
        function progressByStatus(status, step) {
            if (status === "READY") return 0;
            if (status === "COMPLETED") return 100;
            if (step.includes("правого")) return 25;
            if (step.includes("лівого")) return 50;
            if (step.includes("тиску")) return 75;
            if (step.includes("Розрахунок")) return 90;
            if (status === "SCANNING") return 15;
            return 0;
        }

        async function loadState() {
            const response = await fetch("/api/device/state");
            const state = await response.json();

            document.getElementById("deviceStatus").textContent = state.deviceStatus;
            document.getElementById("scanStatus").textContent = state.scanStatus;
            document.getElementById("currentStep").textContent = state.currentStep;
            document.getElementById("deviceSerial").textContent = state.deviceSerial;
            document.getElementById("lastScanTime").textContent = state.lastScanTime || "Немає";
            document.getElementById("lastVisitId").textContent = state.lastVisitId || "Немає";
            document.getElementById("lastPatient").textContent = state.lastPatientFullName || "Немає";

            const progress = progressByStatus(state.scanStatus, state.currentStep);
            document.getElementById("progressBar").style.width = progress + "%";

            const logs = document.getElementById("logs");
            logs.innerHTML = "";
            state.logs.forEach(item => {
                const div = document.createElement("div");
                div.className = "log-item";
                div.textContent = item;
                logs.appendChild(div);
            });

            if (state.lastResults) {
                document.getElementById("emptyResults").style.display = "none";
                document.getElementById("resultsBlock").style.display = "grid";

                document.getElementById("sphOd").textContent = state.lastResults.sphOd;
                document.getElementById("cylOd").textContent = state.lastResults.cylOd;
                document.getElementById("axisOd").textContent = state.lastResults.axisOd;
                document.getElementById("iopOd").textContent = state.lastResults.iopOd;

                document.getElementById("sphOs").textContent = state.lastResults.sphOs;
                document.getElementById("cylOs").textContent = state.lastResults.cylOs;
                document.getElementById("axisOs").textContent = state.lastResults.axisOs;
                document.getElementById("iopOs").textContent = state.lastResults.iopOs;

                document.getElementById("pd").textContent = state.lastResults.pd;
                document.getElementById("resultDeviceSerial").textContent = state.deviceSerial;
            }
        }

        loadState();
        setInterval(loadState, 700);
    </script>
</body>
</html>
"""


@app.get("/api/device/status")
def status():
    return {
        "deviceName": device_state["deviceName"],
        "deviceSerial": device_state["deviceSerial"],
        "status": device_state["deviceStatus"],
        "lastScan": device_state["lastResults"]
    }


@app.get("/api/device/state")
def state():
    return device_state


@app.post("/api/device/scan", response_model=ScanResult)
def scan(request: ScanRequest):
    device_state["scanStatus"] = "SCANNING"
    device_state["lastVisitId"] = request.visitId
    device_state["lastPatientId"] = request.patientId
    device_state["lastPatientFullName"] = request.patientFullName
    device_state["lastResults"] = None

    add_log("Отримано запит на обстеження від backend")
    add_log(f"Прийом ID: {request.visitId}")
    add_log(f"Пацієнт: {request.patientFullName}")

    set_step("Підключення до оптичного модуля")
    time.sleep(1)

    set_step("Перевіряється праве око")
    time.sleep(1)

    set_step("Перевіряється ліве око")
    time.sleep(1)

    set_step("Вимірюється внутрішньоочний тиск")
    time.sleep(1)

    set_step("Розрахунок результатів обстеження")
    time.sleep(1)

    measurement = generate_measurement()
    scan_time = datetime.now().isoformat(timespec="seconds")

    result = {
        "deviceName": DEVICE_NAME,
        "deviceSerial": DEVICE_SERIAL,
        "scanTime": scan_time,
        "visitId": request.visitId,
        "patientId": request.patientId,
        "patientFullName": request.patientFullName,
        "sphOd": measurement["sphOd"],
        "cylOd": measurement["cylOd"],
        "axisOd": measurement["axisOd"],
        "sphOs": measurement["sphOs"],
        "cylOs": measurement["cylOs"],
        "axisOs": measurement["axisOs"],
        "iopOd": measurement["iopOd"],
        "iopOs": measurement["iopOs"],
        "pd": measurement["pd"]
    }

    device_state["scanStatus"] = "COMPLETED"
    device_state["currentStep"] = "Результати обстеження готові"
    device_state["lastScanTime"] = scan_time
    device_state["lastResults"] = result

    add_log("Сканування завершено")
    add_log("Результати передано до backend")

    print("========================================", flush=True)
    print("Oftalmika Smart Vision Scanner", flush=True)
    print(f"Visit ID: {request.visitId}", flush=True)
    print(f"Patient ID: {request.patientId}", flush=True)
    print(f"Patient: {request.patientFullName}", flush=True)
    print("Scan completed successfully", flush=True)
    print(f"SPH OD: {result['sphOd']}", flush=True)
    print(f"CYL OD: {result['cylOd']}", flush=True)
    print(f"AXIS OD: {result['axisOd']}", flush=True)
    print(f"SPH OS: {result['sphOs']}", flush=True)
    print(f"CYL OS: {result['cylOs']}", flush=True)
    print(f"AXIS OS: {result['axisOs']}", flush=True)
    print(f"IOP OD: {result['iopOd']}", flush=True)
    print(f"IOP OS: {result['iopOs']}", flush=True)
    print(f"PD: {result['pd']}", flush=True)
    print("========================================", flush=True)

    return result
