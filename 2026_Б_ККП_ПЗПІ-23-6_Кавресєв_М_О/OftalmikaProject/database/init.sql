CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('DOCTOR', 'ADMIN', 'PATIENT')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    patient_id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(150),
    address VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    doctor_user_id BIGINT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(150),
    cabinet_number VARCHAR(30),
    CONSTRAINT fk_doctors_user FOREIGN KEY (doctor_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE admins (
    admin_user_id BIGINT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    shift_type VARCHAR(50),
    CONSTRAINT fk_admins_user FOREIGN KEY (admin_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE visits (
    visit_id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT,
    doctor_id BIGINT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    visit_status VARCHAR(50),
    visit_type VARCHAR(100),
    diagnosis TEXT,
    treatment TEXT,
    visual_acuity VARCHAR(100),
    CONSTRAINT fk_visits_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE SET NULL,
    CONSTRAINT fk_visits_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_user_id) ON DELETE SET NULL
);

CREATE TABLE medical_records (
    medical_record_id BIGSERIAL PRIMARY KEY,
    visit_id BIGINT,
    complaints TEXT,
    anamnesis TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medical_records_visit FOREIGN KEY (visit_id) REFERENCES visits(visit_id) ON DELETE CASCADE
);

CREATE TABLE measurements (
    measurements_id BIGSERIAL PRIMARY KEY,
    medical_record_id BIGINT,
    sph_od NUMERIC(5,2),
    cyl_od NUMERIC(5,2),
    axis_od INTEGER CHECK (axis_od BETWEEN 0 AND 180),
    sph_os NUMERIC(5,2),
    cyl_os NUMERIC(5,2),
    axis_os INTEGER CHECK (axis_os BETWEEN 0 AND 180),
    iop_od INTEGER,
    iop_os INTEGER,
    device_serial VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_measurements_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(medical_record_id) ON DELETE CASCADE
);

CREATE TABLE prescriptions (
    prescription_id BIGSERIAL PRIMARY KEY,
    medical_record_id BIGINT,
    prescription_type VARCHAR(100),
    sph_od NUMERIC(5,2),
    cyl_od NUMERIC(5,2),
    axis_od INTEGER CHECK (axis_od BETWEEN 0 AND 180),
    sph_os NUMERIC(5,2),
    cyl_os NUMERIC(5,2),
    axis_os INTEGER CHECK (axis_os BETWEEN 0 AND 180),
    pd INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prescriptions_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(medical_record_id) ON DELETE CASCADE
);

CREATE TABLE diagnoses (
    diagnosis_id BIGSERIAL PRIMARY KEY,
    diagnosis_code VARCHAR(50) NOT NULL UNIQUE,
    diagnosis_name VARCHAR(150) NOT NULL,
    diagnosis_description TEXT
);

CREATE TABLE record_diagnoses (
    record_diagnosis_id BIGSERIAL PRIMARY KEY,
    medical_record_id BIGINT,
    diagnosis_id BIGINT,
    diagnosis_type VARCHAR(100),
    CONSTRAINT fk_record_diagnoses_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(medical_record_id) ON DELETE CASCADE,
    CONSTRAINT fk_record_diagnoses_diagnosis FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(diagnosis_id) ON DELETE CASCADE
);

CREATE INDEX idx_patients_last_name ON patients(last_name);
CREATE INDEX idx_visits_patient_id ON visits(patient_id);
CREATE INDEX idx_visits_doctor_id ON visits(doctor_id);
CREATE INDEX idx_medical_records_visit_id ON medical_records(visit_id);
CREATE INDEX idx_measurements_record_id ON measurements(medical_record_id);
CREATE INDEX idx_prescriptions_record_id ON prescriptions(medical_record_id);
CREATE INDEX idx_record_diagnoses_record_id ON record_diagnoses(medical_record_id);
CREATE INDEX idx_record_diagnoses_diagnosis_id ON record_diagnoses(diagnosis_id);