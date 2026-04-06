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
  {
    title: "AI Agent References",
    body: "LLM-focused quick, full, and task-scoped references help coding agents navigate the codebase safely.",
  },
];

const demoClips = [
  {
    title: "Root Success",
    src: "img/preview/root-success.gif",
    alt: "Root host success toast preview",
  },
  {
    title: "Light Theme",
    src: "img/preview/light-theme-preview.gif",
    alt: "Light theme toast preview",
  },
  {
    title: "RTL Preview",
    src: "img/preview/rtl-preview.gif",
    alt: "RTL Arabic toast preview",
  },
  {
    title: "Modal Host",
    src: "img/preview/modal-host.gif",
    alt: "Modal host scoped toast preview",
  },
  {
    title: "Sheet Host",
    src: "img/preview/sheet-host.gif",
    alt: "Sheet host scoped toast preview",
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

          <h1 className={styles.title}>
            Build reliable toast UX with a docs-first workflow.
          </h1>
          <p className={styles.subtitle}>
            This site is the central knowledge base for integrating
            <code> react-native-toast-system </code>
            into production React Native apps, from first install to advanced
            host and template behavior.
          </p>

          <div className={styles.actions}>
            <Link
              className={clsx(
                "button button--primary button--lg",
                styles.primaryCta,
              )}
              to="/docs/getting-started"
            >
              Start with Getting Started
            </Link>
            <Link
              className={clsx(
                "button button--secondary button--lg",
                styles.secondaryCta,
              )}
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

          <div className={styles.demoBlock}>
            <div className={styles.demoHeader}>
              <h2 className={styles.demoTitle}>Demo Clips</h2>
              <Link to="/docs/demo/host-aware-flow">
                Open full 12-clip flow
              </Link>
            </div>
            <div className={styles.demoGrid}>
              {demoClips.map((clip) => (
                <article key={clip.title} className={styles.demoCard}>
                  <img
                    src={useBaseUrl(clip.src)}
                    alt={clip.alt}
                    className={styles.demoImage}
                    loading="lazy"
                  />
                  <p className={styles.demoLabel}>{clip.title}</p>
                </article>
              ))}
            </div>
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
              <Link to="/docs/demo/host-aware-flow">Host-Aware Demo Flow</Link>
            </li>
            <li>
              <Link to="/docs/ai-agent-guide">AI Agent Guide</Link>
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
