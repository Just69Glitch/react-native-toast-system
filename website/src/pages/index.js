import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./index.module.css";

const featureCards = [
  {
    title: "API Contract Coverage",
    body: "Public API contracts are documented with explicit options, callbacks, and lifecycle timing.",
  },
  {
    title: "Architecture Notes",
    body: "Guides explain host behavior, overlay boundaries, and integration patterns for production apps.",
  },
  {
    title: "Compatibility Guidance",
    body: "Step-by-step setup details for React Native + Expo teams, including runtime setup and troubleshooting.",
  },
];

export default function Home() {
  const logoSrc = useBaseUrl("img/branding/logo.png");

  return (
    <Layout
      title="Docs"
      description="Documentation hub for react-native-toast-system"
    >
      <main className={clsx("container", styles.home)}>
        <section className={styles.hero}>
          <div className={styles.brand}>
            <img
              src={logoSrc}
              className={styles.logo}
              alt="react-native-toast-system logo"
            />
            <p className={styles.kicker}>React Native Toast Library</p>
          </div>

          <h1 className={styles.title}>Build reliable toast UX with a docs-first workflow.</h1>
          <p className={styles.subtitle}>
            This site is the central knowledge base for integrating
            <code> react-native-toast-system </code>
            into production React Native apps, from first install to advanced host and template behavior.
          </p>

          <div className={styles.actions}>
            <Link
              className={clsx("button button--primary button--lg", styles.primaryCta)}
              to="/docs/getting-started"
            >
              Start with Getting Started
            </Link>
            <Link
              className={clsx("button button--secondary button--lg", styles.secondaryCta)}
              to="/docs/api-reference"
            >
              Open API Reference
            </Link>
          </div>

          <div className={styles.grid}>
            {featureCards.map((card) => (
              <article key={card.title} className={styles.card}>
                <h2 className={styles.cardTitle}>{card.title}</h2>
                <p className={styles.cardBody}>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.quickLinks}>
          <h2>Quick links</h2>
          <ul>
            <li>
              <Link to="/docs/core-concepts">Core Concepts</Link>
            </li>
            <li>
              <Link to="/docs/advanced-guides">Advanced Guides</Link>
            </li>
            <li>
              <Link to="/docs/troubleshooting">Troubleshooting</Link>
            </li>
            <li>
              <Link to="/docs/faq">FAQ</Link>
            </li>
          </ul>
        </section>
      </main>
    </Layout>
  );
}

