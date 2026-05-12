// ─── Swayam Feedback Collector — Google Apps Script ───────────────────────────
//
// SETUP STEPS:
// 1. Open your Google Sheet
// 2. Go to Extensions → Apps Script
// 3. Replace everything in Code.gs with this file
// 4. Click Save, then Deploy → New deployment
//    - Type: Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Click Deploy → Copy the Web App URL
// 6. Paste that URL into FeedbackWidget.jsx → APPS_SCRIPT_URL constant
//
// SHEET COLUMNS (add these as Row 1 headers):
// Timestamp | Business Type | Business Type ID | Production Mode |
// Delivery Type | Delivery Partner | Pay Later | Onboarding Complete |
// Rating | Liked | Improve | Name | Contact
// ─────────────────────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
    // Support both JSON body and URL-encoded form with 'data' param
    let data
    if (e.postData.type === 'application/x-www-form-urlencoded' && e.parameter.data) {
      data = JSON.parse(e.parameter.data)
    } else {
      data = JSON.parse(e.postData.contents)
    }

    // Write headers if this is the first row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Business Type', 'Business Type ID', 'Production Mode',
        'Delivery Type', 'Delivery Partner', 'Pay Later Enabled', 'Onboarding Complete',
        'Rating', 'What They Liked', 'What to Improve', 'Respondent Name', 'Contact'
      ])
      // Style header row
      const headerRange = sheet.getRange(1, 1, 1, 13)
      headerRange.setFontWeight('bold')
      headerRange.setBackground('#243928')
      headerRange.setFontColor('#ffffff')
    }

    // Append response row
    sheet.appendRow([
      data.timestamp          || new Date().toISOString(),
      data.businessType       || '',
      data.businessTypeId     || '',
      data.isPerishable       || '',
      data.deliveryType       || '',
      data.deliveryPartner    || '',
      data.payLaterEnabled    || '',
      data.onboardingComplete || '',
      data.rating             || '',
      data.liked              || '',
      data.improve            || '',
      data.respondentName     || '',
      data.respondentContact  || '',
    ])

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

// Test function — run this from the Apps Script editor to verify
function testPost() {
  const mock = {
    postData: {
      contents: JSON.stringify({
        timestamp:          new Date().toISOString(),
        businessType:       'Home Baker',
        businessTypeId:     'baker',
        isPerishable:       'Fresh daily',
        deliveryType:       'Delivery partner',
        deliveryPartner:    'Dunzo Business',
        payLaterEnabled:    'Yes',
        onboardingComplete: 'Yes',
        rating:             5,
        liked:              'The daily drop flow is really intuitive',
        improve:            'Would love bulk order support',
        respondentName:     'Test User',
        respondentContact:  '9999999999',
      })
    }
  }
  Logger.log(doPost(mock).getContent())
}
