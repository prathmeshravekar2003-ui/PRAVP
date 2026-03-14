import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Twitter, 
    Linkedin, 
    Github, 
    Mail, 
    ExternalLink,
    Send,
    ShieldCheck
} from 'lucide-react';

const Footer = () => {
    return (
        <footer className="pt-24 pb-12 bg-white border-t border-slate-100">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="md:col-span-4 space-y-8">
                        <Link to="/" className="flex items-center group">
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xl group-hover:scale-105 transition-all duration-500 p-2 overflow-hidden border border-slate-100">
                                <img src="/thinkle.png" alt="Thinkle" className="w-full h-full object-contain" />
                            </div>
                        </Link>
                        <p className="text-slate-500 font-medium leading-relaxed max-w-xs">
                            Revolutionizing academic integrity through advanced AI proctoring and behavioral analytics. Built for institutions that value excellence.
                        </p>
                        <div className="flex items-center gap-5">
                            {[
                                { icon: Twitter, href: '#' },
                                { icon: Linkedin, href: '#' },
                                { icon: Github, href: '#' },
                                { icon: Mail, href: '#' }
                            ].map((social, i) => (
                                <a 
                                    key={i}
                                    href={social.href}
                                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm"
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform Section */}
                    <div className="md:col-span-2 space-y-8">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Platform</h4>
                        <ul className="space-y-4">
                            {['Live Monitoring', 'AI Surveillance', 'Heatmaps', 'Reporting'].map((item) => (
                                <li key={item}>
                                    <Link to="/features" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest block py-1">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Section */}
                    <div className="md:col-span-2 space-y-8">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Company</h4>
                        <ul className="space-y-4">
                            {['About Us', 'Our Methodology', 'Security', 'Contact'].map((item) => (
                                <li key={item}>
                                    <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest block py-1">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Section */}
                    <div className="md:col-span-4 space-y-8">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Stay Updated</h4>
                        <p className="text-sm font-medium text-slate-500">
                            Get the latest updates on academic integrity standards and platform features.
                        </p>
                        <div className="relative">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-900 placeholder:text-slate-400 text-sm transition-all"
                            />
                            <button className="absolute right-2 top-2 bottom-2 px-6 gradient-indigo rounded-xl text-white shadow-lg shadow-indigo-200/50 hover:scale-105 active:scale-95 transition-all">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            © 2026 Institutional Integrity Inc.
                        </p>
                        <div className="hidden md:flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                        <ShieldCheck size={14} /> System Status: All Operational
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
