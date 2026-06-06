package com.example.optiviewpatient;

import android.app.Activity;
import android.app.DatePickerDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.example.optiviewpatient.api.ApiClient;
import com.example.optiviewpatient.models.AuthResponse;
import com.example.optiviewpatient.models.RegisterPatientRequest;

import java.util.Calendar;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends Activity {

    private EditText usernameInput;
    private EditText passwordInput;
    private EditText firstNameInput;
    private EditText lastNameInput;
    private EditText birthDateInput;
    private EditText phoneInput;
    private EditText emailInput;
    private EditText addressInput;
    private Button createAccountButton;
    private Button backToLoginButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        usernameInput = findViewById(R.id.usernameInput);
        passwordInput = findViewById(R.id.passwordInput);
        firstNameInput = findViewById(R.id.firstNameInput);
        lastNameInput = findViewById(R.id.lastNameInput);
        birthDateInput = findViewById(R.id.birthDateInput);
        phoneInput = findViewById(R.id.phoneInput);
        emailInput = findViewById(R.id.emailInput);
        addressInput = findViewById(R.id.addressInput);
        createAccountButton = findViewById(R.id.createAccountButton);
        backToLoginButton = findViewById(R.id.backToLoginButton);

        birthDateInput.setOnClickListener(view -> showDatePicker());

        createAccountButton.setOnClickListener(view -> registerPatient());

        backToLoginButton.setOnClickListener(view -> finish());
    }

    private void registerPatient() {
        String username = usernameInput.getText().toString().trim();
        String password = passwordInput.getText().toString().trim();
        String firstName = firstNameInput.getText().toString().trim();
        String lastName = lastNameInput.getText().toString().trim();
        String birthDate = birthDateInput.getText().toString().trim();
        String phone = phoneInput.getText().toString().trim();
        String email = emailInput.getText().toString().trim();
        String address = addressInput.getText().toString().trim();

        if (username.isEmpty() || password.isEmpty() || firstName.isEmpty() || lastName.isEmpty() || birthDate.isEmpty()) {
            Toast.makeText(this, "Заповніть обов'язкові поля", Toast.LENGTH_SHORT).show();
            return;
        }

        RegisterPatientRequest request = new RegisterPatientRequest(
                username,
                password,
                firstName,
                lastName,
                birthDate,
                phone,
                email,
                address
        );

        ApiClient.getApiService().registerPatient(request).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    AuthResponse authResponse = response.body();

                    SharedPreferences preferences = getSharedPreferences("oftalmika_session", MODE_PRIVATE);
                    SharedPreferences.Editor editor = preferences.edit();
                    editor.putLong("userId", authResponse.getUserId());
                    editor.putLong("patientId", authResponse.getPatientId());
                    editor.putString("username", authResponse.getUsername());
                    editor.putString("role", authResponse.getRole());
                    editor.apply();

                    Toast.makeText(RegisterActivity.this, "Акаунт створено", Toast.LENGTH_SHORT).show();

                    Intent intent = new Intent(RegisterActivity.this, HomeActivity.class);
                    startActivity(intent);
                    finish();
                } else {
                    Toast.makeText(RegisterActivity.this, "Не вдалося створити акаунт", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                Toast.makeText(RegisterActivity.this, "Помилка підключення до сервера", Toast.LENGTH_SHORT).show();
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