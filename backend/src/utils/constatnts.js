module.exports = {
  ROLES: {
    ADMIN: 'admin',
    USER: 'user'
  },
  
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  SERVICE_CATEGORY: {
    GARDEN: 'garden',
    BUILDING: 'building'
  },
  
  PRICING: {
    BUILDING: {
      PRICE_PER_FLOOR: 15.00,
      DEFAULT_DURATION: 3 // hours
    },
    GARDEN: {
      PRICE_0_5_KM: 250.00,
      PRICE_1_KM: 400.00,
      DEFAULT_DURATION: 8 // hours (full day)
    }
  }
};