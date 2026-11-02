'use client';

import Image from 'next/image';
import Link from 'next/link';
import CardVideo from './CardVideo';
import { projectTitles, portfolioCards, type ProjectCategory } from './CardSlider';
import styles from './ProjectGrid.module.css';

export default function ProjectGrid({ category, onOpenProject }: { category: ProjectCategory; onOpenProject: (id: number) => void }) {
  return (
    <section className={styles.grid} aria-label={`${category} project grid`} key={category}>
      <div className={styles.columns}>
      {projectTitles.filter(project => project.category === category).map((project, index) => {
        const card = portfolioCards.find(card => card.id === project.id);
        const media = <>
          <div className={`${styles.media} ${project.blurPreview ? styles.blurred : ''}`} style={{ background: project.previewBackground || card?.backgroundColor, aspectRatio: index % 3 === 1 ? '4 / 3' : index % 3 === 2 ? '1 / 1.08' : '1' }}>
            {project.previewVideo && !project.previewVideoAtlas ? (
              <CardVideo enabled src={project.previewVideo} poster={project.preview} autoPlay muted loop playsInline className={styles.video} style={{ objectFit: project.previewBackground || card?.videoScale ? 'contain' : 'cover' }} />
            ) : project.preview ? (
              <Image src={project.preview} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" style={{ objectFit: project.previewBackground || card?.showGlyph ? 'contain' : 'cover', padding: project.previewBackground ? '8%' : undefined, objectPosition: card?.imagePosition }} />
            ) : <span className={styles.placeholder}>{project.title}</span>}
          </div>
          {project.blurPreview && <span className={styles.lock} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" /></svg></span>}
          <span className={styles.caption}>{project.title}</span>
        </>;
        return project.href ? (
          <Link key={project.id} href={project.href} className={styles.tile} aria-label={`${project.title}, password protected case study`}>{media}</Link>
        ) : (
          <button key={project.id} type="button" className={styles.tile} aria-label={`Expand ${project.title}${project.blurPreview ? ', locked' : ''}`} aria-haspopup="dialog" onClick={() => onOpenProject(project.id)}>{media}</button>
        );
      })}
      </div>
    </section>
  );
}
