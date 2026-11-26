import { isValidObjectId } from "mongoose";
import { Member } from "../../models/MemberModel.js";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const applicationCtrl = {};

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { IndlAppln } from "../../models/IndlAppln.js";
import { CorpAppln } from "../../models/CorpAppln.js";
import { AscCorpAppln } from "../../models/AscCorpAppln.js";
import { StrtpAppln } from "../../models/StrtpAppln.js";
import { generateApplicationPdf } from "../../utils/applicationPdf.js";

const pdfModels = {
  individual: IndlAppln,
  corporate: CorpAppln,
  associate: AscCorpAppln,
  // startup: StartupAppln,   // add your startup application model here
};

applicationCtrl.DownloadApplicationPdf = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = pdfModels[type];

    if (!Model)
      return res.status(400).json({ msg: "Invalid application type" });
    if (!isValidObjectId(id))
      return res.status(400).json({ msg: "Invalid id" });

    const data = await Model.findById(id).lean();
    if (!data) return res.status(404).json({ msg: "Application not found" });

    const pdf = await generateApplicationPdf(type, data);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${type}-application-${id}.pdf"`,
    });
    res.send(pdf);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to generate PDF" });
  }
};

dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault("Asia/Kolkata");

// Application CRUD

applicationCtrl.GetApplication = async (req, res) => {
  try {
    const Id = req.params.id;
    const type = req.query.type;

    if (!isValidObjectId(Id))
      return res.status(409).json({ msg: "Invalid id" });

    let application = {};
    if (type === "individual") {
      application = await IndlAppln.findById(Id).lean();
    } else if (type === "corporate") {
      application = await CorpAppln.findById(Id).lean();
    } else if (type === "associate") {
      application = await AscCorpAppln.findById(Id).lean();
    } else if (type === "startup") {
      application = await StrtpAppln.findById(Id).lean();
    }

    res.status(200).json({ application });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

applicationCtrl.GetAllApplications = async (req, res) => {
  try {
    //search query;
    const searchQuery = req.query.search;
    const status = req.query.status;
    const type = req.query.type || "individual";

    // Paginators
    const page = parseInt(req.query.page) || 1;
    const entries = parseInt(req.query.entries) || 10;

    const filters = { status: { $ne: "approved" } };

    const { month, year } = req.query;

    if (month && year) {
      filters.$expr = {
        $and: [
          { $eq: [{ $month: "$createdAt" }, month] },
          { $eq: [{ $year: "$createdAt" }, year] },
        ],
      };
    }

    const { date } = req.query;

    if (date) {
      const parsedDate = dayjs(date, "DD-MM-YYYY");

      const startOfDay = parsedDate.startOf("day").toISOString();
      const endOfDay = parsedDate.endOf("day").toISOString();

      filters.createdAt = {
        $gte: startOfDay,
        $lt: endOfDay,
      };
    }

    if (searchQuery) {
      const regexPattern = new RegExp(searchQuery, "i");

      filters.$or = [
        { applicantName: { $regex: regexPattern } },
        { orgName: { $regex: regexPattern } },
        { email: { $regex: regexPattern } },
        { mobile: { $regex: regexPattern } },
      ];
    }

    if (status) {
      filters.status = status;
    }

    let applications = [];

    if (type === "individual") {
      applications = await IndlAppln.find(filters).sort({ createdAt: -1 });
    } else if (type === "corporate") {
      applications = await CorpAppln.find(filters).sort({ createdAt: -1 });
    } else if (type === "associate") {
      applications = await AscCorpAppln.find(filters).sort({ createdAt: -1 });
    } else if (type === "startup") {
      applications = await StrtpAppln.find(filters).sort({ createdAt: -1 });
    }

    let result = applications;

    if (page && entries) {
      result = result.slice((page - 1) * entries, page * entries);
    }

    res
      .status(200)
      .json({ application: result, total: applications?.length ?? 0 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

applicationCtrl.applicationCount = async (req, res) => {
  try {
    const [
      pendingI,
      pendingC,
      pendingA,
      pendingS,
      approvedI,
      approvedC,
      approvedA,
      approvedS,
      rejectedI,
      rejectedC,
      rejectedA,
      rejectedS,
    ] = await Promise.all([
      IndlAppln.countDocuments({ status: "pending" }),
      CorpAppln.countDocuments({ status: "pending" }),
      AscCorpAppln.countDocuments({ status: "pending" }),
      StrtpAppln.countDocuments({ status: "pending" }),

      IndlAppln.countDocuments({ status: "approved" }),
      CorpAppln.countDocuments({ status: "approved" }),
      AscCorpAppln.countDocuments({ status: "approved" }),
      StrtpAppln.countDocuments({ status: "approved" }),

      IndlAppln.countDocuments({ status: "rejected" }),
      CorpAppln.countDocuments({ status: "rejected" }),
      AscCorpAppln.countDocuments({ status: "rejected" }),
      StrtpAppln.countDocuments({ status: "rejected" }),
    ]);

    const pending = pendingI + pendingC + pendingA + pendingS;
    const approved = approvedI + approvedC + approvedA + approvedS;
    const rejected = rejectedI + rejectedC + rejectedA + rejectedS;

    res.status(200).json({ pending, approved, rejected });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

applicationCtrl.CreateIndividualApplication = async (req, res, next) => {
  try {
    const {
      applicantName,
      dob,
      orgName,
      gstNum,
      designation,
      residenceAddress,
      phone,
      mobile,
      email,
      officeAddress,
      officePhone,
      membershipFor,
      lmaName,
      lmaMembershipNum,
      nature,
      turnover,
      jobProfile,
      hasRenewalPay,
      payMode,
      code,
      isSeniorCitizen,
      qualifications,
      trainings,
      experiences,
      references,
      photo,
      ageProof,
      degreeCertificate,
      bioData,
      amount,
      remark,
    } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (
      !(
        (email && emailRegex.test(email)) ||
        (mobile && mobileRegex.test(mobile))
      )
    ) {
      return res
        .status(400)
        .json({ msg: "Either email or mobile number should be present" });
    }

    if (!(applicantName && membershipFor && payMode)) {
      return res.status(400).json({ msg: "Insufficient Data" });
    }

    const createObj = {
      applicantName,
      dob,
      orgName,
      gstNum,
      designation,
      residenceAddress,
      phone,
      mobile,
      email,
      officeAddress,
      officePhone,
      membershipFor,
      lmaName,
      lmaMembershipNum,
      nature,
      turnover,
      jobProfile,
      hasRenewalPay,
      payMode,
      code,
      isSeniorCitizen,
      qualifications,
      trainings,
      experiences,
      references,
      photo,
      ageProof,
      degreeCertificate,
      bioData,
      amount,
      remark,
    };

    const application = await IndlAppln.create(createObj);

    console.log(application);

    res.status(200).json({ msg: "Initiated Registration Process" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

applicationCtrl.CreateCorporateApplication = async (req, res, next) => {
  try {
    const {
      orgName,
      gstNum,
      postalAddress,
      commnAddress,
      phone,
      mobile,
      fax,
      email,
      nature,
      turnover,
      executives,
      supervisors,
      workers,
      capitalEmployed,
      paidupCapital,
      commnMode,
      hasRenewalPay,
      payMode,
      code,
      meetReps,
      references,
      amount,
      remark,
    } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (
      !(
        (email && emailRegex.test(email)) ||
        (mobile && mobileRegex.test(mobile))
      )
    ) {
      return res
        .status(400)
        .json({ msg: "Either email or mobile number should be present" });
    }

    if (!(orgName && payMode)) {
      return res.status(400).json({ msg: "Insufficient Data" });
    }

    const createObj = {
      orgName,
      gstNum,
      postalAddress,
      commnAddress,
      phone,
      mobile,
      fax,
      email,
      nature,
      turnover,
      executives,
      supervisors,
      workers,
      capitalEmployed,
      paidupCapital,
      commnMode,
      hasRenewalPay,
      payMode,
      code,
      meetReps,
      references,
      amount,
      remark,
    };

    const application = await CorpAppln.create(createObj);
    console.log(application);

    return res.status(200).json({ msg: "Initiated Registration Process" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something went wrong" });
  }
};

applicationCtrl.CreateAssociateCorporateApplication = async (
  req,
  res,
  next
) => {
  try {
    const {
      orgName,
      gstNum,
      postalAddress,
      commnAddress,
      phone,
      mobile,
      fax,
      email,
      nature,
      turnover,
      executives,
      supervisors,
      workers,
      capitalEmployed,
      paidupCapital,
      commnMode,
      hasRenewalPay,
      payMode,
      code,
      meetReps,
      references,
      amount,
      remark,
    } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (
      !(
        (email && emailRegex.test(email)) ||
        (mobile && mobileRegex.test(mobile))
      )
    ) {
      return res
        .status(400)
        .json({ msg: "Either email or mobile number should be present" });
    }

    if (!(orgName && payMode)) {
      return res.status(400).json({ msg: "Insufficient Data" });
    }

    const createObj = {
      orgName,
      gstNum,
      postalAddress,
      commnAddress,
      phone,
      mobile,
      fax,
      email,
      nature,
      turnover,
      executives,
      supervisors,
      workers,
      capitalEmployed,
      paidupCapital,
      commnMode,
      hasRenewalPay,
      payMode,
      code,
      meetReps,
      references,
    };

    const application = await AscCorpAppln.create(createObj);
    console.log(application);

    return res.status(200).json({ msg: "Initiated Registration Process" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something went wrong" });
  }
};

applicationCtrl.UpdateMembershipStatus = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id))
      return res.status(400).json({ msg: "Invalid Id" });

    const { status, applicationType } = req.body;

    let application;
    if (applicationType === "individual") {
      application = await IndlAppln.findByIdAndUpdate(
        Id,
        {
          $set: { status },
        },
        { new: true }
      ).lean();
    } else if (applicationType === "corporate") {
      application = await CorpAppln.findByIdAndUpdate(
        Id,
        {
          $set: { status },
        },
        { new: true }
      ).lean();
    } else if (applicationType === "associate") {
      application = await AscCorpAppln.findByIdAndUpdate(
        Id,
        {
          $set: { status },
        },
        { new: true }
      ).lean();
    } else if (applicationType === "startup") {
      application = await StrtpAppln.findByIdAndUpdate(
        Id,
        {
          $set: { status },
        },
        { new: true }
      ).lean();
    }

    if (!application) {
      return res.status(500).json({ msg: "failed" });
    }

    const memberExistsForApln = await Member.exists({
      $or: [{ mobile: application?.mobile }, { email: application?.email }],
    });

    if (memberExistsForApln) {
      return res.status(409).json({ msg: "Member already exist" });
    }

    if (status === "approved") {
      const { _id, createdAt, updatedAt, _v, ...restFields } = application;

      const memberObj = restFields;
      memberObj.applicationId = _id;

      // adding membership expiry date which is 1 year from now
      const expiryDate = dayjs().add(1, "year").format("YYYY-MM-DD");

      memberObj.expiryDate = expiryDate;

      const member = await Member.create(memberObj);

      if (!member) {
        return res.status(500).json({ msg: "failed" });
      }
    }

    res.status(200).json({ msg: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

applicationCtrl.UpdateIndividualApplication = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id)) {
      return res.status(400).json({ msg: "Invalid Id" });
    }

    const theIndlAppln = await IndlAppln.findById(Id);
    if (!theIndlAppln) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (theIndlAppln?.status === "approved") {
      return res.status(400).json({ msg: "failed" });
    }

    const fileFields = ["photo", "ageProof", "degreeCertificate", "bioData"];
    for (const field of fileFields) {
      const newKey = req.body?.[field]?.key;
      const oldKey = theIndlAppln[field]?.key;
      if (newKey) {
        // Delete old image if exists
        if (oldKey && newKey !== oldKey) {
          try {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: Bucket,
              Key: oldKey,
            });

            const response = await s3Client.send(deleteCommand);
            console.log("File deleted Successfully", response);
          } catch (error) {
            console.log(error);
          }
        }
      }
    }

    const application = await IndlAppln.findByIdAndUpdate(
      Id,
      { $set: req.body },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ msg: "Application update failed" });
    }

    console.log(application);
    res.status(200).json({ msg: "Application Updated", application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

applicationCtrl.UpdateCorporateApplication = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id)) {
      return res.status(400).json({ msg: "Invalid Id" });
    }

    const theCorpAppln = await CorpAppln.findById(Id);
    if (!theCorpAppln) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (theCorpAppln?.status === "approved") {
      return res.status(400).json({ msg: "failed" });
    }

    const oldKeyList = theCorpAppln.meetReps.map((item) => item?.photo?.key);
    const newKeyList = req.body?.meetReps.map((item) => item?.photo?.key);

    for (const oldKey of oldKeyList) {
      // Delete old image if exists
      if (!newKeyList?.includes(oldKey)) {
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: Bucket,
            Key: oldKey,
          });
          const response = await s3Client.send(deleteCommand);
          console.log("File deleted Successfully", response);
        } catch (error) {
          console.log(error);
        }
      }
    }

    const updatedApplication = await CorpAppln.findByIdAndUpdate(
      Id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedApplication) {
      return res.status(404).json({ msg: "Application update failed" });
    }

    res
      .status(200)
      .json({ msg: "Application Updated", application: updatedApplication });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

applicationCtrl.UpdateAssociateCorporateApplication = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id)) {
      return res.status(400).json({ msg: "Invalid Id" });
    }

    const theAscCorpAppln = await AscCorpAppln.findById(Id);
    if (!theAscCorpAppln) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (theAscCorpAppln?.status === "approved") {
      return res.status(400).json({ msg: "failed" });
    }

    const oldKeyList = theAscCorpAppln.meetReps.map((item) => item?.photo?.key);
    const newKeyList = req.body?.meetReps.map((item) => item?.photo?.key);

    for (const oldKey of oldKeyList) {
      // Delete old image if exists
      if (!newKeyList?.includes(oldKey)) {
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: Bucket,
            Key: oldKey,
          });
          const response = await s3Client.send(deleteCommand);
          console.log("File deleted Successfully", response);
        } catch (error) {
          console.log(error);
        }
      }
    }

    const updatedApplication = await AscCorpAppln.findByIdAndUpdate(
      Id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedApplication) {
      return res.status(404).json({ msg: "Application update failed" });
    }

    res
      .status(200)
      .json({ msg: "Application Updated", application: updatedApplication });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

applicationCtrl.ViewApplication = async (req, res) => {
  try {
    const Id = req.params.id;
    const type = req.query.type;

    if (!isValidObjectId(Id))
      return res.status(409).json({ msg: "Invalid id" });

    let application = {};
    if (type === "individual") {
      application = await IndlAppln.findById(Id).lean();
    } else if (type === "corporate") {
      application = await CorpAppln.findById(Id).lean();
    } else if (type === "associate") {
      application = await AscCorpAppln.findById(Id).lean();
    } else if (type === "startup") {
      application = await StrtpAppln.findById(Id).lean();
    }

    res.status(200).json({ application });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

// starttup

applicationCtrl.CreateStartupApplication = async (req, res, next) => {
  try {
    const {
      orgName,
      regDetails,
      startupyear,
      pincode,
      gstNum,
      postalAddress,
      commnAddress,
      phone,
      mobile,
      email,
      nature,
      turnover,
      executives,
      supervisors,
      workers,
      capitalEmployed,
      paidupCapital,
      commnMode,
      hasRenewalPay,
      payMode,
      code,
      meetReps,
      references,
      amount,
      remark,
    } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (
      !(
        (email && emailRegex.test(email)) ||
        (mobile && mobileRegex.test(mobile))
      )
    ) {
      return res
        .status(400)
        .json({ msg: "Either email or mobile number should be present" });
    }

    if (!(orgName && payMode)) {
      return res.status(400).json({ msg: "Insufficient Data" });
    }

    const createObj = {
      orgName,
      regDetails,
      startupyear,
      pincode,
      gstNum,
      postalAddress,
      commnAddress,
      phone,
      mobile,
      email,
      nature,
      turnover,
      executives,
      supervisors,
      workers,
      capitalEmployed,
      paidupCapital,
      commnMode,
      hasRenewalPay,
      payMode,
      code,
      meetReps,
      references,
      amount,
      remark,
    };

    const application = await StrtpAppln.create(createObj);
    console.log(application);

    return res.status(200).json({ msg: "Initiated Registration Process" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something went wrong" });
  }
};

applicationCtrl.UpdateStartupApplication = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id)) {
      return res.status(400).json({ msg: "Invalid Id" });
    }

    const theStrtpAppln = await StrtpAppln.findById(Id);
    if (!theStrtpAppln) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (theStrtpAppln?.status === "approved") {
      return res.status(400).json({ msg: "failed" });
    }

    const oldKeyList = theStrtpAppln.meetReps.map((item) => item?.photo?.key);
    const newKeyList = req.body?.meetReps.map((item) => item?.photo?.key);

    for (const oldKey of oldKeyList) {
      // Delete old image if exists
      if (!newKeyList?.includes(oldKey)) {
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: Bucket,
            Key: oldKey,
          });
          const response = await s3Client.send(deleteCommand);
          console.log("File deleted Successfully", response);
        } catch (error) {
          console.log(error);
        }
      }
    }

    const updatedApplication = await StrtpAppln.findByIdAndUpdate(
      Id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedApplication) {
      return res.status(404).json({ msg: "Application update failed" });
    }

    res
      .status(200)
      .json({ msg: "Application Updated", application: updatedApplication });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

export { applicationCtrl };
