/* ===================================================
   Yolandi's 45th — RSVP form logic
   Submits to a Google Apps Script Web App as JSON.
   =================================================== */

(function () {
  "use strict";

  // Replace this with your own Google Apps Script /exec URL if it ever changes.
  var GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzM1rBN9pLvHV7qhPfGqYxyWBpdJoBDufnm_Qp7JKyzih2HivgZRwwSRSkFOmk_t7Zy/exec";

  var form = document.getElementById("rsvpForm");
  var attendingBlock = document.getElementById("attendingBlock");
  var overnightBlock = document.getElementById("overnightBlock");
  var notAttendingMessage = document.getElementById("notAttendingMessage");
  var formError = document.getElementById("formError");
  var submitBtn = document.getElementById("submitBtn");

  var loadingView = document.getElementById("loadingView");
  var successView = document.getElementById("successView");
  var successOvernight = document.getElementById("successOvernight");
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
      // overnight-dependent required fields are handled separately below
      handleOvernightChange();
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

  // ---- overnight stay toggle ----
  function handleOvernightChange() {
    var value = getRadioValue("overnightStay");
    if (value === "Yes") {
      showBlock(overnightBlock);
      setRequired(overnightBlock, true);
    } else {
      hideBlock(overnightBlock);
      setRequired(overnightBlock, false);
    }
  }

  function getRadioValue(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  form.addEventListener("change", function (e) {
    if (e.target.name === "attending") handleAttendingChange();
    if (e.target.name === "overnightStay") handleOvernightChange();
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

    if (attending === "Yes, I'll be there") {
      if (!getRadioValue("overnightStay")) {
        showFormError("Please let us know if you'd like to stay over.");
        return false;
      }
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
  function buildPayload() {
    var data = new FormData(form);
    var attending = data.get("attending") || "";
    var overnightStay = data.get("overnightStay") || "";
    var memoriesParticipation = data.get("memoriesParticipation") || "";

    var payload = {
      fullName: (data.get("fullName") || "").toString().trim(),
      contactNumber: (data.get("contactNumber") || "").toString().trim(),
      emailAddress: (data.get("emailAddress") || "").toString().trim(),
      attending: attending,
      adults: attending === "Yes, I'll be there" ? data.get("adults") || "" : "",
      children: attending === "Yes, I'll be there" ? data.get("children") || "" : "",
      overnightStay: attending === "Yes, I'll be there" ? overnightStay : "",
      accommodationGuests: overnightStay === "Yes" ? data.get("accommodationGuests") || "" : "",
      numberOfNights: overnightStay === "Yes" ? data.get("numberOfNights") || "" : "",
      accommodationPreference: overnightStay === "Yes" ? data.get("accommodationPreference") || "" : "",
      sundayMorningActivities: overnightStay === "Yes" ? data.get("sundayMorningActivities") || "" : "",
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

    // Google Apps Script Web Apps don't reliably return readable CORS
    // responses to a static site, so we send the request in "no-cors"
    // mode. We can't read the response body/status in that mode, so a
    // resolved fetch (no thrown network error) is treated as success —
    // this is the standard, reliable pattern for static sites posting
    // to a Google Apps Script Web App.
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
    } else {
      if (payload.overnightStay === "Yes") successOvernight.hidden = false;
      if (
        payload.memoriesParticipation === "Yes, I would love to participate" ||
        payload.memoriesParticipation === "Tell me more"
      ) {
        successMemories.hidden = false;
      }
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

  // initialise state on load (in case of browser form autofill of radios)
  handleAttendingChange();
})();
