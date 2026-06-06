package com.example.optiviewpatient.models;

public class RegisterPatientRequest {

    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String birthDate;
    private String phone;
    private String email;
    private String address;

    public RegisterPatientRequest(String username, String password, String firstName, String lastName, String birthDate, String phone, String email, String address) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.phone = phone;
        this.email = email;
        this.address = address;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getAddress() {
        return address;
    }
}