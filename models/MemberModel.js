import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    orgName: { type: String, required: true },
    designation: { type: String, required: true },
    photo: {
      type: {
        name: { type: String },
        location: { type: String },
        key: { type: String },
      },
      required: true,
    },

    // email: { type: String, unique: true },
    // mobile: { type: String, unique: true },

    // expiryDate: { type: Date },

    // code: { type: String },

    // // important
    // role: { type: String, default: "member", required: true, immutable: true },
    // isActive: { type: Boolean, default: true },

    // // For individual member

    // applicantName: { type: String },
    // dob: { type: String },
    // isSeniorCitizen: { type: Boolean },

    // orgName: { type: String },
    // gstNum: { type: String },

    // designation: { type: String },

    // residenceAddress: { type: String },
    // phone: { type: String },

    // officeAddress: { type: String },
    // officePhone: { type: String },

    // membershipFor: { type: String },

    // lma: {
    //     name: { type: String },
    //     membershipNum: { type: String }
    // },

    // qualifications: [
    //     {
    //         type: {
    //             institution: { type: String },
    //             title: { type: String },
    //             duration: { type: String },
    //             awardYear: { type: String },
    //         }
    //     }
    // ],

    // trainings: [
    //     {
    //         type: {
    //             title: { type: String },
    //             institution: { type: String },
    //             duration: { type: String },
    //             dates: { type: String }
    //         }
    //     }
    // ],

    // nature: { type: String },

    // turnover: { type: String },

    // experiences: [
    //     {
    //         type: {
    //             from: { type: String },
    //             to: { type: String },
    //             organization: { type: String },
    //             designation: { type: String },
    //             detail: { type: String },
    //             reportingTo: { type: String },

    //         }
    //     }
    // ],

    // jobProfile: { type: String },

    // references: [
    //     {
    //         type: {
    //             name: { type: String },
    //             address: { type: String },
    //             contactNum: { type: String },
    //         }
    //     }
    // ],

    // // Attachments
    // photo: {
    //     type: {
    //         name: { type: String },
    //         location: { type: String },
    //         key: { type: String },
    //     }
    // },

    // ageProof: {
    //     type: {
    //         name: { type: String },
    //         location: { type: String },
    //         key: { type: String },
    //     }
    // },

    // degreeCertificate: {
    //     type: {
    //         name: { type: String },
    //         location: { type: String },
    //         key: { type: String },
    //     }
    // },

    // bioData: {
    //     type: {
    //         name: { type: String },
    //         location: { type: String },
    //         key: { type: String },
    //     }
    // },

    // hasRenewalPay: { type: Boolean },
    // payMode: { type: String },

    // // For both Coroporate and associate corporate

    // postalAddress: { type: String },

    // commnAddress: { type: String },
    // fax: { type: String },

    // executives: { type: Number },
    // supervisors: { type: Number },
    // workers: { type: Number },

    // capitalEmployed: { type: String },
    // paidupCapital: { type: String },

    // meetReps: [
    //     {
    //         type: {
    //             rid: { type: Number },
    //             name: { type: String },
    //             designation: { type: String },
    //             telephone: { type: String },
    //             mobile: { type: String },
    //             email: { type: String },
    //             photo: {
    //                 type: {
    //                     name: { type: String },
    //                     location: { type: String },
    //                     key: { type: String },
    //                 }
    //             },
    //         }
    //     }
    // ],

    // commnMode: { type: String },

    // amount: {type: Number},
    // remark: {type: String},
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", MemberSchema);

export { Member };
