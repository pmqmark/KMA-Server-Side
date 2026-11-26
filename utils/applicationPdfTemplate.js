// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// // ------------------------------------------------------------------
// // Logo images (put the two PNG files in  <backend root>/assets/ )
// // ------------------------------------------------------------------
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const assetsDir = path.join(__dirname, "..", "assets");

// const loadImg = (name) => {
//   try {
//     const buf = fs.readFileSync(path.join(assetsDir, name));
//     return `data:image/png;base64,${buf.toString("base64")}`;
//   } catch (e) {
//     console.log(`[pdf] logo not found: ${path.join(assetsDir, name)}`);
//     return "";
//   }
// };

// const LOGO = loadImg("kma-logo.png"); // with "Affiliated to All India Management Association"
// const LOGO_INDL = loadImg("kma-logo-indl.png"); // without the affiliated line

// // ------------------------------------------------------------------
// // Helpers
// // ------------------------------------------------------------------
// const esc = (v) =>
//   String(v ?? "")
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");

// const fmtDate = (v) => {
//   if (!v) return "";
//   const d = new Date(v);
//   if (isNaN(d)) return String(v);
//   return d.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }); // dd/mm/yyyy
// };

// // filled-in value (blue, looks like handwriting on the blank line)
// const looseDate = (x) =>
//   /^\d{4}-\d{2}-\d{2}/.test(String(x ?? "")) ? fmtDate(x) : x;

// const v = (x) => `<span class="v">${esc(x)}</span>`;

// // numbered item like "1.  Name in Full :"
// const item = (n, html) =>
//   `<div class="item"><div class="n">${n}.</div><div class="b">${html}</div></div>`;

// const cb = (checked) => `<span class="cb">${checked ? "X" : "&nbsp;"}</span>`;

// const padRows = (arr, min) => {
//   const rows = Array.isArray(arr) ? [...arr] : [];
//   while (rows.length < min) rows.push({});
//   return rows;
// };

// const fileName = (f) =>
//   f && (f.name || f.location) ? f.name || "uploaded" : "";

// // ------------------------------------------------------------------
// // Shared blocks
// // ------------------------------------------------------------------
// const bankDetails = `
// <div class="keep">
// <p class="bold underline" style="margin:18px 0 6px">Bank details are given below:</p>
// <table class="tbl bank">
//   <tr><td class="c1">1.</td><td class="c2">Name of Bank Account</td><td class="c3">:</td><td>KERALA MANAGEMENT ASSOCIATION</td></tr>
//   <tr><td class="c1">2.</td><td class="c2">Name of the Bank &amp;<br/>Address of the Branch</td><td class="c3">:</td><td>STATE BANK OF INDIA<br/>PANAMPILLY NAGAR<br/>COCHIN-682 036</td></tr>
//   <tr><td class="c1">3.</td><td class="c2">Account Number</td><td class="c3">:</td><td>57001295933</td></tr>
//   <tr><td class="c1">4.</td><td class="c2">MICR No.</td><td class="c3">:</td><td>682002912</td></tr>
//   <tr><td class="c1">5.</td><td class="c2">IFSC Code</td><td class="c3">:</td><td>SBIN0070658</td></tr>
//   <tr><td class="c1">6</td><td class="c2">Branch Code</td><td class="c3">:</td><td>7065</td></tr>
// </table>
// </div>`;

// const paymentLine = (data) => {
//   const hasAny =
//     data?.payMode || data?.amount || typeof data?.hasRenewalPay === "boolean";
//   if (!hasAny) return "";
//   return `
//   <table class="tbl pay">
//     <tr>
//       <td><b>Mode of Payment :</b> ${v(data?.payMode)}</td>
//       <td><b>Amount (Rs.) :</b> ${v(data?.amount)}</td>
//       <td><b>Including Renewal Payment :</b> ${v(
//         data?.hasRenewalPay === true
//           ? "Yes"
//           : data?.hasRenewalPay === false
//           ? "No"
//           : ""
//       )}</td>
//     </tr>
//   </table>`;
// };

// const uploadedList = (data, keys) => {
//   const rows = keys
//     .filter(([, k]) => fileName(data?.[k]))
//     .map(
//       ([label, k]) =>
//         `${esc(label)}: <span class="v">${esc(fileName(data[k]))}</span>`
//     );
//   if (!rows.length) return "";
//   return `<p class="small" style="margin:6px 0 0"><b>Documents uploaded online:</b> ${rows.join(
//     " &nbsp;|&nbsp; "
//   )}</p>`;
// };

// const officialUse = (data, style = "table") => {
//   const rows = [
//     ["Received on", ""],
//     ["Amount received", ""],
//     ["Receipt No.", ""],
//     ["Membership Committee Decision", ""],
//     ["Date of Admission", ""],
//     ["Membership No.", data?.code || ""],
//   ];
//   if (style === "table") {
//     return `
//     <table class="tbl official">
//       <tr><th colspan="2" class="center big">KMA OFFICIAL USE</th></tr>
//       ${rows
//         .map(
//           ([l, val]) => `<tr><td class="w50">${l}</td><td>${v(val)}</td></tr>`
//         )
//         .join("")}
//     </table>`;
//   }
//   return `
//   <p class="bold center" style="margin:16px 0 8px">KMA OFFICIAL USE</p>
//   <table class="plain official-list">
//     ${rows
//       .map(
//         ([l, val]) =>
//           `<tr><td class="lab">${l}</td><td class="colon">:</td><td class="dots">${v(
//             val
//           )}</td></tr>`
//       )
//       .join("")}
//   </table>`;
// };

// // ------------------------------------------------------------------
// // INDIVIDUAL
// // ------------------------------------------------------------------
// const individualHtml = (d) => {
//   const quals = padRows(d.qualifications, 3);
//   const trains = padRows(d.trainings, 4);
//   const exps = padRows(d.experiences, 4);
//   const refs = padRows(d.references, 2).slice(
//     0,
//     Math.max(2, (d.references || []).length)
//   );
//   const mf = (d.membershipFor || "").toUpperCase();
//   const photoUrl = d.photo?.location;

//   const refCells = (i) => {
//     const r = refs[i] || {};
//     return `<span class="v"><b>${esc(r.name || "")}</b></span><br/>${v(
//       r.address
//     )}`;
//   };

//   return `
//   <div class="photo-box">${
//     photoUrl
//       ? `<img src="${esc(photoUrl)}" onerror="this.style.display='none'"/>`
//       : "Passport size<br/>photograph"
//   }</div>

//   <div class="logo">${
//     LOGO_INDL ? `<img src="${LOGO_INDL}" style="width:215px"/>` : ""
//   }</div>
//   <div class="title-grey">APPLICATION FOR<br/>INDIVIDUAL &ndash; LIFE / ORDINARY<br/>MEMBERSHIP</div>

//   ${item(
//     1,
//     `Name in Full (CAPITAL LETTERS) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: &nbsp;${v(
//       (d.applicantName || "").toUpperCase()
//     )}`
//   )}

