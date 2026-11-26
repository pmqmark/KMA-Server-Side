import { isValidObjectId } from "mongoose";
import { Member } from "../../models/MemberModel.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const memberCtrl = {};

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { IndlAppln } from "../../models/IndlAppln.js";
import { AscCorpAppln } from "../../models/AscCorpAppln.js";
import { CorpAppln } from "../../models/CorpAppln.js";
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault("Asia/Kolkata");

// Member CRUD

memberCtrl.GetMember = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id))
      return res.status(409).json({ msg: "Invalid id" });

    const member = await Member.findById(Id).lean();

    const { password, ...restData } = member;

    res.status(200).json({ member: restData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

memberCtrl.GetManyMembers = async (req, res) => {
  try {
    const searchQuery = req.query.search;
    const memberType = req.query.memberType;

    // Pagination defaults
    const page = parseInt(req.query.page, 10) || 1;
    const entries = parseInt(req.query.entries, 10) || 10;

    const filters = {};
    const { month, year } = req.query;

    if (month && year) {
      filters.$expr = {
        $and: [
          { $eq: [{ $month: "$createdAt" }, parseInt(month)] },
          { $eq: [{ $year: "$createdAt" }, parseInt(year)] },
        ],
      };
    }

    if (memberType) {
      filters.code = { $regex: new RegExp(`^${memberType}`, "i") };
    }

    const { date, status, renewal } = req.query;
    if (status) {
      filters.isActive = status === "active";
    }

    const today = dayjs().startOf("day");
    if (renewal) {
      filters.expiryDate =
        renewal === "paid" ? { $gte: today.toDate() } : { $lt: today.toDate() };
    }

    if (date) {
      const parsedDate = dayjs(date, "DD-MM-YYYY");
      if (parsedDate.isValid()) {
        filters.createdAt = {
          $gte: parsedDate.startOf("day").toDate(),
          $lt: parsedDate.endOf("day").toDate(),
        };
      } else {
        return res.status(400).json({ msg: "Invalid date format" });
      }
    }

    if (searchQuery?.trim()) {
      const regexPattern = new RegExp(searchQuery, "i");
      filters.$or = [
        { applicantName: { $regex: regexPattern } },
        { orgName: { $regex: regexPattern } },
        { email: { $regex: regexPattern } },
        { mobile: { $regex: regexPattern } },
      ];
    }

    const members = await Member.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * entries)
      .limit(entries);

    const total = await Member.countDocuments(filters);

    res.status(200).json({ members, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

memberCtrl.ChangeMemberActiveStatus = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id))
      return res.status(409).json({ msg: "Invalid id" });

    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ msg: "Invalid value" });
    }

    const member = await Member.findByIdAndUpdate(
      Id,
      {
        $set: { isActive },
      },
      { new: true }
    );

    if (!member) return res.status(404).json({ msg: "Failed to update" });

    res.status(200).json({ msg: "Updated member status" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

memberCtrl.DeleteMember = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id))
      return res.status(409).json({ msg: "Invalid id" });

    const member = await Member.findByIdAndDelete(Id);
    if (!member) return res.status(404).json({ msg: "member not found" });

    res.status(200).json({ msg: "deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

memberCtrl.createMemberByAdmin = async (req, res) => {
  try {
    const { name, orgName, designation, mobile } = req.body;

    // Validation
    if (!name || !orgName || !designation || !mobile) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Photo validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    const member = await Member.create({
      name,
      orgName,
      designation,
      mobile,
      photo: {
        name: req.file.originalname,
        location: req.file.path || req.file.location,
        key: req.file.filename || req.file.key,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Office bearer member created successfully",
      data: member,
    });
  } catch (error) {
    console.error("createOfficeBearersMemberByAdmin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create member",
      error: error.message,
    });
  }
};

memberCtrl.createIndividualMemberByAdmin = async (req, res) => {
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
    // const mobileRegex = /^[6-9]\d{9}$/;

    console.log({ CIMA: req.body });

    if (!((email && emailRegex.test(email)) || mobile)) {
      return res
        .status(400)
        .json({ msg: "Either email or mobile number should be present" });
    }

    if (!(applicantName && membershipFor)) {
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
      status: "approved",
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

    // createObj.memberType = "individual";

    // adding membership expiry date which is 1 year from now
    const expiryDate = dayjs().add(1, "year").format("YYYY-MM-DD");

    createObj.expiryDate = expiryDate;

    const member = await Member.create(createObj);

    if (!member) {
      return res.status(500).json({ msg: "Failed to create Member" });
    }

    res.status(200).json({ msg: "Member created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

memberCtrl.createCorporateMemberByAdmin = async (req, res) => {
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

    if (!orgName) {
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
      status: "approved",
      code,
      meetReps,
      references,
      amount,
      remark,
    };

    // createObj.memberType = "corporate";

    // adding membership expiry date which is 1 year from now
    const expiryDate = dayjs().add(1, "year").format("YYYY-MM-DD");

    createObj.expiryDate = expiryDate;

    const member = await Member.create(createObj);

    if (!member) {
      return res.status(500).json({ msg: "Failed to create Member" });
    }

    res.status(200).json({ msg: "Member created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

memberCtrl.createAssociateMemberByAdmin = async (req, res) => {
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

    if (!orgName) {
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
      status: "approved",
      code,
      meetReps,
      references,
      amount,
      remark,
    };

    // createObj.memberType = "associate";

    // adding membership expiry date which is 1 year from now
    const expiryDate = dayjs().add(1, "year").format("YYYY-MM-DD");

    createObj.expiryDate = expiryDate;

    const member = await Member.create(createObj);

    if (!member) {
      return res.status(500).json({ msg: "Failed to create Member" });
    }

    res.status(200).json({ msg: "Member created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

memberCtrl.updateIndividualMember = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id)) {
      return res.status(400).json({ msg: "Invalid Id" });
    }

    const theMember = await Member.findById(Id);
    if (!theMember) {
      return res.status(404).json({ msg: "Member not found" });
    }

    const fileFields = ["photo", "ageProof", "degreeCertificate", "bioData"];
    for (const field of fileFields) {
      const newKey = req.body?.[field]?.key;
      const oldKey = theMember[field]?.key;
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

    const member = await Member.findByIdAndUpdate(
      Id,
      { $set: req.body },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ msg: "member update failed" });
    }

    res.status(200).json({ msg: "Member Updated", member });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

memberCtrl.updateCorporateMember = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id)) {
      return res.status(400).json({ msg: "Invalid Id" });
    }

    const theMember = await Member.findById(Id);
    if (!theMember) {
      return res.status(404).json({ msg: "Member not found" });
    }

    const oldKeyList = theMember.meetReps.map((item) => item?.photo?.key);
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

    const member = await Member.findByIdAndUpdate(
      Id,
      { $set: req.body },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ msg: "member update failed" });
    }

    console.log(member);
    res.status(200).json({ msg: "Member Updated", member });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

memberCtrl.updateAssociateMember = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id)) {
      return res.status(400).json({ msg: "Invalid Id" });
    }

    const theMember = await Member.findById(Id);
    if (!theMember) {
      return res.status(404).json({ msg: "Member not found" });
    }

    const oldKeyList = theMember.meetReps.map((item) => item?.photo?.key);
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

    const member = await Member.findByIdAndUpdate(
      Id,
      { $set: req.body },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ msg: "member update failed" });
    }

    console.log(member);
    res.status(200).json({ msg: "Member Updated", member });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

memberCtrl.GetProfile = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id))
      return res.status(409).json({ msg: "Invalid id" });

    // To grant access only for admin and the Profile owner;
    if (req?.user?.role !== "admin") {
      if (req?.user?.userId !== Id) {
        return res.status(409).json({ msg: "Unauthorised Access" });
      }
    }

    const member = await Member.findById(Id).lean();

    if (!member) {
      return res.status(404).json({ msg: "Not Found" });
    }

    res.status(200).json({ member });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

