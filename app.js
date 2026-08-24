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
    '________________________';

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
            ${Number(data.lat).toFixed(6)}
          </td>
        </tr>

        <tr>
          <td style="border:1px solid #000; padding:8px;">
            <b>Longitude</b>
          </td>

          <td style="border:1px solid #000; padding:8px;">
            ${Number(data.lng).toFixed(6)}
          </td>
        </tr>

        <tr>
          <td style="border:1px solid #000; padding:8px;">
            <b>GPS Accuracy</b>
          </td>

          <td style="border:1px solid #000; padding:8px;">
            ${Math.round(data.accuracy)} मीटर
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


      <p
        style="
          white-space:pre-wrap;
          line-height:1.8;
          text-align:justify;
        ">

        ${escapeHTML(
          data.localStatement ||
          'शेतकऱ्याचे बयान उपलब्ध नाही.'
        )}

      </p>


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
            बयान देणाऱ्याचे नाव :
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

        ${result.text}

      </p>


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