//   ${item(
//     2,
//     `<table class="plain"><tr><td>Date of Birth : ${v(fmtDate(d.dob))}</td>
//      <td class="right">Senior Citizen &ndash; <span class="${
//        d.isSeniorCitizen === true ? "circ" : ""
//      }">YES</span> / <span class="${
//       d.isSeniorCitizen === false ? "circ" : ""
//     }">NO</span></td></tr></table>`
//   )}

//   ${item(3, `Name of the Organisation : ${v(d.orgName)}`)}
//   <div class="sub">GST No : ${v(d.gstNum)}</div>
//   <div class="sub">Designation : ${v(d.designation)}</div>

//   ${item(4, `Address:`)}
//   <table class="tbl addr">
//     <tr><th class="center">Residence</th><th class="center">Office</th></tr>
//     <tr><td class="addrbox">${v(
//       d.residenceAddress
//     )}</td><td class="addrbox">${v(d.officeAddress)}</td></tr>
//     <tr><td>Phone: ${v(d.phone)}</td><td>Phone: ${v(d.officePhone)}</td></tr>
//     <tr><td colspan="2">Mobile: ${v(d.mobile)}</td></tr>
//     <tr><td colspan="2">E-Mail ID: ${v(d.email)}</td></tr>
//   </table>

//   ${item(
//     5,
//     `Membership Applied for : INDIVIDUAL LIFE ${cb(mf === "INDIVIDUAL LIFE")}
//      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SENIOR CITIZEN LIFE ${cb(
//        mf === "SENIOR CITIZEN LIFE"
//      )}
//      <br/><span style="margin-left:150px">ORDINARY ${cb(
//        mf === "ORDINARY"
//      )}</span>`
//   )}

//   ${item(
//     6,
//     `Are you already a Member of any LMA
//      <div class="indent">Name : ${v(d.lmaName)}<br/>Membership No. : ${v(
//       d.lmaMembershipNum
//     )}</div>`
//   )}

//   ${item(
//     7,
//     `Academic / Professional Qualifications : (Please use additional sheets if required)`
//   )}
//   <table class="tbl grid">
//     <tr><th style="width:32%">University / Institution</th><th style="width:30%">Degree / Diploma awarded</th><th style="width:16%">Duration</th><th>Award in the year</th></tr>
//     ${quals
//       .map(
//         (q) =>
//           `<tr><td>${v(q.institution)}</td><td>${v(q.title)}</td><td>${v(
//             q.duration
//           )}</td><td>${v(q.awardYear)}</td></tr>`
//       )
//       .join("")}
//   </table>

//   ${item(
//     8,
//     `Management Development / Training Courses Attended / Research work / Publication, if any :`
//   )}
//   <table class="tbl grid">
//     <tr><th style="width:26%">Title</th><th style="width:34%">Association/Institution</th><th style="width:20%">Duration</th><th>Dates</th></tr>
//     ${trains
//       .map(
//         (t) =>
//           `<tr><td>${v(t.title)}</td><td>${v(t.institution)}</td><td>${v(
//             t.duration
//           )}</td><td>${v(looseDate(t.dates))}</td></tr>`
//       )
//       .join("")}
//   </table>

//   ${item(9, `Nature of Business / Profession : ${v(d.nature)}`)}
//   ${item(10, `Annual Turnover : ${v(d.turnover)}`)}

//   ${item(11, `PROFESSIONAL EXPERIENCE`)}
//   <table class="tbl grid small">
//     <tr><th style="width:10%">From</th><th style="width:10%">To</th><th style="width:22%">Name of organization</th><th style="width:16%">Designation</th><th>Job Details</th><th style="width:15%">Reporting To</th></tr>
//     ${exps
//       .map(
//         (e) =>
//           `<tr><td>${v(fmtDate(e.from))}</td><td>${v(
//             fmtDate(e.to)
//           )}</td><td>${v(e.organization)}</td><td>${v(
//             e.designation
//           )}</td><td>${v(e.detail)}</td><td>${v(e.reportingTo)}</td></tr>`
//       )
//       .join("")}
//   </table>

//   ${item(
//     12,
//     `Your job profile in the present employment (Please use additional sheets if required)<div class="jobbox">${v(
//       d.jobProfile
//     )}</div>`
//   )}

//   ${item(
//     13,
//     `<b>BUSINESS REFERENCE</b>: Please give the names and address of two persons, of which one should be your immediate superior and able to support your application by actual knowledge of your responsibilities. If you are head of your firm, please name two business / professional associates. One of your referees should be a Member of KMA. Referees will be approached at the discretion of KMA.`
//   )}
//   <table class="tbl addr">
//     <tr><th class="center w50">Referee (1)</th><th class="center w50">Referee (2)</th></tr>
//     <tr><td class="addrbox">${refCells(0)}</td><td class="addrbox">${refCells(
//     1
//   )}</td></tr>
//     <tr><td>Contact No. : ${v(refs[0]?.contactNum)}</td><td>Contact No. : ${v(
//     refs[1]?.contactNum
//   )}</td></tr>
//   </table>

//   <div class="pagebreak"></div>

//   ${item(14, `<b>DECLARATION BY APPLICANT</b>`)}
//   <div class="indent just">
//     <p>I declare that the statements made throughout this application are correct to the best of my knowledge and belief and I agree to be governed by the bye laws of the Kerala Management Association.&nbsp; I also undertake to abide by the &lsquo;KMA Code of Conduct for Professional Managers&rsquo; that the Managing Committee may frame from time to time.</p>
//     <p class="bold" style="margin-top:14px">PAY BY DEMAND DRAFT OR CHEQUE ONLY</p>
//     <p>Enclosed is Draft/Cheque No&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;.. dated &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip; for Rs&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;. Drawn on &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip; (bank) in favour of KERALA MANAGEMENT ASSOCIATION and marked &ldquo;Account Payee only&rdquo;</p>
//   </div>
//   ${paymentLine(d)}
//   <table class="plain" style="margin-top:26px"><tr><td>Date : ${v(
//     fmtDate(d.createdAt)
//   )}</td><td class="right" style="padding-right:90px">Signature :</td></tr></table>

//   ${bankDetails}

//   <p style="margin:16px 0 4px">Please attach the following :-</p>
//   <ol class="attach">
//     <li>Two passport size photographs.</li>
//     <li>Copies of certificates a) Proof of age and b) Degree / PG</li>
//     <li>Crossed Cheque /DD in favour of &ldquo;KERALA MANAGEMENT ASSOCIATION&rdquo;, Cochin.</li>
//     <li>One page Bio &ndash; data</li>
//   </ol>
//   ${uploadedList(d, [
//     ["Photo", "photo"],
//     ["Age Proof", "ageProof"],
//     ["Degree Certificate", "degreeCertificate"],
//     ["Bio Data", "bioData"],
//   ])}

//   <div class="feebox">
//     <ul>
//       <li>Individual Life Membership &ndash; Rs.38940/- including GST @ 18%</li>
//       <li>Senior Life Membership (above 60 years of age)- Rs.21240/- including GST 18%</li>
//       <li>Ordinary Individual Membership &ndash; Rs.7080/- including GST @ 18%</li>
//       <li>24(b) The annual subscription shall fall due on 1st April every year. Members who do not pay the subscription on or before 1st October of the year shall automatically cease to be a member. However, the membership can be reinstated on payment of the arrears of subscription in full.</li>
//     </ul>
//   </div>

