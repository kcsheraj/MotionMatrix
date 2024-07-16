import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [text, setText] = useState("");
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get("http://localhost:5001/home")
      .then((result) => {
        console.log(result);
        if (result.data.message !== "Success") {
          navigate("/login");
        } else {
          setLoading(false); // Set loading to false once authenticated
        }
      })
      .catch((err) => {
        console.log(err);
        navigate("/login");
      });

    // Fetch the texts for the logged-in user
    axios
      .get("http://localhost:5001/get-texts")
      .then((result) => {
        setTexts(result.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5001/save-text", { text })
      .then((result) => {
        setTexts(result.data);
        setText("");
      })
      .catch((err) => console.log(err));
  };

  const handleLogout = () => {
    axios
      .post("http://localhost:5001/logout")
      .then((result) => {
        console.log(result.data);
        navigate("/login");
      })
      .catch((err) => console.log(err));
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading indicator while checking authentication
  }

  return (
    <div>
      <h1>Home Page!</h1>
      <button onClick={handleLogout}>Logout</button>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter some text"
        />
        <button type="submit">Submit</button>
      </form>
      <ul>
        {texts.map((t, index) => (
          <li key={index}>{t}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
