package com.example.optiviewpatient;

import android.app.Activity;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.example.optiviewpatient.api.ApiClient;
import com.example.optiviewpatient.models.Prescription;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PrescriptionsActivity extends Activity {

    private LinearLayout prescriptionsContainer;
    private TextView emptyPrescriptionsText;
    private Button backButton;
    private Long patientId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_prescriptions);

        prescriptionsContainer = findViewById(R.id.prescriptionsContainer);
        emptyPrescriptionsText = findViewById(R.id.emptyPrescriptionsText);
        backButton = findViewById(R.id.backButton);

        SharedPreferences preferences = getSharedPreferences("oftalmika_session", MODE_PRIVATE);
        patientId = preferences.getLong("patientId", -1);

        backButton.setOnClickListener(view -> finish());

        loadPrescriptions();
    }

    private void loadPrescriptions() {
        if (patientId == null || patientId == -1) {
            emptyPrescriptionsText.setText("Пацієнта не знайдено");
            return;
        }

        ApiClient.getApiService().getPatientPrescriptions(patientId).enqueue(new Callback<List<Prescription>>() {
            @Override
            public void onResponse(Call<List<Prescription>> call, Response<List<Prescription>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    showPrescriptions(response.body());
                } else {
                    emptyPrescriptionsText.setText("Не вдалося завантажити рецепти");
                }
            }

            @Override
            public void onFailure(Call<List<Prescription>> call, Throwable t) {
                emptyPrescriptionsText.setText("Помилка підключення до сервера");
            }
        });
    }

    private void showPrescriptions(List<Prescription> prescriptions) {
        if (prescriptions.isEmpty()) {
            emptyPrescriptionsText.setText("Актуальних рецептів поки немає");
            return;
        }

        emptyPrescriptionsText.setText("");

        for (Prescription prescription : prescriptions) {
            addPrescriptionCard(prescription);
        }
    }

    private void addPrescriptionCard(Prescription prescription) {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(18), dp(18), dp(18), dp(18));
        card.setBackgroundColor(Color.WHITE);

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, dp(18));
        card.setLayoutParams(params);

        TextView title = new TextView(this);
        title.setText(safe(prescription.getPrescriptionType()));
        title.setTextSize(20);
        title.setTextColor(Color.parseColor("#1E5AA8"));
        title.setPadding(0, 0, 0, dp(10));
        card.addView(title);

        addText(card, "Оновлено: " + formatDateTime(firstNotEmpty(prescription.getUpdatedAt(), prescription.getCreatedAt())));

        addText(card, "Праве око OD");
        addText(card, "SPH - сфера правого ока: " + safeNumber(prescription.getSphOd()));
        addText(card, "CYL - циліндр правого ока: " + safeNumber(prescription.getCylOd()));
        addText(card, "AXIS - вісь правого ока: " + safeInteger(prescription.getAxisOd()));

        addText(card, "Ліве око OS");
        addText(card, "SPH - сфера лівого ока: " + safeNumber(prescription.getSphOs()));
        addText(card, "CYL - циліндр лівого ока: " + safeNumber(prescription.getCylOs()));
        addText(card, "AXIS - вісь лівого ока: " + safeInteger(prescription.getAxisOs()));

        addText(card, "PD - міжзінична відстань: " + safeInteger(prescription.getPd()));

        TextView note = new TextView(this);
        note.setText("Це актуальний рецепт пацієнта. Після повторного IoT-обстеження дані рецепта оновлюються за останнім результатом.");
        note.setTextSize(14);
        note.setTextColor(Color.parseColor("#6B7280"));
        note.setPadding(0, dp(12), 0, 0);
        card.addView(note);

        prescriptionsContainer.addView(card, prescriptionsContainer.getChildCount() - 1);
    }

    private void addText(LinearLayout card, String text) {
        TextView textView = new TextView(this);
        textView.setText(text);
        textView.setTextSize(15);
        textView.setTextColor(Color.parseColor("#374151"));
        textView.setPadding(0, dp(4), 0, dp(4));
        card.addView(textView);
    }

    private String firstNotEmpty(String first, String second) {
        if (first != null && !first.trim().isEmpty()) {
            return first;
        }

        return second;
    }

    private String safe(String value) {
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

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density);
    }
}