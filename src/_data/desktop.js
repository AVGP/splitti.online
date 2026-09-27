module.exports = {
  wallpaper: "#008080",
  systemName: "Splitti OS 98 Second Edition",
  user: "Alex",
  folders: [
    {
      id: "photos",
      title: "My Photos",
      icon: "/assets/images/icons/folder-photos.svg",
      collection: "photos",
      type: "photos",
      windowTitle: "C:\\My Documents\\My Photos"
    },
    {
      id: "diary",
      title: "My Diary",
      icon: "/assets/images/icons/folder-diary.svg",
      collection: "diary",
      type: "diary",
      windowTitle: "C:\\My Documents\\My Diary"
    },
    {
      id: "documents",
      title: "My Documents",
      icon: "/assets/images/icons/folder-docs.svg",
      collection: "documents",
      type: "documents",
      windowTitle: "C:\\My Documents"
    }
  ],
  systemShortcuts: [
    {
      id: "computer",
      title: "My Computer",
      icon: "/assets/images/icons/computer.svg",
      action: "system-info"
    },
    {
      id: "recycle",
      title: "Recycle Bin",
      icon: "/assets/images/icons/recycle-bin.svg",
      action: "recycle-bin"
    }
  ]
};
