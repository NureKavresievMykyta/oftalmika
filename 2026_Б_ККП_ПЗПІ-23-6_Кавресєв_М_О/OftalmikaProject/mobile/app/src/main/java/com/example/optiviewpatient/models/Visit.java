package com.example.optiviewpatient.models;

public class Visit {

    private Long visitId;
    private Long patientId;
    private Long doctorId;
    private String startTime;
    private String endTime;
    private String visitStatus;
    private String visitType;
    private String diagnosis;
    private String treatment;
    private String visualAcuity;

    public Long getVisitId() {
        return visitId;
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

    public String getEndTime() {
        return endTime;
    }

    public String getVisitStatus() {
        return visitStatus;
    }

    public String getVisitType() {
        return visitType;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public String getTreatment() {
        return treatment;
    }

    public String getVisualAcuity() {
        return visualAcuity;
    }
}