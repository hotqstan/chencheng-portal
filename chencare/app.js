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

// 上線通知表單：透過 Google Apps Script Web App 以 Gmail 寄出（與 chencheng-portal 共用同一部署與信箱）
const CONTACT_GMAIL_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyWVvcsukxD0FDGqWP-DTjpXX7TYlci0Ey7HI1EfQB7tQLN3QoWBU22Ttt1FXOgB58/exec";
const CONTACT_MAILTO = "chenchengtech.co@gmail.com";

async function postNotifyToGmailAppsScript(data) {
  const params = new URLSearchParams({
    name: "（尚未提供）",
    company: "（尚未提供）",
    email: data.email,
    topic: "[宸護上線通知] 訂閱上線通知",
    message: `使用者留下 Email 訂閱宸護上線通知：${data.email}`,
  });

  try {
    const res = await fetch(CONTACT_GMAIL_WEB_APP_URL, { method: "POST", body: params });
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
    await fetch(CONTACT_GMAIL_WEB_APP_URL, { method: "POST", body: params, mode: "no-cors" });
    return true;
  } catch (_) {
    return false;
  }
}

const notifyForm = document.querySelector("[data-notify-form]");
const notifyStatus = document.querySelector("[data-notify-status]");

if (notifyForm && notifyStatus) {
  const submitButton = notifyForm.querySelector('button[type="submit"]');
  const submitDefaultLabel = submitButton ? submitButton.textContent : "";

  notifyForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(notifyForm);
    const email = (formData.get("email") || "").toString().trim();

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "送出中…";
    }

    const ok = await postNotifyToGmailAppsScript({ email });

    notifyStatus.removeAttribute("hidden");
    notifyStatus.textContent = ok
      ? "感謝留下 Email，宸護正式上線時會通知你！"
      : `送出失敗，請直接寄信至 ${CONTACT_MAILTO} 通知我們。`;

    if (ok) {
      notifyForm.reset();
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = submitDefaultLabel;
    }
  });
}