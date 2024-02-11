import axios from "axios";

const API_URL = "http://localhost:5000/api/users/";

// Register user
export const register = async (userData) => {
  try {
    const response = await axios.post(API_URL + "register", userData);

    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Login user
export const login = async (userData) => {
  try {
    const response = await axios.post(API_URL + "login", userData);

    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(API_URL + "all");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_URL + "create", userData);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(API_URL + userId, userData);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getSingleUser = async (userId) => {
  try {
    const response = await axios.get(API_URL + userId);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(API_URL + userId);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await axios.get(API_URL + "me");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("xeroToken");
};
