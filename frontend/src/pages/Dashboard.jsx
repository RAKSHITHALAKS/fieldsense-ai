import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Legend
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState({});
  const [insights, setInsights] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [programData, setProgramData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchInsights();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/analytics");
      setAnalytics(response.data);

      const regionData = response.data.region_wise_visits || {};
      const formatted = Object.keys(regionData).map((region) => ({
        region,
        visits: regionData[region]
      }));
      setChartData(formatted);

      const programWise = response.data.program_wise_visits || {};
      const formattedProgram = Object.keys(programWise).map((program) => ({
        name: program,
        value: programWise[program]
      }));
      setProgramData(formattedProgram);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/insights");
      setInsights(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const runAIAnalysis = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/analyze/1");
      alert("AI Analysis Completed");
      fetchAnalytics();
      fetchInsights();
    } catch (error) {
      console.error(error);
      alert("AI failed");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        padding: "30px"
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        FieldSense AI Dashboard
      </h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}
      >
        {[
          ["Total Visits", analytics.total_visits],
          ["Total Insights", analytics.total_insights],
          ["Negative Cases", analytics.negative_cases],
          ["Critical Issues", analytics.critical_issues]
        ].map(([title, value]) => (
          <div
            key={title}
            style={{
              backgroundColor: "white",
              padding: "20px",
              width: "220px",
              borderRadius: "15px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
              textAlign: "center"
            }}
          >
            <h3>{title}</h3>
            <h2>{value || 0}</h2>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={runAIAnalysis}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            marginRight: "15px"
          }}
        >
          Analyze Visit with AI
        </button>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            cursor: "pointer"
          }}
        >
          Back to Visit Form
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "40px",
          flexWrap: "wrap"
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <h2>Region Wise Visits</h2>
          <BarChart width={500} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="visits" />
          </BarChart>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <h2>Program Wise Visits</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={programData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            />
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      <h2 style={{ marginTop: "40px" }}>AI Insights</h2>

      {insights.map((insight) => (
        <div
          key={insight.id}
          style={{
            backgroundColor: "white",
            padding: "20px",
            marginTop: "15px",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)"
          }}
        >
          <p><b>Summary:</b> {insight.summary}</p>
          <p><b>Key Findings:</b> {insight.key_findings}</p>
          <p><b>Sentiment:</b> {insight.sentiment}</p>
          <p><b>Follow Up:</b> {insight.follow_up}</p>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;