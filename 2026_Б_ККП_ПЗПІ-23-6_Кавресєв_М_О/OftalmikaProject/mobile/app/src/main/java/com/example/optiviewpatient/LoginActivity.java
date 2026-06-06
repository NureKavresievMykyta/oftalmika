package com.example.optiviewpatient;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.example.optiviewpatient.api.ApiClient;
import com.example.optiviewpatient.models.AuthResponse;
import com.example.optiviewpatient.models.LoginRequest;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends Activity {

    private EditText loginInput;
    private EditText passwordInput;
    private TextView errorText;
    private Button loginButton;
    private Button registerButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        loginInput = findViewById(R.id.loginInput);
        passwordInput = findViewById(R.id.passwordInput);
        errorText = findViewById(R.id.errorText);
        loginButton = findViewById(R.id.loginButton);
        registerButton = findViewById(R.id.registerButton);

        loginButton.setOnClickListener(view -> loginPatient());

        registerButton.setOnClickListener(view -> {
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            startActivity(intent);
        });
    }

    private void loginPatient() {
        String username = loginInput.getText().toString().trim();
        String password = passwordInput.getText().toString().trim();

        if (username.isEmpty() || password.isEmpty()) {
            errorText.setText("Введіть логін і пароль");
            return;
        }

        LoginRequest request = new LoginRequest(username, password);

        ApiClient.getApiService().login(request).enqueue(new Callback<AuthResponse>() {
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

                    Intent intent = new Intent(LoginActivity.this, HomeActivity.class);
                    startActivity(intent);
                    finish();
                } else {
                    errorText.setText("Невірний логін або пароль");
                }
            }

            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                errorText.setText("Помилка підключення до сервера");
            }
        });
    }
}