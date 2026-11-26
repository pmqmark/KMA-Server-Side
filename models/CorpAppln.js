import mongoose from "mongoose";

const CorpApplnSchema = new mongoose.Schema(
  {
    applicationType: {
      type: String,
      default: "corporate",
      required: true,
      immutable: true,
    },
    code: { type: String },

    orgName: { type: String },
    gstNum: { type: String },
    postalAddress: { type: String },

    commnAddress: { type: String },
    phone: { type: String },
    mobile: { type: String, unique: true },
    fax: { type: String },
    email: { type: String, unique: true },

    nature: { type: String },
    turnover: { type: String },

    executives: { type: Number },
    supervisors: { type: Number },
    workers: { type: Number },

    capitalEmployed: { type: String },
    paidupCapital: { type: String },

    meetReps: [
      {
        type: {
          rid: { type: Number },
          name: { type: String },
          designation: { type: String },
          telephone: { type: String },
          mobile: { type: String },
          email: { type: String },
          photo: {
            type: {
              name: { type: String },
              location: { type: String },
              key: { type: String },
            },
          },
        },
      },
    ],

    references: [
      {
        type: {
          name: { type: String },
          address: { type: String },
          contactNum: { type: String },
        },
      },
    ],

    commnMode: { type: String },

    hasRenewalPay: { type: Boolean },
    payMode: { type: String },

    signature: {
      type: {
        name: { type: String },
        location: { type: String },
        key: { type: String },
      },
    },

    // important
    status: { type: String, default: "pending" },

    amount: { type: Number },
    remark: { type: String },
  },
  { timestamps: true }
);

const CorpAppln = mongoose.model("CorpAppln", CorpApplnSchema);

export { CorpAppln };
