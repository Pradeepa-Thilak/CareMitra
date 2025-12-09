// kafka/topics.js
const TOPICS = {
  LAB_TEST_BOOKING: 'labtest-booking-events',
  DOCTOR_BOOKING: 'doctor-booking-events',
  PAYMENT_EVENTS: 'payment-events',
  NOTIFICATION_EVENTS: 'notification-events'
};

const EVENT_TYPES = {
  // Lab Test Events
  LAB_TEST_ORDER_CREATED: 'lab_test_order_created',
  LAB_TEST_PAYMENT_VERIFIED: 'lab_test_payment_verified',
  LAB_TEST_SAMPLE_COLLECTED: 'lab_test_sample_collected',
  LAB_TEST_REPORT_UPLOADED: 'lab_test_report_uploaded',
  LAB_ORDER_ASSIGNMENT_FAILED: 'lab_order_assignment_failed',
  LAB_ORDER_AUTO_ASSIGNED: 'lab_order_auto_assigned',
  LAB_ORDER_MANUALLY_ASSIGNED: 'lab_order_manually_assigned',
  LAB_ORDER_ASSIGNMENT_ERROR: 'lab_order_assignment_error',
  LAB_STAFF_CREATED: 'lab_staff_created',
  LAB_STAFF_UPDATED: 'lab_staff_updated',
  LAB_STAFF_STATUS_UPDATED: 'lab_staff_status_updated',
  
  // Doctor Booking Events
  DOCTOR_APPOINTMENT_BOOKED: 'doctor_appointment_booked',
  DOCTOR_APPOINTMENT_CANCELLED: 'doctor_appointment_cancelled',
  DOCTOR_APPOINTMENT_RESCHEDULED: 'doctor_appointment_rescheduled',
  
  // Payment Events
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_REFUNDED: 'payment_refunded'
};

module.exports = { TOPICS, EVENT_TYPES };