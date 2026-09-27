/**
 * Windows Explorer File Manager & File Viewer Launcher
 */
class ExplorerApp {
  constructor() {
    this.data = window.WIN98_DATA || {};
  }

  updateUrlHash(slug) {
    if (!slug) return;
    if (history.replaceState) {
      history.replaceState(null, '', '#' + slug);
    } else {
      window.location.hash = '#' + slug;
    }
  }

  openFolder(folderId) {
    const folderMeta = (window.WIN98_DESKTOP?.folders || []).find(f => f.id === folderId);
    if (!folderMeta) return;

    this.updateUrlHash(folderId);

    const items = this.data[folderMeta.collection] || [];
    const windowId = `folder-${folderId}`;
    const windowTitle = folderMeta.windowTitle;
    const windowIcon = folderMeta.icon;

    const fileGridHtml = items.map((item, idx) => `
      <div class="file-item" data-folder="${folderId}" data-index="${idx}">
        <img src="${item.icon || '/assets/images/icons/file-text.svg'}" alt="" />
        <span class="file-name">${item.title}</span>
      </div>
    `).join("");

    const contentHtml = `
      <div class="explorer-toolbar">
        <button class="win-btn explorer-tool-btn" onclick="alert('Already at top level folder')">← Back</button>
        <button class="win-btn explorer-tool-btn" onclick="alert('Already at top level folder')">↑ Up</button>
        <div style="width: 1px; height: 16px; background: #808080; margin: 0 4px;"></div>
        <button class="win-btn explorer-tool-btn" onclick="location.reload()">Refresh</button>
      </div>
      <div class="explorer-address-bar">
        <span class="explorer-address-label">Address</span>
        <input type="text" class="explorer-address-input win-inset" value="${windowTitle}" readonly />
      </div>
      <div class="explorer-body">
        <div class="explorer-sidebar">
          <img src="${windowIcon}" style="width: 32px; height: 32px;" alt="" />
          <h3>${folderMeta.title}</h3>
          <p>Select an item to view its description or open its contents.</p>
          <div style="margin-top: auto; font-size: 10px; color: #666;">
            ${items.length} object(s)
          </div>
        </div>
        <div class="explorer-file-grid win-inset">
          ${fileGridHtml.length > 0 ? fileGridHtml : '<div style="padding: 20px; color: #808080;">Folder is empty.</div>'}
        </div>
      </div>
      <div class="win-status-bar win-outset-thin">
        <div class="win-status-cell win-inset-flat" style="flex: 1;">${items.length} object(s)</div>
        <div class="win-status-cell win-inset-flat" style="width: 120px;">Local Intranet</div>
      </div>
    `;

    const winObj = window.WM.createWindow({
      id: windowId,
      title: windowTitle,
      icon: windowIcon,
      contentHtml,
      width: 640,
      height: 440
    });

    // Attach File Click Handlers
    const gridEl = winObj.element.querySelector(".explorer-file-grid");
    if (gridEl) {
      gridEl.addEventListener("click", (e) => {
        const itemEl = e.target.closest(".file-item");
        gridEl.querySelectorAll(".file-item").forEach(el => el.classList.remove("selected"));
        if (itemEl) {
          itemEl.classList.add("selected");
        }
      });

      gridEl.addEventListener("dblclick", (e) => {
        const itemEl = e.target.closest(".file-item");
        if (!itemEl) return;

        gridEl.querySelectorAll(".file-item").forEach(el => el.classList.remove("selected"));
        const idx = parseInt(itemEl.dataset.index, 10);
        this.openFile(folderId, idx);
      });

      // Mobile touch support
      let lastTap = 0;
      gridEl.addEventListener("touchend", (e) => {
        const itemEl = e.target.closest(".file-item");
        if (!itemEl) return;

        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        if (tapLength < 400 && tapLength > 0) {
          gridEl.querySelectorAll(".file-item").forEach(el => el.classList.remove("selected"));
          const idx = parseInt(itemEl.dataset.index, 10);
          this.openFile(folderId, idx);
          e.preventDefault();
        } else {
          gridEl.querySelectorAll(".file-item").forEach(el => el.classList.remove("selected"));
          itemEl.classList.add("selected");
        }
        lastTap = currentTime;
      });
    }
  }

