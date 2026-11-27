/**
 * Windows 98 Guestbook App
 * Connects to https://guestbook.splitti.online via fetch (GET paginated / POST new entry)
 */
class GuestbookApp {
  constructor() {
    this.windowId = "guestbook";
    this.apiBase = (window.GUESTBOOK_API_URL || "https://guestbook.splitti.online").replace(/\/+$/, "");
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalEntries = 0;
    this.isLoading = false;
    this.isSubmitting = false;
  }

  open(skipHistory = false) {
    if (!skipHistory && window.Explorer && typeof window.Explorer.updateUrlPath === "function") {
      window.Explorer.updateUrlPath("/guestbook");
    }

    const existing = window.WM.windows.get(this.windowId);
    if (existing) {
      window.WM.restoreWindow(this.windowId);
      window.WM.bringToFront(this.windowId);
      return;
    }

    const contentHtml = `
      <div class="gb-app">
        <div class="explorer-toolbar gb-toolbar">
          <button type="button" class="win-btn explorer-tool-btn" id="gb-refresh-btn">↻ Refresh</button>
          <button type="button" class="win-btn explorer-tool-btn" id="gb-toggle-form-btn">✎ Sign Guestbook</button>
          <span class="gb-toolbar-host" title="Guestbook API Endpoint">guestbook.splitti.online</span>
        </div>

        <div class="gb-main">
          <form id="gb-form" class="gb-form" novalidate>
            <fieldset class="gb-fieldset">
              <legend>Sign the Guestbook</legend>
              <div class="gb-form-row">
                <label class="gb-field">
                  <span>Name *</span>
                  <input type="text" id="gb-name" name="name" class="gb-input win-inset" maxlength="80" required autocomplete="name" placeholder="Your name" />
                </label>
                <label class="gb-field">
                  <span>Email * <small class="gb-hint">(private)</small></span>
                  <input type="email" id="gb-email" name="email" class="gb-input win-inset" maxlength="254" required autocomplete="email" placeholder="you@example.com" />
                </label>
              </div>
              <label class="gb-field">
                <span>Message * <small class="gb-hint">(plain text, max 300 chars)</small></span>
                <textarea id="gb-text" name="text" class="gb-textarea win-inset" rows="3" maxlength="300" required placeholder="Say hello to Splitti OS 98..."></textarea>
              </label>
              <div class="gb-form-footer">
                <span id="gb-char-count" class="gb-char-count">0 / 300</span>
                <span id="gb-form-feedback" class="gb-feedback" role="status" aria-live="polite"></span>
                <button type="submit" id="gb-submit-btn" class="win-btn gb-submit-btn">Post Entry</button>
              </div>
            </fieldset>
          </form>

          <div class="gb-entries-header">
            <strong id="gb-entries-title">Guestbook Entries</strong>
            <div class="gb-pagination">
              <button type="button" class="win-btn gb-page-btn" id="gb-prev-btn" disabled>◄ Prev</button>
              <span id="gb-page-indicator" class="gb-page-indicator">Page 1 of 1</span>
              <button type="button" class="win-btn gb-page-btn" id="gb-next-btn" disabled>Next ►</button>
            </div>
          </div>

          <div id="gb-entries-list" class="gb-entries-list win-inset">
            <div class="gb-state-msg">Connecting to guestbook.splitti.online...</div>
          </div>
        </div>

        <div class="win-status-bar win-outset-thin">
          <div id="gb-status-text" class="win-status-cell win-inset-flat" style="flex: 1;">Ready</div>
          <div class="win-status-cell win-inset-flat" style="width: 150px;">guestbook.splitti.online</div>
        </div>
      </div>
    `;

    const winObj = window.WM.createWindow({
      id: this.windowId,
      title: "Guestbook - Splitti OS 98",
      icon: "/assets/images/icons/guestbook.svg",
      contentHtml,
      width: 580,
      height: 540
    });

    this.bindEvents(winObj.element);
    this.loadPage(1);
  }

