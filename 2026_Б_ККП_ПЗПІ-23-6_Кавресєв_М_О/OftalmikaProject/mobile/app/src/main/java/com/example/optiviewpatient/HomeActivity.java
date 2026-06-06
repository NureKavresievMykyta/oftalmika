package com.example.optiviewpatient;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.example.optiviewpatient.api.ApiClient;
import com.example.optiviewpatient.models.Patient;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeActivity extends Activity {

    private TextView welcomeText;
    private Button historyButton;
    private Button prescriptionsButton;
    private Button appointmentsButton;
    private Button profileButton;
    private Button logoutButton;
    private Long patientId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        welcomeText = findViewById(R.id.welcomeText);
        historyButton = findViewById(R.id.historyButton);
        prescriptionsButton = findViewById(R.id.prescriptionsButton);
        appointmentsButton = findViewById(R.id.appointmentsButton);
        profileButton = findViewById(R.id.profileButton);
        logoutButton = findViewById(R.id.logoutButton);

        SharedPreferences preferences = getSharedPreferences("oftalmika_session", MODE_PRIVATE);
        patientId = preferences.getLong("patientId", -1);

        loadPatientName();

        historyButton.setOnClickListener(view -> {
            Intent intent = new Intent(HomeActivity.this, HistoryActivity.class);
            startActivity(intent);
        });

        prescriptionsButton.setOnClickListener(view -> {
            Intent intent = new Intent(HomeActivity.this, PrescriptionsActivity.class);
            startActivity(intent);
        });

        appointmentsButton.setOnClickListener(view -> {
            Intent intent = new Intent(HomeActivity.this, AppointmentsActivity.class);
            startActivity(intent);
        });

        profileButton.setOnClickListener(view -> {
            Intent intent = new Intent(HomeActivity.this, ProfileActivity.class);
            startActivity(intent);
        });

        logoutButton.setOnClickListener(view -> {
            SharedPreferences.Editor editor = preferences.edit();
            editor.clear();
            editor.apply();

            Intent intent = new Intent(HomeActivity.this, LoginActivity.class);
            startActivity(intent);
            finish();
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadPatientName();
    }

    private void loadPatientName() {
        if (patientId == null || patientId == -1) {
            welcomeText.setText("Вітаємо!");
            return;
        }

        ApiClient.getApiService().getPatientById(patientId).enqueue(new Callback<Patient>() {
            @Override
            public void onResponse(Call<Patient> call, Response<Patient> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Patient patient = response.body();
                    welcomeText.setText("Вітаємо, " + patient.getFirstName() + "!");
                } else {
                    welcomeText.setText("Вітаємо!");
                }
            }

            @Override
            public void onFailure(Call<Patient> call, Throwable t) {
                welcomeText.setText("Вітаємо!");
            }
        });
    }
}