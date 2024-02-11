import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import LoadingIcon from "../../assets/loading.json";
import { useEffect, useState } from "react";
import axios from "axios";

const EditInvoice2 = () => {
  const apiUrl = "http://localhost:5000/api/xero/";

  let accessToken = JSON.parse(localStorage.getItem("xeroToken"))?.accessToken;

  const params = useParams();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const { state } = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  const [companyName, setCompanyName] = useState(state?.Contact?.Name || "");
  const [issueDate, setIssueDate] = useState(
    formatDate(state?.DateString) || ""
  );
  const [dueDate, setDueDate] = useState(
    formatDate(state?.DueDateString) || ""
  );
  const [invoiceNumber, setInvoiceNumber] = useState(
    state?.InvoiceNumber || ""
  );
  const [reference, setReference] = useState(state?.Reference || "");
  const [currency, setCurrency] = useState(state?.CurrencyCode || "");
  const [amountsAre, setAmountsAre] = useState(
    "Tax" + " " + state?.LineAmountTypes || ""
  );
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [subtotal, setSubtotal] = useState(state?.SubTotal || "0.00"); // Initialize as a string
  const [total, setTotal] = useState("0.00");
  // eslint-disable-next-line no-unused-vars
  const [totalTax, setTotalTax] = useState(state?.TotalTax || "0.00");
  const [items, setItems] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [taxRates, setTaxRates] = useState(null);
  const [region, setRegion] = useState(null);

  const [lineItems, setLineItems] = useState([]);

  useEffect(() => {
    if (state?.LineItems) {
      setLineItems(state?.LineItems);
    }

    // setLineItems(updatedLineItem);
  }, [state]);
  console.log(lineItems);

  const fetchItems = async () => {
    const response = await axios.post(apiUrl + "account-items", {
      accessToken: accessToken,
      tenantID: params.tenantId,
    });

    setItems(response.data.data);
  };
  console.log(items);

  const fetchBankAccounts = async () => {
    const response = await axios.post(apiUrl + "bank-accounts", {
      accessToken: accessToken,
      organizationId: params.tenantId,
    });

    setAccounts(response.data.data);
  };

  const fetchTaxRates = async () => {
    const response = await axios.post(apiUrl + "tax-rates", {
      accessToken: accessToken,
      organizationId: params.tenantId,
    });

    setTaxRates(response.data.data);

    // lineItems[0]["TaxRate"] = response.data.data.TaxRates[0].DisplayTaxRate;
  };

  console.log("tax-rates", taxRates);

  const fetchTrackingCategories = async () => {
    const response = await axios.post(apiUrl + "tracking-categories", {
      accessToken: accessToken,
      organizationId: params.tenantId,
    });

    console.log("region", response.data.data);

    setRegion(response.data.data);
  };

  useEffect(() => {
    // Fetch the list of currency codes from an API
    fetch("https://openexchangerates.org/api/currencies.json")
      .then((response) => response.json())
      .then((data) => {
        const codes = Object.keys(data);
        setCurrencyOptions(codes);
      })
      .catch((error) => {
        console.error("Error fetching currency codes:", error);
      });

    fetchItems();
    fetchBankAccounts();
    fetchTaxRates();
    fetchTrackingCategories();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true); // Enable editing when the "Edit" button is clicked
  };

  const handleAddLineItem = () => {
    const newLineItem = {
      AccountCode: lineItems[0].AccountCode,
      AccountID: "",
      Quantity: "",
      Description: "",
      LineAmount: "",
      LineItemID: "",
      TaxAmount: "",
      TaxType: "INPUT",
      UnitAmount: "",
      Region: "",
      TaxRate: "",
    };
    setLineItems([...lineItems, newLineItem]);
  };
  console.log(items);
  const navigate = useNavigate();

  const handleRemoveLineItem = (index) => {
    const updatedLineItems = [...lineItems];
    updatedLineItems.splice(index, 1);
    setLineItems(updatedLineItems);
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedLineItem = [...lineItems];
    updatedLineItem[index][field] = value;
    const currentLineItem = lineItems[index];

    // Update the quantity or price based on the field parameter
    if (field === "Quantity") {
      currentLineItem.Quantity = value;
    } else if (field === "UnitAmount") {
      currentLineItem.UnitAmount = value;
    }
    if (field === "TaxRate") {
      currentLineItem.TaxRate = value;
    }
    // if (field === "LineItemID") {
    //   currentLineItem.LineItemID = value;
    // }
    // Calculate the amount as quantity * price
    const quantity = parseFloat(currentLineItem.Quantity);
    const price = parseFloat(currentLineItem.UnitAmount);
    const taxRate = parseFloat(currentLineItem.TaxRate);
    const amount = quantity * price; // Store as string

    const tax = (taxRate / 100) * parseFloat(amount).toFixed(2); // Store as string
    // Update the line item's Amount field
    updatedLineItem[index].Amount = amount;
    updatedLineItem[index].LineAmount = amount;
    updatedLineItem[index].TaxAmount = isNaN(tax) ? "0" : tax;
    setLineItems(updatedLineItem);
  };
  console.log("Line Items", lineItems);
  const getSubtotal = () => {
    const subTotalAmount = lineItems?.reduce((total, product) => {
      // Use parseInt with a fallback value of 0 to handle non-integer values
      const amount = parseInt(product.Amount, 10) || 0;
      return total + amount;
    }, 0);

    return subTotalAmount;
  };

  const getTaxTotal = () => {
    const taxTotalAmount = lineItems?.reduce(
      (total, product) => total + parseFloat(product.TaxAmount),
      0
    );
    return taxTotalAmount;
  };

  const hanldeUpdateInvoice = async () => {
    console.log("amountsAre", amountsAre);
    let data = {
      Invoices: [
        {
          Reference: reference,
          InvoiceID: state?.InvoiceID,
          LineItems: lineItems,
          Contact: state?.Contact,
          Type: state?.Type,
          // CurrencyCode: currency,
          InvoiceNumber: invoiceNumber,
          // LineAmountTypes: amountsAre,
          // DateString: issueDate,
          // DueDateString: dueDate,
        },
      ],
    };

    console.log("updatedData", JSON.stringify(data));

    const tenantId = params.tenantId;
    try {
      const response = await axios.post(apiUrl + "update-invoice", {
        data: JSON.stringify(data),
        accessToken: accessToken,
        tenantId: tenantId,
        InvoiceID: state?.InvoiceID,
      });

      console.log("res", response.data);
      toast.success("Invoice Updated Successfully");
    } catch (error) {
      toast.error(error);
    }
  };

  const downloadPdf = async () => {
    try {
      console.log("click");
      const response = await axios.post(
        apiUrl + "get-invoicePdf",
        {
          accessToken: accessToken,
          tenantID: params?.tenantId,
          InvoiceID: state?.InvoiceID,
        },
        { responseType: "arraybuffer" }
      );

      if (response.status !== 200) {
        console.error("Error: API returned a non-200 status code");
        return;
      }

      // Verify that the Content-Type is set to "application/pdf"
      const contentType = response.headers["content-type"];
      if (contentType !== "application/pdf") {
        console.error("Error: Unexpected Content-Type:", contentType);
        return;
      }

      // Create a Blob directly from the response data (which is an ArrayBuffer)
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create a URL for the Blob object
      const url = URL.createObjectURL(blob);

      // Create a link element
      const link = document.createElement("a");
      link.href = url;
      link.download = "sample.pdf"; // Specify the file name here

      // Trigger a click event on the link to start the download
      link.click();

      // Clean up by revoking the URL to free up resources
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      {!state ? (
        <div className="flex justify-center items-center m-auto">
          <Lottie animationData={LoadingIcon} />
        </div>
      ) : (
        <div className="p-3  h-full flex mt-4 justify-center z-50  ">
          <div className=" max-w-[80vw]">
            <div className="w-full flex justify-end">
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://go.xero.com/AccountsPayable/View.aspx?invoiceID=${state?.InvoiceID}`}
              >
                <button className="btn btn-primary">View in Xero</button>{" "}
              </a>
            </div>

            <div className="flex justify-end">
              <div className="modal-actions p-4 text-right right-24">
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded-md  hover:bg-blue-400"
                  // id="onDownload"
                  onClick={downloadPdf}
                >
                  Download PDF
                </button>
              </div>
              <div className="modal-actions p-4 text-right right-24">
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded-md  hover:bg-blue-400"
                  id="onSaveInvoice"
                  onClick={hanldeUpdateInvoice}
                >
                  Save
                </button>
              </div>
              <div className="modal-actions p-4 text-right right-24">
                <button
                  className=" text-white px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-400"
                  id="onEditInvoice"
                  onClick={handleEditClick}
                >
                  Edit
                </button>
              </div>
              <div className="modal-actions p-4 text-right right-24">
                <button
                  onClick={() => navigate("/homepage")}
                  className=" text-white px-4 py-2 rounded-md bg-red-800 hover:bg-red-400 close-modal"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex justify-start items-center gap-6 flex-wrap p-2">
              <div className="flex flex-col gap-2">
                <label>To</label>
                <input
                  id="companyName"
                  className="p-2 border-2"
                  placeholder="To"
                  value={companyName}
                  readOnly={true}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label>Issue Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    id="issueDate"
                    className="p-2 border-2"
                    placeholder="Issue Date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                ) : (
                  <input
                    id="issueDate"
                    className="p-2 border-2 "
                    placeholder="Issue Date"
                    value={issueDate}
                    readOnly={!isEditing}
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label>Due Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    id="dueDate"
                    className="p-2 border-2"
                    placeholder="Due Date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                ) : (
                  <input
                    id="dueDate"
                    className="p-2 border-2 "
                    placeholder="Due Date"
                    value={dueDate}
                    readOnly={!isEditing}
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label>Invoice Number</label>
                <input
                  id="invoiceNumber"
                  className="p-2 border-2 "
                  placeholder="Invoice Number"
                  value={invoiceNumber}
                  readOnly={!isEditing}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label>Reference</label>
                <input
                  id="reference"
                  className="p-2 border-2 "
                  placeholder="Reference"
                  value={reference}
                  readOnly={!isEditing}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
              <div className="grid md:grid-cols-1 gap-3">
                <div></div>

                <div className="flex flex-col gap-2">
                  <label>Currency</label>
                  {isEditing ? (
                    <select
                      id="currency"
                      className="p-2 border-2"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      {currencyOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="currency"
                      className="p-2 border-2 "
                      placeholder="Currency"
                      value={currency}
                      readOnly={!isEditing}
                    />
                  )}
                </div>
              </div>

              <div className="mt-2 flex justify-start items-center">
                <div className="flex flex-col gap-2">
                  <label>Amounts Are</label>
                  {isEditing ? (
                    <select
                      id="amountsAre"
                      className="p-2 border-2"
                      value={amountsAre}
                      onChange={(e) => setAmountsAre(e.target.value)}
                    >
                      <option value="Exclusive">Tax Exclusive</option>
                      <option value="Inclusive">Tax Inclusive</option>
                      <option value="No Tax">No Tax</option>
                    </select>
                  ) : (
                    <input
                      id="amountsAre"
                      className="p-2 border-2 "
                      placeholder="Amounts Are"
                      value={amountsAre}
                      readOnly={!isEditing}
                    />
                  )}
                </div>
              </div>
            </div>

            <hr className="mt-4" />

            {/* <!-- Table view of data --> */}
            <div className="flex justify-end w-full">
              <button
                className="btn mt-2 flex justify-end "
                onClick={handleAddLineItem}
              >
                Add
              </button>
            </div>
            <div className="max-w-[80vw] overflow-x-auto">
              <table className="table-auto mt-8">
                <thead>
                  <tr className="trBg">
                    <th className="w-32">Item</th>
                    <th className="w-56">Description</th>
                    <th className="w-32">Qty.</th>
                    <th className="w-32">Price</th>
                    <th className="w-32">Account</th>
                    <th className="w-32">Tax rate</th>
                    <th className="w-32">Region</th>
                    <th className="w-32">Amount</th>
                    <th className="w-28">Action</th>
                  </tr>
                </thead>
                <tbody id="singleInvoiceTable">
                  {lineItems?.map((elem, rowIndex) => (
                    <tr className="text-center" key={rowIndex}>
                      <td>
                        {isEditing ? (
                          <select
                            id="itemCode"
                            name="itemCode"
                            className="p-2 border-2 max-w-[6.5vw]"
                            value={elem.ItemCode}
                            onChange={(e) =>
                              handleLineItemChange(
                                rowIndex,
                                "LineItemID",
                                e.target.value
                              )
                            }
                          >
                            {items?.Items?.map((option) => (
                              <option key={option.ItemID} value={option.ItemID}>
                                {`${option.Code}`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id="itemCode"
                            name="itemCode"
                            className="p-2 border-2 max-w-[6.5vw]"
                            placeholder="Item Code"
                            value={elem.ItemCode}
                            readOnly={!isEditing && !elem[0]}
                          />
                        )}
                      </td>
                      <td>
                        <textarea
                          name="description"
                          value={elem.Description}
                          readOnly={!isEditing && !elem[0]}
                          className="text-center max-w-[8vw]"
                          onChange={(e) =>
                            handleLineItemChange(
                              rowIndex,
                              "Description",
                              e.target.value
                            )
                          }
                        ></textarea>
                      </td>
                      <td>
                        <textarea
                          name="quantity"
                          value={elem.Quantity}
                          readOnly={!isEditing && !elem[0]}
                          className="text-center max-w-[6vw]"
                          onChange={(e) =>
                            handleLineItemChange(
                              rowIndex,
                              "Quantity",
                              e.target.value
                            )
                          }
                        ></textarea>
                      </td>
                      <td>
                        <textarea
                          name="price"
                          value={elem.UnitAmount}
                          readOnly={!isEditing && !elem[0]}
                          className="text-center max-w-[6vw]"
                          onChange={(e) =>
                            handleLineItemChange(
                              rowIndex,
                              "UnitAmount",
                              e.target.value
                            )
                          }
                        ></textarea>
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            id="accountCode"
                            name="accountCode"
                            className="p-2 border-2 max-w-[6vw]"
                            value={elem.AccountCode}
                            onChange={(e) =>
                              handleLineItemChange(
                                rowIndex,
                                "AccountCode",
                                e.target.value
                              )
                            }
                          >
                            {accounts?.Accounts?.map((option) => (
                              <option
                                key={option.AccountCode}
                                value={option.AccountCode}
                              >
                                {`${option.Code}:${option.Name}`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id="accountCode"
                            name="accountCode"
                            className="p-2 border-2 max-w-[6vw]"
                            placeholder="Account Code"
                            value={elem.AccountCode}
                            readOnly={!isEditing && !elem[0]}
                          />
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            id="taxRate"
                            name="taxRate"
                            className="p-2 border-2 max-w-[6vw]"
                            // value={elem.}
                            onChange={(e) =>
                              handleLineItemChange(
                                rowIndex,
                                "TaxRate",
                                e.target.value
                              )
                            }
                          >
                            <option value="" selected disabled>
                              Select
                            </option>
                            {taxRates?.TaxRates?.map((option) => (
                              <option
                                key={option.Name}
                                // selected={option.DisplayTaxRate}
                                value={option.DisplayTaxRate}
                              >
                                {`${option.Name}: ${option.DisplayTaxRate}%`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id="taxRate"
                            name="taxRate"
                            className="p-2 border-2 max-w-[6vw]"
                            placeholder="Tax Rate"
                            value={elem.taxRate}
                            readOnly={!isEditing && !elem[0]}
                          />
                        )}
                      </td>
                      <td>
                        {" "}
                        {isEditing ? (
                          <select
                            id="region"
                            name="region"
                            className="p-2 border-2 max-w-[6vw]"
                            value={elem.region}
                            onChange={(e) =>
                              handleLineItemChange(
                                rowIndex,
                                "Region",
                                e.target.value
                              )
                            }
                          >
                            {region?.TrackingCategories[0].Options?.map(
                              (data) => (
                                <option key={data.Name} value={data.Name}>
                                  {`${data.Name}`}
                                </option>
                              )
                            )}
                          </select>
                        ) : (
                          <input
                            id="region"
                            name="region"
                            className="p-2 border-2 max-w-[6vw]"
                            placeholder="Region"
                            value={elem.region}
                            readOnly={!isEditing && !elem[0]}
                          />
                        )}
                      </td>
                      <td>
                        <textarea
                          name="amount"
                          value={elem.LineAmount}
                          readOnly={true}
                          className="text-center max-w-[6vw]"
                          onChange={(e) =>
                            handleLineItemChange(
                              rowIndex,
                              "Amount",
                              e.target.value
                            )
                          }
                        ></textarea>
                      </td>
                      <td>
                        <button
                          className="btn btn-xs btn-error text-white"
                          onClick={() => handleRemoveLineItem(rowIndex)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <hr className="mt-4" />
            <div className="flex mt-8 justify-between items-center mr-10">
              <div></div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-64">
                  <p>Subtotal</p>
                  <p id="subTotal">{getSubtotal()}</p>
                </div>
                <div className="flex items-center justify-between gap-64">
                  <p>Total Tax</p>
                  <p id="totalTax">{getTaxTotal()}</p>
                </div>

                <hr className="mt-4" />
                <div className="flex items-center justify-between mt-3 gap-64">
                  <p>Total</p>
                  <p id="total">{getSubtotal() + getTaxTotal()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditInvoice2;
