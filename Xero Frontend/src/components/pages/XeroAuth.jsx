import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const XeroAuth = () => {
  const API_URL = "http://localhost:5000/api/xero/";

  const [loginUrl, setLoginUrl] = useState("");
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  const getAuthUrl = async () => {
    try {
      const response = await axios.get(API_URL + "auth");
      setLoginUrl(response.data.authUrl);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const storedToken = JSON.parse(localStorage.getItem("xeroToken"));

    if (storedToken && Date.now() < storedToken.expirationTime) {
      setToken(storedToken.accessToken);
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get("code");

      if (codeParam !== null) {
        const getAccessToken = async () => {
          try {
            const response = await axios.post(API_URL + "callback", {
              code: codeParam,
            });

            console.log("res", response.data);

            const accessToken = response.data.accessToken;
            const refreshToken = response.data.refreshToken;
            const expirationTime = response.data.expires_in;

            localStorage.setItem(
              "xeroToken",
              JSON.stringify({
                accessToken,
                refreshToken,
                expirationTime,
              })
            );
            setToken(accessToken);
          } catch (error) {
            console.log(error);
          }
        };

        getAccessToken();
      } else {
        getAuthUrl();
      }
    }
  }, []);

  return (
    <div className="flex justify-center items-center w-full">
      {token ? (
        <Link to="/homepage">
          <p className="btn btn-primary">Go to Homepage</p>
        </Link>
      ) : (
        <a role="button" className="btn btn-primary" href={loginUrl}>
          Auth with XERO
        </a>
      )}
    </div>
  );
};

export default XeroAuth;
