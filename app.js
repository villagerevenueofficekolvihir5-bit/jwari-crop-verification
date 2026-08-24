const URL='https://script.google.com/macros/s/AKfycbxf-DeTDrNmtqrALOv3MskWyIQZJjJUgKqPCAy5I_L9o8gydxsMdMqbpW-0FH2bSFKH/exec';

let lat='',lng='',accuracy='',gpsTimestamp='',reportData=null;

const g=id=>document.getElementById(id);

const dt=()=>new Date().toLocaleString('en-GB',{
  day:'2-digit',
  month:'2-digit',
  year:'numeric',
  hour:'2-digit',
  minute:'2-digit',
  second:'2-digit',
  hour12:false
});


function msg(x,t=''){
  g('msg').className=t;
  g('msg').innerHTML=x;
  g('msg').style.display=x?'block':'none';
}


/* =========================================
   GPS
========================================= */

function gps(){

  g('gps').innerHTML='⏳ GPS Location मिळवत आहे...';

  if(!navigator.geolocation){

    g('gps').innerHTML='❌ या Browser मध्ये GPS उपलब्ध नाही.';
    return;

  }

  navigator.geolocation.getCurrentPosition(

    p=>{

      lat=p.coords.latitude;
      lng=p.coords.longitude;
      accuracy=p.coords.accuracy;

      gpsTimestamp=new Date().toISOString();

      g('gps').innerHTML=
      `📍 <b>GPS Location मिळाले</b><br>
      Latitude: ${lat.toFixed(6)}<br>
      Longitude: ${lng.toFixed(6)}<br>
      🎯 Accuracy: ${Math.round(accuracy)} मीटर<br>
      🕒 वेळ: ${dt()}`;

    },

    e=>{

      g('gps').innerHTML=
      '❌ GPS Location मिळाले नाही. Location ON करून पुन्हा प्रयत्न करा.';

    },

    {
      enableHighAccuracy:true,
      timeout:60000,
      maximumAge:0
    }

  );

}


g('gpsBtn').onclick=gps;

window.onload=()=>setTimeout(gps,1000);


/* =========================================
   PHOTO PREVIEW
========================================= */

g('photo').onchange=function(){

  const f=this.files[0];

  if(!f)return;

  const r=new FileReader();

  r.onload=e=>{

    g('preview').src=e.target.result;
    g('preview').style.display='block';

  };

  r.readAsDataURL(f);

};


/* =========================================
   ESCAPE HTML
========================================= */

const esc=x=>
  String(x||'')
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;');


const escapeHTML=esc;


/* =========================================
   GET FORM DATA
========================================= */

function data(){

  return{

    farmer:g('farmer').value.trim(),

    village:g('village').value,

    survey:g('survey').value.trim(),

    area:g('area').value.trim(),

    mobile:g('mobile').value.trim(),

    eCrop:g('eCrop').value,

    actualStatus:g('actualStatus').value,

    statementFarmer:
      g('statementFarmer').value.trim(),

    localStatement:
      g('localStatement').value.trim(),

    receiptChecked:
      g('receiptChecked').value,

    officer:
      g('officer').value.trim(),

    remark:
      g('remark').value.trim(),

    lat,
    lng,
    accuracy,

    verificationTime:dt()

  };

}


/* =========================================
   REPORT RESULT
========================================= */

function result(s){

  if(s==='ज्वारीचे पीक प्रत्यक्ष नाही'){

    return 'प्रत्यक्ष पाहणीमध्ये ज्वारीचे पीक आढळून आले नाही.';

  }

  if(
    s==='काढणी झालेले / अवशेष उपलब्ध' ||
    s==='पुढील चौकशी आवश्यक'
  ){

    return 'सदर प्रकरणात पुढील चौकशी / पडताळणी आवश्यक आहे.';

  }

  return 'प्रत्यक्ष पाहणीमध्ये ज्वारीचे पीक आढळून आले आहे.';

}


/* =========================================
   GET REPORT RESULT
========================================= */

