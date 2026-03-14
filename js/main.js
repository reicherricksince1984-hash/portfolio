const editorIcon = document.getElementById("editorIcon");
const editorWindow = document.getElementById("editorWindow");
const closeBtn = document.getElementById("closeBtn");

const homeFile = document.getElementById("homeFile");
const aboutFile = document.getElementById("aboutFile");
const skillsFile = document.getElementById("skillsFile");
const worksFile = document.getElementById("worksFile");
const contactFile = document.getElementById("contactFile");

const aboutIcon = document.getElementById("aboutIcon");
const skillsIcon = document.getElementById("skillsIcon");
const worksIcon = document.getElementById("worksIcon");
const contactIcon = document.getElementById("contactIcon");

const tabBar = document.getElementById("tabBar");
const codeView = document.getElementById("codeView");

const tabScrollLeft = document.getElementById("tabScrollLeft");
const tabScrollRight = document.getElementById("tabScrollRight");

const fileItems = [homeFile, aboutFile, skillsFile, worksFile, contactFile];
const activityIcons = [aboutIcon, skillsIcon, worksIcon, contactIcon];

let typingToken = 0;
const renderedOnce = new Set();
const openTabs = new Map();
let activeTabId = null;

const files = {
  index: {
    id: "index",
    fileName: "index.html",
    templateId: "indexTemplate",
    fileEl: homeFile,
    iconEl: null
  },
  about: {
    id: "about",
    fileName: "about_me.js",
    templateId: "aboutTemplate",
    fileEl: aboutFile,
    iconEl: aboutIcon
  },
  skills: {
    id: "skills",
    fileName: "skills.php",
    templateId: "skillsTemplate",
    fileEl: skillsFile,
    iconEl: skillsIcon
  },
  works: {
    id: "works",
    fileName: "works.css",
    templateId: "worksTemplate",
    fileEl: worksFile,
    iconEl: worksIcon
  },
  contact: {
    id: "contact",
    fileName: "contact.py",
    templateId: "contactTemplate",
    fileEl: contactFile,
    iconEl: contactIcon
  }
};

function openEditor() {
  if (!editorWindow) return;
  editorWindow.classList.add("active");
  editorWindow.setAttribute("aria-hidden", "false");
}

function closeEditor() {
  if (!editorWindow) return;
  editorWindow.classList.remove("active");
  editorWindow.setAttribute("aria-hidden", "true");
}

function clearActiveFile() {
  fileItems.forEach((item) => {
    if (item) item.classList.remove("active");
  });
}

function clearActiveIcon() {
  activityIcons.forEach((icon) => {
    if (icon) icon.classList.remove("active");
  });
}

function clearActiveTab() {
  if (!tabBar) return;
  tabBar.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });
}

function setActiveVisual(file) {
  clearActiveFile();
  clearActiveIcon();
  clearActiveTab();

  if (file.fileEl) {
    file.fileEl.classList.add("active");
  }

  if (file.iconEl) {
    file.iconEl.classList.add("active");
  }

  const tab = openTabs.get(file.id);
  if (tab) {
    tab.classList.add("active");
    tab.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest"
    });
  }

  activeTabId = file.id;
  updateTabScrollButtons();
}

function updateTabScrollButtons() {
  if (!tabBar || !tabScrollLeft || !tabScrollRight) return;

  const maxScroll = Math.max(0, tabBar.scrollWidth - tabBar.clientWidth);
  tabScrollLeft.disabled = tabBar.scrollLeft <= 1;
  tabScrollRight.disabled = tabBar.scrollLeft >= maxScroll - 1;
}