//   ${officialUse(d, "table")}
//   `;
// };

// // ------------------------------------------------------------------
// // CORPORATE / ASSOCIATE / STARTUP
// // ------------------------------------------------------------------
// const orgConfig = {
//   corporate: {
//     title: "APPLICATION FOR<br/>CORPORATE&nbsp; MEMBERSHIP",
//     titleWidth: "66%",
//     repsNote: "(Four representatives can be nominated)*",
//     minReps: 4,
//     letter: `
//       <p>Please enroll us as a Corporate Member of Kerala Management Association. We agree with the aims and objectives of the Association and will abide by its rules and regulations.</p>
//       <p>We enclose herewith a cheque / bank draft for Rs.41300/-* towards Corporate Membership Fee..</p>
//       <p>*(Entrance Fee Rs.20000/- + Subscription Rs.15,000/- + GST @ 18%).</p>
//       <p>Annual renewal charges being Rs.15,000/- + (GST @ 18%)</p>
//       <p>*Those who have GST registration should not pay the KFC</p>`,
//   },
//   associate: {
//     title: "APPLICATION FOR<br/>A<b>S</b>SOCIATE CORPORATE<br/>MEMBERSHIP",
//     titleWidth: "70%",
//     repsNote: "(Two representatives can be nominated)*",
//     minReps: 2,
//     letter: `
//       <p>Please enroll us as an Associate Corporate Member of&nbsp; Kerala Management Association. We agree with the aims and objectives of the Association and will abide by its rules and regulations.</p>
//       <p>We enclose herewith a cheque / bank draft for Rs.20650/-* towards Associate Corporate Membership Fee.</p>
//       <p>*(Entrance Fee Rs.10000/- + Subscription Rs. 7500 /- + (GST 18%).</p>
//       <p>Annual renewal charges being Rs. 7500 /- + (GST 18% ).&nbsp; .</p>`,
//   },
//   startup: {
//     title: "APPLICATION FOR<br/>STARTUP MEMBERSHIP",
//     titleWidth: "66%",
//     repsNote: "(Four representatives can be nominated)*",
//     minReps: 4,
//     letter: `
//       <p>Please enroll us as a Startup Member of Kerala Management Association. We agree with the aims and objectives of the Association and will abide by its rules and regulations.</p>`,
//   },
// };

// const orgHtml = (type, d) => {
//   const c = orgConfig[type];
//   const reps = padRows(d.meetReps, c.minReps);
//   const refs = padRows(d.references, 2);
//   const mode = (d.commnMode || "").toLowerCase();
//   const oneLine = (s) =>
//     String(s ?? "")
//       .trim()
//       .replace(/,?\s*\n\s*/g, ", ");

//   const refCell = (r, i) =>
//     `<td class="refbox"><div>${i + 1}. ${v(
//       r.name
//     )}</div><div class="refaddr">${v(
//       r.address
//     )}</div><div class="refcontact">Contact No. : ${v(
//       r.contactNum
//     )}</div></td>`;

//   const startupRows =
//     type === "startup"
//       ? `<div class="line">Registration Details : ${v(d.regDetails)}</div>
//          <div class="line">Startup Year : ${v(
//            d.startupyear
//          )} &nbsp;&nbsp;&nbsp;&nbsp; Pincode : ${v(d.pincode)}</div>`
//       : "";

//   return `
//   <!-- PAGE 1 : cover letter -->
//   <div class="logo">${
//     LOGO ? `<img src="${LOGO}" style="width:225px"/>` : ""
//   }</div>
//   <div class="title-box" style="width:${c.titleWidth}">${c.title}</div>

//   <p class="from">From,</p>
//   <div class="dl">${v(d.orgName)}</div>
//   <div class="dl">${v(oneLine(d.postalAddress))}</div>
//   <div class="dl">${v(
//     [d.mobile && `Mob: ${d.mobile}`, d.email && `Email: ${d.email}`]
//       .filter(Boolean)
//       .join("   |   ")
//   )}</div>

//   <p class="to">To,</p>
//   <div class="toaddr">Kerala Management Association<br/>Management House${
//     type === "corporate" ? "" : ","
//   }<br/>Panampilly Nagar<br/><b class="underline">Cochin &ndash; 682036</b></div>

//   <div class="letter">${c.letter}</div>
//   ${paymentLine(d)}

//   <p style="margin-top:22px">Yours Faithfully,</p>
//   <p style="margin-top:34px">Signature</p>
//   <table class="plain" style="margin-top:24px"><tr><td>Place:</td><td class="right">Date : ${v(
//     fmtDate(d.createdAt)
//   )}</td></tr></table>

//   <div class="pagebreak"></div>

//   <!-- PAGE 2 : details -->
//   <div class="field">1. Name of the Organisation : ${v(d.orgName)}</div>
//   <div class="field tall">2. Postal Address :<div class="blk">${v(
//     d.postalAddress
//   )}</div></div>
//   <div class="field">3. GST No: ${v(d.gstNum)}</div>
//   ${startupRows ? `<div class="field">${startupRows}</div>` : ""}

//   <div class="field thick">
//     <table class="plain"><tr>
//       <td style="width:46%;vertical-align:top">4. Communication Address :<div class="blk">${v(
//         d.commnAddress
//       )}</div></td>
//       <td style="vertical-align:top">
//         <table class="plain tel">
//           <tr><td class="r">Telephone Number (O):</td><td>${v(
//             d.phone
//           )}</td></tr>
//           <tr><td class="r">Mobile:</td><td>${v(d.mobile)}</td></tr>
//           <tr><td class="r">Fax No:</td><td>${v(d.fax)}</td></tr>
//           <tr><td class="r">E-mail:</td><td>${v(d.email)}</td></tr>
//         </table>
//       </td></tr></table>
//   </div>

//   <div class="field">5. Nature of Business : ${v(d.nature)}</div>
//   <div class="field">6. Annual Turnover (Rs. Lakhs) : ${v(d.turnover)}</div>
//   <div class="field">7. No. of Employees
//     <div class="indent">Executives - ${v(d.executives)}<br/>Supervisors - ${v(
//     d.supervisors
//   )}<br/>Workers - ${v(d.workers)}</div>
//   </div>
//   <div class="field thick">
//     <table class="plain"><tr><td>8. Capital Employed : ${v(
//       d.capitalEmployed
//     )}</td><td>Paid up capital : ${v(d.paidupCapital)}</td></tr></table>
//   </div>

//   <p style="margin:18px 0 6px">Names of Representatives who will attend K.M.A Meetings (with designation)<br/>${
//     c.repsNote
//   }</p>
//   <table class="tbl grid reps">
//     <tr><th style="width:6%">Sl.No.</th><th style="width:9%">Photo</th><th>Name</th><th style="width:15%">Designation</th><th style="width:12%">Tel. No.</th><th style="width:12%">Mob. No.</th><th style="width:20%">E-mail Id</th></tr>
//     ${reps
//       .map(
//         (r, i) => `<tr>
//         <td>${i + 1}</td>
//         <td class="ph">${
//           r.photo?.location
//             ? `<img src="${esc(
//                 r.photo.location
//               )}" onerror="this.style.display='none'"/>`
//             : ""
//         }</td>
//         <td>${v(r.name)}</td><td>${v(r.designation)}</td><td>${v(
//           r.telephone
//         )}</td><td>${v(r.mobile)}</td><td class="brk">${v(r.email)}</td></tr>`
//       )
//       .join("")}
//   </table>
//   <p class="small" style="margin-top:6px">*Attach separate sheet in the same format if required. Please attach passport size photograph of each representative.</p>

