package com.example.optiviewpatient.models;

public class Prescription {

    private Long prescriptionId;
    private Long medicalRecordId;
    private String prescriptionType;
    private Double sphOd;
    private Double cylOd;
    private Integer axisOd;
    private Double sphOs;
    private Double cylOs;
    private Integer axisOs;
    private Integer pd;
    private String createdAt;
    private String updatedAt;

    public Long getPrescriptionId() {
        return prescriptionId;
    }

    public Long getMedicalRecordId() {
        return medicalRecordId;
    }

    public String getPrescriptionType() {
        return prescriptionType;
    }

    public Double getSphOd() {
        return sphOd;
    }

    public Double getCylOd() {
        return cylOd;
    }

    public Integer getAxisOd() {
        return axisOd;
    }

    public Double getSphOs() {
        return sphOs;
    }

    public Double getCylOs() {
        return cylOs;
    }

    public Integer getAxisOs() {
        return axisOs;
    }

    public Integer getPd() {
        return pd;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }
}