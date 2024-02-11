import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { register } from "../context/user/UserActions";
import { UserContext } from "../context/user/UserContext";

const Register = () => {
  const [userData, setuserData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    company: "",
  });

  const { name, username, email, password, company } = userData;

  const navigate = useNavigate();
  const { dispatch } = useContext(UserContext);

  const handleChange = (e) => {
    setuserData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = await register(userData);
      console.log(data);
      if (data.success === true) {
        dispatch({ type: "REGISTER_USER", payload: data });
        navigate("/");
      } else {
        toast.error("Invalid ");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <>
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage:
            "url(https://plus.unsplash.com/premium_photo-1679784204535-e623926075cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80)",
        }}
      >
        <div className="hero-overlay   bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className=" min-w-[20rem] max-w-lg">
            <h1 className="mb-5  text-4xl font-bold text-white">
              Create Account
            </h1>
            <form onSubmit={handleCreate}>
              <div className="card  justify-center m-auto flex-shrink-0 w-full max-w-md shadow-2xl bg-white">
                <div className="card-body">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-black">Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Name"
                      id="name"
                      name="name"
                      value={name}
                      className="input input-bordered bg-transparent text-black"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-black">Username</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Username"
                      id="username"
                      name="username"
                      value={username}
                      className="input input-bordered bg-transparent text-black"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-black">Email</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Email"
                      id="email"
                      name="email"
                      value={email}
                      className="input input-bordered bg-transparent text-black"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-black">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Password"
                      id="password"
                      name="password"
                      className="input input-bordered bg-transparent text-black"
                      value={password}
                      required
                      onChange={handleChange}
                    />
                  </div>
                  {/* <div className="form-control">
                    <label className="label">
                      <span className="label-text text-black">Company</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Company"
                      id="company"
                      name="company"
                      className="input input-bordered bg-transparent text-black"
                      value={company}
                      required
                      onChange={handleChange}
                    />
                  </div> */}
                  <div className="form-control mt-6">
                    <button className="btn btn-secondary">
                      Create Account
                    </button>
                    <Link
                      className="mt-4 underline font-semibold text-black"
                      to="/"
                    >
                      <p>Login</p>
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
