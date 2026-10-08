'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const PASSWORD = 'morse-growth';

export default function GrowthCaseStudy() {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

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
        <p className={styles.intro}>A quick case study about helping people make progress with their money.</p>
        <div className={styles.placeholder}>Case study content goes here.</div>
      </article>
    </main>
  );
}
