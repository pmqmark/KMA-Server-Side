// import puppeteer from "puppeteer";

// const esc = (v) =>
//   String(v ?? "")
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");

// const fmtDate = (v) => {
//   if (!v) return "";
//   const d = new Date(v);
//   return isNaN(d) ? String(v) : d.toLocaleDateString("en-IN");
// };

// const yesNo = (v) => (v === true ? "Yes" : v === false ? "No" : "");

// // ---------- Field config (matches your form fields) ----------
// const individual = {
//   title: "Individual Membership Application",
//   photoKey: "photo",
//   fields: [
//     ["Name in Full", "applicantName"],
//     ["Date of Birth", "dob", fmtDate],
//     ["Senior Citizen", "isSeniorCitizen", yesNo],
//     ["Name of the Organization", "orgName"],
//     ["GST No", "gstNum"],
//     ["Designation", "designation"],
//     ["Residence Address", "residenceAddress"],
//     ["Phone", "phone"],
//     ["Mobile", "mobile"],
//     ["Email", "email"],
//     ["Office Address", "officeAddress"],
//     ["Office Phone", "officePhone"],
//     ["Membership Applied For", "membershipFor"],
//     ["Nature of Business/Profession", "nature"],
//     ["Annual Turnover", "turnover"],
//     ["Job Profile", "jobProfile"],
//     ["LMA Name", "lmaName"],
//     ["LMA Membership No.", "lmaMembershipNum"],
//   ],
//   tables: [
//     {
//       title: "Qualifications",
//       key: "qualifications",
//       cols: [
//         ["Institution", "institution"],
//         ["Title", "title"],
//         ["Duration", "duration"],
//         ["Award Year", "awardYear"],
//       ],
//     },
//     {
//       title: "Trainings",
//       key: "trainings",
//       cols: [
//         ["Title", "title"],
//         ["Institution", "institution"],
//         ["Duration", "duration"],
//         ["Dates", "dates"],
//       ],
//     },
//     {
//       title: "Experiences",
//       key: "experiences",
//       cols: [
//         ["From", "from", fmtDate],
//         ["To", "to", fmtDate],
//         ["Organization", "organization"],
//         ["Designation", "designation"],
//         ["Details", "detail"],
//         ["Reporting To", "reportingTo"],
//       ],
//     },
//     {
//       title: "References",
//       key: "references",
//       cols: [
//         ["Name", "name"],
//         ["Address", "address"],
//         ["Contact No.", "contactNum"],
//       ],
//     },
//   ],
//   attachments: [
//     ["Photo", "photo"],
//     ["Age Proof", "ageProof"],
//     ["Degree Certificate", "degreeCertificate"],
//     ["Bio Data", "bioData"],
//   ],
//   paymentFields: [
//     ["Including Renewal Payment", "hasRenewalPay", yesNo],
//     ["Mode of Payment", "payMode"],
//     ["Amount", "amount"],
//   ],
// };

// const orgFields = [
//   ["Name of the Organization", "orgName"],
//   ["GST No", "gstNum"],
//   ["Postal Address", "postalAddress"],
//   ["Communication Address", "commnAddress"],
//   ["Phone", "phone"],
//   ["Mobile", "mobile"],
//   ["Fax", "fax"],
//   ["Email", "email"],
//   ["Nature of Business/Profession", "nature"],
//   ["Annual Turnover (Lakhs)", "turnover"],
//   ["Executives", "executives"],
//   ["Supervisors", "supervisors"],
//   ["Workers", "workers"],
//   ["Capital Employed", "capitalEmployed"],
//   ["Paid up Capital", "paidupCapital"],
//   ["Preferred Mode of Communication", "commnMode"],
// ];

// const orgTables = [
//   {
//     title: "Representatives who will attend K.M.A Meetings",
//     key: "meetReps",
//     cols: [
//       ["Photo", "photo", null, "image"],
//       ["Name", "name"],
//       ["Designation", "designation"],
//       ["Telephone", "telephone"],
//       ["Mobile", "mobile"],
//       ["Email", "email"],
//     ],
//   },
//   {
//     title: "Proposed By (References)",
//     key: "references",
//     cols: [
//       ["Name", "name"],
//       ["Address", "address"],
//       ["Contact No.", "contactNum"],
//     ],
//   },
// ];

// const orgPayment = individual.paymentFields;

// const configs = {
//   individual,
//   corporate: {
//     title: "Corporate Membership Application",
//     fields: orgFields,
//     tables: orgTables,
//     paymentFields: orgPayment,
//   },
//   associate: {
//     title: "Associate Corporate Membership Application",
//     fields: orgFields,
//     tables: orgTables,
//     paymentFields: orgPayment,
//   },
//   startup: {
//     title: "Startup Membership Application",
//     fields: [
//       ["Name of the Organization", "orgName"],
//       ["Registration Details", "regDetails"],
//       ["Startup Year", "startupyear"],
//       ["Pincode", "pincode"],
//       ...orgFields.slice(1, 6),
//       ["Email", "email"],
//       ...orgFields.slice(8),
//     ],
//     tables: orgTables,
//     paymentFields: orgPayment,
//   },
// };

// // ---------- HTML builders ----------
// const kv = (data, fields) =>
//   fields
//     .map(([label, key, fmt]) => {
//       const raw = data?.[key];
//       const val = fmt ? fmt(raw) : raw;
//       return `<tr><th>${esc(label)}</th><td>${esc(val) || "&ndash;"}</td></tr>`;
//     })
//     .join("");

