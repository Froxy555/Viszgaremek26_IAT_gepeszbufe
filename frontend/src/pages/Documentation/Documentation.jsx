import React, { useEffect } from 'react';
import './Documentation.css';
import { assets } from '../../assets/assets';

const documents = [
  {
    id: 6,
    title: 'Fejlesztői dokumentáció',
    description: 'Mélyebb technológiai áttekintés: architektúra, API végpontok, környezeti változók és adatszerkezetek.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-icon"><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" /></svg>
    ),
    link: 'https://drive.google.com/file/d/1Ov9_lPOdV9dY0f3hOPJFRq109JnhQhYT/view',
    type: 'document'
  },
  {
    id: 8,
    title: 'Tesztelői dokumentáció',
    description: 'A tesztelési fázis eredményei, minőségbiztosítás, jelentett hibák és azok megoldási forgatókönyvei.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15L11 17L15 13"></path></svg>
    ),
    link: 'https://drive.google.com/file/d/1Y42Ce9XgWd4OIF3a24c0PrZxK7KV6yhp/view?usp=sharing',
    type: 'document'
  },
  {
    id: 7,
    title: 'Felhasználói dokumentáció',
    description: 'Átfogó útmutató az alkalmazás használatához, rendelési folyamatokhoz és profilbeállításokhoz.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    ),
    link: 'https://drive.google.com/file/d/1OnWXZsi9i_Y1YlZotDEMlgtwi_hhneil/view?usp=sharing',
    type: 'document'
  },
  {
    id: 1,
    title: 'Vizsgaremek dokumentáció',
    description: 'A teljes projekt hivatalos vizsgaremek dokumentációja, amely összefoglalja a célokat, tervezést és a megvalósítást.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" /></svg>
    ),
    link: '#', // TODO: user can replace with correct drive link
    type: 'document'
  },
  {
    id: 2,
    title: 'Forráskód',
    description: 'A GépészBüfé teljes forráskódja a GitHub repozitóriumon. Tartalmazza a frontendet, backendet és az admin panelt.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-icon"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
    ),
    link: 'https://github.com/Froxy555/Viszgaremek26_IAT_gepeszbufe',
    type: 'github'
  },
  {
    id: 3,
    title: 'Tevékenységnapló',
    description: 'Napról napra vezetett napló a fejlesztés során elvégzett lépésekről és megoldott problémákról.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
    ),
    link: 'https://docs.google.com/spreadsheets/d/1uFhxUAmtlNWCM8FWj75o2B9jY_3eMFHK/edit?usp=sharing&ouid=108620491123130329208&rtpof=true&sd=true',
    type: 'document'
  },
  {
    id: 4,
    title: 'SQL file',
    description: 'Az adatbázis sémáját, táblakapcsolatait és próbaadatait tartalmazó SQL dump fájl.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-icon"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
    ),
    link: 'https://drive.google.com/drive/folders/1ofNH5Db3DWlSbV7FpOTUkhQD2KtpcMOM?usp=sharing',
    type: 'database'
  },
  {
    id: 5,
    title: 'Google Drive',
    description: 'A projekt összes segédfájlját, médiáit és megosztott dokumentumait tartalmazó közös mappa.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-icon"><path d="m6.94 14.15-3.48 6A2.2 2.2 0 0 0 5.4 23l13.19-.05a2.22 2.22 0 0 0 1.93-1.1L23 18" /><path d="M15.4 9.17 12 .32a2.2 2.2 0 0 0-3.8 0l-7.1 12.3A2.2 2.2 0 0 0 3 16h6.4" /><path d="M12.55 12h8.05a2.2 2.2 0 0 0 1.9-1.1l-3.47-6-8.58 15" /></svg>
    ),
    link: 'https://drive.google.com/drive/folders/12Qz0EjOcNsLHflp2gA4eAXA5TPKis8B2?usp=sharing',
    type: 'drive'
  },
  {
    id: 9,
    title: 'ER diagram',
    description: 'Egyed-Kapcsolat (Entity-Relationship) diagram, a MongoDB / SQL sématervek vizuális ábrázolása.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-icon"><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="9" y="15" width="6" height="6" rx="1" /><path d="M6 9v2a2 2 0 0 0 2 2h2" /><path d="M18 9v2a2 2 0 0 1-2 2h-2" /><path d="M12 13v2" /></svg>
    ),
    link: 'https://drive.google.com/file/d/1QxEUklHuXilhp8re4XKCL5SRFCBsF2BE/view?usp=sharing',
    type: 'diagram'
  },
  {
    id: 10,
    title: 'Prezentáció',
    description: 'A védésre szánt vizsgaremek PPT(x) prezentáció a projekt bemutatására.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-icon"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><polyline points="8 10 12 6 16 10"></polyline><line x1="12" y1="6" x2="12" y2="14"></line></svg>
    ),
    link: 'https://docs.google.com/presentation/d/1Io9W0zxBP7hLPNJXMjuq7PmIdXQO1eGu/edit?usp=sharing&ouid=108620491123130329208&rtpof=true&sd=true',
    type: 'presentation'
  }
];

const Documentation = () => {

  // Görgessünk a lap tetejére belépéskor
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="documentation-page animate-fade-in">
      <div className="documentation-header">
        <h1>Projekt <span>Dokumentáció</span></h1>
        <p>A GépészBüfé projekthez tartozó összes szakmai és hivatalos dokumentum egy helyen összegyűjtve. Kattints a kártyákra a dokumentumok megtekintéséhez.</p>
      </div>

      <div className="documentation-grid">
        {documents.map((doc, index) => (
          <a
            href={doc.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`doc-card animate-fade-up delay-${(index % 5) + 1}`}
            key={doc.id}
          >
            <div className="doc-card-icon-wrapper">
              {doc.icon}
            </div>
            <div className="doc-card-content">
              <h3>{doc.title}</h3>
              <p>{doc.description}</p>
            </div>
            <div className="doc-card-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </a>
        ))}
      </div>


    </div>
  );
};

export default Documentation;
