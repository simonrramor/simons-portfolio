'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

interface HeaderProps {
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
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${styles.bioLink} ${styles.companyLink}`}>
      <Image src={logo} alt="" aria-hidden="true" width={20} height={20} className={styles.companyLogo} />
      <span>{label}</span>
    </a>
  );
}

export default function Header({ showWork, exiting = false, onViewWork, onReset }: HeaderProps) {
  return (
    <header className={`${styles.header} ${showWork && !exiting ? styles.headerTop : styles.headerCentered} ${exiting ? styles.headerExiting : ''}`}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link href="/about" className={styles.nameAction}>Simon</Link>{' '}
          <button type="button" className={styles.nameAction} onClick={onReset}>Amor</button>
        </div>

        {!showWork && (
          <button className={styles.viewWorkButton} onClick={onViewWork}>
            View work
          </button>
        )}
        
        <div className={styles.bio}>
          <p className={styles.bioText}>
            I’m a designer based in London and co-founder of{' '}
            <CompanyLink href="https://morsemoney.com" label="Morse" logo="/icons/company/morse.svg" />
            . Before that, I worked at{' '}
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
            {' '}and more.
          </p>
        </div>
      </div>
    </header>
  );
}
