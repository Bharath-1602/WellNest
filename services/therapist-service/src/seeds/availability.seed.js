const axios = require('axios');
const TherapistAvailability = require('../models/TherapistAvailability');

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

const weekdaySlots = ['09:00', '09:50', '10:40', '11:30', '14:00', '14:50', '15:40', '16:30'];
const saturdaySlots = ['10:00', '10:50', '11:40'];

const defaultSchedule = {
  monday: { isAvailable: true, timeSlots: weekdaySlots },
  tuesday: { isAvailable: true, timeSlots: weekdaySlots },
  wednesday: { isAvailable: true, timeSlots: weekdaySlots },
  thursday: { isAvailable: true, timeSlots: weekdaySlots },
  friday: { isAvailable: true, timeSlots: weekdaySlots },
  saturday: { isAvailable: true, timeSlots: saturdaySlots },
  sunday: { isAvailable: false, timeSlots: [] }
};

const seedAvailability = async () => {
  try {
    const { data } = await axios.get(`${AUTH_SERVICE}/api/auth/internal/therapists`, {
      headers: { 'X-Internal-Service': 'therapist-service' }
    });

    const therapists = data.data;
    if (!therapists || therapists.length === 0) {
      console.log('No therapists found for availability seed.');
      return;
    }

    for (const therapist of therapists) {
      const exists = await TherapistAvailability.findOne({ therapistId: therapist._id });
      if (!exists) {
        await TherapistAvailability.create({
          therapistId: therapist._id,
          weeklySchedule: defaultSchedule,
          blockedDates: []
        });
        console.log(`Seeded availability for: ${therapist.name}`);
      }
    }

    console.log('Availability seed complete.');
  } catch (error) {
    console.error('Availability seed error:', error.message);
    console.log('Will retry availability seed on next restart.');
  }
};

module.exports = { seedAvailability };
