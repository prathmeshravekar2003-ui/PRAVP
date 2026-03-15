import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
    ShieldCheck, 
    Target, 
    Globe, 
    CheckCircle2, 
    Award, 
    BookOpen, 
    ChevronRight,
    Users,
    Zap,
    Heart,
    Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Animation Components ---

const wordReveal = {
    initial: { opacity: 0, y: 20 },
    animate: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.08,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
        }
    })
};

const SplitText = ({ text, className }) => {
    return (
        <span className={className}>
            {text.split(' ').map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
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

const TiltCard = ({ children, className, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            whileHover={{ 
                scale: 1.02, 
                rotateY: 5, 
                rotateX: -5,
                transition: { duration: 0.3 }
            }}
            className={`${className} perspective-1000 transform-style-3d`}
        >
            {children}
        </motion.div>
    );
};

const About = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const headerY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
    const imageParallax = useTransform(scrollYProgress, [0.1, 0.4], [0, -80]);
    const springParallax = useSpring(imageParallax, { stiffness: 100, damping: 30 });

    return (
        <motion.div 
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-white italic-none overflow-x-hidden"
        >
            {/* Mission Hero Section */}
            <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-40 overflow-hidden bg-slate-50">
                <div className="absolute inset-0 gradient-mesh opacity-40"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white border border-slate-100 shadow-xl shadow-indigo-50/50 text-indigo-600 mb-8 sm:mb-12"
                    >
                        <ShieldCheck size={18} className="animate-pulse" />
                        <span className="text-[10px] font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase leading-none overflow-hidden whitespace-nowrap">The Foundation of Trust</span>
                    </motion.div>

                    <h1 className="text-4xl sm:text-7xl md:text-9xl font-black text-slate-900 mb-6 sm:mb-10 tracking-tighter leading-[1] sm:leading-[0.85]">
                        <SplitText text="Pioneering the Standards" className="block" />
                        <span className="text-indigo-600 block">
                            <SplitText text="of Academic Integrity." />
                        </span>
                    </h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="text-lg sm:text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed"
                    >
                        We believe education is the currency of the future. Our mission is to protect that value through the world's most advanced, sub-millisecond proctoring ecosystem.
                    </motion.p>
                </div>

                {/* Decorative 3D Elements */}
                <motion.div 
                    animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 -left-20 text-indigo-100 opacity-50 hidden lg:block"
                >
                    <BookOpen size={300} />
                </motion.div>
                <motion.div 
                    animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/3 -right-20 text-indigo-100 opacity-50 hidden lg:block"
                >
                    <Award size={400} />
                </motion.div>
            </section>

            {/* Core Values - Interactive Grid */}
            <section className="py-24 sm:py-40 relative z-10 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
                        {[
                            {
                                icon: <Zap className="text-indigo-600" size={32} />,
                                title: 'Integrity',
                                desc: 'Upholding strict academic standards in every digital session.'
                            },
                            {
                                icon: <Target className="text-indigo-600" size={32} />,
                                title: 'Precision',
                                desc: 'Proprietary models with 99.9% accuracy in behavioral flagging.'
                            },
                            {
                                icon: <Globe className="text-indigo-600" size={32} />,
                                title: 'Scalability',
                                desc: 'Supporting massive institutional loads with sub-100ms sync.'
                            },
                            {
                                icon: <Heart className="text-indigo-600" size={32} />,
                                title: 'Empathy',
                                desc: 'Designing technology that supports students, not scares them.'
                            }
                        ].map((val, i) => (
                            <TiltCard key={i} delay={i * 0.1} className="p-8 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-slate-50 border border-slate-100 shadow- premium-sm hover:shadow-premium group transition-all duration-500">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white flex items-center justify-center mb-6 sm:mb-8 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    {val.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-widest mb-3 sm:mb-4 group-hover:text-indigo-600 transition-colors">{val.title}</h3>
                                <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">{val.desc}</p>
                            </TiltCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Narrative Scroll Experience */}
            <section className="py-24 sm:py-40 bg-slate-900 overflow-hidden relative">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-16 sm:gap-24">
                        <div className="md:w-1/2 space-y-8 sm:space-y-12">
                            <motion.h2 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none"
                            >
                                Beyond <br /> Surveillance: <br /> <span className="text-indigo-400">Trust.</span>
                            </motion.h2>
                            <p className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed">
                                Our journey is defined by the institutions we protect. We don't just build software; we build the infrastructure for fair outcome.
                            </p>
                            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                {[
                                    'Advanced Gaze & Behavioral Mapping',
                                    'Encrypted, Transparent Result Forensics',
                                    'Institutional Grade Compliance Layer'
                                ].map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-4 text-white text-sm sm:text-base font-bold"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        {item}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="md:w-1/2 relative">
                            <motion.div 
                                style={{ y: springParallax }}
                                className="relative rounded-[2.5rem] sm:rounded-[5rem] overflow-hidden border-4 sm:border-8 border-white/5 shadow-2xl z-10"
                            >
                                <img 
                                    src="https://images.unsplash.com/photo-1522071823991-b9671f30c46f?q=80&w=2070" 
                                    alt="Institutional Partnership" 
                                    className="w-full h-[400px] sm:h-[600px] object-cover hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                            </motion.div>
                            {/* Visual Pulse Accent */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Immersive Quote Section */}
            <section className="py-32 sm:py-56 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="max-w-5xl mx-auto"
                    >
                        <Award size={60} className="mx-auto text-indigo-500/20 mb-8 sm:mb-16 sm:size-[100px]" />
                        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] sm:leading-[0.9] mb-10 sm:mb-16">
                            "The integrity of the academic record is the currency of our future. We ensure it <span className="text-indigo-600 italic">never</span> loses value."
                        </h2>
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 sm:w-20 h-1 bg-indigo-600 rounded-full"></div>
                            <div>
                                <p className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-widest">Dr. Sarah Jenkins</p>
                                <p className="text-[10px] sm:text-xs font-black text-indigo-500 uppercase tracking-[0.4em] mt-1">Chief Integrity Officer</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Background Text Accent */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-[0.02]">
                    <div className="text-[300px] font-black leading-none whitespace-nowrap">
                        TRUST INTEGRITY TRUTH FAITH EXCELLENCE
                    </div>
                </div>
            </section>

            {/* Final CTA Overlay */}
            <section className="pb-32 px-6">
                <div className="container mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="gradient-indigo p-10 sm:p-20 rounded-[2.5rem] sm:rounded-[4rem] text-center text-white shadow-premium relative overflow-hidden"
                    >
                        <div className="relative z-10 space-y-8 sm:space-y-10">
                            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-4 sm:mb-8 leading-[1.1] sm:leading-none">Ready to Defend Excellence?</h2>
                            <p className="text-lg sm:text-xl text-indigo-100 max-w-xl mx-auto font-medium">Join the 500+ institutions currently setting the global standard for examination security.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 pt-4 sm:pt-6">
                                <Link to="/register" className="px-10 sm:px-12 py-5 sm:py-6 bg-white text-indigo-600 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl hover:scale-105 transition-all shadow-xl text-center">
                                    Start Free Trial
                                </Link>
                                <Link to="/contact" className="px-10 sm:px-12 py-5 sm:py-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl hover:bg-white/20 transition-all text-center">
                                    Schedule a Consult
                                </Link>
                            </div>
                        </div>
                        {/* Kinetic Pattern Decoration */}
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <Star size={300} className="animate-spin-slow" />
                        </div>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    );
};

export default About;
