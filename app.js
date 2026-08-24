/* =========================================
   GOOGLE APPS SCRIPT WEB APP URL
========================================= */

const URL =
  'https://script.google.com/macros/s/AKfycbxf-DeTDrNmtqrALOv3MskWyIQZJjJUgKqPCAy5I_L9o8gydxsMdMqbpW-0FH2bSFKH/exec';


/* =========================================
   VARIABLES
========================================= */

let lat = '';
let lng = '';
let accuracy = '';
let gpsTimestamp = '';

let reportData = null;

const g = id => document.getElementById(id);


/* =========================================
   MESSAGE
========================================= */

function showMessage(message, type = '') {

  const msg = g('msg');

  if (!msg) return;

  if (!message) {

    msg.className = '';
    msg.innerHTML = '';
    msg.style.display = 'none';

    return;
  }

  msg.className = type;
  msg.innerHTML = message;
  msg.style.display = 'block';
}


/* =========================================
   AI RESULT
========================================= */

function showAI(message, type = '') {

  const box = g('aiResult');

  if (!box) return;

  box.className = 'ai-box';

  if (type === 'success') {
    box.classList.add('ai-success');
  }

  if (type === 'warning') {
    box.classList.add('ai-warning');
  }

  if (type === 'error') {
    box.classList.add('ai-error');
  }

  box.innerHTML = `
    <div class="ai-title">🤖 AI पडताळणी</div>
    <div>${message}</div>
  `;
}


/* =========================================
   GPS STATUS
========================================= */

function setGPSStatus(message, type = '') {

  const gps = g('gps');

  if (!gps) return;

  gps.className = 'gps-box';

  if (type === 'success') {
    gps.classList.add('gps-success');
  }

  if (type === 'error') {
    gps.classList.add('gps-error');
  }

  if (type === 'loading') {
    gps.classList.add('gps-loading');
  }

  gps.innerHTML = message;
}


/* =========================================
   GPS ERROR
========================================= */

function gpsError(error) {

  let message = '';

  switch (error.code) {

    case error.PERMISSION_DENIED:

      message = `
        ❌ <b>GPS Permission बंद आहे.</b><br><br>
        Browser Settings मध्ये Location ला Allow करा.<br><br>
        Chrome → Site Settings → Location → Allow
      `;

      break;

    case error.POSITION_UNAVAILABLE:

      message = `
        ❌ <b>GPS Location उपलब्ध नाही.</b><br><br>
        मोबाईलची Location सेवा ON आहे का तपासा.
      `;

      break;

    case error.TIMEOUT:

      message = `
        ❌ <b>GPS मिळण्यासाठी जास्त वेळ लागला.</b><br><br>
        मोकळ्या जागेत जाऊन पुन्हा प्रयत्न करा.
      `;

      break;

    default:

      message = `
        ❌ GPS Location मिळाले नाही.<br><br>
        Location ON करून पुन्हा प्रयत्न करा.
      `;
  }

  setGPSStatus(message, 'error');
}


/* =========================================
   SAVE GPS
========================================= */

function saveGPS(position) {

  lat = position.coords.latitude;
  lng = position.coords.longitude;
  accuracy = position.coords.accuracy;

  gpsTimestamp = new Date().toISOString();

  let accuracyStatus = '';

  if (accuracy <= 20) {

    accuracyStatus =
      '🟢 <b>अतिशय अचूक GPS</b>';

  } else if (accuracy <= 50) {

    accuracyStatus =
      '🟢 <b>GPS Accuracy चांगली आहे</b>';

  } else if (accuracy <= 100) {

    accuracyStatus =
      '🟡 <b>GPS Accuracy मध्यम आहे</b>';

  } else {

    accuracyStatus =
      '🟠 <b>GPS Accuracy कमी आहे. शक्य असल्यास पुन्हा GPS मिळवा.</b>';
  }

  setGPSStatus(

    `
    <div class="gps-status">

      <span class="gps-icon">📍</span>

      <strong>
        GPS Location मिळाले
      </strong>

    </div>

    <div class="gps-details">

      📍 Latitude:
      ${Number(lat).toFixed(6)}

      <br>

      📍 Longitude:
      ${Number(lng).toFixed(6)}

      <br>

      🎯 Accuracy:
      ${Math.round(accuracy)} मीटर

      <br>

      🕒 वेळ:
      ${getDateTime()}

      <br><br>

      ${accuracyStatus}

    </div>
    `,

    'success'
  );
}


