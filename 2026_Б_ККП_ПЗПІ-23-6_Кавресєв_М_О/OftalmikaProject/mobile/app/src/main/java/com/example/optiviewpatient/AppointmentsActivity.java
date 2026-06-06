package com.example.optiviewpatient;

import android.app.Activity;
import android.app.DatePickerDialog;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.example.optiviewpatient.api.ApiClient;
import com.example.optiviewpatient.models.AppointmentRequest;
import com.example.optiviewpatient.models.AppointmentSlot;
import com.example.optiviewpatient.models.Doctor;
import com.example.optiviewpatient.models.Visit;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AppointmentsActivity extends Activity {

    private LinearLayout appointmentsContainer;
    private TextView emptyAppointmentsText;
    private Spinner doctorSpinner;
    private Spinner timeSlotSpinner;
    private EditText dateInput;
    private Button bookButton;
    private Button backButton;
    private Long patientId;
    private List<Doctor> doctors = new ArrayList<>();
    private List<AppointmentSlot> slots = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_appointments);

        appointmentsContainer = findViewById(R.id.appointmentsContainer);
        emptyAppointmentsText = findViewById(R.id.emptyAppointmentsText);
        doctorSpinner = findViewById(R.id.doctorSpinner);
        timeSlotSpinner = findViewById(R.id.timeSlotSpinner);
        dateInput = findViewById(R.id.dateInput);
        bookButton = findViewById(R.id.bookButton);
        backButton = findViewById(R.id.backButton);

        SharedPreferences preferences = getSharedPreferences("oftalmika_session", MODE_PRIVATE);
        patientId = preferences.getLong("patientId", -1);

        dateInput.setOnClickListener(view -> showDatePicker());
        bookButton.setOnClickListener(view -> bookAppointment());
        backButton.setOnClickListener(view -> finish());

        doctorSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                loadSlotsIfPossible();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
            }
        });

        setEmptySlots();

        loadDoctors();
        loadAppointments();
    }

    private void loadDoctors() {
        ApiClient.getApiService().getDoctors().enqueue(new Callback<List<Doctor>>() {
            @Override
            public void onResponse(Call<List<Doctor>> call, Response<List<Doctor>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    doctors = response.body();

                    List<String> doctorNames = new ArrayList<>();

                    for (Doctor doctor : doctors) {
                        doctorNames.add(
                                safe(doctor.getFirstName()) + " " +
                                        safe(doctor.getLastName()) + " - " +
                                        safe(doctor.getSpecialization())
                        );
                    }

                    if (doctorNames.isEmpty()) {
                        doctorNames.add("Лікарів не знайдено");
                    }

                    ArrayAdapter<String> adapter = new ArrayAdapter<>(
                            AppointmentsActivity.this,
                            android.R.layout.simple_spinner_item,
                            doctorNames
                    );

                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                    doctorSpinner.setAdapter(adapter);

                    loadSlotsIfPossible();
                } else {
                    Toast.makeText(AppointmentsActivity.this, "Не вдалося завантажити лікарів", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Doctor>> call, Throwable t) {
                Toast.makeText(AppointmentsActivity.this, "Помилка підключення до сервера", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadAppointments() {
        if (patientId == null || patientId == -1) {
            emptyAppointmentsText.setText("Пацієнта не знайдено");
            return;
        }

        ApiClient.getApiService().getPatientAppointments(patientId).enqueue(new Callback<List<Visit>>() {
            @Override
            public void onResponse(Call<List<Visit>> call, Response<List<Visit>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    showAppointments(response.body());
                } else {
                    emptyAppointmentsText.setText("Не вдалося завантажити записи");
                }
            }

            @Override
            public void onFailure(Call<List<Visit>> call, Throwable t) {
                emptyAppointmentsText.setText("Помилка підключення до сервера");
            }
        });
    }

    private void loadSlotsIfPossible() {
        String date = dateInput.getText().toString().trim();

        if (date.isEmpty() || doctors.isEmpty()) {
            setEmptySlots();
            return;
        }

        int selectedPosition = doctorSpinner.getSelectedItemPosition();

        if (selectedPosition < 0 || selectedPosition >= doctors.size()) {
            setEmptySlots();
            return;
        }

        Doctor selectedDoctor = doctors.get(selectedPosition);

        ApiClient.getApiService().getAvailableSlots(selectedDoctor.getDoctorUserId(), date).enqueue(new Callback<List<AppointmentSlot>>() {
            @Override
            public void onResponse(Call<List<AppointmentSlot>> call, Response<List<AppointmentSlot>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    slots = response.body();
                    showSlots();
                } else {
                    Toast.makeText(AppointmentsActivity.this, "Не вдалося завантажити доступний час", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<AppointmentSlot>> call, Throwable t) {
                Toast.makeText(AppointmentsActivity.this, "Помилка підключення до сервера", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setEmptySlots() {
        slots = new ArrayList<>();
        List<String> empty = new ArrayList<>();
        empty.add("Спочатку оберіть лікаря і дату");

        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_item,
                empty
        );

        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        timeSlotSpinner.setAdapter(adapter);
    }

    private void showSlots() {
        ArrayAdapter<AppointmentSlot> adapter = new ArrayAdapter<AppointmentSlot>(
                this,
                android.R.layout.simple_spinner_item,
                slots
        ) {
            @Override
            public boolean isEnabled(int position) {
                return slots.get(position).isAvailable();
            }

            @Override
            public View getDropDownView(int position, View convertView, ViewGroup parent) {
                View view = super.getDropDownView(position, convertView, parent);
                TextView textView = (TextView) view;

                if (slots.get(position).isAvailable()) {
                    textView.setTextColor(Color.parseColor("#111827"));
                } else {
                    textView.setTextColor(Color.parseColor("#9CA3AF"));
                }

                return view;
            }

            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                View view = super.getView(position, convertView, parent);
                TextView textView = (TextView) view;

                if (!slots.isEmpty() && !slots.get(position).isAvailable()) {
                    textView.setTextColor(Color.parseColor("#9CA3AF"));
                } else {
                    textView.setTextColor(Color.parseColor("#111827"));
                }

                return view;
            }
        };

        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        timeSlotSpinner.setAdapter(adapter);
    }

    private void showAppointments(List<Visit> visits) {
        removeOldCards();

        if (visits.isEmpty()) {
            emptyAppointmentsText.setText("Майбутніх записів поки немає");
            return;
        }

        emptyAppointmentsText.setText("");

        for (Visit visit : visits) {
            addAppointmentCard(visit);
        }
    }

    private void removeOldCards() {
        for (int i = appointmentsContainer.getChildCount() - 1; i >= 0; i--) {
            if ("appointment_card".equals(appointmentsContainer.getChildAt(i).getTag())) {
                appointmentsContainer.removeViewAt(i);
            }
        }
    }

    private void addAppointmentCard(Visit visit) {
        LinearLayout card = new LinearLayout(this);
        card.setTag("appointment_card");
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(18, 18, 18, 18);
        card.setBackgroundColor(Color.WHITE);

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 18);
        card.setLayoutParams(params);

        TextView title = new TextView(this);
        title.setText("Запис до лікаря");
        title.setTextSize(20);
        title.setTextColor(Color.parseColor("#1E5AA8"));
        title.setPadding(0, 0, 0, 10);
        card.addView(title);

        addText(card, "Дата і час: " + formatDateTime(visit.getStartTime()));
        addText(card, "Статус: " + translateStatus(visit.getVisitStatus()));
        addText(card, "Тип: " + translateVisitType(visit.getVisitType()));

        Doctor doctor = findDoctorById(visit.getDoctorId());

        if (doctor != null) {
            addText(card, "Лікар: " + safe(doctor.getFirstName()) + " " + safe(doctor.getLastName()));
            addText(card, "Спеціалізація: " + safe(doctor.getSpecialization()));
            addText(card, "Кабінет: " + safe(doctor.getCabinetNumber()));
        } else {
            addText(card, "Лікар: не вказано");
        }

        appointmentsContainer.addView(card, appointmentsContainer.getChildCount() - 1);
    }

    private void bookAppointment() {
        if (patientId == null || patientId == -1) {
            Toast.makeText(this, "Пацієнта не знайдено", Toast.LENGTH_SHORT).show();
            return;
        }

        if (doctors.isEmpty()) {
            Toast.makeText(this, "Список лікарів порожній", Toast.LENGTH_SHORT).show();
            return;
        }

        String date = dateInput.getText().toString().trim();

        if (date.isEmpty()) {
            Toast.makeText(this, "Оберіть дату", Toast.LENGTH_SHORT).show();
            return;
        }

        int selectedDoctorPosition = doctorSpinner.getSelectedItemPosition();

        if (selectedDoctorPosition < 0 || selectedDoctorPosition >= doctors.size()) {
            Toast.makeText(this, "Оберіть лікаря", Toast.LENGTH_SHORT).show();
            return;
        }

        int selectedSlotPosition = timeSlotSpinner.getSelectedItemPosition();

        if (selectedSlotPosition < 0 || selectedSlotPosition >= slots.size()) {
            Toast.makeText(this, "Оберіть доступний час", Toast.LENGTH_SHORT).show();
            return;
        }

        AppointmentSlot selectedSlot = slots.get(selectedSlotPosition);

        if (!selectedSlot.isAvailable()) {
            Toast.makeText(this, "Цей час уже зайнятий", Toast.LENGTH_SHORT).show();
            return;
        }

        Doctor selectedDoctor = doctors.get(selectedDoctorPosition);
        String startTime = date + "T" + selectedSlot.getTime() + ":00";

        AppointmentRequest request = new AppointmentRequest(
                patientId,
                selectedDoctor.getDoctorUserId(),
                startTime,
                "CONSULTATION"
        );

        ApiClient.getApiService().bookAppointment(request).enqueue(new Callback<Visit>() {
            @Override
            public void onResponse(Call<Visit> call, Response<Visit> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(AppointmentsActivity.this, "Запис створено", Toast.LENGTH_SHORT).show();
                    dateInput.setText("");
                    setEmptySlots();
                    loadAppointments();
                } else {
                    Toast.makeText(AppointmentsActivity.this, "Обраний час уже зайнятий або недоступний", Toast.LENGTH_SHORT).show();
                    loadSlotsIfPossible();
                }
            }

            @Override
            public void onFailure(Call<Visit> call, Throwable t) {
                Toast.makeText(AppointmentsActivity.this, "Помилка підключення до сервера", Toast.LENGTH_SHORT).show();
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
                    dateInput.setText(date);
                    loadSlotsIfPossible();
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
        );

        dialog.show();
    }

    private Doctor findDoctorById(Long doctorId) {
        if (doctorId == null) {
            return null;
        }

        for (Doctor doctor : doctors) {
            if (doctor.getDoctorUserId() != null && doctor.getDoctorUserId().equals(doctorId)) {
                return doctor;
            }
        }

        return null;
    }

    private void addText(LinearLayout card, String text) {
        TextView textView = new TextView(this);
        textView.setText(text);
        textView.setTextSize(15);
        textView.setTextColor(Color.parseColor("#374151"));
        textView.setPadding(0, 4, 0, 4);
        card.addView(textView);
    }

    private String translateStatus(String status) {
        if ("PLANNED".equals(status)) {
            return "Заплановано";
        }

        if ("COMPLETED".equals(status)) {
            return "Завершено";
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
}