//   <p style="margin:22px 0 6px">Proposed By: (Two references should be mentioned, one should be a KMA member)</p>
//   <table class="tbl refs"><tr>${refs
//     .slice(0, 2)
//     .map(refCell)
//     .join("")}</tr></table>

//   <p style="margin:18px 0 6px">Preference of Mode of Communication:</p>
//   <table class="plain modes"><tr>
//     <td>E-mail ${cb(mode === "email")}</td><td>Post ${cb(
//     mode === "post"
//   )}</td><td>SMS ${cb(mode === "sms")}</td>
//   </tr></table>

//   ${bankDetails}
//   ${officialUse(d, "list")}

//   <p class="just" style="margin-top:20px">NB: As per 24(b) The annual subscription shall fall due on 1st April every year. Members who do not pay the subscription on or before 1st October of the year shall automatically cease to be a member. However the membership can be reinstated on payment of the arrears of subscription in full.</p>
//   <table class="plain" style="margin-top:22px"><tr><td>Date: ${v(
//     fmtDate(d.createdAt)
//   )}</td><td class="right" style="padding-right:120px">Signature:</td></tr></table>
//   `;
// };

// // ------------------------------------------------------------------
// // CSS
// // ------------------------------------------------------------------
// const css = `
//   @page { size: A4; margin: 14mm 16mm; }
//   * { box-sizing: border-box; }
//   html, body { margin: 0; padding: 0; }
//   body { font-family: "Times New Roman", "Liberation Serif", Times, serif; font-size: 12.5px; color: #000; line-height: 1.35; position: relative; }
//   .v { color: #15286b; font-family: Arial, "Liberation Sans", Helvetica, sans-serif; font-size: 11px; white-space: pre-wrap; }
//   .bold { font-weight: bold; } .underline { text-decoration: underline; }
//   .center { text-align: center; } .right { text-align: right; } .just { text-align: justify; }
//   .small { font-size: 11px; } .big { font-size: 17px; }
//   .w50 { width: 50%; }
//   .pagebreak { page-break-after: always; break-after: page; height: 0; }

//   .logo { text-align: center; margin: 0 0 14px; }
//   .title-grey { background: #c0c0c0; text-align: center; font-weight: bold; font-size: 17px; line-height: 1.35; padding: 22px 10px; width: 66%; margin: 18px auto 34px; }
//   .title-box { border: 2px solid #000; outline: 1px solid #000; outline-offset: 2px; text-align: center; font-size: 20px; line-height: 1.25; padding: 10px 8px; margin: 22px auto 24px; }

//   .photo-box { position: absolute; top: 0; right: 0; width: 96px; height: 120px; border: 1px solid #000; text-align: center; font-size: 10px; color: #555; padding-top: 48px; overflow: hidden; }
//   .photo-box img { width: 96px; height: 120px; object-fit: cover; display: block; margin-top: -48px; }

//   .item { display: table; width: 100%; margin: 11px 0 5px; page-break-inside: avoid; page-break-after: avoid; break-after: avoid; }
//   .item .n { display: table-cell; width: 24px; vertical-align: top; }
//   .item .b { display: table-cell; vertical-align: top; }
//   .sub { margin: 7px 0 7px 24px; }
//   .indent { margin-left: 56px; }

//   table { border-collapse: collapse; }
//   table.plain { width: 100%; } table.plain td { padding: 1px 0; vertical-align: top; }
//   .tbl { width: 100%; margin: 4px 0 6px; }
//   .tbl th, .tbl td { border: 1px solid #000; padding: 3px 6px; vertical-align: top; font-size: 12px; text-align: left; }
//   .tbl th { background: #c0c0c0; font-weight: bold; }
//   .tbl th.center { text-align: center; }
//   .tbl tr { page-break-inside: avoid; }
//   .grid td { height: 22px; }
//   .grid.small td, .grid.small th { font-size: 11px; padding: 3px 4px; }
//   .addr { margin-left: 0; }
//   .addrbox { height: 92px; }
//   .jobbox { min-height: 70px; margin-top: 6px; }

//   .keep { page-break-inside: avoid; break-inside: avoid; }
//   .bank { margin-top: 4px; }
//   .bank td { font-family: Arial, "Liberation Sans", sans-serif; font-size: 12px; padding: 2px 6px; }
//   .bank .c1 { width: 6%; } .bank .c2 { width: 38%; } .bank .c3 { width: 4%; text-align: center; font-weight: bold; }
//   .pay td { font-size: 11.5px; padding: 5px 6px; }

//   .attach { margin: 2px 0 0; padding-left: 52px; font-size: 12px; }
//   .feebox { border-top: 2px solid #000; border-bottom: 2px solid #000; margin: 12px 0 22px; padding: 4px 0; font-size: 11.5px; }
//   .feebox ul { margin: 0; padding-left: 40px; list-style: disc; text-align: justify; }
//   .official td, .official th { font-size: 12px; padding: 2px 6px; }
//   .official th { background: #c0c0c0; }
//   .official td.w50 { width: 50%; }

//   .cb { display: inline-block; width: 26px; height: 14px; border: 1px solid #000; text-align: center; line-height: 12px; font-size: 11px; font-weight: bold; vertical-align: middle; margin-left: 6px; font-family: Arial, sans-serif; }
//   .circ { border: 1.5px solid #000; border-radius: 50%; padding: 1px 5px; font-weight: bold; }

//   .from, .to { margin: 20px 0 8px; }
//   .dl { border-bottom: 1px dotted #000; min-height: 26px; padding-top: 6px; margin-right: 80px; }
//   .toaddr { line-height: 1.3; }
//   .letter p { margin: 12px 0; text-align: justify; }

//   .field { border-bottom: 1px solid #000; padding: 10px 0 8px; min-height: 46px; }
//   .field.thick { border-bottom: 2px solid #000; }
//   .field.tall { min-height: 100px; }
//   .field .line { margin: 4px 0; }
//   .blk { margin: 4px 0 0 14px; }
//   table.tel td { padding: 0 2px; } table.tel td.r { text-align: right; width: 55%; }
//   table.modes td { width: 33%; }

//   .reps td { height: 38px; font-size: 11px; vertical-align: middle; }
//   .reps td.ph { text-align: center; padding: 1px; }
//   .reps td.ph img { width: 30px; height: 38px; object-fit: cover; display: block; margin: 0 auto; }
//   .reps td.brk { word-break: break-all; }
//   .refs td.refbox { width: 50%; height: 120px; position: relative; padding-bottom: 24px; }
//   .refs .refaddr { margin: 2px 0 0 14px; }
//   .refs .refcontact { position: absolute; left: 6px; bottom: 4px; }

