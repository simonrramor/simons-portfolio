'use client';

import Image from 'next/image';
import Link from 'next/link';
import CardVideo from './CardVideo';
import GridCaption from './GridCaption';
import { projectTitles, portfolioCards } from './CardSlider';
import styles from './ProjectGrid.module.css';

const work = projectTitles.filter(project => project.category === 'work');
const fun = projectTitles.filter(project => project.category === 'fun');
// Spread both collections through the full grid while retaining their own order.
const mixedProjects = [work, fun].flatMap(projects => projects.map((project, index) => ({ project, position: (index + 0.5) / projects.length }))).sort((a, b) => a.position - b.position).map(item => item.project);

// Choose proportions for the composition, rather than repeating sizes by position.
// Phone UIs get taller frames; landscape photography gets room across the tile.
const tileRatios: Record<number, string> = {
  0: '4 / 3',   // Captr: centre the toolbar in the transparent source canvas.
  1: '9 / 16',  // Blooming sculpture: preserve its vertical growth.
  2: '3 / 4',   // Sling phone photography.
  3: '1 / 2',   // Face tracking portrait video.
  4: '3 / 4',   // Group Sessions close-up phone.
  5: '4 / 3',   // Enhance landscape photography.
  6: '3 / 4',   // Neome floating speaker.
  7: '1 / 1',   // Shared tabs: retain the hand and surrounding space.
  8: '2 / 3',   // Golden Tickets: full arm and phone.
  9: '1 / 1',   // Mostly working head study.
  10: '1 / 1',  // Glyph identity.
  11: '16 / 9', // Cells: wider view of the particle field.
  12: '4 / 5',  // Fold concept.
  13: '1 / 1',  // Morse card: square source and centred rotation.
  14: '4 / 5',  // Flower still life: vase and flower heads together.
  15: '3 / 4',  // Salary sorter: phone against the bag and shirt.
  16: '3 / 4',  // Vino: retain the poster lettering.
  17: '3 / 4', 18: '3 / 4', 19: '3 / 4', // Full phone UIs.
  20: '4 / 3',  // Bills Pots: the landscape phone and hand.
  22: '3 / 4', 23: '3 / 4', 24: '3 / 4',
  26: '1 / 1', 27: '1 / 1', 28: '1 / 1', 29: '1 / 1', 30: '1 / 1',
  31: '3 / 4', 32: '3 / 4', 33: '1 / 1', 34: '3 / 4', 35: '3 / 4',
  36: '1 / 1',  // Christine: square speaker artwork.
};

export default function ProjectGrid({ onOpenProject }: { onOpenProject: (id: number) => void }) {
  return (
    <section className={styles.grid} aria-label="Work and fun project grid">
      <div className={styles.columns}>
      {mixedProjects.map((project) => {
        const card = portfolioCards.find(card => card.id === project.id);
        const media = <>
          <div className={`${styles.media} ${project.blurPreview ? styles.blurred : ''}`} style={{ background: project.previewBackground || card?.backgroundColor, aspectRatio: tileRatios[project.id] || '1 / 1' }}>
            {project.previewVideoAtlas && project.previewVideo ? (
              <div className={styles.atlasViewport}>
                {project.preview && <Image src={project.preview} alt="" fill sizes="(max-width: 600px) 100vw, 33vw" />}
                <CardVideo enabled src={project.previewVideo} data-atlas="heat-map" autoPlay muted loop playsInline className={styles.atlasVideo} />
              </div>
            ) : project.previewVideo ? (
              <CardVideo enabled src={project.previewVideo} poster={project.preview} autoPlay muted loop playsInline className={`${styles.video} ${project.id === 13 ? styles.centeredMorseVideo : ''}`} style={{ objectFit: project.previewBackground || card?.videoScale ? 'contain' : 'cover', transform: project.id === 9 ? 'scale(0.8)' : undefined }} />
            ) : project.preview ? (
              <Image src={project.preview} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" style={{ objectFit: project.previewBackground || card?.showGlyph ? 'contain' : 'cover', padding: project.previewBackground ? '8%' : undefined, objectPosition: project.id === 0 ? 'center' : card?.imagePosition }} />
            ) : <span className={styles.placeholder}>{project.title}</span>}
          </div>
          {project.blurPreview && <span className={styles.lock} aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" /></svg></span>}
          <GridCaption title={project.title} />
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
