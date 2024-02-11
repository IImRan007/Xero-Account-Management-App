import toast from "react-hot-toast";
import { createUser } from "../context/user/UserActions";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AddUser = () => {
  const [companyData, setCompanyData] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [company, setCompany] = useState("");

  const API_URL = "http://localhost:5000/api/company/";

  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  const { username, name, email, password } = userData;

  const getCompanies = async () => {
    try {
      const response = await axios.get(API_URL + "all");
      setCompanyData(response.data);
      setCompany(response.data[0].company);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCompanies();
  }, []);

  console.log(companyData);
  const handleChange = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const handleAdmin = (e) => {
    if (e.target.value === "yes") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { username, name, email, password, company, isAdmin };
      console.log(data);
      await createUser(data);
      navigate("/users");
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full px-6 ">
        <div className="header py-8 ">
          <h2 className="text-2xl font-semibold">Add User</h2>
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
            <label className="font-semibold" htmlFor="password">
              Password
            </label>
            <input
              type="text"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="input input-bordered w-full "
            />
          </div>

          <div className="div flex flex-col gap-3">
            <label className="font-semibold" htmlFor="is_admin">
              Is Admin?
            </label>
            <select
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

          {companyData?.length > 0 ? (
            <div className="div flex flex-col gap-3">
              <label className="font-semibold" htmlFor="company">
                Company
              </label>
              <select
                name="company"
                id="company"
                value={
                  company ||
                  (companyData.length > 0 ? companyData[0].company : "")
                }
                onChange={(e) => {
                  setCompany(e.target.value);
                  console.log(e.target.value);
                }}
                className="select select-bordered w-full max-w-xs"
              >
                {companyData?.map((elem) => (
                  <option key={elem._id} value={elem.company}>
                    {elem.company}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <p>No Company Found</p>
              <Link to={"/company"}>
                <button className="btn btn-primary">Add Company</button>
              </Link>
            </>
          )}

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
    </>
  );
};
export default AddUser;
