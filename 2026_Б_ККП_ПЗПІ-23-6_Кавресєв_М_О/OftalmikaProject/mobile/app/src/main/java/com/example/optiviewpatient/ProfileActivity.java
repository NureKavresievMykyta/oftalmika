package com.example.optiviewpatient;

import android.app.Activity;
import android.app.DatePickerDialog;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.example.optiviewpatient.api.ApiClient;
import com.example.optiviewpatient.models.Patient;

import java.util.Calendar;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileActivity extends Activity {

    private EditText firstNameInput;
    private EditText lastNameInput;
    private EditText birthDateInput;
    private EditText phoneInput;
    private EditText emailInput;
    private EditText addressInput;
    private Button saveProfileButton;
    private Button backButton;
    private Long patientId;
    private Patient currentPatient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        firstNameInput = findViewById(R.id.firstNameInput);
        lastNameInput = findViewById(R.id.lastNameInput);
        birthDateInput = findViewById(R.id.birthDateInput);
        phoneInput = findViewById(R.id.phoneInput);
        emailInput = findViewById(R.id.emailInput);
        addressInput = findViewById(R.id.addressInput);
        saveProfileButton = findViewById(R.id.saveProfileButton);
        backButton = findViewById(R.id.backButton);

        SharedPreferences preferences = getSharedPreferences("oftalmika_session", MODE_PRIVATE);
        patientId = preferences.getLong("patientId", -1);

        birthDateInput.setOnClickListener(view -> showDatePicker());

        saveProfileButton.setOnClickListener(view -> saveProfile());

        backButton.setOnClickListener(view -> finish());

        loadProfile();
    }

    private void loadProfile() {
        if (patientId == null || patientId == -1) {
            Toast.makeText(this, "Пацієнта не знайдено", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        ApiClient.getApiService().getPatientById(patientId).enqueue(new Callback<Patient>() {
            @Override
            public void onResponse(Call<Patient> call, Response<Patient> response) {
                if (response.isSuccessful() && response.body() != null) {
                    currentPatient = response.body();

                    firstNameInput.setText(currentPatient.getFirstName());
                    lastNameInput.setText(currentPatient.getLastName());
                    birthDateInput.setText(currentPatient.getBirthDate());
                    phoneInput.setText(currentPatient.getPhone());
                    emailInput.setText(currentPatient.getEmail());
                    addressInput.setText(currentPatient.getAddress());
                } else {
                    Toast.makeText(ProfileActivity.this, "Не вдалося завантажити профіль", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Patient> call, Throwable t) {
                Toast.makeText(ProfileActivity.this, "Помилка підключення до сервера", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void saveProfile() {
        if (currentPatient == null) {
            Toast.makeText(this, "Дані профілю ще не завантажені", Toast.LENGTH_SHORT).show();
            return;
        }

        String firstName = firstNameInput.getText().toString().trim();
        String lastName = lastNameInput.getText().toString().trim();
        String birthDate = birthDateInput.getText().toString().trim();

        if (firstName.isEmpty() || lastName.isEmpty() || birthDate.isEmpty()) {
            Toast.makeText(this, "Ім'я, прізвище і дата народження обов'язкові", Toast.LENGTH_SHORT).show();
            return;
        }

        currentPatient.setFirstName(firstName);
        currentPatient.setLastName(lastName);
        currentPatient.setBirthDate(birthDate);
        currentPatient.setPhone(phoneInput.getText().toString().trim());
        currentPatient.setEmail(emailInput.getText().toString().trim());
        currentPatient.setAddress(addressInput.getText().toString().trim());

        ApiClient.getApiService().updatePatient(patientId, currentPatient).enqueue(new Callback<Patient>() {
            @Override
            public void onResponse(Call<Patient> call, Response<Patient> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(ProfileActivity.this, "Профіль оновлено", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(ProfileActivity.this, "Не вдалося оновити профіль", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Patient> call, Throwable t) {
                Toast.makeText(ProfileActivity.this, "Помилка підключення до сервера", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showDatePicker() {
        Calendar calendar = Calendar.getInstance();

        DatePickerDialog dialog = new DatePickerDialog(
                this,
                (view, year, month, dayOfMonth) -> {
                    int realMonth = month + 1;
                    String date = year + "-" +
                            (realMonth < 10 ? "0" + realMonth : realMonth) + "-" +
                            (dayOfMonth < 10 ? "0" + dayOfMonth : dayOfMonth);
                    birthDateInput.setText(date);
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
        );

        dialog.show();
    }
}