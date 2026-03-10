import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  Menu, X, ChevronRight, Calendar, MapPin, Users, Award, 
  CheckCircle2, Play, Info, Target, Lightbulb, ArrowRight,
  Clock, Video, FileText, Mic2, Send, ChevronDown, ExternalLink,
  History, Globe, Heart, Shield, Download, Search, Filter, Trash2
} from 'lucide-react';

// --- Types ---
interface NavItem {
  label: string;
  href: string;
}

interface TimelineItem {
  date: string;
  title: string;
  desc?: string;
}

interface AgendaItem {
  time: string;
  activity: string;
  location?: string;
  desc?: string;
}

// --- Mock Data ---
const NAV_ITEMS: NavItem[] = [
  { label: 'Trang chủ', href: 'home' },
  { label: 'Chủ đề', href: 'theme' },
  { label: 'Thể lệ', href: 'rules' },
  { label: 'Timeline', href: 'timeline' },
  { label: 'Agenda', href: 'agenda' },
  { label: 'Giải thưởng', href: 'awards' },
  { label: 'Đăng ký', href: 'register' },
];

const TIMELINE: TimelineItem[] = [
  { date: '06/04 – 19/04', title: 'Mở đơn đăng ký & Vòng 1', desc: 'Nhận bài dự thi video Online' },
  { date: '27/04', title: 'Công bố Top 5', desc: 'Thí sinh xuất sắc bước vào Vòng 2' },
  { date: '27/04 – 10/05', title: 'Giai đoạn chuẩn bị Vòng 2', desc: 'Nghiên cứu và xây dựng bài diễn thuyết' },
  { date: '05/05', title: 'Tập huấn chuyên sâu', desc: 'Buổi đào tạo cùng Ban Giám khảo' },
  { date: '12/05', title: 'Bán Kết & Chung Kết', desc: 'Sự kiện Offline bùng nổ' },
];

const AGENDA_OVERVIEW: AgendaItem[] = [
  { time: '06/04 - 19/04', activity: 'Vòng 1 (Online)', desc: 'Nộp video qua Form đăng ký' },
  { time: '27/04 - 10/05', activity: 'Chuẩn bị Vòng 2', desc: 'Nộp Slide qua Form bổ sung' },
  { time: '05/05', activity: 'Tập huấn', desc: 'Google Meet / Zoom' },
  { time: '12/05', activity: 'Bán kết (Offline)', desc: 'Trình bày + Hỏi đáp' },
  { time: '12/05', activity: 'Chung kết (Offline)', desc: 'Vấn đáp trực tiếp' },
];

const AGENDA_FINALS: AgendaItem[] = [
  { time: '13:00 - 13:30', activity: 'Check-in', desc: 'Đón khách và ổn định vị trí' },
  { time: '13:30 - 13:45', activity: 'Khai mạc', desc: 'Khai mạc chương trình' },
  { time: '13:45 - 15:50', activity: 'Bán kết', desc: 'Diễn thuyết cá nhân - 5 thí sinh' },
  { time: '15:50 - 16:05', activity: 'Nghỉ giải lao', desc: 'Nghỉ giải lao' },
  { time: '16:05 - 16:35', activity: 'Chung kết', desc: 'Vòng thảo luận - Top 2' },
  { time: '16:35 - 16:45', activity: 'Ban Giám khảo hội ý', desc: 'BGK hội ý và chấm điểm' },
  { time: '16:45 - 17:00', activity: 'Trao giải & Bế mạc', desc: 'Vinh danh Quán quân' },
];

// --- Components ---

