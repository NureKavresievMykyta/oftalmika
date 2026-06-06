package com.example.optiviewpatient.models;

public class AuthResponse {

    private Long userId;
    private Long patientId;
    private String username;
    private String role;
    private String message;

    public Long getUserId() {
        return userId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }
}