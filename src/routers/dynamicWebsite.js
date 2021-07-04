const express = require('express');
const Website = require('../models/dynamicWebsite');
const auth = require('../Middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

const router = express.Router();

const avatar = multer({
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.toLowerCase().match(/\.(jfif|jpg|jepg|png)$/)) {
      cb(new Error('Please Provide a Image'));
    }
    cb(undefined, true);
  },
});

// Create website
router.post(
  '/createWebsite',
  auth,
  avatar.single('avatar'),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .resize(250, 250)
        .png()
        .toBuffer();

      const websiteName = getRandomString(
        req.body.name.split(' ')[0].toLowerCase(),
        2
      );

      const website = new Website({
        websiteName: websiteName,
        name: req.body.name,
        gender: req.body.gender,
        age: req.body.age,
        avatar: buffer,
        about: req.body.about,
        owner: req.user._id,
      });

      await website.save();
      var host = req.get('host');
      res.send({ websiteName: websiteName + '.' + host });
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

// Render Website
router.get('/', async (req, res) => {
  var domain = req.get('host').match(/\w+/);
  if (domain) {
    var subdomain = domain[0];
  } else {
    res.status(400).send('Wrong domain');
  }

  try {
    let website = await Website.findOne({ websiteName: subdomain });

    res.render('index', {
      websiteName: subdomain,
      name: website.name,
      gender: website.gender,
      age: website.age,
      about: website.about,
      avatar: 'http://' + domain.input + '/avatar/' + subdomain,
    });
  } catch (e) {
    res.status(400).send('Wrong domain');
  }
});

//Render image
router.get('/avatar/:name', async (req, res) => {
  let website = await Website.findOne({ websiteName: req.params.name });

  if (!website) {
    res.status(400).send('invalid Name');
    return;
  }

  res.set('Content-Type', 'image/png');
  res.send(website.avatar);
});

function getRandomString(name, length) {
  var randomChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return name + result;
}

module.exports = router;