/* =========================================
   GET GPS
========================================= */

function getGPS() {

  setGPSStatus(

    `
    <div class="gps-status">

      <span class="gps-icon">⏳</span>

      <strong>
        GPS Location मिळवत आहे...
      </strong>

    </div>

    <div class="gps-details">

      कृपया थोडा वेळ थांबा.<br>
      📱 मोबाईलची Location ON ठेवा.

    </div>
    `,

    'loading'
  );

  if (!navigator.geolocation) {

    setGPSStatus(
      '❌ या Browser मध्ये GPS उपलब्ध नाही.',
      'error'
    );

    return;
  }

  navigator.geolocation.getCurrentPosition(

    saveGPS,

    gpsError,

    {
      enableHighAccuracy: true,
      timeout: 60000,
      maximumAge: 0
    }
  );
}


/* =========================================
   GPS BUTTON
========================================= */

g('gpsBtn')?.addEventListener(
  'click',
  getGPS
);


/* =========================================
   PAGE LOAD
========================================= */

window.addEventListener(
  'load',
  function () {

    setTimeout(
      getGPS,
      1000
    );

  }
);


/* =========================================
   DATE TIME
========================================= */

function getDateTime() {

  return new Date().toLocaleString(

    'en-GB',

    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }
  );
}


/* =========================================
   PHOTO PREVIEW
========================================= */

g('photo')?.addEventListener(

  'change',

  function () {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {

      showMessage(
        '❌ कृपया योग्य Image File निवडा.',
        'error'
      );

      this.value = '';

      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

      const preview = g('preview');

      preview.src = e.target.result;
      preview.style.display = 'block';
    };

    reader.readAsDataURL(file);
  }
);


/* =========================================
   SAFE FILE NAME
========================================= */

