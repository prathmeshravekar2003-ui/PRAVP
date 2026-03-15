import React from 'react';
import { Mail, Phone, MapPin, Send, ShieldCheck, MessageSquare } from 'lucide-react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-white selection:bg-indigo-100 pt-16 sm:pt-24">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-6 font-black text-[10px] sm:text-xs uppercase tracking-widest">
                        <MessageSquare size={16} />
                        Get In Touch
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tight leading-tight">How can we help?</h1>
                    <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">Have questions about our platform or need technical support? We're here to ensure your institutional success.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-16 sm:mb-24">
                    {/* Contact Cards */}
                    {[
                        {
                            icon: <Mail className="text-indigo-600" size={24} />,
                            title: 'Email Us',
                            value: 'support@thinkleexam.edu',
                            desc: 'Our support team responds within 2 hours.'
                        },
                        {
                            icon: <Phone className="text-emerald-500" size={24} />,
                            title: 'Call Us',
                            value: '+1 (888) 123-4567',
                            desc: 'Mon - Fri, 9am - 6pm EST'
                        },
                        {
                            icon: <MapPin className="text-rose-500" size={24} />,
                            title: 'Visit Us',
                            value: 'Integrity Plaza, Silicon Valley',
                            desc: '123 Tech Way, Suite 400, CA'
                        }
                    ].map((card, i) => (
                        <div key={i} className="bg-slate-50 p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 hover:shadow-xl hover:translate-y-[-5px] transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 sm:mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                {card.icon}
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{card.title}</h3>
                            <p className="text-base sm:text-lg font-bold text-indigo-600 mb-3 sm:mb-4">{card.value}</p>
                            <p className="text-slate-500 font-medium text-xs sm:text-sm leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Contact Form Section */}
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-premium border border-slate-100 p-8 sm:p-12 md:p-16 mb-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 rotate-12">
                        <ShieldCheck className="w-48 h-48 sm:w-[300px] sm:h-[300px]" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 relative z-10">
                        <div className="space-y-6 sm:space-y-8">
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">Send us a message</h2>
                            <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
                                Fill out the form and our team will get back to you with a personalized solution for your institution.
                            </p>
                            
                            <div className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <p className="text-xs sm:text-sm font-bold text-indigo-900 italic-none">GDPR Compliant & Secure Data Handling</p>
                                </div>
                            </div>
                        </div>

                        <form className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest text-[10px]">Full Name</label>
                                    <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest text-[10px]">Email Address</label>
                                    <input type="email" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900" placeholder="john@university.edu" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest text-[10px]">Subject</label>
                                <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900" placeholder="Institutional Licensing" />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest text-[10px]">Message</label>
                                <textarea rows="4" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900 resize-none" placeholder="How can we help?"></textarea>
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center gap-3 px-8 py-4 sm:py-5 gradient-indigo text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:opacity-95 transform transition-all active:scale-[0.98] text-base sm:text-lg">
                                Send Message <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Contact;
