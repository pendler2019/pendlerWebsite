var express= require("express");
var router=express.Router();
var nocache = require('nocache');
router.use(nocache());

router.use("/",require("./home"));

module.exports=router;