  openFile(folderId, index) {
    const items = this.data[folderId] || [];
    const item = items[index];
    if (!item) return;

    if (item.slug) {
      this.updateUrlHash(item.slug);
    }

    if (folderId === "photos" || item.image) {
      this.openPhotoViewer(items, index);
    } else {
      this.openNotepad(item);
    }
  }

  openNotepad(item) {
    if (item.slug) {
      this.updateUrlHash(item.slug);
    }

    const windowId = `notepad-${item.title.replace(/[^a-zA-Z0-9]/g, "-")}`;
    const windowTitle = `${item.title} - Notepad`;

    const contentHtml = `
      <div class="win-menubar">
        <span class="win-menu-item">File</span>
        <span class="win-menu-item">Edit</span>
        <span class="win-menu-item">Search</span>
        <span class="win-menu-item">Help</span>
      </div>
      <div class="notepad-editor win-inset">
${item.bodyHtml || item.rawContent}
      </div>
      <div class="win-status-bar win-outset-thin">
        <div class="win-status-cell win-inset-flat" style="flex: 1;">Date: ${item.date || 'N/A'}</div>
        <div class="win-status-cell win-inset-flat" style="width: 140px;">Encoding: ANSI</div>
      </div>
    `;

    window.WM.createWindow({
      id: windowId,
      title: windowTitle,
      icon: "/assets/images/icons/file-text.svg",
      contentHtml,
      width: 580,
      height: 420
    });
  }

