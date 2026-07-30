/**
 * Google Apps Script：部署為「網頁應用程式」後，將網址貼到 index.html 的 CONTACT_GMAIL_WEB_APP_URL。
 * 部署：執行身分 = 我；具有存取權的使用者 = 任何人（含匿名）。
 * 寄件會使用您登入 Google 的帳號（Gmail / Google Workspace）。
 */
const CONTACT_INBOX = 'chenchengtech.co@gmail.com';

function doPost(e) {
  try {
    var p = e.parameter;
    var name = (p.name || '').toString().trim();
    var company = (p.company || '').toString().trim();
    var email = (p.email || '').toString().trim();
    var topic = (p.topic || '').toString().trim();
    var message = (p.message || '').toString().trim();
    // 宸護 chencare_v2 草稿頁的「預約系統展示」表單額外欄位（皆為選填，舊表單不受影響）
    var phone = (p.phone || '').toString().trim();
    var industry = (p.industry || '').toString().trim();
    var headcount = (p.headcount || '').toString().trim();
    var hasNurse = (p.hasNurse || '').toString().trim();
    var currentTool = (p.currentTool || '').toString().trim();
    var interestedFeature = (p.interestedFeature || '').toString().trim();

    if (!name || !company || !email) {
      return jsonOut({ ok: false, error: 'missing fields' });
    }

    var subject = '【宸誠官網諮詢】' + company + ' — ' + name;
    var lines = [
      '姓名：' + name,
      '公司：' + company,
      'Email：' + email,
    ];
    if (phone) lines.push('電話：' + phone);
    if (industry) lines.push('產業類別：' + industry);
    if (headcount) lines.push('員工人數：' + headcount);
    if (hasNurse) lines.push('是否已有專任職護：' + hasNurse);
    if (currentTool) lines.push('目前使用方式：' + currentTool);
    if (interestedFeature) lines.push('最想了解的功能：' + interestedFeature);
    lines.push('詢問項目：' + (topic || '（未選）'));
    lines.push('');
    lines.push('留言：');
    lines.push(message || '（無）');

    MailApp.sendEmail({
      to: CONTACT_INBOX,
      subject: subject,
      body: lines.join('\n'),
      replyTo: email,
    });

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