//   .official-list { margin-top: 4px; }
//   table.official-list td { padding: 0; height: 26px; vertical-align: bottom; }
//   table.official-list td.lab { width: 33%; padding-bottom: 2px; } table.official-list td.colon { width: 14px; padding-bottom: 2px; }
//   table.official-list td.dots { border-bottom: 1px dotted #000; padding-left: 4px; }
// `;

// // ------------------------------------------------------------------
// // Public API
// // ------------------------------------------------------------------
// export const supportedPdfTypes = [
//   "individual",
//   "corporate",
//   "associate",
//   "startup",
// ];

// export const buildHtml = (type, data = {}) => {
//   const body =
//     type === "individual" ? individualHtml(data) : orgHtml(type, data);
//   return `<!doctype html><html><head><meta charset="utf-8"/><style>${css}</style></head><body>${body}</body></html>`;
// };

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ------------------------------------------------------------------
// Logo images (put the two PNG files in  <backend root>/assets/ )
// ------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, "..", "assets");

const loadImg = (name) => {
  try {
    const buf = fs.readFileSync(path.join(assetsDir, name));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch (e) {
    console.log(`[pdf] logo not found: ${path.join(assetsDir, name)}`);
    return "";
  }
};

const LOGO = loadImg("kma-logo.png"); // with "Affiliated to All India Management Association"
const LOGO_INDL = loadImg("kma-logo-indl.png"); // without the affiliated line

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const fmtDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }); // dd/mm/yyyy
};

// filled-in value (blue, looks like handwriting on the blank line)
const looseDate = (x) =>
  /^\d{4}-\d{2}-\d{2}/.test(String(x ?? "")) ? fmtDate(x) : x;

const v = (x) => `<span class="v">${esc(x)}</span>`;

// numbered item like "1.  Name in Full :"
const item = (n, html) =>
  `<div class="item"><div class="n">${n}.</div><div class="b">${html}</div></div>`;

// applicant's uploaded signature image (data.signature.location)
const sigImg = (d) =>
  d?.signature?.location
    ? `<img class="sig" src="${esc(
        d.signature.location
      )}" onerror="this.style.display='none'"/>`
    : "";

const cb = (checked) => `<span class="cb">${checked ? "X" : "&nbsp;"}</span>`;

const padRows = (arr, min) => {
  const rows = Array.isArray(arr) ? [...arr] : [];
  while (rows.length < min) rows.push({});
  return rows;
};

const fileName = (f) =>
  f && (f.name || f.location) ? f.name || "uploaded" : "";

// ------------------------------------------------------------------
// Shared blocks
// ------------------------------------------------------------------
const bankDetails = `
<div class="keep">
<p class="bold underline" style="margin:18px 0 6px">Bank details are given below:</p>
<table class="tbl bank">
  <tr><td class="c1">1.</td><td class="c2">Name of Bank Account</td><td class="c3">:</td><td>KERALA MANAGEMENT ASSOCIATION</td></tr>
  <tr><td class="c1">2.</td><td class="c2">Name of the Bank &amp;<br/>Address of the Branch</td><td class="c3">:</td><td>STATE BANK OF INDIA<br/>PANAMPILLY NAGAR<br/>COCHIN-682 036</td></tr>
  <tr><td class="c1">3.</td><td class="c2">Account Number</td><td class="c3">:</td><td>57001295933</td></tr>
  <tr><td class="c1">4.</td><td class="c2">MICR No.</td><td class="c3">:</td><td>682002912</td></tr>
  <tr><td class="c1">5.</td><td class="c2">IFSC Code</td><td class="c3">:</td><td>SBIN0070658</td></tr>
  <tr><td class="c1">6</td><td class="c2">Branch Code</td><td class="c3">:</td><td>7065</td></tr>
</table>
</div>`;

const paymentLine = (data) => {
  const hasAny =
    data?.payMode || data?.amount || typeof data?.hasRenewalPay === "boolean";
  if (!hasAny) return "";
  return `
  <table class="tbl pay">
    <tr>
      <td><b>Mode of Payment :</b> ${v(data?.payMode)}</td>
      <td><b>Amount (Rs.) :</b> ${v(data?.amount)}</td>
      <td><b>Including Renewal Payment :</b> ${v(
        data?.hasRenewalPay === true
          ? "Yes"
          : data?.hasRenewalPay === false
          ? "No"
          : ""
      )}</td>
    </tr>
  </table>`;
};

const uploadedList = (data, keys) => {
  const rows = keys
    .filter(([, k]) => fileName(data?.[k]))
    .map(
      ([label, k]) =>
        `${esc(label)}: <span class="v">${esc(fileName(data[k]))}</span>`
    );
  if (!rows.length) return "";
  return `<p class="small" style="margin:6px 0 0"><b>Documents uploaded online:</b> ${rows.join(
    " &nbsp;|&nbsp; "
  )}</p>`;
};

const officialUse = (data, style = "table") => {
  const rows = [
    ["Received on", ""],
    ["Amount received", ""],
    ["Receipt No.", ""],
    ["Membership Committee Decision", ""],
    ["Date of Admission", ""],
    ["Membership No.", data?.code || ""],
  ];
  if (style === "table") {
    return `
    <table class="tbl official">
      <tr><th colspan="2" class="center big">KMA OFFICIAL USE</th></tr>
      ${rows
        .map(
          ([l, val]) => `<tr><td class="w50">${l}</td><td>${v(val)}</td></tr>`
        )
        .join("")}
    </table>`;
  }
  return `
  <p class="bold center" style="margin:16px 0 8px">KMA OFFICIAL USE</p>
  <table class="plain official-list">
    ${rows
      .map(
        ([l, val]) =>
          `<tr><td class="lab">${l}</td><td class="colon">:</td><td class="dots">${v(
            val
          )}</td></tr>`
      )
      .join("")}
  </table>`;
};