  openPhotoViewer(items, currentIndex) {
    const item = items[currentIndex];
    if (!item) return;

    if (item.slug) {
      this.updateUrlHash(item.slug);
    }

    const windowId = `photo-viewer`;
    const windowTitle = `Imaging - [${item.title}]`;
    const cameraName = "Minolta Dimage Xt";

    const contentHtml = `
      <div class="photo-viewer-container">
        <div class="photo-viewer-toolbar">
          <div style="display: flex; gap: 4px; align-items: center;">
            <button class="win-btn" id="photo-prev-btn" ${currentIndex === 0 ? 'disabled' : ''}>◄ Prev</button>
            <button class="win-btn" id="photo-next-btn" ${currentIndex === items.length - 1 ? 'disabled' : ''}>Next ►</button>
          </div>
          <span style="font-size: 11px; font-weight: bold; color: #333;">${currentIndex + 1} of ${items.length}</span>
        </div>
        <div class="photo-stage">
          <img src="${item.image}" id="photo-img-element" alt="${item.title}" />
        </div>
        <div class="photo-details-panel">
          <div class="photo-details-grid">
            <div class="photo-details-col">
              <div><strong>Title:</strong> ${item.title}</div>
              <div><strong>Date:</strong> ${item.date || 'N/A'}</div>
              <div><strong>Location:</strong> ${item.location || 'Unknown'}</div>
            </div>
            <div class="photo-details-col photo-details-right">
              <div><strong>Camera:</strong> ${cameraName}</div>
              <div><strong>EXIF Status:</strong> ${item.exif || 'sRGB ICC Profile'}</div>
            </div>
          </div>
          ${item.caption ? `
            <div class="photo-description-box win-inset-flat">
              <strong>Description:</strong> ${item.caption}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    let winObj;
    if (window.WM.windows.has(windowId)) {
      window.WM.updateTitle(windowId, windowTitle);
      window.WM.updateContent(windowId, contentHtml);
      window.WM.bringToFront(windowId);
      winObj = window.WM.windows.get(windowId);
    } else {
      winObj = window.WM.createWindow({
        id: windowId,
        title: windowTitle,
        icon: "/assets/images/icons/file-image.svg",
        contentHtml,
        width: 640,
        height: 520
      });
    }

    const prevBtn = winObj.element.querySelector("#photo-prev-btn");
    const nextBtn = winObj.element.querySelector("#photo-next-btn");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
          this.openPhotoViewer(items, currentIndex - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentIndex < items.length - 1) {
          this.openPhotoViewer(items, currentIndex + 1);
        }
      });
    }
  }

  openSystemDialog(type) {
    if (type === "system-info") {
      window.WM.createWindow({
        id: "sys-info",
        title: "System Properties",
        icon: "/assets/images/icons/computer.svg",
        contentHtml: `
          <div class="win-dialog-wrapper">
            <div class="win-dialog-body">
              <img src="/assets/images/icons/computer.svg" class="win-dialog-icon" alt="" />
              <div class="win-dialog-message">
                <strong>Splitti OS 98</strong><br/>
                Second Edition<br/>
                4.10.2222 A<br/><br/>
                Registered to:<br/>
                Martin<br/>
                Eleventy 11ty Engine Version 3.0<br/><br/>
                Computer:<br/>
                Pentium II Processor<br/>
                64.0 MB RAM
              </div>
            </div>
            <div class="win-dialog-footer">
              <button class="win-btn" onclick="window.WM.closeWindow('sys-info')">OK</button>
            </div>
          </div>
        `,
        width: 380,
        height: 340
      });
    } else if (type === "recycle-bin") {
      window.WM.createWindow({
        id: "recycle-bin",
        title: "Recycle Bin",
        icon: "/assets/images/icons/recycle-bin.svg",
        contentHtml: `
          <div class="win-dialog-wrapper">
            <div class="win-dialog-body">
              <img src="/assets/images/icons/recycle-bin.svg" class="win-dialog-icon" alt="" />
              <div class="win-dialog-message">
                <strong>Recycle Bin is Empty</strong><br/>
                No deleted items found in system buffer.
              </div>
            </div>
            <div class="win-dialog-footer">
              <button class="win-btn" onclick="window.WM.closeWindow('recycle-bin')">OK</button>
            </div>
          </div>
        `,
        width: 360,
        height: 220
      });
    }
  }

  openFromUrl() {
    let target = window.AUTO_OPEN_SLUG;

    const urlParams = new URLSearchParams(window.location.search);
    const queryTarget = urlParams.get('file') || urlParams.get('open') || urlParams.get('photo') || urlParams.get('doc') || urlParams.get('folder');
    if (queryTarget) {
      target = queryTarget;
    }

    if (!queryTarget && window.location.hash) {
      const hashVal = window.location.hash.replace(/^#\/?/, '');
      if (hashVal) {
        target = hashVal;
      }
    }

    if (!target && window.location.pathname) {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && lastPart !== 'index.html' && lastPart !== 'splendid-hopper') {
          target = lastPart;
        }
      }
    }

    if (!target || target === 'index' || target === 'null') {
      this.openFolder('documents');
      return;
    }

    const lowerTarget = target.toLowerCase();
    if (['photos', 'diary', 'documents'].includes(lowerTarget)) {
      this.openFolder(lowerTarget);
      return;
    }

    const collections = ['photos', 'diary', 'documents'];
    let foundCollection = null;
    let foundIndex = -1;

    const normalizedTarget = lowerTarget.replace(/[^a-z0-9]/g, '');

    for (const col of collections) {
      const list = this.data[col] || [];
      const idx = list.findIndex(item => {
        if (!item) return false;
        const slugNorm = (item.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const titleNorm = (item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const urlNorm = (item.url || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return slugNorm === normalizedTarget || titleNorm === normalizedTarget || (urlNorm && urlNorm.includes(normalizedTarget));
      });

      if (idx !== -1) {
        foundCollection = col;
        foundIndex = idx;
        break;
      }
    }

    if (foundCollection && foundIndex !== -1) {
      this.openFolder(foundCollection);
      this.openFile(foundCollection, foundIndex);
    } else {
      this.openFolder('documents');
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.Explorer = new ExplorerApp();

  window.addEventListener('hashchange', () => {
    if (window.Explorer) {
      window.Explorer.openFromUrl();
    }
  });
});