function scrollTabs(direction = "right") {
  if (!tabBar) return;

  const amount = Math.max(120, tabBar.clientWidth * 0.6);
  const nextLeft =
    direction === "left"
      ? tabBar.scrollLeft - amount
      : tabBar.scrollLeft + amount;

  tabBar.scrollTo({
    left: nextLeft,
    behavior: "smooth"
  });

  window.setTimeout(updateTabScrollButtons, 250);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeHTMLLine(targetEl, html, speed = 12, token) {
  let i = 0;
  let insideTag = false;
  let output = "";

  while (i < html.length) {
    if (token !== typingToken) return false;

    const char = html[i];
    output += char;

    if (char === "<") insideTag = true;
    if (char === ">") insideTag = false;

    targetEl.innerHTML = output;

    if (!insideTag) {
      await sleep(speed);
    }

    i++;
  }

  return true;
}

function createTab(file) {
  if (!tabBar) return null;

  if (openTabs.has(file.id)) {
    return openTabs.get(file.id);
  }

  const tab = document.createElement("button");
  tab.className = "tab";
  tab.type = "button";
  tab.dataset.tabId = file.id;
  tab.textContent = file.fileName;

  tab.addEventListener("click", () => {
    renderFile(file.id);
  });

  tabBar.appendChild(tab);
  openTabs.set(file.id, tab);

  requestAnimationFrame(updateTabScrollButtons);
  return tab;
}

function renderInstant(template, file) {
  typingToken++;

  createTab(file);
  setActiveVisual(file);

  if (!codeView) return;

  codeView.classList.remove("typing");
  codeView.innerHTML = template.innerHTML;
  codeView.scrollTop = 0;

  renderedOnce.add(file.templateId);
  updateTabScrollButtons();
}

async function renderWithTyping(template, file) {
  typingToken++;
  const currentToken = typingToken;

  createTab(file);
  setActiveVisual(file);

  if (!codeView) return;

  codeView.innerHTML = "";
  codeView.classList.add("typing");

  const children = Array.from(template.children);

  for (const child of children) {
    if (currentToken !== typingToken) return;

    if (child.tagName === "BR") {
      codeView.appendChild(document.createElement("br"));
      continue;
    }

    const line = document.createElement("div");
    line.className = child.className || "code-line";
    codeView.appendChild(line);

    const completed = await typeHTMLLine(line, child.innerHTML, 12, currentToken);
    if (!completed) return;

    codeView.scrollTop = codeView.scrollHeight;
    await sleep(35);
  }

  if (currentToken === typingToken) {
    codeView.classList.remove("typing");
    renderedOnce.add(file.templateId);
    updateTabScrollButtons();
  }
}

function renderFile(fileId) {
  const file = files[fileId];
  if (!file || !codeView) return;

  const template = document.getElementById(file.templateId);
  if (!template) return;

  openEditor();

  if (fileId === "index") {
    renderInstant(template, file);
    return;
  }

  if (renderedOnce.has(file.templateId)) {
    renderInstant(template, file);
  } else {
    renderWithTyping(template, file);
  }
}

function bindEvents() {
  if (editorIcon) {
    editorIcon.addEventListener("click", () => {
      renderFile("index");
    });

    editorIcon.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        renderFile("index");
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeEditor);
  }

  if (homeFile) {
    homeFile.addEventListener("click", () => renderFile("index"));
  }

  if (aboutFile) {
    aboutFile.addEventListener("click", () => renderFile("about"));
  }

  if (skillsFile) {
    skillsFile.addEventListener("click", () => renderFile("skills"));
  }

  if (worksFile) {
    worksFile.addEventListener("click", () => renderFile("works"));
  }

  if (contactFile) {
    contactFile.addEventListener("click", () => renderFile("contact"));
  }

  if (aboutIcon) {
    aboutIcon.addEventListener("click", () => renderFile("about"));
  }

  if (skillsIcon) {
    skillsIcon.addEventListener("click", () => renderFile("skills"));
  }

  if (worksIcon) {
    worksIcon.addEventListener("click", () => renderFile("works"));
  }

  if (contactIcon) {
    contactIcon.addEventListener("click", () => renderFile("contact"));
  }

  if (tabScrollLeft) {
    tabScrollLeft.addEventListener("click", () => scrollTabs("left"));
  }

  if (tabScrollRight) {
    tabScrollRight.addEventListener("click", () => scrollTabs("right"));
  }

  if (tabBar) {
    tabBar.addEventListener("scroll", updateTabScrollButtons);
  }

  window.addEventListener("resize", updateTabScrollButtons);
}

function initialize() {
  bindEvents();

  // 初期状態では index.html の内容だけ準備して、ウィンドウは閉じる
  renderFile("index");
  closeEditor();

  // 初期ボタン状態を整える
  updateTabScrollButtons();
}

initialize();
