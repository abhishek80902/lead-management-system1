import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = import.meta.env.VITE_API;

function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    requirement: "",
  });

  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalLeads: 0,
    emailsSent: 0,
    emailsOpened: 0,
    openRate: 0,
    linksClicked: 0,
    clickRate: 0,
    leads: [],
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/api/stats`);
      setStats(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(`${API}/api/leads`, form);

      alert("Lead Submitted Successfully ✅");

      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        requirement: "",
      });

      fetchStats();
    } catch (error) {
      console.log(error);

      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">

      <h1 className="title">
        Automated Lead Management System
      </h1>

      {/* FORM */}

      <div className="card">

        <h2>Lead Capture Form</h2>

        <form onSubmit={submitHandler}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={form.company}
            onChange={handleChange}
          />

          <textarea
            rows="5"
            name="requirement"
            placeholder="Requirement / Message"
            value={form.requirement}
            onChange={handleChange}
            required
          />

          <button disabled={loading}>
            {loading ? "Submitting..." : "Submit Lead"}
          </button>

        </form>
      </div>

      {/* DASHBOARD */}

      <h2 className="dashboard-title">
        Analytics Dashboard
      </h2>

      <div className="stats">

        <div className="stat-card">
          <h3>Total Leads</h3>
          <p>{stats.totalLeads}</p>
        </div>

        <div className="stat-card">
          <h3>Emails Sent</h3>
          <p>{stats.emailsSent}</p>
        </div>

        <div className="stat-card">
          <h3>Emails Opened</h3>
          <p>{stats.emailsOpened}</p>
        </div>

        <div className="stat-card">
          <h3>Open Rate</h3>
          <p>{stats.openRate}%</p>
        </div>

        <div className="stat-card">
          <h3>Links Clicked</h3>
          <p>{stats.linksClicked}</p>
        </div>

        <div className="stat-card">
          <h3>Click Rate</h3>
          <p>{stats.clickRate}%</p>
        </div>

      </div>

      {/* LEADS TABLE */}

      <div className="table-wrapper">

        <h2>Lead Records</h2>

        <table>

          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Opened</th>
              <th>Clicked</th>
            </tr>
          </thead>

          <tbody>

            {stats.leads?.map((lead) => (
              <tr key={lead._id}>
                <td>{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.phone}</td>
                <td>{lead.company}</td>
                <td>{lead.opened ? "✅" : "❌"}</td>
                <td>{lead.clicked ? "✅" : "❌"}</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default App;