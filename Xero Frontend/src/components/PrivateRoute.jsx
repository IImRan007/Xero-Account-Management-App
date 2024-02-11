import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./context/user/UserContext";

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ children }) => {
  const { userState } = useContext(UserContext);

  if (userState.user) return children;

  return <Navigate to="/login" />;
};

export default PrivateRoute;
