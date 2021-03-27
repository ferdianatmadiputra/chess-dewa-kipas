const router = require("express").Router();
const userRouter = require("./userRouter");
const historyRouter = require("./historyRouter");

router.use("/users", userRouter);
router.use("/histories", historyRouter);

module.exports = router;
