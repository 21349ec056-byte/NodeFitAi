import { Link } from 'react-router-dom';
import { Activity, Shield, Brain, Utensils, ArrowRight } from 'lucide-react';

export default function Landing() {
    return (
        <div className="landing-page">
            {/* Header */}
            <header className="landing-header">
                <div className="landing-brand">
                    <div className="brand-dot" />
                    <span>nodeFit <span className="light">AI</span></span>
                </div>
                <Link to="/signin" className="btn-text">Sign In</Link>
            </header>

            {/* Hero */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Your AI-Powered Health Companion</h1>
                    <p>Track nutrition, get personalized tasks, and achieve your health goals with intelligent insights.</p>
                    <div className="hero-actions">
                        <Link to="/signup" className="btn-primary btn-lg">
                            Get Started <ArrowRight size={20} />
                        </Link>
                        <Link to="/signin" className="btn-secondary btn-lg">
                            Sign In
                        </Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card">
                        <Activity size={48} />
                        <span>Track Progress</span>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <h2>Everything You Need</h2>
                <div className="feature-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Utensils size={24} />
                        </div>
                        <h3>Food Scanner</h3>
                        <p>Snap a photo of your meal and instantly get calorie counts and nutrition insights.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Brain size={24} />
                        </div>
                        <h3>AI Tasks</h3>
                        <p>Get personalized daily health tasks based on your goals and activity.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Shield size={24} />
                        </div>
                        <h3>Privacy First</h3>
                        <p>All your data stays on your device. No cloud storage, no tracking.</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <h2>Ready to transform your health?</h2>
                <Link to="/signup" className="btn-primary btn-lg">
                    Create Free Account <ArrowRight size={20} />
                </Link>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>© 2026 nodeFit AI. Built with ❤️ for your health.</p>
            </footer>
        </div>
    );
}
