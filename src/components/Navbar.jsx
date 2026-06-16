import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

const CustomNavbar = () => {
  return (
    <Navbar
      expand="lg"
      className="position-absolute top-0 start-0 w-100 z-3 py-4"
    >
      <Container>
        <Navbar.Brand
          href="#"
          className="text-white fw-bold fs-3"
        >
          CLEAN
        </Navbar.Brand>

        <Navbar.Toggle />

        <Navbar.Collapse>
          <Nav className="mx-auto gap-4">
            <Nav.Link className="text-white">الرئيسية</Nav.Link>
            <Nav.Link className="text-white">خدماتنا</Nav.Link>
            <Nav.Link className="text-white">من نحن</Nav.Link>
            <Nav.Link className="text-white">تواصل معنا</Nav.Link>
          </Nav>

          <Button
            variant="outline-light"
            className="rounded-pill px-4"
          >
            تسجيل الدخول
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;