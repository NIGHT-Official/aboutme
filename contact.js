// Sends the contact form without leaving the page.
// The form posts to Web3Forms, which forwards the message by email.
// If this script fails to load, the form still works: it posts normally
// and Web3Forms shows its own "sent" page.
(function () {
  var form = document.getElementById("contact-form");
  if (!form || !window.fetch || !window.FormData) return;
  var status = document.getElementById("contact-status");
  var button = form.querySelector("button[type=submit]");

  function say(text, kind) {
    status.textContent = text;
    status.className = "form-status" + (kind ? " form-status-" + kind : "");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    // The "I am human" check fills in this field once it has been ticked.
    var check = form.querySelector("textarea[name=h-captcha-response]");
    if (check && !check.value) {
      say("Please tick the “I am human” box above, then press Send again.", "bad");
      return;
    }
    button.disabled = true;
    say("Sending…");
    fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (reply) {
        return reply.text().then(function (text) {
          var body;
          try {
            body = JSON.parse(text);
          } catch (notJson) {
            // The form service sometimes answers with a web page, not data (a block or an outage).
            throw new Error("the form service answered with status " + reply.status + ", not a result");
          }
          return { ok: reply.ok && body.success, message: body.message };
        });
      })
      .then(function (result) {
        if (result.ok) {
          form.reset();
          if (window.hcaptcha) window.hcaptcha.reset();
          say("Sent. Thank you — I will reply by email.", "good");
        } else {
          // An "I am human" pass can be used once. Get a fresh one for the next try.
          if (window.hcaptcha) window.hcaptcha.reset();
          say("That did not send" + (result.message ? " (the form service said: " + result.message + ")" : "") +
            ". You can email night.dev.art@gmail.com instead.", "bad");
        }
      })
      .catch(function (error) {
        if (window.hcaptcha) window.hcaptcha.reset();
        // Shown so the cause can be reported: either the network, or an answer that was not readable.
        say("That did not send (" + (error && error.message ? error.message : "no answer") +
          "). You can email night.dev.art@gmail.com instead.", "bad");
      })
      .then(function () {
        button.disabled = false;
      });
  });
})();
