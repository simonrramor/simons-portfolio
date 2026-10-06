'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import type { ProjectCategory, ProjectView } from './CardSlider';

interface HeaderProps {
  view: ProjectView;
  onViewChange: (view: ProjectView) => void;
  category: ProjectCategory;
  onCategoryChange: (category: ProjectCategory) => void;
  showWork: boolean;
  exiting?: boolean;
  onViewWork: () => void;
  onReset: () => void;
}

interface CompanyLinkProps {
  href: string;
  label: string;
  logo: string;
}

function CompanyLink({ href, label, logo }: CompanyLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={`${styles.bioLink} ${styles.companyLink}`}>
      <Image src={logo} alt="" aria-hidden="true" width={20} height={20} className={styles.companyLogo} />
    </a>
  );
}

export default function Header({ view, onViewChange, category, onCategoryChange, showWork, exiting = false, onViewWork, onReset }: HeaderProps) {
  return (
    <header className={`${styles.header} ${showWork ? styles.headerWithViews : ''} ${showWork && !exiting ? styles.headerTop : styles.headerCentered} ${exiting ? styles.headerExiting : ''}`}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link href="/about" className={styles.nameAction}>Simon</Link>{' '}
          <button type="button" className={styles.nameAction} onClick={onReset}>Amor</button>
        </div>

        {showWork ? (
          <div className={styles.projectControls}>
          <div className={styles.projectToggle} role="group" aria-label="Project category">
            {(['work', 'fun'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={styles.categoryButton}
                aria-pressed={category === option}
                disabled={exiting}
                onClick={() => onCategoryChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className={styles.projectToggle} role="group" aria-label="Project view">
            {(['list', 'card'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={styles.categoryButton}
                aria-pressed={view === option}
                disabled={exiting}
                onClick={() => onViewChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
          </div>
        ) : (
          <button className={styles.viewWorkButton} onClick={onViewWork}>
            View work
          </button>
        )}
        
        <div className={styles.bio}>
          <p className={styles.bioText}>
            <span className={styles.bioLead}>
              I’m a designer and co-founder of{' '}
              <CompanyLink href="https://morsemoney.com" label="Morse" logo="/icons/company/morse.svg" />
            </span>
            {' '}Previously, I worked at{' '}
            <CompanyLink href="https://spotify.com" label="Spotify" logo="/icons/company/spotify.svg" />
            {' '}and{' '}
            <CompanyLink href="https://monzo.com" label="Monzo" logo="/icons/company/monzo-symbol.png" />
            , and built products for clients including{' '}
            <CompanyLink href="https://google.com" label="Google" logo="/icons/company/google.svg" />
            ,{' '}
            <CompanyLink href="https://android.com" label="Android" logo="/icons/company/android-symbol.png" />
            ,{' '}
            <CompanyLink href="https://youtube.com" label="YouTube" logo="/icons/company/youtube.svg" />
            ,{' '}
            <CompanyLink href="https://natwest.com" label="NatWest" logo="/icons/company/natwest.svg" />
            {' '}and more
          </p>
        </div>
      </div>
    </header>
  );
}
