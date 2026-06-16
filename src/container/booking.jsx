import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, ProgressBar, Badge } from "react-bootstrap";
import "./Booking.css";

function Booking() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceType: "",
    date: "",
    startTime: "",
    phoneNumber: "",
    address: "",
    gardenSize: "",
    gardenType: "residential",
    hasIrrigation: false,
    hasLighting: false,
    hasFencing: false,
    floors: "",
    buildingType: "residential",
    hasElevator: false,
    hasParking: false,
    additionalNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookedSlots, setBookedSlots] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);

  const totalSteps = 3;

  // Simulated booked slots data
  useEffect(() => {
    // In a real app, this would come from an API
    const mockBookedSlots = {
      '2026-06-20': ['09:00 AM', '10:00 AM', '02:00 PM'],
      '2026-06-21': ['08:00 AM', '01:00 PM', '03:00 PM'],
      '2026-06-22': ['11:00 AM', '04:00 PM'],
      '2026-06-23': ['09:30 AM', '12:00 PM'],
      '2026-06-25': ['10:00 AM', '02:30 PM'],
      '2026-06-27': ['08:00 AM', '09:00 AM', '10:00 AM'],
      '2026-06-28': ['01:00 PM', '02:00 PM', '03:00 PM'],
    };
    setBookedSlots(mockBookedSlots);
  }, []);

  // Update available times when date changes
  useEffect(() => {
    if (formData.date) {
      const booked = bookedSlots[formData.date] || [];
      const allSlots = generateTimeSlots();
      const available = allSlots.filter(time => !booked.includes(time));
      setAvailableTimes(available);
    }
  }, [formData.date, bookedSlots]);

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
      if (!formData.serviceType) {
        newErrors.serviceType = "Please select a service type";
      }
      if (!formData.date) {
        newErrors.date = "Please select a date";
      }
      if (!formData.startTime) {
        newErrors.startTime = "Please select a start time";
      }
    }
    
    if (step === 2) {
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!/^[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
        newErrors.phoneNumber = "Please enter a valid phone number (10-15 digits)";
      }
      if (!formData.address) {
        newErrors.address = "Address is required";
      }
    }

    if (step === 3) {
      if (formData.serviceType === "garden" && !formData.gardenSize) {
        newErrors.gardenSize = "Please enter the garden size";
      }
      if (formData.serviceType === "building" && !formData.floors) {
        newErrors.floors = "Please enter the number of floors";
      }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      console.log("Booking Data:", formData);
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }, 2000);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 20; hour++) {
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour;
      const timeStr = `${displayHour}:00 ${ampm}`;
      slots.push(timeStr);
      if (hour !== 20) {
        const halfHour = `${displayHour}:30 ${ampm}`;
        slots.push(halfHour);
      }
    }
    return slots;
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty days for padding
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
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
    const allSlots = generateTimeSlots();
    return booked.length >= allSlots.length;
  };

  const isDateSelected = (date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return formData.date === dateStr;
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
    setSelectedDate(date);
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
    const allSlots = generateTimeSlots();
    return allSlots.length - booked.length;
  };

  const today = new Date().toISOString().split("T")[0];

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return renderServiceStep();
      case 2:
        return renderContactStep();
      case 3:
        return renderDetailsStep();
      default:
        return null;
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
          <Col md={6} className="mb-3 mb-md-0">
            <div 
              className={`service-card ${formData.serviceType === "garden" ? "active" : ""}`}
              onClick={() => setFormData(prev => ({ ...prev, serviceType: "garden" }))}
            >
              <div className="service-icon">🌿</div>
              <h5 className="service-name">Garden Service</h5>
              <p className="service-desc">Landscaping & Maintenance</p>
              {formData.serviceType === "garden" && (
                <div className="service-check">✓</div>
              )}
            </div>
          </Col>
          <Col md={6}>
            <div 
              className={`service-card ${formData.serviceType === "building" ? "active" : ""}`}
              onClick={() => setFormData(prev => ({ ...prev, serviceType: "building" }))}
            >
              <div className="service-icon">🏢</div>
              <h5 className="service-name">Building Service</h5>
              <p className="service-desc">Construction & Renovation</p>
              {formData.serviceType === "building" && (
                <div className="service-check">✓</div>
              )}
            </div>
          </Col>
        </Row>
        {errors.serviceType && (
          <Form.Text className="text-danger d-block mt-2">{errors.serviceType}</Form.Text>
        )}
      </Form.Group>

      <Row>
        <Col lg={7}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">📅 Select Date *</Form.Label>
            
            {/* Calendar */}
            <div className="calendar-container">
              <div className="calendar-header">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => changeMonth(-1)}
                  className="calendar-nav"
                >
                  ‹
                </Button>
                <span className="calendar-month">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => changeMonth(1)}
                  className="calendar-nav"
                >
                  ›
                </Button>
              </div>
              
              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-weekday">{day}</div>
                ))}
                
                {getDaysInMonth(currentMonth).map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                  }
                  
                  const dateStr = date.toISOString().split('T')[0];
                  const isToday = dateStr === today;
                  const isSelected = isDateSelected(date);
                  const isDisabled = isDateDisabled(date);
                  const status = getBookingStatus(date);
                  const availableSlots = getAvailableSlotsCount(date);
                  
                  return (
                    <div
                      key={dateStr}
                      className={`calendar-day ${isSelected ? 'selected' : ''} 
                        ${isDisabled ? 'disabled' : ''} 
                        ${status === 'partial' ? 'partial' : ''}
                        ${status === 'full' ? 'full' : ''}
                        ${isToday ? 'today' : ''}`}
                      onClick={() => handleDateSelect(date)}
                    >
                      <span className="day-number">{date.getDate()}</span>
                      {status === 'partial' && (
                        <Badge bg="warning" className="availability-badge">
                          {availableSlots} slots
                        </Badge>
                      )}
                      {status === 'full' && (
                        <Badge bg="danger" className="availability-badge">
                          Full
                        </Badge>
                      )}
                      {status === 'available' && !isDisabled && (
                        <Badge bg="success" className="availability-badge">
                          Available
                        </Badge>
                      )}
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
            
            {errors.date && (
              <Form.Text className="text-danger d-block mt-2">{errors.date}</Form.Text>
            )}
          </Form.Group>
        </Col>
        
        <Col lg={5}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">🕐 Select Start Time *</Form.Label>
            {formData.date ? (
              <>
                {availableTimes.length > 0 ? (
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
                      <small className="text-muted">
                        {availableTimes.length} slots available on this day
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className="no-slots-message">
                    <Alert variant="danger">
                      <strong>No available slots!</strong> This day is fully booked. Please select another date.
                    </Alert>
                  </div>
                )}
              </>
            ) : (
              <div className="select-date-message">
                <Alert variant="info">
                  Please select a date first to see available time slots.
                </Alert>
              </div>
            )}
            {errors.startTime && (
              <Form.Text className="text-danger d-block mt-2">{errors.startTime}</Form.Text>
            )}
          </Form.Group>
          
          {formData.date && formData.startTime && (
            <div className="selected-info">
              <Alert variant="success" className="mb-0">
                <strong>Selected:</strong> {formData.startTime} on {new Date(formData.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Alert>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );

  const renderContactStep = () => (
    <div className="step-content fade-in">
      <div className="step-header">
        <h3 className="step-title">
          <span className="step-icon">👤</span>
          Your Contact Information
        </h3>
      </div>

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">📱 Phone Number *</Form.Label>
        <Form.Control
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Enter your phone number"
          isInvalid={!!errors.phoneNumber}
          size="lg"
        />
        <Form.Control.Feedback type="invalid">
          {errors.phoneNumber}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">📍 Address *</Form.Label>
        <Form.Control
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter your full address"
          isInvalid={!!errors.address}
          size="lg"
        />
        <Form.Control.Feedback type="invalid">
          {errors.address}
        </Form.Control.Feedback>
      </Form.Group>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="step-content fade-in">
      <div className="step-header">
        <h3 className="step-title">
          <span className="step-icon">📋</span>
          Service Details
        </h3>
      </div>

      {formData.serviceType === "garden" && (
        <>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">🌱 Garden Size (sq meters) *</Form.Label>
            <Form.Control
              type="number"
              name="gardenSize"
              value={formData.gardenSize}
              onChange={handleChange}
              placeholder="e.g., 50"
              min="1"
              isInvalid={!!errors.gardenSize}
              size="lg"
            />
            <Form.Control.Feedback type="invalid">
              {errors.gardenSize}
            </Form.Control.Feedback>
          </Form.Group>

         

          
        </>
      )}

      {formData.serviceType === "building" && (
        <>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">🏗️ Number of Floors *</Form.Label>
            <Form.Control
              type="number"
              name="floors"
              value={formData.floors}
              onChange={handleChange}
              placeholder="e.g., 5"
              min="1"
              isInvalid={!!errors.floors}
              size="lg"
            />
            <Form.Control.Feedback type="invalid">
              {errors.floors}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Building Type</Form.Label>
            <Form.Select
              name="buildingType"
              value={formData.buildingType}
              onChange={handleChange}
              size="lg"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="mixed">Mixed Use</option>
              <option value="industrial">Industrial</option>
            </Form.Select>
          </Form.Group>

          <div className="feature-toggles mb-4">
            <Form.Label className="fw-bold d-block mb-3">Additional Features</Form.Label>
            <Row>
              <Col md={6} className="mb-2">
                <div className="toggle-card">
                  <Form.Check
                    type="switch"
                    id="elevator"
                    name="hasElevator"
                    label="🛗 Elevator"
                    checked={formData.hasElevator}
                    onChange={handleChange}
                    className="custom-switch"
                  />
                </div>
              </Col>
              <Col md={6} className="mb-2">
                <div className="toggle-card">
                  <Form.Check
                    type="switch"
                    id="parking"
                    name="hasParking"
                    label="🅿️ Parking"
                    checked={formData.hasParking}
                    onChange={handleChange}
                    className="custom-switch"
                  />
                </div>
              </Col>
            </Row>
          </div>
        </>
      )}

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">📝 Additional Notes</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleChange}
          placeholder="Any special requirements or instructions..."
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
              {/* Header */}
              <div className="text-center mb-4">
                <h1 className="display-4 fw-bold text-success" style={{ color: "#0e4311" }}>
                  Book Our Service
                </h1>
                <p className="text-muted lead">Complete your booking in 3 simple steps</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <ProgressBar 
                  now={(currentStep / totalSteps) * 100} 
                  className="custom-progress"
                  style={{ height: "8px" }}
                />
                <div className="d-flex justify-content-between mt-2 px-1">
                  <small className={`step-label ${currentStep >= 1 ? 'active' : ''}`}>
                    ① Service & Time
                  </small>
                  <small className={`step-label ${currentStep >= 2 ? 'active' : ''}`}>
                    ② Contact Info
                  </small>
                  <small className={`step-label ${currentStep >= 3 ? 'active' : ''}`}>
                    ③ Details
                  </small>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="step-indicators mb-4">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`step-dot ${currentStep >= step ? 'active' : ''}`}
                    onClick={() => setCurrentStep(step)}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                ))}
              </div>

              {/* Success Message */}
              {showSuccess && (
                <Alert variant="success" className="text-center py-4 success-alert">
                  <div className="success-icon">✅</div>
                  <h4 className="mt-2">Booking Submitted Successfully!</h4>
                  <p className="mb-0">We will contact you shortly to confirm your booking.</p>
                </Alert>
              )}

              {/* Form */}
              {!showSuccess && (
                <Form onSubmit={handleSubmit}>
                  {renderStep()}

                  {/* Navigation Buttons */}
                  <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                    <Button
                      variant="outline-secondary"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="px-4 py-2"
                    >
                      ← Back
                    </Button>

                    {currentStep < totalSteps ? (
                      <Button
                        variant="success"
                        onClick={nextStep}
                        className="px-4 py-2"
                        style={{ backgroundColor: "#0e4311", borderColor: "#0e4311" }}
                      >
                        Next →
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        variant="success"
                        disabled={isSubmitting}
                        className="px-5 py-2"
                        style={{ backgroundColor: "#0e4311", borderColor: "#0e4311" }}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Submitting...
                          </>
                        ) : (
                          '✓ Confirm Booking'
                        )}
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