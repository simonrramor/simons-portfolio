'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { growthTests } from './growth-tests';
import { getGrowthScreenshots } from './growth-screenshots';

const PASSWORD = 'morse-growth';

export default function GrowthCaseStudy() {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [activeTest, setActiveTest] = useState<number | null>(null);

  function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password === PASSWORD) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!unlocked) {
    return (
      <main className={styles.page}>
        <Link href="/" className={styles.back}>Simon Amor / Interactive portfolio</Link>
        <section className={styles.locked} aria-labelledby="locked-title">
          <p className={styles.prompt}>MORSE / GROWTH</p>
          <h1 id="locked-title">Password required</h1>
          <p>This case study is private while the work is in progress.</p>
          <form className={styles.form} onSubmit={unlock}>
            <label className={styles.label} htmlFor="case-study-password">Password</label>
            <div className={styles.inputRow}>
              <input className={styles.input} id="case-study-password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(false); }} autoComplete="current-password" autoFocus />
              <button className={styles.submit} type="submit">Enter</button>
            </div>
            {error && <p className={styles.error} role="alert">That password didn’t work.</p>}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.back}>Simon Amor / Interactive portfolio</Link>
      <article className={styles.caseStudy}>
        <p className={styles.prompt}>MORSE / GROWTH / PRIVATE</p>
        <h1>Morse — Growth</h1>
        <p className={styles.intro}>A record of growth experiments across onboarding, referrals, payments and money movement.</p>
        <p className={styles.summary}>{growthTests.length} experiments</p>
        <div className={styles.archive}>
          <div className={styles.archiveHeader} aria-hidden="true"><span>Experiment</span><span>Effect</span><span>Outcome</span></div>
          <ol>
            {growthTests.map((test, index) => (
              <li key={test.name}>
                <button type="button" className={styles.testRow} data-active={activeTest === index} onMouseEnter={() => setActiveTest(index)} onMouseLeave={() => setActiveTest(null)} onFocus={() => setActiveTest(index)} onBlur={() => setActiveTest(null)}>
                  <span className={styles.testName}>{test.name}</span>
                  <span className={styles.testEffect}>{test.effect}</span>
                  <span className={`${styles.status} ${test.status === 'Shipped' ? styles.shipped : styles.notShipped}`}>{test.status}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        {activeTest !== null && (
          <aside className={styles.preview} aria-live="polite">
            {getGrowthScreenshots(growthTests[activeTest].name).length > 0 ? (
              <div className={styles.previewImages}>
                {getGrowthScreenshots(growthTests[activeTest].name).map((src, imageIndex) => (
                  <div className={styles.previewImageFrame} key={src}>
                    <Image src={src} alt={`${growthTests[activeTest].name} ${imageIndex + 1}`} fill sizes="(max-width: 800px) 100vw, 32vw" />
                  </div>
                ))}
              </div>
            ) : <div className={styles.noScreenshot}>Screenshot not attached</div>}
            <p>{growthTests[activeTest].name}</p>
          </aside>
        )}
      </article>
    </main>
  );
}
