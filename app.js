// =========================================
// CONFIGURATION
// =========================================

// Google Apps Script Web App URL
const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxf-DeTDrNmtqrALOv3MskWyIQZJjJUgKqPCAy5I_L9o8gydxsMdMqbpW-0FH2bSFKH/exec';

let lat = '';
let lng = '';
let accuracy = '';
let gpsTimestamp = '';
let reportData = null;

const g = id => document.getElementById(id);


// =========================================
// DATE & TIME
// =========================================

function getDateTime() {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}


// =========================================
// HTML ESCAPE
// =========================================

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// =========================================
// MESSAGE
// =========================================

function msg(text, type = '') {

  const box = g('msg');

  box.className = type;
  box.innerHTML = text;
  box.style.display = text ? 'block' : 'none';

}


// =========================================
// GPS
// =========================================

function gps() {

  g('gps').innerHTML =
    '⏳ GPS Location मिळवत आहे...';

  if (!navigator.geolocation) {

    g('gps').innerHTML =
      '❌ या Browser मध्ये GPS उपलब्ध नाही.';

    return;

  }

  navigator.geolocation.getCurrentPosition(

    position => {

      lat = position.coords.latitude;
      lng = position.coords.longitude;
      accuracy = position.coords.accuracy;

      gpsTimestamp = new Date().toISOString();

      g('gps').innerHTML = `
        📍 <b>GPS Location मिळाले</b><br>
        Latitude: ${lat.toFixed(6)}<br>
        Longitude: ${lng.toFixed(6)}<br>
        🎯 Accuracy: ${Math.round(accuracy)} मीटर<br>
        🕒 वेळ: ${getDateTime()}
      `;

    },

    error => {

      console.error(error);

      g('gps').innerHTML =
        '❌ GPS Location मिळाले नाही.<br>' +
        'मोबाईलची Location ON करून पुन्हा प्रयत्न करा.';

    },

    {
      enableHighAccuracy: true,
      timeout: 60000,
      maximumAge: 0
    }

  );

}


g('gpsBtn').onclick = gps;

window.addEventListener('load', () => {

  setTimeout(gps, 1000);

});


// =========================================
// FILE PREVIEW
// =========================================

function previewFile(inputId, previewId) {

  const input = g(inputId);

  if (!input) return;

  const file = input.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = event => {

    const preview = g(previewId);

    if (!preview) return;

    preview.src = event.target.result;
    preview.style.display = 'block';

  };

  reader.readAsDataURL(file);

}


// =========================================
// MAIN CROP PHOTO
// =========================================

g('photo').onchange = function () {

  previewFile('photo', 'preview');

};


// =========================================
// RECEIPT
// =========================================

g('receiptChecked').onchange = function () {

  g('receiptPhotoGroup').style.display =
    this.value === 'होय'
      ? 'block'
      : 'none';

};


g('receiptPhoto').onchange = function () {

  previewFile(
    'receiptPhoto',
    'receiptPreview'
  );

};


// =========================================
// DEFAULT STATEMENT
// =========================================

function updateDefaultStatement() {

  const type =
    g('statementType').value;

  const statementPerson =
    g('statementFarmer').value.trim()
    || '[बयान देणाऱ्या व्यक्तीचे नाव]';

  const farmer =
    g('farmer').value.trim()
    || '[शेतकऱ्याचे नाव]';

  const village =
    g('village').value
    || '[गाव]';

  const survey =
    g('survey').value.trim()
    || '[सर्वे / गट क्रमांक]';


  if (type === 'cropYes') {

    g('localStatement').value =

      `मी, श्री./श्रीमती ${statementPerson}, रा. ${village}, ` +
      `याद्वारे असे बयान देतो / देते की, ` +
      `श्री./श्रीमती ${farmer} यांनी त्यांच्या मौजा ${village} ` +
      `येथील शेत सर्वे / गट क्रमांक ${survey} मध्ये ` +
      `ज्वारी पिकाची लागवड केलेली आहे. ` +
      `सदर शेतामध्ये ज्वारीचे पीक प्रत्यक्ष पाहिले आहे. ` +
      `सदर शेतामध्ये असलेले पीक ज्वारीचेच असल्याबाबत ` +
      `माझे बयान आहे.`;

  }


  if (type === 'cropNo') {

    g('localStatement').value =

      `मी, श्री./श्रीमती ${statementPerson}, रा. ${village}, ` +
      `याद्वारे असे बयान देतो / देते की, ` +
      `श्री./श्रीमती ${farmer} यांनी त्यांच्या मौजा ${village} ` +
      `येथील शेत सर्वे / गट क्रमांक ${survey} मध्ये ` +
      `ज्वारी पिकाची लागवड केलेली नव्हती. ` +
      `सदर शेतामध्ये ज्वारीचे पीक प्रत्यक्ष दिसून आले नाही. ` +
      `सदर शेतामध्ये ज्वारीचे पीक नसल्याबाबत ` +
      `माझे बयान आहे.`;

  }

}


