import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./components/pages/Home";
import Login from "./components/pages/Login";
// Context

import Register from "./components/pages/Register";
import Profile from "./components/pages/Profile";
import Sidebar from "./components/layout/Sidebar";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./components/context/user/UserContext";
import Users from "./components/pages/Users";
import AddUser from "./components/pages/AddUser";
import EditUser from "./components/pages/EditUser";
import Invoices from "./components/pages/Invoices";
import XeroAuth from "./components/pages/XeroAuth";
import Homepage from "./components/pages/Homepage";
// import EditInvoice from "./components/pages/EditInvoice";
import EditInvoice2 from "./components/pages/EditInvoice2";
import Company from "./components/pages/Company";
import axios from "axios";

const App = () => {
  const { userState } = useContext(UserContext);
  const API_URL = "http://localhost:5000/api/xero/";

  const navigate = useNavigate();

  const refreshToken = async (refreshToken) => {
    try {
      const response = await axios.post(API_URL + "refresh", {
        refreshToken: refreshToken,
      });

      console.log("res", response.data);

      const newAccessToken = response?.data?.accessToken;
      const newRefreshToken = response?.data?.refreshToken;

      const storedToken = JSON.parse(localStorage.getItem("xeroToken"));

      console.log("storedToken before update:", storedToken);
      localStorage.removeItem("xeroToken");
      console.log("xeroToken Removed");
      const expirationTime = Date.now() + 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds

      // Update the token values

      let newToken = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expirationTime: expirationTime,
      };
      localStorage.removeItem("xeroToken");
      console.log("xeroToken Removed");

      console.log("New xeroToken", newToken);

      localStorage.setItem("xeroToken", JSON.stringify(newToken));
    } catch (error) {
      console.log(error);
      navigate("/xero-auth");
    }
  };

  useEffect(() => {
    const checkTokenStatus = async () => {
      const storedToken = JSON.parse(localStorage.getItem("xeroToken"));

      if (storedToken) {
        const timeUntilRefresh = 30 * 60 * 1000; // 30 minutes
        const timeUntilRemove = 60 * 24 * 60 * 60 * 1000; // 60 days

        // Check if 30 minutes have passed since the last refresh
        const shouldRefreshToken =
          Date.now() >= storedToken.expirationTime + timeUntilRefresh;

        // Check if 60 days have passed since the token's creation
        const shouldRemoveToken =
          Date.now() >= storedToken.creationTime + timeUntilRemove;

        if (shouldRefreshToken) {
          console.log("Refreshing token");
          try {
            const response = await axios.post(API_URL + "refresh", {
              refreshToken: storedToken.refreshToken,
            });

            const newAccessToken = response?.data?.accessToken;
            const newRefreshToken = response?.data?.refreshToken;

            // Update the token values
            storedToken.accessToken = newAccessToken;
            storedToken.refreshToken = newRefreshToken;
            storedToken.expirationTime = Date.now();

            console.log("New xeroToken", storedToken);

            localStorage.setItem("xeroToken", JSON.stringify(storedToken));
          } catch (error) {
            console.log(error);
            navigate("/xero-auth");
          }
        }

        if (shouldRemoveToken) {
          console.log("Removing token after 60 days...");

          // Remove the token from local storage
          localStorage.removeItem("xeroToken");
          navigate("/xero-auth");
        }
      }
    };

    // Call the function initially
    checkTokenStatus();

    // Set up the interval to check every minute
    const intervalId = setInterval(checkTokenStatus, 60 * 1000); // 1 minute

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <>
      <Toaster />

      <div className="flex">
        {userState.user && <Sidebar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/company"
            element={
              <PrivateRoute>
                <Company />
              </PrivateRoute>
            }
          />

          <Route
            path="/user-add"
            element={
              <PrivateRoute>
                <AddUser />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-edit/:id"
            element={
              <PrivateRoute>
                <EditUser />
              </PrivateRoute>
            }
          />
          <Route
            path="/invoices/:invoiceID/:tenantID"
            element={
              <PrivateRoute>
                <Invoices />
              </PrivateRoute>
            }
          />
          <Route
            path="/homepage"
            element={
              <PrivateRoute>
                <Homepage />
              </PrivateRoute>
            }
          />
          <Route
            path="/xero-auth"
            element={
              <PrivateRoute>
                <XeroAuth />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-invoice/:id/:tenantId"
            element={
              <PrivateRoute>
                <EditInvoice2 />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
};
export default App;
