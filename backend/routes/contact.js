const { validateContact, Contact } = require("../models/Contact");
const auth = require("../middlewares/auth");

const mongoose = require("mongoose");
const router = require("express").Router();

// create contact.
router.post("/contact", auth, async (req, res) => {
  const { error } = validateContact(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, address, email, phone } = req.body;

  try {
    const newContact = new Contact({
      name,
      address,
      email,
      phone,
      postedBy: req.user._id,
    });
    const result = await newContact.save();

    return res.status(201).json({ ...result._doc });
  } catch (err) {
    console.log(err);
  }
});

// fetch contact.
router.get("/mycontacts", auth, async (req, res) => {
  try {
    const myContacts = await Contact.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "-password"
    );

    return res.status(200).json({ contacts: myContacts.reverse() });
  } catch (err) {
    console.log(err);
  }
});

// update contact.
router.put("/contact", auth, async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ error: "no id specified." });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });

  try {
    const contact = await Contact.findOne({ _id: id });

    if (req.user._id.toString() !== contact.postedBy._id.toString())
      return res
        .status(401)
        .json({ error: "you can't edit other people contacts!" });

    const updatedData = { ...req.body, id: undefined };
    const result = await Contact.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    return res.status(200).json({ ...result._doc });
  } catch (err) {
    console.log(err);
  }
});

// delete a contact.
router.delete("/delete/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "no id specified." });

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });
  try {
    const contact = await Contact.findOne({ _id: id });
    if (!contact) return res.status(400).json({ error: "no contact found" });

    if (req.user._id.toString() !== contact.postedBy._id.toString())
      return res
        .status(401)
        .json({ error: "you can't delete other people contacts!" });

    const result = await Contact.deleteOne({ _id: id });
    const myContacts = await Contact.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "-password"
    );

    return res
      .status(200)
      .json({ ...contact._doc, myContacts: myContacts.reverse() });
  } catch (err) {
    console.log(err);
  }
});

// to get a single contact.
router.get("/contact/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "no id specified." });

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });

  try {
    const contact = await Contact.findOne({ _id: id });

    return res.status(200).json({ ...contact._doc });
  } catch (err) {
    console.log(err);
  }
});

// Route to toggle favorite status
router.put('/toggle-favorite/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    contact.favorite = !contact.favorite; // Toggle favorite status
    await contact.save();

    res.json({ success: true, contact });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//vcf import
const vCard = require('vcf');

// Route to import contacts from a VCF file
router.post("/import-vcf", auth, async (req, res) => {
  try {
    const vcfData = req.body.vcfFile; // Assume the VCF file is sent in the body (it could be multipart form-data)
    const vCardParsed = new vCard();
    vCardParsed.parse(vcfData);

    // Iterate over contacts and save them in the database
    vCardParsed.contacts.forEach(async (vcfContact) => {
      const { name, email, phone, address } = vcfContact;
      const newContact = new Contact({
        name,
        email,
        phone,
        address,
        postedBy: req.user._id,
      });

        await newContact.save();
    });

    res.status(200).json({ message: 'Contacts imported successfully!' });
  } catch (error) {
    console.error("Error importing VCF", error);
    res.status(500).json({ error: "Failed to import VCF file." });
  }
});

//vcf export
router.get("/export-vcf", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ postedBy: req.user._id });

    let vCardString = "";
    contacts.forEach((contact) => {
      const vCardInstance = new vCard();
      vCardInstance.set('name', contact.name);
      vCardInstance.set('email', contact.email);
      vCardInstance.set('phone', contact.phone);
      vCardInstance.set('address', contact.address);

      vCardString += vCardInstance.toString();
    });

    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.vcf');
    res.status(200).send(vCardString);
  } catch (error) {
    console.error("Error exporting VCF", error);
    res.status(500).json({ error: "Failed to export VCF file." });
  }
});

module.exports = router;
