import toast from "react-hot-toast";
import { getSingleUser, updateUser } from "../context/user/UserActions";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import LoadingIcon from "../../assets/loading.json";

const EditUser = () => {
  const [companyData, setCompanyData] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    isAdmin: Boolean,
  });

  const [company, setCompany] = useState("");
  const [isAdmin, setIsAdmin] = useState(userData.isAdmin);

  const API_URL = "http://localhost:5000/api/company/";

  const navigate = useNavigate();
  const params = useParams();

  const { username, name, email, password } = userData;

  useEffect(() => {
    const getUser = async () => {
      const response = await getSingleUser(params.id);
      console.log(response);
      setUserData(response);
      setIsAdmin(response.isAdmin);
      setCompany(response.company);
    };

    const getCompanies = async () => {
      try {
        const response = await axios.get(API_URL + "/all");
        setCompanyData(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getUser();
    getCompanies();
  }, []);

  const handleChange = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const handleAdmin = (e) => {
    const isAdmin = e.target.value === "yes"; // Convert 'yes' to true, 'no' to false
    setUserData((prevState) => ({
      ...prevState,
      isAdmin, // Update the isAdmin property
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let data = {
        username,
        name,
        email,
        password,
        company,
        isAdmin: userData.isAdmin,
      };
      console.log(data);
      if (password === "") {
        data = {
          username,
          name,
          email,
          company,
          isAdmin: userData.isAdmin,
        };
      }
      await updateUser(params.id, data);
      navigate("/users");
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      {!userData ? (
        <div className="flex justify-center items-center m-auto">
          <Lottie animationData={LoadingIcon} />
        </div>
      ) : (
        <div className="flex flex-col w-full px-6 ">
          <div className="header py-8 ">
            <h2 className="text-2xl font-semibold">Edit User</h2>
          </div>

          <form className="form flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="div flex flex-col gap-3">
              <label className="font-semibold" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                required
                onChange={handleChange}
                placeholder="Name"
                className="input input-bordered w-full "
              />
            </div>

            <div className="div flex flex-col gap-3">
              <label className="font-semibold" htmlFor="user_name">
                User Name
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={handleChange}
                placeholder="User Name"
                className="input input-bordered w-full "
              />
            </div>

            <div className="div flex flex-col gap-3">
              <label className="font-semibold" htmlFor="email">
                E-mail
              </label>
              <input
                type="email"
                placeholder="Email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                required
                className="input input-bordered w-full "
              />
            </div>
            <div className="div flex flex-col gap-3">
              <label className="font-semibold" htmlFor="is_admin">
                Is Admin?
              </label>
              <select
                defaultValue={isAdmin === true ? "yes" : "no"}
                className="select select-bordered w-full max-w-xs"
                onChange={handleAdmin}
              >
                <option id="no" value="no">
                  No
                </option>
                <option id="yes" value="yes">
                  Yes
                </option>
              </select>
            </div>

            <div className="div flex flex-col gap-3">
              <label className="font-semibold" htmlFor="company">
                Company
              </label>
              <select
                name="company"
                id="company"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  console.log(e.target.value);
                }}
                className="select select-bordered w-full max-w-xs"
              >
                <option value="">Select a company</option>
                {companyData?.map((elem) => (
                  <option key={elem._id} value={elem.company}>
                    {elem.company}
                  </option>
                ))}
              </select>
            </div>

            <div className="header py-4 flex gap-x-4">
              <button className="btn btn-success text-white">Save</button>
              <button
                className="btn text-black"
                onClick={() => navigate("/users")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
export default EditUser;
