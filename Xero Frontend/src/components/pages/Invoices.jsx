import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import LoadingIcon from "../../assets/loading.json";

const Invoices = () => {
  const apiUrl = "http://localhost:5000/api/xero/";

  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
  const invoiceID = params.invoiceID;
  const tenantID = params.tenantID;
  const [loading, setLoading] = useState(false);
  const [checkboxes, setCheckboxes] = useState({});

  let accessToken = JSON.parse(localStorage.getItem("xeroToken")).accessToken;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          apiUrl + "generate-organizationInvoices",
          {
            accessToken: accessToken,
            invoiceID: invoiceID,
            tenantID: tenantID,
          }
        );

        console.log(response.data.data);

        setData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [accessToken, invoiceID, tenantID]);
  console.log({ data });

  const onCheckboxChange = (e, elem) => {
    const { name, checked } = e.target;
    console.log(elem);

    setCheckboxes({
      ...checkboxes,
      [name]: checked,
      elem: elem,
    });
  };

  const test = () => {
    const selectedInvoices = Object.keys(checkboxes).filter(
      (checkboxName) => checkboxes[checkboxName]
    );

    console.log(selectedInvoices);
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center m-auto">
          <Lottie animationData={LoadingIcon} />
        </div>
      ) : (
        <div className="flex flex-col w-full px-6 ">
          <div className="header py-4">
            <h1 className="text-2xl font-semibold">Companies</h1>
          </div>

          <div className="searchBar p-4"></div>

          <div className=" flex items-center justify-between">
            <div className="flex gap-4 flex-col">
              <div className="flex gap-4">
                <label htmlFor="company" className="label">
                  <span className="font-semibold">Supplier Name:&nbsp;</span>
                  {data?.Invoices?.[0].Contact.Name}
                </label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mt-12">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th></th>
                  <th>Invoice Number</th>
                  <th>Currency</th>
                  <th>Selected</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data?.Invoices?.map((elem, i) => (
                    <tr key={elem.InvoiceID}>
                      <th>{i + 1}</th>
                      <td>{elem.InvoiceNumber}</td>
                      <td>{elem.CurrencyCode}</td>
                      <td>
                        <input
                          type="checkbox"
                          name={`checkbox-${elem.InvoiceID}`} // Use a unique identifier
                          id={`checkbox-${elem.InvoiceID}`}
                          onChange={(e) => onCheckboxChange(e, elem)}
                          checked={
                            checkboxes[`checkbox-${elem.InvoiceID}`] || false
                          } // Set the checked state from the 'checkboxes' state
                        />
                      </td>
                      <td>{elem.SubTotal}</td>
                      <td>
                        <div>
                          <button
                            onClick={() =>
                              navigate(`/edit-invoice/${elem.InvoiceID}`, {
                                state: elem,
                              })
                            }
                            className="btn btn-accent text-white"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                <button onClick={test}>Check</button>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
export default Invoices;
