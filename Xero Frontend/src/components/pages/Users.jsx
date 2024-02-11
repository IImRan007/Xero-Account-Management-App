import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteUser, getAllUsers } from "../context/user/UserActions";
import Lottie from "lottie-react";
import LoadingIcon from "../../assets/loading.json";

const Users = () => {
  const [users, setUsers] = useState(null);

  const getUsers = async () => {
    const response = await getAllUsers();
    console.log(response);
    setUsers(response);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleDelete = async (id) => {
    const response = await deleteUser(id);
    console.log(response);
    getUsers();
  };

  return (
    <>
      {!users ? (
        <div className="flex justify-center items-center m-auto">
          <Lottie animationData={LoadingIcon} />
        </div>
      ) : (
        <div className="flex flex-col w-full px-6 ">
          <div className="header py-4">
            <Link to={"/user-add"}>
              <button className="btn btn-success text-white">+Add Users</button>
            </Link>
          </div>

          <div className="searchBar p-4"></div>

          <div className="overflow-x-auto ">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users &&
                  users?.map((elem, i) => (
                    <tr key={elem._id}>
                      <th>{i + 1}</th>
                      <td>{elem.name}</td>
                      <td>{elem.username}</td>
                      <td>{elem.email}</td>
                      <td>{elem.company}</td>
                      <td>
                        <div className="flex gap-x-4">
                          <Link to={`/user-edit/${elem._id}`}>
                            <button className="btn btn-neutral">Edit</button>
                          </Link>
                          <button
                            className="btn btn-error"
                            onClick={() => handleDelete(elem._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
export default Users;
