---
title: CV.HTM - Curriculum Vitae (Netscape)
date: 1998-11-10
author: Martin
category: Resume
tags: documents
icon: /assets/images/icons/file-text.svg
---
<style>
/* Adapt splitti.online's Notepad window into Netscape Navigator when CV is open */
.win-window:has(.ns-cv-root) > .win-content > .win-menubar,
.win-window:has(.ns-cv-root) > .win-content > .win-status-bar {
  display: none !important;
}
.notepad-editor:has(.ns-cv-root) {
  white-space: normal !important;
  padding: 0 !important;
  margin: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  font-family: var(--font-win, "MS Sans Serif", Tahoma, sans-serif) !important;
  background-color: var(--win-bg, #c0c0c0) !important;
}
/* Fallback for browsers without :has() per modern-web-guidance (content-based-styling) */
@supports not selector(:has(*)) {
  .win-window.has-ns-cv > .win-content > .win-menubar,
  .win-window.has-ns-cv > .win-content > .win-status-bar {
    display: none !important;
  }
  .notepad-editor.has-ns-cv {
    white-space: normal !important;
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    font-family: var(--font-win, "MS Sans Serif", Tahoma, sans-serif) !important;
    background-color: var(--win-bg, #c0c0c0) !important;
  }
}
/* Netscape Navigator Chrome & Scrollable CV Scoped Styles */
.ns-cv-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 420px;
  background-color: var(--win-bg, #c0c0c0);
  color: #000000;
  font-family: var(--font-win, "MS Sans Serif", Tahoma, sans-serif);
  font-size: 11px;
  overflow: hidden;
}
.ns-location-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-top: 1px solid var(--win-light, #ffffff);
  border-bottom: 1px solid var(--win-shadow-dark, #808080);
  background: var(--win-bg, #c0c0c0);
  flex-shrink: 0;
}
.ns-grippy {
  width: 6px;
  height: 20px;
  border-left: 1px solid var(--win-light, #ffffff);
  border-right: 1px solid var(--win-shadow-dark, #808080);
  background: repeating-linear-gradient(
    to bottom,
    var(--win-bg, #c0c0c0),
    var(--win-bg, #c0c0c0) 2px,
    var(--win-shadow-dark, #808080) 2px,
    var(--win-shadow-dark, #808080) 3px
  );
  flex-shrink: 0;
}
.ns-location-label {
  font-weight: bold;
  font-size: 11px;
  white-space: nowrap;
}
.ns-url-input {
  flex: 1;
  height: 21px;
  background: #ffffff;
  padding: 2px 6px;
  font-family: var(--font-win, "MS Sans Serif", Tahoma, sans-serif);
  font-size: 11px;
  color: #000000;
  border: none;
}
.ns-throbber {
  width: 28px;
  height: 24px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #001b44 0%, #003b6f 62%, #007777 68%, #003333 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.ns-throbber-n {
  font-family: "Times New Roman", Times, Georgia, serif;
  font-size: 18px;
  font-weight: 900;
  font-style: italic;
  color: #ffffff;
  text-shadow: 1px 1px 0 #000000, -1px -1px 0 #55ffff;
  line-height: 1;
}
.ns-personal-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-top: 1px solid var(--win-light, #ffffff);
  border-bottom: 1px solid var(--win-shadow-dark, #808080);
  background: var(--win-bg, #c0c0c0);
  overflow-x: auto;
  flex-shrink: 0;
}
.ns-section-btn {
  text-decoration: none;
  color: #000000;
  white-space: nowrap;
  height: 22px;
  padding: 2px 8px;
  font-size: 11px;
}
.ns-cv-viewport {
  flex: 1;
  overflow-y: scroll;
  overflow-x: auto;
  background-color: #d8d8d8;
  background-image: radial-gradient(#b8b8b8 1px, transparent 1px);
  background-size: 8px 8px;
  padding: 12px;
  user-select: text;
  -webkit-user-select: text;
  scroll-behavior: smooth;
  --scrollbar-thumb: #c0c0c0;
  --scrollbar-track: #dfdfdf;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  scrollbar-width: auto;
}
@supports not (scrollbar-color: auto) {
  .ns-cv-viewport::-webkit-scrollbar {
    width: 16px;
    height: 16px;
  }
  .ns-cv-viewport::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
  }
  .ns-cv-viewport::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
  }
}
.ns-cv-doc {
  max-width: 820px;
  margin: 0 auto;
  background-color: #ffffff;
  border: 3px ridge #999999;
  padding: 14px 18px 20px;
  font-family: "Times New Roman", Times, Georgia, serif;
  font-size: 15px;
  line-height: 1.45;
  color: #000000;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.3);
}
.ns-cv-doc a {
  color: #0000ee;
  text-decoration: underline;
}
.ns-cv-doc a:visited {
  color: #551a8b;
}
.ns-cv-doc a:hover,
.ns-cv-doc a:active {
  color: #ff0000;
}
.ns-cv-doc .retro-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 2px;
  border: 2px outset #999999;
  background-color: #d4d0c8;
  margin-bottom: 16px;
}
.ns-cv-doc .retro-table th,
.ns-cv-doc .retro-table td {
  border: 1px inset #999999;
  padding: 8px 10px;
  background-color: #ffffff;
  vertical-align: top;
}
.ns-cv-doc .retro-table th {
  background-color: #000080;
  color: #ffffff;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  text-align: left;
}
.ns-cv-doc .profile-avatar-cell {
  width: 155px;
  text-align: center;
  background-color: #f0f4f8 !important;
}
.ns-cv-doc .pixel-portrait {
  width: 120px;
  height: 120px;
  margin: 0 auto 8px;
  background: linear-gradient(135deg, #008080 0%, #000080 100%);
  border: 3px ridge #c0c0c0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffff00;
  font-family: "Courier New", Courier, monospace;
  font-size: 11px;
  line-height: 1.15;
  padding: 0;
  overflow: hidden;
}
.ns-cv-doc .cv-name {
  font-family: "Times New Roman", Times, Georgia, serif;
  font-size: 26px;
  font-weight: bold;
  margin: 0 0 4px 0;
  color: #000080;
}
.ns-cv-doc .cv-pronouns {
  font-size: 14px;
  font-weight: normal;
  color: #555555;
}
.ns-cv-doc .cv-headline {
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
  font-weight: bold;
  background-color: #ffffcc;
  border: 1px dashed #808000;
  padding: 4px 8px;
  display: inline-block;
  margin: 4px 0 10px 0;
  color: #333300;
}
.ns-cv-doc .cv-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 6px 12px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  margin-top: 6px;
}
.ns-cv-doc .cv-social-links {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 2px groove #cccccc;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  align-items: center;
}
.ns-cv-doc hr.retro-hr {
  border: 0;
  height: 4px;
  border-top: 2px solid #808080;
  border-bottom: 2px solid #ffffff;
  margin: 16px 0;
}
.ns-cv-doc .section-heading {
  background: linear-gradient(90deg, #000080 0%, #008080 100%);
  color: #ffffff !important;
  border: 2px outset #c0c0c0;
  padding: 5px 10px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
  font-weight: bold;
  margin: 16px 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ns-cv-doc .section-heading .top-link {
  color: #ffff00;
  font-size: 11px;
  font-weight: normal;
  font-family: "Courier New", Courier, monospace;
}
.ns-cv-doc .role-date-cell {
  width: 170px;
  background-color: #f3f6fa !important;
  font-family: "Courier New", Courier, monospace;
  font-size: 12px;
}
.ns-cv-doc .role-title {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
  font-weight: bold;
  color: #000080;
  margin: 0 0 2px 0;
}
.ns-cv-doc .role-company {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: bold;
  color: #005555;
  margin-bottom: 6px;
}
.ns-cv-doc .role-desc {
  margin: 4px 0 0 0;
  font-size: 14px;
}
.ns-cv-doc .role-subrole {
  border-top: 1px dashed #999999;
  margin-top: 8px;
  padding-top: 8px;
}
.ns-cv-doc .presentation-box {
  margin-top: 8px;
  background-color: #ffffcc;
  border: 1px solid #999900;
  padding: 6px 10px;
  font-size: 13px;
}
.ns-cv-doc .skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 8px;
}
.ns-cv-doc .skill-card {
  border: 1px inset #999999;
  background: #f9f9f9;
  padding: 6px 8px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
}
.ns-cv-doc .skill-meter {
  height: 10px;
  background: #ffffff;
  border: 1px inset #808080;
  margin-top: 4px;
  padding: 1px;
  display: flex;
  gap: 2px;
}
.ns-cv-doc .skill-block {
  flex: 1;
  background-color: #000080;
}
</style>
<div class="ns-cv-root">
  <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" style="display:none" onload="const w=this.closest('.win-window');if(w&&window.WM){window.WM.updateTitle(w.id.replace(/^win-/,''),'CV.HTM - Curriculum Vitae - Netscape');if(!w.dataset.nsSized){w.dataset.nsSized='1';w.style.left='48px';w.style.top='20px';w.style.width=Math.min(820,window.innerWidth-68)+'px';w.style.height=Math.min(580,window.innerHeight-68)+'px';}}" />
  <div class="ns-location-row">
    <div class="ns-grippy" aria-hidden="true"></div>
    <span class="ns-location-label">Location:</span>
    <input type="text" class="ns-url-input win-inset" value="http://splitti.online/~martin/cv.html#top" readonly />
    <div class="ns-throbber win-inset" title="Netscape Navigator" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-top').scrollIntoView({behavior:'smooth'});r.querySelector('.ns-url-input').value='http://splitti.online/~martin/cv.html#top';">
      <span class="ns-throbber-n">N</span>
    </div>
  </div>
  <nav class="ns-personal-row" aria-label="CV Sections">
    <div class="ns-grippy" aria-hidden="true"></div>
    <button type="button" class="win-btn ns-section-btn" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-top').scrollIntoView({behavior:'smooth'});r.querySelector('.ns-url-input').value='http://splitti.online/~martin/cv.html#top';">🏠 Top</button>
    <button type="button" class="win-btn ns-section-btn" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-about').scrollIntoView({behavior:'smooth'});r.querySelector('.ns-url-input').value='http://splitti.online/~martin/cv.html#about';">📄 About</button>
    <button type="button" class="win-btn ns-section-btn" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-experience').scrollIntoView({behavior:'smooth'});r.querySelector('.ns-url-input').value='http://splitti.online/~martin/cv.html#experience';">💼 Experience (10)</button>
    <button type="button" class="win-btn ns-section-btn" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-education').scrollIntoView({behavior:'smooth'});r.querySelector('.ns-url-input').value='http://splitti.online/~martin/cv.html#education';">🎓 Education</button>
    <button type="button" class="win-btn ns-section-btn" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-volunteering').scrollIntoView({behavior:'smooth'});r.querySelector('.ns-url-input').value='http://splitti.online/~martin/cv.html#volunteering';">🌱 Volunteering</button>
    <button type="button" class="win-btn ns-section-btn" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-skills').scrollIntoView({behavior:'smooth'});r.querySelector('.ns-url-input').value='http://splitti.online/~martin/cv.html#skills';">⚡ Skills</button>
    <button type="button" class="win-btn ns-section-btn" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-languages').scrollIntoView({behavior:'smooth'});r.querySelector('.ns-url-input').value='http://splitti.online/~martin/cv.html#languages';">🌍 Languages</button>
    <button type="button" class="win-btn ns-section-btn" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-recommendations').scrollIntoView({behavior:'smooth'});r.querySelector('.ns-url-input').value='http://splitti.online/~martin/cv.html#recommendations';">✍️ Recommendations</button>
  </nav>
  <div class="ns-cv-viewport win-inset">
    <article class="ns-cv-doc" id="cv-top">
      <table class="retro-table" aria-label="Profile Header">
        <tbody>
          <tr>
            <td class="profile-avatar-cell">
              <div class="pixel-portrait">
                <img src="data:image/png;base64,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" alt="Martin Splitt (216-color Netscape dithered portrait)" style="width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated; display: block;" />
              </div>
              <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #333;">
                <strong>10,190</strong> Followers<br />
                <strong>500+</strong> Connections
              </div>
            </td>
            <td>
              <div class="cv-name">Martin (Naumann) Splitt <span class="cv-pronouns">(He/Him)</span></div>
              <div class="cv-headline">✨ Friendly internet fairy &amp; code magician ✨</div>
              <div class="cv-meta-grid">
                <div><strong>📍 Location:</strong> Zurich, Switzerland</div>
                <div><strong>🏢 Current:</strong> Google (Developer Relations)</div>
                <div><strong>🏅 Certification:</strong> Professional Scrum Master I (Scrum.org)</div>
              </div>
              <div class="cv-social-links">
                <strong>🌐 Links:</strong>
                <a href="https://splitti.online/" target="_blank" rel="noopener">splitti.online</a>
                <span>|</span>
                <a href="https://www.linkedin.com/in/martinsplitt/" target="_blank" rel="noopener">LinkedIn</a>
                <span>|</span>
                <a href="https://bsky.app/profile/martin.isdoingthings.online" target="_blank" rel="noopener">Bluesky</a>
                <span>|</span>
                <a href="https://instagram.com/the_splitti" target="_blank" rel="noopener">Instagram</a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <hr class="retro-hr" />
      <section id="cv-about">
        <h2 class="section-heading">
          <span>1. ABOUT ME</span>
          <a href="#cv-top" class="top-link" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-top').scrollIntoView({behavior:'smooth'});return false;">[▲ Top]</a>
        </h2>
        <table class="retro-table">
          <tbody>
            <tr>
              <td colspan="2">
                <p style="margin-top: 0;">I am a software developer with solid experience in software development for the web, windows, linux and embedded devices, including Android experience.</p>
                <p>I am fluent with <strong>Go, Ruby C/C++/C#, Java / Scala, PHP, Python, Javascript (including node.js)</strong> and intermediate with <strong>Rust</strong>.<br />Windows- and Linux kernel space are familiar topics for me, too.<br />I have deployed and maintained Linux systems, Docker environments, <strong>MySQL / Postgres / Oracle and MongoDB</strong> from the developer and the administrator perspectives, including backup, scaling and failover.</p>
                <p><strong>Modern web architecture</strong> is subject to my daily work and I am used to work with <strong>Git, Mercurial and Subversion</strong>.</p>
                <div class="presentation-box"><strong>🎯 Specialties:</strong> DevOps with Puppet or Ansible, web application development, application, system, and API design.</div>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>C:\README.TXT</strong><br />From: <code>splitti.online</code></td>
              <td>I've been on this blue planet since 1989, started out in northern Germany, moved to eastern Germany and then to Switzerland where I <a href="https://divingfor.fun" target="_blank" rel="noopener">enjoy and teach scuba diving</a> and <a href="https://throughthelens.ch" target="_blank" rel="noopener">take people's portraits</a> (or create <a href="https://arsphotographica.ch" target="_blank" rel="noopener">photo art with old, physical and chemical processes</a>).</td>
            </tr>
          </tbody>
        </table>
      </section>
      <hr class="retro-hr" />
      <section id="cv-experience">
        <h2 class="section-heading">
          <span>2. WORK EXPERIENCE (2005 – PRESENT)</span>
          <a href="#cv-top" class="top-link" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-top').scrollIntoView({behavior:'smooth'});return false;">[▲ Top]</a>
        </h2>
        <table class="retro-table">
          <thead>
            <tr>
              <th style="width: 170px;">Period &amp; Location</th>
              <th>Role, Company &amp; Responsibilities</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="role-date-cell"><strong>Apr 2018 – Present</strong><br /><span>(8 yrs 8 mos+)</span><br /><span>📍 Zurich, Switzerland</span></td>
              <td>
                <div class="role-title">Developer Relations</div>
                <div class="role-company">Google</div>
                <p class="role-desc">Developer Relations Search &amp; Web ecosystem.</p>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>Oct 2014 – Mar 2018</strong><br /><span>(3 yrs 6 mos total)</span><br /><span>📍 Zürich und Umgebung, Schweiz</span></td>
              <td>
                <div class="role-company" style="font-size: 14px;">Archilogic AG</div>
                <div>
                  <div class="role-title">Head Of Engineering</div>
                  <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #444;">Jul 2017 – Mar 2018 (9 mos)</div>
                </div>
                <div class="role-subrole">
                  <div class="role-title">Bit Magician</div>
                  <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #444;">Oct 2014 – Jul 2017 (2 yrs 10 mos)</div>
                  <p class="role-desc">DevOps, server administration, software development (Scala, Python, Javascript).</p>
                </div>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>Apr 2014 – Sep 2014</strong><br /><span>(6 mos)</span><br /><span>📍 Zurich, Switzerland</span></td>
              <td>
                <div class="role-title">Technology Ambassador</div>
                <div class="role-company">Centralway Headquarters AG</div>
                <ul class="role-desc" style="padding-left: 20px;">
                  <li>Internal &amp; external coaching</li>
                  <li>Technology trainings and workshops</li>
                  <li>Conference talks and workshops</li>
                  <li>Fostering cross-team knowledge exchange</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>May 2012 – Sep 2014</strong><br /><span>(2 yrs 5 mos)</span><br /><span>📍 Zurich, Switzerland</span></td>
              <td>
                <div class="role-title">Software Engineer RnD</div>
                <div class="role-company">Centralway</div>
                <ul class="role-desc" style="padding-left: 20px;">
                  <li>Evaluating new technologies</li>
                  <li>Working in different projects as developer, software architect or engineer.</li>
                  <li>Coaching and educating staff, giving talks and documenting system.</li>
                  <li>Quality assurance and Quality management</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>2011 – Apr 2012</strong></td>
              <td>
                <div class="role-title">Software Engineer / Server Admin</div>
                <div class="role-company">HR Matching AG</div>
                <p class="role-desc">Developing new features, assessing code quality and performance, administrating the servers, coordinating developers and freelancers.</p>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>Nov 2010 – Apr 2012</strong><br /><span>(1 yr 6 mos)</span></td>
              <td>
                <div class="role-title">Software-Engineer and Assistant to the CTO</div>
                <div class="role-company">Jobzippers Ltd.</div>
                <p class="role-desc">Assisting our CTO as well as being a Web Developer and the Server-Administrator at once.</p>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>Sep 2010 – May 2011</strong><br /><span>(9 mos)</span><br /><span>📍 Ilmenau, Germany</span></td>
              <td>
                <div class="role-title">Programmer C/C++</div>
                <div class="role-company">Fraunhofer IOSB AST Ilmenau</div>
                <p class="role-desc">C/C++ Programmer for communication interfaces at the institute for energy systems / energy management.</p>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>Jun 2009 – Sep 2010</strong><br /><span>(1 yr 4 mos)</span><br /><span>📍 Germany</span></td>
              <td>
                <div class="role-title">Geschäftsführer</div>
                <div class="role-company">MaNaWare IT Solutions UG (haftungsbeschränkt)</div>
                <p class="role-desc">Wir bieten Web- und Softwareentwicklung, Webdesign, SEO und spezielle IT-Lösungen.</p>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>Jul 2008 – Feb 2009</strong><br /><span>(8 mos)</span><br /><span>📍 Germany</span></td>
              <td>
                <div class="role-title">Junior Webdeveloper</div>
                <div class="role-company">Goolive Deutschland GmbH</div>
                <p class="role-desc">Als Junior Webentwickler primär mit der Arbeit an der firmeneigenen Plattform, sowie Optimierungs- und Internationalisierungsaufgaben betraut gewesen.</p>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>2005 – 2008</strong><br /><span>(3 yrs)</span><br /><span>📍 Germany</span></td>
              <td>
                <div class="role-title">Administrator / Programmer</div>
                <div class="role-company">Säurefliesner Vereinigung e.V.</div>
                <p class="role-desc">Maintaining workstations, Linux servers and the network, developing custom applications and web applications.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <hr class="retro-hr" />
      <section id="cv-education">
        <h2 class="section-heading">
          <span>3. EDUCATION &amp; CERTIFICATIONS</span>
          <a href="#cv-top" class="top-link" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-top').scrollIntoView({behavior:'smooth'});return false;">[▲ Top]</a>
        </h2>
        <table class="retro-table">
          <thead>
            <tr>
              <th style="width: 170px;">Years / Issuer</th>
              <th>Institution / Qualification</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="role-date-cell"><strong>2008 – 2011</strong></td>
              <td>
                <div class="role-title">Technische Universität Ilmenau</div>
                <div class="role-company">Computer Science</div>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>2001 – 2008</strong></td>
              <td>
                <div class="role-title">Gymnasium Großburgwedel</div>
                <div class="role-company">Degree: Abitur</div>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>Certification</strong><br /><span>Issuer: Scrum.org</span></td>
              <td>
                <div class="role-title">Professional Scrum Master Level 1 (PSM I)</div>
                <div class="role-company">Scrum.org</div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <hr class="retro-hr" />
      <section id="cv-volunteering">
        <h2 class="section-heading">
          <span>4. VOLUNTEERING &amp; COMMUNITY TEACHING</span>
          <a href="#cv-top" class="top-link" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-top').scrollIntoView({behavior:'smooth'});return false;">[▲ Top]</a>
        </h2>
        <table class="retro-table">
          <thead>
            <tr>
              <th style="width: 170px;">Dates &amp; Cause</th>
              <th>Role &amp; Organization</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="role-date-cell"><strong>2015 – 2016</strong><br /><span>Science &amp; Technology</span></td>
              <td>
                <div class="role-title">Coach — Railsgirls Zürich</div>
                <p class="role-desc">Coaching women to learn programming with Ruby and Rails.</p>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>Apr 2015</strong><br /><span>Science &amp; Technology</span></td>
              <td>
                <div class="role-title">Coach — Railsgirls Hannover</div>
                <p class="role-desc">Coaching women to learn programming with Ruby and Rails.</p>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>2006 – 2008</strong><br /><span>Education</span></td>
              <td>
                <div class="role-title">Computer programming teacher — Gymnasium Grossburgwedel Fördergruppe</div>
              </td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>2007 – 2008</strong><br /><span>Education</span></td>
              <td>
                <div class="role-title">Computer Skills 101 teacher — Gymnasium Grossburgwedel Fördergruppe</div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <hr class="retro-hr" />
      <section id="cv-skills">
        <h2 class="section-heading">
          <span>5. SKILLS &amp; TECHNICAL ARSENAL</span>
          <a href="#cv-top" class="top-link" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-top').scrollIntoView({behavior:'smooth'});return false;">[▲ Top]</a>
        </h2>
        <table class="retro-table">
          <thead>
            <tr>
              <th>Top Endorsed LinkedIn Skills (10)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="skills-grid">
                  <div class="skill-card"><strong>JavaScript (ES / Node.js / SPAs)</strong><div class="skill-meter" aria-hidden="true"><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span></div></div>
                  <div class="skill-card"><strong>HTML 5 &amp; Semantic Web</strong><div class="skill-meter" aria-hidden="true"><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span></div></div>
                  <div class="skill-card"><strong>CSS / CSS 3</strong><div class="skill-meter" aria-hidden="true"><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span></div></div>
                  <div class="skill-card"><strong>Git (plus Mercurial &amp; SVN)</strong><div class="skill-meter" aria-hidden="true"><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span></div></div>
                  <div class="skill-card"><strong>Linux Server Administration</strong><div class="skill-meter" aria-hidden="true"><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span></div></div>
                  <div class="skill-card"><strong>PHP</strong><div class="skill-meter" aria-hidden="true"><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span></div></div>
                  <div class="skill-card"><strong>MySQL</strong><div class="skill-meter" aria-hidden="true"><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span></div></div>
                  <div class="skill-card"><strong>Unit Testing &amp; QA</strong><div class="skill-meter" aria-hidden="true"><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span></div></div>
                  <div class="skill-card"><strong>Ruby / Ruby on Rails</strong><div class="skill-meter" aria-hidden="true"><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span></div></div>
                  <div class="skill-card"><strong>jQuery</strong><div class="skill-meter" aria-hidden="true"><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span><span class="skill-block"></span></div></div>
                </div>
              </td>
            </tr>
            <tr>
              <td><strong>Additional Languages, Databases &amp; Platforms:</strong> <code>C / C++ / C#</code> · <code>Java / Scala</code> · <code>Python</code> · <code>Perl</code> · <code>WebGL &amp; Three.js</code> · <code>Meteor.js</code> · <code>Socket.io</code> · <code>PostgreSQL</code> · <code>Oracle</code> · <code>MongoDB</code> · <code>OrientDB</code> · <code>Windows &amp; Linux Kernel Space</code> · <code>Android &amp; Embedded Devices</code> · <code>Search &amp; Web Ecosystem</code></td>
            </tr>
          </tbody>
        </table>
      </section>
      <hr class="retro-hr" />
      <section id="cv-languages">
        <h2 class="section-heading">
          <span>6. SPOKEN LANGUAGES</span>
          <a href="#cv-top" class="top-link" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-top').scrollIntoView({behavior:'smooth'});return false;">[▲ Top]</a>
        </h2>
        <table class="retro-table">
          <thead>
            <tr>
              <th>Language</th>
              <th>Proficiency Level</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>🇩🇪 German</strong></td>
              <td>Native or bilingual proficiency</td>
            </tr>
            <tr>
              <td><strong>🇬🇧 English</strong></td>
              <td>Full professional proficiency</td>
            </tr>
            <tr>
              <td><strong>🇷🇺 Russian</strong></td>
              <td>Elementary proficiency</td>
            </tr>
          </tbody>
        </table>
      </section>
      <hr class="retro-hr" />
      <section id="cv-recommendations">
        <h2 class="section-heading">
          <span>7. RECOMMENDATIONS RECEIVED</span>
          <a href="#cv-top" class="top-link" onclick="const r=this.closest('.ns-cv-root');r.querySelector('#cv-top').scrollIntoView({behavior:'smooth'});return false;">[▲ Top]</a>
        </h2>
        <table class="retro-table">
          <thead>
            <tr>
              <th style="width: 210px;">Author &amp; Date</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="role-date-cell"><strong>Dido Grigorov</strong><br /><span>AI Engineer | Author of "Building Large Language Models From Scratch" (Apress) | PhD Candidate in AI</span><br /><br /><span>📅 July 25, 2019</span><br /><em>(Dido was Martin's mentor)</em></td>
              <td><blockquote style="margin: 0; font-style: italic;">"I think to the best professionals as a combination between passion, technical excellence, devotion and team spirit. Well, Martin definitely covers those checkpoints. We met at Centralway where we instantly teamed up as tech ambassadors..."</blockquote></td>
            </tr>
            <tr>
              <td class="role-date-cell"><strong>Human Sahebi</strong><br /><span>Software Engineering Practice Lead at Zühlke Group</span><br /><br /><span>📅 August 1, 2013</span><br /><em>(Worked with Martin on the same team)</em></td>
              <td><blockquote style="margin: 0; font-style: italic;">"Martin is one of the best coders I know. Although he is young, he know many frameworks, architectures and code styles by heart. I really enjoyed working with him because our skill set and work approaches complemented one another..."</blockquote></td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  </div>
  <div class="win-status-bar win-outset-thin">
    <div class="win-status-cell win-inset-flat" style="width: 28px; justify-content: center;">🔒</div>
    <div class="win-status-cell win-inset-flat" style="flex: 1;">Document: Done (Netscape Navigator — splitti.online)</div>
    <div class="win-status-cell win-inset-flat" style="width: 110px;">100% Loaded</div>
  </div>
</div>
