'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Company = mongoose.model('Company'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  multer = require('multer'),
  config = require(path.resolve('./config/config'));

/**
* Koden redan motsvarar hur servern kan lagra bilder lokalt och via aws s3
*/
// AWS
//var multerS3 = require('multer-s3');
//var AWS = require('aws-sdk');
//AWS.config.region = 'eu-west-1';
//var s3 = new AWS.S3({ params: { Bucket: config.s3bucket } });

//exports.getProfilePicture = function (req, res) {
//  var img = req.params.image;
//  var url;
//  if(process.env.NODE_ENV !== 'production'){
//    url = 'http://' + req.headers.host + '/uploads/' + img;
//  } else {
//    url = s3.getSignedUrl('getObject', { Bucket: config.s3bucket, Key: img });
//  }
//  res.redirect(url);
//};

/**
 * Update profile picture
 */
//exports.changeProfilePicture = function (req, res) {
//  var user = req.user;
//  var message = null;
//  var upload, fileKey;

  // Upload locally if not production.
//  if(process.env.NODE_ENV !== 'production'){
//    upload = multer(config.uploads.profileUpload).single('newProfilePicture');
//  } else {
    // Production - upload to s3.
//    fileKey = 'profile_pic_' + Date.now().toString();
//    upload = multer({
//      storage: multerS3({
//        s3: s3,
//        bucket: config.s3bucket,
//        metadata: function (req, file, cb) {
//          cb(null, { fieldName: file.fieldname });
//        },
//        key: function (req, file, cb) {
//          cb(null, fileKey);
//        }
//      })
//    }).single('newProfilePicture');
//  }

  // Filtering to upload only images
//  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;
//  upload.fileFilter = profileUploadFileFilter;
//};

/**
 * Create a Company
 */
exports.create = function(req, res) {
  var company = new Company(req.body);
  company.user = req.user;

  company.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(company);
    }
  });
};

/**
 * Show the current Company
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var company = req.company ? req.company.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  company.isCurrentUserOwner = req.user && company.user && company.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(company);
};

/**
 * Update a Company
 */
exports.update = function(req, res) {
  var company = req.company ;

  company = _.extend(company , req.body);

  company.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(company);
    }
  });
};

/**
 * Delete an Company
 */
exports.delete = function(req, res) {
  var company = req.company ;

  company.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(company);
    }
  });
};

/**
 * List of Companies
 */
exports.list = function(req, res) {
  Company.find().sort('-created').populate('user', 'displayName').exec(function(err, companies) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(companies);
    }
  });
};

/**
 * Company middleware
 */
exports.companyByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Company is invalid'
    });
  }

  Company.findById(id).populate('user', 'displayName').exec(function (err, company) {
    if (err) {
      return next(err);
    } else if (!company) {
      return res.status(404).send({
        message: 'No Company with that identifier has been found'
      });
    }
    req.company = company;
    next();
  });
};
