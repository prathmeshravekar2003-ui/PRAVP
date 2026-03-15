import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { 
    ShieldCheck, 
    Zap, 
    BarChart3, 
    ChevronRight, 
    GraduationCap, 
    Globe, 
    Clock, 
    Target,
    Lock,
    Eye,
    ArrowRight
} from 'lucide-react';

// --- Specialized Animation Components ---

const CountUp = ({ value, duration = 2 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const end = parseFloat(value);
            if (start === end) return;

            let timer = setInterval(() => {
                start += end / (duration * 60);
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(start);
                }
            }, 1000 / 60);

            return () => clearInterval(timer);
        }
    }, [isInView, value, duration]);

    return <span ref={ref}>{Math.floor(count * 10) / 10}{value.toString().includes('+') ? '+' : ''}{value.toString().includes('%') ? '%' : ''}</span>;
};

const TiltCard = ({ children, className }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    const handleMouseMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            className={className}
            style={{ rotateX, rotateY, perspective: 1000 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {children}
        </motion.div>
    );
};

// --- Reusable Variants ---

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.15
        }
    }
};

const wordReveal = {
    initial: { opacity: 0, y: 20 },
    animate: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
        }
    })
};

// Helper for split text
import { useMotionValue } from 'framer-motion';

const SplitText = ({ text, className }) => {
    return (
        <span className={className}>
            {text.split(' ').map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-[0.2em] last:mr-0">
                    <motion.span
                        custom={i}
                        variants={wordReveal}
                        className="inline-block"
                    >
                        {word}
                    </motion.span>
                </span>
            ))}
        </span>
    );
};