// ------------------------------------------------------------------
// INDIVIDUAL
// ------------------------------------------------------------------
const individualHtml = (d) => {
  const quals = padRows(d.qualifications, 3);
  const trains = padRows(d.trainings, 4);
  const exps = padRows(d.experiences, 4);
  const refs = padRows(d.references, 2).slice(
    0,
    Math.max(2, (d.references || []).length)
  );
  const mf = (d.membershipFor || "").toUpperCase();
  const photoUrl = d.photo?.location;

  const refCells = (i) => {
    const r = refs[i] || {};
    return `<span class="v"><b>${esc(r.name || "")}</b></span><br/>${v(
      r.address
    )}`;
  };

  return `
  <div class="photo-box">${
    photoUrl
      ? `<img src="${esc(photoUrl)}" onerror="this.style.display='none'"/>`
      : "Passport size<br/>photograph"
  }</div>

  <div class="logo">${
    LOGO_INDL ? `<img src="${LOGO_INDL}" style="width:215px"/>` : ""
  }</div>
  <div class="title-grey">APPLICATION FOR<br/>INDIVIDUAL &ndash; LIFE / ORDINARY<br/>MEMBERSHIP</div>

  ${item(
    1,
    `Name in Full (CAPITAL LETTERS) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: &nbsp;${v(
      (d.applicantName || "").toUpperCase()
    )}`
  )}

  ${item(
    2,
    `<table class="plain"><tr><td>Date of Birth : ${v(fmtDate(d.dob))}</td>
     <td class="right">Senior Citizen &ndash; <span class="${
       d.isSeniorCitizen === true ? "circ" : ""
     }">YES</span> / <span class="${
      d.isSeniorCitizen === false ? "circ" : ""
    }">NO</span></td></tr></table>`
  )}

  ${item(3, `Name of the Organisation : ${v(d.orgName)}`)}
  <div class="sub">GST No : ${v(d.gstNum)}</div>
  <div class="sub">Designation : ${v(d.designation)}</div>

  ${item(4, `Address:`)}
  <table class="tbl addr">
    <tr><th class="center">Residence</th><th class="center">Office</th></tr>
    <tr><td class="addrbox">${v(
      d.residenceAddress
    )}</td><td class="addrbox">${v(d.officeAddress)}</td></tr>
    <tr><td>Phone: ${v(d.phone)}</td><td>Phone: ${v(d.officePhone)}</td></tr>
    <tr><td colspan="2">Mobile: ${v(d.mobile)}</td></tr>
    <tr><td colspan="2">E-Mail ID: ${v(d.email)}</td></tr>
  </table>

  ${item(
    5,
    `Membership Applied for : INDIVIDUAL LIFE ${cb(mf === "INDIVIDUAL LIFE")}
     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SENIOR CITIZEN LIFE ${cb(
       mf === "SENIOR CITIZEN LIFE"
     )}
     <br/><span style="margin-left:150px">ORDINARY ${cb(
       mf === "ORDINARY"
     )}</span>`
  )}

  ${item(
    6,
    `Are you already a Member of any LMA
     <div class="indent">Name : ${v(d.lmaName)}<br/>Membership No. : ${v(
      d.lmaMembershipNum
    )}</div>`
  )}

  ${item(
    7,
    `Academic / Professional Qualifications : (Please use additional sheets if required)`
  )}
  <table class="tbl grid">
    <tr><th style="width:32%">University / Institution</th><th style="width:30%">Degree / Diploma awarded</th><th style="width:16%">Duration</th><th>Award in the year</th></tr>
    ${quals
      .map(
        (q) =>
          `<tr><td>${v(q.institution)}</td><td>${v(q.title)}</td><td>${v(
            q.duration
          )}</td><td>${v(q.awardYear)}</td></tr>`
      )
      .join("")}
  </table>

  ${item(
    8,
    `Management Development / Training Courses Attended / Research work / Publication, if any :`
  )}
  <table class="tbl grid">
    <tr><th style="width:26%">Title</th><th style="width:34%">Association/Institution</th><th style="width:20%">Duration</th><th>Dates</th></tr>
    ${trains
      .map(
        (t) =>
          `<tr><td>${v(t.title)}</td><td>${v(t.institution)}</td><td>${v(
            t.duration
          )}</td><td>${v(looseDate(t.dates))}</td></tr>`
      )
      .join("")}
  </table>

  ${item(9, `Nature of Business / Profession : ${v(d.nature)}`)}
  ${item(10, `Annual Turnover : ${v(d.turnover)}`)}

  ${item(11, `PROFESSIONAL EXPERIENCE`)}
  <table class="tbl grid small">
    <tr><th style="width:10%">From</th><th style="width:10%">To</th><th style="width:22%">Name of organization</th><th style="width:16%">Designation</th><th>Job Details</th><th style="width:15%">Reporting To</th></tr>
    ${exps
      .map(
        (e) =>
          `<tr><td>${v(fmtDate(e.from))}</td><td>${v(
            fmtDate(e.to)
          )}</td><td>${v(e.organization)}</td><td>${v(
            e.designation
          )}</td><td>${v(e.detail)}</td><td>${v(e.reportingTo)}</td></tr>`
      )
      .join("")}
  </table>

  ${item(
    12,
    `Your job profile in the present employment (Please use additional sheets if required)<div class="jobbox">${v(
      d.jobProfile
    )}</div>`
  )}

  ${item(
    13,
    `<b>BUSINESS REFERENCE</b>: Please give the names and address of two persons, of which one should be your immediate superior and able to support your application by actual knowledge of your responsibilities. If you are head of your firm, please name two business / professional associates. One of your referees should be a Member of KMA. Referees will be approached at the discretion of KMA.`
  )}
  <table class="tbl addr">
    <tr><th class="center w50">Referee (1)</th><th class="center w50">Referee (2)</th></tr>
    <tr><td class="addrbox">${refCells(0)}</td><td class="addrbox">${refCells(
    1
  )}</td></tr>
    <tr><td>Contact No. : ${v(refs[0]?.contactNum)}</td><td>Contact No. : ${v(
    refs[1]?.contactNum
  )}</td></tr>
  </table>

  <div class="pagebreak"></div>

  ${item(14, `<b>DECLARATION BY APPLICANT</b>`)}
  <div class="indent just">
    <p>I declare that the statements made throughout this application are correct to the best of my knowledge and belief and I agree to be governed by the bye laws of the Kerala Management Association.&nbsp; I also undertake to abide by the &lsquo;KMA Code of Conduct for Professional Managers&rsquo; that the Managing Committee may frame from time to time.</p>
    <p class="bold" style="margin-top:14px">PAY BY DEMAND DRAFT OR CHEQUE ONLY</p>
    <p>Enclosed is Draft/Cheque No&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;.. dated &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip; for Rs&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;. Drawn on &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip; (bank) in favour of KERALA MANAGEMENT ASSOCIATION and marked &ldquo;Account Payee only&rdquo;</p>
  </div>
  ${paymentLine(d)}
  <table class="plain" style="margin-top:26px"><tr><td>Date : ${v(
    fmtDate(d.createdAt)
  )}</td><td class="right" style="padding-right:60px">${sigImg(
    d
  )}Signature :</td></tr></table>

  ${bankDetails}

  <p style="margin:16px 0 4px">Please attach the following :-</p>
  <ol class="attach">
    <li>Two passport size photographs.</li>
    <li>Copies of certificates a) Proof of age and b) Degree / PG</li>
    <li>Crossed Cheque /DD in favour of &ldquo;KERALA MANAGEMENT ASSOCIATION&rdquo;, Cochin.</li>
    <li>One page Bio &ndash; data</li>
  </ol>
  ${uploadedList(d, [
    ["Photo", "photo"],
    ["Age Proof", "ageProof"],
    ["Degree Certificate", "degreeCertificate"],
    ["Bio Data", "bioData"],
  ])}

  <div class="feebox">
    <ul>
      <li>Individual Life Membership &ndash; Rs.38940/- including GST @ 18%</li>
      <li>Senior Life Membership (above 60 years of age)- Rs.21240/- including GST 18%</li>
      <li>Ordinary Individual Membership &ndash; Rs.7080/- including GST @ 18%</li>
      <li>24(b) The annual subscription shall fall due on 1st April every year. Members who do not pay the subscription on or before 1st October of the year shall automatically cease to be a member. However, the membership can be reinstated on payment of the arrears of subscription in full.</li>
    </ul>
  </div>

  ${officialUse(d, "table")}
  `;
};

// ------------------------------------------------------------------
// CORPORATE / ASSOCIATE / STARTUP
// ------------------------------------------------------------------
const orgConfig = {
  corporate: {
    title: "APPLICATION FOR<br/>CORPORATE&nbsp; MEMBERSHIP",
    titleWidth: "66%",
    repsNote: "(Four representatives can be nominated)*",
    minReps: 4,
    letter: `
      <p>Please enroll us as a Corporate Member of Kerala Management Association. We agree with the aims and objectives of the Association and will abide by its rules and regulations.</p>
      <p>We enclose herewith a cheque / bank draft for Rs.41300/-* towards Corporate Membership Fee..</p>
      <p>*(Entrance Fee Rs.20000/- + Subscription Rs.15,000/- + GST @ 18%).</p>
      <p>Annual renewal charges being Rs.15,000/- + (GST @ 18%)</p>
      <p>*Those who have GST registration should not pay the KFC</p>`,
  },
  associate: {
    title: "APPLICATION FOR<br/>A<b>S</b>SOCIATE CORPORATE<br/>MEMBERSHIP",
    titleWidth: "70%",
    repsNote: "(Two representatives can be nominated)*",
    minReps: 2,
    letter: `
      <p>Please enroll us as an Associate Corporate Member of&nbsp; Kerala Management Association. We agree with the aims and objectives of the Association and will abide by its rules and regulations.</p>
      <p>We enclose herewith a cheque / bank draft for Rs.20650/-* towards Associate Corporate Membership Fee.</p>
      <p>*(Entrance Fee Rs.10000/- + Subscription Rs. 7500 /- + (GST 18%).</p>
      <p>Annual renewal charges being Rs. 7500 /- + (GST 18% ).&nbsp; .</p>`,
  },
  startup: {
    title: "APPLICATION FOR<br/>STARTUP MEMBERSHIP",
    titleWidth: "66%",
    repsNote: "(Four representatives can be nominated)*",
    minReps: 4,
    letter: `
      <p>Please enroll us as a Startup Member of Kerala Management Association. We agree with the aims and objectives of the Association and will abide by its rules and regulations.</p>`,
  },
};

const orgHtml = (type, d) => {
  const c = orgConfig[type];
  const reps = padRows(d.meetReps, c.minReps);
  const refs = padRows(d.references, 2);
  const mode = (d.commnMode || "").toLowerCase();
  const oneLine = (s) =>
    String(s ?? "")
      .trim()
      .replace(/,?\s*\n\s*/g, ", ");

  const refCell = (r, i) =>
    `<td class="refbox"><div>${i + 1}. ${v(
      r.name
    )}</div><div class="refaddr">${v(
      r.address
    )}</div><div class="refcontact">Contact No. : ${v(
      r.contactNum
    )}</div></td>`;

  const startupRows =
    type === "startup"
      ? `<div class="line">Registration Details : ${v(d.regDetails)}</div>
         <div class="line">Startup Year : ${v(
           d.startupyear
         )} &nbsp;&nbsp;&nbsp;&nbsp; Pincode : ${v(d.pincode)}</div>`
      : "";

  return `
  <!-- PAGE 1 : cover letter -->
  <div class="logo">${
    LOGO ? `<img src="${LOGO}" style="width:225px"/>` : ""
  }</div>
  <div class="title-box" style="width:${c.titleWidth}">${c.title}</div>

  <p class="from">From,</p>
  <div class="dl">${v(d.orgName)}</div>
  <div class="dl">${v(oneLine(d.postalAddress))}</div>
  <div class="dl">${v(
    [d.mobile && `Mob: ${d.mobile}`, d.email && `Email: ${d.email}`]
      .filter(Boolean)
      .join("   |   ")
  )}</div>

  <p class="to">To,</p>
  <div class="toaddr">Kerala Management Association<br/>Management House${
    type === "corporate" ? "" : ","
  }<br/>Panampilly Nagar<br/><b class="underline">Cochin &ndash; 682036</b></div>

  <div class="letter">${c.letter}</div>
  ${paymentLine(d)}

  <p style="margin-top:22px">Yours Faithfully,</p>
  <div class="sigleft" style="margin-top:14px;min-height:50px">${sigImg(
    d
  )}</div>
  <p style="margin-top:2px">Signature</p>
  <table class="plain" style="margin-top:24px"><tr><td>Place:</td><td class="right">Date : ${v(
    fmtDate(d.createdAt)
  )}</td></tr></table>

  <div class="pagebreak"></div>

  <!-- PAGE 2 : details -->
  <div class="field">1. Name of the Organisation : ${v(d.orgName)}</div>
  <div class="field tall">2. Postal Address :<div class="blk">${v(
    d.postalAddress
  )}</div></div>
  <div class="field">3. GST No: ${v(d.gstNum)}</div>
  ${startupRows ? `<div class="field">${startupRows}</div>` : ""}

  <div class="field thick">
    <table class="plain"><tr>
      <td style="width:46%;vertical-align:top">4. Communication Address :<div class="blk">${v(
        d.commnAddress
      )}</div></td>
      <td style="vertical-align:top">
        <table class="plain tel">
          <tr><td class="r">Telephone Number (O):</td><td>${v(
            d.phone
          )}</td></tr>
          <tr><td class="r">Mobile:</td><td>${v(d.mobile)}</td></tr>
          <tr><td class="r">Fax No:</td><td>${v(d.fax)}</td></tr>
          <tr><td class="r">E-mail:</td><td>${v(d.email)}</td></tr>
        </table>
      </td></tr></table>
  </div>

  <div class="field">5. Nature of Business : ${v(d.nature)}</div>
  <div class="field">6. Annual Turnover (Rs. Lakhs) : ${v(d.turnover)}</div>
  <div class="field">7. No. of Employees
    <div class="indent">Executives - ${v(d.executives)}<br/>Supervisors - ${v(
    d.supervisors
  )}<br/>Workers - ${v(d.workers)}</div>
  </div>
  <div class="field thick">
    <table class="plain"><tr><td>8. Capital Employed : ${v(
      d.capitalEmployed
    )}</td><td>Paid up capital : ${v(d.paidupCapital)}</td></tr></table>
  </div>

  <p style="margin:18px 0 6px">Names of Representatives who will attend K.M.A Meetings (with designation)<br/>${
    c.repsNote
  }</p>
  <table class="tbl grid reps">
    <tr><th style="width:6%">Sl.No.</th><th style="width:9%">Photo</th><th>Name</th><th style="width:15%">Designation</th><th style="width:12%">Tel. No.</th><th style="width:12%">Mob. No.</th><th style="width:20%">E-mail Id</th></tr>
    ${reps
      .map(
        (r, i) => `<tr>
        <td>${i + 1}</td>
        <td class="ph">${
          r.photo?.location
            ? `<img src="${esc(
                r.photo.location
              )}" onerror="this.style.display='none'"/>`
            : ""
        }</td>
        <td>${v(r.name)}</td><td>${v(r.designation)}</td><td>${v(
          r.telephone
        )}</td><td>${v(r.mobile)}</td><td class="brk">${v(r.email)}</td></tr>`
      )
      .join("")}
  </table>
  <p class="small" style="margin-top:6px">*Attach separate sheet in the same format if required. Please attach passport size photograph of each representative.</p>

  <p style="margin:22px 0 6px">Proposed By: (Two references should be mentioned, one should be a KMA member)</p>
  <table class="tbl refs"><tr>${refs
    .slice(0, 2)
    .map(refCell)
    .join("")}</tr></table>

  <p style="margin:18px 0 6px">Preference of Mode of Communication:</p>
  <table class="plain modes"><tr>
    <td>E-mail ${cb(mode === "email")}</td><td>Post ${cb(
    mode === "post"
  )}</td><td>SMS ${cb(mode === "sms")}</td>
  </tr></table>

  ${bankDetails}
  ${officialUse(d, "list")}

  <p class="just" style="margin-top:20px">NB: As per 24(b) The annual subscription shall fall due on 1st April every year. Members who do not pay the subscription on or before 1st October of the year shall automatically cease to be a member. However the membership can be reinstated on payment of the arrears of subscription in full.</p>
  <table class="plain" style="margin-top:22px"><tr><td>Date: ${v(
    fmtDate(d.createdAt)
  )}</td><td class="right" style="padding-right:90px">${sigImg(
    d
  )}Signature:</td></tr></table>
  `;
};

