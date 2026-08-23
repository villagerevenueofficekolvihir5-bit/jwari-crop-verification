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
let gpsWatchId = null;

const g = id => document.getElementById(id);


/* =========================================
   MESSAGE FUNCTION
========================================= */

function showMessage(message, type = '') {

  const msg = g('msg');

  msg.className = type;
  msg.innerHTML = message;

}


/* =========================================
   AI RESULT FUNCTION
========================================= */

function showAI(message) {

  const box = g('aiResult');

  if (box) {
    box.innerHTML = message;
  }

}


/* =========================================
   GPS ERROR
========================================= */

function gpsError(error) {

  let message = '';

  switch (error.code) {

    case error.PERMISSION_DENIED:

      message =
        '❌ GPS Permission बंद आहे.<br><br>' +
        'Browser Settings मध्ये जाऊन Location ला Allow करा.';

      break;


    case error.POSITION_UNAVAILABLE:

      message =
        '❌ GPS Location उपलब्ध नाही.<br><br>' +
        'मोबाईलची Location सेवा चालू आहे का तपासा.';

      break;


    case error.TIMEOUT:

      message =
        '❌ GPS मिळण्यासाठी जास्त वेळ लागला.<br><br>' +
        'मोकळ्या जागेत जाऊन पुन्हा प्रयत्न करा.';

      break;


    default:

      message =
        '❌ GPS Location मिळाले नाही.<br><br>' +
        'Location ON करून पुन्हा प्रयत्न करा.';

  }


  g('gps').innerHTML = message;

  showMessage(
    '⚠️ Submit करण्यापूर्वी GPS मिळवणे आवश्यक आहे.',
    'error'
  );

}


/* =========================================
   SAVE GPS
========================================= */

function saveGPS(position) {

  lat = position.coords.latitude;
  lng = position.coords.longitude;
  accuracy = position.coords.accuracy;


  let accuracyStatus = '';

  if (accuracy <= 20) {

    accuracyStatus =
      '🟢 अतिशय अचूक GPS';

  }
  else if (accuracy <= 50) {

    accuracyStatus =
      '🟡 GPS Accuracy चांगली आहे';

  }
  else if (accuracy <= 100) {

    accuracyStatus =
      '🟠 GPS Accuracy कमी आहे';

  }
  else {

    accuracyStatus =
      '🔴 GPS Accuracy खूप कमी आहे. कृपया पुन्हा GPS मिळवा.';

  }


  g('gps').innerHTML =

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

    '<br><br>' +

    accuracyStatus;


  showMessage(
    '📍 GPS यशस्वीरित्या मिळाले आहे.',
    'success'
  );

}


/* =========================================
   GET GPS
========================================= */

