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
    // The "I am not a robot" check adds this field once it has passed.
    if (form.querySelector(".cf-turnstile") && !data.get("cf-turnstile-response")) {
      say("Please wait for the “not a robot” check to finish, then press Send again.", "bad");
      return;
    }
    button.disabled = true;
    say("Sending…");
    fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (reply) {
        return reply.json().then(function (body) {
          return { ok: reply.ok && body.success, message: body.message };
        });
      })
      .then(function (result) {
        if (result.ok) {
          form.reset();
          if (window.turnstile) window.turnstile.reset();
          say("Sent. Thank you — I will reply by email.", "good");
        } else {
          say("That did not send" + (result.message ? " (" + result.message + ")" : "") +
            ". You can email night.dev.art@gmail.com instead.", "bad");
        }
      })
      .catch(function () {
        say("That did not send. Check your connection, or email night.dev.art@gmail.com instead.", "bad");
      })
      .then(function () {
        button.disabled = false;
      });
  });
})();
