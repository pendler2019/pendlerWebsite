var express = require("express");
var path = require("path");
var alert = require("alert");
const bcrypt = require('bcrypt'),
  multer = require('multer'),
  mongoose = require("mongoose"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  LocalStrategy = require('passport-local').Strategy,
  passportLocalMongoose = require("passport-local-mongoose"),

  User = require("./model/User"),
  Job = require("./model/Job"),
  Banner = require("./model/Banner"),
  Feedback = require("./model/Feedback"),
  Jobapplication = require("./model/JobApplication"),
  Portfolio = require("./model/Portfolio"),
  Services = require("./model/Services"),
  Technologies = require("./model/Technologies"),
  Ourvalues = require("./model/Ourvalues"),
  Address = require("./model/Address"),
  About = require("./model/About"),
  WhyPendler = require("./model/WhyPendler"),
  Counts = require("./model/Counts"),
  Mission_Team = require("./model/Mission_Team"),

  nocache = require('nocache');
const session = require('express-session');

mongoose.connect("mongodb://0.0.0.0:27017/pendler", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var app = express();
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, '/public')));

app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: false, limit: '20mb' }))

app.use("/", require("./routes/web"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'srjthomas42119951996',
  resave: false,
  saveUninitialized: false
}));

passport.use(new LocalStrategy(async (Username, Password, done) => {
  try {
    const user = await User.findOne({ Username });
    if (!user) {
      return done(null, false, { message: 'Incorrect username' });
    }
    const passwordMatch = await bcrypt.compare(Password, user.Password);

    if (!passwordMatch) {
      return done(null, false, { message: 'Incorrect password' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use(passport.initialize());
app.use(passport.session());
app.use(nocache());
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  }
});
const upload = multer({ storage });
app.post("/login", async function (req, res) {
  const { Username, Password } = req.body;

  try {
    const user = await User.findOne({ Username: Username });

    if (user) {
      const passwordMatch = await bcrypt.compare(Password, user.Password);

      if (passwordMatch) {
        req.session.loggedIn = true;
        req.session.Username = Username;
        res.sendStatus(200);
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
const requireLogin = (req, res, next) => {
  if (req.session.loggedIn && req.session.Username) {
    next();
  } else {
    res.redirect('/login');
  }
};
app.get('/profile', requireLogin, async (req, res) => {
  const username = req.session.Username;
  try {
    const user = await User.findOne({ Username: username }).exec();

    if (user) {
      res.render('home/Admin/auth/profile', { user: user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/profile', requireLogin, async (req, res) => {
  const username = req.session.Username;
  const { newUsername, newEmail, newPassword } = req.body;
  try {
    const user = await User.findOne({ Username: username }).exec();

    if (user) {
      if (newUsername) {
        user.Username = newUsername;
        req.session.destroy();
      }
      if (newEmail) {
        user.email = newEmail;
      }
      if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.Password = hashedPassword;
        req.session.destroy();
      }
      await user.save();
      res.render('home/Admin/auth/profile', { user: user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/dashboard', requireLogin, async (req, res) => {
  try {
    const username = req.session.Username;
    const jobapp = await Jobapplication.find().exec();
    const jobCount = jobapp.length;

    let totalViews = 0;
    jobapp.forEach((job) => {
      totalViews += job.views;
    });
    const bannerCount = await Banner.countDocuments();
    const jobPostCount = await Job.countDocuments();
    const feedbackCount = await Feedback.countDocuments();

    res.render('home/Admin/dashboard', { jobCount, totalViews, Username: username, bannerCount, jobPostCount, feedbackCount });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/register', async (req, res) => {
  try {
    const { Username, email, Password } = req.body;

    const existingUser = await User.findOne().or([{ Username }, { email }]);
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(Password, 10);
    const newUser = new User({
      Username,
      email,
      Password: hashedPassword
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
    return res.render('home/Admin/auth/login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});
//////////////////////////////////// Job Posting/////////////////////

app.post("/jobpost", async (req, res) => {
  const jobs = await Job.create({

    jobid: req.body.jobid,
    jobrole: req.body.jobrole,
    description: req.body.description,
    date: Date.now
  });
  return res.redirect('/joblist');
});
app.get('/joblist', async (req, res) => {
  try {
    const jobs = await Job.find();

    res.render('home/Admin/JobPosting/joblist', { jobs });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/jobs/:id/edit', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    res.render('home/Admin/JobPosting/edit', { job });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/jobs/:id/edit', async (req, res) => {
  try {
    const { jobid, jobrole, description } = req.body;

    await Job.findByIdAndUpdate(req.params.id, {
      jobid,
      jobrole,
      description
    });

    res.redirect('/joblist');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/jobs/:id/delete', async (req, res) => {
  try {
    await Job.findByIdAndRemove(req.params.id);
    res.redirect('/joblist');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
////////////////////////////////////Careers/////////////////////////////////////////

app.post('/careers', upload.single('resume'), (req, res) => {
  const { applicant_name, applicant_email, description } = req.body;
  const resumePath = req.file.filename;
  const newApplication = new Jobapplication({
    jobid:req.body.jobid,
    applicant_name,
    applicant_email,
    description,
    added_date: new Date(),
    resume: resumePath
  });
  newApplication.save()
    .then(() => {
      res.sendStatus(200);
    })
    .catch(error => {
      console.error('Error saving data:', error);
      res.sendStatus(500);
    });
});
app.get('/applicationlist', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters, default to page 1 if not provided
    const limit = 10; // Number of job applications per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    const totalApplications = await Jobapplication.countDocuments(); // Get the total number of job applications

    const totalPages = Math.ceil(totalApplications / limit); // Calculate the total number of pages

    const jobapp = await Jobapplication.find().skip(skip).limit(limit).exec();

    res.render('home/Admin/JobPosting/applicationlist', { jobapp, totalPages, currentPage: page });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/jobapp/:id/delete', async (req, res) => {
  try {
    await Jobapplication.findByIdAndRemove(req.params.id);
    res.redirect('/applicationlist');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
//////////////////////////////////////////////////////Banner/////////////////////////////////////////////

app.use(bodyParser.json());
app.use('/images', express.static('public/images'));
app.get('/banners', async (req, res) => {
  try {
    const banns = await Banner.find().sort({ sortOrder: 1 }).exec();
    res.render('home/Admin/Banner/banners', { banns });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/images', upload.single('imageUrl'), async (req, res) => {
  const { name, sortOrder, added_date, description } = req.body;
  const imageUrl = req.file.filename;
  const image = new Banner({ name, imageUrl, sortOrder, added_date, description });
  try {
    const savedImage = await image.save();
    res.redirect('/banners');
  } catch (err) {
    res.render('home/Admin/Banner/addbanner');
  }
});
app.get('/images/:id/edit', async (req, res) => {
  try {
    const bann = await Banner.findById(req.params.id);
    res.render('home/Admin/Banner/edit', { bann });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/images/:id/edit', upload.single('imageUrl'), async (req, res) => {
  const { name, sortOrder, description } = req.body;
  try {
    const image = await Banner.findById(req.params.id);
    if (name) {
      image.name = name;
    }
    if (sortOrder) {
      image.sortOrder = sortOrder;
    } if (description) {
      image.description = description;
    }
    if (req.file) {
      const imageUrl = req.file.filename;
      image.imageUrl = imageUrl;
    }
    await image.save();
    res.redirect('/banners');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/images/:id/delete', async (req, res) => {
  try {
    await Banner.findByIdAndRemove(req.params.id);
    res.redirect('/banners');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
//////////////////////////////////////////////////////Our Values/////////////////////////////////////////////

//app.use(bodyParser.json());
app.use('/ourvalues', express.static('public/images'));
app.get('/ourvalues', async (req, res) => {
  try {
    const ourvalues = await Ourvalues.find().sort({ sortOrder: 1 }).exec();
    res.render('home/Admin/Ourvalues/list', { ourvalues });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/ourvalues', upload.single('imageUrl'), async (req, res) => {
  const { title, sortOrder, added_date, description } = req.body;
  const imageUrl = req.file.filename;
  const image = new Ourvalues({ title, imageUrl, sortOrder, added_date, description });
  try {
    const savedImage = await image.save();
    res.redirect('/ourvalues');
  } catch (err) {
    res.render('home/Admin/Ourvalues/addvalues');
  }
});
app.get('/ourvalues/:id/edit', async (req, res) => {
  try {
    const ourvalues = await Ourvalues.findById(req.params.id);
    res.render('home/Admin/Ourvalues/edit', { ourvalues });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/ourvalues/:id/edit', upload.single('imageUrl'), async (req, res) => {
  const { title, sortOrder, description } = req.body;
  try {
    const image = await Ourvalues.findById(req.params.id);
    if (title) {
      image.title = title;
    }
    if (sortOrder) {
      image.sortOrder = sortOrder;
    } if (description) {
      image.description = description;
    }
    if (req.file) {
      const imageUrl = req.file.filename;
      image.imageUrl = imageUrl;
    }
    await image.save();
    res.redirect('/ourvalues');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/ourvalues/:id/delete', async (req, res) => {
  try {
    await Ourvalues.findByIdAndRemove(req.params.id);
    res.redirect('/ourvalues');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
/////////////////////////////////////////Contact Form///////////////////////////////////////
//app.use(express.json());

app.post('/contact', async (req, res) => {
  try {
    const newContact = new Feedback({
      f_name: req.body.f_name,
      f_email: req.body.f_email,
      f_message: req.body.f_message,
      ip:req.ip,
    date: new Date()
    });

    await newContact.save();
    // alert('Feedback saved Successfully');
    res.json({ success: true, message: 'Contact saved successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Failed to save contact' });
  }
});

app.get('/feedbacks', async (req, res) => {
  try {
    const feeds = await Feedback.find().exec();
    res.render('home/Admin/Feedbacks/list', { feeds });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/feedbacks/:id/delete', async (req, res) => {
  try {
    await Feedback.findByIdAndRemove(req.params.id);
    res.redirect('/feedbacks');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
///////////////////////////////////////////PortFolio of Clients////////////////////////////////////////////////////

app.get('/portfolio', async (req, res) => {
  try {
    const folio = await Portfolio.find().exec();
    res.render('home/Admin/Portfolio/list', { folio });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post("/foliopost", async (req, res) => {
  const folios = await Portfolio.create({

    client: req.body.client,
    message: req.body.message
  });
  return res.redirect('/portfolio');
});
app.get('/portfolio/:id/edit', async (req, res) => {
  try {
    const foli = await Portfolio.findById(req.params.id);
    res.render('home/Admin/Portfolio/edit', { foli });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/portfolio/:id/edit', async (req, res) => {
  try {
    const { client,message } = req.body;

    await Portfolio.findByIdAndUpdate(req.params.id, {
      client,
      message
    });

    res.redirect('/portfolio');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/portfolio/:id/delete', async (req, res) => {
  try {
    await Portfolio.findByIdAndRemove(req.params.id);
    res.redirect('/portfolio');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
////////////////////////////////////////Technologies////////////////////////////////////////////////////////////

app.use('/technologiesimages', express.static('public/images'));
app.get('/ourtechnologies', async (req, res) => {
  try {
    const pageSize = 6; 
    const page = parseInt(req.query.page) || 1;
    const totalServices = await Technologies.countDocuments();

    const totalPages = Math.ceil(totalServices / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const tech = await Technologies.find().sort({ sortOrder: 1 }).skip(startIndex).limit(pageSize).exec();

    res.render('home/Admin/Technologies/list', { tech, currentPage: page, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/technologiesimages', upload.single('imageUrl'), async (req, res) => {
  const { name, sortOrder, added_date, description } = req.body;
  const imageUrl = req.file.filename;
  const image = new Technologies({ name, imageUrl, sortOrder, added_date, description });
  try {
    const savedImage = await image.save();
    res.redirect('/ourtechnologies');
  } catch (err) {
    res.render('home/Admin/Technologies/add');
  }
});
app.get('/technologiesimages/:id/edit', async (req, res) => {
  try {
    const serr = await Technologies.findById(req.params.id);
    res.render('home/Admin/Technologies/edit', { serr });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/technologiesimages/:id/edit', upload.single('imageUrl'), async (req, res) => {
  const { name, sortOrder, description } = req.body;
  try {
    const image = await Technologies.findById(req.params.id);
    if (name) {
      image.name = name;
    }
    if (sortOrder) {
      image.sortOrder = sortOrder;
    }  if (description) {
      image.description = description;
    }
    if (req.file) {
      const imageUrl = req.file.filename;
      image.imageUrl = imageUrl;
    }
    await image.save();
    res.redirect('/ourtechnologies');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/technologiesimages/:id/delete', async (req, res) => {
  try {
    await Technologies.findByIdAndRemove(req.params.id);
    res.redirect('/ourtechnologies');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
//////////////////////////////Services/////////////////////////////////////////////////////////////////

app.use('/serviceimages', express.static('public/images'));
app.get('/services', async (req, res) => {
  try {
    const pageSize = 6; // Desired number of services per page
    const page = parseInt(req.query.page) || 1; // Get the current page from the query parameters
    const totalServices = await Services.countDocuments(); // Count the total number of services

    const totalPages = Math.ceil(totalServices / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const ser = await Services.find().sort({ sortOrder: 1 }).skip(startIndex).limit(pageSize).exec();

    res.render('home/Admin/Services/list', { ser, currentPage: page, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/serviceimages', upload.single('imageUrl'), async (req, res) => {
  const { title,name, sortOrder, added_date, description,pageUrl } = req.body;
  const imageUrl = req.file.filename;
  const image = new Services({ title,name, imageUrl, sortOrder, added_date, description,pageUrl });
  try {
    const savedImage = await image.save();
    res.redirect('/services');
  } catch (err) {
    res.render('home/Admin/Services/add');
  }
});
app.get('/serviceimages/:id/edit', async (req, res) => {
  try {
    const serr = await Services.findById(req.params.id);
    res.render('home/Admin/Services/edit', { serr });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/serviceimages/:id/edit', upload.single('imageUrl'), async (req, res) => {
  const { title,name, sortOrder, description,pageUrl } = req.body;
  try {
    const image = await Services.findById(req.params.id);
    if (title) {
      image.title = title;
    } 
    if (name) {
      image.name = name;
    }
    if (sortOrder) {
      image.sortOrder = sortOrder;
    } if (pageUrl) {
      image.pageUrl = pageUrl;
    } if (description) {
      image.description = description;
    }
    if (req.file) {
      const imageUrl = req.file.filename;
      image.imageUrl = imageUrl;
    }
    await image.save();
    res.redirect('/services');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/serviceimages/:id/delete', async (req, res) => {
  try {
    await Services.findByIdAndRemove(req.params.id);
    res.redirect('/services');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
////////////////////////////////Address/////////////////////////////////////////////////////////////////

app.get('/personal_address', async (req, res) => {
  try {
    const adddr = await Address.find().exec();
    res.render('home/Admin/auth/address', { adddr });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post("/addresspost", async (req, res) => {
  const addr = await Address.create({

    location: req.body.location,
    address: req.body.address,
    phone1: req.body.phone1,
    phone2: req.body.phone2,
    email: req.body.email,
    facebook: req.body.facebook,
    instagram: req.body.instagram,
    twitter: req.body.twitter,
    linkedin: req.body.linkedin
  });
  return res.redirect('/personal_address');
});
app.get('/personal_address/:id/edit', async (req, res) => {
  try {
    const addr = await Address.findById(req.params.id);
    res.render('home/Admin/auth/edit', { addr });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/personal_address/:id/edit', async (req, res) => {
  try {
    const { address,
      phone1,
      location,
      phone2,
      email,
      facebook,
      instagram,
      twitter,
      linkedin } = req.body;
    

    await Address.findByIdAndUpdate(req.params.id, {
      location,
      address,
      phone1,
      phone2,
      email,
      facebook,
      instagram,
      twitter,
      linkedin
    });

    res.redirect('/personal_address');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/personal_address/:id/delete', async (req, res) => {
  try {
    await Address.findByIdAndRemove(req.params.id);
    res.redirect('/personal_address');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
//////////////////////////////////////About Us//////////////////////////////////////////////////////////

app.get('/aboutus', async (req, res) => {
  try {
    const ab = await About.find().exec();
    res.render('home/Admin/About/list', { ab });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/addabout', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'icon1', maxCount: 1 },
  { name: 'icon2', maxCount: 1 },
  { name: 'icon3', maxCount: 1 }
]), async (req, res) => {
  try {
    const { description, content1, content2, content3 } = req.body;
    const image1 = req.files['image1'][0].filename;
    const image2 = req.files['image2'] ? req.files['image2'][0].filename : '';
    const image3 = req.files['image3'] ? req.files['image3'][0].filename : '';
    const icon1 = req.files['icon1'][0].filename;
    const icon2 = req.files['icon2'] ? req.files['icon2'][0].filename : '';
    const icon3 = req.files['icon3'] ? req.files['icon3'][0].filename : '';

    const aboutData = new About({
      description: description,
      image1: image1,
      image2: image2,
      image3: image3,
      icon1: icon1, 
      icon2: icon2, 
      icon3: icon2,
      content1: content1, 
      content2: content2,
      content3: content3
    });

    await aboutData.save();

    res.redirect('/aboutus');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/aboutus/:id/edit', async (req, res) => {
  try {
    const ab = await About.findById(req.params.id);
    res.render('home/Admin/About/edit', { ab });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/aboutus/:id/edit', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'icon1', maxCount: 1 },
  { name: 'icon2', maxCount: 1 },
  { name: 'icon3', maxCount: 1 }
]), async (req, res) => {
  try {
    const { description, content1, content2, content3,title1,title2,title3 } = req.body;
    const image1 = req.files['image1'] ? req.files['image1'][0].filename : '';
    const image2 = req.files['image2'] ? req.files['image2'][0].filename : '';
    const image3 = req.files['image3'] ? req.files['image3'][0].filename : '';
    const icon1 = req.files['icon1'] ? req.files['icon1'][0].filename : '';
    const icon2 = req.files['icon2'] ? req.files['icon2'][0].filename : '';
    const icon3 = req.files['icon3'] ? req.files['icon3'][0].filename : '';

    const aboutId = req.params.id;

    const aboutData = await About.findById(aboutId);

    if (!aboutData) {
      return res.status(404).send('About data not found');
    }

    // Update fields if provided, otherwise keep the existing values
    aboutData.description = description || aboutData.description;
    aboutData.image1 = image1 || aboutData.image1;
    aboutData.image2 = image2 || aboutData.image2;
    aboutData.image3 = image3 || aboutData.image3;
    aboutData.icon1 = icon1 || aboutData.icon1;
    aboutData.icon2 = icon2 || aboutData.icon2;
    aboutData.icon3 = icon3 || aboutData.icon3;
    aboutData.title1 = title1 || aboutData.title1;
    aboutData.title2 = title2 || aboutData.title2;
    aboutData.title3 = title3 || aboutData.title3;
    aboutData.content1 = content1 || aboutData.content1;
    aboutData.content2 = content2 || aboutData.content2;
    aboutData.content3 = content3 || aboutData.content3;

    await aboutData.save();

    res.redirect('/aboutus');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/aboutus/:id/delete', async (req, res) => {
  try {
    await About.findByIdAndRemove(req.params.id);
    res.redirect('/aboutus');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
////////////////////////////////////Why Pendler////////////////////////////////////////////////////

app.get('/wp', async (req, res) => {
  try {
    const wp = await WhyPendler.find().exec();
    res.render('home/Admin/WhyPendler/list', { wp });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post("/wppost", async (req, res) => {
  const folios = await WhyPendler.create({

    title: req.body.title,
    message: req.body.message
  });
  return res.redirect('/wp');
});
app.get('/wp/:id/edit', async (req, res) => {
  try {
    const wp = await WhyPendler.findById(req.params.id);
    res.render('home/Admin/WhyPendler/edit', { wp });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/wp/:id/edit', async (req, res) => {
  try {
    const { title,message } = req.body;

    await WhyPendler.findByIdAndUpdate(req.params.id, {
      title,
      message
    });

    res.redirect('/wp');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/wp/:id/delete', async (req, res) => {
  try {
    await WhyPendler.findByIdAndRemove(req.params.id);
    res.redirect('/wp');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
///////////////////////////////////////////Homepage Count bar////////////////////////////////////////

app.get('/ch', async (req, res) => {
  try {
    const ch = await Counts.find().exec();
    res.render('home/Admin/Counts/list', { ch });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post("/chpost", async (req, res) => {
  const folios = await Counts.create({

    title: req.body.title,
    h_count: req.body.h_count
  });
  return res.redirect('/ch');
});
app.get('/ch/:id/edit', async (req, res) => {
  try {
    const ch = await Counts.findById(req.params.id);
    res.render('home/Admin/Counts/edit', { ch });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/ch/:id/edit', async (req, res) => {
  try {
    const { title,h_count } = req.body;

    await Counts.findByIdAndUpdate(req.params.id, {
      title,
      h_count
    });

    res.redirect('/ch');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/ch/:id/delete', async (req, res) => {
  try {
    await Counts.findByIdAndRemove(req.params.id);
    res.redirect('/ch');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
///////////////////////////////////////////What we Offer/////////////////////////

app.get('/mt', async (req, res) => {
  try {
    const mt = await Mission_Team.find().exec();
    res.render('home/Admin/Mission_Team/list', { mt });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post("/mtpost", async (req, res) => {
  const folios = await Mission_Team.create({

    we_offer: req.body.we_offer,
    mission: req.body.mission,
    team: req.body.team,
  });
  return res.redirect('/mt');
});
app.get('/mt/:id/edit', async (req, res) => {
  try {
    const mt = await Mission_Team.findById(req.params.id);
    res.render('home/Admin/Mission_Team/edit', { mt });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/mt/:id/edit', async (req, res) => {
  try {
    const { we_offer,mission,team } = req.body;

    await Mission_Team.findByIdAndUpdate(req.params.id, {
      we_offer,
      mission,
      team
    });

    res.redirect('/mt');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/mt/:id/delete', async (req, res) => {
  try {
    await Mission_Team.findByIdAndRemove(req.params.id);
    res.redirect('/mt');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(app.get("port"), function () {
  console.log("server started on port" + app.get("port"));
});
