const router = require("express").Router();
const HistoryController = require("../controllers/historyController");
const authenticate = require("../middlewares/authenticate");

router.use(authenticate);
router.post("/", HistoryController.addHistory);
router.get("/:id", HistoryController.findHistoryById);

module.exports = router;