function getReportResult(actualStatus){

  let text='';

  if(actualStatus==='ज्वारीचे पीक प्रत्यक्ष नाही'){

    text=
    'प्रत्यक्ष स्थळ पाहणी दरम्यान सदर शेतजमिनीमध्ये ज्वारीचे पीक प्रत्यक्ष आढळून आले नाही. त्यामुळे सदर प्रकरणाबाबत पुढील आवश्यक कार्यवाही करणे उचित राहील.';

  }

  else if(
    actualStatus==='काढणी झालेले / अवशेष उपलब्ध'
  ){

    text=
    'प्रत्यक्ष स्थळ पाहणी दरम्यान ज्वारी पिकाची काढणी झालेली असून पिकाचे अवशेष उपलब्ध असल्याचे निदर्शनास आले.';

  }

  else if(
    actualStatus==='पुढील चौकशी आवश्यक'
  ){

    text=
    'प्रत्यक्ष स्थळ पाहणीमध्ये उपलब्ध परिस्थितीनुसार सदर प्रकरणाबाबत अधिक तपशीलवार चौकशी व पुढील पडताळणी करणे आवश्यक आहे.';

  }

  else{

    text=
    'प्रत्यक्ष स्थळ पाहणी दरम्यान सदर शेतजमिनीमध्ये ज्वारीचे पीक प्रत्यक्ष अस्तित्वात असल्याचे निदर्शनास आले.';

  }

  return{
    text:text
  };

}


/* =========================================
   CREATE OFFICIAL REPORT HTML
========================================= */

