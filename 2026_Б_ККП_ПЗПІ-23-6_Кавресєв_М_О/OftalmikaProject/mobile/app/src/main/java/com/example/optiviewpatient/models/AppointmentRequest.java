package com.example.optiviewpatient.models;

public class AppointmentRequest {

    private Long patientId;
    private Long doctorId;
    private String startTime;
    private String visitType;

    public AppointmentRequest(Long patientId, Long doctorId, String startTime, String visitType) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.startTime = startTime;
        this.visitType = visitType;
    }

    public Long getPatientId() {
        return patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public String getStartTime() {
        return startTime;
    }

    public String getVisitType() {
        return visitType;
    }
}