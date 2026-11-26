import { Member } from "../../models/MemberModel.js";
import { HallEnquiry } from "../../models/hall-enquiries-model.js";
import { Event } from "../../models/events-model.js";
import { Reports } from "../../models/reports-model.js";
import { Magazines } from "../../models/magazine-model.js";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { IndlAppln } from "../../models/IndlAppln.js";
import { CorpAppln } from "../../models/CorpAppln.js";
import { AscCorpAppln } from "../../models/AscCorpAppln.js";
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault("Asia/Kolkata");

const dashCtrl = {};

dashCtrl.memberChart = async (req, res) => {
  try {
    let labels = [];
    let data = [];

    const currentYear = dayjs().year();
    const currentMonth = dayjs().month();

    console.log("currentYear", currentYear);
    console.log("currentMonth", currentMonth);

    const monthsArray = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 0; i <= currentMonth; i++) {
      labels.push(monthsArray[i]);
      data.push(0);
    }

    const startDate = dayjs.utc().startOf("year").toDate();
    const endDate = dayjs.utc().endOf("year").toDate();

    const filter = { createdAt: { $gte: startDate, $lte: endDate } };

    const members = await Member.find(filter);

    members.forEach((member) => {
      const month = member?.createdAt?.toDateString().split(" ")[1];
      const dateToCheck = dayjs.utc(member?.createdAt);
      const currentYear = dayjs().year();

      if (dateToCheck.year() === currentYear) {
        for (let i = 0; i < labels.length; i++) {
          if (month === labels[i]) {
            data[i] += 1;
          }
        }
      }
    });

    const totalMembers = await Member.countDocuments();
    const memberCountCurrentMonth = data[data?.length - 1];
    console.log(data[data?.length - 1]);

    const increment = Math.floor(
      (memberCountCurrentMonth / totalMembers) * 100
    );

    const result = {
      labels,
      data,
      total: totalMembers,
      increment,
    };
    console.log(result);

    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

dashCtrl.analytics = async (req, res) => {
  try {
    const { date } = req.query;

    const filter = {};

    if (date) {
      const parsedDate = dayjs(date, "DD-MM-YYYY");

      const startOfDay = parsedDate.startOf("day").toISOString();
      const endOfDay = parsedDate.endOf("day").toISOString();

      filter.createdAt = {
        $gte: startOfDay,
        $lt: endOfDay,
      };
    }

    const IndlApplnCount =
      (await IndlAppln.countDocuments({ ...filter, status: "pending" })) || 0;
    const CorpApplnCount =
      (await CorpAppln.countDocuments({ ...filter, status: "pending" })) || 0;
    const AscCorpApplnCount =
      (await AscCorpAppln.countDocuments({ ...filter, status: "pending" })) ||
      0;
    const applicationCount =
      IndlApplnCount + CorpApplnCount + AscCorpApplnCount;

    const memberCount = await Member.countDocuments(filter);
    const eventCount = await Event.countDocuments(filter);
    const enquiryCount = await HallEnquiry.countDocuments(filter);
    const reportCount = await Reports.countDocuments(filter);
    const magazineCount = await Magazines.countDocuments(filter);

    const result = [
      { label: "application", count: applicationCount },
      { label: "member", count: memberCount },
      { label: "event", count: eventCount },
      // { label: 'enquiry', count: enquiryCount },
      // { label: 'report', count: reportCount },
      // { label: 'magazine', count: magazineCount },
    ];

    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

dashCtrl.recentUpdates = async (req, res) => {
  try {
    const startOfDay = dayjs().startOf("day").toISOString();
    const endOfDay = dayjs().endOf("day").toISOString();

    const filter = {
      status: "pending",
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    };
    const IndlApplnCount = (await IndlAppln.countDocuments(filter)) || 0;
    const CorpApplnCount = (await CorpAppln.countDocuments(filter)) || 0;
    const AscCorpApplnCount = (await AscCorpAppln.countDocuments(filter)) || 0;
    const applicationCount =
      IndlApplnCount + CorpApplnCount + AscCorpApplnCount;

    const enquiryCount = await HallEnquiry.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    const result = {
      applicationCount,
      enquiryCount,
    };

    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

dashCtrl.notifyCount = async (req, res) => {
  try {
    const filter = {};

    const IndlApplnCount =
      (await IndlAppln.countDocuments({ ...filter, status: "pending" })) || 0;
    const CorpApplnCount =
      (await CorpAppln.countDocuments({ ...filter, status: "pending" })) || 0;
    const AscCorpApplnCount =
      (await AscCorpAppln.countDocuments({ ...filter, status: "pending" })) ||
      0;
    const applicationCount =
      IndlApplnCount + CorpApplnCount + AscCorpApplnCount;

    res.status(200).json({ result: applicationCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export { dashCtrl };