// const tableHtml = (data, t) => {
//   const rows = Array.isArray(data?.[t.key]) ? data[t.key] : [];
//   if (!rows.length) return "";
//   const head = t.cols.map(([l]) => `<th>${esc(l)}</th>`).join("");
//   const body = rows
//     .map(
//       (r) =>
//         "<tr>" +
//         t.cols
//           .map(([, k, fmt, kind]) => {
//             if (kind === "image") {
//               const url = r?.[k]?.location;
//               return `<td>${
//                 url ? `<img class="thumb" src="${esc(url)}" />` : "&ndash;"
//               }</td>`;
//             }
//             return `<td>${esc(fmt ? fmt(r?.[k]) : r?.[k]) || "&ndash;"}</td>`;
//           })
//           .join("") +
//         "</tr>"
//     )
//     .join("");
//   return `<h2>${esc(
//     t.title
//   )}</h2><table class="grid"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
// };

// const buildHtml = (type, data) => {
//   const cfg = configs[type];
//   const photoUrl = cfg.photoKey ? data?.[cfg.photoKey]?.location : null;

//   const attachments = (cfg.attachments || [])
//     .filter(([, k]) => data?.[k]?.location)
//     .map(
//       ([label, k]) =>
//         `<tr><th>${esc(label)}</th><td>${esc(data[k].name)}</td></tr>`
//     )
//     .join("");

//   return `<!doctype html><html><head><meta charset="utf-8" />
// <style>
//   * { box-sizing: border-box; }
//   body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #222; margin: 0; }
//   .header { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #E3000F; padding-bottom:10px; margin-bottom:14px; }
//   .brand { font-size:22px; font-weight:bold; color:#E3000F; }
//   .brand small { display:block; font-size:10px; color:#333; font-weight:normal; }
//   .photo { width:90px; height:110px; object-fit:cover; border:1px solid #999; }
//   h1 { font-size:16px; text-align:center; margin:0 0 12px; }
//   h2 { font-size:13px; margin:16px 0 6px; color:#E3000F; border-bottom:1px solid #ddd; padding-bottom:3px; }
//   table { width:100%; border-collapse:collapse; }
//   table.kv th { width:34%; text-align:left; background:#f5f5f5; font-weight:600; }
//   table.kv th, table.kv td, table.grid th, table.grid td { border:1px solid #ccc; padding:5px 7px; vertical-align:top; white-space:pre-wrap; }
//   table.grid th { background:#f5f5f5; text-align:left; }
//   tr { page-break-inside: avoid; }
//   .thumb { width:45px; height:55px; object-fit:cover; }
//   .meta { text-align:right; font-size:10px; color:#666; margin-top:14px; }
// </style></head><body>
//   <div class="header">
//     <div class="brand">KMA<small>Kerala Management Association<br/>Management House, Kerala Management Avenue, Panampilly Nagar PO, Kochi - 682036</small></div>
//     ${photoUrl ? `<img class="photo" src="${esc(photoUrl)}" />` : ""}
//   </div>
//   <h1>${esc(cfg.title)}</h1>
//   <table class="kv">${
//     data?.code ? `<tr><th>Member Code</th><td>${esc(data.code)}</td></tr>` : ""
//   }${kv(data, cfg.fields)}</table>
//   ${cfg.tables.map((t) => tableHtml(data, t)).join("")}
//   ${
//     attachments
//       ? `<h2>Attachments</h2><table class="kv">${attachments}</table>`
//       : ""
//   }
//   <h2>Payment</h2>
//   <table class="kv">${kv(data, cfg.paymentFields)}</table>
//   <div class="meta">Submitted on: ${esc(fmtDate(data?.createdAt))}</div>
// </body></html>`;
// };

// // ---------- PDF ----------
// let browserPromise;
// const getBrowser = () => {
//   if (!browserPromise) {
//     browserPromise = puppeteer.launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });
//   }
//   return browserPromise;
// };

// export const generateApplicationPdf = async (type, data) => {
//   const browser = await getBrowser();
//   const page = await browser.newPage();
//   try {
//     await page.setContent(buildHtml(type, data), { waitUntil: "networkidle0" });
//     const pdf = await page.pdf({
//       format: "A4",
//       printBackground: true,
//       margin: { top: "15mm", bottom: "15mm", left: "12mm", right: "12mm" },
//     });
//     return Buffer.from(pdf);
//   } finally {
//     await page.close();
//   }
// };

// export const supportedPdfTypes = Object.keys(configs);

import puppeteer from "puppeteer";
import { buildHtml, supportedPdfTypes } from "./applicationPdfTemplate.js";

let browserPromise = null;

const getBrowser = async () => {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })
      .then((browser) => {
        // if Chromium crashes or closes, launch a fresh one on the next request
        browser.on("disconnected", () => {
          browserPromise = null;
        });
        return browser;
      })
      .catch((err) => {
        browserPromise = null;
        throw err;
      });
  }
  return browserPromise;
};

export const generateApplicationPdf = async (type, data) => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // "load" waits for images too, but does not hang if a photo URL is slow
    await page.setContent(buildHtml(type, data), {
      waitUntil: "load",
      timeout: 30000,
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true, // uses the @page margins from the template
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
};

export { supportedPdfTypes };
