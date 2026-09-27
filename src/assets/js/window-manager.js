/**
 * Windows 98 Dynamic Window Manager
 */
class WindowManager {
  constructor() {
    this.windows = new Map();
    this.activeWindowId = null;
    this.highestZIndex = 100;
    this.dragState = null;

    this.initGlobalListeners();
  }

  initGlobalListeners() {
    // Window mousemove / touchmove for dragging
    window.addEventListener("mousemove", (e) => this.handleDrag(e));
    window.addEventListener("mouseup", () => this.endDrag());
    window.addEventListener("touchmove", (e) => this.handleDrag(e.touches[0]), { passive: false });
    window.addEventListener("touchend", () => this.endDrag());
  }

  createWindow({ id, title, icon, contentHtml, width = 640, height = 440, x, y }) {
    if (this.windows.has(id)) {
      this.restoreWindow(id);
      this.bringToFront(id);
      return this.windows.get(id);
    }

    const defaultX = x !== undefined ? x : Math.max(20, Math.min(window.innerWidth - width - 20, 50 + (this.windows.size * 30)));
    const defaultY = y !== undefined ? y : Math.max(20, Math.min(window.innerHeight - height - 60, 40 + (this.windows.size * 30)));

    const winEl = document.createElement("div");
    winEl.id = `win-${id}`;
    winEl.className = "win-window active-window";
    winEl.style.width = `${width}px`;
    winEl.style.height = `${height}px`;
    winEl.style.left = `${defaultX}px`;
    winEl.style.top = `${defaultY}px`;
    winEl.style.zIndex = ++this.highestZIndex;

    winEl.innerHTML = `
      <div class="win-titlebar" id="win-titlebar-${id}">
        <div class="win-title-text">
          ${icon ? `<img src="${icon}" alt="" />` : ""}
          <span>${title}</span>
        </div>
        <div class="win-controls">
          <button class="win-btn win-titlebar-btn win-btn-minimize" title="Minimize">_</button>
          <button class="win-btn win-titlebar-btn win-btn-maximize" title="Maximize">□</button>
          <button class="win-btn win-titlebar-btn win-btn-close" title="Close">✕</button>
        </div>
      </div>
      <div class="win-content">
        ${contentHtml}
      </div>
    `;

    document.getElementById("desktop-viewport").appendChild(winEl);

    const winObj = {
      id,
      title,
      icon,
      element: winEl,
      isMaximized: false,
      isMinimized: false,
      prevBounds: null
    };

    this.windows.set(id, winObj);
    this.activeWindowId = id;

    // Attach Event Listeners
    winEl.addEventListener("mousedown", () => this.bringToFront(id));
    winEl.addEventListener("touchstart", () => this.bringToFront(id), { passive: true });

    // Drag header
    const titlebar = winEl.querySelector(`#win-titlebar-${id}`);
    titlebar.addEventListener("mousedown", (e) => this.startDrag(e, id));
    titlebar.addEventListener("touchstart", (e) => this.startDrag(e.touches[0], id), { passive: true });

    // Buttons
    winEl.querySelector(".win-btn-close").addEventListener("click", () => this.closeWindow(id));
    winEl.querySelector(".win-btn-minimize").addEventListener("click", () => this.minimizeWindow(id));
    winEl.querySelector(".win-btn-maximize").addEventListener("click", () => this.toggleMaximize(id));

    // Register taskbar button
    if (window.Taskbar) {
      window.Taskbar.addTask({ id, title, icon });
    }

    return winObj;
  }

  bringToFront(id) {
    const win = this.windows.get(id);
    if (!win || win.isMinimized) return;

    this.windows.forEach((w) => w.element.classList.remove("active-window"));
    win.element.classList.add("active-window");
    win.element.style.zIndex = ++this.highestZIndex;
    this.activeWindowId = id;

    if (window.Taskbar) {
      window.Taskbar.setActive(id);
    }
  }

  updateTitle(id, newTitle) {
    const win = this.windows.get(id);
    if (!win) return;
    win.title = newTitle;
    const titleSpan = win.element.querySelector(".win-title-text span");
    if (titleSpan) titleSpan.textContent = newTitle;
    if (window.Taskbar) {
      window.Taskbar.updateTitle(id, newTitle);
    }
  }

  updateContent(id, contentHtml) {
    const win = this.windows.get(id);
    if (!win) return;
    const contentEl = win.element.querySelector(".win-content");
    if (contentEl) contentEl.innerHTML = contentHtml;
  }

  closeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.element.remove();
    this.windows.delete(id);

    if (window.Taskbar) {
      window.Taskbar.removeTask(id);
    }

    if (this.activeWindowId === id) {
      this.activeWindowId = null;
      // Focus previous window if available
      const remaining = Array.from(this.windows.values()).filter(w => !w.isMinimized);
      if (remaining.length > 0) {
        this.bringToFront(remaining[remaining.length - 1].id);
      }
    }
  }

  minimizeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.isMinimized = true;
    win.element.style.display = "none";

    if (window.Taskbar) {
      window.Taskbar.setInactive(id);
    }
  }

  restoreWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.isMinimized = false;
    win.element.style.display = "flex";
    this.bringToFront(id);
  }

  toggleMaximize(id) {
    const win = this.windows.get(id);
    if (!win) return;

    const el = win.element;

    if (win.isMaximized) {
      // Restore
      el.style.left = `${win.prevBounds.left}px`;
      el.style.top = `${win.prevBounds.top}px`;
      el.style.width = `${win.prevBounds.width}px`;
      el.style.height = `${win.prevBounds.height}px`;
      win.isMaximized = false;
    } else {
      // Maximize
      win.prevBounds = {
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight
      };

      el.style.left = "0px";
      el.style.top = "0px";
      el.style.width = "100%";
      el.style.height = "calc(100vh - var(--taskbar-height))";
      win.isMaximized = true;
    }
  }

  startDrag(e, id) {
    const win = this.windows.get(id);
    if (!win || win.isMaximized) return;

    this.bringToFront(id);
    this.dragState = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: win.element.offsetLeft,
      initialTop: win.element.offsetTop
    };
  }

  handleDrag(e) {
    if (!this.dragState) return;

    const dx = e.clientX - this.dragState.startX;
    const dy = e.clientY - this.dragState.startY;
    const win = this.windows.get(this.dragState.id);

    if (win) {
      win.element.style.left = `${this.dragState.initialLeft + dx}px`;
      win.element.style.top = `${Math.max(0, this.dragState.initialTop + dy)}px`;
    }
  }

  endDrag() {
    this.dragState = null;
  }
}

window.WM = new WindowManager();
