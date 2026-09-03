/* ===================================================
   Yolandi's 45th — Saturday-Only RSVP form logic
   Submits to the SAME Google Apps Script Web App / Sheet
   used by the full-weekend invitation (script.js).
   This file is fully independent from script.js so the
   full-weekend form is never affected by changes here.
   =================================================== */

(function () {
  "use strict";

  // Same Google Apps Script /exec URL used by the full-weekend form.
  var GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzM1rBN9pLvHV7qhPfGqYxyWBpdJoBDufnm_Qp7JKyzih2HivgZRwwSRSkFOmk_t7Zy/exec";

  var form = document.getElementById("saturdayRsvpForm");
  var attendingBlock = document.getElementById("attendingBlock");
  var notAttendingMessage = document.getElementById("notAttendingMessage");
  var formError = document.getElementById("formError");
  var submitBtn = document.getElementById("submitBtn");

  var loadingView = document.getElementById("loadingView");
  var successView = document.getElementById("successView");
  var successMemories = document.getElementById("successMemories");
  var successRegrets = document.getElementById("successRegrets");

  var isSubmitting = false;

  function qAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setRequired(container, isRequired) {
    qAll("input, select, textarea", container).forEach(function (el) {
      if (el.dataset.alwaysOptional === "true") return;
      el.required = isRequired;
    });
  }

  function showBlock(el) {
    el.hidden = false;
  }
  function hideBlock(el) {
    el.hidden = true;
  }

  // ---- mark optional fields so setRequired never forces them ----
  ["emailAddress", "dietaryRequirements", "additionalNotes"].forEach(function (name) {
    var el = form.elements[name];
    if (el) el.dataset.alwaysOptional = "true";
  });

  // ---- attending toggle ----
  function handleAttendingChange() {
    var value = getRadioValue("attending");

    if (value === "Yes, I'll be there") {
      showBlock(attendingBlock);
      hideBlock(notAttendingMessage);
      setRequired(attendingBlock, true);
    } else if (value === "Unfortunately, I can't make it") {
      hideBlock(attendingBlock);
      showBlock(notAttendingMessage);
      setRequired(attendingBlock, false);
    } else {
      hideBlock(attendingBlock);
      hideBlock(notAttendingMessage);
      setRequired(attendingBlock, false);
    }
  }

  function getRadioValue(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  form.addEventListener("change", function (e) {
    if (e.target.name === "attending") handleAttendingChange();
  });

  // ---- validation ----
  function validate() {
    hideFormError();

    if (!form.checkValidity()) {
      var firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof firstInvalid.focus === "function") firstInvalid.focus();
      }
      showFormError("Please complete the highlighted fields before continuing.");
      return false;
    }

    var attending = getRadioValue("attending");
    if (!attending) {
      showFormError("Please let us know whether you'll be joining us.");
      return false;
    }

    return true;
  }

  function showFormError(message) {
    formError.textContent = message;
    formError.hidden = false;
  }
  function hideFormError() {
    formError.hidden = true;
    formError.textContent = "";
  }

  // ---- build payload ----
  // Uses the SAME field names as the full-weekend form so the data lands
  // in the same Google Sheet columns. Fields that don't apply to a
  // Saturday-only guest (overnight/accommodation) are sent as empty
  // strings rather than omitted, to keep the row structure consistent.
  // One additional field, invitationType, is appended at the end to
  // identify Saturday-only submissions — this only adds an extra value,
  // it does not remove or rename any of the existing fields the Apps
  // Script already expects.
  function buildPayload() {
    var data = new FormData(form);
    var attending = data.get("attending") || "";
    var memoriesParticipation = data.get("memoriesParticipation") || "";

    var payload = {
      fullName: (data.get("fullName") || "").toString().trim(),
      contactNumber: (data.get("contactNumber") || "").toString().trim(),
      emailAddress: (data.get("emailAddress") || "").toString().trim(),
      attending: attending,
      adults: attending === "Yes, I'll be there" ? data.get("adults") || "" : "",
      children: attending === "Yes, I'll be there" ? data.get("children") || "" : "",
      overnightStay: "",
      accommodationGuests: "",
      numberOfNights: "",
      accommodationPreference: "",
      sundayMorningActivities: "",
      memoriesParticipation: attending === "Yes, I'll be there" ? memoriesParticipation : "",
      dietaryRequirements: attending === "Yes, I'll be there" ? (data.get("dietaryRequirements") || "").toString().trim() : "",
      additionalNotes: attending === "Yes, I'll be there" ? (data.get("additionalNotes") || "").toString().trim() : ""
    };

    return payload;
  }

  // ---- submit ----
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (isSubmitting) return;
    if (!validate()) return;

    var payload = buildPayload();
    isSubmitting = true;
    submitBtn.disabled = true;

    form.hidden = true;
    loadingView.hidden = false;

    // Same no-cors POST pattern as the full-weekend form: we can't read
    // the response in this mode, so a resolved fetch (no thrown network
    // error) is treated as success.
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    })
      .then(function () {
        onSubmitSuccess(payload);
      })
      .catch(function () {
        onSubmitError();
      });
  });

  function onSubmitSuccess(payload) {
    isSubmitting = false;
    loadingView.hidden = true;
    successView.hidden = false;

    if (payload.attending === "Unfortunately, I can't make it") {
      successRegrets.hidden = false;
    } else if (
      payload.memoriesParticipation === "Yes, I would love to participate" ||
      payload.memoriesParticipation === "Tell me more"
    ) {
      successMemories.hidden = false;
    }

    successView.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onSubmitError() {
    isSubmitting = false;
    submitBtn.disabled = false;
    loadingView.hidden = true;
    form.hidden = false;
    showFormError(
      "Something went wrong while sending your RSVP. Please check your connection and try again."
    );
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // initialise state on load
  handleAttendingChange();
})();
