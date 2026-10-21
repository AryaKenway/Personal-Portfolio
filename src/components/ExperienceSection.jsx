/**
 * @file ExperienceSection.jsx
 * @description Experience section shell: heading plus the lazily loaded
 * Mini Metro flight journey.
 */

import { lazy, Suspense } from 'react';
import { getAllMilestones } from '../data/careerRepository.js';
import styles from './ExperienceSection.module.css';

const FlightJourney = lazy(() =>
    import('./experience/FlightJourney.jsx').then((m) => ({ default: m.FlightJourney }))
);

function JourneyLoading() {
    return (
        <div className={styles.mapLoading} aria-hidden="true">Preparing for takeoff…</div>
    );
}

export default function ExperienceSection() {
    const milestones = getAllMilestones();

    return (
        <section className={styles.experienceSection} id="experience">
            <div className={styles.sectionHeading}>
                <div>
                    <p className={styles.eyebrow}>The route so far</p>
                    <h2>Experience, mapped.</h2>
                </div>
                <p className={styles.sectionNote}>
                    Scroll to fly through the journey, one stop at a time.
                </p>
            </div>
            <Suspense fallback={<JourneyLoading />}>
                <FlightJourney milestones={milestones} />
            </Suspense>
        </section>
    );
}
