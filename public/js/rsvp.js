/* =========================================================
   RSVP → WhatsApp
   Builds a ready-to-send message and opens WhatsApp chat
   with the family's number. Nothing is stored anywhere.
   ========================================================= */
(function () {
  'use strict';

  var WA_NUMBER = '916362827305';           // +91 63628 27305
  var MAX_GUESTS = 20;

  var form = document.getElementById('rsvpForm');
  if (!form) return;

  var success = document.getElementById('rsvpSuccess');
  var successMsg = document.getElementById('rsvpSuccessMsg');
  var waLink = document.getElementById('rsvpWaLink');
  var again = document.getElementById('rsvpAgain');
  var nameEl = document.getElementById('rsvpName');
  var errName = document.getElementById('errName');
  var wishEl = document.getElementById('rsvpWish');
  var eventEl = document.getElementById('rsvpEvent');
  var coming = document.getElementById('rsvpComing');
  var guestsOut = document.getElementById('rsvpGuests');
  var minus = document.getElementById('guestMinus');
  var plus = document.getElementById('guestPlus');
  var guests = 1;

  function renderGuests() {
    guestsOut.textContent = String(guests);
    minus.disabled = guests <= 1;
    plus.disabled = guests >= MAX_GUESTS;
  }
  minus.addEventListener('click', function () { if (guests > 1) { guests--; renderGuests(); } });
  plus.addEventListener('click', function () { if (guests < MAX_GUESTS) { guests++; renderGuests(); } });
  renderGuests();

  function attending() {
    var r = form.querySelector('input[name="attend"]:checked');
    return !r || r.value === 'yes';
  }
  function syncAttend() {
    var yes = attending();
    coming.classList.toggle('is-off', !yes);
    coming.setAttribute('aria-hidden', yes ? 'false' : 'true');
    Array.prototype.forEach.call(coming.querySelectorAll('button,select'), function (el) { el.disabled = !yes; });
    if (yes) renderGuests();
  }
  Array.prototype.forEach.call(form.querySelectorAll('input[name="attend"]'), function (r) {
    r.addEventListener('change', syncAttend);
  });
  syncAttend();

  nameEl.addEventListener('input', function () {
    if (nameEl.value.trim()) { nameEl.classList.remove('is-invalid'); errName.hidden = true; }
  });

  function buildMessage() {
    var name = nameEl.value.trim().replace(/\s+/g, ' ');
    var wish = (wishEl.value || '').trim();
    var lines = ['*RSVP · Bibin & Akhila Wedding*', '_Thursday, 4 February 2027_', ''];
    lines.push('*Name:* ' + name);
    if (attending()) {
      lines.push('*Attending:* Yes, joyfully accepts');
      lines.push('*Guests:* ' + guests + (guests === 1 ? ' person' : ' persons'));
      lines.push('*Joining for:* ' + eventEl.value);
    } else {
      lines.push('*Attending:* Regretfully declines');
    }
    if (wish) lines.push('', '*Wishes:*', wish);
    return lines.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!nameEl.value.trim()) {
      nameEl.classList.add('is-invalid');
      errName.hidden = false;
      nameEl.focus();
      return;
    }
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(buildMessage());
    waLink.href = url;
    successMsg.textContent = attending()
      ? 'Your reply is ready in WhatsApp. Just tap send. We can’t wait to celebrate with you!'
      : 'Your reply is ready in WhatsApp. Just tap send. You will be missed!';
    var win = null;
    /* no 'noopener' feature here: with it, window.open always returns null */
    try { win = window.open(url, '_blank'); if (win) win.opener = null; } catch (err) { win = null; }
    form.hidden = true;
    success.hidden = false;
    /* in-app browsers often block pop-ups: fall back to same-tab navigation */
    if (!win) setTimeout(function () { window.location.href = url; }, 350);
  });

  again.addEventListener('click', function () {
    success.hidden = true;
    form.hidden = false;
    form.reset();
    guests = 1;
    syncAttend();
    nameEl.focus();
  });
})();