function safeName(text) {

  return String(text || '')

    .trim()

    .replace(/[\\/:*?"<>|]/g, '_')

    .replace(/\s+/g, '_');
}


/* =========================================
   CREATE GPS STAMPED IMAGE
========================================= */

function stamped(file) {

  return new Promise(function (resolve, reject) {

    const reader = new FileReader();

    reader.onload = function (e) {

      const img = new Image();

      img.onload = function () {

        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 1600;

        if (width > MAX_WIDTH) {

          height =
            Math.round(
              height * MAX_WIDTH / width
            );

          width = MAX_WIDTH;
        }

        const fontSize =
          Math.max(
            20,
            Math.round(width / 42)
          );

        const lineHeight =
          Math.round(fontSize * 1.5);

        const padding =
          Math.round(fontSize * 0.8);

        const infoHeight =
          lineHeight * 5 +
          padding * 2;

        const canvas =
          document.createElement('canvas');

        canvas.width = width;
        canvas.height = height + infoHeight;

        const ctx =
          canvas.getContext('2d');

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        ctx.fillStyle =
          'rgba(0,0,0,0.82)';

        ctx.fillRect(
          0,
          height,
          width,
          infoHeight
        );

        ctx.fillStyle = '#ffffff';

        ctx.font =
          'bold ' +
          fontSize +
          'px Arial, sans-serif';

        const lines = [

          'शेतकरी: ' +
          g('farmer').value.trim(),

          'गाव: ' +
          g('village').value +
          ' | सर्वे नं.: ' +
          g('survey').value.trim(),

          'GPS: ' +
          Number(lat).toFixed(6) +
          ', ' +
          Number(lng).toFixed(6),

          'Accuracy: ' +
          Math.round(accuracy) +
          ' meters',

          'दिनांक व वेळ: ' +
          getDateTime()
        ];

        let y =
          height +
          padding +
          fontSize;

        lines.forEach(function (line) {

          ctx.fillText(
            line,
            padding,
            y
          );

          y += lineHeight;
        });

        resolve(

          canvas.toDataURL(
            'image/jpeg',
            0.85
          )
        );
      };

      img.onerror = reject;

      img.src = e.target.result;
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}


/* =========================================
   VALIDATION
========================================= */

function validateMobile() {

  const mobile =
    g('mobile').value.trim();

  if (!mobile) return true;

  return /^[0-9]{10}$/.test(mobile);
}


function validateGPS() {

  if (
    !lat ||
    !lng
  ) {

    return {

      valid: false,
      warning: false

    };
  }

  return {

    valid: true,

    warning:
      Number(accuracy) > 100
  };
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

  return String(value || '')

    .replace(/&/g, '&amp;')

    .replace(/</g, '&lt;')

    .replace(/>/g, '&gt;')

    .replace(/"/g, '&quot;')

    .replace(/'/g, '&#039;');
}


/* =========================================
   CREATE REPORT DATA
========================================= */

function createReportData() {

  return {

    farmer:
      g('farmer').value.trim(),

    village:
      g('village').value,

    survey:
      g('survey').value.trim(),

    area:
      g('area').value.trim(),

    mobile:
      g('mobile').value.trim(),

    eCrop:
      g('eCrop').value,

    actualStatus:
      g('actualStatus').value,

    statementFarmer:
      g('statementFarmer')?.value.trim() || '',

    localStatement:
      g('localStatement')?.value.trim() || '',

    receiptChecked:
      g('receiptChecked').value,

    officer:
      g('officer').value.trim(),

    remark:
      g('remark').value.trim(),

    lat: lat,

    lng: lng,

    accuracy: accuracy,

    verificationTime:
      getDateTime()
  };
}


/* =========================================
   REPORT RESULT
========================================= */

function getReportResult(status) {

  if (
    status ===
    'ज्वारीचे पीक प्रत्यक्ष नाही'
  ) {

    return {

      className:
        'report-error',

      text:
        '❌ प्रत्यक्ष पाहणीमध्ये ज्वारीचे पीक आढळून आले नाही.'
    };
  }

  if (

    status ===
    'काढणी झालेले / अवशेष उपलब्ध'

    ||

    status ===
    'पुढील चौकशी आवश्यक'
  ) {

    return {

      className:
        'report-warning',

      text:
        '⚠️ सदर प्रकरणात पुढील चौकशी / पडताळणी आवश्यक आहे.'
    };
  }

  return {

    className:
      'report-success',

    text:
      '✅ प्रत्यक्ष पाहणीमध्ये ज्वारीचे पीक आढळून आले आहे.'
  };
}


/* =========================================
   CREATE OFFICIAL REPORT HTML
========================================= */

function generateReportHTML(data) {

  const result =
    getReportResult(
      data.actualStatus
    );

  const statementName =
    data.statementFarmer ||
    data.farmer;

  return `

    <div class="official-report">

      <div class="report-header">

        <h2>
          ज्वारी पीक प्रत्यक्ष पडताळणी अहवाल
        </h2>

        <p>
          ग्राम महसूल अधिकारी कार्यालय
        </p>

      </div>

      <hr>

      <h3>
        १. शेतकऱ्याची माहिती
      </h3>

      <p>
        <b>शेतकऱ्याचे पूर्ण नाव:</b>
        ${escapeHTML(data.farmer)}
      </p>

      <p>
        <b>गाव:</b>
        ${escapeHTML(data.village)}
      </p>

      <p>
        <b>गट / सर्वे नंबर:</b>
        ${escapeHTML(data.survey)}
      </p>

      <p>
        <b>क्षेत्र:</b>
        ${escapeHTML(data.area || '-')}
        हे.आर.
      </p>

      <p>
        <b>मोबाईल नंबर:</b>
        ${escapeHTML(data.mobile || '-')}
      </p>

      <hr>

      <h3>
        २. पीक पडताळणी माहिती
      </h3>

      <p>
        <b>ई-पीक पाहणीतील नोंद:</b>
        ${escapeHTML(data.eCrop)}
      </p>

      <p>
        <b>प्रत्यक्ष पाहणीतील स्थिती:</b>
        ${escapeHTML(data.actualStatus)}
      </p>

      <p>
        <b>खत / बियाणे पावती पाहिली:</b>
        ${escapeHTML(data.receiptChecked)}
      </p>

      <hr>

      <h3>
        ३. शेतकऱ्याचे स्वतंत्र बयान
      </h3>

      <div class="farmer-statement">

        <p>
          <b>बयान देणाऱ्या शेतकऱ्याचे नाव:</b>
          ${escapeHTML(statementName)}
        </p>

        <p>
          <b>प्रत्यक्ष बयान:</b>
        </p>

        <p style="white-space: pre-wrap;">
          ${escapeHTML(
            data.localStatement ||
            'कोणतेही बयान नोंदविण्यात आलेले नाही.'
          )}
        </p>

        <br><br>

        <div class="statement-signature">

          <div>

            <b>
              बयान देणाऱ्या शेतकऱ्याचे नाव:
            </b>

            <br>

            ${escapeHTML(statementName)}

          </div>

          <div>

            <br><br><br>

            ______________________

            <br>

            <b>
              शेतकऱ्याची स्वाक्षरी
            </b>

          </div>

        </div>

      </div>

      <hr>

      <h3>
        ४. GPS माहिती
      </h3>

      <p>
        <b>Latitude:</b>
        ${Number(data.lat).toFixed(6)}
      </p>

      <p>
        <b>Longitude:</b>
        ${Number(data.lng).toFixed(6)}
      </p>

      <p>
        <b>GPS Accuracy:</b>
        ${Math.round(data.accuracy)}
        मीटर
      </p>

      <p>
        <b>
          पडताळणी दिनांक व वेळ:
        </b>

        ${escapeHTML(data.verificationTime)}
      </p>

      <hr>

      <h3>
        ५. पडताळणी अधिकाऱ्याची नोंद
      </h3>

      <p>
        <b>
          पडताळणी अधिकाऱ्याचे नाव:
        </b>

        ${escapeHTML(data.officer || '-')}
      </p>

      <p>

        <b>शेरा:</b>

        <br>

        ${escapeHTML(data.remark || '-')}

      </p>

      <hr>

      <div class="report-result">

        <b>
          पडताळणीचा निकाल:
        </b>

        <br><br>

        ${result.text}

      </div>

      <div class="signature-area">

        <div>

          उपस्थित शेतकरी / व्यक्ती

          <br><br><br>

          ______________________

          <br>

          सही

        </div>

        <div>

          पडताळणी अधिकारी

          <br><br><br>

          ______________________

          <br>

          सही

        </div>

      </div>

    </div>

  `;
}


/* =========================================
   SHOW REPORT
========================================= */

function showReport() {

  const reportBox =
    g('reportBox');

  const reportContent =
    g('reportContent');

  const reportEditor =
    g('reportEditor');

  if (!reportData) {

    reportData =
      createReportData();
  }

  const result =
    getReportResult(
      reportData.actualStatus
    );

  reportBox.className =
    'report-box ' +
    result.className;

  reportContent.innerHTML =
    generateReportHTML(
      reportData
    );

  reportContent.style.display =
    'block';

  reportEditor.style.display =
    'none';

  reportBox.style.display =
    'block';

  g('reportBtn').style.display =
    'none';

  g('editReportBtn').style.display =
    'block';

  g('saveReportBtn').style.display =
    'none';

  g('printBtn').style.display =
    'block';

  g('newEntryBtn').style.display =
    'block';

  setTimeout(function () {

    reportBox.scrollIntoView({

      behavior: 'smooth',

      block: 'start'

    });

  }, 300);
}


/* =========================================
   REPORT BUTTON
========================================= */

g('reportBtn')?.addEventListener(

  'click',

  function () {

    reportData =
      createReportData();

    showReport();
  }
);


/* =========================================
   EDIT REPORT
========================================= */

g('editReportBtn')?.addEventListener(

  'click',

  function () {

    const reportContent =
      g('reportContent');

    const reportEditor =
      g('reportEditor');

    reportEditor.value =
      reportContent.innerText;

    reportContent.style.display =
      'none';

    reportEditor.style.display =
      'block';

    g('editReportBtn').style.display =
      'none';

    g('saveReportBtn').style.display =
      'block';

    g('printBtn').style.display =
      'none';

    reportEditor.focus();
  }
);


/* =========================================
   SAVE EDITED REPORT
========================================= */

g('saveReportBtn')?.addEventListener(

  'click',

  function () {

    const reportContent =
      g('reportContent');

    const reportEditor =
      g('reportEditor');

    const editedText =
      reportEditor.value.trim();

    if (!editedText) {

      showMessage(
        '⚠️ अहवाल रिकामा ठेवू शकत नाही.',
        'error'
      );

      return;
    }

    reportContent.innerHTML =
      `<div class="edited-report">
        ${escapeHTML(editedText)
          .replace(/\n/g, '<br>')}
      </div>`;

    reportContent.style.display =
      'block';

    reportEditor.style.display =
      'none';

    g('saveReportBtn').style.display =
      'none';

    g('editReportBtn').style.display =
      'block';

    g('printBtn').style.display =
      'block';

    showMessage(
      '✅ अहवालातील बदल यशस्वीरित्या जतन करण्यात आले.',
      'success'
    );
  }
);


/* =========================================
   SUBMIT FORM
========================================= */

g('submitBtn')?.addEventListener(

  'click',

  async function () {

    const need = [];

    if (!g('farmer').value.trim()) {
      need.push('शेतकऱ्याचे नाव');
    }

    if (!g('village').value) {
      need.push('गाव');
    }

    if (!g('survey').value.trim()) {
      need.push('गट / सर्वे नंबर');
    }

    if (!g('eCrop').value) {
      need.push('ई-पीक नोंद');
    }

    if (!g('actualStatus').value) {
      need.push('प्रत्यक्ष पाहणीतील स्थिती');
    }

    if (!g('photo').files[0]) {
      need.push('प्रत्यक्ष फोटो');
    }

    const gpsCheck =
      validateGPS();

    if (!gpsCheck.valid) {

      need.push(
        'GPS Location'
      );
    }

    if (!validateMobile()) {

      need.push(
        'योग्य 10 अंकी मोबाईल नंबर'
      );
    }

    if (need.length > 0) {

      showMessage(

        `
        ⚠️ खालील माहिती आवश्यक आहे:<br><br>

        ${need
          .map(
            x => '❌ ' + x
          )
          .join('<br>')}
        `,

        'error'
      );

      return;
    }

    if (gpsCheck.warning) {

      const confirmSubmit =
        confirm(

          '⚠️ GPS Accuracy ' +
          Math.round(accuracy) +
          ' मीटर आहे.\n\n' +
          'तरीही Submit करायचे आहे का?'
        );

      if (!confirmSubmit) return;
    }

    const submitBtn =
      g('submitBtn');

    submitBtn.disabled =
      true;

    submitBtn.innerHTML =
      '⏳ माहिती साठवत आहे...';

    showMessage('', '');

    try {

      const file =
        g('photo').files[0];

      const imageData =
        await stamped(file);

      const fileName =

        'JWARI_' +

        safeName(
          g('farmer').value
        ) +

        '_' +

        safeName(
          g('village').value
        ) +

        '_' +

        safeName(
          g('survey').value
        ) +

        '_' +

        Date.now() +

        '.jpg';

      const data = {

        farmer:
          g('farmer').value.trim(),

        village:
          g('village').value,

        survey:
          g('survey').value.trim(),

        area:
          g('area').value.trim(),

        mobile:
          g('mobile').value.trim(),

        eCrop:
          g('eCrop').value,

        actualStatus:
          g('actualStatus').value,

        statementFarmer:
          g('statementFarmer')?.value.trim() || '',

        localStatement:
          g('localStatement')?.value.trim() || '',

        receiptChecked:
          g('receiptChecked').value,

        officer:
          g('officer').value.trim(),

        remark:
          g('remark').value.trim(),

        lat: lat,

        lng: lng,

        accuracy: accuracy,

        gpsTimestamp:
          gpsTimestamp,

        capturedAt:
          new Date().toISOString(),

        fileName:
          fileName,

        mimeType:
          'image/jpeg',

        imageBase64:
          imageData.split(',')[1]
      };

      await fetch(

        URL,

        {

          method: 'POST',

          mode: 'no-cors',

          headers: {

            'Content-Type':
              'text/plain;charset=utf-8'
          },

          body:
            JSON.stringify(data)
        }
      );

      reportData =
        createReportData();

      showMessage(

        '✅ <b>माहिती यशस्वीरित्या साठविण्यात आली!</b>',

        'success'
      );

      showAI(

        'प्रत्यक्ष पीक पडताळणीची माहिती यशस्वीरित्या नोंदविण्यात आली आहे.',

        'success'
      );

      showReport();

    }

    catch (error) {

      console.error(error);

      showMessage(

        '❌ माहिती साठविताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.',

        'error'
      );
    }

    finally {

      submitBtn.disabled =
        false;

      submitBtn.innerHTML =
        '✅ माहिती Submit करा';
    }
  }
);


/* =========================================
   PRINT REPORT
========================================= */

g('printBtn')?.addEventListener(

  'click',

  function () {

    window.print();

  }
);


/* =========================================
   NEW ENTRY
========================================= */

g('newEntryBtn')?.addEventListener(

  'click',

  function () {

    const confirmNew =
      confirm(
        'नवीन नोंद सुरू करायची आहे का?'
      );

    if (!confirmNew) return;

    resetForm();

    window.scrollTo({

      top: 0,

      behavior: 'smooth'
    });
  }
);


/* =========================================
   RESET FORM
========================================= */

function resetForm() {

  g('farmer').value = '';
  g('village').value = '';
  g('survey').value = '';
  g('area').value = '';
  g('mobile').value = '';

  g('eCrop').value = '';
  g('actualStatus').value = '';

  if (g('statementFarmer')) {

    g('statementFarmer').value = '';

  }

  if (g('localStatement')) {

    g('localStatement').value = '';

  }

  g('receiptChecked').value =
    'होय';

  g('officer').value = '';
  g('remark').value = '';

  g('photo').value = '';

  const preview =
    g('preview');

  preview.src = '';

  preview.style.display =
    'none';

  reportData = null;

  showMessage(
    '',
    ''
  );

  showAI(
    'फोटो Submit केल्यानंतर AI पडताळणीचा निकाल येथे दिसेल.'
  );

  const reportBox =
    g('reportBox');

  reportBox.style.display =
    'none';

  g('reportContent').innerHTML =
    '';

  g('reportEditor').value =
    '';

  g('reportEditor').style.display =
    'none';

  g('reportBtn').style.display =
    'block';

  g('editReportBtn').style.display =
    'none';

  g('saveReportBtn').style.display =
    'none';

  g('printBtn').style.display =
    'none';

  g('newEntryBtn').style.display =
    'none';

  lat = '';
  lng = '';
  accuracy = '';
  gpsTimestamp = '';

  setTimeout(
    getGPS,
    1000
  );
}
