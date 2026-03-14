import React from 'react';
import { motion } from 'framer-motion';
import { 
    Eye, 
    ShieldCheck, 
    Zap, 
    BarChart3, 
    Lock, 
    Globe, 
    Users, 
    Cpu, 
    Activity,
    Search,
    Fingerprint,
    Smartphone,
    Monitor,
    Cloud,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: "easeOut" }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const Features = () => {
    const mainFeatures = [
        {
            icon: <Eye size={40} className="text-indigo-600" />,
            title: "Live Vision AI",
            desc: "Our proprietary computer vision model tracks eye movements, facial orientation, and multiple-person detection in real-time.",
            details: ["Gaze tracking", "Object detection", "Presence verification"]
        },
        {
            icon: <Fingerprint size={40} className="text-indigo-600" />,
            title: "Biometric Auth",
            desc: "Multi-factor authentication using facial recognition and unique behavioral signatures ensure the right person is taking the test.",
            details: ["Face matching", "Keystroke dynamics", "Browser fingerprinting"]
        },
        {
            icon: <Zap size={40} className="text-indigo-600" />,
            title: "Zero-Lag Sync",
            desc: "Instant synchronization between the proctor dashboard and student screen ensures no cheating window goes unnoticed.",
            details: ["WebSocket connectivity", "Sub-100ms latency", "Offline recovery"]
        }
    ];

    const techStack = [
        { icon: <Cpu />, title: "Edge Processing", desc: "Heavy lifting done on device for privacy." },
        { icon: <Activity />, title: "Health Monitoring", desc: "Network and device stability tracking." },
        { icon: <Lock />, title: "Encrypted Streams", desc: "Military-grade data protection." },
        { icon: <Globe />, title: "Global CDN", desc: "Fast access from any institution worldwide." }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header section with mesh background */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-slate-50">
                <div className="absolute inset-0 gradient-mesh opacity-50"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-[0.3em] mb-8"
                    >
                        The Architecture of Trust
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-none"
                    >
                        Every Exam. <br />
                        <span className="text-indigo-600">Uncompromised.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-500 font-medium max-w-2xl mx-auto"
                    >
                        Explore the cutting-edge technology that makes Thinkle the chosen platform for elite academic institutions.
                    </motion.p>
                </div>
            </section>

            {/* Main Features Grid */}
            <section className="py-32">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {mainFeatures.map((feat, i) => (
                            <motion.div 
                                key={i}
                                variants={fadeInUp}
                                initial="initial"
                                whileInView="whileInView"
                                transition={{ delay: i * 0.1 }}
                                className="group p-10 rounded-[3rem] bg-white border border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="mb-10 w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    {feat.icon}
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">{feat.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed mb-8">{feat.desc}</p>
                                <ul className="space-y-4">
                                    {feat.details.map((detail, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                            <CheckCircle2 size={18} className="text-emerald-500" />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Specs Horizontal Reveal */}
            <section className="py-32 bg-slate-900 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500 rounded-full blur-[200px]"></div>
                </div>
                
                <div className="container mx-auto px-6 relative z-10 text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">The Tech Behind the Scenes</h2>
                </div>

                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {techStack.map((tech, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 text-white group hover:bg-white/10 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                                    {tech.icon}
                                </div>
                                <h4 className="text-xl font-black mb-3 tracking-tight">{tech.title}</h4>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">{tech.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Methodology Section */}
            <section className="py-32 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-20">
                        <div className="md:w-1/2">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="relative glass-card p-4 rounded-[4rem]"
                            >
                                <div className="rounded-[3.5rem] overflow-hidden bg-white aspect-square flex items-center justify-center shadow-inner relative">
                                    <div className="absolute inset-0 bg-indigo-600/5 animate-pulse"></div>
                                    <ShieldCheck size={200} className="text-indigo-600 relative z-10 animate-float" />
                                </div>
                            </motion.div>
                        </div>
                        <div className="md:w-1/2 space-y-10">
                            <div className="space-y-4">
                                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Security Without <br className="hidden md:block" /> Intrusion.</h2>
                                <p className="text-lg text-slate-500 font-medium">We believe proctoring should be invisible yet omnipresent. Our AI works in the background, only alerting human proctors when confirmed anomalies occur.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {[
                                    { title: "Browser Lockdown", desc: "Complete isolation of the examination environment." },
                                    { title: "Network Forensics", desc: "Detecting proxy usage and unauthorized connections." },
                                    { title: "Session Replay", desc: "Review any flagged session with frame-by-frame precision." }
                                ].map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-6 items-start"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-1">
                                            <ArrowRight size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 tracking-tight">{item.title}</h4>
                                            <p className="text-slate-500 font-medium">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32">
                <div className="container mx-auto px-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="gradient-indigo p-20 rounded-[4rem] text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200"
                    >
                        <div className="relative z-10 space-y-12">
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">Ready to See It in Action?</h2>
                            <p className="text-xl text-indigo-100 font-medium max-w-xl mx-auto">Join the institutions that have already set the standard for digital examination integrity.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-6">
                                <Link to="/register" className="px-12 py-6 bg-white text-indigo-600 rounded-3xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                                    Start Free Trial
                                </Link>
                                <Link to="/contact" className="px-12 py-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl font-black text-xl hover:bg-white/20 transition-all">
                                    Book a Live Demo
                                </Link>
                            </div>
                        </div>
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <Zap size={300} />
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Features;
