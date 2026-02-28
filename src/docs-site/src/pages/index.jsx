import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import "./landing-modern.css";

export default function Home() {
  return (
    <Layout
      title="ChildSafeNet – AI-Powered Internet Safety for Children"
      description="Protect your kids from phishing, harmful content, and online threats with real-time AI detection and parental controls."
    >
      {/* HERO */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">AI Internet Safety</div>
            <h1>
              Protect Your Child <br />
              <span className="highlight">From Online Dangers</span>
            </h1>
            <p className="hero-subtitle">
              Real-time AI detects phishing, adult content, and malicious sites.  
              Designed for parents who want safer internet experiences for their children.
            </p>

            <div className="hero-cta-group">
              <Link className="btn btn-primary" to="/docs">
                Get Started Free →
              </Link>
              <Link className="btn btn-outline" to="/docs">
                Watch Quick Demo
              </Link>
            </div>

            <div className="hero-trust">
              <div>Protecting 1,200+ children</div>
              <div>•</div>
              <div>Chrome & Edge Compatible</div>
              <div>•</div>
              <div>Developed by TKT Team HUTECH</div>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="./img/hero-mockup.png"
              alt="ChildSafeNet protecting devices"
              className="hero-mockup"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features section-padding">
        <div className="container">
          <h2 className="section-title">Why Parents Choose ChildSafeNet</h2>

          <div className="feature-grid">
            <div className="feature-card">
              <img src="./backdrop/ai-shield.png" alt="AI Detection" className="feature-icon" />
              <h3>Smart AI Detection</h3>
              <p>
                Hybrid ML model identifies phishing, adult content, violence, and malicious websites with high accuracy.
              </p>
            </div>

            <div className="feature-card">
              <img src="./backdrop/parent-control.png" alt="Parental Controls" className="feature-icon" />
              <h3>Age-Appropriate Controls</h3>
              <p>
                Whitelist/blacklist, age-based filtering, detailed activity logs for parents.
              </p>
            </div>

            <div className="feature-card">
              <img src="./backdrop/extension.png" alt="Browser Extension" className="feature-icon" />
              <h3>Lightweight Browser Extension</h3>
              <p>
                Manifest V3 – smooth performance on Chrome & Edge without slowing down browsing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about section-padding bg-light">
        <div className="container narrow">
          <h2 className="section-title">What is ChildSafeNet?</h2>
          <p className="about-text">
            ChildSafeNet is an AI-powered cybersecurity tool built to safeguard children online.  
            It combines advanced machine learning models with real-time browser monitoring to block threats and give parents peace of mind.
          </p>
        </div>
      </section>

      {/* PROJECT DETAILS */}
      <section className="topic section-padding">
        <div className="container topic-grid">
          <div className="topic-visual">
            <img src="./backdrop/topic-illustration.png" alt="Project overview" />
          </div>

          <div className="topic-content">
            <h3>Project Built for the Community</h3>
            <p>
              ChildSafeNet is an academic competition project focused on real-world AI applications in child cybersecurity.  
              The system integrates:
            </p>
            <ul>
              <li>React + Docusaurus (Dashboard & Landing Page)</li>
              <li>ASP.NET Core API</li>
              <li>SQL Server Database</li>
              <li>Chrome/Edge Extension (Manifest V3)</li>
            </ul>

            <Link className="btn btn-outline" to="/docs/project">
              Learn More About the Project →
            </Link>
          </div>
        </div>
      </section>

      {/* POWERED BY + COMMUNITY */}
      <section className="tech-community-section">
        <div className="container text-center">
          <div className="powered-by">
            <h2>Built With</h2>
            <div className="tech-logos">
              <div className="tech-item">
                <img src="./icon/react.svg" alt="React" />
                <span>React</span>
              </div>
              <div className="tech-item">
                <img src="./icon/dotnet.svg" alt=".NET" />
                <span>.NET</span>
              </div>
              <div className="tech-item">
                <img src="./icon/sql.svg" alt="SQL Server" />
                <span>SQL Server</span>
              </div>
              <div className="tech-item">
                <img src="./icon/ai.svg" alt="AI" />
                <span>AI</span>
              </div>
            </div>
          </div>

          <div className="community-join">
            <h2>Join Our Community</h2>
            <p className="community-desc">
              Follow the project, share feedback, or collaborate on building better online safety solutions for children.
            </p>

            <div className="community-buttons">
              <a
                href="https://github.com/NguyenTriBaoThang/Childsafenet"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-github"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                Star on GitHub
              </a>

              <a
                href="https://t.me/childsafenets"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-telegram"
              >
                Join Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER 
      <footer className="site-footer">
        <div className="container">
          <p>
            © {new Date().getFullYear()} ChildSafeNet. Developed for non-profit & academic purposes.
          </p>
          <div className="footer-links">
            <Link to="/docs/privacy">Privacy Policy</Link>
            <span>•</span>
            <Link to="/docs/terms">Terms of Use</Link>
            <span>•</span>
            <a href="https://github.com/yourusername/childsafenets" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>
      */}
    </Layout>
  );
}