const Logo = ({ className = "", size = "text-2xl" }: { className?: string, size?: string }) => (
  <div className={`flex items-center select-none ${className}`}>
    <span className={`text-[#eb0028] font-sans font-extrabold ${size} tracking-[-0.05em]`}>TED</span>
    <span className={`text-[#eb0028] font-sans font-medium ${size} tracking-[-0.05em]`}>x</span>
    <span className={`text-white font-sans font-medium ${size} tracking-[-0.02em] ml-1`}>HCMIU</span>
  </div>
);

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'Ngày', value: timeLeft.days },
    { label: 'Giờ', value: timeLeft.hours },
    { label: 'Phút', value: timeLeft.minutes },
    { label: 'Giây', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-4 md:gap-8">
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 glass-morphism rounded-2xl flex items-center justify-center mb-2 border-ted-red/20">
            <span className="text-2xl md:text-3xl font-display font-bold text-white">
              {unit.value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-white/40 font-bold">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Đối tượng tham gia cuộc thi là ai?",
      a: "Cuộc thi dành cho tất cả các bạn trẻ (sinh viên, học sinh, người đi làm) có độ tuổi từ 16 - 25 trên toàn quốc, có niềm đam mê diễn thuyết và mong muốn chia sẻ những ý tưởng giá trị."
    },
    {
      q: "Tôi có thể đăng ký tham gia theo nhóm không?",
      a: "TEDx HCMIU Speaker Contest là cuộc thi diễn thuyết cá nhân. Do đó, mỗi thí sinh chỉ được đăng ký tham gia với tư cách cá nhân."
    },
    {
      q: "Video dự thi Vòng 1 cần những yêu cầu gì?",
      a: "Video có độ dài từ 2-3 phút, trình bày về một khía cạnh của chủ đề 'VÔ HẠN'. Bạn có thể quay bằng điện thoại, đảm bảo âm thanh rõ ràng và không cần biên tập quá cầu kỳ. Quan trọng nhất là nội dung và cách bạn truyền tải thông điệp."
    },
    {
      q: "Ngôn ngữ dự thi là tiếng Anh hay tiếng Việt?",
      a: "Thí sinh có thể lựa chọn sử dụng tiếng Anh hoặc tiếng Việt. Tuy nhiên, chúng tôi khuyến khích sử dụng ngôn ngữ mà bạn cảm thấy tự tin nhất để truyền tải trọn vẹn ý tưởng của mình."
    },
    {
      q: "Làm sao để biết tôi đã đăng ký thành công?",
      a: "Sau khi nhấn nút 'Gửi đơn đăng ký', màn hình sẽ hiển thị thông báo thành công. Đồng thời, hệ thống sẽ lưu trữ thông tin của bạn và Ban tổ chức sẽ liên hệ qua email trong vòng 48h làm việc."
    }
  ];

  return (
    <section id="faq" className="py-24 relative bg-ted-black/50">
      <div className="container mx-auto px-6">
        <SectionHeading title="Câu hỏi thường gặp" subtitle="FAQ" centered />
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`glass-morphism rounded-2xl overflow-hidden transition-all duration-300 border ${activeIndex === idx ? 'border-ted-red/50 bg-white/5' : 'border-white/5'}`}
            >
              <button 
                onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <span className="text-lg font-bold text-white/90">{faq.q}</span>
                <ChevronDown className={`text-ted-red transition-transform duration-300 ${activeIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-white/60 leading-relaxed border-t border-white/5 mt-2">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Navbar = ({ activeSection, scrollToSection }: { activeSection: string, scrollToSection: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    scrollToSection(id);
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled || isOpen ? 'bg-[#05070F]/95 backdrop-blur-xl py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white/50 hover:text-white transition-colors">
            <ArrowRight className="rotate-180" size={20} />
          </Link>
          <button onClick={() => handleNavClick('home')} className="flex items-center gap-2 group">
            <Logo size="text-xl" />
            <span className="text-white/40 font-display font-medium text-sm hidden lg:block ml-2">Speaker Contest</span>
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.filter(item => item.href !== 'register').map((item) => (
            <button 
              key={item.label} 
              onClick={() => handleNavClick(item.href)} 
              className={`text-sm font-medium transition-colors ${activeSection === item.href ? 'text-ted-red' : 'text-white/70 hover:text-ted-red'}`}
            >
              {item.label}
            </button>
          ))}
          <button 
            onClick={() => handleNavClick('register')} 
            className="bg-ted-red hover:bg-ted-red/90 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 shadow-lg shadow-ted-red/20"
          >
            Đăng ký ngay
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-[#05070F] border-b border-white/10 md:hidden overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col p-8 gap-6">
              {NAV_ITEMS.map((item) => (
                <button 
                  key={item.label} 
                  onClick={() => handleNavClick(item.href)} 
                  className={`text-xl font-bold text-left py-2 border-b border-white/5 ${activeSection === item.href ? 'text-ted-red' : 'text-white/90'}`}
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={() => handleNavClick('register')} 
                className="w-full bg-ted-red text-white py-4 rounded-xl font-bold text-center mt-4"
              >
                Đăng ký ngay
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const SectionHeading = ({ title, subtitle, centered = false }: { title: string, subtitle?: string, centered?: boolean }) => (
  <div className={`mb-16 ${centered ? 'text-center' : ''}`}>
    <motion.span 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="text-ted-red font-bold tracking-widest uppercase text-sm mb-4 block"
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-5xl font-display font-bold leading-tight"
    >
      {title}
    </motion.h2>
  </div>
);

const Hero = ({ scrollToSection }: { scrollToSection: (id: string) => void }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ted-gradient opacity-50 blur-[100px]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-display font-extrabold leading-[0.9] mb-6">
              <Logo size="text-5xl md:text-8xl" className="mb-4" />
              <span className="text-ted-red">Speaker Contest</span> <br />
              <span className="text-white/40">2026</span>
            </h1>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
              <div className="px-4 py-1 border border-ted-red/50 rounded-full text-ted-red font-bold text-sm tracking-widest uppercase bg-ted-red/5">
                Chủ đề năm: VÔ HẠN
              </div>
            </div>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-12 leading-relaxed">
              Cuộc thi tìm kiếm những người trẻ dám nghĩ điều chưa ai nghĩ, dám nói điều chưa ai dám nói, 
              dùng giá trị nội tại để biến những “bức tường” thành “cánh cửa” dẫn đến chân trời vô cực.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button onClick={() => scrollToSection('register')} className="bg-ted-red hover:bg-ted-red/90 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all group">
                Đăng ký tham gia <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => scrollToSection('rules')} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
                Xem thể lệ
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-white/40 uppercase tracking-[0.2em]">Thời gian còn lại để đăng ký</p>
              <CountdownTimer targetDate="2026-04-19T23:59:59" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Infinity Element */}
      <motion.div 
        style={{ y: y1, opacity }}
        className="absolute right-[-10%] top-1/4 w-[600px] h-[600px] opacity-20 hidden lg:block pointer-events-none"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full text-ted-red animate-pulse">
          <path d="M30,50 C30,35 45,35 50,50 C55,65 70,65 70,50 C70,35 55,35 50,50 C45,65 30,65 30,50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </motion.div>
    </section>
  );
};

const ThemeSection = () => {
  return (
    <section id="theme" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square rounded-3xl overflow-hidden group"
          >
            <div className="w-full h-full bg-gradient-to-br from-ted-red/20 to-ted-black flex items-center justify-center p-12">
              <div className="relative w-full aspect-square max-w-[300px] flex items-center justify-center">
                <div className="absolute inset-0 bg-ted-red/10 rounded-full blur-3xl animate-pulse" />
                <svg viewBox="0 0 100 100" className="w-full h-full text-ted-red relative z-10">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M50 25 L50 75 M25 50 L75 50" stroke="currentColor" strokeWidth="0.2" opacity="0.5" />
                  <circle cx="50" cy="50" r="8" fill="currentColor" className="animate-pulse" />
                  <path d="M35 50 Q35 65 50 65 Q65 65 65 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M50 65 V75 M40 75 H60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ted-black via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10">
              <h3 className="text-6xl font-display font-bold text-white tracking-tighter">VÔ HẠN</h3>
            </div>
          </motion.div>

          <div>
            <SectionHeading title="Chủ đề năm: VÔ HẠN" subtitle="Chủ đề" />
            <div className="space-y-6 text-white/70 text-lg leading-relaxed">
              <p>
                Con người vốn mang trong mình tiềm năng vô hạn và không thể đo đếm. Thế nhưng, điều kìm hãm ta vốn không phải thế giới rộng lớn ngoài kia, mà là những rào cản vô hình do chính ta vẽ nên trong tâm trí.
              </p>
              <p>
                Những rào cản ấy được dựng lên từ nỗi sợ và sự e dè, lớn dần theo từng lần ta chọn an toàn thay vì lựa chọn tin vào bản thân. Ta tự thu nhỏ ước mơ vì sợ thất bại, tự chùn bước trước cả những rủi ro chưa kịp xảy ra và dùng hoài nghi đóng chặt lại cánh cửa cơ hội của chính mình.
              </p>
              <p className="text-white font-medium border-l-4 border-ted-red pl-6 italic">
                "Chỉ khi con người đủ can đảm, đủ dũng khí để bước qua những dây leo trói buộc vô hình ấy để nghĩ điều chưa ai nghĩ, nói điều chưa ai dám nói, làm điều trái tim thôi thúc, ta sẽ nhận ra: giới hạn chưa từng tồn tại."
              </p>
            </div>
          </div>
        </div>

        {/* 4 Pillars */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
          {[
            { label: 'Truth', content: 'Người trẻ sở hữu tuổi trẻ, luôn khao khát và mong chờ về một tương lai đang chờ đón mình trước mắt.' },
            { label: 'Tension', content: 'Nhưng họ thường bị kẹt lại trong trạng thái “tự diễn tập” về sự thất bại, tự vẽ nên những rào cản âu lo.' },
            { label: 'Motivation', content: 'Mong muốn chứng minh rằng rủi ro lớn nhất không phải là thất bại, mà là đứng yên một chỗ.' },
            { label: 'Insight', content: 'Chỉ khi vượt qua nỗi sợ tự thân, họ mới chạm được đến phiên bản vô hạn của chính mình.' },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-morphism p-8 rounded-2xl hover:bg-white/10 transition-all"
            >
              <span className="text-ted-red font-bold text-xs uppercase tracking-widest mb-4 block">{item.label}</span>
              <p className="text-white/80 leading-relaxed">{item.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const MeaningSection = () => (
  <section className="py-24 bg-white/5">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-8">Ý nghĩa đặc biệt của năm 2026</h2>
        <div className="p-8 glass-morphism rounded-3xl border-ted-red/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-9xl font-display font-black text-white/5">1</div>
          <p className="text-xl md:text-2xl font-light leading-relaxed text-white/90">
            Năm 2026 mang năng lượng của con số 1 (2+0+2+6=10 → 1). Con số 1 tượng trưng cho khởi đầu, bản lĩnh tiên phong và tinh thần dẫn dắt. 
            <span className="text-ted-red font-bold"> “VÔ HẠN”</span> không chỉ là một chủ đề, mà còn là tinh thần để bứt phá, để tin rằng mỗi cá nhân đều có khả năng tạo ra bước ngoặt cho chính mình.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: <Info className="text-ted-red" />, title: 'Ý nghĩa', content: '“VÔ HẠN” đại diện cho tiềm năng không giới hạn. Nếu không tận dụng, sự hoài nghi sẽ biến chúng thành hố đen nuốt chửng chính ta.' },
          { icon: <Lightbulb className="text-ted-red" />, title: 'Thông điệp', content: 'Hãy để ta của năm số 1 được chạm tới điểm “vô cực” bằng cách bước qua ngưỡng cửa hoài nghi, trở thành “chìa khóa” kiến tạo thực tại.' },
          { icon: <Target className="text-ted-red" />, title: 'Mục tiêu', content: 'Giúp khán giả nhận diện giới hạn tự tạo, khơi gợi can đảm lựa chọn điều không tưởng và mở rộng mindset qua từng cánh cửa.' },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 border border-white/10 rounded-2xl hover:border-ted-red/50 transition-all"
          >
            <div className="mb-6">{item.icon}</div>
            <h3 className="text-2xl font-display font-bold mb-4">{item.title}</h3>
            <p className="text-white/60 leading-relaxed">{item.content.replace('mindset', 'tư duy')}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const SpeakerContestIntro = () => (
  <section className="py-24">
    <div className="container mx-auto px-6">
      <div className="glass-morphism p-12 rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-ted-red/5 blur-[100px]" />
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Cuộc thi Diễn giả</h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Điểm đến đầu tiên trên hành trình khai sáng chiếc chìa khóa nội tại. Đây là hành động quyết liệt để dẹp tan những rào cản vô hình, mở đầu cho chuỗi các hoạt động bứt phá trong năm 2026.
            </p>
            <div className="flex items-center gap-4 text-ted-red font-bold text-lg">
              <Mic2 />
              <span>Dùng giá trị nội tại để chứng minh sự tồn tại của những chân trời không giới hạn.</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <Users className="text-ted-red mb-4" />
              <h4 className="font-bold mb-2">Đối tượng</h4>
              <p className="text-sm text-white/60">Bạn trẻ 18–25 tuổi tại TP.HCM hoặc các tỉnh thành lân cận (có thể tham gia Offline).</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <Award className="text-ted-red mb-4" />
              <h4 className="font-bold mb-2">Cơ hội</h4>
              <p className="text-sm text-white/60">Trở thành diễn giả chính thức tại sự kiện TEDx Talks 2026 của TEDx HCMIU</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TimelineSection = () => (
  <section id="timeline" className="py-24 bg-white/5">
    <div className="container mx-auto px-6">
      <SectionHeading title="Hành trình bứt phá" subtitle="Timeline" centered />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Vertical Line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-ted-red via-ted-red/50 to-transparent hidden md:block" />
        
        <div className="space-y-12">
          {TIMELINE.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                <span className="text-ted-red font-display font-bold text-xl mb-2 block">{item.date}</span>
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div>
              
              <div className="relative z-10 w-12 h-12 rounded-full bg-ted-black border-4 border-ted-red flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-ted-red animate-ping" />
              </div>
              
              <div className="flex-1 hidden md:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const RulesSection = () => {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <section id="rules" className="py-24">
      <div className="container mx-auto px-6">
        <SectionHeading title="Thể lệ cuộc thi" subtitle="Thể lệ" centered />
        
        <div className="flex justify-center gap-4 mb-12">
          <button 
            onClick={() => setActiveTab(1)}
            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 1 ? 'bg-ted-red text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
          >
            Vòng 1: Online
          </button>
          <button 
            onClick={() => setActiveTab(2)}
            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 2 ? 'bg-ted-red text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
          >
            Vòng 2: Offline
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 1 ? (
            <motion.div 
              key="tab1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              <div className="glass-morphism p-10 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Video className="text-ted-red" />
                  <h3 className="text-2xl font-bold">Đề bài Vòng 1</h3>
                </div>
                <p className="text-xl font-medium mb-6 italic">“Cơ hội là do may mắn” hay “Cơ hội là do cách nhìn”?</p>
                <p className="text-white/70 leading-relaxed mb-8">
                  Hãy kể về một tình huống mà số đông xem đó là một “bức tường” (rủi ro, thất bại, biến động, định kiến), nhưng bạn lại nhìn thấy một “cánh cửa”. Điều gì trong nội lực của bạn đã giúp bạn giữ vững góc nhìn đó? Bạn đã chứng minh lựa chọn của mình là đúng bằng cách nào?
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-ted-red shrink-0 mt-1" size={18} />
                    <span className="text-sm text-white/80">Quay video 5–7 phút</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-ted-red shrink-0 mt-1" size={18} />
                    <span className="text-sm text-white/80">Nội dung 100% nguyên bản, không đạo văn</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-ted-red shrink-0 mt-1" size={18} />
                    <span className="text-sm text-white/80">Hình ảnh và âm thanh đảm bảo chất lượng</span>
                  </div>
                </div>
              </div>
              <div className="bg-ted-red/5 border border-ted-red/20 p-10 rounded-3xl flex flex-col justify-center">
                <h4 className="text-ted-red font-bold uppercase tracking-widest text-sm mb-4">Kết quả</h4>
                <p className="text-3xl font-display font-bold mb-6">Ban Giám khảo lựa chọn Top 5 thí sinh bước vào Vòng 2</p>
                <div className="flex items-center gap-4 text-white/60">
                  <Clock size={20} />
                  <span>Thời gian: 06/04/2026 – 19/04/2026</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="tab2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass-morphism p-10 rounded-3xl">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Mic2 className="text-ted-red" /> Bán kết
                  </h3>
                  <p className="text-white/70 mb-6">
                    Chọn một định kiến, rào cản hoặc “hố đen” trong thế giới hiện nay (Kinh tế, Công nghệ, Nghệ thuật, Tâm lý). Tái định nghĩa nó và chứng minh: “Bức tường” thực chất là một “Cánh cửa” dẫn đến vô cực.
                  </p>
                  <ul className="space-y-3 text-sm text-white/60">
                    <li>• Tối đa 15 phút trình bày + 5 phút Hỏi & Đáp</li>
                    <li>• Không sử dụng giấy hoặc điện thoại để đọc</li>
                    <li>• Được phép sử dụng Slide hỗ trợ</li>
                  </ul>
                </div>
                <div className="glass-morphism p-10 rounded-3xl border-ted-red/30">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Target className="text-ted-red" /> Chung kết
                  </h3>
                  <p className="text-white/70 mb-6">
                    Vấn đáp Offline cùng Ban Giám khảo để làm rõ lập luận, chiều sâu tư duy và khả năng phản biện trước những góc nhìn đa chiều.
                  </p>
                  <ul className="space-y-3 text-sm text-white/60">
                    <li>• Thời lượng: 10 phút/thí sinh</li>
                    <li>• Không chuẩn bị trước câu hỏi</li>
                    <li>• Chọn 01 Quán quân và 01 Á Quân</li>
                  </ul>
                </div>
              </div>
              <div className="p-8 bg-ted-red text-white rounded-3xl text-center">
                <p className="text-xl font-bold italic">
                  "Bài diễn thuyết của Quán quân sẽ trở thành một trong những bài Talks chính thức tại sự kiện TEDx Talks 2026 của TEDx HCMIU"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const AgendaSection = () => (
  <section id="agenda" className="py-24 bg-white/5">
    <div className="container mx-auto px-6">
      <SectionHeading title="Chương trình chi tiết" subtitle="Agenda" centered />
      
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h3 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
            <Calendar className="text-ted-red" /> Tổng quan các giai đoạn
          </h3>
          <div className="space-y-4">
            {AGENDA_OVERVIEW.map((item, idx) => (
              <div key={idx} className="flex gap-6 p-6 glass-morphism rounded-2xl border-white/5">
                <div className="font-bold text-ted-red whitespace-nowrap">{item.time}</div>
                <div>
                  <div className="font-bold mb-1">{item.activity}</div>
                  <div className="text-sm text-white/50">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
            <Clock className="text-ted-red" /> Ngày Bán kết & Chung kết (12/05)
          </h3>
          <div className="space-y-4">
            {AGENDA_FINALS.map((item, idx) => (
              <div key={idx} className="flex gap-6 p-4 border-b border-white/10 hover:bg-white/5 transition-all">
                <div className="text-sm font-mono text-white/40 pt-1">{item.time}</div>
                <div>
                  <div className="font-bold">{item.activity}</div>
                  <div className="text-xs text-white/40">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const AwardsSection = () => (
  <section id="awards" className="py-24">
    <div className="container mx-auto px-6">
      <SectionHeading title="Cơ cấu giải thưởng" subtitle="Giải thưởng" centered />
      
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { title: 'Giải Nhất', color: 'border-ted-red', icon: <Award size={48} className="text-ted-red" />, items: ['Hiện kim hấp dẫn', 'Giấy chứng nhận Quán quân', 'Quà từ NTT và BTC', 'Suất diễn giả TEDx Talks 2026'] },
          { title: 'Giải Nhì', color: 'border-white/20', icon: <Award size={48} className="text-white/40" />, items: ['Hiện kim', 'Giấy chứng nhận Á quân', 'Quà từ NTT và BTC'] },
          { title: 'Top 5', color: 'border-white/10', icon: <Award size={48} className="text-white/20" />, items: ['Giấy chứng nhận Top 5', 'Quà từ NTT và BTC', 'Cơ hội kết nối chuyên gia'] },
        ].map((award, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -10 }}
            className={`p-10 rounded-[2rem] border-2 ${award.color} glass-morphism flex flex-col items-center text-center`}
          >
            <div className="mb-6">{award.icon}</div>
            <h3 className="text-3xl font-display font-bold mb-8">{award.title}</h3>
            <ul className="space-y-4 text-white/60 mb-8">
              {award.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-ted-red" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthYear: '',
    organization: '',
    location: '',
    videoLink: '',
    topicTitle: '',
    description: '',
    canAttendOffline: 'yes',
    agreed: false
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.phone.length < 10) {
      alert('Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    if (!formData.videoLink.startsWith('http')) {
      alert('Link video phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        // Scroll to the register section instead of top of page
        const element = document.getElementById('register');
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="register" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 ted-gradient opacity-20 pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Sẵn sàng bứt phá?</h2>
            <div className="inline-block px-6 py-2 bg-ted-red/10 border border-ted-red/30 rounded-full text-ted-red font-bold mb-6">
              Hạn chót Vòng 1: 19/04/2026
            </div>
            <p className="text-xl text-white/60">Hãy để tiếng nói của bạn trở thành chiếc chìa khóa mở ra chân trời vô hạn.</p>
          </div>

          <div className="glass-morphism p-8 md:p-12 rounded-[3rem]">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-ted-red/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-ted-red/30">
                  <CheckCircle2 size={48} className="text-ted-red" />
                </div>
                <h3 className="text-4xl font-bold mb-6">Đăng ký thành công!</h3>
                <p className="text-xl text-white/60 mb-12 max-w-lg mx-auto leading-relaxed">
                  Cảm ơn bạn đã tham gia TEDx HCMIU Speaker Contest 2026. <br />
                  Hành trình bứt phá giới hạn của bạn bắt đầu từ đây. 
                  Hãy kiểm tra email thường xuyên để nhận thông báo mới nhất từ BTC.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto mb-12">
                  <a 
                    href="https://facebook.com/tedxhcmiu" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl font-bold transition-all"
                  >
                    Theo dõi Fanpage
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center gap-2 bg-ted-red hover:bg-ted-red/90 py-4 rounded-xl font-bold transition-all"
                  >
                    Tham gia Zalo Group
                  </a>
                </div>

                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-white/40 hover:text-ted-red font-medium transition-colors"
                >
                  Gửi đơn đăng ký khác
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/50 uppercase tracking-widest">Họ và tên</label>
                    <input 
                      required
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-ted-red focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/50 uppercase tracking-widest">Email</label>
                    <input 
                      required
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@gmail.com" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-ted-red focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/50 uppercase tracking-widest">Số điện thoại</label>
                    <input 
                      required
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="090xxxxxxx" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-ted-red focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/50 uppercase tracking-widest">Năm sinh</label>
                    <input 
                      required
                      type="number" 
                      name="birthYear"
                      value={formData.birthYear}
                      onChange={handleChange}
                      placeholder="200x" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-ted-red focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/50 uppercase tracking-widest">Trường / Đơn vị</label>
                    <input 
                      required
                      type="text" 
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="ĐH Quốc Tế - ĐHQG TP.HCM" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-ted-red focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/50 uppercase tracking-widest">Link video dự thi vòng 1 (Drive/Youtube/TikTok)</label>
                  <input 
                    required
                    type="url" 
                    name="videoLink"
                    value={formData.videoLink}
                    onChange={handleChange}
                    placeholder="https://..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-ted-red focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/50 uppercase tracking-widest">Chủ đề / Tiêu đề bài nói</label>
                  <input 
                    required
                    type="text" 
                    name="topicTitle"
                    value={formData.topicTitle}
                    onChange={handleChange}
                    placeholder="Ví dụ: Vượt qua nỗi sợ thất bại" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-ted-red focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/50 uppercase tracking-widest">Mô tả ngắn về bài dự thi</label>
                  <textarea 
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tóm tắt nội dung bài nói của bạn..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-ted-red focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-white/50 uppercase tracking-widest">Bạn có thể tham gia trực tiếp tại TP.HCM?</span>
                    <select 
                      name="canAttendOffline"
                      value={formData.canAttendOffline}
                      onChange={handleChange}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none"
                    >
                      <option value="yes">Có</option>
                      <option value="no">Không</option>
                    </select>
                  </div>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      required
                      type="checkbox" 
                      name="agreed"
                      checked={formData.agreed}
                      onChange={handleChange}
                      className="w-5 h-5 accent-ted-red"
                    />
                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">Tôi đồng ý với các thể lệ và quy định của cuộc thi.</span>
                  </label>
                </div>

                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full bg-ted-red hover:bg-ted-red/90 text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  {loading ? 'Đang gửi...' : (
                    <>Gửi đơn đăng ký <Send size={20} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ showNav = true }: { showNav?: boolean }) => (
  <footer className="py-20 border-t border-white/10">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 lg:col-span-2">
          <a href="#home" className="flex items-center gap-2 mb-6">
            <Logo size="text-3xl" />
          </a>
          <p className="text-white/40 max-w-md leading-relaxed">
            Cuộc thi tìm kiếm những tiếng nói truyền cảm hứng, dám bứt phá giới hạn và kiến tạo những giá trị mới cho cộng đồng.
          </p>
        </div>
        {showNav && (
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm">Điều hướng</h4>
            <ul className="space-y-4 text-white/40">
              {NAV_ITEMS.map(item => (
                <li key={item.label}><a href={`#${item.href}`} className="hover:text-ted-red transition-colors">{item.label}</a></li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h4 className="font-bold mb-6 uppercase tracking-widest text-sm">Liên hệ</h4>
          <ul className="space-y-4 text-white/40">
            <li>Email: tedxhcmiu@gmail.com</li>
            <li>Fanpage: TEDx HCMIU</li>
            <li>Địa chỉ: ĐH Quốc Tế - ĐHQG TP.HCM</li>
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
        <p className="text-white/20 text-sm">
          © 2026 TEDx HCMIU Speaker Contest. This independent TEDx event is operated under license from TED.
        </p>
        <div className="flex gap-6">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-ted-red hover:border-ted-red transition-all group"
          >
            <ChevronDown className="rotate-180 group-hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  </footer>
);