  bindEvents(root) {
    const form = root.querySelector("#gb-form");
    const nameInput = root.querySelector("#gb-name");
    const textInput = root.querySelector("#gb-text");
    const charCount = root.querySelector("#gb-char-count");
    const refreshBtn = root.querySelector("#gb-refresh-btn");
    const toggleFormBtn = root.querySelector("#gb-toggle-form-btn");
    const prevBtn = root.querySelector("#gb-prev-btn");
    const nextBtn = root.querySelector("#gb-next-btn");

    const updateCharCount = () => {
      const chars = Array.from(textInput.value);
      if (chars.length > 300) {
        textInput.value = chars.slice(0, 300).join("");
      }
      const len = Array.from(textInput.value).length;
      charCount.textContent = `${len} / 300`;
      charCount.classList.toggle("gb-char-limit", len >= 300);
    };

    textInput.addEventListener("input", updateCharCount);
    updateCharCount();

    refreshBtn.addEventListener("click", () => {
      this.loadPage(this.currentPage);
    });

    toggleFormBtn.addEventListener("click", () => {
      form.classList.toggle("gb-form-collapsed");
      if (!form.classList.contains("gb-form-collapsed")) {
        nameInput.focus();
      }
    });

    prevBtn.addEventListener("click", () => {
      if (this.currentPage > 1 && !this.isLoading) {
        this.loadPage(this.currentPage - 1);
      }
    });

    nextBtn.addEventListener("click", () => {
      if (this.currentPage < this.totalPages && !this.isLoading) {
        this.loadPage(this.currentPage + 1);
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitEntry(root);
    });
  }

  getRoot() {
    const win = window.WM.windows.get(this.windowId);
    return win ? win.element : null;
  }

  setStatus(message) {
    const root = this.getRoot();
    if (!root) return;
    const el = root.querySelector("#gb-status-text");
    if (el) el.textContent = message;
  }

  setFeedback(message, isError = false) {
    const root = this.getRoot();
    if (!root) return;
    const el = root.querySelector("#gb-form-feedback");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("gb-feedback-error", isError);
    el.classList.toggle("gb-feedback-ok", !isError && Boolean(message));
  }

  async loadPage(page) {
    const root = this.getRoot();
    if (!root || this.isLoading) return;

    this.isLoading = true;
    const listEl = root.querySelector("#gb-entries-list");
    const prevBtn = root.querySelector("#gb-prev-btn");
    const nextBtn = root.querySelector("#gb-next-btn");
    const indicatorEl = root.querySelector("#gb-page-indicator");
    const titleEl = root.querySelector("#gb-entries-title");

    prevBtn.disabled = true;
    nextBtn.disabled = true;
    this.setStatus(`Loading page ${page}...`);
    listEl.innerHTML = `<div class="gb-state-msg">Loading guestbook entries...</div>`;

    try {
      const response = await fetch(`${this.apiBase}/entries?page=${encodeURIComponent(page)}`, {
        method: "GET",
        headers: { Accept: "application/json" }
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        const msg = (data && data.error) || `Server returned HTTP ${response.status}`;
        throw new Error(msg);
      }

      this.currentPage = data.page || page;
      this.totalPages = data.total_pages || 1;
      this.totalEntries = data.total_entries || 0;

      indicatorEl.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
      titleEl.textContent = `Guestbook Entries (${this.totalEntries})`;
      prevBtn.disabled = !data.has_prev;
      nextBtn.disabled = !data.has_next;

      this.renderEntries(listEl, data.entries || []);
      this.setStatus(
        this.totalEntries === 0
          ? "No entries yet"
          : `Showing ${data.entries.length} of ${this.totalEntries} entries`
      );
    } catch (err) {
      listEl.innerHTML = "";
      const errBox = document.createElement("div");
      errBox.className = "gb-state-msg gb-state-error";
      errBox.textContent = `Could not reach guestbook server: ${err.message}`;

      const retryBtn = document.createElement("button");
      retryBtn.type = "button";
      retryBtn.className = "win-btn";
      retryBtn.textContent = "Retry";
      retryBtn.style.marginTop = "8px";
      retryBtn.addEventListener("click", () => this.loadPage(page));

      errBox.appendChild(document.createElement("br"));
      errBox.appendChild(retryBtn);
      listEl.appendChild(errBox);

      prevBtn.disabled = this.currentPage <= 1;
      nextBtn.disabled = this.currentPage >= this.totalPages;
      this.setStatus("Connection error");
    } finally {
      this.isLoading = false;
    }
  }

  renderEntries(container, entries) {
    container.innerHTML = "";

    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "gb-state-msg";
      empty.textContent = "No guestbook entries yet. Be the first to sign!";
      container.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const entry of entries) {
      const card = document.createElement("article");
      card.className = "gb-entry";

      const meta = document.createElement("div");
      meta.className = "gb-entry-meta";

      const author = document.createElement("strong");
      author.className = "gb-entry-name";
      author.textContent = entry.name || "Anonymous";

      const dateEl = document.createElement("span");
      dateEl.className = "gb-entry-date";
      dateEl.textContent = this.formatTimestamp(entry.created_at);

      meta.appendChild(author);
      meta.appendChild(dateEl);

      const body = document.createElement("p");
      body.className = "gb-entry-text";
      body.textContent = entry.text || "";

      card.appendChild(meta);
      card.appendChild(body);
      fragment.appendChild(card);
    }

    container.appendChild(fragment);
  }

  formatTimestamp(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return isoStr;
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  async submitEntry(root) {
    if (this.isSubmitting) return;

    const nameInput = root.querySelector("#gb-name");
    const emailInput = root.querySelector("#gb-email");
    const textInput = root.querySelector("#gb-text");
    const submitBtn = root.querySelector("#gb-submit-btn");
    const charCount = root.querySelector("#gb-char-count");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const text = textInput.value.trim();

    if (!name) {
      this.setFeedback("Please enter your name.", true);
      nameInput.focus();
      return;
    }
    if (!email || !emailInput.checkValidity()) {
      this.setFeedback("Please enter a valid email.", true);
      emailInput.focus();
      return;
    }
    if (!text) {
      this.setFeedback("Please write a message.", true);
      textInput.focus();
      return;
    }
    if (Array.from(text).length > 300) {
      this.setFeedback("Message must be 300 characters or fewer.", true);
      textInput.focus();
      return;
    }

    this.isSubmitting = true;
    submitBtn.disabled = true;
    this.setFeedback("Sending...", false);
    this.setStatus("Posting entry to guestbook.splitti.online...");

    try {
      const response = await fetch(`${this.apiBase}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ name, email, text })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const msg = (data && data.error) || `Failed to post (HTTP ${response.status})`;
        throw new Error(msg);
      }

      nameInput.value = "";
      emailInput.value = "";
      textInput.value = "";
      charCount.textContent = "0 / 300";
      charCount.classList.remove("gb-char-limit");

      this.setFeedback("Signed! Thanks for visiting.", false);
      this.setStatus("Entry saved!");
      await this.loadPage(1);
    } catch (err) {
      this.setFeedback(err.message || "Failed to post entry.", true);
      this.setStatus("Failed to post entry");
    } finally {
      this.isSubmitting = false;
      submitBtn.disabled = false;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.Guestbook = new GuestbookApp();
});
