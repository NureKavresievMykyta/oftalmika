package com.example.optiviewpatient.models;

public class Doctor {

    private Long doctorUserId;
    private String firstName;
    private String lastName;
    private String specialization;
    private String cabinetNumber;

    public Long getDoctorUserId() {
        return doctorUserId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getSpecialization() {
        return specialization;
    }

    public String getCabinetNumber() {
        return cabinetNumber;
    }
}