const Home = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const blob2Y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const heroImageY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
    const heroImageSpring = useSpring(heroImageY, { stiffness: 100, damping: 30 });

    return (
        <motion.div 
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="min-h-screen bg-slate-50 selection:bg-indigo-100 italic-none overflow-x-hidden"
        >
            {/* Hero Section */}
            <section className="relative pt-28 pb-32 md:pt-48 md:pb-56 overflow-hidden">
                {/* Dynamic Parallax Blobs */}
                <motion.div 
                    style={{ y: blob1Y }}
                    className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] -z-10"
                ></motion.div>
                <motion.div 
                    style={{ y: blob2Y }}
                    className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -z-10"
                ></motion.div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-20">
                        <motion.div 
                            className="md:w-1/2 space-y-12"
                            initial="initial"
                            animate="animate"
                            variants={staggerContainer}
                        >
                            <motion.div 
                                variants={fadeInUp}
                                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white border border-slate-100 shadow-xl shadow-indigo-50/50 text-indigo-600"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                <span className="text-[10px] font-black tracking-[0.3em] uppercase">Architecture of Integrity</span>
                            </motion.div>

                            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-slate-900 leading-[0.9] sm:leading-[0.85] tracking-tighter">
                                <SplitText text="Secure Exams," className="block mb-2" />
                                <span className="text-indigo-600 block">
                                    <SplitText text="Pure Integrity." />
                                </span>
                            </h1>

                            <motion.p 
                                variants={fadeInUp}
                                className="text-lg sm:text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-xl"
                            >
                                Elevate institutional standards with proprietary AI proctoring, sub-100ms sync, and deep behavioral forensics.
                            </motion.p>

                            <motion.div 
                                variants={fadeInUp}
                                className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6"
                            >
                                <Link to="/register" className="px-8 sm:px-12 py-5 sm:py-6 gradient-indigo rounded-2xl sm:rounded-[2rem] font-black text-base sm:text-lg shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-4 group">
                                    Experience the Platform
                                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/about" className="px-8 sm:px-12 py-5 sm:py-6 bg-white text-slate-900 rounded-2xl sm:rounded-[2rem] font-black text-base sm:text-lg border border-slate-200 hover:bg-slate-50 transition-all shadow-sm text-center">
                                    Our Methodology
                                </Link>
                            </motion.div>
                        </motion.div>

                        <motion.div 
                            className="md:w-1/2 relative"
                            style={{ y: heroImageSpring }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="relative z-10 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_48px_80px_-16px_rgba(0,0,0,0.15)] bg-white p-2 sm:p-3">
                                <div className="rounded-[2rem] md:rounded-[3.5rem] overflow-hidden aspect-square sm:aspect-auto">
                                    <img 
                                        src="/premium-hero.png" 
                                        alt="Platform Preview" 
                                        className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000"
                                    />
                                </div>
                            </div>
                            
                            {/* Animated Background Rings */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-indigo-100/30 rounded-full -z-10 animate-[spin_20s_linear_infinite]"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-indigo-50/20 rounded-full -z-10 animate-[spin_30s_linear_infinite_reverse]"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section with Kinetic Counters */}
            <section className="py-24 bg-white border-y border-slate-100 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
                        {[
                            { label: 'Trusted Partners', value: '500+', sub: 'Global Institutions' },
                            { label: 'Integrity Rate', value: '99%', sub: 'Forensic Accuracy' },
                            { label: 'Sessions Saved', value: '2M+', sub: 'Academic Sessions' },
                            { label: 'Latency Speed', value: '85ms', sub: 'Real-time Sync' },
                        ].map((stat, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center group"
                            >
                                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tighter group-hover:text-indigo-600 transition-colors">
                                    <CountUp value={stat.value} />
                                </div>
                                <div className="space-y-0.5 sm:space-y-1">
                                    <span className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] block">{stat.label}</span>
                                    <span className="text-[8px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">{stat.sub}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section - 3D Tilt Cards */}
            <section id="features" className="py-40 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-32">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-indigo-600 font-black uppercase tracking-[0.5em] text-[11px] mb-6"
                        >
                            Proprietary Technology
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 mb-6 sm:mb-10 tracking-tighter leading-tight sm:leading-none"
                        >
                            The Future of <br className="hidden md:block" /> Secure Assessment
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-lg sm:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed"
                        >
                            Built on a foundation of ethical AI and sub-millisecond network architecture.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: <Eye className="text-indigo-600" size={36} />,
                                title: 'Live Vision Engine',
                                desc: 'Advanced eye-tracking and environmental analysis powered by our proprietary Edge-AI models.'
                            },
                            {
                                icon: <ShieldCheck className="text-indigo-600" size={36} />,
                                title: 'Integrity Shield',
                                desc: 'Behavioral forensics that distinguish between natural movement and compromised integrity.'
                            },
                            {
                                icon: <BarChart3 className="text-indigo-600" size={36} />,
                                title: 'Dynamic Analytics',
                                desc: 'Real-time heatmaps and engagement scoring available within seconds of session start.'
                            }
                        ].map((feat, i) => (
                            <TiltCard 
                                key={i} 
                                className="glass-card p-8 sm:p-14 rounded-[2rem] sm:rounded-[4rem] group cursor-pointer shadow-premium"
                            >
                                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-8 sm:mb-12 group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-500 group-hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)]">
                                    {feat.icon && React.cloneElement(feat.icon, { className: "group-hover:text-white transition-colors duration-500 w-8 h-8 sm:w-10 sm:h-10" })}
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tight leading-none">{feat.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed text-base sm:text-lg">{feat.desc}</p>
                            </TiltCard>
                        ))}
                    </div>
                </div>
                
                {/* Visual Depth Accents */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[1000px] h-[1000px] bg-indigo-100/20 rounded-full blur-[160px]"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-100/20 rounded-full blur-[140px]"></div>
            </section>

            {/* How It Works - Kinetic Evolution */}
            <section className="py-40 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-24">
                        <div className="md:w-1/2 order-2 md:order-1">
                            <motion.div 
                                initial="initial"
                                whileInView="animate"
                                variants={staggerContainer}
                                className="grid grid-cols-1 gap-12"
                            >
                                {[
                                    { 
                                        step: '01', 
                                        title: 'Define Standards', 
                                        desc: 'Upload your question bank and set proctoring sensitivity levels with our intuitive setup suite.',
                                        icon: Target 
                                    },
                                    { 
                                        step: '02', 
                                        title: 'Secure Deployment', 
                                        desc: 'Authenticate students via biometric signals and behavior-based verification tokens.',
                                        icon: Lock 
                                    },
                                    { 
                                        step: '03', 
                                        title: 'Instant Validation', 
                                        desc: 'Our AI generates deep-forensic integrity reports within seconds of exam completion.',
                                        icon: Zap 
                                    }
                                ].map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        variants={fadeInUp}
                                        className="flex flex-col sm:flex-row gap-6 sm:gap-10 group"
                                    >
                                        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-xl sm:text-2xl group-hover:bg-indigo-600 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                                            {item.step}
                                        </div>
                                        <div className="pt-0 sm:pt-3">
                                            <h4 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight flex items-center gap-4">
                                                {item.title}
                                                <item.icon size={20} className="text-indigo-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                                            </h4>
                                            <p className="text-base sm:text-xl text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                        <div className="md:w-1/2 order-1 md:order-2">
                             <motion.div 
                                initial={{ opacity: 0, x: 50, rotate: 5 }}
                                whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="relative rounded-[2.5rem] sm:rounded-[5rem] overflow-hidden shadow-premium p-4 sm:p-6 bg-slate-50 border border-slate-200 group"
                            >
                                <div className="rounded-[2rem] sm:rounded-[4rem] overflow-hidden bg-slate-900 aspect-square sm:aspect-[4/3] flex items-center justify-center relative">
                                    <GraduationCap className="text-indigo-500/50 animate-float size-24 sm:size-36 lg:size-[150px]" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 to-transparent mix-blend-overlay"></div>
                                    
                                    {/* Animated UI Overlay Mockup */}
                                    <motion.div 
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute top-6 right-6 sm:top-10 sm:right-10 w-24 sm:w-32 h-12 sm:h-16 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20 flex items-center justify-center"
                                    >
                                        <div className="w-8 sm:w-12 h-1.5 sm:h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                                    </motion.div>
                                </div>
                                <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-20 h-20 sm:w-32 sm:h-32 bg-indigo-600 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                    <ShieldCheck className="size-8 sm:size-12" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Kinetic Entrance */}
            <section className="py-40">
                <div className="container mx-auto px-6 text-center">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="gradient-indigo p-12 sm:p-24 md:p-40 rounded-[2.5rem] sm:rounded-[5rem] relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(79,70,229,0.4)]"
                        >
                            <div className="absolute bottom-0 left-0 p-20 opacity-5 -translate-x-1/2 translate-y-1/2 grayscale rotate-45">
                                <Globe size={600} />
                            </div>
                            <div className="relative z-10 space-y-8 sm:space-y-12">
                                <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[1] sm:leading-[0.9] max-w-5xl mx-auto">
                                    The Standard for <br className="hidden md:block"/> Academic Outcome.
                                </h2>
                                <p className="text-lg sm:text-2xl text-indigo-100 font-medium max-w-xl mx-auto opacity-80 lg:text-3xl">
                                    Join 500+ elite institutions. <br className="hidden sm:block" /> Start your secure journey today.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 pt-4 sm:pt-6">
                                    <Link to="/register" className="px-8 sm:px-14 py-4 sm:py-7 bg-white text-indigo-600 rounded-2xl sm:rounded-[2.5rem] font-black text-xl sm:text-2xl hover:scale-105 hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4">
                                        Get Started <ChevronRight size={32} />
                                    </Link>
                                    <Link to="/contact" className="px-8 sm:px-14 py-4 sm:py-7 bg-indigo-500/30 backdrop-blur-xl border border-indigo-200/20 text-white rounded-2xl sm:rounded-[2.5rem] font-black text-xl sm:text-2xl hover:bg-white hover:text-indigo-600 transition-all text-center">
                                        Book Live Demo
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                </div>
            </section>
        </motion.div>
    );
};

export default Home;
