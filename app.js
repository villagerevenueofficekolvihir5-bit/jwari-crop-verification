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
let gpsWatchId = null;

const g = id => document.getElementById(id);


/* =========================================
   MESSAGE FUNCTION
========================================= */

function showMessage(message, type = '') {

  const msg = g('msg');

  if (!msg) return;

  msg.className = type;
  msg.innerHTML = message;

}


/* =========================================
   AI RESULT FUNCTION
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

  box.innerHTML = message;

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

      message =
        '❌ <b>GPS Permission बंद आहे.</b><br><br>' +
        'Browser Settings मध्ये Location ला Allow करा.<br><br>' +
        'Chrome → Site Settings → Location → Allow';

      break;


    case error.POSITION_UNAVAILABLE:

      message =
        '❌ <b>GPS Location उपलब्ध नाही.</b><br><br>' +
        'मोबाईलची Location सेवा ON आहे का तपासा.<br>' +
        'शक्य असल्यास मोकळ्या जागेत जा.';

      break;


    case error.TIMEOUT:

      message =
        '❌ <b>GPS मिळण्यासाठी जास्त वेळ लागला.</b><br><br>' +
        'मोकळ्या जागेत जाऊन पुन्हा प्रयत्न करा.';

      break;


    default:

      message =
        '❌ GPS Location मिळाले नाही.<br><br>' +
        'Location ON करून पुन्हा प्रयत्न करा.';

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

  }

  else if (accuracy <= 50) {

    accuracyStatus =
      '🟢 <b>GPS Accuracy चांगली आहे</b>';

  }

  else if (accuracy <= 100) {

    accuracyStatus =
      '🟡 <b>GPS Accuracy मध्यम आहे</b>';

  }

  else {

    accuracyStatus =
      '🟠 <b>GPS Accuracy कमी आहे. शक्य असल्यास पुन्हा GPS मिळवा.</b>';

  }


  setGPSStatus(

    '✅ <b>GPS Location मिळाले</b><br><br>' +

    '📍 Latitude: ' +
    Number(lat).toFixed(6) +

    '<br>' +

    '📍 Longitude: ' +
    Number(lng).toFixed(6) +

    '<br>' +

    '🎯 Accuracy: ' +
    Math.round(accuracy) +
    ' मीटर' +

    '<br>' +

    '🕒 वेळ: ' +
    getDateTime() +

    '<br><br>' +

    accuracyStatus,

    'success'

  );

}


/* =========================================
   GET GPS
========================================= */

function getGPS() {

  setGPSStatus(

    '⏳ <b>GPS Location मिळवत आहे...</b><br><br>' +

    'कृपया थोडा वेळ थांबा.<br>' +

    '📱 मोबाईलची Location ON ठेवा.<br>' +
    '🌐 Browser Permission Allow असणे आवश्यक आहे.',

    'loading'

  );


  if (!navigator.geolocation) {

    setGPSStatus(
      '❌ या Browser मध्ये GPS उपलब्ध नाही.',
      'error'
    );

    return;

  }


  /* जुना GPS Watch बंद करा */

  if (gpsWatchId !== null) {

    navigator.geolocation.clearWatch(gpsWatchId);

    gpsWatchId = null;

  }


  /* Current Position */

  navigator.geolocation.getCurrentPosition(

    function(position) {

      saveGPS(position);

    },

    function(error) {

      gpsError(error);

    },

    {
      enableHighAccuracy: true,
      timeout: 60000,
      maximumAge: 0
    }

  );


  /* GPS सतत अपडेट */

  gpsWatchId = navigator.geolocation.watchPosition(

    function(position) {

      saveGPS(position);

    },

    function(error) {

      console.log('GPS Watch Error:', error);

    },

    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 60000
    }

  );

}


/* =========================================
   GPS BUTTON
========================================= */

g('gpsBtn').addEventListener(
  'click',
  getGPS
);


/* =========================================
   PAGE LOAD GPS
========================================= */

