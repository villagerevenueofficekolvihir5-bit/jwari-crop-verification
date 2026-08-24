// =========================================
// CONFIGURATION
// =========================================
const URL = 'https://script.google.com/macros/s/AKfycbxf-DeTDrNmtqrALOv3MskWyIQZJjJUgKqPCAy5I_L9o8gydxsMdMqbpW-0FH2bSFKH/exec';

let lat='', lng='', accuracy='', gpsTimestamp='', reportData=null;

const g = id => document.getElementById(id);

function getDateTime(){
  return new Date().toLocaleString('en-GB',{
    day:'2-digit',month:'2-digit',year:'numeric',
    hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false
  });
}

function escapeHTML(x){
  return String(x ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function msg(text,type=''){
  g('msg').className=type;
  g('msg').innerHTML=text;
  g('msg').style.display=text?'block':'none';
}

// =========================================
// GPS
// =========================================
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
        🕒 वेळ: ${getDateTime()}`;
    },
    ()=>{
      g('gps').innerHTML='❌ GPS Location मिळाले नाही. Location ON करून पुन्हा प्रयत्न करा.';
    },
    {enableHighAccuracy:true,timeout:60000,maximumAge:0}
  );
}

g('gpsBtn').onclick=gps;
window.addEventListener('load',()=>setTimeout(gps,1000));

// =========================================
// IMAGE PREVIEW
// =========================================
function previewFile(inputId,previewId){
  const file=g(inputId).files[0];
  if(!file)return;

  const reader=new FileReader();
  reader.onload=e=>{
    g(previewId).src=e.target.result;
    g(previewId).style.display='block';
  };
  reader.readAsDataURL(file);
}

g('photo').onchange=()=>previewFile('photo','preview');

g('receiptChecked').onchange=function(){
  g('receiptPhotoGroup').style.display=
    this.value==='होय'?'block':'none';
};

g('receiptPhoto').onchange=()=>previewFile('receiptPhoto','receiptPreview');

// =========================================
// DEFAULT STATEMENTS
// बयान देणारी व्यक्ती वेगळी असू शकते.
// =========================================
function updateDefaultStatement(){
  const type=g('statementType').value;
  const statementPerson=g('statementFarmer').value.trim() || '[बयान देणाऱ्या व्यक्तीचे नाव]';
  const farmer=g('farmer').value.trim() || '[शेतकऱ्याचे नाव]';
  const village=g('village').value || '[गाव]';
  const survey=g('survey').value.trim() || '[सर्वे / गट क्रमांक]';

  if(type==='cropYes'){
    g('localStatement').value=
      `मी, श्री./श्रीमती ${statementPerson}, रा. ${village}, याद्वारे असे बयान देतो / देते की, श्री./श्रीमती ${farmer} यांनी त्यांच्या मौजा ${village} येथील शेत सर्वे / गट क्रमांक ${survey} मध्ये ज्वारी पिकाची लागवड केलेली आहे. सदर शेतामध्ये ज्वारीचे पीक प्रत्यक्ष पाहिले आहे. सदर शेतामध्ये असलेले पीक ज्वारीचेच असल्याबाबत माझे बयान आहे.`;
  }

  if(type==='cropNo'){
    g('localStatement').value=
      `मी, श्री./श्रीमती ${statementPerson}, रा. ${village}, याद्वारे असे बयान देतो / देते की, श्री./श्रीमती ${farmer} यांनी त्यांच्या मौजा ${village} येथील शेत सर्वे / गट क्रमांक ${survey} मध्ये ज्वारी पिकाची लागवड केलेली नव्हती. सदर शेतामध्ये ज्वारीचे पीक प्रत्यक्ष दिसून आले नाही. सदर शेतामध्ये ज्वारीचे पीक नसल्याबाबत माझे बयान आहे.`;
  }
}

['statementType','statementFarmer','farmer','village','survey']
.forEach(id=>g(id).addEventListener('change',()=>{
  if(g('statementType').value)updateDefaultStatement();
}));

// =========================================
// FILE TO BASE64
// =========================================
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    if(!file)return resolve('');
    const reader=new FileReader();
    reader.onload=e=>resolve(e.target.result.split(',')[1]);
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

// =========================================
// CREATE REPORT DATA
// =========================================
function createReportData(){
  return {
    reportId:'JWARI-'+Date.now(),
    farmer:g('farmer').value.trim(),
    village:g('village').value,
    survey:g('survey').value.trim(),
    area:g('area').value.trim(),
    mobile:g('mobile').value.trim(),
    eCrop:g('eCrop').value,
    actualStatus:g('actualStatus').value,
    statementType:g('statementType').value,
    statementFarmer:g('statementFarmer').value.trim(),
    localStatement:g('localStatement').value.trim(),
    statementDate:g('statementDate').value,
    witness1:g('witness1').value.trim(),
    witness2:g('witness2').value.trim(),
    receiptChecked:g('receiptChecked').value,
    officer:g('officer').value.trim(),
    remark:g('remark').value.trim(),
    lat,lng,accuracy,gpsTimestamp,
    verificationTime:getDateTime()
  };
}

function getReportResult(status){
  if(status==='ज्वारीचे पीक प्रत्यक्ष नाही'){
    return {
      className:'report-error',
      conclusion:'प्रत्यक्ष स्थळ पाहणीदरम्यान सदर शेतजमिनीमध्ये ज्वारीचे पीक आढळून आले नाही.'
    };
  }

  if(status==='काढणी झालेले / अवशेष उपलब्ध'){
    return {
      className:'report-warning',
      conclusion:'प्रत्यक्ष स्थळ पाहणीदरम्यान ज्वारीचे पीक काढणी झालेले असून पिकाचे अवशेष उपलब्ध असल्याचे निदर्शनास आले.'
    };
  }

  if(status==='पुढील चौकशी आवश्यक'){
    return {
      className:'report-warning',
      conclusion:'प्रत्यक्ष स्थळ पाहणीदरम्यान उपलब्ध परिस्थितीनुसार सदर प्रकरणात पुढील चौकशी व पडताळणी करणे आवश्यक आहे.'
    };
  }

  return {
    className:'report-success',
    conclusion:'प्रत्यक्ष स्थळ पाहणीदरम्यान सदर शेतजमिनीमध्ये ज्वारीचे पीक असल्याचे निदर्शनास आले.'
  };
}

function coordinate(v){
  const n=Number(v);
  return Number.isFinite(n)?n.toFixed(6):'-';
}

function accuracyText(v){
  const n=Number(v);
  return Number.isFinite(n)?Math.round(n):'-';
}

// =========================================
// GENERATE INDIVIDUAL REPORT
// =========================================
function generateReportHTML(data){
  const result=getReportResult(data.actualStatus);
  const statementPerson=data.statementFarmer || '________________________';
  const statementDate=data.statementDate || '________________';
  const witness1=data.witness1 || '________________________';
  const witness2=data.witness2 || '________________________';

  return `
  <div class="official-report">

    <div style="text-align:center;">
      <p>प्रति,</p>
      <p>मा. तहसीलदार साहेब,<br>तहसील कार्यालय, मोर्शी.</p>
      <h2>ज्वारी पीक प्रत्यक्ष पडताळणी अहवाल</h2>
    </div>

    <p><b>विषय :-</b> मौजा ${escapeHTML(data.village)} येथील शेत सर्वे / गट क्रमांक ${escapeHTML(data.survey)}, क्षेत्र ${escapeHTML(data.area||'-')} हे.आर. मधील ज्वारी पिकाच्या प्रत्यक्ष पडताळणीबाबत अहवाल.</p>

    <p><b>महोदय,</b></p>

    <p style="text-align:justify;">वरील विषयास अनुसरून कळविण्यात येते की, मौजा ${escapeHTML(data.village)} येथील शेत सर्वे / गट क्रमांक ${escapeHTML(data.survey)}, क्षेत्र ${escapeHTML(data.area||'-')} हे.आर. या शेतजमिनीची प्रत्यक्ष स्थळ पाहणी करण्यात आली.</p>

    <p style="text-align:justify;">सदर शेतजमिनीबाबत ई-पीक पाहणीमध्ये "<b>${escapeHTML(data.eCrop)}</b>" अशी नोंद आढळून आली आहे. त्याअनुषंगाने प्रत्यक्ष स्थळ पाहणी करण्यात आली असता "<b>${escapeHTML(data.actualStatus)}</b>" अशी परिस्थिती निदर्शनास आली.</p>

    <p>पाहणीदरम्यान संबंधित स्थळाची GPS आधारित नोंद घेण्यात आली असून त्याचा तपशील खालीलप्रमाणे आहे :</p>

    <table class="report-table">
      <tr><td><b>Latitude</b></td><td>${coordinate(data.lat)}</td></tr>
      <tr><td><b>Longitude</b></td><td>${coordinate(data.lng)}</td></tr>
      <tr><td><b>GPS Accuracy</b></td><td>${accuracyText(data.accuracy)} मीटर</td></tr>
      <tr><td><b>पडताळणी दिनांक व वेळ</b></td><td>${escapeHTML(data.verificationTime)}</td></tr>
    </table>

    <hr>

    <h3 style="text-align:center;">शेतकरी बयान / निवेदन</h3>

    <p>मी, श्री./श्रीमती <b>${escapeHTML(statementPerson)}</b>, रा. ${escapeHTML(data.village)}, याद्वारे असे बयान देतो / देते की :</p>

    <p class="farmer-statement" style="padding:12px;white-space:pre-wrap;line-height:1.8;text-align:justify;">${escapeHTML(data.localStatement || 'बयान उपलब्ध नाही.')}</p>

    <p>वरील बयान माझ्या सांगण्याप्रमाणे लिहून घेण्यात आले असून ते वाचून / समजावून सांगितल्यानंतर मला मान्य आहे.</p>

    <p><b>बयानाचा दिनांक :</b> ${escapeHTML(statementDate)}</p>

    <div class="signature-area">
      <p><b>बयान देणाऱ्या व्यक्तीचे नाव :</b> ${escapeHTML(statementPerson)}</p>
      <br><br>
      <p>स्वाक्षरी / अंगठा : ___________________________</p>
    </div>

    <hr>

    <h3 style="text-align:center;">साक्षीदार</h3>
    <p>१) नाव : ${escapeHTML(witness1)}<br><br>&nbsp;&nbsp;&nbsp; स्वाक्षरी : ___________________________</p>
    <p>२) नाव : ${escapeHTML(witness2)}<br><br>&nbsp;&nbsp;&nbsp; स्वाक्षरी : ___________________________</p>

    <hr>

    <h3 style="text-align:center;">पडताळणी निष्कर्ष</h3>

    <div class="report-result">${escapeHTML(result.conclusion)}</div>

    ${data.remark?`<p><b>शेरा :-</b> ${escapeHTML(data.remark)}</p>`:''}

    <p style="text-align:justify;">सबब, मौजा ${escapeHTML(data.village)} येथील शेत सर्वे / गट क्रमांक ${escapeHTML(data.survey)}, क्षेत्र ${escapeHTML(data.area||'-')} हे.आर. मधील ज्वारी पिकाच्या प्रत्यक्ष पडताळणीचा अहवाल व संबंधित व्यक्तीचे बयान मा. तहसीलदार साहेब यांच्या अवलोकनार्थ व पुढील आवश्यक कार्यवाहीस्तव सादर आहे.</p>

    <div style="display:flex;justify-content:space-between;gap:30px;margin-top:50px;">
      <div>
        <p>स्थळ : मोर्शी</p>
        <p>दिनांक : ${escapeHTML(data.verificationTime)}</p>
      </div>
      <div style="text-align:center;">
        <p>(${escapeHTML(data.officer || '________________________')})</p>
        <p>पडताळणी अधिकारी<br>ग्राम महसूल अधिकारी</p>
      </div>
    </div>

  </div>`;
}

function showReport(){
  if(!reportData)reportData=createReportData();

  const result=getReportResult(reportData.actualStatus);
  g('reportBox').className='report-box '+result.className;
  g('reportContent').innerHTML=generateReportHTML(reportData);
  g('reportContent').style.display='block';
  g('reportEditor').style.display='none';

  g('reportBox').style.display='block';
  g('editReportBtn').style.display='block';
  g('printBtn').style.display='block';
  g('uploadSignedBtn').style.display='block';
  g('newEntryBtn').style.display='block';
  g('reportBox').scrollIntoView({behavior:'smooth',block:'start'});
}

g('reportBtn').onclick=()=>{
  reportData=createReportData();
  showReport();
};

g('editReportBtn').onclick=()=>{
  g('reportEditor').value=g('reportContent').innerText;
  g('reportContent').style.display='none';
  g('reportEditor').style.display='block';
  g('editReportBtn').style.display='none';
  g('saveReportBtn').style.display='block';
  g('printBtn').style.display='none';
};

g('saveReportBtn').onclick=()=>{
  const t=g('reportEditor').value.trim();
  if(!t)return msg('⚠️ अहवाल रिकामा ठेवू शकत नाही.','error');

  g('reportContent').innerHTML='<div class="edited-report">'+escapeHTML(t).replace(/\n/g,'<br>')+'</div>';
  g('reportContent').style.display='block';
  g('reportEditor').style.display='none';
  g('saveReportBtn').style.display='none';
  g('editReportBtn').style.display='block';
  g('printBtn').style.display='block';
};

g('printBtn').onclick=()=>window.print();

// =========================================
// SUBMIT RECORD
// =========================================
g('submitBtn').onclick=async()=>{
  const d=createReportData();
  const need=[];

  if(!d.farmer)need.push('शेतकऱ्याचे नाव');
  if(!d.village)need.push('गाव');
  if(!d.survey)need.push('गट / सर्वे नंबर');
  if(!d.eCrop)need.push('ई-पीक नोंद');
  if(!d.actualStatus)need.push('प्रत्यक्ष पाहणीतील स्थिती');
  if(!g('photo').files[0])need.push('प्रत्यक्ष फोटो');
  if(!lat || !lng)need.push('GPS Location');

  if(d.mobile && !/^[0-9]{10}$/.test(d.mobile)){
    need.push('योग्य 10 अंकी मोबाईल नंबर');
  }

  if(need.length){
    return msg('⚠️ खालील माहिती आवश्यक आहे:<br><br>'+need.map(x=>'❌ '+x).join('<br>'),'error');
  }

  const button=g('submitBtn');
  button.disabled=true;
  button.innerHTML='⏳ माहिती साठवत आहे...';

  try{
    const photo=g('photo').files[0];
    const receipt=g('receiptPhoto').files[0];

    const imageBase64=await fileToBase64(photo);
    const receiptBase64=await fileToBase64(receipt);

    const payload={
      action:'save',
      ...d,
      capturedAt:new Date().toISOString(),
      fileName:'JWARI_'+Date.now()+'.jpg',
      mimeType:photo.type,
      imageBase64,
      receiptFileName:receipt?('RECEIPT_'+Date.now()+'.'+receipt.name.split('.').pop()):'',
      receiptMimeType:receipt?receipt.type:'',
      receiptBase64
    };

    if(URL.startsWith('PASTE_')){
      throw new Error('Google Apps Script URL टाकलेली नाही.');
    }

    await fetch(URL,{
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify(payload)
    });

    reportData=d;
    msg(`✅ <b>माहिती यशस्वीरित्या साठविण्यात आली!</b><br>Report ID: ${escapeHTML(d.reportId)}`,'success');
    showReport();
  }catch(e){
    console.error(e);
    msg('❌ माहिती साठविताना त्रुटी आली: '+escapeHTML(e.message),'error');
  }finally{
    button.disabled=false;
    button.innerHTML='✅ माहिती Submit करा';
  }
};

// =========================================
// SIGNED REPORT UPLOAD
// =========================================
async function uploadSignedReport(){
  const file=g('signedReport').files[0];

  if(!file){
    return msg('⚠️ सही केलेला Report / फोटो निवडा.','error');
  }

  if(!reportData){
    return msg('⚠️ प्रथम शेतकऱ्याची नोंद Submit करा.','error');
  }

  try{
    if(URL.startsWith('PASTE_'))throw new Error('Google Apps Script URL टाकलेली नाही.');

    const base64=await fileToBase64(file);

    await fetch(URL,{
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({
        action:'uploadSigned',
        reportId:reportData.reportId,
        farmer:reportData.farmer,
        village:reportData.village,
        survey:reportData.survey,
        signedFileName:file.name,
        signedMimeType:file.type,
        signedBase64:base64
      })
    });

    msg('✅ सही केलेला अहवाल Digital Record म्हणून Upload करण्यात आला.','success');
  }catch(e){
    msg('❌ Signed Report Upload करताना त्रुटी आली: '+escapeHTML(e.message),'error');
  }
}

g('uploadSignedBtn').onclick=uploadSignedReport;

// =========================================
// COMBINED REPORT
// Local list + Apps Script data when available
// =========================================
function localRecords(){
  try{return JSON.parse(localStorage.getItem('jwariRecords')||'[]');}
  catch(e){return [];}
}

function saveLocalRecord(d){
  const records=localRecords();
  records.unshift(d);
  localStorage.setItem('jwariRecords',JSON.stringify(records.slice(0,1000)));
}

function renderCombined(records,village){
  const list=village?records.filter(r=>r.village===village):records;

  if(!list.length){
    g('combinedReportBox').style.display='block';
    g('combinedReportBox').innerHTML='<b>या निवडीसाठी कोणतीही नोंद उपलब्ध नाही.</b>';
    return;
  }

  const title=village?`${village} गावाचा एकत्रित अहवाल`:'सर्व गावांचा एकत्रित अहवाल';

  g('combinedReportBox').style.display='block';
  g('combinedReportBox').innerHTML=`
    <h3>${escapeHTML(title)}</h3>
    <p><b>एकूण शेतकरी नोंदी :</b> ${list.length}</p>
    <div style="overflow-x:auto;">
    <table class="combined-table">
      <thead>
        <tr>
          <th>अ.क्र.</th>
          <th>शेतकरी</th>
          <th>गाव</th>
          <th>सर्वे नं.</th>
          <th>स्थिती</th>
          <th>दिनांक</th>
        </tr>
      </thead>
      <tbody>
      ${list.map((r,i)=>`
        <tr>
          <td>${i+1}</td>
          <td>${escapeHTML(r.farmer)}</td>
          <td>${escapeHTML(r.village)}</td>
          <td>${escapeHTML(r.survey)}</td>
          <td>${escapeHTML(r.actualStatus)}</td>
          <td>${escapeHTML(r.verificationTime||'-')}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    </div>
    <button type="button" onclick="downloadCombinedCSV()">⬇️ CSV Download</button>`;
}

g('combinedReportBtn').onclick=()=>{
  renderCombined(localRecords(),g('reportVillage').value);
};

function downloadCombinedCSV(){
  const village=g('reportVillage').value;
  const records=localRecords().filter(r=>!village || r.village===village);

  const rows=[
    ['अ.क्र.','Report ID','शेतकऱ्याचे नाव','गाव','सर्वे नंबर','क्षेत्र','ई-पीक','प्रत्यक्ष स्थिती','दिनांक'],
    ...records.map((r,i)=>[
      i+1,r.reportId,r.farmer,r.village,r.survey,r.area,r.eCrop,r.actualStatus,r.verificationTime
    ])
  ];

  const csv='\ufeff'+rows.map(row=>row.map(x=>`"${String(x??'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='Jwari_Combined_Report.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

// =========================================
// SEARCH LOCAL RECORDS
// =========================================
g('searchBtn').onclick=()=>{
  const q=g('searchRecord').value.trim().toLowerCase();

  if(!q)return msg('⚠️ शोधण्यासाठी Report ID / नाव / सर्वे नंबर लिहा.','error');

  const found=localRecords().filter(r=>
    [r.reportId,r.farmer,r.village,r.survey]
      .some(v=>String(v||'').toLowerCase().includes(q))
  );

  g('searchResults').innerHTML=found.length
    ?found.map(r=>`
      <div class="search-card">
        <b>${escapeHTML(r.farmer)}</b><br>
        गाव: ${escapeHTML(r.village)} | सर्वे: ${escapeHTML(r.survey)}<br>
        Report ID: ${escapeHTML(r.reportId)}<br>
        स्थिती: ${escapeHTML(r.actualStatus)}<br>
        <button type="button" onclick="openLocalReport('${r.reportId}')">📄 अहवाल उघडा</button>
      </div>`).join('')
    :'<div class="search-card">कोणतीही नोंद सापडली नाही.</div>';
};

function openLocalReport(id){
  const r=localRecords().find(x=>x.reportId===id);
  if(!r)return;
  reportData=r;
  showReport();
}

// Save local record immediately after successful submission by wrapping message state
const originalShowReport=showReport;
function persistCurrentReport(){
  if(reportData){
    const records=localRecords();
    const exists=records.some(r=>r.reportId===reportData.reportId);
    if(!exists)saveLocalRecord(reportData);
  }
}
showReport=function(){
  persistCurrentReport();
  originalShowReport();
};

g('newEntryBtn').onclick=()=>{
  if(confirm('नवीन नोंद सुरू करायची आहे का?'))location.reload();
};