[
  'statementType',
  'statementFarmer',
  'farmer',
  'village',
  'survey'
].forEach(id => {

  const element = g(id);

  if (!element) return;

  element.addEventListener('change', () => {

    if (g('statementType').value) {

      updateDefaultStatement();

    }

  });

  element.addEventListener('input', () => {

    if (g('statementType').value) {

      updateDefaultStatement();

    }

  });

});


// =========================================
// FILE TO BASE64
// =========================================

function fileToBase64(file) {

  return new Promise((resolve, reject) => {

    if (!file) {

      resolve('');
      return;

    }

    const reader = new FileReader();

    reader.onload = event => {

      resolve(
        event.target.result.split(',')[1]
      );

    };

    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

}


// =========================================
// CREATE REPORT DATA
// =========================================

function createReportData() {

  return {

    reportId: 'JWARI-' + Date.now(),

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

    statementType:
      g('statementType').value,

    statementFarmer:
      g('statementFarmer').value.trim(),

    localStatement:
      g('localStatement').value.trim(),

    statementDate:
      g('statementDate').value,

    receiptChecked:
      g('receiptChecked').value,

    officer:
      g('officer').value.trim(),

    remark:
      g('remark').value.trim(),

    lat: lat,
    lng: lng,
    accuracy: accuracy,
    gpsTimestamp: gpsTimestamp,

    verificationTime:
      getDateTime(),

    photoName: '',
    photoMimeType: '',
    photoBase64: '',

    receiptFileName: '',
    receiptMimeType: '',
    receiptBase64: '',

    signedFileName: '',
    signedMimeType: '',
    signedBase64: ''

  };

}


// =========================================
// REPORT RESULT
// =========================================

function getReportResult(status) {

  if (
    status === 'ज्वारीचे पीक प्रत्यक्ष नाही'
  ) {

    return {

      className: 'report-error',

      conclusion:
        'प्रत्यक्ष स्थळ पाहणीदरम्यान सदर शेतजमिनीमध्ये ज्वारीचे पीक आढळून आले नाही.'

    };

  }


  if (
    status === 'काढणी झालेले / अवशेष उपलब्ध'
  ) {

    return {

      className: 'report-warning',

      conclusion:
        'प्रत्यक्ष स्थळ पाहणीदरम्यान ज्वारीचे पीक काढणी झालेले असून पिकाचे अवशेष उपलब्ध असल्याचे निदर्शनास आले.'

    };

  }


  if (
    status === 'पुढील चौकशी आवश्यक'
  ) {

    return {

      className: 'report-warning',

      conclusion:
        'प्रत्यक्ष स्थळ पाहणीदरम्यान उपलब्ध परिस्थितीनुसार सदर प्रकरणात पुढील चौकशी व पडताळणी करणे आवश्यक आहे.'

    };

  }


  return {

    className: 'report-success',

    conclusion:
      'प्रत्यक्ष स्थळ पाहणीदरम्यान सदर शेतजमिनीमध्ये ज्वारीचे पीक असल्याचे निदर्शनास आले.'

  };

}


// =========================================
// GPS FORMAT
// =========================================

function coordinate(value) {

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toFixed(6)
    : '-';

}


function accuracyText(value) {

  const number = Number(value);

  return Number.isFinite(number)
    ? Math.round(number)
    : '-';

}


// =========================================
// GENERATE INDIVIDUAL REPORT
// =========================================

function generateReportHTML(data) {

  const result =
    getReportResult(data.actualStatus);

  const statementPerson =
    data.statementFarmer ||
    '________________________';

  const statementDate =
    data.statementDate ||
    '________________';

  let cropPhotoHTML = '';

  if (data.photoBase64) {

    cropPhotoHTML = `
      <div style="margin-top:25px;page-break-inside:avoid;">

        <h3 style="text-align:center;">
          प्रत्यक्ष पीक पाहणीचा फोटो
        </h3>

        <div style="text-align:center;">

          <img
            src="data:${escapeHTML(data.photoMimeType || 'image/jpeg')};base64,${data.photoBase64}"
            style="
              max-width:100%;
              max-height:500px;
              border:1px solid #000;
              padding:5px;
            "
          >

        </div>

      </div>
    `;

  }


  let receiptHTML = '';

  if (
    data.receiptChecked === 'होय' &&
    data.receiptBase64
  ) {

    receiptHTML = `
      <div style="margin-top:25px;page-break-inside:avoid;">

        <h3 style="text-align:center;">
          खत / बियाणे पावती
        </h3>

        <div style="text-align:center;">

          <img
            src="data:${escapeHTML(data.receiptMimeType || 'image/jpeg')};base64,${data.receiptBase64}"
            style="
              max-width:100%;
              max-height:500px;
              border:1px solid #000;
              padding:5px;
            "
          >

        </div>

      </div>
    `;

  }


  return `

  <div class="official-report">

    <div style="text-align:center;">

      <p>प्रति,</p>

      <p>
        मा. तहसीलदार साहेब,<br>
        तहसील कार्यालय, मोर्शी.
      </p>

      <h2>
        ज्वारी पीक प्रत्यक्ष पडताळणी अहवाल
      </h2>

    </div>


    <p>
      <b>अहवाल क्रमांक :-</b>
      ${escapeHTML(data.reportId)}
    </p>


    <p>

      <b>विषय :-</b>

      मौजा ${escapeHTML(data.village)}
      येथील शेत सर्वे / गट क्रमांक
      ${escapeHTML(data.survey)},
      क्षेत्र
      ${escapeHTML(data.area || '-')}
      हे.आर. मधील ज्वारी पिकाच्या प्रत्यक्ष पडताळणीबाबत अहवाल.

    </p>


    <p><b>महोदय,</b></p>


    <p style="text-align:justify;">

      वरील विषयास अनुसरून कळविण्यात येते की,
      मौजा ${escapeHTML(data.village)}
      येथील शेत सर्वे / गट क्रमांक
      ${escapeHTML(data.survey)},
      क्षेत्र
      ${escapeHTML(data.area || '-')}
      हे.आर. या शेतजमिनीची प्रत्यक्ष स्थळ पाहणी करण्यात आली.

    </p>


    <p style="text-align:justify;">

      सदर शेतजमिनीबाबत ई-पीक पाहणीमध्ये
      "<b>${escapeHTML(data.eCrop)}</b>"
      अशी नोंद आढळून आली आहे.

      त्याअनुषंगाने प्रत्यक्ष स्थळ पाहणी करण्यात आली असता
      "<b>${escapeHTML(data.actualStatus)}</b>"
      अशी परिस्थिती निदर्शनास आली.

    </p>


    <p>

      पाहणीदरम्यान संबंधित स्थळाची GPS आधारित नोंद घेण्यात आली असून
      त्याचा तपशील खालीलप्रमाणे आहे :

    </p>


    <table class="report-table">

      <tr>
        <td><b>Latitude</b></td>
        <td>${coordinate(data.lat)}</td>
      </tr>

      <tr>
        <td><b>Longitude</b></td>
        <td>${coordinate(data.lng)}</td>
      </tr>

      <tr>
        <td><b>GPS Accuracy</b></td>
        <td>${accuracyText(data.accuracy)} मीटर</td>
      </tr>

      <tr>
        <td><b>पडताळणी दिनांक व वेळ</b></td>
        <td>${escapeHTML(data.verificationTime)}</td>
      </tr>

    </table>


    ${cropPhotoHTML}


    <hr>


    <h3 style="text-align:center;">
      बयान / निवेदन
    </h3>


    <p>

      मी, श्री./श्रीमती
      <b>${escapeHTML(statementPerson)}</b>,
      रा. ${escapeHTML(data.village)},
      याद्वारे असे बयान देतो / देते की :

    </p>


    <div
      class="farmer-statement"
      style="
        padding:15px;
        white-space:pre-wrap;
        line-height:1.8;
        text-align:justify;
      "
    >

${escapeHTML(
  data.localStatement ||
  'बयान उपलब्ध नाही.'
)}

    </div>


    <p>

      वरील बयान माझ्या सांगण्याप्रमाणे लिहून घेण्यात आले असून
      ते वाचून / समजावून सांगितल्यानंतर मला मान्य आहे.

    </p>


    <p>

      <b>बयानाचा दिनांक :</b>
      ${escapeHTML(statementDate)}

    </p>


    <div class="signature-area">

      <p>

        <b>बयान देणाऱ्या व्यक्तीचे नाव :</b>
        ${escapeHTML(statementPerson)}

      </p>


      <br><br>


      <p>

        स्वाक्षरी / अंगठा :

        ________________________________

      </p>

    </div>


    ${receiptHTML}


    <hr>


    <h3 style="text-align:center;">
      पडताळणी निष्कर्ष
    </h3>


    <div class="report-result">

      ${escapeHTML(result.conclusion)}

    </div>


    ${
      data.remark
        ? `
          <p>
            <b>शेरा :-</b>
            ${escapeHTML(data.remark)}
          </p>
        `
        : ''
    }


    <p style="text-align:justify;">

      सबब, मौजा
      ${escapeHTML(data.village)}
      येथील शेत सर्वे / गट क्रमांक
      ${escapeHTML(data.survey)},
      क्षेत्र
      ${escapeHTML(data.area || '-')}
      हे.आर. मधील ज्वारी पिकाच्या प्रत्यक्ष पडताळणीचा अहवाल
      मा. तहसीलदार साहेब यांच्या अवलोकनार्थ व पुढील आवश्यक
      कार्यवाहीस्तव सादर आहे.

    </p>


    <div
      style="
        display:flex;
        justify-content:space-between;
        gap:30px;
        margin-top:50px;
      "
    >

      <div>

        <p>स्थळ : मोर्शी</p>

        <p>
          दिनांक :
          ${escapeHTML(data.verificationTime)}
        </p>

      </div>


      <div style="text-align:center;">

        <br><br>

        <p>

          (
          ${escapeHTML(
            data.officer ||
            '________________________'
          )}
          )

        </p>

        <p>

          पडताळणी अधिकारी<br>
          ग्राम महसूल अधिकारी

        </p>

      </div>

    </div>

  </div>

  `;

}


// =========================================
// SHOW REPORT
// =========================================

function showReport() {

  if (!reportData) {

    reportData =
      createReportData();

  }


  const result =
    getReportResult(
      reportData.actualStatus
    );


  g('reportBox').className =
    'report-box ' +
    result.className;


  g('reportContent').innerHTML =
    generateReportHTML(reportData);


  g('reportContent').style.display =
    'block';


  g('reportEditor').style.display =
    'none';


  g('reportBox').style.display =
    'block';


  g('editReportBtn').style.display =
    'block';


  g('printBtn').style.display =
    'block';


  g('newEntryBtn').style.display =
    'block';


  setTimeout(() => {

    g('reportBox').scrollIntoView({

      behavior: 'smooth',
      block: 'start'

    });

  }, 200);

}


// =========================================
// REPORT BUTTON
// =========================================

g('reportBtn').onclick = () => {

  reportData =
    createReportData();

  showReport();

};


// =========================================
// EDIT REPORT
// =========================================

g('editReportBtn').onclick = () => {

  g('reportEditor').value =
    g('reportContent').innerText;


  g('reportContent').style.display =
    'none';


  g('reportEditor').style.display =
    'block';


  g('editReportBtn').style.display =
    'none';


  g('saveReportBtn').style.display =
    'block';


  g('printBtn').style.display =
    'none';

};


// =========================================
// SAVE EDITED REPORT
// =========================================

g('saveReportBtn').onclick = () => {

  const text =
    g('reportEditor').value.trim();


  if (!text) {

    msg(
      '⚠️ अहवाल रिकामा ठेवू शकत नाही.',
      'error'
    );

    return;

  }


  g('reportContent').innerHTML =

    '<div class="official-report">' +

    escapeHTML(text)
      .replace(/\n/g, '<br>') +

    '</div>';


  g('reportContent').style.display =
    'block';


  g('reportEditor').style.display =
    'none';


  g('saveReportBtn').style.display =
    'none';


  g('editReportBtn').style.display =
    'block';


  g('printBtn').style.display =
    'block';

};


// =========================================
// PRINT REPORT
// =========================================

g('printBtn').onclick = () => {

  document.body.classList.add(
    'print-individual'
  );

  window.print();

  setTimeout(() => {

    document.body.classList.remove(
      'print-individual'
    );

  }, 1000);

};


// =========================================
// LOCAL STORAGE
// =========================================

function localRecords() {

  try {

    return JSON.parse(
      localStorage.getItem(
        'jwariRecords'
      ) || '[]'
    );

  }
  catch (error) {

    return [];

  }

}


function saveLocalRecord(data) {

  const records =
    localRecords();


  const index =
    records.findIndex(
      x =>
        x.reportId === data.reportId
    );


  if (index >= 0) {

    records[index] = data;

  }
  else {

    records.unshift(data);

  }


  localStorage.setItem(

    'jwariRecords',

    JSON.stringify(
      records.slice(0, 1000)
    )

  );

}


// =========================================
// SUBMIT RECORD
// =========================================

g('submitBtn').onclick =
async function () {

  const data =
    createReportData();


  const need = [];


  if (!data.farmer)
    need.push('शेतकऱ्याचे नाव');

  if (!data.village)
    need.push('गाव');

  if (!data.survey)
    need.push('गट / सर्वे नंबर');

  if (!data.eCrop)
    need.push('ई-पीक नोंद');

  if (!data.actualStatus)
    need.push('प्रत्यक्ष पाहणीतील स्थिती');

  if (!g('photo').files[0])
    need.push('प्रत्यक्ष ज्वारी पिकाचा फोटो');

  if (!lat || !lng)
    need.push('GPS Location');


  if (
    data.mobile &&
    !/^[0-9]{10}$/.test(data.mobile)
  ) {

    need.push(
      'योग्य 10 अंकी मोबाईल नंबर'
    );

  }


  if (need.length) {

    msg(

      '⚠️ खालील माहिती आवश्यक आहे:<br><br>' +

      need.map(
        item => '❌ ' + item
      ).join('<br>'),

      'error'

    );

    return;

  }


  const button =
    g('submitBtn');


  button.disabled = true;

  button.innerHTML =
    '⏳ माहिती साठवत आहे...';


  try {

    const photo =
      g('photo').files[0];


    const receipt =
      g('receiptPhoto').files[0];


    data.photoName =
      photo.name;


    data.photoMimeType =
      photo.type;


    data.photoBase64 =
      await fileToBase64(photo);


    if (receipt) {

      data.receiptFileName =
        receipt.name;

      data.receiptMimeType =
        receipt.type;

      data.receiptBase64 =
        await fileToBase64(receipt);

    }


    // Local browser backup
    saveLocalRecord(data);


    const payload = {

      action: 'save',

      ...data,

      capturedAt:
        new Date().toISOString()

    };


    await fetch(

      SCRIPT_URL,

      {

        method: 'POST',

        mode: 'no-cors',

        headers: {

          'Content-Type':
            'text/plain;charset=utf-8'

        },

        body:
          JSON.stringify(payload)

      }

    );


    reportData = data;


    msg(

      '✅ <b>माहिती यशस्वीरित्या साठविण्यात आली!</b><br>' +
      'Report ID: ' +
      escapeHTML(data.reportId),

      'success'

    );


    showReport();


  }
  catch (error) {

    console.error(error);

    msg(

      '❌ माहिती साठविताना त्रुटी आली: ' +
      escapeHTML(error.message),

      'error'

    );

  }
  finally {

    button.disabled = false;

    button.innerHTML =
      '✅ माहिती Submit करा';

  }

};


// =========================================
// SIGNED REPORT UPLOAD
// =========================================

async function uploadSignedReport() {

  const file =
    g('signedReport').files[0];


  if (!file) {

    msg(
      '⚠️ सही केलेला Report / PDF / फोटो निवडा.',
      'error'
    );

    return;

  }


  if (!reportData) {

    msg(
      '⚠️ प्रथम संबंधित शेतकऱ्याची नोंद Submit करा.',
      'error'
    );

    return;

  }


  try {

    const base64 =
      await fileToBase64(file);


    reportData.signedFileName =
      file.name;


    reportData.signedMimeType =
      file.type;


    reportData.signedBase64 =
      base64;


    saveLocalRecord(reportData);


    await fetch(

      SCRIPT_URL,

      {

        method: 'POST',

        mode: 'no-cors',

        headers: {

          'Content-Type':
            'text/plain;charset=utf-8'

        },

        body: JSON.stringify({

          action: 'uploadSigned',

          reportId:
            reportData.reportId,

          farmer:
            reportData.farmer,

          village:
            reportData.village,

          survey:
            reportData.survey,

          signedFileName:
            file.name,

          signedMimeType:
            file.type,

          signedBase64:
            base64

        })

      }

    );


    msg(

      '✅ सही केलेला अहवाल Digital Record म्हणून Upload करण्यात आला.',

      'success'

    );

  }
  catch (error) {

    console.error(error);

    msg(

      '❌ Signed Report Upload करताना त्रुटी आली: ' +
      escapeHTML(error.message),

      'error'

    );

  }

}


// HTML मध्ये खाली कायम असलेल्या
// signed report input साठी upload event

g('signedReport').addEventListener(
  'change',
  uploadSignedReport
);


// जुने button असल्यास

const uploadButton =
  g('uploadSignedBtn');

if (uploadButton) {

  uploadButton.onclick =
    uploadSignedReport;

}


// =========================================
// COMBINED REPORT
// =========================================

function renderCombined(records, village) {

  const list =
    village
      ? records.filter(
          record =>
            record.village === village
        )
      : records;


  const box =
    g('combinedReportBox');


  box.style.display =
    'block';


  if (!list.length) {

    box.innerHTML = `
      <div class="official-report">

        <h3 style="text-align:center;">
          एकत्रित ज्वारी पीक पडताळणी अहवाल
        </h3>

        <p style="text-align:center;">
          कोणतीही नोंद उपलब्ध नाही.
        </p>

      </div>
    `;

    return;

  }


  const title =
    village
      ? `${village} गावाचा ज्वारी पीक प्रत्यक्ष पडताळणी एकत्रित अहवाल`
      : 'सर्व गावांचा ज्वारी पीक प्रत्यक्ष पडताळणी एकत्रित अहवाल';


  const total =
    list.length;


  const present =
    list.filter(
      x =>
        x.actualStatus ===
        'ज्वारीचे पीक प्रत्यक्ष आहे'
    ).length;


  const absent =
    list.filter(
      x =>
        x.actualStatus ===
        'ज्वारीचे पीक प्रत्यक्ष नाही'
    ).length;


  const harvested =
    list.filter(
      x =>
        x.actualStatus ===
        'काढणी झालेले / अवशेष उपलब्ध'
    ).length;


  const enquiry =
    list.filter(
      x =>
        x.actualStatus ===
        'पुढील चौकशी आवश्यक'
    ).length;


  let rows = '';


  list.forEach(
    (record, index) => {

      rows += `

        <tr>

          <td>${index + 1}</td>

          <td>
            ${escapeHTML(record.reportId)}
          </td>

          <td>
            ${escapeHTML(record.farmer)}
          </td>

          <td>
            ${escapeHTML(record.village)}
          </td>

          <td>
            ${escapeHTML(record.survey)}
          </td>

          <td>
            ${escapeHTML(record.area || '-')}
          </td>

          <td>
            ${escapeHTML(record.actualStatus)}
          </td>

          <td>
            ${escapeHTML(
              record.verificationTime || '-'
            )}
          </td>

        </tr>

      `;

    }
  );


  box.innerHTML = `

    <div class="official-report">

      <div style="text-align:center;">

        <p>
          ग्राम महसूल अधिकारी कार्यालय
        </p>

        <h2>
          ${escapeHTML(title)}
        </h2>

      </div>


      <p>

        <b>अहवाल तयार करण्याचा दिनांक :</b>

        ${getDateTime()}

      </p>


      <div class="summary-box">

        <p>
          <b>एकूण पडताळणी :</b>
          ${total}
        </p>

        <p>
          <b>ज्वारीचे पीक प्रत्यक्ष आहे :</b>
          ${present}
        </p>

        <p>
          <b>ज्वारीचे पीक प्रत्यक्ष नाही :</b>
          ${absent}
        </p>

        <p>
          <b>काढणी झालेले / अवशेष उपलब्ध :</b>
          ${harvested}
        </p>

        <p>
          <b>पुढील चौकशी आवश्यक :</b>
          ${enquiry}
        </p>

      </div>


      <h3>
        शेतकरीनिहाय तपशीलवार नोंद
      </h3>


      <div style="overflow-x:auto;">

        <table class="combined-table">

          <thead>

            <tr>

              <th>अ.क्र.</th>
              <th>Report ID</th>
              <th>शेतकऱ्याचे नाव</th>
              <th>गाव</th>
              <th>सर्वे नं.</th>
              <th>क्षेत्र</th>
              <th>प्रत्यक्ष स्थिती</th>
              <th>दिनांक / वेळ</th>

            </tr>

          </thead>


          <tbody>

            ${rows}

          </tbody>

        </table>

      </div>


      <br>


      <div class="report-actions">

        <button
          type="button"
          class="print-btn"
          onclick="printCombinedReport()"
        >
          🖨️ एकत्रित अहवाल Print / PDF
        </button>


        <button
          type="button"
          class="combined-btn"
          onclick="downloadCombinedCSV()"
        >
          ⬇️ Excel साठी CSV Download
        </button>

      </div>


      <br><br>


      <div style="text-align:right;">

        <p>
          __________________________
        </p>

        <p>

          पडताळणी अधिकारी<br>
          ग्राम महसूल अधिकारी

        </p>

      </div>

    </div>

  `;


  setTimeout(() => {

    box.scrollIntoView({

      behavior: 'smooth',
      block: 'start'

    });

  }, 200);

}


// =========================================
// COMBINED BUTTON
// =========================================

g('combinedReportBtn').onclick =
function () {

  const records =
    localRecords();


  const village =
    g('reportVillage').value;


  renderCombined(
    records,
    village
  );

};


// =========================================
// PRINT COMBINED REPORT
// =========================================

function printCombinedReport() {

  const combined =
    g('combinedReportBox');


  if (!combined.innerHTML.trim()) {

    msg(
      '⚠️ प्रथम एकत्रित अहवाल तयार करा.',
      'error'
    );

    return;

  }


  const printWindow =
    window.open(
      '',
      '_blank'
    );


  printWindow.document.write(`

    <!DOCTYPE html>

    <html lang="mr">

    <head>

      <meta charset="UTF-8">

      <title>
        एकत्रित ज्वारी पीक पडताळणी अहवाल
      </title>

      <style>

        body {
          font-family:
            "Nirmala UI",
            Arial,
            sans-serif;

          padding:25px;
          color:#000;
        }

        table {
          width:100%;
          border-collapse:collapse;
          font-size:12px;
        }

        th,
        td {
          border:1px solid #000;
          padding:6px;
        }

        th {
          background:#eee;
        }

        h2,
        h3 {
          text-align:center;
        }

        button {
          display:none;
        }

        @media print {

          body {
            padding:0;
          }

        }

      </style>

    </head>

    <body>

      ${combined.innerHTML}

    </body>

    </html>

  `);


  printWindow.document.close();


  setTimeout(() => {

    printWindow.print();

  }, 500);

}


// =========================================
// DOWNLOAD COMBINED CSV
// =========================================

function downloadCombinedCSV() {

  const village =
    g('reportVillage').value;


  const records =
    localRecords()
      .filter(
        record =>
          !village ||
          record.village === village
      );


  if (!records.length) {

    msg(
      '⚠️ Download करण्यासाठी कोणतीही नोंद उपलब्ध नाही.',
      'error'
    );

    return;

  }


  const rows = [

    [
      'अ.क्र.',
      'Report ID',
      'शेतकऱ्याचे नाव',
      'गाव',
      'सर्वे नंबर',
      'क्षेत्र',
      'मोबाईल',
      'ई-पीक',
      'प्रत्यक्ष स्थिती',
      'बयान देणारी व्यक्ती',
      'दिनांक'
    ],

    ...records.map(
      (record, index) => [

        index + 1,

        record.reportId,

        record.farmer,

        record.village,

        record.survey,

        record.area,

        record.mobile,

        record.eCrop,

        record.actualStatus,

        record.statementFarmer,

        record.verificationTime

      ]
    )

  ];


  const csv =

    '\ufeff' +

    rows
      .map(
        row =>
          row
            .map(
              value =>
                `"${String(
                  value ?? ''
                ).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(',')
      )
      .join('\n');


  const blob =
    new Blob(

      [csv],

      {
        type:
          'text/csv;charset=utf-8;'
      }

    );


  const link =
    document.createElement('a');


  link.href =
    window.URL.createObjectURL(blob);


  link.download =
    village
      ? `${village}_Jwari_Combined_Report.csv`
      : 'All_Villages_Jwari_Combined_Report.csv';


  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);


  window.URL.revokeObjectURL(
    link.href
  );

}


// =========================================
// SEARCH RECORDS
// =========================================

g('searchBtn').onclick =
function () {

  const query =
    g('searchRecord')
      .value
      .trim()
      .toLowerCase();


  if (!query) {

    msg(
      '⚠️ Report ID / शेतकऱ्याचे नाव / गाव / सर्वे नंबर लिहा.',
      'error'
    );

    return;

  }


  const found =
    localRecords()
      .filter(record =>

        [

          record.reportId,

          record.farmer,

          record.village,

          record.survey,

          record.mobile

        ]

        .some(
          value =>
            String(
              value || ''
            )
            .toLowerCase()
            .includes(query)
        )

      );


  const box =
    g('searchResults');


  if (!found.length) {

    box.innerHTML = `
      <div class="search-card">
        कोणतीही नोंद सापडली नाही.
      </div>
    `;

    return;

  }


  box.innerHTML =
    found.map(record => `

      <div class="search-card">

        <b>
          ${escapeHTML(record.farmer)}
        </b>

        <br>

        गाव:
        ${escapeHTML(record.village)}

        |

        सर्वे नं.:
        ${escapeHTML(record.survey)}

        <br>

        Report ID:
        ${escapeHTML(record.reportId)}

        <br>

        स्थिती:
        ${escapeHTML(record.actualStatus)}

        <br>

        दिनांक:
        ${escapeHTML(record.verificationTime)}

        <br>


        <button
          type="button"
          onclick="openLocalReport('${escapeHTML(record.reportId)}')"
        >
          📄 अहवाल उघडा
        </button>


        <button
          type="button"
          onclick="downloadRecord('${escapeHTML(record.reportId)}')"
        >
          ⬇️ संपूर्ण माहिती Download
        </button>

      </div>

    `).join('');

};


// =========================================
// OPEN OLD REPORT
// =========================================

function openLocalReport(id) {

  const record =
    localRecords()
      .find(
        item =>
          item.reportId === id
      );


  if (!record) {

    msg(
      '❌ नोंद उपलब्ध नाही.',
      'error'
    );

    return;

  }


  reportData =
    record;


  showReport();

}


// =========================================
// DOWNLOAD SINGLE RECORD
// =========================================

function downloadRecord(id) {

  const record =
    localRecords()
      .find(
        item =>
          item.reportId === id
      );


  if (!record) {

    msg(
      '❌ Download करण्यासाठी नोंद उपलब्ध नाही.',
      'error'
    );

    return;

  }


  const html = `

    <!DOCTYPE html>

    <html lang="mr">

    <head>

      <meta charset="UTF-8">

      <title>
        ${escapeHTML(record.reportId)}
      </title>

      <style>

        body {

          font-family:
            "Nirmala UI",
            Arial,
            sans-serif;

          padding:30px;

        }

        .report-table {

          width:100%;
          border-collapse:collapse;

        }

        .report-table td {

          border:1px solid #000;
          padding:8px;

        }

        .farmer-statement {

          border:1px solid #000;
          padding:15px;

        }

      </style>

    </head>

    <body>

      ${generateReportHTML(record)}

    </body>

    </html>

  `;


  const blob =
    new Blob(

      [html],

      {
        type:
          'text/html;charset=utf-8'
      }

    );


  const link =
    document.createElement('a');


  link.href =
    window.URL.createObjectURL(blob);


  link.download =
    record.reportId +
    '_Report.html';


  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);


  window.URL.revokeObjectURL(
    link.href
  );

}


// =========================================
// NEW ENTRY
// =========================================

g('newEntryBtn').onclick =
function () {

  if (
    confirm(
      'नवीन नोंद सुरू करायची आहे का?'
    )
  ) {

    location.reload();

  }

};
