import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function VisitForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    agent_name: "",
    location: "",
    visit_date: "",
    program_area: "",
    stakeholders: "",
    notes: ""
  });

  const [photo, setPhoto] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (photo) {
        data.append("photo", photo);
      }

      await axios.post("http://127.0.0.1:8000/visits", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Visit saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert("Error saving visit");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "18px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px"
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "500px",
          backgroundColor: "white",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0px 6px 18px rgba(0,0,0,0.15)"
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
          FieldSense AI
        </h1>

        <p style={{ textAlign: "center", color: "gray", marginBottom: "30px" }}>
          Smart Field Visit Reporting System
        </p>

        <input
          type="text"
          name="agent_name"
          placeholder="Agent Name"
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="date"
          name="visit_date"
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="program_area"
          placeholder="Program Area"
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="stakeholders"
          placeholder="Stakeholders"
          onChange={handleChange}
          style={inputStyle}
        />

        <textarea
          name="notes"
          placeholder="Visit Notes"
          rows="4"
          onChange={handleChange}
          style={inputStyle}
        />

        <label>Upload Field Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          style={inputStyle}
        />

        <button
          onClick={handleSubmit}
          style={{
            ...buttonStyle,
            border: "none"
          }}
        >
          Submit Visit
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            ...buttonStyle,
            border: "1px solid #ccc"
          }}
        >
          Go To Dashboard
        </button>
      </div>
    </div>
  );
}

export default VisitForm;