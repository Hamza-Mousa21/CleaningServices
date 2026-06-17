import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, ProgressBar, Badge, Spinner } from "react-bootstrap";
import "./Booking.css";

const API_CONFIG = {
  baseURL: "http://localhost:5000",
  prefix: "/api",
  get apiUrl() {
    return `${this.baseURL}${this.prefix}`;
  },
  endpoints: {
    availability: "/availability",
    availableSlots: (date) => `/availability/available/${date}`,
    bookings: "/bookings",
    serviceTypes: "/service-types",
    bookedSlots: (date) => `/availability/booked/${date}`,
  },
  getUrl: function(endpoint) {
    return `${this.apiUrl}${endpoint}`;
  }
};

function Booking() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [formData, setFormData] = useState({
    serviceTypeId: "",
    serviceCategory: "",
    date: "",
    startTime: "",
    phoneNumber: "",
    address: "",
    gardenSize: "",
    floors: "",
    additionalNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookedSlots, setBookedSlots] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const totalSteps = 3;

  // Fetch service types on mount
  useEffect(() => {
    fetchServiceTypes();
  }, []);

  // Fetch booked slots when month changes
  useEffect(() => {
    fetchBookedSlotsForMonth();
  }, [currentMonth]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (formData.date) {
      fetchAvailableSlots(formData.date);
    }
  }, [formData.date]);

  // Fetch service types from backend
  const fetchServiceTypes = async () => {
    setLoadingServices(true);
    try {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.serviceTypes);
      console.log("Fetching service types from:", url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log("Service types response:", data);
      
      if (response.ok) {
        setServiceTypes(data.data.serviceTypes || []);
      } else {
        console.error("Failed to fetch service types:", data);
        setServiceTypes([]);
      }
    } catch (error) {
      console.error("Error fetching service types:", error);
      setServiceTypes([]);
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch booked slots for the current month from backend
  const fetchBookedSlotsForMonth = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-${new Date(year, currentMonth.getMonth() + 1, 0).getDate()}`;
      
      // Fetch booked slots for the date range
      const url = `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.availability}/range?startDate=${startDate}&endDate=${endDate}`;
      console.log("Fetching booked slots from:", url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        // Transform the data to match our expected format
        const slotsMap = {};
        if (data.data) {
          Object.keys(data.data).forEach(date => {
            slotsMap[date] = data.data[date]
              .filter(slot => slot.isBooked)
              .map(slot => slot.startTime);
          });
        }
        setBookedSlots(slotsMap);
      } else {
        console.error("Failed to fetch booked slots:", data);
        setBookedSlots({});
      }
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      setBookedSlots({});
    }
  };

  // Fetch available slots for a specific date from backend
  const fetchAvailableSlots = async (date) => {
    setIsLoadingSlots(true);
    try {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.availableSlots(date));
      console.log("Fetching available slots from:", url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log("Available slots response:", data);
      
      if (response.ok && data.data) {
        // Extract start times from available slots
        const available = data.data.availableSlots.map(slot => slot.startTime);
        setAvailableTimes(available);
      } else {
        console.error("Failed to fetch available slots:", data);
        setAvailableTimes([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableTimes([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.serviceTypeId) newErrors.serviceTypeId = "Please select a service type";
      if (!formData.date) newErrors.date = "Please select a date";
      if (!formData.startTime) newErrors.startTime = "Please select a start time";
    }
    if (step === 2) {
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!/^[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
        newErrors.phoneNumber = "Please enter a valid phone number (10-15 digits)";
      }
      if (!formData.address) newErrors.address = "Address is required";
    }
    if (step === 3) {
      if (formData.serviceCategory === "garden" && !formData.gardenSize)
        newErrors.gardenSize = "Please enter the garden size";
      if (formData.serviceCategory === "building" && !formData.floors)
        newErrors.floors = "Please enter the number of floors";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      setIsSubmitting(false);
      navigate("/login");
      return;
    }

    try {
      const bookingData = {
        serviceTypeId: parseInt(formData.serviceTypeId),
        bookingDate: formData.date,
        startTime: formData.startTime,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        specialInstructions: formData.additionalNotes || null,
      };

      if (formData.serviceCategory === "garden") {
        bookingData.gardenSizeKm = parseFloat(formData.gardenSize);
      } else if (formData.serviceCategory === "building") {
        bookingData.numFloors = parseInt(formData.floors);
      }

      console.log("Submitting booking:", bookingData);

      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.bookings);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Booking failed");

      setShowSuccess(true);
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.message || "Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 20; hour++) {
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour;
      slots.push(`${displayHour}:00 ${ampm}`);
      if (hour !== 20) slots.push(`${displayHour}:30 ${ampm}`);
    }
    return slots;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const isDateBooked = (date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return bookedSlots[dateStr] && bookedSlots[dateStr].length > 0;
  };

  const isDateFullyBooked = (date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    const booked = bookedSlots[dateStr] || [];
    return booked.length >= generateTimeSlots().length;
  };

  const isDateSelected = (date) => {
    if (!date) return false;
    return formData.date === date.toISOString().split('T')[0];
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || isDateFullyBooked(date);
  };

  const handleDateSelect = (date) => {
    if (!date || isDateDisabled(date)) return;
    const dateStr = date.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: dateStr, startTime: "" }));
  };

  const changeMonth = (increment) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + increment);
      return newDate;
    });
  };

  const getBookingStatus = (date) => {
    if (!date) return null;
    if (isDateFullyBooked(date)) return 'full';
    if (isDateBooked(date)) return 'partial';
    return 'available';
  };

  const getAvailableSlotsCount = (date) => {
    if (!date) return 0;
    const dateStr = date.toISOString().split('T')[0];
    const booked = bookedSlots[dateStr] || [];
    return generateTimeSlots().length - booked.length;
  };

  const today = new Date().toISOString().split("T")[0];

  const renderStep = () => {
    switch(currentStep) {
      case 1: return renderServiceStep();
      case 2: return renderContactStep();
      case 3: return renderDetailsStep();
      default: return null;
    }
  };

  const renderServiceStep = () => (
    <div className="step-content fade-in">
      <div className="step-header">
        <h3 className="step-title">
          <span className="step-icon">📅</span>
          When do you need our service?
        </h3>
      </div>

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Select Service Type *</Form.Label>
        <Row>
          {loadingServices ? (
            <div className="text-center py-4 w-100">
              <Spinner animation="border" variant="success" />
              <p className="mt-2 text-muted">Loading service types...</p>
            </div>
          ) : serviceTypes.length > 0 ? (
            serviceTypes.map((service) => (
              <Col md={6} key={service.serviceTypeId} className="mb-3 mb-md-0">
                <div
                  className={`service-card ${formData.serviceTypeId == service.serviceTypeId ? "active" : ""}`}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      serviceTypeId: service.serviceTypeId,
                      serviceCategory: service.category
                    }));
                  }}
                >
                  <div className="service-icon">{service.category === "garden" ? "🌿" : "🏢"}</div>
                  <h5 className="service-name">{service.serviceName}</h5>
                  <p className="service-desc">
                    {service.description || (service.category === "garden" ? "Landscaping & Maintenance" : "Construction & Renovation")}
                  </p>
                  {formData.serviceTypeId == service.serviceTypeId && (
                    <div className="service-check">✓</div>
                  )}
                </div>
              </Col>
            ))
          ) : (
            <div className="text-center py-4 w-100">
              <p className="text-danger">No service types found. Please try again later.</p>
            </div>
          )}
        </Row>
        {errors.serviceTypeId && (
          <Form.Text className="text-danger d-block mt-2">{errors.serviceTypeId}</Form.Text>
        )}
      </Form.Group>

      <Row>
        <Col lg={7}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">📅 Select Date *</Form.Label>
            <div className="calendar-container">
              <div className="calendar-header">
                <Button variant="outline-secondary" size="sm" onClick={() => changeMonth(-1)} className="calendar-nav">‹</Button>
                <span className="calendar-month">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <Button variant="outline-secondary" size="sm" onClick={() => changeMonth(1)} className="calendar-nav">›</Button>
              </div>

              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-weekday">{day}</div>
                ))}
                {getDaysInMonth(currentMonth).map((date, index) => {
                  if (!date) return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                  const dateStr = date.toISOString().split('T')[0];
                  const isToday = dateStr === today;
                  const isSelected = isDateSelected(date);
                  const isDisabled = isDateDisabled(date);
                  const status = getBookingStatus(date);
                  const availableSlots = getAvailableSlotsCount(date);
                  return (
                    <div
                      key={dateStr}
                      className={`calendar-day ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${status === 'partial' ? 'partial' : ''} ${status === 'full' ? 'full' : ''} ${isToday ? 'today' : ''}`}
                      onClick={() => handleDateSelect(date)}
                    >
                      <span className="day-number">{date.getDate()}</span>
                      {status === 'partial' && <Badge bg="warning" className="availability-badge">{availableSlots} slots</Badge>}
                      {status === 'full' && <Badge bg="danger" className="availability-badge">Full</Badge>}
                      {status === 'available' && !isDisabled && <Badge bg="success" className="availability-badge">Available</Badge>}
                    </div>
                  );
                })}
              </div>

              <div className="calendar-legend">
                <span><span className="legend-dot available"></span> Available</span>
                <span><span className="legend-dot partial"></span> Limited</span>
                <span><span className="legend-dot full"></span> Fully Booked</span>
                <span><span className="legend-dot selected"></span> Selected</span>
              </div>
            </div>
            {errors.date && <Form.Text className="text-danger d-block mt-2">{errors.date}</Form.Text>}
          </Form.Group>
        </Col>

        <Col lg={5}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">🕐 Select Start Time *</Form.Label>
            {formData.date ? (
              isLoadingSlots ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="success" />
                  <p className="mt-2 text-muted">Loading available slots...</p>
                </div>
              ) : availableTimes.length > 0 ? (
                <div className="time-slots-container">
                  <div className="time-slots-grid">
                    {availableTimes.map((time) => (
                      <div
                        key={time}
                        className={`time-slot ${formData.startTime === time ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, startTime: time }))}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                  <div className="time-slots-info">
                    <small className="text-muted">{availableTimes.length} slots available on this day</small>
                  </div>
                </div>
              ) : (
                <Alert variant="danger">
                  <strong>No available slots!</strong> This day is fully booked. Please select another date.
                </Alert>
              )
            ) : (
              <Alert variant="info">Please select a date first to see available time slots.</Alert>
            )}
            {errors.startTime && <Form.Text className="text-danger d-block mt-2">{errors.startTime}</Form.Text>}
          </Form.Group>

          {formData.date && formData.startTime && (
            <Alert variant="success" className="mb-0">
              <strong>Selected:</strong> {formData.startTime} on {new Date(formData.date).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </Alert>
          )}
        </Col>
      </Row>
    </div>
  );

  const renderContactStep = () => (
    <div className="step-content fade-in">
      <div className="step-header">
        <h3 className="step-title"><span className="step-icon">👤</span> Your Contact Information</h3>
      </div>
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">📱 Phone Number *</Form.Label>
        <Form.Control
          type="tel" name="phoneNumber" value={formData.phoneNumber}
          onChange={handleChange} placeholder="Enter your phone number"
          isInvalid={!!errors.phoneNumber} size="lg"
        />
        <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">📍 Address *</Form.Label>
        <Form.Control
          type="text" name="address" value={formData.address}
          onChange={handleChange} placeholder="Enter your full address"
          isInvalid={!!errors.address} size="lg"
        />
        <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
      </Form.Group>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="step-content fade-in">
      <div className="step-header">
        <h3 className="step-title"><span className="step-icon">📋</span> Service Details</h3>
      </div>
      {formData.serviceCategory === "garden" && (
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">🌱 Garden Size (km) *</Form.Label>
          <Form.Control
            type="number" name="gardenSize" value={formData.gardenSize}
            onChange={handleChange} placeholder="e.g., 0.5" min="0.1" step="0.1"
            isInvalid={!!errors.gardenSize} size="lg"
          />
          <Form.Text className="text-muted">Pricing: 0.5km = 250 shekels, 1km = 400 shekels</Form.Text>
          <Form.Control.Feedback type="invalid">{errors.gardenSize}</Form.Control.Feedback>
        </Form.Group>
      )}
      {formData.serviceCategory === "building" && (
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">🏗️ Number of Floors *</Form.Label>
          <Form.Control
            type="number" name="floors" value={formData.floors}
            onChange={handleChange} placeholder="e.g., 5" min="1"
            isInvalid={!!errors.floors} size="lg"
          />
          <Form.Text className="text-muted">Pricing: 15 shekels per floor</Form.Text>
          <Form.Control.Feedback type="invalid">{errors.floors}</Form.Control.Feedback>
        </Form.Group>
      )}
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">📝 Additional Notes</Form.Label>
        <Form.Control
          as="textarea" rows={4} name="additionalNotes" value={formData.additionalNotes}
          onChange={handleChange} placeholder="Any special requirements or instructions..."
          style={{ resize: "vertical" }}
        />
      </Form.Group>
    </div>
  );

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <Card className="booking-card shadow-lg border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h1 className="display-4 fw-bold" style={{ color: "#0e4311" }}>Book Our Service</h1>
                <p className="text-muted lead">Complete your booking in 3 simple steps</p>
              </div>

              <div className="mb-4">
                <ProgressBar now={(currentStep / totalSteps) * 100} className="custom-progress" style={{ height: "8px" }} />
                <div className="d-flex justify-content-between mt-2 px-1">
                  <small className={`step-label ${currentStep >= 1 ? 'active' : ''}`}>① Service & Time</small>
                  <small className={`step-label ${currentStep >= 2 ? 'active' : ''}`}>② Contact Info</small>
                  <small className={`step-label ${currentStep >= 3 ? 'active' : ''}`}>③ Details</small>
                </div>
              </div>

              <div className="step-indicators mb-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`step-dot ${currentStep >= step ? 'active' : ''}`} onClick={() => setCurrentStep(step)}>
                    {currentStep > step ? '✓' : step}
                  </div>
                ))}
              </div>

              {showSuccess && (
                <Alert variant="success" className="text-center py-4 success-alert">
                  <div className="success-icon">✅</div>
                  <h4 className="mt-2">Booking Submitted Successfully!</h4>
                  <p className="mb-0">We will contact you shortly to confirm your booking.</p>
                </Alert>
              )}

              {!showSuccess && (
                <Form onSubmit={handleSubmit}>
                  {renderStep()}
                  <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                    <Button variant="outline-secondary" onClick={prevStep} disabled={currentStep === 1} className="px-4 py-2">
                      ← Back
                    </Button>
                    {currentStep < totalSteps ? (
                      <Button variant="success" onClick={nextStep} className="px-4 py-2" style={{ backgroundColor: "#0e4311", borderColor: "#0e4311" }}>
                        Next →
                      </Button>
                    ) : (
                      <Button type="submit" variant="success" disabled={isSubmitting} className="px-5 py-2" style={{ backgroundColor: "#0e4311", borderColor: "#0e4311" }}>
                        {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</> : '✓ Confirm Booking'}
                      </Button>
                    )}
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Booking;