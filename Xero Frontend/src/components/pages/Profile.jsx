import toast from "react-hot-toast";
import { UserContext } from "../context/user/UserContext";
import { useContext, useEffect, useState } from "react";
import { getSingleUser, updateUser } from "../context/user/UserActions";
import Lottie from "lottie-react";
import LoadingIcon from "../../assets/loading.json";

const Profile = () => {
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    email: "",
    company: "",
  });
  const [edit, setEdit] = useState(false);
  const { userState } = useContext(UserContext);

  const getUser = async () => {
    const response = await getSingleUser(userState.user._id);
    console.log(response);
    setUserData(response);
  };

  useEffect(() => {
    getUser();
  }, []);

  const { username, name, email, company } = userData;

  const handleChange = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const data = { username, name, email, company };
      console.log(data);
      const response = await updateUser(userState.user._id, data);
      console.log(response);
      toast.success("Profile Updated Successfully");
      setEdit(false);
    } catch (error) {
      toast.error(error);
      setEdit(false);
    }
  };

  return (
    <>
      {!userData && !userState ? (
        <div className="flex justify-center items-center m-auto">
          <Lottie animationData={LoadingIcon} />
        </div>
      ) : (
        <div className="flex flex-col w-full px-6 ">
          <div className="header py-8 ">
            <h2 className="text-2xl font-semibold">User Profile</h2>
          </div>

          <form className="form flex flex-col gap-6">
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
                readOnly={edit == true ? false : true}
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
                readOnly={edit == true ? false : true}
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
                readOnly={edit == true ? false : true}
                value={email}
                onChange={handleChange}
                required
                className="input input-bordered w-full "
              />
            </div>
            {userState?.user?.isAdmin === true ? (
              <div className="div flex flex-col gap-3">
                <label className="font-semibold" htmlFor="company">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  readOnly={edit == true ? false : true}
                  name="company"
                  value={company}
                  onChange={handleChange}
                  placeholder="company"
                  required
                  className="input input-bordered w-full "
                />
              </div>
            ) : (
              <div className="div flex flex-col gap-3">
                <label className="font-semibold" htmlFor="company">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  readOnly={true}
                  name="company"
                  value={company}
                  onChange={handleChange}
                  placeholder="company"
                  required
                  className="input input-bordered w-full "
                />
              </div>
            )}

            <div className="div flex flex-col gap-3">
              <label className="font-semibold" htmlFor="is_admin">
                Is Admin?
              </label>
              <p>{userState?.user?.isAdmin ? "Yes" : "No"}</p>
            </div>
          </form>
          {edit == false ? (
            <>
              <div className="header py-4 flex gap-x-4">
                <button
                  onClick={() => setEdit(true)}
                  className="btn btn-success text-white"
                >
                  Edit
                </button>
              </div>
            </>
          ) : (
            <>
              {" "}
              <div className="header py-4 flex gap-x-4">
                <button
                  onClick={() => handleSubmit()}
                  className="btn btn-success text-white"
                >
                  Save
                </button>
                <button
                  onClick={() => setEdit(false)}
                  className="btn text-black"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
export default Profile;
