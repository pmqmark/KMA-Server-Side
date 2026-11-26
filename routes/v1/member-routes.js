import { memberCtrl } from "../../controllers/v1/member-controller.js";
import express from "express";
const memberRouter = express.Router();
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { adminChecker } from "../../middlewares/adminChecker.js";
import { superChecker } from "../../middlewares/superChecker.js";
import { upload } from "../../middlewares/multerToS3.js";

memberRouter.use(authMiddleware);

memberRouter.get("/profile/:id", memberCtrl.GetProfile);

memberRouter.use(adminChecker);

memberRouter.get("/view/:id", memberCtrl.ViewMember);
memberRouter.get("/:id", memberCtrl.GetMember);
memberRouter.get("", memberCtrl.GetManyMembers);

memberRouter.patch("/:id", superChecker, memberCtrl.ChangeMemberActiveStatus);
memberRouter.delete("/:id", memberCtrl.DeleteMember);

// memberRouter.post('/individual', memberCtrl.createIndividualMemberByAdmin);

// memberRouter.post('/corporate', memberCtrl.createCorporateMemberByAdmin);

// memberRouter.post('/associate', memberCtrl.createAssociateMemberByAdmin);

// memberRouter.post('/startup', memberCtrl.createStartupMemberByAdmin);

memberRouter.post(
  "/create",
  upload.single("photo"),
  memberCtrl.createMemberByAdmin
);

memberRouter.put("/individual/:id", memberCtrl.updateIndividualMember);

memberRouter.put("/corporate/:id", memberCtrl.updateCorporateMember);

memberRouter.put("/associate/:id", memberCtrl.updateAssociateMember);

memberRouter.put("/startup/:id", memberCtrl.updateStartupMember);

export { memberRouter };
