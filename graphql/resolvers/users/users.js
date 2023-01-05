const User = require("../../../models/user");
const Auth = require("../../../services/auth.service");
const {
  createDwollaCustomer,
  getWalletBalance,
  deposit,
  withdraw,
  createLabel,
  getTransactions,
} = require("../../../services/dwolla");
const { sendMail } = require("../../../services/email.service");
const { generateOTP } = require("../../../services/otp.service");
const {
  linkTokenCreate,
  publicTokenExchange,
  getIdentity,
  getAccountInfo,
  connectDwolla,
} = require("../../../services/plaid");

module.exports = {
  Query: {
    getUsers: () => User.find(),

    getUser: async (_, { id }, context) => {
      if (!context.userId) throw new Error("You must be authenticated!");
      if (context.userId !== id)
        throw new Error("You can only see you own datas little fella!");

      return User.findById(id);
    },
    createDwollaAccount: async () => {
      const link = await createDwollaCustomer();
      return link;
    },
    getAccountInfo: async (_, { token }) => {
      const res = await getAccountInfo(token);
      return res;
    },
    getWalletBalance: async (_, { userId }) => {
      const balance = await getWalletBalance(userId);
      return balance;
    },
    getTransactions: async (_, { userId }) => {
      const transactions = await getTransactions(userId);
      return transactions;
    },
  },

  Mutation: {
    signup: async (_, { email, name, phone }) => {
      const userdata = await User.findOne({
        email,
      });
      if (userdata) {
        return { message: "User already exists!" };
      }

      const otpGenerated = generateOTP();
      const user = new User({
        email,
        name,
        phone,
        otp: otpGenerated,
      });
      const response = await user.save();
      try {
        await sendMail({
          to: email,
          OTP: otpGenerated,
        });
        return {
          message: "Please check your email for OTP verification.",
          userId: response._id,
        };
      } catch (error) {
        return "Unable to sign up, Please try again later.";
      }
    },

    verifyOtp: async (_, { email, otp }) => {
      const user = await User.findOne({
        email,
      });
      if (!user) {
        return "User not found!";
      }
      if (user && user.otp !== otp) {
        return "Invalid Otp!";
      }
      return {
        message: "Otp verification successful!",
        jwt: Auth.generateJwt({
          userId: user._id,
          email: user.email,
        }),
      };
    },

    linkBank: async (_, { userId }) => {
      try {
        const link = await linkTokenCreate(userId);
        return {
          message:
            "Paste this link in the UI(https://line-wallet-ui.onrender.com/) to connect your bank through plaid.",
          link,
        };
      } catch (e) {
        return "Unable to get link token!";
      }
    },

    exchangeToken: async (_, { userId, token }) => {
      try {
        const accessToken = await publicTokenExchange(token);
        User.findOneAndUpdate({ _id: userId }, { token: accessToken });
        //Dwolla account setup
        const identities = await getIdentity(accessToken);
        const res = await connectDwolla(userId, accessToken, identities);
        return { accessToken, ...res };
      } catch (e) {
        return "Unable to exchange token!";
      }
    },

    getIdentity: async (_, { token }) => {
      try {
        const identity = await getIdentity(token);
        return identity;
      } catch (e) {
        return "Unable to fetch identity!";
      }
    },

    deposit: async (_, { userId, amount }) => {
      await deposit(userId, amount);
      return "Deposit successful!";
    },

    withdraw: async (_, { userId, amount }) => {
      await withdraw(userId, amount);
      return "Withdraw successful!";
    },

    createLabel: async (_, { userId, amount }) => {
      const res = await createLabel(userId, amount);
      return res;
    },
  },
};
