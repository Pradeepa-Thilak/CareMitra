const express = require("express");
const router = express.Router();

const { searchProductsES, advancedSearch } = require("../controllers/searchController");

router.get("/", searchProductsES);          // basic search
router.get("/advanced", advancedSearch);    // advanced search

module.exports = router;
