const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Person = require("../../models/Person");

const Profile = require("../../models/Profile");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((Profile) => {
        if (!Profile) {
          return res.status(404).json({ Error: "No profile found" });
        }
        res.json(Profile);
      })
      .catch((err) => console.log("Got some error in profile" + err));
  }
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const profileValues = {};
    profileValues.user = req.user.id;
    if (req.body.username) profileValues.username = req.body.username;
    if (req.body.website) profileValues.website = req.body.website;
    if (req.body.country) profileValues.country = req.body.country;
    if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
    if (typeof req.body.languages !== undefined) {
      profileValues.languages = req.body.languages.split(",");
    }
    profileValues.social = {};
    if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
    if (req.body.instagram) profileValues.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileValues },
            { new: true }
          )
            .then((profile) => res.json(profile))
            .catch((err) => console.log("Problem in Update" + err));
        } else {
          Profile.findOne({ username: profileValues.username })
            .then((profile) => {
              if (profile) {
                res.status(400).json({ username: "Username already exists" });
              }
              new Profile(profileValues)
                .save()
                .then((profile) => res.json(profile))
                .catch((err) => console.log(err));
            })
            .catch((err) => console.log("Username not found" + err));
        }
      })
      .catch((err) => console.log("Problem in fetching profile " + err));
  }
);

router.get("/:username", (req, res) => {
  Profile.findOne({ username: req.params.username })
    .populate("user", ["name", "profilepic"])
    .then((profile) => {
      if (!profile) {
        res.status(404).json({ usernotfound: "usernotfound" });
      }
      res.json(profile);
    })
    .catch((err) => console.log("Error in fetching username" + err));
});

router.get("/find/everyone", (req, res) => {
  Profile.find()
    .populate("user", ["name", "profilepic"])
    .then((profiles) => {
      if (!profiles) {
        res.status(404).json({ Empty: "No profile was found" });
      }
      res.json(profiles);
    })
    .catch((err) => console.log("Error in fetching username" + err));
});

router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id });
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        Person.findOneAndRemove({ _id: req.user.id })
          .then(() => res.json({ sucess: "Succesfully Deleted" }))
          .catch((err) => consosle.log(err));
      })
      .catch((err) => console.log(err));
  }
);

router.post(
  "/workrole",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          res.status(404).json({ Notfound: "User not found" });
        }
        const newWork = {
          role: req.body.role,
          company: req.body.company,
          country: req.body.country,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          details: req.body.details,
        };
        profile.workrole.unshift(newWork);
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

router.delete(
  "/workrole/:w_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          res.status(404).json({ Error: "No user was found" });
        }
        const removethis = profile.workrole
          .map((item) => item.id)
          .indexOf(req.params.w_id);

        profile.workrole.splice(removethis, 1);
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

module.exports = router;
