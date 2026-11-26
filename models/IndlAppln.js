import mongoose from "mongoose";

const IndlApplnSchema = new mongoose.Schema(
  {
    applicationType: {
      type: String,
      default: "individual",
      required: true,
      immutable: true,
    },
    code: { type: String },

    applicantName: { type: String },
    dob: { type: String },
    isSeniorCitizen: { type: Boolean },

    orgName: { type: String },
    gstNum: { type: String },

    designation: { type: String },

    residenceAddress: { type: String },
    phone: { type: String },
    mobile: { type: String, unique: true },
    email: { type: String, unique: true },

    officeAddress: { type: String },
    officePhone: { type: String },

    membershipFor: { type: String },

    lma: {
      name: { type: String },
      membershipNum: { type: String },
    },

    qualifications: [
      {
        type: {
          institution: { type: String },
          title: { type: String },
          duration: { type: String },
          awardYear: { type: String },
        },
      },
    ],

    trainings: [
      {
        type: {
          title: { type: String },
          institution: { type: String },
          duration: { type: String },
          dates: { type: String },
        },
      },
    ],

    nature: { type: String },

    turnover: { type: String },

    experiences: [
      {
        type: {
          from: { type: String },
          to: { type: String },
          organization: { type: String },
          designation: { type: String },
          detail: { type: String },
          reportingTo: { type: String },
        },
      },
    ],

    jobProfile: { type: String },

    references: [
      {
        type: {
          name: { type: String },
          address: { type: String },
          contactNum: { type: String },
        },
      },
    ],

    // Attachments
    photo: {
      type: {
        name: { type: String },
        location: { type: String },
        key: { type: String },
      },
    },

    ageProof: {
      type: {
        name: { type: String },
        location: { type: String },
        key: { type: String },
      },
    },

    degreeCertificate: {
      type: {
        name: { type: String },
        location: { type: String },
        key: { type: String },
      },
    },

    bioData: {
      type: {
        name: { type: String },
        location: { type: String },
        key: { type: String },
      },
    },

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

const IndlAppln = mongoose.model("IndlAppln", IndlApplnSchema);

export { IndlAppln };
