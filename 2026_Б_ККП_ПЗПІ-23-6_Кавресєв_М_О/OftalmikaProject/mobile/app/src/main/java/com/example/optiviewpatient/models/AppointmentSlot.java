package com.example.optiviewpatient.models;

public class AppointmentSlot {

    private String time;
    private String label;
    private boolean available;

    public String getTime() {
        return time;
    }

    public String getLabel() {
        return label;
    }

    public boolean isAvailable() {
        return available;
    }

    @Override
    public String toString() {
        return label;
    }
}