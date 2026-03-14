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

const fileItems = [aboutFile, skillsFile, worksFile, contactFile];
const activityIcons = [aboutIcon, skillsIcon, worksIcon, contactIcon];

let typingToken = 0;
const renderedOnce = new Set();
const openTabs = new Map();
let activeTabId = null;

const files = {
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
  editorWindow.classList.add("active");
  editorWindow.setAttribute("aria-hidden", "false");
}

function closeEditor() {
  editorWindow.classList.remove("active");
  editorWindow.setAttribute("aria-hidden", "true");
}

function clearActiveFile() {
  fileItems.forEach((item) => item.classList.remove("active"));
}

function clearActiveIcon() {
  activityIcons.forEach((icon) => icon.classList.remove("active"));
}

function clearActiveTab() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });
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

function setActiveVisual(file) {
  clearActiveFile();
  clearActiveIcon();
  clearActiveTab();

  file.fileEl.classList.add("active");
  file.iconEl.classList.add("active");

  const tab = openTabs.get(file.id);
  if (tab) {
    tab.classList.add("active");
  }

  activeTabId = file.id;
}

function createTab(file) {
  if (openTabs.has(file.id)) return openTabs.get(file.id);

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

  return tab;
}

function renderInstant(template, file) {
  typingToken++;
  createTab(file);
  setActiveVisual(file);

  codeView.classList.remove("typing");
  codeView.innerHTML = template.innerHTML;
  codeView.scrollTop = 0;

  renderedOnce.add(file.templateId);
}

async function renderWithTyping(template, file) {
  typingToken++;
  const currentToken = typingToken;

  createTab(file);
  setActiveVisual(file);

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
  }
}

function renderFile(fileId) {
  const file = files[fileId];
  if (!file || !codeView) return;

  const template = document.getElementById(file.templateId);
  if (!template) return;

  openEditor();

  if (renderedOnce.has(file.templateId)) {
    renderInstant(template, file);
  } else {
    renderWithTyping(template, file);
  }
}

editorIcon.addEventListener("click", () => {
  openEditor();
  if (!activeTabId) {
    renderFile("about");
  }
});

editorIcon.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openEditor();
    if (!activeTabId) {
      renderFile("about");
    }
  }
});

closeBtn.addEventListener("click", closeEditor);
homeFile.addEventListener("click", closeEditor);

aboutFile.addEventListener("click", () => renderFile("about"));
skillsFile.addEventListener("click", () => renderFile("skills"));
worksFile.addEventListener("click", () => renderFile("works"));
contactFile.addEventListener("click", () => renderFile("contact"));

aboutIcon.addEventListener("click", () => renderFile("about"));
skillsIcon.addEventListener("click", () => renderFile("skills"));
worksIcon.addEventListener("click", () => renderFile("works"));
contactIcon.addEventListener("click", () => renderFile("contact"));

// 初期状態
renderFile("about");
closeEditor();