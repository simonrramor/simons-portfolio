'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CardVideo from './CardVideo';
import { projectTitles, type ProjectCategory, type ProjectListItem } from './CardSlider';
import styles from './ProjectList.module.css';

function PrototypePreview({ project, active }: { project: ProjectListItem; active: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: 'portfolio-preview', active }, '*');
  }, [active]);

  return (
    <div className={`${styles.preview} ${!active ? styles.inactivePreview : ''}`} aria-hidden={!active}>
      <div className={styles.prototypeSquare}>
        {!ready && project.preview && <Image src={project.preview} alt={project.title} fill sizes="(max-width: 768px) 28vw, 36vw" className={styles.previewImage} />}
        <iframe
          ref={frame}
          src={`${project.previewEmbed}?preview=1`}
          title={project.title}
          className={`${styles.prototypePreview} ${!ready ? styles.loadingPrototype : ''}`}
          sandbox="allow-scripts allow-same-origin"
          allow="autoplay"
          tabIndex={-1}
          onLoad={() => {
            setReady(true);
            frame.current?.contentWindow?.postMessage({ type: 'portfolio-preview', active }, '*');
          }}
        />
      </div>
    </div>
  );
}

export default function ProjectList({ category }: { category: ProjectCategory }) {
  const [hovered, setActive] = useState<ProjectListItem | null>(null);
  const [previousCategory, setPreviousCategory] = useState(category);
  const active = hovered?.category === category ? hovered : null;

  if (previousCategory !== category) {
    setPreviousCategory(category);
    setActive(null);
  }

  return (
    <section className={styles.projectList} aria-label={`${category} projects`}>
      <ul>
        {projectTitles.filter(project => project.category === category).map(project => (
          <li key={project.id}>
            {project.href ? (
              <Link href={project.href} className={styles.row} data-active={active?.id === project.id} onMouseEnter={() => setActive(project)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(project)} onBlur={() => setActive(null)} aria-label={`${project.title}, password protected case study`}>
                <span className={styles.rowContent}>{project.title}</span>
              </Link>
            ) : <button
              type="button"
              className={styles.row}
              data-active={active?.id === project.id}
              onMouseEnter={() => setActive(project)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(project)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(project)}
              aria-label={!project.preview ? `${project.title}, preview unavailable` : project.blurPreview ? `${project.title}, locked` : project.title}
            >
              <span className={styles.rowContent}>
                {project.title}
                {!project.preview ? (
                  <span className={styles.spinner} aria-hidden="true" />
                ) : project.blurPreview ? (
                  <svg className={styles.lock} width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 10v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                ) : null}
              </span>
            </button>}
          </li>
        ))}
      </ul>
      {projectTitles.filter(project => project.previewEmbed).map(project => (
        <PrototypePreview key={project.id} project={project} active={active?.id === project.id} />
      ))}
      {active?.preview && !active.previewEmbed && (
        <div className={styles.preview} key={active.id}>
          {active.blurPreview ? (
            <div className={styles.blurredFrame} style={{ aspectRatio: active.previewAspectRatio }}>
              <Image src={active.preview} alt={active.title} fill sizes="(max-width: 768px) 28vw, 36vw" className={styles.blurredPreview} />
              <span className={styles.previewLock} role="img" aria-label="Locked project">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M8 10v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          ) : active.previewVideo ? (
            active.previewVideoAtlas ? (
              <div className={styles.videoAtlasFrame}>
                <CardVideo enabled forceLoad src={active.previewVideo} poster={active.preview} autoPlay muted loop playsInline aria-label={active.title} className={styles.videoAtlas} />
              </div>
            ) : (
              <CardVideo enabled forceLoad src={active.previewVideo} poster={active.preview} autoPlay muted loop playsInline aria-label={active.title} className={styles.previewVideo} />
            )
          ) : (
            <Image src={active.preview} alt={active.title} fill sizes="(max-width: 768px) 28vw, 36vw" className={styles.previewImage} />
          )}
        </div>
      )}
      {active && !active.preview && (
        <div className={styles.preview} key={active.id}>
          <div className={styles.comingSoon}>
            <span>Coming soon</span>
          </div>
        </div>
      )}
    </section>
  );
}
