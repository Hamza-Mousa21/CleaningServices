import React from "react";
import { Carousel, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import stairsImg from "../assets/stairs.png";
import gardenImg from "../assets/garden.png";

const slides = [
  {
    image: stairsImg,
    title: "درج نظيف، حياة أفضل",
    description: "خدمات تنظيف السلالم باحترافية",
  },
  {
    image: gardenImg,
    title: "حديقة أجمل وأكثر إشراقاً",
    description: "خدمات تنظيف الحدائق المنزلية بأعلى جودة",
  },
];

const HeroCarousel = () => {
  const navigate = useNavigate();

  return (
    <Carousel fade indicators controls interval={5000} className="hero-carousel">
      {slides.map((slide, index) => (
        <Carousel.Item key={index}>
          <div className="hero-slide" style={{ backgroundImage: `url(${slide.image})` }}>
            <div className="overlay" />
            <div className="hero-content">
              <h1>{slide.title}</h1>
              <p>{slide.description}</p>
              <Button
                size="lg"
                className="book-btn"
                style={{ backgroundColor: "#0e4311" }}
                onClick={() => navigate("/booking")}
              >
                احجز الآن
              </Button>
            </div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default HeroCarousel;