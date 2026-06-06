package com.example.optiviewpatient.api;

import com.example.optiviewpatient.models.AppointmentRequest;
import com.example.optiviewpatient.models.AppointmentSlot;
import com.example.optiviewpatient.models.AuthResponse;
import com.example.optiviewpatient.models.Doctor;
import com.example.optiviewpatient.models.LoginRequest;
import com.example.optiviewpatient.models.Patient;
import com.example.optiviewpatient.models.Prescription;
import com.example.optiviewpatient.models.RegisterPatientRequest;
import com.example.optiviewpatient.models.Visit;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface ApiService {

    @GET("api/patients")
    Call<List<Patient>> getPatients();

    @GET("api/patients/{id}")
    Call<Patient> getPatientById(@Path("id") Long patientId);

    @PUT("api/patients/{id}")
    Call<Patient> updatePatient(@Path("id") Long patientId, @Body Patient patient);

    @GET("api/visits")
    Call<List<Visit>> getVisits();

    @GET("api/doctors")
    Call<List<Doctor>> getDoctors();

    @GET("api/patient-appointments/{patientId}")
    Call<List<Visit>> getPatientAppointments(@Path("patientId") Long patientId);

    @GET("api/patient-appointments/available-slots/{doctorId}/{date}")
    Call<List<AppointmentSlot>> getAvailableSlots(
            @Path("doctorId") Long doctorId,
            @Path("date") String date
    );

    @POST("api/patient-appointments/book")
    Call<Visit> bookAppointment(@Body AppointmentRequest request);

    @GET("api/patient-prescriptions/{patientId}")
    Call<List<Prescription>> getPatientPrescriptions(@Path("patientId") Long patientId);

    @GET("api/patient-prescriptions/by-visit/{visitId}")
    Call<Prescription> getPrescriptionByVisit(@Path("visitId") Long visitId);

    @POST("api/auth/login")
    Call<AuthResponse> login(@Body LoginRequest request);

    @POST("api/auth/register-patient")
    Call<AuthResponse> registerPatient(@Body RegisterPatientRequest request);
}