window.addEventListener(

  'load',

  function() {

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

g('photo').addEventListener(

  'change',

  function() {

    const file = g('photo').files[0];


    if (!file) {
      return;
    }


    if (!file.type.startsWith('image/')) {

      showMessage(
        '❌ कृपया फक्त फोटो निवडा.',
        'error'
      );

      g('photo').value = '';

      return;

    }


    const reader = new FileReader();


    reader.onload = function(e) {

      g('preview').src = e.target.result;

      g('preview').style.display = 'block';


      showAI(
        '🤖 AI पडताळणीसाठी फोटो तयार आहे.<br>' +
        'माहिती Submit केल्यानंतर फोटो प्रक्रिया केली जाईल.'
      );

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

  return new Promise(

    function(resolve, reject) {

      const reader = new FileReader();


      reader.onload = function(e) {

        const img = new Image();


        img.onload = function() {

          let width = img.width;
          let height = img.height;


          const MAX_WIDTH = 1600;


          if (width > MAX_WIDTH) {

            height = Math.round(
              height * MAX_WIDTH / width
            );

            width = MAX_WIDTH;

          }


          const fontSize = Math.max(
            20,
            Math.round(width / 42)
          );


          const lineHeight = Math.round(
            fontSize * 1.5
          );


          const padding = Math.round(
            fontSize * 0.8
          );


          const infoHeight =
            lineHeight * 5 +
            padding * 2;


          const canvas =
            document.createElement('canvas');


          canvas.width = width;

          canvas.height =
            height + infoHeight;


          const ctx =
            canvas.getContext('2d');


          /* मूळ फोटो */

          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );


          /* खाली माहिती पट्टी */

          ctx.fillStyle =
            'rgba(0,0,0,0.82)';


          ctx.fillRect(
            0,
            height,
            width,
            infoHeight
          );


          ctx.fillStyle =
            '#ffffff';


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


          lines.forEach(

            function(line) {

              ctx.fillText(
                line,
                padding,
                y
              );

              y += lineHeight;

            }

          );


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

    }

  );

}


/* =========================================
   VALIDATE MOBILE
========================================= */

function validateMobile() {

  const mobile =
    g('mobile').value.trim();


  if (!mobile) {
    return true;
  }


  return /^[0-9]{10}$/.test(mobile);

}


/* =========================================
   VALIDATE GPS
========================================= */

function validateGPS() {

  if (!lat || !lng) {

    return {
      valid: false,
      warning: false
    };

  }


  return {
    valid: true,
    warning: Number(accuracy) > 100
  };

}


/* =========================================
   SHOW VERIFICATION REPORT
========================================= */

function showReport() {

  const reportBox =
    g('reportBox');

  const reportContent =
    g('reportContent');


  if (!reportBox || !reportContent) {

    console.error(
      'Report Box HTML मध्ये उपलब्ध नाही.'
    );

    return;

  }


  const farmer =
    g('farmer').value.trim();

  const village =
    g('village').value;

  const survey =
    g('survey').value.trim();

  const area =
    g('area').value.trim();

  const mobile =
    g('mobile').value.trim();

  const eCrop =
    g('eCrop').value;

  const actualStatus =
    g('actualStatus').value;

  const localStatement =
    g('localStatement').value;

  const receiptChecked =
    g('receiptChecked').value;

  const officer =
    g('officer').value.trim();

  const remark =
    g('remark').value.trim();


  let resultClass =
    'report-success';

  let resultText =
    '✅ प्रत्यक्ष पाहणीमध्ये ज्वारीचे पीक आढळून आले आहे.';


  if (
    actualStatus ===
    'ज्वारीचे पीक प्रत्यक्ष नाही'
  ) {

    resultClass =
      'report-error';

    resultText =
      '❌ प्रत्यक्ष पाहणीमध्ये ज्वारीचे पीक आढळून आले नाही.';

  }


  else if (

    actualStatus ===
    'काढणी झालेले / अवशेष उपलब्ध'

    ||

    actualStatus ===
    'पुढील चौकशी आवश्यक'

  ) {

    resultClass =
      'report-warning';

    resultText =
      '⚠️ सदर प्रकरणात पुढील चौकशी / पडताळणी आवश्यक आहे.';

  }


  reportBox.className =
    'report-box ' +
    resultClass;


  reportContent.innerHTML =

    '<p><b>शेतकऱ्याचे पूर्ण नाव:</b> ' +
    farmer +
    '</p>' +

    '<p><b>गाव:</b> ' +
    village +
    '</p>' +

    '<p><b>गट / सर्वे नंबर:</b> ' +
    survey +
    '</p>' +

    '<p><b>क्षेत्र:</b> ' +
    (area || '-') +
    ' हे.आर.</p>' +

    '<p><b>मोबाईल नंबर:</b> ' +
    (mobile || '-') +
    '</p>' +

    '<hr>' +

    '<p><b>ई-पीक पाहणीतील नोंद:</b> ' +
    eCrop +
    '</p>' +

    '<p><b>प्रत्यक्ष पाहणीतील स्थिती:</b> ' +
    actualStatus +
    '</p>' +

    '<p><b>स्थानिक शेतकऱ्यांचे बयान:</b> ' +
    localStatement +
    '</p>' +

    '<p><b>खत / बियाणे पावती पाहिली:</b> ' +
    receiptChecked +
    '</p>' +

    '<hr>' +

    '<p><b>📍 Latitude:</b> ' +
    Number(lat).toFixed(6) +
    '</p>' +

    '<p><b>📍 Longitude:</b> ' +
    Number(lng).toFixed(6) +
    '</p>' +

    '<p><b>🎯 GPS Accuracy:</b> ' +
    Math.round(accuracy) +
    ' मीटर</p>' +

    '<p><b>🕒 पडताळणी दिनांक व वेळ:</b> ' +
    getDateTime() +
    '</p>' +

    '<hr>' +

    '<p><b>पडताळणी अधिकाऱ्याचे नाव:</b> ' +
    (officer || '-') +
    '</p>' +

    '<p><b>शेरा:</b> ' +
    (remark || '-') +
    '</p>' +

    '<hr>' +

    '<p><b>पडताळणीचा निकाल:</b><br>' +
    resultText +
    '</p>';


  reportBox.style.display =
    'block';


  setTimeout(

    function() {

      reportBox.scrollIntoView({

        behavior: 'smooth',

        block: 'start'

      });

    },

    300

  );

}


/* =========================================
   SUBMIT FORM
========================================= */

g('submitBtn').addEventListener(

  'click',

  async function() {

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
      need.push('GPS Location');
    }


    if (!validateMobile()) {
      need.push('योग्य 10 अंकी मोबाईल नंबर');
    }


    if (!URL || URL.includes('PASTE_YOUR')) {
      need.push('Google Apps Script Web App URL');
    }


    if (need.length > 0) {

      showMessage(

        '⚠️ खालील माहिती आवश्यक आहे:<br><br>' +

        need
          .map(x => '❌ ' + x)
          .join('<br>'),

        'error'

      );

      return;

    }


    /* GPS Accuracy Warning */

    if (gpsCheck.warning) {

      const confirmSubmit = confirm(

        '⚠️ GPS Accuracy ' +

        Math.round(accuracy) +

        ' मीटर आहे.\n\n' +

        'GPS पुन्हा मिळवणे योग्य राहील.\n\n' +

        'तरीही Submit करायचे आहे का?'

      );


      if (!confirmSubmit) {
        return;
      }

    }


    const button =
      g('submitBtn');


    button.disabled = true;

    button.innerHTML =
      '⏳ माहिती साठवत आहे...';


    showMessage(
      '⏳ GPS माहिती आणि फोटो प्रक्रिया सुरू आहे...'
    );


    showAI(
      '🤖 पडताळणीसाठी फोटो आणि माहिती पाठवली जात आहे...'
    );


    try {

      const file =
        g('photo').files[0];


      /* GPS माहिती असलेला फोटो */

      const imageData =
        await stamped(file);


      /* File Name */

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


      /* Data Object */

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

        localStatement:
          g('localStatement').value,

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

        capturedAt:
          new Date().toISOString(),

        fileName: fileName,

        mimeType:
          'image/jpeg',

        imageBase64:
          imageData.split(',')[1]

      };


      /* GOOGLE APPS SCRIPT ला DATA पाठवा */

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


      /* SUCCESS MESSAGE */

      showMessage(

        '✅ <b>माहिती यशस्वीरित्या साठविण्यात आली!</b><br><br>' +

        '📍 GPS Location सेव्ह करण्यात आली.<br>' +

        '📷 फोटो Google Drive मध्ये पाठवण्यात आला.<br>' +

        '🎯 GPS Accuracy: ' +
        Math.round(accuracy) +
        ' मीटर',

        'success'

      );


      showAI(

        '🤖 माहिती आणि फोटो पडताळणीसाठी पाठवण्यात आला आहे.<br>' +
        'पडताळणी अहवाल खाली तयार करण्यात आला आहे.',

        'success'

      );


      /* =====================================
         SHOW REPORT
      ===================================== */

      showReport();


      /* GPS Watch बंद करा */

      if (gpsWatchId !== null) {

        navigator.geolocation.clearWatch(
          gpsWatchId
        );

        gpsWatchId = null;

      }


      /*
        IMPORTANT:

        येथे resetForm() ठेवलेले नाही.

        त्यामुळे अहवाल स्क्रीनवर कायम दिसेल.
      */

    }


    catch (error) {

      console.error(error);


      showMessage(

        '❌ माहिती साठविताना त्रुटी आली.<br><br>' +

        'कृपया इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.',

        'error'

      );


      showAI(

        '❌ पडताळणी पूर्ण झाली नाही. कृपया पुन्हा प्रयत्न करा.',

        'error'

      );

    }


    finally {

      button.disabled = false;

      button.innerHTML =
        '✅ माहिती Submit करा';

    }

  }

);


/* =========================================
   PRINT REPORT
========================================= */

const printBtn = g('printBtn');

if (printBtn) {

  printBtn.addEventListener(

    'click',

    function() {

      window.print();

    }

  );

}


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

  g('localStatement').value = 'होय';

  g('receiptChecked').value = 'होय';

  g('officer').value = '';

  g('remark').value = '';

  g('photo').value = '';

  g('preview').src = '';

  g('preview').style.display = 'none';


  showAI(
    '🤖 AI पडताळणी: फोटो Submit केल्यानंतर निकाल दिसेल.'
  );


  showMessage('', '');


  /* Report लपवा */

  const reportBox =
    g('reportBox');

  if (reportBox) {

    reportBox.style.display =
      'none';

  }


  /* GPS माहिती काढा */

  lat = '';
  lng = '';
  accuracy = '';
  gpsTimestamp = '';


  /* नवीन GPS मिळवा */

  setTimeout(
    getGPS,
    1000
  );

}
