var express = require("express");
var router = express.Router();
var passport = require("passport");
var nocache = require('nocache');
const mongoose = require("mongoose");
const Banner = require("../../model/Banner");
const Job = require("../../model/Job");
const Portfolio = require("../../model/Portfolio");
const Services = require("../../model/Services");
const Technologies = require("../../model/Technologies");
const Ourvalues = require("../../model/Ourvalues");
const Address = require("../../model/Address");
const About = require("../../model/About");
const Counts = require("../../model/Counts");
const WhyPendler = require("../../model/WhyPendler");
const Mission_Team = require("../../model/Mission_Team");
router.use(nocache());

const retrieveBanners = async () => {
  try {
    const banns = await Banner.find();
    return banns;
  } catch (error) {
    console.error('Error retrieving Banners:', error);
    throw error;
  }
};
const retrieveJobs = async () => {
  try {
    const jobs = await Job.find();
    return jobs;
  } catch (error) {
    console.error('Error retrieving Jobs:', error);
    throw error;
  }
};
const retrievePortfolio = async () => {
  try {
    const folio = await Portfolio.find();
    return folio;
  } catch (error) {
    console.error('Error retrieving Portfolio:', error);
    throw error;
  }
};
const retrieveServices = async () => {
  try {
    const ser = await Services.find();
    return ser;
  } catch (error) {
    console.error('Error retrieving Services:', error);
    throw error;
  }
};
const retrieveTechnologies = async () => {
  try {
    const tec = await Technologies.find();
    return tec;
  } catch (error) {
    console.error('Error retrieving Technologies:', error);
    throw error;
  }
};
const retrieveOurvalues = async () => {
  try {
    const tec = await Ourvalues.find().limit(4);
    return tec;
  } catch (error) {
    console.error('Error retrieving Ourvalues:', error);
    throw error;
  }
};
const retrieveAddress = async () => {
  try {
    const addr = await Address.find();
    return addr;
  } catch (error) {
    console.error('Error retrieving Address:', error);
    throw error;
  }
};
const retrieveAbout = async () => {
  try {
    const addr = await About.findOne();
    return addr;
  } catch (error) {
    console.error('Error retrieving About:', error);
    throw error;
  }
};
const retrieveWeOffer = async () => {
  try {
    const mt = await Mission_Team.findOne();
    return mt;
  } catch (error) {
    console.error('Error retrieving Mission Team:', error);
    throw error;
  }
};
const retrieveCounts = async () => {
  try {
    const ct = await Counts.find().limit(4);;
    return ct;
  } catch (error) {
    console.error('Error retrieving Counts:', error);
    throw error;
  }
};
const retrieveWhyPendler = async () => {
  try {
    const wp = await WhyPendler.find().limit(3);;
    return wp;
  } catch (error) {
    console.error('Error retrieving WhyPendler:', error);
    throw error;
  }
};
router.get("/", async (req, res) => {
  try {
    const banns = await retrieveBanners();
    const folio = await retrievePortfolio();
    const ser = await retrieveServices();
    const ourval = await retrieveOurvalues();
    const addr = await retrieveAddress();
    const ct = await retrieveCounts();
    const ser1 = await ser.slice(0, 6);
    const ser2 = await ser.slice(6);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const about = await retrieveAbout();
    const mt = await retrieveWeOffer();
    res.render('home/Website/index', { banns, folio, ser1, ser, ser2, baseUrl,ourval,addr,about,ct,mt });  // Pass the banns data to the rendered view
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});
router.get('/home', async (req, res) => {
  try {
    const banns = await retrieveBanners();
    const folio = await retrievePortfolio();
    const ser = await retrieveServices();
    const ourval = await retrieveOurvalues();
    const addr = await retrieveAddress();
    const ct = await retrieveCounts();
    const ser1 = await ser.slice(0, 6);
    const ser2 = await ser.slice(6);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const about = await retrieveAbout();
    const mt = await retrieveWeOffer();
    res.render('home/Website/home', { banns, folio, ser1, ser, ser2, baseUrl,ourval,addr,about,ct,mt });  // Pass the banns data to the rendered view
  }catch (error) {
    res.status(500).send('Internal Server Error');
  }
});
router.get("/careers", async (req, res) => {
  try {
    const jobs = await retrieveJobs();
    const ser = await retrieveServices();
    const ser1 = await ser.slice(0, 6);
    const ser2 = await ser.slice(6);
    const addr = await retrieveAddress();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const about = await retrieveAbout();
    res.render('home/Website/careers', { jobs, ser1, ser, ser2, baseUrl,addr,about }); // Pass the banns data to the rendered view
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});
router.get('/job_description/:id', async (req, res) => {
  try {
    const jobs = await retrieveJobs();
    const jobId = req.params.id;
    const jobdescription = await Job.findById(jobId);
    const ser = await retrieveServices();
    const ser1 = await ser.slice(0, 6);
    const ser2 = await ser.slice(6);
    const addr = await retrieveAddress();
    const about = await retrieveAbout();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    if (jobdescription) {
      res.render('home/Website/job_description', { jobdescription,baseUrl,ser1, ser, ser2,addr,about });
    } else {
      res.status(404).send('Jobs not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
router.get("/about", async (req, res) => {
  try {
    const ser = await retrieveServices();
    const ser1 = await ser.slice(0, 6);
    const ser2 = await ser.slice(6);
    const addr = await retrieveAddress();
    const about = await retrieveAbout();
    const wp = await retrieveWhyPendler();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.render('home/Website/about', { ser1, ser, ser2, baseUrl,addr,about,wp });
  }
  catch (error) {
    res.status(500).send('Internal Server Error');
  }
});
router.get("/contactus", async (req, res) => {
  try {
    const ser = await retrieveServices();
    const ser1 = await ser.slice(0, 6);
    const ser2 = await ser.slice(6);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const addr = await retrieveAddress();
    const about = await retrieveAbout();
    res.render('home/Website/contactus', { ser1, ser, ser2, baseUrl,addr,about });
  }
  catch (error) {
    res.status(500).send('Internal Server Error');
  }

});


router.get("/technologies", async (req, res) => {
  try {
    const ser = await retrieveServices();
    const ser1 = await ser.slice(0, 6);
    const ser2 = await ser.slice(6);
    const addr = await retrieveAddress();
    const tec = await retrieveTechnologies();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const about = await retrieveAbout();
    res.render('home/Website/technologies', { ser1, ser, ser2, baseUrl, tec,addr,about});
  }
  catch (error) {
    res.status(500).send('Internal Server Error');
  }

});
// router.get("/apex", async(req,res)=>{
//   try{
//     const ser = await retrieveServices();
//     const ser1 = await ser.slice(0, 6);
//     const ser2 = await ser.slice(6);
//     res.render('home/Website/apex', { ser1,ser,ser2 }); 
//   }
//   catch (error) {
//     res.status(500).send('Internal Server Error');
//   }
// });
// router.get("/dba", async(req,res)=>{
//   try{
//     const ser = await retrieveServices();
//     const ser1 = await ser.slice(0, 6);
//     const ser2 = await ser.slice(6);
//     res.render('home/Website/dba', { ser1,ser,ser2 }); 
//   }
//   catch (error) {
//     res.status(500).send('Internal Server Error');
//   }
// });

router.get('/ourservices/:id', async (req, res) => {
  try {
    const ser = await retrieveServices();
    const ser1 = await ser.slice(0, 6);
    const ser2 = await ser.slice(6);
    const serviceId = req.params.id;
    const service = await Services.findById(serviceId);
    const addr = await retrieveAddress();
    const about = await retrieveAbout();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    if (service) {
      res.render('home/Website/services', { service, ser1, ser, ser2, baseUrl,addr,about });
    } else {
      res.status(404).send('Service not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get("/test", function (req, res) {
  res.render("home/Website/test");
});

router.get("/chat", function (req, res) {
  res.render("home/chat");
});
//////////////////////////Admin panel ////////////////////////////////////
router.get("/register", function (req, res) {
  res.render("home/Admin/auth/register");
});
router.get("/addbanner", function (req, res) {
  res.render("home/Admin/Banner/addbanner");
});
router.get("/addaddress", function (req, res) {
  res.render("home/Admin/auth/add");
});
router.get("/addvalues", function (req, res) {
  res.render("home/Admin/Ourvalues/addvalues");
});
router.get("/addportfolio", function (req, res) {
  res.render("home/Admin/Portfolio/add");
});
router.get("/addwhypendler", function (req, res) {
  res.render("home/Admin/WhyPendler/add");
});
router.get("/addcounts", function (req, res) {
  res.render("home/Admin/Counts/add");
});
router.get("/addwhatwe_offer", function (req, res) {
  res.render("home/Admin/Mission_Team/add");
});

router.get("/addjob", function (req, res) {
  res.render("home/Admin/JobPosting/add");
});
router.get("/addServices", function (req, res) {
  res.render("home/Admin/Services/add");
});
router.get("/addTechnologies", function (req, res) {
  res.render("home/Admin/Technologies/add");
});
router.get("/addabout", function (req, res) {
  res.render("home/Admin/About/add");
});

router.get("/login", function (req, res) {

  res.render("home/Admin/auth/login");
});
router.get('/change-password', (req, res) => {
  res.render('home/Admin/auth/change-password');
});
module.exports = router;