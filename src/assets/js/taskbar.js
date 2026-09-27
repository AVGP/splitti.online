/**
 * Windows 98 Taskbar, Clock, Flashing Network Icon, and Start Menu Controller
 */
class TaskbarController {
  constructor() {
    this.startBtn = document.getElementById("start-btn");
    this.startMenu = document.getElementById("start-menu");
    this.tasksContainer = document.getElementById("taskbar-tasks");
    this.clockEl = document.getElementById("tray-clock");
    this.netIconEl = document.getElementById("tray-net-icon");
    this.tasks = new Map();

    this.initClock();
    this.initNetworkFlashingIcon();
    this.initStartMenu();
  }

  /* Live Clock & Date Display */
  initClock() {
    const update = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;

      this.clockEl.textContent = `${hours}:${minutes} ${ampm}`;
      this.clockEl.title = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    };

    update();
    setInterval(update, 1000);

    // Clicking clock shows current full date dialog
    this.clockEl.addEventListener("click", () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      alert(`Splitti OS 98 Date & Time\nCurrent Date: ${dateStr}\nTime Zone: GMT+02:00`);
    });
  }

  /* Flashing Network Icon */
  initNetworkFlashingIcon() {
    let isActive = false;
    const idlePath = "/assets/images/icons/net-idle.svg";
    const activePath = "/assets/images/icons/net-active.svg";

    // Random periodic blinking simulating network activity (dial-up/LAN packet transfers)
    setInterval(() => {
      // 40% chance to blink packets transmitting
      if (Math.random() > 0.6) {
        isActive = true;
        this.netIconEl.src = activePath;
        setTimeout(() => {
          isActive = false;
          this.netIconEl.src = idlePath;
        }, 300 + Math.random() * 500);
      }
    }, 1500);

    this.netIconEl.addEventListener("click", () => {
      alert("Dial-Up Networking Status:\nConnected at 56,000 bps\nBytes Sent: 1,492,019\nBytes Received: 8,390,210");
    });
  }

  /* Start Menu Toggle */
  initStartMenu() {
    this.startBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = this.startMenu.classList.contains("open");
      if (isOpen) {
        this.closeStartMenu();
      } else {
        this.openStartMenu();
      }
    });

    document.addEventListener("click", (e) => {
      if (!this.startMenu.contains(e.target) && e.target !== this.startBtn) {
        this.closeStartMenu();
      }
    });
  }

  openStartMenu() {
    this.startMenu.classList.add("open");
    this.startBtn.classList.add("active");
  }

  closeStartMenu() {
    this.startMenu.classList.remove("open");
    this.startBtn.classList.remove("active");
  }

  /* Taskbar Window Button Management */
  addTask({ id, title, icon }) {
    if (this.tasks.has(id)) return;

    const btn = document.createElement("button");
    btn.className = "taskbar-task-btn active win-outset-thin";
    btn.id = `task-btn-${id}`;
    btn.innerHTML = `
      ${icon ? `<img src="${icon}" alt="" />` : ""}
      <span>${title}</span>
    `;

    btn.addEventListener("click", () => {
      const winObj = window.WM.windows.get(id);
      if (!winObj) return;

      if (winObj.isMinimized) {
        window.WM.restoreWindow(id);
      } else if (window.WM.activeWindowId === id) {
        window.WM.minimizeWindow(id);
      } else {
        window.WM.bringToFront(id);
      }
    });

    this.tasksContainer.appendChild(btn);
    this.tasks.set(id, btn);
    this.setActive(id);
  }

  setActive(id) {
    this.tasks.forEach((btn, taskId) => {
      if (taskId === id) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  setInactive(id) {
    const btn = this.tasks.get(id);
    if (btn) btn.classList.remove("active");
  }

  updateTitle(id, title) {
    const btn = this.tasks.get(id);
    if (!btn) return;
    const span = btn.querySelector("span");
    if (span) span.textContent = title;
  }

  removeTask(id) {
    const btn = this.tasks.get(id);
    if (btn) {
      btn.remove();
      this.tasks.delete(id);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.Taskbar = new TaskbarController();
});
