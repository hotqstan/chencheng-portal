const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

if (nav && navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const tabs = document.querySelector("[data-tabs]");

if (tabs) {
  const tabButtons = tabs.querySelectorAll("[data-tab]");
  const tabPanels = tabs.querySelectorAll("[data-panel]");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-tab");

      tabButtons.forEach((item) => {
        item.setAttribute("aria-selected", String(item === button));
      });

      tabPanels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.getAttribute("data-panel") === target);
      });
    });
  });
}

// 動態版權年份
const footerYear = document.getElementById("footer-year");
if (footerYear) {
  footerYear.textContent = `© ${new Date().getFullYear()} 宸護. All rights reserved.`;
}

// 預約系統展示表單：透過 Google Apps Script Web App 以 Gmail 寄出（與 chencheng-portal 共用同一部署與信箱）
const CONTACT_GMAIL_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyWVvcsukxD0FDGqWP-DTjpXX7TYlci0Ey7HI1EfQB7tQLN3QoWBU22Ttt1FXOgB58/exec";
const CONTACT_MAILTO = "chenchengtech.co@gmail.com";

async function postLeadToGmailAppsScript(params) {
  const body = new URLSearchParams(params);

  try {
    const res = await fetch(CONTACT_GMAIL_WEB_APP_URL, { method: "POST", body });
    if (res.ok) {
      try {
        const json = JSON.parse(await res.text());
        if (json && json.ok) return true;
      } catch (_) {
        // Apps Script 常無法讀取跨網域回應內容，改以下方 no-cors 送出判斷
      }
    }
  } catch (_) {
    // 忽略，改以 no-cors 重試
  }

  try {
    await fetch(CONTACT_GMAIL_WEB_APP_URL, { method: "POST", body, mode: "no-cors" });
    return true;
  } catch (_) {
    return false;
  }
}

const leadForm = document.querySelector("[data-lead-form]");
const leadStatus = document.querySelector("[data-lead-status]");

if (leadForm && leadStatus) {
  const submitButton = leadForm.querySelector('button[type="submit"]');
  const submitDefaultLabel = submitButton ? submitButton.textContent : "";

  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "送出中…";
    }

    const ok = await postLeadToGmailAppsScript({
      name: (formData.get("name") || "").toString().trim(),
      company: (formData.get("company") || "").toString().trim(),
      email: (formData.get("email") || "").toString().trim(),
      phone: (formData.get("phone") || "").toString().trim(),
      industry: (formData.get("industry") || "").toString().trim(),
      headcount: (formData.get("headcount") || "").toString().trim(),
      hasNurse: (formData.get("hasNurse") || "").toString().trim(),
      currentTool: (formData.get("currentTool") || "").toString().trim(),
      interestedFeature: (formData.get("interestedFeature") || "").toString().trim(),
      topic: "[宸護 v2 草稿頁] 預約系統展示",
    });

    leadStatus.removeAttribute("hidden");
    leadStatus.textContent = ok
      ? "已收到您的資料，我們會盡快與您聯繫安排系統展示！"
      : `送出失敗，請直接寄信至 ${CONTACT_MAILTO} 與我們聯繫。`;

    if (ok) {
      leadForm.reset();
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = submitDefaultLabel;
    }
  });
}