// --- Portal Components ---

const MainNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled || isOpen ? 'bg-[#05070F]/95 backdrop-blur-xl py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/#about" className="text-sm font-medium text-white/70 hover:text-ted-red transition-colors">Về chúng tôi</Link>
          <Link to="/#events" className="text-sm font-medium text-white/70 hover:text-ted-red transition-colors">Sự kiện</Link>
          <Link to="/speaker-contest" className="relative bg-ted-red hover:bg-ted-red/90 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 shadow-lg shadow-ted-red/20">
            Speaker Contest
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </Link>
        </div>

        <button className="md:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-[#05070F] border-b border-white/10 md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-8 gap-6">
              <Link to="/#about" onClick={() => setIsOpen(false)} className="text-xl font-bold text-white/90">Về chúng tôi</Link>
              <Link to="/#events" onClick={() => setIsOpen(false)} className="text-xl font-bold text-white/90">Sự kiện</Link>
              <Link to="/speaker-contest" onClick={() => setIsOpen(false)} className="text-xl font-bold text-ted-red">Speaker Contest</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const PortalHero = () => (
  <section className="relative min-h-[80vh] flex items-center pt-20 overflow-hidden">
    <div className="absolute inset-0 z-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ted-gradient opacity-30 blur-[120px]" />
    </div>
    <div className="container mx-auto px-6 relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Logo size="text-6xl md:text-9xl" className="justify-center mb-8" />
        
        <div className="inline-block px-6 py-2 bg-ted-red/10 border border-ted-red/30 rounded-full text-ted-red font-bold mb-8 uppercase tracking-widest text-sm">
          Explore our Sự kiện đang diễn ra
        </div>

        <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed">
          Nơi những ý tưởng giá trị được lan tỏa, kết nối cộng đồng và khơi nguồn cảm hứng cho thế hệ trẻ tại Đại học Quốc tế - ĐHQG TP.HCM.
        </p>
        <div className="flex flex-col items-center gap-6">
          <Link to="/speaker-contest" className="relative bg-ted-red hover:bg-ted-red/90 text-white px-10 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all group shadow-2xl shadow-ted-red/40">
            Speaker Contest 2026 
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            1 sự kiện đang mở đơn đăng ký
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const AboutTEDx = () => (
  <section id="about" className="py-24 bg-white/5">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeading title="Lan tỏa những ý tưởng giá trị" subtitle="Về chúng tôi" />
          <div className="space-y-6 text-white/70 text-lg leading-relaxed">
            <p>
              TEDx là chương trình gồm các sự kiện địa phương, tự tổ chức, mang mọi người lại gần nhau để chia sẻ trải nghiệm giống như TED. Tại sự kiện TEDx, các video TED Talks và các diễn giả trực tiếp kết hợp để khơi dậy thảo luận và kết nối sâu sắc.
            </p>
            <p>
              TEDxHCMIU tự hào là một trong những cộng đồng TEDx năng động nhất, nơi hội tụ những tâm hồn khao khát kiến thức và mong muốn tạo ra thay đổi tích cực thông qua sức mạnh của ngôn từ.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-ted-red mb-1">5</div>
              <div className="text-xs text-white/40 uppercase tracking-widest">Năm hoạt động</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ted-red mb-1">10+</div>
              <div className="text-xs text-white/40 uppercase tracking-widest">Sự kiện</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ted-red mb-1">15+</div>
              <div className="text-xs text-white/40 uppercase tracking-widest">Diễn giả</div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-ted-red/10 border border-white/10 bg-black"
        >
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/Uf-EkmlBO2E?start=273" 
            title="TEDxHCMIU Video" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </motion.div>
      </div>
    </div>
  </section>
);

const PastEvents = () => {
  return (
    <section id="events" className="py-24">
      <div className="container mx-auto px-6">
        <SectionHeading title="Các sự kiện đã diễn ra" subtitle="Lịch sử" centered />
        <div className="max-w-4xl mx-auto">
          <div className="glass-morphism p-12 rounded-[3rem] text-center border-dashed border-white/10">
            <History className="mx-auto text-white/20 mb-6" size={64} />
            <h3 className="text-2xl font-display font-bold text-white/40 mb-4 italic">To be updated</h3>
            <p className="text-white/20 max-w-md mx-auto">
              Chúng tôi đang cập nhật kho lưu trữ các sự kiện tuyệt vời đã diễn ra tại TEDxHCMIU. Hãy quay lại sau nhé!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturedContest = () => (
  <section id="featured" className="py-24 bg-ted-red/5 border-y border-white/5">
    <div className="container mx-auto px-6">
      <div className="glass-morphism p-12 rounded-[3rem] relative overflow-hidden border-ted-red/20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-ted-red/10 blur-[120px]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="text-ted-red font-bold tracking-widest uppercase text-xs mb-4 block">Đang diễn ra</span>
            <h2 className="text-4xl md:text-6xl font-display font-extrabold mb-6">Speaker Contest <span className="text-ted-red">2026</span></h2>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Cơ hội trở thành diễn giả chính thức trên sân khấu TEDxHCMIU. Hãy chia sẻ ý tưởng của bạn về chủ đề "VÔ HẠN".
            </p>
            <Link to="/speaker-contest" className="inline-flex items-center gap-3 bg-ted-red hover:bg-ted-red/90 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-ted-red/20">
              Khám phá ngay <ExternalLink size={20} />
            </Link>
          </div>
          <div className="w-full md:w-1/3 aspect-square relative">
            <div className="absolute inset-0 ted-gradient opacity-20 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-full h-full flex items-center justify-center">
              <Mic2 size={120} className="text-ted-red opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const MainPortal = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="bg-[#05070F] text-white selection:bg-ted-red selection:text-white min-h-screen flex flex-col">
      <MainNavbar />
      <main className="flex-grow">
        <PortalHero />
        <AboutTEDx />
        <PastEvents />
        <FeaturedContest />
      </main>
      <Footer showNav={false} />
    </div>
  );
};

const SpeakerContestPage = () => {
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      const sections = NAV_ITEMS.map(item => document.getElementById(item.href));
      const scrollPosition = window.scrollY + 100;

      sections.forEach(section => {
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(section.id);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#05070F] text-white selection:bg-ted-red selection:text-white min-h-screen flex flex-col">
      <Navbar activeSection={activeSection} scrollToSection={scrollToSection} />
      <main className="flex-grow">
        <Hero scrollToSection={scrollToSection} />
        
        <div id="theme">
          <ThemeSection />
          <MeaningSection />
        </div>

        <div id="rules">
          <SpeakerContestIntro />
          <RulesSection />
        </div>

        <div id="timeline">
          <TimelineSection />
        </div>

        <div id="agenda">
          <AgendaSection />
        </div>

        <div id="awards">
          <AwardsSection />
        </div>

        <FAQSection />

        <div id="register">
          <RegistrationForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations');
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (registrations.length === 0) return;
    
    const headers = Object.keys(registrations[0]).join(',');
    const rows = registrations.map(reg => 
      Object.values(reg).map(val => `"${val}"`).join(',')
    ).join('\n');
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tedx_registrations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.topicTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && reg.canAttendOffline === filter;
  });

  return (
    <div className="bg-[#05070F] min-h-screen text-white p-8 pt-24">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
              <Shield className="text-ted-red" /> Admin Dashboard
            </h1>
            <p className="text-white/40">Quản lý danh sách đăng ký TEDx HCMIU Speaker Contest 2026</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={fetchRegistrations}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
              title="Làm mới"
            >
              <History size={20} />
            </button>
            <button 
              onClick={downloadCSV}
              className="bg-ted-red hover:bg-ted-red/90 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-ted-red/20"
            >
              <Download size={20} /> Xuất CSV
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-morphism p-6 rounded-2xl">
            <div className="text-white/40 text-sm uppercase tracking-widest mb-2">Tổng số đơn</div>
            <div className="text-4xl font-display font-bold text-ted-red">{registrations.length}</div>
          </div>
          <div className="glass-morphism p-6 rounded-2xl">
            <div className="text-white/40 text-sm uppercase tracking-widest mb-2">Có thể tham gia Offline</div>
            <div className="text-4xl font-display font-bold text-green-500">
              {registrations.filter(r => r.canAttendOffline === 'yes').length}
            </div>
          </div>
          <div className="glass-morphism p-6 rounded-2xl">
            <div className="text-white/40 text-sm uppercase tracking-widest mb-2">Đơn mới (24h)</div>
            <div className="text-4xl font-display font-bold text-blue-500">
              {registrations.filter(r => {
                const date = new Date(r.created_at);
                const now = new Date();
                return (now.getTime() - date.getTime()) < (24 * 60 * 60 * 1000);
              }).length}
            </div>
          </div>
        </div>

        <div className="glass-morphism rounded-3xl overflow-hidden border border-white/10">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between bg-white/5">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo tên, email, chủ đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-ted-red focus:outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-white/40" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="yes">Offline</option>
                <option value="no">Online only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-white/40 text-xs uppercase tracking-widest">
                  <th className="px-6 py-4 font-bold">Thời gian</th>
                  <th className="px-6 py-4 font-bold">Họ và tên</th>
                  <th className="px-6 py-4 font-bold">Thông tin liên hệ</th>
                  <th className="px-6 py-4 font-bold">Chủ đề</th>
                  <th className="px-6 py-4 font-bold">Video</th>
                  <th className="px-6 py-4 font-bold">Offline</th>
                  <th className="px-6 py-4 font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-white/20">Đang tải dữ liệu...</td>
                  </tr>
                ) : filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-white/20">Không tìm thấy đơn đăng ký nào.</td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-sm text-white/40">
                        {new Date(reg.created_at).toLocaleDateString('vi-VN')} <br />
                        {new Date(reg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{reg.fullName}</div>
                        <div className="text-xs text-white/40">{reg.birthYear} • {reg.organization}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>{reg.email}</div>
                        <div className="text-white/40">{reg.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium line-clamp-1" title={reg.topicTitle}>{reg.topicTitle}</div>
                        <div className="text-xs text-white/40 line-clamp-1">{reg.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={reg.videoLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-ted-red hover:underline flex items-center gap-1 text-sm"
                        >
                          Xem video <ExternalLink size={14} />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${reg.canAttendOffline === 'yes' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {reg.canAttendOffline === 'yes' ? 'Có' : 'Không'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={async () => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa đơn đăng ký này?')) {
                              try {
                                const response = await fetch(`/api/registrations/${reg.id}`, { method: 'DELETE' });
                                if (response.ok) {
                                  fetchRegistrations();
                                } else {
                                  alert('Xóa thất bại');
                                }
                              } catch (error) {
                                console.error('Delete error:', error);
                              }
                            }
                          }}
                          className="p-2 text-white/20 hover:text-ted-red transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPortal />} />
        <Route path="/speaker-contest" element={<SpeakerContestPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
