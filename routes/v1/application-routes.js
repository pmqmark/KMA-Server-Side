import { applicationCtrl } from "../../controllers/v1/application-controller.js";
import express from "express";
import { authMiddleware } from "../../middlewares/auth-middleware.js";

const applicationRouter = express.Router();

import { adminChecker } from "../../middlewares/adminChecker.js";
import { superChecker } from "../../middlewares/superChecker.js";

applicationRouter.post(
  "/individual",
  applicationCtrl.CreateIndividualApplication
);

applicationRouter.post(
  "/corporate",
  applicationCtrl.CreateCorporateApplication
);

applicationRouter.post(
  "/associate",
  applicationCtrl.CreateAssociateCorporateApplication
);

applicationRouter.post("/startup", applicationCtrl.CreateStartupApplication);

applicationRouter.use(authMiddleware);
applicationRouter.use(adminChecker);

applicationRouter.get("/:type/:id/pdf", applicationCtrl.DownloadApplicationPdf);

applicationRouter.get("", applicationCtrl.GetAllApplications);
applicationRouter.get("/count", applicationCtrl.applicationCount);
applicationRouter.get("/view/:id", applicationCtrl.ViewApplication);
applicationRouter.get("/:id", applicationCtrl.GetApplication);

applicationRouter.put(
  "/status/:id",
  superChecker,
  applicationCtrl.UpdateMembershipStatus
);

applicationRouter.put(
  "/individual/:id",
  applicationCtrl.UpdateIndividualApplication
);

applicationRouter.put(
  "/corporate/:id",
  applicationCtrl.UpdateCorporateApplication
);

applicationRouter.put(
  "/associate/:id",
  applicationCtrl.UpdateAssociateCorporateApplication
);

applicationRouter.put("/startup/:id", applicationCtrl.UpdateStartupApplication);

export { applicationRouter };
