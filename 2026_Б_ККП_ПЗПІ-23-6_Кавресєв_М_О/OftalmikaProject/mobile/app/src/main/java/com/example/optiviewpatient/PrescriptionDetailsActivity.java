package com.example.optiviewpatient;

import android.app.Activity;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import com.example.optiviewpatient.api.ApiClient;
import com.example.optiviewpatient.models.Prescription;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PrescriptionDetailsActivity extends Activity {

    private TextView statusText;
    private TextView typeText;
    private TextView updatedAtText;
    private TextView sphOdText;
    private TextView cylOdText;
    private TextView axisOdText;
    private TextView sphOsText;
    private TextView cylOsText;
    private TextView axisOsText;
    private TextView pdText;
    private Button backButton;
    private Long visitId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_prescription_details);

        statusText = findViewById(R.id.statusText);
        typeText = findViewById(R.id.typeText);
        updatedAtText = findViewById(R.id.updatedAtText);
        sphOdText = findViewById(R.id.sphOdText);
        cylOdText = findViewById(R.id.cylOdText);
        axisOdText = findViewById(R.id.axisOdText);
        sphOsText = findViewById(R.id.sphOsText);
        cylOsText = findViewById(R.id.cylOsText);
        axisOsText = findViewById(R.id.axisOsText);
        pdText = findViewById(R.id.pdText);
        backButton = findViewById(R.id.backButton);

        visitId = getIntent().getLongExtra("visitId", -1);

        backButton.setOnClickListener(view -> finish());

        loadPrescription();
    }

    private void loadPrescription() {
        if (visitId == null || visitId == -1) {
            showNoPrescription();
            return;
        }

        ApiClient.getApiService().getPrescriptionByVisit(visitId).enqueue(new Callback<Prescription>() {
            @Override
            public void onResponse(Call<Prescription> call, Response<Prescription> response) {
                if (response.isSuccessful() && response.body() != null) {
                    showPrescription(response.body());
                } else {
                    showNoPrescription();
                }
            }

            @Override
            public void onFailure(Call<Prescription> call, Throwable t) {
                statusText.setText("Помилка підключення до сервера");
            }
        });
    }

    private void showPrescription(Prescription prescription) {
        statusText.setText("Рецепт сформовано після завершеного обстеження");
        typeText.setText(safeText(prescription.getPrescriptionType()));
        updatedAtText.setText("Оновлено: " + formatDateTime(firstNotEmpty(prescription.getUpdatedAt(), prescription.getCreatedAt())));

        sphOdText.setText("SPH - сфера правого ока: " + safeNumber(prescription.getSphOd()));
        cylOdText.setText("CYL - циліндр правого ока: " + safeNumber(prescription.getCylOd()));
        axisOdText.setText("AXIS - вісь правого ока: " + safeInteger(prescription.getAxisOd()));

        sphOsText.setText("SPH - сфера лівого ока: " + safeNumber(prescription.getSphOs()));
        cylOsText.setText("CYL - циліндр лівого ока: " + safeNumber(prescription.getCylOs()));
        axisOsText.setText("AXIS - вісь лівого ока: " + safeInteger(prescription.getAxisOs()));

        pdText.setText("PD - міжзінична відстань: " + safeInteger(prescription.getPd()));
    }

    private void showNoPrescription() {
        statusText.setText("Рецепт для цього прийому ще не сформовано");
        typeText.setText("Не вказано");
        updatedAtText.setText("Оновлено: не вказано");

        sphOdText.setText("SPH - сфера правого ока: не вказано");
        cylOdText.setText("CYL - циліндр правого ока: не вказано");
        axisOdText.setText("AXIS - вісь правого ока: не вказано");

        sphOsText.setText("SPH - сфера лівого ока: не вказано");
        cylOsText.setText("CYL - циліндр лівого ока: не вказано");
        axisOsText.setText("AXIS - вісь лівого ока: не вказано");

        pdText.setText("PD - міжзінична відстань: не вказано");
    }

    private String firstNotEmpty(String first, String second) {
        if (first != null && !first.trim().isEmpty()) {
            return first;
        }

        return second;
    }

    private String safeText(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "Рецепт";
        }

        return value;
    }

    private String safeNumber(Double value) {
        if (value == null) {
            return "не вказано";
        }

        return String.valueOf(value);
    }

    private String safeInteger(Integer value) {
        if (value == null) {
            return "не вказано";
        }

        return String.valueOf(value);
    }

    private String formatDateTime(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "не вказано";
        }

        return value.replace("T", " ");
    }
}