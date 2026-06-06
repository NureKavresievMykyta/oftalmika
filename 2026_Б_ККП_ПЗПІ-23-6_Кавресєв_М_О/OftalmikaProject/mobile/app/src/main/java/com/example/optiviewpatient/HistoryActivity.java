package com.example.optiviewpatient;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Bundle;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.example.optiviewpatient.api.ApiClient;
import com.example.optiviewpatient.models.Visit;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HistoryActivity extends Activity {

    private LinearLayout historyContainer;
    private TextView emptyHistoryText;
    private Button backButton;
    private Long patientId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_history);

        historyContainer = findViewById(R.id.historyContainer);
        emptyHistoryText = findViewById(R.id.emptyHistoryText);
        backButton = findViewById(R.id.backButton);

        SharedPreferences preferences = getSharedPreferences("oftalmika_session", MODE_PRIVATE);
        patientId = preferences.getLong("patientId", -1);

        backButton.setOnClickListener(view -> finish());

        loadVisits();
    }

    private void loadVisits() {
        ApiClient.getApiService().getVisits().enqueue(new Callback<List<Visit>>() {
            @Override
            public void onResponse(Call<List<Visit>> call, Response<List<Visit>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    showVisits(response.body());
                } else {
                    emptyHistoryText.setText("Не вдалося завантажити історію обстежень");
                }
            }

            @Override
            public void onFailure(Call<List<Visit>> call, Throwable t) {
                emptyHistoryText.setText("Помилка підключення до сервера");
            }
        });
    }

    private void showVisits(List<Visit> visits) {
        int count = 0;

        for (Visit visit : visits) {
            if (visit.getPatientId() == null) {
                continue;
            }

            if (!visit.getPatientId().equals(patientId)) {
                continue;
            }

            if (!"COMPLETED".equals(visit.getVisitStatus())) {
                continue;
            }

            count++;
            addVisitCard(visit);
        }

        if (count == 0) {
            emptyHistoryText.setText("Завершені обстеження для цього пацієнта поки відсутні");
        } else {
            emptyHistoryText.setText("");
        }
    }

    private void addVisitCard(Visit visit) {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(18), dp(18), dp(18), dp(18));
        card.setBackgroundColor(Color.WHITE);

        LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        cardParams.setMargins(0, 0, 0, dp(18));
        card.setLayoutParams(cardParams);

        TextView title = new TextView(this);
        title.setText("Обстеження від " + formatDateTime(visit.getStartTime()));
        title.setTextSize(20);
        title.setTextColor(Color.parseColor("#1E5AA8"));
        title.setPadding(0, 0, 0, dp(10));
        card.addView(title);

        addText(card, "Статус: " + translateStatus(visit.getVisitStatus()));
        addText(card, "Тип прийому: " + translateVisitType(visit.getVisitType()));
        addText(card, "Діагноз: " + safe(visit.getDiagnosis()));
        addText(card, "Лікування: " + safe(visit.getTreatment()));
        addText(card, "Гострота зору: " + safe(visit.getVisualAcuity()));

        Button prescriptionButton = new Button(this);
        prescriptionButton.setText("Переглянути рецепт");
        prescriptionButton.setTextColor(Color.WHITE);
        prescriptionButton.setTextSize(14);
        prescriptionButton.setAllCaps(false);
        prescriptionButton.setBackgroundTintList(ColorStateList.valueOf(Color.parseColor("#1E5AA8")));

        LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(54)
        );
        buttonParams.setMargins(0, dp(16), 0, 0);
        prescriptionButton.setLayoutParams(buttonParams);

        prescriptionButton.setOnClickListener(view -> {
            Intent intent = new Intent(HistoryActivity.this, PrescriptionDetailsActivity.class);
            intent.putExtra("visitId", visit.getVisitId());
            startActivity(intent);
        });

        card.addView(prescriptionButton);

        historyContainer.addView(card, historyContainer.getChildCount() - 1);
    }

    private void addText(LinearLayout card, String text) {
        TextView textView = new TextView(this);
        textView.setText(text);
        textView.setTextSize(15);
        textView.setTextColor(Color.parseColor("#374151"));
        textView.setPadding(0, dp(4), 0, dp(4));
        card.addView(textView);
    }

    private String translateStatus(String status) {
        if ("COMPLETED".equals(status)) {
            return "Завершено";
        }

        if ("PLANNED".equals(status)) {
            return "Заплановано";
        }

        if ("CANCELLED".equals(status)) {
            return "Скасовано";
        }

        return "не вказано";
    }

    private String translateVisitType(String type) {
        if ("CONSULTATION".equals(type)) {
            return "Консультація";
        }

        if ("EXAMINATION".equals(type)) {
            return "Обстеження";
        }

        if ("CONTROL".equals(type)) {
            return "Контрольний прийом";
        }

        return "Прийом";
    }

    private String safe(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "не вказано";
        }
        return value;
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