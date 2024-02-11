import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center items-center flex-col gap-4 m-auto">
      <h1 className="text-center font-semibold text-2xl">
        Welcome to Xero Invoice App
      </h1>
      <button onClick={() => navigate("/homepage")} className="btn btn-primary">
        {" "}
        Go to Homepage
      </button>
    </div>
  );
};
export default Home;
