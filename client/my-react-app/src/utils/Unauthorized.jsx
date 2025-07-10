import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ fontSize: "3rem", color: "#e63946" }}>403 - Unauthorized</h1>
      <p style={{ fontSize: "1.2rem" }}>
        Sorry, you don't have permission to access this page.
      </p>
      <Link
        to="/"
        style={{
          marginTop: "20px",
          display: "inline-block",
          color: "#457b9d",
          textDecoration: "underline",
        }}
      >
        Go to Home
      </Link>
    </div>
  );
};

export default Unauthorized;