memberCtrl.ViewMember = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id))
      return res.status(409).json({ msg: "Invalid id" });

    const member = await Member.findById(Id).lean();

    if (!member) {
      return res.status(404).json({ msg: "Not Found" });
    }

    res.status(200).json({ member });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

// Startup

memberCtrl.createStartupMemberByAdmin = async (req, res) => {
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

    if (!orgName) {
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
      status: "approved",
      code,
      meetReps,
      references,
      amount,
      remark,
    };

    // adding membership expiry date which is 1 year from now
    const expiryDate = dayjs().add(1, "year").format("YYYY-MM-DD");

    createObj.expiryDate = expiryDate;

    const member = await Member.create(createObj);

    if (!member) {
      return res.status(500).json({ msg: "Failed to create Member" });
    }

    res.status(200).json({ msg: "Member created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

memberCtrl.updateStartupMember = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!isValidObjectId(Id)) {
      return res.status(400).json({ msg: "Invalid Id" });
    }

    const theMember = await Member.findById(Id);
    if (!theMember) {
      return res.status(404).json({ msg: "Member not found" });
    }

    const oldKeyList = theMember.meetReps.map((item) => item?.photo?.key);
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

    const member = await Member.findByIdAndUpdate(
      Id,
      { $set: req.body },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ msg: "member update failed" });
    }

    console.log(member);
    res.status(200).json({ msg: "Member Updated", member });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

export { memberCtrl };
