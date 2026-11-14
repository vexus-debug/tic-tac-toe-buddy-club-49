export type WorkflowType = "booking_confirmation" | "appointment_reminder" | "payment_receipt" | "hygiene_recall";
export type Channel = "sms" | "email";

/** Default SMS copy: GSM-7 only, no links, clinic phone as the call to action. */
export const DEFAULT_SMS_TEMPLATES: Record<WorkflowType, string> = {
  booking_confirmation:
    "[{clinic_name}]: Hi {patient_name}, your appointment is confirmed for {appointment_date} at {appointment_time} with {doctor_name}. To reschedule or ask questions, call {clinic_phone}.",
  appointment_reminder:
    "[{clinic_name}]: Hi {patient_name}, reminder for your dental visit tomorrow at {appointment_time}. Please arrive 10 mins early. Need help? Call our desk on {clinic_phone}.",
  payment_receipt:
    "[{clinic_name}]: Payment of {amount} received for Inv #{receipt_number}. Balance: {balance}. Thank you! For billing questions, call our desk on {clinic_phone}.",
  hygiene_recall:
    "[{clinic_name}]: Hi {patient_name}, it has been 6 months since your last dental clean. Keep your smile healthy! Call us at {clinic_phone} to book your checkup.",
};

export const DEFAULT_EMAIL_SUBJECTS: Record<WorkflowType, string> = {
  booking_confirmation: "Your appointment at {clinic_name} is confirmed",
  appointment_reminder: "Reminder: your visit to {clinic_name} tomorrow",
  payment_receipt: "Payment receipt for Inv #{receipt_number} from {clinic_name}",
  hygiene_recall: "Time for your dental check-up at {clinic_name}",
};
