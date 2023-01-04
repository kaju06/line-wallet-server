const Sib = require("sib-api-v3-sdk");
const client = Sib.ApiClient.instance;
const KEY =
  "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";
const apiKey = client.authentications["api-key"];
apiKey.apiKey = KEY;
const partnerKey = client.authentications["partner-key"];
partnerKey.apiKey = KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

const sender = {
  email: "dalaikajal06@gmail.com",
  name: "Kajal Dalai",
};

module.exports.sendMail = async (params) => {
  const receivers = [
    {
      email: params.to,
    },
  ];
  try {
    return await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Verify OTP",
      htmlContent: `
      <div
      class="container"
      style="max-width: 90%; margin: auto; padding-top: 20px"
    >
      <h2>Welcome ${params.to}!</h2>
      <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
      <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${params.OTP}</h1>
 </div>`,
      params: {
        role: "Backend",
      },
    });
  } catch (e) {
    console.log("Error while sending otp.", e);
  }
};
