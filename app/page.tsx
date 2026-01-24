import Header from '@/components/Header';
import CardSlider from '@/components/CardSlider';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <CardSlider />
    </main>
  );
}