function generateReportHTML(data) {

  const reportResult =
    getReportResult(
      data.actualStatus
    );

  const statementName =
    data.statementFarmer ||
    data.farmer ||
    '________________________';

  const latitude =
    data.lat !== '' &&
    data.lat !== null
      ? Number(data.lat).toFixed(6)
      : '-';

  const longitude =
    data.lng !== '' &&
    data.lng !== null
      ? Number(data.lng).toFixed(6)
      : '-';

  const gpsAccuracy =
    data.accuracy !== '' &&
    data.accuracy !== null
      ? Math.round(data.accuracy)+' मीटर'
      : '-';

  return `

    <div class="official-report">

      <div style="text-align:center;">

        <p>
          प्रति,
        </p>

        <p>
          मा. तहसीलदार साहेब,<br>
          तहसील कार्यालय, मोर्शी.
        </p>

        <h2>
          ज्वारी पीक प्रत्यक्ष पडताळणी अहवाल
        </h2>

      </div>


      <p>

        <b>विषय :-</b>
        मौजा ${escapeHTML(data.village)}
        येथील शेत सर्वे / गट क्रमांक
        ${escapeHTML(data.survey)}
        क्षेत्र
        ${escapeHTML(data.area || '-')}
        हे.आर. मधील ज्वारी पिकाच्या प्रत्यक्ष पडताळणीबाबत अहवाल.

      </p>


      <p>
        <b>महोदय,</b>
      </p>


      <p style="text-align:justify; line-height:1.8;">

        वरील विषयास अनुसरून कळविण्यात येते की,
        मौजा ${escapeHTML(data.village)}
        येथील शेत सर्वे / गट क्रमांक
        ${escapeHTML(data.survey)},
        क्षेत्र
        ${escapeHTML(data.area || '-')}
        हे.आर. या शेतजमिनीची प्रत्यक्ष स्थळ पाहणी करण्यात आली.

      </p>


      <p style="text-align:justify; line-height:1.8;">

        सदर शेतजमिनीबाबत ई-पीक पाहणीमध्ये
        "<b>${escapeHTML(data.eCrop)}</b>"
        अशी नोंद आढळून आली आहे.
        त्याअनुषंगाने प्रत्यक्ष स्थळ पाहणी करण्यात आली असता
        "<b>${escapeHTML(data.actualStatus)}</b>"
        अशी परिस्थिती निदर्शनास आली.

      </p>


      <p style="text-align:justify; line-height:1.8;">

        पाहणीदरम्यान संबंधित स्थळाची GPS आधारित नोंद घेण्यात आली
        असून त्याचा तपशील खालीलप्रमाणे आहे :

      </p>


      <table
        style="
          width:100%;
          border-collapse:collapse;
          margin:15px 0;
        ">

        <tr>
          <td style="border:1px solid #000; padding:8px;">
            <b>Latitude</b>
          </td>

          <td style="border:1px solid #000; padding:8px;">
            ${latitude}
          </td>
        </tr>

        <tr>
          <td style="border:1px solid #000; padding:8px;">
            <b>Longitude</b>
          </td>

          <td style="border:1px solid #000; padding:8px;">
            ${longitude}
          </td>
        </tr>

        <tr>
          <td style="border:1px solid #000; padding:8px;">
            <b>GPS Accuracy</b>
          </td>

          <td style="border:1px solid #000; padding:8px;">
            ${gpsAccuracy}
          </td>
        </tr>

        <tr>
          <td style="border:1px solid #000; padding:8px;">
            <b>पडताळणी दिनांक व वेळ</b>
          </td>

          <td style="border:1px solid #000; padding:8px;">
            ${escapeHTML(data.verificationTime)}
          </td>
        </tr>

      </table>


      <hr>


      <div style="text-align:center;">

        <h3>
          शेतकरी बयान / निवेदन
        </h3>

      </div>


      <p style="line-height:1.8;">

        मी, श्री./श्रीमती
        <b>${escapeHTML(statementName)}</b>,
        रा. ${escapeHTML(data.village)},
        याद्वारे असे बयान देतो / देते की :

      </p>


      <div class="farmer-statement"
        style="
          padding:15px;
          white-space:pre-wrap;
          line-height:1.8;
          text-align:justify;
          min-height:100px;
        ">

        ${escapeHTML(
          data.localStatement ||
          'शेतकऱ्याचे बयान उपलब्ध नाही.'
        )}

      </div>


      <p style="line-height:1.8;">

        वरील बयान माझ्या सांगण्याप्रमाणे लिहून घेण्यात आले असून
        ते वाचून / समजावून सांगितल्यानंतर मला मान्य आहे.

      </p>


      <br>


      <p>
        बयानाचा दिनांक :
        ________________________
      </p>


      <br><br>


      <div
        style="
          display:flex;
          justify-content:space-between;
          gap:30px;
        ">

        <div style="width:50%;">

          <p>
            बयान देणाऱ्या शेतकऱ्याचे नाव :
          </p>

          <p>
            <b>${escapeHTML(statementName)}</b>
          </p>

          <br><br>

          <p>
            स्वाक्षरी / अंगठा
          </p>

          <p>
            ___________________________
          </p>

        </div>

      </div>


      <hr>


      <div style="text-align:center;">

        <h3>
          साक्षीदार
        </h3>

      </div>


      <p>
        १) नाव :
        ______________________________
      </p>

      <p>
        स्वाक्षरी :
        ______________________________
      </p>


      <br>


      <p>
        २) नाव :
        ______________________________
      </p>

      <p>
        स्वाक्षरी :
        ______________________________
      </p>


      <hr>


      <div style="text-align:center;">

        <h3>
          पडताळणी निष्कर्ष
        </h3>

      </div>


      <p
        style="
          line-height:1.8;
          text-align:justify;
        ">

        ${reportResult.text}

      </p>


      ${data.receiptChecked ? `

        <p>

          <b>खत / बियाणे पावती पाहिली :-</b>

          ${escapeHTML(data.receiptChecked)}

        </p>

      ` : ''}


      ${data.remark ? `

        <p>

          <b>शेरा :-</b>

          ${escapeHTML(data.remark)}

        </p>

      ` : ''}


      <p
        style="
          line-height:1.8;
          text-align:justify;
        ">

        सबब, मौजा
        ${escapeHTML(data.village)}
        येथील शेत सर्वे / गट क्रमांक
        ${escapeHTML(data.survey)},
        क्षेत्र
        ${escapeHTML(data.area || '-')}
        हे.आर. मधील ज्वारी पिकाच्या प्रत्यक्ष पडताळणीचा अहवाल
        व संबंधित बयान मा. तहसीलदार साहेब यांच्या
        अवलोकनार्थ व पुढील आवश्यक कार्यवाहीस्तव सादर आहे.

      </p>


      <br><br>


      <div
        class="signature-area"
        style="
          display:flex;
          justify-content:space-between;
          align-items:flex-end;
        ">

        <div>

          <p>
            स्थळ : मोर्शी
          </p>

          <p>
            दिनांक : ${escapeHTML(data.verificationTime)}
          </p>

        </div>


        <div style="text-align:center;">

          <br><br><br>

          <p>
            (${escapeHTML(data.officer || '________________________')})
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


/* =========================================
   SHOW REPORT
========================================= */

function showReport(){

  if(!reportData){

    reportData=data();

  }

  g('reportContent').innerHTML=
    generateReportHTML(reportData);

  g('reportBox').style.display='block';

  g('reportBtn').style.display='none';

  g('editReportBtn').style.display='block';

  g('printBtn').style.display='block';

  g('newEntryBtn').style.display='block';

  g('reportBox').scrollIntoView({
    behavior:'smooth'
  });

}


/* =========================================
   CREATE REPORT BUTTON
========================================= */

g('reportBtn').onclick=()=>{

  reportData=data();

  showReport();

};


/* =========================================
   EDIT REPORT
========================================= */

g('editReportBtn').onclick=()=>{

  g('reportEditor').value=
    g('reportContent').innerText;

  g('reportContent').style.display='none';

  g('reportEditor').style.display='block';

  g('editReportBtn').style.display='none';

  g('saveReportBtn').style.display='block';

  g('printBtn').style.display='none';

};


/* =========================================
   SAVE EDITED REPORT
========================================= */

g('saveReportBtn').onclick=()=>{

  const t=
    g('reportEditor').value.trim();

  if(!t){

    return msg(
      '⚠️ अहवाल रिकामा ठेवू शकत नाही.',
      'error'
    );

  }

  g('reportContent').innerHTML=
    '<div class="edited-report">'+
    esc(t).replace(/\n/g,'<br>')+
    '</div>';

  g('reportContent').style.display='block';

  g('reportEditor').style.display='none';

  g('saveReportBtn').style.display='none';

  g('editReportBtn').style.display='block';

  g('printBtn').style.display='block';

};


/* =========================================
   SUBMIT DATA
========================================= */

g('submitBtn').onclick=async()=>{

  const d=data();

  const need=[];


  if(!d.farmer)
    need.push('शेतकऱ्याचे नाव');

  if(!d.village)
    need.push('गाव');

  if(!d.survey)
    need.push('गट / सर्वे नंबर');

  if(!d.eCrop)
    need.push('ई-पीक नोंद');

  if(!d.actualStatus)
    need.push('प्रत्यक्ष पाहणीतील स्थिती');

  if(!g('photo').files[0])
    need.push('प्रत्यक्ष फोटो');

  if(!lat||!lng)
    need.push('GPS Location');

  if(
    d.mobile &&
    !/^[0-9]{10}$/.test(d.mobile)
  )
    need.push('योग्य 10 अंकी मोबाईल नंबर');


  if(need.length){

    return msg(

      '⚠️ खालील माहिती आवश्यक आहे:<br><br>'+
      need.map(x=>'❌ '+x).join('<br>'),

      'error'

    );

  }


  const b=g('submitBtn');

  b.disabled=true;

  b.innerHTML='⏳ माहिती साठवत आहे...';


  try{

    const f=
      g('photo').files[0];

    const r=
      new FileReader();


    const base64=
      await new Promise((ok,no)=>{

        r.onload=e=>
          ok(
            e.target.result.split(',')[1]
          );

        r.onerror=no;

        r.readAsDataURL(f);

      });


    await fetch(

      URL,

      {

        method:'POST',

        mode:'no-cors',

        headers:{

          'Content-Type':
          'text/plain;charset=utf-8'

        },

        body:JSON.stringify({

          ...d,

          gpsTimestamp,

          capturedAt:
            new Date().toISOString(),

          fileName:
            'JWARI_'+Date.now()+'.jpg',

          mimeType:
            f.type,

          imageBase64:
            base64

        })

      }

    );


    reportData=d;


    msg(
      '✅ <b>माहिती यशस्वीरित्या साठविण्यात आली!</b>',
      'success'
    );


    showReport();


  }

  catch(e){

    console.error(e);

    msg(
      '❌ माहिती साठविताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.',
      'error'
    );

  }

  finally{

    b.disabled=false;

    b.innerHTML=
      '✅ माहिती Submit करा';

  }

};


/* =========================================
   PRINT
========================================= */

g('printBtn').onclick=()=>window.print();


/* =========================================
   NEW ENTRY
========================================= */

g('newEntryBtn').onclick=()=>{

  if(
    confirm(
      'नवीन नोंद सुरू करायची आहे का?'
    )
  ){

    location.reload();

  }

};
