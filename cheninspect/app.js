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
  footerYear.textContent = `© ${new Date().getFullYear()} ChenInspect. All rights reserved.`;
}

const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");

// 「預約 Demo」等 CTA：點擊時預選聯絡表單的議題欄位
const topicPrefillLinks = document.querySelectorAll("[data-topic-select]");
if (contactForm && topicPrefillLinks.length) {
  const topicSelect = contactForm.querySelector('select[name="topic"]');
  topicPrefillLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (topicSelect) {
        topicSelect.value = link.getAttribute("data-topic-select");
      }
    });
  });
}

// 聯絡表單：透過 Google Apps Script Web App 以 Gmail 寄出（與 chencheng-portal 共用同一部署與信箱）
const CONTACT_GMAIL_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyWVvcsukxD0FDGqWP-DTjpXX7TYlci0Ey7HI1EfQB7tQLN3QoWBU22Ttt1FXOgB58/exec";
const CONTACT_MAILTO = "chenchengtech.co@gmail.com";

function buildContactMessage(data) {
  return [
    `職稱/部門：${data.role || "（未填）"}`,
    `聯絡電話：${data.phone || "（未填）"}`,
    `公司人數：${data.size || "（未填）"}`,
    "",
    "備註：",
    data.message || "（無）",
  ].join("\n");
}

async function postContactToGmailAppsScript(data) {
  const params = new URLSearchParams({
    name: data.name,
    company: data.company,
    email: data.email,
    topic: `[宸鑑諮詢] ${data.topic || ""}`,
    message: buildContactMessage(data),
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

if (contactForm && formStatus) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const submitDefaultLabel = submitButton ? submitButton.textContent : "";

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const data = {
      company: (formData.get("company") || "").toString().trim(),
      name: (formData.get("name") || "").toString().trim(),
      role: (formData.get("role") || "").toString().trim(),
      email: (formData.get("email") || "").toString().trim(),
      phone: (formData.get("phone") || "").toString().trim(),
      size: (formData.get("size") || "").toString().trim(),
      topic: (formData.get("topic") || "").toString().trim(),
      message: (formData.get("message") || "").toString().trim(),
    };

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "送出中…";
    }

    const ok = await postContactToGmailAppsScript(data);

    formStatus.removeAttribute("hidden");
    formStatus.textContent = ok
      ? "感謝您的聯繫。宸誠資訊將於 2 個工作天內與您確認需求，協助初步檢視企業職場事件治理流程。"
      : `送出失敗，請直接寄信至 ${CONTACT_MAILTO} 或改用電話聯繫。`;

    if (ok) {
      contactForm.reset();
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = submitDefaultLabel;
    }
  });
}