const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require("querystring");
require("dotenv").config();
const cors = require("cors");

// Route to start the OAuth 2.0 flow
router.get("/auth", (req, res) => {
  const authUrl =
    `https://login.xero.com/identity/connect/authorize?` +
    querystring.stringify({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      // scope: "offline_access openid accounting.contacts",
      scope:
        "offline_access openid profile accounting.transactions accounting.contacts accounting.settings",
    });
  res.json({ authUrl });
});

// Callback route to exchange the authorization code for an access token
router.post("/callback", async (req, res) => {
  const code = req.body.code;
  const tokenRequestData = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
  };

  try {
    const tokenResponse = await axios.post(
      "https://identity.xero.com/connect/token",
      querystring.stringify(tokenRequestData),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${CLIENT_ID}:${CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    console.log("res", tokenResponse.data);
    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;
    const expires_in = tokenResponse.data.expires_in;

    res.status(200).json({ accessToken, refreshToken, expires_in });
  } catch (error) {
    console.error("Error fetching access token:", error);
    res.status(500).send("Error fetching access token");
  }
});

// router.options("/refresh", cors());
router.post("/refresh", async (req, res) => {
  console.log(req.body);
  const refreshToken = req.body.refreshToken;
  console.log("refresh", refreshToken);
  const tokenRequestData = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };

  try {
    const tokenResponse = await axios.post(
      "https://identity.xero.com/connect/token",
      querystring.stringify(tokenRequestData),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${CLIENT_ID}:${CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    console.log("res", tokenResponse);
    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Error fetching access token:", error);
    res.status(500).send("Error fetching access token");
  }
});

router.options("/connections", cors());
router.post("/connections", cors(), async (req, res) => {
  const accessToken = req.body.accessToken;
  const URL = "https://api.xero.com/connections";

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  axios
    .get(URL, { headers })
    .then((response) => {
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

router.options("/company-invoices", cors());
router.post("/company-invoices", cors(), async (req, res) => {
  const tenantId = req.body.organizationId;
  const accessToken = req.body.accessToken;

  const URL = `https://api.xero.com/api.xro/2.0/Invoices?where=Type=="ACCPAY" AND (Status=="AUTHORISED")`;

  axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": tenantId,
        Accept: "application/json",
      },
    })
    .then((response) => {
      // console.log("Data from Xero API:", response.data);
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

router.options("/company-contacts", cors());
router.post("/company-contacts", cors(), async (req, res) => {
  const accessToken = req.body.accessToken;
  const organizationId = req.body.organizationId;
  const URL = "https://api.xero.com/api.xro/2.0/Contacts";

  axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Xero-Tenant-Id": organizationId,
      },
    })
    .then((response) => {
      // console.log("Data from Xero API:", response.data);
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

router.options("/credit-notes", cors());
router.post("/credit-notes", cors(), async (req, res) => {
  const accessToken = req.body.accessToken;
  const organizationId = req.body.organizationId;
  const URL = "https://api.xero.com/api.xro/2.0/CreditNotes";

  axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Xero-Tenant-Id": organizationId,
      },
    })
    .then((response) => {
      // console.log("Data from Xero API:", response.data);
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

router.options("/generate-payment", cors());
router.post("/generate-payment", cors(), async (req, res) => {
  const accessToken = req.body.accessToken;
  const organizationId = req.body.organizationId;
  const paymentID = req.body.paymentID;

  const URL = `https://api.xero.com/api.xro/2.0/Payments/${paymentID}`;

  axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Xero-Tenant-Id": organizationId,
      },
    })
    .then((response) => {
      // console.log("Data from Xero API:", response.data);
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

router.options("/generate-organizationInvoices", cors());
router.post("/generate-organizationInvoices", cors(), async (req, res) => {
  const accessToken = req.body.accessToken;
  const organizationId = req.body.tenantID;
  const invoiceID = req.body.invoiceID;

  const URL = `https://api.xero.com/api.xro/2.0/Invoices/${invoiceID}`;

  axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Xero-Tenant-Id": organizationId,
      },
    })
    .then((response) => {
      // console.log("Data from Xero API:", response.data);
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

router.options("/update-invoice", cors());
router.post("/update-invoice", cors(), async (req, res) => {
  const accessToken = req.body.accessToken;
  const organizationId = req.body.tenantId;
  const invoiceID = req.body.InvoiceID;
  const data = req.body.data;

  const URL = `https://api.xero.com/api.xro/2.0/Invoices/${invoiceID}`;

  axios
    .post(URL, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": organizationId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
    .then((response) => {
      // console.log("Data from Xero API:", response.data);
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

router.options("/get-invoicePdf", cors());
router.post("/get-invoicePdf", cors(), async (req, res) => {
  const accessToken = req?.body?.accessToken;
  const organizationId = req?.body?.tenantID;
  const invoiceID = req?.body?.InvoiceID;

  const URL = `https://api.xero.com/api.xro/2.0/Invoices/${invoiceID}`;

  axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": organizationId,
        Accept: "application/pdf",
      },
      responseType: "arraybuffer", // Ensure you're expecting binary data
    })
    .then((response) => {
      // Check the Content-Type header
      const contentType = response.headers["content-type"];

      if (contentType === "application/pdf") {
        // Content-Type is PDF, so you can proceed to send the PDF content
        // console.log("Data from Xero API PDF:", response.data);
        res.contentType("application/pdf"); // Set the response Content-Type
        res.send(response.data);
      } else {
        // Content-Type is not PDF; handle the response accordingly
        // console.error("Unexpected Content-Type:", contentType);
        res.status(400).json({ error: "Unexpected Content-Type" });
      }
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

router.options("/bank-accounts", cors());
router.post("/bank-accounts", cors(), async (req, res) => {
  const accessToken = req?.body?.accessToken;
  const organizationId = req?.body?.organizationId;
  // console.log("organizationId", organizationId);

  const URL = `https://api.xero.com/api.xro/2.0/Accounts?where=Status=="ACTIVE"`;

  axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": organizationId,
        Accept: "application/json",
      },
    })
    .then((response) => {
      // console.log("Bank Accounts:", response.data);
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

router.options("/batch-payments", cors());
router.post("/batch-payments", cors(), async (req, res) => {
  const accessToken = req.body.accessToken;
  const organizationId = req.body.tenantID;
  let data = req.body.data;

  const URL = "https://api.xero.com/api.xro/2.0/BatchPayments";

  axios
    .put(URL, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Xero-Tenant-Id": organizationId,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // console.log("Data from Xero API:", response.data);
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      res.status(400);
      console.error("Error fetching data from Xero API:", error);
      if (error?.response?.data?.Elements[0]?.ValidationErrors[0]) {
        res.json({
          error:
            error?.response?.data?.Elements[0]?.ValidationErrors[0]?.Message,
        });
      } else {
        res.json("Some Error Occurred.");
      }
    });
});

router.options("/tax-rates", cors());
router.post("/tax-rates", cors(), async (req, res) => {
  const accessToken = req.body.accessToken;
  const organizationId = req.body.organizationId;

  const URL = "https://api.xero.com/api.xro/2.0/TaxRates";

  axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": organizationId,
        Accept: "application/json",
      },
    })
    .then((response) => {
      // console.log("Tax Rates:", response.data);
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

router.options("/update-contact", cors());
router.post("/update-contact", cors(), async (req, res) => {
  const data = req.body.data;
  const organizationId = req.body.organizationId;
  const accessToken = req.body.accessToken;
  const contactId = req.body.contactId;

  const URL = `https://api.xero.com/api.xro/2.0/Contacts/${contactId}`;

  axios
    .post(URL, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": organizationId,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("Updated Contact", response.data);
      res.status(200).json(response.data);
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

router.options("/tracking-categories", cors());
router.post("/tracking-categories", cors(), async (req, res) => {
  const accessToken = req.body.accessToken;
  const organizationId = req.body.organizationId;

  const URL = "https://api.xero.com/api.xro/2.0/TrackingCategories";

  axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": organizationId,
        Accept: "application/json",
      },
    })
    .then((response) => {
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

router.options("/account-items", cors());
router.post("/account-items", cors(), async (req, res) => {
  const accessToken = req.body.accessToken;
  const organizationId = req.body.tenantID;

  const URL = "https://api.xero.com/api.xro/2.0/Items";

  axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Xero-Tenant-Id": organizationId,
        Accept: "application/json",
      },
    })
    .then((response) => {
      // console.log("Data from Xero API:", response.data);
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

router.options("/single-contact", cors());
router.post("/single-contact", cors(), async (req, res) => {
  const accessToken = req.body.accessToken;
  const contactId = req.body.contactId;
  const URL = `https://api.xero.com/api.xro/2.0/Contacts/${contactId}`;

  await axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // console.log("Data from Xero API:", response.data);
      res.status(200).json({ data: response.data });
    })
    .catch((error) => {
      console.error("Error fetching data from Xero API:", error);
    });
});

module.exports = router;