function getGPS() {

  g('gps').innerHTML =

    '⏳ <b>GPS Location मिळवत आहे...</b><br><br>' +

    'कृपया थोडा वेळ थांबा.<br>' +

    'मोबाईलची Location ON ठेवा.';


  if (!navigator.geolocation) {

    g('gps').innerHTML =
      '❌ या Browser मध्ये GPS उपलब्ध नाही.';

    return;

  }


  /* जुना GPS Watch बंद करा */

  if (gpsWatchId !== null) {

    navigator.geolocation.clearWatch(gpsWatchId);

    gpsWatchId = null;

  }


  /* प्रथम Current Position */

  navigator.geolocation.getCurrentPosition(

    function(position) {

      saveGPS(position);

    },

    function(error) {

      gpsError(error);

    },

    {

      enableHighAccuracy: true,

      timeout: 45000,

      maximumAge: 0

    }

  );


  /* GPS सतत अपडेट करण्यासाठी */

  gpsWatchId =
    navigator.geolocation.watchPosition(

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
   PHOTO PREVIEW
========================================= */

g('photo').addEventListener(

  'change',

  function() {

    const file =
      g('photo').files[0];


    if (!file) {

      return;

    }


    /* Image आहे का तपासा */

    if (!file.type.startsWith('image/')) {

      showMessage(
        '❌ कृपया फक्त फोटो निवडा.',
        'error'
      );

      g('photo').value = '';

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      function(e) {

        g('preview').src =
          e.target.result;

        g('preview').style.display =
          'block';


        showAI(
          '🤖 AI पडताळणी: फोटो तयार आहे. माहिती Submit केल्यानंतर AI पडताळणी केली जाईल.'
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

    .replace(
      /[\\/:*?"<>|]/g,
      '_'
    )

    .replace(
      /\s+/g,
      '_'
    );

}


/* =========================================
   DATE TIME
========================================= */

function getDateTime() {

  return new Date()
    .toLocaleString(

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
   CREATE GPS STAMPED IMAGE
========================================= */

function stamped(file) {

  return new Promise(

    function(resolve, reject) {

      const reader =
        new FileReader();


      reader.onload =
        function(e) {

          const img =
            new Image();


          img.onload =
            function() {

              let width =
                img.width;

              let height =
                img.height;


              const MAX_WIDTH =
                1600;


              if (
                width > MAX_WIDTH
              ) {

                height =
                  Math.round(
                    height *
                    MAX_WIDTH /
                    width
                  );

                width =
                  MAX_WIDTH;

              }


              const fontSize =
                Math.max(
                  18,
                  Math.round(
                    width / 42
                  )
                );


              const lineHeight =
                Math.round(
                  fontSize * 1.45
                );


              const padding =
                Math.round(
                  fontSize * 0.8
                );


              const infoHeight =

                lineHeight * 5 +

                padding * 2;


              const canvas =
                document.createElement(
                  'canvas'
                );


              canvas.width =
                width;


              canvas.height =
                height +
                infoHeight;


              const ctx =
                canvas.getContext(
                  '2d'
                );


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
                'rgba(0,0,0,0.80)';


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

                'px Arial';


              let y =

                height +

                padding +

                fontSize;


              const lines = [

                'शेतकरी: ' +
                g('farmer').value.trim(),


                'गाव: ' +
                g('village').value +

                ' | सर्वे नं.: ' +
                g('survey').value.trim(),


                'GPS: ' +

                Number(lat)
                  .toFixed(6) +

                ', ' +

                Number(lng)
                  .toFixed(6),


                'Accuracy: ' +

                Math.round(accuracy) +

                ' meters',


                'दिनांक व वेळ: ' +

                getDateTime()

              ];


              lines.forEach(

                function(line) {

                  ctx.fillText(

                    line,

                    padding,

                    y

                  );


                  y +=
                    lineHeight;

                }

              );


              resolve(

                canvas.toDataURL(

                  'image/jpeg',

                  0.85

                )

              );

            };


          img.onerror =
            reject;


          img.src =
            e.target.result;

        };


      reader.onerror =
        reject;


      reader.readAsDataURL(file);

    }

  );

}


/* =========================================
   VALIDATE MOBILE
========================================= */

function validateMobile() {

  const mobile =
    g('mobile')
      .value
      .trim();


  if (!mobile) {

    return true;

  }


  return /^[0-9]{10}$/
    .test(mobile);

}


/* =========================================
   SUBMIT FORM
========================================= */

g('submitBtn').addEventListener(

  'click',

  async function() {


    const need = [];


    if (
      !g('farmer')
        .value
        .trim()
    ) {

      need.push(
        'शेतकऱ्याचे नाव'
      );

    }


    if (
      !g('village').value
    ) {

      need.push(
        'गाव'
      );

    }


    if (
      !g('survey')
        .value
        .trim()
    ) {

      need.push(
        'गट / सर्वे नंबर'
      );

    }


    if (
      !g('eCrop').value
    ) {

      need.push(
        'ई-पीक नोंद'
      );

    }


    if (
      !g('actualStatus')
        .value
    ) {

      need.push(
        'प्रत्यक्ष पाहणीतील स्थिती'
      );

    }


    if (
      !g('photo')
        .files[0]
    ) {

      need.push(
        'प्रत्यक्ष फोटो'
      );

    }


    if (
      !lat ||
      !lng
    ) {

      need.push(
        'GPS Location'
      );

    }


    if (
      !validateMobile()
    ) {

      need.push(
        'योग्य 10 अंकी मोबाईल नंबर'
      );

    }


    if (
      URL.includes(
        'PASTE_YOUR'
      )
    ) {

      need.push(
        'Web App URL'
      );

    }


    /* आवश्यक माहिती */

    if (
      need.length
    ) {

      showMessage(

        '⚠️ खालील माहिती आवश्यक आहे:<br><br>' +

        need
          .map(
            x => '❌ ' + x
          )
          .join('<br>'),

        'error'

      );


      return;

    }


    /* GPS Accuracy Warning */

    if (
      Number(accuracy) > 100
    ) {

      const confirmSubmit =
        confirm(

          'GPS Accuracy ' +

          Math.round(accuracy) +

          ' मीटर आहे.\n\n' +

          'GPS पुन्हा मिळवणे योग्य राहील.\n\n' +

          'तरीही Submit करायचे आहे का?'

        );


      if (
        !confirmSubmit
      ) {

        return;

      }

    }


    const button =
      g('submitBtn');


    button.disabled =
      true;


    button.innerHTML =
      '⏳ माहिती साठवत आहे...';


    showMessage(

      '⏳ GPS माहिती आणि फोटो प्रक्रिया सुरू आहे...'

    );


    showAI(

      '🤖 AI पडताळणी सुरू आहे...<br>' +

      'कृपया प्रतीक्षा करा.'

    );


    try {


      const file =
        g('photo')
          .files[0];


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
          g('farmer')
            .value
            .trim(),


        village:
          g('village')
            .value,


        survey:
          g('survey')
            .value
            .trim(),


        area:
          g('area')
            .value
            .trim(),


        mobile:
          g('mobile')
            .value
            .trim(),


        eCrop:
          g('eCrop')
            .value,


        actualStatus:
          g('actualStatus')
            .value,


        localStatement:
          g('localStatement')
            .value,


        receiptChecked:
          g('receiptChecked')
            .value,


        officer:
          g('officer')
            .value
            .trim(),


        remark:
          g('remark')
            .value
            .trim(),


        lat:
          lat,


        lng:
          lng,


        accuracy:
          accuracy,


        capturedAt:
          new Date()
            .toISOString(),


        fileName:
          fileName,


        mimeType:
          'image/jpeg',


        imageBase64:

          imageData
            .split(',')[1]

      };


      /* GOOGLE APPS SCRIPT ला DATA पाठवा */

      await fetch(

        URL,

        {

          method:
            'POST',

          mode:
            'no-cors',

          headers: {

            'Content-Type':
              'text/plain;charset=utf-8'

          },

          body:
            JSON.stringify(data)

        }

      );


      /* SUCCESS */

      showMessage(

        '✅ माहिती यशस्वीरित्या साठविण्यात आली!<br><br>' +

        '📍 GPS Location सेव्ह करण्यात आली.<br>' +

        '📷 फोटो Google Drive मध्ये सेव्ह करण्यात आला.',

        'success'

      );


      showAI(

        '🤖 AI पडताळणी: माहिती Server कडे पाठविण्यात आली आहे.<br>' +

        'AI निकाल Google Sheet मध्ये उपलब्ध होईल.'

      );


      /* FORM RESET */

      setTimeout(

        function() {

          resetForm();

        },

        2500

      );


    }


    catch (error) {


      console.error(
        error
      );


      showMessage(

        '❌ माहिती साठविताना त्रुटी आली.<br><br>' +

        'कृपया इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.',

        'error'

      );


      showAI(

        '❌ AI पडताळणी पूर्ण झाली नाही. कृपया पुन्हा प्रयत्न करा.'

      );

    }


    finally {


      button.disabled =
        false;


      button.innerHTML =
        '✅ माहिती Submit करा';

    }


  }

);


/* =========================================
   RESET FORM
========================================= */

function resetForm() {


  g('farmer').value =
    '';


  g('village').value =
    '';


  g('survey').value =
    '';


  g('area').value =
    '';


  g('mobile').value =
    '';


  g('eCrop').value =
    '';


  g('actualStatus').value =
    '';


  g('localStatement').value =
    'होय';


  g('receiptChecked').value =
    'होय';


  g('officer').value =
    '';


  g('remark').value =
    '';


  g('photo').value =
    '';


  g('preview').src =
    '';


  g('preview').style.display =
    'none';


  showAI(

    '🤖 AI पडताळणी: फोटो Submit केल्यानंतर निकाल दिसेल.'

  );


  /* नवीन GPS */

  lat = '';
  lng = '';
  accuracy = '';


  setTimeout(

    getGPS,

    1000

  );

}
