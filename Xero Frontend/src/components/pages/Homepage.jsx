import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import LoadingIcon from "../../assets/loading.json";
import exportFromJSON from "export-from-json";

const Homepage = () => {
  function formatDateAsYYMMDD(date) {
    const year = date.getFullYear().toString().slice(-2); // Extract the last two digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based, so add 1
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}${month}${day}`;
  }

  // Example usage:
  const currDate = new Date();
  const formattedDate = formatDateAsYYMMDD(currDate);

  const apiUrl = "http://localhost:5000/api/xero/";

  const [imgFile, setImgFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [data, setData] = useState(null);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [companyData, setCompanyData] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedAccountCode, setSelectedAccountCode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedData, setSelectedData] = useState(null);
  const [selectedDataInvoice, setSelectedDataInvoice] = useState([]);
  const [supplierInvoices, setSupplierInvoices] = useState(null);

  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [contact, setContact] = useState(null);
  const [paymentType, setPaymentType] = useState("Fast");
  const [referenceValue, setReferenceValue] = useState("");
  const [ref, setRef] = useState(`PV${formattedDate}-001F`);

  let accessToken = JSON.parse(localStorage.getItem("xeroToken"))?.accessToken;

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedDataInvoice.length === 0) {
      setIsButtonDisabled(true);
    }
  }, [selectedDataInvoice]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(apiUrl + "connections", {
          accessToken: accessToken,
        });
        console.log(response?.data?.data[0]?.tenantId);

        setData(response?.data?.data);

        setSelectedTenantId(response?.data?.data[0]?.tenantId);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    if (!JSON.parse(localStorage.getItem("xeroToken"))) {
      navigate("/xero-auth");
    }
  }, [accessToken, navigate]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        // Fetch company invoices
        const invoicesResponse = await axios.post(apiUrl + "company-invoices", {
          accessToken: accessToken,
          organizationId: selectedTenantId,
        });
        const invoices = invoicesResponse?.data?.data;

        // Fetch contact details
        const contactsResponse = await axios.post(apiUrl + "company-contacts", {
          accessToken: accessToken,
          organizationId: selectedTenantId,
        });
        const contacts = contactsResponse?.data?.data;

        // Fetch Credit Notes
        const creditNotesResponse = await axios.post(apiUrl + "credit-notes", {
          accessToken: accessToken,
          organizationId: selectedTenantId,
        });
        const creditNotes = creditNotesResponse?.data?.CreditNotes || []; // Use an empty array as a fallback

        // Match invoices with contact details and Credit Notes based on ContactID
        const matchedInvoices = invoices?.Invoices?.map((invoice) => {
          const contactID = invoice?.Contact?.ContactID;
          const matchingContact = contacts?.Contacts?.find(
            (contact) => contact.ContactID === contactID
          );

          // Attach contact details to the invoice
          if (matchingContact) {
            invoice.ContactDetails = matchingContact;
          }

          // Find Credit Notes for the same contact if creditNotes is defined
          if (creditNotes) {
            const matchingCreditNotes = creditNotes?.filter(
              (creditNote) => creditNote.Contact.ContactID === contactID
            );

            // Attach Credit Notes to the invoice
            invoice.CreditNotes = matchingCreditNotes;
          }

          return invoice;
        });

        matchedInvoices?.sort((a, b) => {
          const nameA = a.Contact.Name.toUpperCase(); // ignore case
          const nameB = b.Contact.Name.toUpperCase();

          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          // names must be equal
          return 0;
        });

        setCompanyData(matchedInvoices);
        setLoading(false);
        console.log(
          "Invoices with Contact Details and Credit Notes:",
          matchedInvoices
        );

        // const response = await axios.post(apiUrl + "bank-accounts", {
        //   accessToken: accessToken,
        //   organizationId: selectedTenantId,
        // });
        // console.log("bank accounts", response.data.data);

        // setAccounts(response.data.data);
        // setSelectedAccountId(response.data.data.Accounts[0]?.AccountID);
        // setSelectedAccountCode(response.data.data.Accounts[0]?.Code);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchAccounts = async () => {
      try {
        const response = await axios.post(apiUrl + "bank-accounts", {
          accessToken: accessToken,
          organizationId: selectedTenantId,
        });
        // console.log(response.data.data);

        setAccounts(response?.data?.data);
        setSelectedAccountId(response?.data?.data?.Accounts[0]?.AccountID);
        setSelectedAccountCode(response?.data?.data?.Accounts[0]?.Code);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAccounts();

    fetchCompanyData();
  }, [accessToken, selectedTenantId]);

  const handleCompanyChange = (id) => {
    console.log(id);
    setSelectedTenantId(id);
  };

  const handleAccount = (elem) => {
    let splitStr = elem.split(",");
    setSelectedAccountId(splitStr[0]);
    setSelectedAccountCode(splitStr[1]);
    refreshData();
  };

  // console.log(selectedAccountId);

  const openModal = async (data) => {
    console.log(data);

    const response = await axios.post(
      apiUrl + "generate-organizationInvoices",
      {
        accessToken: accessToken,
        invoiceID: data.InvoiceID,
        tenantID: selectedTenantId,
      }
    );

    console.log(response.data.data);
    setSupplierInvoices(response.data.data);
    setSelectedData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedData(null);
    setIsModalOpen(false);
  };

  const openBankModal = async (data) => {
    setContact(data);
    setIsBankModalOpen(true);
  };

  const closeBankModal = () => {
    setIsBankModalOpen(false);
  };

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    setSelectedDate(selectedDate);
  };

  const handleCheckboxChange = async (selectedInvoice) => {
    console.log("Selected Account ID:", selectedAccountId);
    try {
      const response = await axios.post(
        apiUrl + "generate-organizationInvoices",
        {
          accessToken: accessToken,
          invoiceID: selectedInvoice.InvoiceID,
          tenantID: selectedTenantId,
        }
      );

      const invoiceData = response.data.data;

      // Check if the invoice is already selected
      const isSelected = selectedDataInvoice.some(
        (invoice) =>
          invoice?.Payments[0].Invoice?.InvoiceID === selectedInvoice.InvoiceID
      );

      if (isSelected) {
        // If already selected, remove it from the selectedDataInvoice
        setSelectedDataInvoice((prevSelectedData) =>
          prevSelectedData.filter(
            (invoice) =>
              invoice?.Payments[0].Invoice.InvoiceID !==
              selectedInvoice.InvoiceID
          )
        );
      } else {
        // If not selected, add it to the selectedDataInvoice
        setSelectedDataInvoice((prevSelectedData) => [
          ...prevSelectedData,
          {
            Account: {
              AccountID: selectedAccountId,
            },
            // Reference: selectedInvoice.Reference,
            Details: selectedInvoice.Reference,
            Date: selectedInvoice.DueDateString,
            Payments: [
              {
                Account: {
                  Code: selectedAccountCode,
                },
                Date: selectedInvoice.DateString,
                Amount: selectedInvoice.AmountDue,
                Invoice: {
                  InvoiceID: selectedInvoice.InvoiceID,
                  LineItems: invoiceData?.Invoices[0]?.LineItems,
                  Contact: selectedInvoice.Contact,
                  Type: selectedInvoice.Type,
                },
              },
            ],
          },
        ]);
      }
      setIsButtonDisabled(false);
    } catch (error) {
      console.error("Error handling checkbox change:", error);
    }
  };

  const refreshData = async () => {
    setIsButtonDisabled(true);
    setLoading(true);
    try {
      // Fetch company invoices
      const invoicesResponse = await axios.post(apiUrl + "company-invoices", {
        accessToken: accessToken,
        organizationId: selectedTenantId,
      });
      const invoices = invoicesResponse?.data?.data;

      // Fetch contact details
      const contactsResponse = await axios.post(apiUrl + "company-contacts", {
        accessToken: accessToken,
        organizationId: selectedTenantId,
      });
      const contacts = contactsResponse?.data?.data;

      // Fetch Credit Notes
      const creditNotesResponse = await axios.post(apiUrl + "credit-notes", {
        accessToken: accessToken,
        organizationId: selectedTenantId,
      });
      const creditNotes = creditNotesResponse?.data?.CreditNotes || []; // Use an empty array as a fallback

      // Match invoices with contact details and Credit Notes based on ContactID
      const matchedInvoices = invoices.Invoices.map((invoice) => {
        const contactID = invoice?.Contact?.ContactID;
        const matchingContact = contacts.Contacts.find(
          (contact) => contact.ContactID === contactID
        );

        // Attach contact details to the invoice
        if (matchingContact) {
          invoice.ContactDetails = matchingContact;
        }

        // Find Credit Notes for the same contact if creditNotes is defined
        if (creditNotes) {
          const matchingCreditNotes = creditNotes.filter(
            (creditNote) => creditNote.Contact.ContactID === contactID
          );

          // Attach Credit Notes to the invoice
          invoice.CreditNotes = matchingCreditNotes;
        }

        return invoice;
      });

      matchedInvoices?.sort((a, b) => {
        const nameA = a.Contact.Name.toUpperCase(); // ignore case
        const nameB = b.Contact.Name.toUpperCase();

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      });

      setCompanyData(matchedInvoices);
      setLoading(false);
      setSelectedDataInvoice([]);
      console.log(
        "Invoices with Contact Details and Credit Notes:",
        matchedInvoices
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  console.log(selectedTenantId);

  const flattenData = (data, name) => {
    console.log("data", data);
    const flattenedData = [];

    for (const batchPayment of data) {
      for (const payment of batchPayment.Payments) {
        const flatItem = {
          AccountID: batchPayment.Account.AccountID,
          "Contact Name": name,
          "Batch PaymentID": batchPayment.BatchPaymentID,
          "Payment Date": selectedDate,
          "Payment Amount": payment.Amount,
          "Payment Reference Number": ref || "",
          InvoiceID: payment.Invoice.InvoiceID,
          PaymentID: payment.PaymentID,
          Type: batchPayment.Type,
          Status: batchPayment.Status,
        };

        flattenedData.push(flatItem);
      }
    }

    return flattenedData;
  };

  function updatePaymentsDate(paymentsArray) {
    return paymentsArray.map((payment) => {
      payment.Date = selectedDate;
      return payment;
    });
  }

  const generateBatchPayment = async () => {
    if (!selectedDate) {
      return toast.error("Please select the payment date!");
    }
    console.log("Select", selectedDataInvoice);

    if (!selectedDataInvoice || selectedDataInvoice.length === 0) {
      return toast.error("Please select a field to genearate payment.");
    }

    // Map through the array of objects
    const updatedArray = selectedDataInvoice.map((obj) => {
      obj.Date = selectedDate;
      if (obj.Payments) {
        obj.Payments = updatePaymentsDate(obj.Payments);
      }
      return obj;
    });

    const updatedRef = selectedDataInvoice.map((obj) => {
      // obj.Reference = ref || "";
      obj.Details = ref || "";

      return obj;
    });

    console.log(updatedArray);
    console.log(updatedRef);

    try {
      let data = {
        BatchPayments: selectedDataInvoice,
      };

      const response = await axios.post(apiUrl + "batch-payments", {
        data: JSON.stringify(data),
        accessToken: accessToken,
        tenantID: selectedTenantId,
      });

      console.log("batch", response?.data?.data);

      if (response?.data?.data) {
        const flatData = flattenData(
          response?.data?.data?.BatchPayments,
          updatedRef[0]?.Payments[0]?.Invoice?.Contact?.Name
        );

        exportFromJSON({
          data: flatData,
          fileName: "Batch Data",
          exportType: exportFromJSON.types.csv,
        });

        toast.success("Batch Created Successfully");
        refreshData();
      }
    } catch (error) {
      console.log(error);
      // setSelectedDataInvoice([]);
      toast.error(error.response.data.error);
    }
  };

  // const uploadFile = () => {};

  const onImageChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      // Create an array of selected files
      const selectedFiles = Array.from(event.target.files);
      setImgFile(selectedFiles);
    }
  };

  const handleFileUpload = async () => {
    if (!imgFile || imgFile?.length === 0) {
      toast.error("Please select a file to upload");
    } else {
      let formData = new FormData();

      // Append each file to the form data
      for (let i = 0; i < imgFile?.length; i++) {
        formData.append("imgFile", imgFile[i]);
        console.log(imgFile[i]);
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/api/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("response", response);
        toast.success("File uploaded successfully");
      } catch (error) {
        // Handle the error
        console.error("Error uploading files:", error);
        toast.error("Some error while uploading file");
      }
    }
  };

  const saveBankAccountNumber = async () => {
    if (!bankAccountNumber || bankAccountNumber === "") {
      return toast.error("Please enter the bank account number");
    }

    let bankNumber;

    if (swiftCode || swiftCode !== "") {
      bankNumber = bankAccountNumber + "_" + swiftCode;
    } else if (!swiftCode || swiftCode == "") {
      bankNumber = bankAccountNumber;
    }

    const contactObj = {
      Contacts: [
        {
          ContactID: contact?.Contact?.ContactID,
          Name: contact?.Contact?.Name,
          BankAccountDetails: bankNumber,
          BatchPayments: {
            BankAccountNumber: bankNumber,
            Details: "",
            // Reference: "",
          },
        },
      ],
    };

    console.log(contactObj);

    const response = await axios.post(apiUrl + "update-contact", {
      data: JSON.stringify(contactObj),
      organizationId: selectedTenantId,
      accessToken: accessToken,
      contactId: contact?.Contact?.ContactID,
    });

    console.log(response);
    if (response?.status === 200) {
      setBankAccountNumber("");
      setSwiftCode("");
      toast.success("Bank Details Updated Successfully.");
      closeBankModal();
      refreshData();
    } else {
      toast.success("Some Error Occurred while updating.");
      setBankAccountNumber("");
      setSwiftCode("");
      closeBankModal();
      refreshData();
    }
  };

  const downloadPdf = async (elem) => {
    console.log(elem);
    try {
      console.log("click");
      const response = await axios.post(
        apiUrl + "get-invoicePdf",
        {
          accessToken: accessToken,
          tenantID: selectedTenantId,
          InvoiceID: elem?.InvoiceID,
        },
        { responseType: "arraybuffer" }
      );

      if (response.status !== 200) {
        toast.error("API Error: Error while downloading pdf");
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
      link.download = elem?.Contact?.Name; // Specify the file name here

      // Trigger a click event on the link to start the download
      link.click();

      // Clean up by revoking the URL to free up resources
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const today = new Date();
  const todayFormatted = today.toISOString().split("T")[0];

  console.log(paymentType);

  const handlePaymentChange = (val) => {
    setPaymentType(val);
    console.log(paymentType);
    if (val == "Fast") {
      setRef(`PV${formattedDate}-001F`);
    } else if (val == "Paynow") {
      setRef(`PV${formattedDate}-001P`);
    } else if (val == "TT") {
      setRef(`PV${formattedDate}-001T`);
    }

    console.log(ref);
  };

  if (accessToken) {
    return (
      <>
        {!data ? (
          <div className="flex justify-center items-center m-auto">
            <Lottie animationData={LoadingIcon} />
          </div>
        ) : (
          <div className="flex flex-col w-full px-6 ">
            <div className="header py-4">
              <h1 className="text-2xl font-semibold">Companies</h1>
            </div>

            <div className="searchBar p-4"></div>

            <div className=" grid grid-cols-2">
              <div className="flex gap-4 flex-col">
                <div className="flex gap-4">
                  <label htmlFor="company" className="label font-semibold">
                    Compnay Name:
                  </label>
                  <select
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    name="company"
                    id="company"
                  >
                    {data &&
                      data.map((elem) => (
                        <option key={elem.tenantId} value={elem.tenantId}>
                          {elem.tenantName}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <label htmlFor="payments" className="label font-semibold">
                    Make payments using:
                  </label>

                  <select
                    onChange={(e) => handleAccount(e.target.value)}
                    name="payments"
                    id="payments"
                    className="max-w-[12vw]"
                  >
                    {accounts?.Accounts.length > 0 &&
                      accounts.Accounts?.map((elem) => (
                        <option
                          key={elem.AccountID}
                          value={[elem.AccountID, elem.Code]}
                        >
                          {elem.Name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <label htmlFor="paymentType" className="label font-semibold">
                    Select Payment Type:
                  </label>
                  <select
                    onChange={(e) => handlePaymentChange(e.target.value)}
                    name="paymentType"
                    id="paymentType"
                    className="max-w-[12vw]"
                  >
                    <option value="Fast">DBS-Fast</option>
                    <option value="Paynow">DBS-Paynow</option>
                    <option value="TT">DBS-TT</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <label htmlFor="reference" className="label font-semibold">
                    Payment Reference No:
                  </label>
                  <input
                    type="text"
                    onChange={(e) => setRef(e.target.value)}
                    value={ref}
                    className="input input-bordered bg-transparent text-black"
                  />
                </div>
              </div>
              <div className="flex gap-4 flex-wrap items-center">
                <div className="flex justify-center items-center gap-4 font-semibold">
                  <label htmlFor="paymentDate">Select Payment Date</label>
                  <input
                    type="date"
                    name="paymentDate"
                    id="paymentDate"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={todayFormatted}
                  />
                </div>
                <button
                  className={`btn ${
                    isButtonDisabled ? "btn-disabled" : "btn-primary"
                  }`}
                  onClick={generateBatchPayment}
                  disabled={isButtonDisabled}
                >
                  Request Payment File
                </button>
                {/* <button className="btn btn-primary" onClick={uploadFile}>
                  Upload File
                </button> */}
                {/* <FilePicker /> */}

                <input
                  type="file"
                  id="imgFile"
                  name="imgFile"
                  className="file-input file-input-bordered w-full max-w-xs sm:max-w-[20rem]"
                  multiple
                  onChange={onImageChange}
                />
                <button onClick={handleFileUpload} className="btn btn-primary">
                  Upload
                </button>

                <button className="btn btn-primary" onClick={refreshData}>
                  Refresh Invoice List from Xero
                </button>
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center items-center m-auto">
                <Lottie animationData={LoadingIcon} />
              </div>
            ) : (
              <div className="overflow-x-auto mt-12">
                {companyData?.length === 0 ? (
                  <>
                    <h2 className="text-center">No Data Found!</h2>
                  </>
                ) : (
                  <table className="table">
                    <thead>
                      <tr className="font-semibold">
                        <th></th>
                        <th>Supplier Name</th>
                        <th>Invoice Number</th>
                        <th>Email</th>
                        <th>Account Number</th>
                        <th>Bank Details</th>
                        <th>Currency</th>
                        <th>Amount Due</th>
                        <th>Total</th>
                        <th>Download</th>
                        <th>View in XERO</th>
                        <th>Select</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyData &&
                        companyData?.map((elem, i) => (
                          <tr key={elem.InvoiceID}>
                            <th>{i + 1}</th>
                            <td>{elem?.ContactDetails.Name}</td>
                            <td>
                              {elem?.InvoiceNumber
                                ? elem?.InvoiceNumber
                                : "N/A"}
                            </td>
                            <td>
                              {elem?.ContactDetails.EmailAddress
                                ? elem?.ContactDetails.EmailAddress
                                : "N/A"}
                            </td>
                            <td>
                              {elem?.ContactDetails?.BankAccountDetails
                                ? elem?.ContactDetails?.BankAccountDetails
                                : "N/A"}
                            </td>
                            <td>
                              {elem?.ContactDetails?.BankAccountDetails ? (
                                <p
                                  className="underline cursor-pointer font-bold"
                                  onClick={() => {
                                    openBankModal(elem);
                                  }}
                                >
                                  YES
                                </p>
                              ) : (
                                <p
                                  className="underline cursor-pointer"
                                  onClick={() => {
                                    openBankModal(elem);
                                  }}
                                >
                                  NO
                                </p>
                              )}
                            </td>
                            <td>{elem.CurrencyCode}</td>
                            <td>{elem.AmountDue}</td>
                            <td
                              className="underline cursor-pointer"
                              onClick={() => {
                                openModal(elem);
                              }}
                            >
                              {elem.Total}
                            </td>
                            <td
                              className="underline cursor-pointer"
                              onClick={() => downloadPdf(elem)}
                            >
                              Download
                            </td>
                            <td>
                              <a
                                className="font-bold underline"
                                target="_blank"
                                rel="noreferrer"
                                href={`https://go.xero.com/AccountsPayable/View.aspx?invoiceID=${elem?.InvoiceID}`}
                              >
                                View
                              </a>
                            </td>

                            <td>
                              <input
                                id={`batch-${i}`}
                                onChange={() => handleCheckboxChange(elem)}
                                type="checkbox"
                                name="batch"
                              />{" "}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {isModalOpen && (
          <div className="w-full h-screen fixed flex items-center justify-center m-auto">
            <div className="modal-box min-w-[65vw] min-h-[65vh] outline outline-1 outline-slate-950">
              <form method="dialog">
                <button
                  onClick={closeModal}
                  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                >
                  ✕
                </button>
              </form>
              <div className=" flex items-center justify-between">
                <div className="flex gap-4 flex-col">
                  <div className="flex gap-4">
                    <label htmlFor="supplierName" className="label">
                      <span className="font-semibold">
                        Supplier Name:&nbsp;
                      </span>
                      {supplierInvoices?.Invoices?.[0].Contact.Name}
                    </label>
                  </div>
                </div>
              </div>
              {supplierInvoices?.Invoices?.length > 0 ? (
                <div className="overflow-x-auto mt-12">
                  <table className="table">
                    <thead>
                      <tr>
                        <th></th>
                        <th className="font-bold">Invoice Number</th>
                        <th>Currency</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierInvoices &&
                        supplierInvoices?.Invoices?.map((elem, i) => (
                          <tr key={elem?.InvoiceID}>
                            <th>{i + 1}</th>
                            <td>{elem?.InvoiceNumber || "N/A"}</td>
                            <td>{elem?.CurrencyCode || "N/A"}</td>

                            <td>{elem.Total}</td>
                            <td>
                              <div>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/edit-invoice/${elem.InvoiceID}/${selectedTenantId}`,
                                      {
                                        state: elem,
                                      }
                                    )
                                  }
                                  className="btn btn-accent text-white"
                                >
                                  View
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
          </div>
        )}

        {isBankModalOpen && (
          <div className="w-full h-screen fixed flex items-center justify-center m-auto">
            <div className="modal-box min-w-[50vw] min-h-[50vh] outline outline-1 outline-slate-950 flex flex-col">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button
                  onClick={closeBankModal}
                  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                >
                  ✕
                </button>
              </form>
              <div className=" flex items-center">
                <div className="flex gap-4 flex-col">
                  <h3 className="font-semibold">Bank Details:</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-center items-center">
                      <label htmlFor="bankAccount" className="min-w-[8rem]">
                        Account Number:
                      </label>
                      <input
                        className="input input-bordered w-full max-w-xs min-w-[20rem] ml-1"
                        type="text"
                        id="bankAccount"
                        placeholder="Bank Account Number"
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-center items-center gap-4">
                      <label htmlFor="swiftCode" className="min-w-[7rem]">
                        Swift Code:
                      </label>
                      <input
                        className="input input-bordered w-full max-w-xs min-w-[20rem] ml-1"
                        type="text"
                        id="swiftCode"
                        placeholder="Swift Code"
                        onChange={(e) => setSwiftCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="btn btn-primary ml-6 mt-10"
                onClick={saveBankAccountNumber}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </>
    );
  } else
    return (
      <>
        <h2>Auth Token Expired! Login again with XERO</h2>
        <Link to="/xero-auth">
          <button>Xero-Auth</button>
        </Link>
      </>
    );
};

export default Homepage;
