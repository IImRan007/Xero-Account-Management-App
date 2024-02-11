import logo from "../../assets/logoAni.gif";
import { FaBuilding, FaFileInvoiceDollar } from "react-icons/fa";
import { BiLogOutCircle, BiSolidUser } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user/UserContext";
import { useContext } from "react";
import { logout } from "../context/user/UserActions";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { dispatch, userState } = useContext(UserContext);
  const xeroToken = localStorage.getItem("xeroToken");
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    dispatch({ type: "LOGOUT_USER" });
    toast.success("Logged out Successfully");
    navigate("/login");
  };
  return (
    <>
      <div
        style={{ minWidth: "15rem", minHeight: "100vh" }}
        className="card  top-0 drop-shadow-lg shadow-xl  w-[18rem] py-2"
      >
        <div className="mb-3 mt-3 flex  justify-center rounded-lg">
          <img className=" image-full " src={logo} alt="logo" />
        </div>
        <p
          className="text-center text-2xl font-bold"
          onClick={() => navigate("/")}
        >
          Invoice Pro
        </p>
        <p className="text-center text-xl font-bold">
          Hello, {userState?.user?.name ? userState?.user?.name : ""}
        </p>

        <div className="mt-6">
          <ul className=" menu p-1 w-full h-full  rounded text-base-content">
            {/* Sidebar content here */}
            <li className="mb-3" onClick={() => navigate("/profile")}>
              <a className="font-medium text-[1rem]">
                <BiSolidUser />
                Profile
              </a>
            </li>
            {userState?.user?.isAdmin ? (
              <li className="mb-3" onClick={() => navigate("/users")}>
                <a className="font-medium text-[1rem]">
                  <BiSolidUser />
                  Users
                </a>
              </li>
            ) : (
              ""
            )}

            <li
              className="mb-3"
              onClick={() => {
                xeroToken ? navigate("/homepage") : navigate("/xero-auth");
              }}
            >
              <a className="font-medium text-[1rem]">
                <FaFileInvoiceDollar />
                Homepage
              </a>
            </li>
            {userState?.user?.isAdmin ? (
              <li className="mb-3" onClick={() => navigate("/company")}>
                <a className="font-medium text-[1rem]">
                  <FaBuilding />
                  Company
                </a>
              </li>
            ) : (
              ""
            )}
          </ul>
        </div>

        <div className="flex justify-center mt-[5rem]">
          <button
            onClick={handleLogout}
            className="rounded-full btn-accent py-2 px-5 flex items-center gap-2 text-white font-semibold"
          >
            <BiLogOutCircle /> Log Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