// ------------------------------------------------------------------
// CSS
// ------------------------------------------------------------------
const css = `
  @page { size: A4; margin: 14mm 16mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Times New Roman", "Liberation Serif", Times, serif; font-size: 12.5px; color: #000; line-height: 1.35; position: relative; }
  .v { color: #15286b; font-family: Arial, "Liberation Sans", Helvetica, sans-serif; font-size: 11px; white-space: pre-wrap; }
  .bold { font-weight: bold; } .underline { text-decoration: underline; }
  .center { text-align: center; } .right { text-align: right; } .just { text-align: justify; }
  .small { font-size: 11px; } .big { font-size: 17px; }
  .w50 { width: 50%; }
  .pagebreak { page-break-after: always; break-after: page; height: 0; }

  .logo { text-align: center; margin: 0 0 14px; }
  .title-grey { background: #c0c0c0; text-align: center; font-weight: bold; font-size: 17px; line-height: 1.35; padding: 22px 10px; width: 66%; margin: 18px auto 34px; }
  .title-box { border: 2px solid #000; outline: 1px solid #000; outline-offset: 2px; text-align: center; font-size: 20px; line-height: 1.25; padding: 10px 8px; margin: 22px auto 24px; }

  .photo-box { position: absolute; top: 0; right: 0; width: 96px; height: 120px; border: 1px solid #000; text-align: center; font-size: 10px; color: #555; padding-top: 48px; overflow: hidden; }
  .photo-box img { width: 96px; height: 120px; object-fit: cover; display: block; margin-top: -48px; }

  .item { display: table; width: 100%; margin: 11px 0 5px; page-break-inside: avoid; page-break-after: avoid; break-after: avoid; }
  .item .n { display: table-cell; width: 24px; vertical-align: top; }
  .item .b { display: table-cell; vertical-align: top; }
  .sub { margin: 7px 0 7px 24px; }
  .indent { margin-left: 56px; }

  table { border-collapse: collapse; }
  table.plain { width: 100%; } table.plain td { padding: 1px 0; vertical-align: top; }
  .tbl { width: 100%; margin: 4px 0 6px; }
  .tbl th, .tbl td { border: 1px solid #000; padding: 3px 6px; vertical-align: top; font-size: 12px; text-align: left; }
  .tbl th { background: #c0c0c0; font-weight: bold; }
  .tbl th.center { text-align: center; }
  .tbl tr { page-break-inside: avoid; }
  .grid td { height: 22px; }
  .grid.small td, .grid.small th { font-size: 11px; padding: 3px 4px; }
  .addr { margin-left: 0; }
  .addrbox { height: 92px; }
  .jobbox { min-height: 70px; margin-top: 6px; }

  .sig { max-height: 50px; max-width: 190px; object-fit: contain; display: block; margin: 0 0 2px auto; }
  .sigleft .sig { margin: 0; }
  .keep { page-break-inside: avoid; break-inside: avoid; }
  .bank { margin-top: 4px; }
  .bank td { font-family: Arial, "Liberation Sans", sans-serif; font-size: 12px; padding: 2px 6px; }
  .bank .c1 { width: 6%; } .bank .c2 { width: 38%; } .bank .c3 { width: 4%; text-align: center; font-weight: bold; }
  .pay td { font-size: 11.5px; padding: 5px 6px; }

  .attach { margin: 2px 0 0; padding-left: 52px; font-size: 12px; }
  .feebox { border-top: 2px solid #000; border-bottom: 2px solid #000; margin: 12px 0 22px; padding: 4px 0; font-size: 11.5px; }
  .feebox ul { margin: 0; padding-left: 40px; list-style: disc; text-align: justify; }
  .official td, .official th { font-size: 12px; padding: 2px 6px; }
  .official th { background: #c0c0c0; }
  .official td.w50 { width: 50%; }

  .cb { display: inline-block; width: 26px; height: 14px; border: 1px solid #000; text-align: center; line-height: 12px; font-size: 11px; font-weight: bold; vertical-align: middle; margin-left: 6px; font-family: Arial, sans-serif; }
  .circ { border: 1.5px solid #000; border-radius: 50%; padding: 1px 5px; font-weight: bold; }

  .from, .to { margin: 20px 0 8px; }
  .dl { border-bottom: 1px dotted #000; min-height: 26px; padding-top: 6px; margin-right: 80px; }
  .toaddr { line-height: 1.3; }
  .letter p { margin: 12px 0; text-align: justify; }

  .field { border-bottom: 1px solid #000; padding: 10px 0 8px; min-height: 46px; }
  .field.thick { border-bottom: 2px solid #000; }
  .field.tall { min-height: 100px; }
  .field .line { margin: 4px 0; }
  .blk { margin: 4px 0 0 14px; }
  table.tel td { padding: 0 2px; } table.tel td.r { text-align: right; width: 55%; }
  table.modes td { width: 33%; }

  .reps td { height: 38px; font-size: 11px; vertical-align: middle; }
  .reps td.ph { text-align: center; padding: 1px; }
  .reps td.ph img { width: 30px; height: 38px; object-fit: cover; display: block; margin: 0 auto; }
  .reps td.brk { word-break: break-all; }
  .refs td.refbox { width: 50%; height: 120px; position: relative; padding-bottom: 24px; }
  .refs .refaddr { margin: 2px 0 0 14px; }
  .refs .refcontact { position: absolute; left: 6px; bottom: 4px; }

  .official-list { margin-top: 4px; }
  table.official-list td { padding: 0; height: 26px; vertical-align: bottom; }
  table.official-list td.lab { width: 33%; padding-bottom: 2px; } table.official-list td.colon { width: 14px; padding-bottom: 2px; }
  table.official-list td.dots { border-bottom: 1px dotted #000; padding-left: 4px; }
`;

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------
export const supportedPdfTypes = [
  "individual",
  "corporate",
  "associate",
  "startup",
];

export const buildHtml = (type, data = {}) => {
  const body =
    type === "individual" ? individualHtml(data) : orgHtml(type, data);
  return `<!doctype html><html><head><meta charset="utf-8"/><style>${css}</style></head><body>${body}</body></html>`;
};
