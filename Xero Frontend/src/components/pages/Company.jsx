import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import LoadingIcon from "../../assets/loading.json";
import axios from "axios";
import toast from "react-hot-toast";

const Company = () => {
  const [companyName, setCompanyName] = useState("");
  const [data, setData] = useState(null);
  const [editData, setEditData] = useState("");
  const [edit, setEdit] = useState(false);
  const [id, setId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const API_URL = "http://localhost:5000/api/company/";

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
  };

  const addCompany = async () => {
    if (companyName !== "") {
      try {
        const response = await axios.post(API_URL, { company: companyName });
        console.log(response.data);
        if (response.data.success === true) {
          closeModal();
          toast.success("Company Created Successfully.");
          getCompanies();
          setCompanyName("");
        }
      } catch (error) {
        toast.error(error.response.data.message);
      }
    } else {
      toast.error("Please add company name.");
    }
  };

  const getCompanies = async () => {
    try {
      const response = await axios.get(API_URL + "all");
      console.log(response.data);
      setData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateCompany = async () => {
    try {
      const response = await axios.put(API_URL + id, { company: editData });
      console.log(response);
      setEditData("");
      closeModal();
      toast.success("Company Name Updated Successfully");
      getCompanies();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(API_URL + id);
      console.log(response.data);
      toast.success("Deleted Successfully");
      getCompanies();
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getCompanies();
  }, []);

  return (
    <>
      {!data ? (
        <div className="flex justify-center items-center m-auto">
          <Lottie animationData={LoadingIcon} />
        </div>
      ) : (
        <div className="flex flex-col w-full px-6 ">
          <div className="header py-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-success text-white"
            >
              +Add Company
            </button>
          </div>

          <div className="searchBar p-4"></div>
          {data.length > 0 ? (
            <div className="overflow-x-auto ">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th></th>
                    <th>Company Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data &&
                    data?.map((elem, i) => (
                      <tr key={elem._id}>
                        <th>{i + 1}</th>
                        <td>{elem.company}</td>
                        <td>
                          <div className="flex gap-x-4">
                            <button
                              className="btn btn-neutral"
                              onClick={() => {
                                setEdit(true);
                                setEditData(elem.company);
                                setId(elem._id);
                                setIsEditModalOpen(true);
                              }}
                            >
                              Edit
                            </button>
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
          ) : (
            <h2>No Data Found!</h2>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="w-full h-screen fixed flex items-center justify-center m-auto">
          <div className="modal-box min-w-[20vw] min-h-[20vh] outline outline-1 outline-slate-950">
            <form method="dialog">
              <div className="flex flex-col gap-4">
                <label htmlFor="">Company Name</label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={companyName}
                  className="input input-bordered input-md w-full max-w-xs"
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <button className="btn btn-primary mt-8" onClick={addCompany}>
                Add
              </button>
              <button
                onClick={closeModal}
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              >
                ✕
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="w-full h-screen fixed flex items-center justify-center m-auto">
          <div className="modal-box min-w-[20vw] min-h-[20vh] outline outline-1 outline-slate-950">
            <form method="dialog">
              <div className="flex flex-col gap-4">
                <label htmlFor="">Company Name</label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={editData}
                  className="input input-bordered input-md w-full max-w-xs"
                  onChange={(e) => setEditData(e.target.value)}
                />
              </div>
              <button className="btn btn-primary mt-8" onClick={updateCompany}>
                Save
              </button>
              <button
                onClick={closeModal}
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              >
                ✕
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default Company;
