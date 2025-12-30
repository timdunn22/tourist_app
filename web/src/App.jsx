import React, { useState, useEffect, useRef } from 'react';

export default function LocalLinkApp() {
  const [view, setView] = useState('splash');
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showPanel, setShowPanel] = useState(null);
  const [booking, setBooking] = useState({ date: 'Today', time: '9:00 AM', people: 2 });

  useEffect(() => {
    if (view === 'splash') setTimeout(() => setView('onboarding'), 2000);
  }, [view]);

  // Kathmandu center: 27.7172, 85.3240
  const experiences = [
    { id: 1, title: "Hidden Temple Morning Walk", guide: "Pemba Sherpa", guideId: 1, price: 25, duration: "3h", rating: 4.9, reviews: 127, image: "🏛️", category: "culture", badges: ["GPS-Verified", "Female-Safe"], trustScore: 98, desc: "Discover ancient temples hidden in Kathmandu's backstreets.", meetingPoint: "Durbar Square", includes: ["Guide", "Chai", "Offerings"], lat: 27.7045, lng: 85.3066 },
    { id: 2, title: "Street Food Adventure", guide: "Sita Thapa", guideId: 2, price: 18, duration: "2h", rating: 4.8, reviews: 89, image: "🍜", category: "food", badges: ["GPS-Verified", "First Aid Ready"], trustScore: 95, desc: "Taste authentic momos and chatamari at family-run stalls.", meetingPoint: "Thamel Chowk", includes: ["5 Tastings", "Water", "Recipe Cards"], lat: 27.7152, lng: 85.3123 },
    { id: 3, title: "Sunrise Hike to Nagarkot", guide: "Tenzin Lama", guideId: 3, price: 45, duration: "6h", rating: 5.0, reviews: 203, image: "🌄", category: "adventure", badges: ["Master Guide", "First Aid Ready"], trustScore: 99, desc: "Watch the sun rise over the Himalayas from Nagarkot.", meetingPoint: "Nagarkot", includes: ["Transport", "Breakfast", "Poles"], lat: 27.7156, lng: 85.5167 },
    { id: 4, title: "Traditional Cooking Class", guide: "Maya Gurung", guideId: 4, price: 35, duration: "4h", rating: 4.9, reviews: 156, image: "👩‍🍳", category: "food", badges: ["Female-Safe", "Platform Trained"], trustScore: 97, desc: "Learn to cook dal bhat and momos in a local home.", meetingPoint: "Patan", includes: ["Ingredients", "Recipes", "Full Meal"], lat: 27.6722, lng: 85.3240 },
    { id: 5, title: "Artisan Craft Workshop", guide: "Ram Tamang", guideId: 5, price: 30, duration: "3h", rating: 4.7, reviews: 64, image: "🎨", category: "culture", badges: ["Heritage Expert"], trustScore: 92, desc: "Create traditional Thangka paintings with master craftspeople.", meetingPoint: "Patan Craft Center", includes: ["Materials", "Instruction", "Your Art"], lat: 27.6763, lng: 85.3285 },
    { id: 6, title: "Meditation Retreat", guide: "Dawa Lama", guideId: 6, price: 28, duration: "3h", rating: 4.9, reviews: 145, image: "🧘", category: "wellness", badges: ["Platform Trained", "Female-Safe"], trustScore: 97, desc: "Find inner peace at an ancient monastery.", meetingPoint: "Kopan Monastery", includes: ["Yoga Mat", "Tea", "Blessing"], lat: 27.7394, lng: 85.3622 },
  ];

  const guides = [
    { id: 1, name: "Pemba Sherpa", level: "Professional", levelNum: 2, avatar: "👨‍🦱", rating: 4.9, reviews: 127, tours: 342, languages: ["English", "Nepali"], badges: ["Platform Trained", "Female-Safe", "First Aid"], trustScore: 98, bio: "12 years guiding through Nepal. I love sharing hidden stories.", responseTime: "1 hour" },
    { id: 2, name: "Sita Thapa", level: "Trained", levelNum: 1, avatar: "👩", rating: 4.8, reviews: 89, tours: 156, languages: ["English", "Nepali"], badges: ["GPS-Verified", "First Aid"], trustScore: 95, bio: "Lifelong Kathmandu resident and food enthusiast.", responseTime: "2 hours" },
    { id: 3, name: "Tenzin Lama", level: "Master", levelNum: 3, avatar: "👴", rating: 5.0, reviews: 203, tours: 1205, languages: ["English", "Nepali", "Tibetan"], badges: ["Master Guide", "Heritage Expert", "Mentor"], trustScore: 99, bio: "30 years of mountain guiding. Trained 50+ guides.", responseTime: "30 min" },
    { id: 4, name: "Maya Gurung", level: "Professional", levelNum: 2, avatar: "👩‍🍳", rating: 4.9, reviews: 156, tours: 423, languages: ["English", "Nepali", "Japanese"], badges: ["Female-Safe", "Platform Trained"], trustScore: 97, bio: "Third-generation cook from Gorkha.", responseTime: "1 hour" },
  ];

  const services = [
    { id: 1, title: "SIM Card Setup", price: 5, icon: "📱", time: "30 min" },
    { id: 2, title: "Airport Pickup", price: 15, icon: "✈️", time: "1 hour" },
    { id: 3, title: "Translation Help", price: 8, icon: "🗣️", time: "1 hour" },
    { id: 4, title: "Bargaining Helper", price: 10, icon: "🛍️", time: "2 hours" },
    { id: 5, title: "Hospital Support", price: 20, icon: "🏥", time: "As needed" },
    { id: 6, title: "Emergency Support", price: 25, icon: "🆘", time: "Immediate" },
  ];

  const stays = [
    { id: 1, title: "Maya's Homestay", type: "Homestay", price: 28, rating: 4.9, image: "🏠", badges: ["Female-Friendly", "Family-Run"], location: "Patan" },
    { id: 2, title: "Himalayan View Hotel", type: "Hotel", price: 65, rating: 4.7, image: "🏨", badges: ["Mountain View", "WiFi"], location: "Thamel" },
    { id: 3, title: "Backpacker's Haven", type: "Hostel", price: 12, rating: 4.6, image: "🛏️", badges: ["Social", "Budget"], location: "Thamel" },
  ];

  const messages = [
    { id: 1, name: "Pemba Sherpa", avatar: "👨‍🦱", last: "See you tomorrow at 9 AM!", time: "10 min", unread: 1 },
    { id: 2, name: "Tenzin Lama", avatar: "👴", last: "Weather looks perfect for the hike.", time: "2 hours", unread: 0 },
  ];

  const bookings = [
    { id: 1, expId: 1, date: "Today", time: "9:00 AM", status: "upcoming", people: 2, total: 55 },
    { id: 2, expId: 3, date: "Dec 26", time: "5:00 AM", status: "upcoming", people: 1, total: 50 },
    { id: 3, expId: 2, date: "Dec 20", time: "6:00 PM", status: "completed", people: 2, total: 41 },
  ];

  const training = [
    { id: 1, title: "Guest Etiquette", icon: "🤝", done: true },
    { id: 2, title: "Female Traveler Safety", icon: "👩", done: true },
    { id: 3, title: "First Aid Basics", icon: "🏥", done: true },
    { id: 4, title: "Storytelling", icon: "📖", done: false },
    { id: 5, title: "Route Safety", icon: "🗺️", done: false },
    { id: 6, title: "Cultural Sensitivity", icon: "🌍", done: false },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'culture', label: 'Culture', icon: '🏛️' },
    { id: 'food', label: 'Food', icon: '🍜' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'wellness', label: 'Wellness', icon: '🧘' },
    { id: 'stays', label: 'Stays', icon: '🏠' },
    { id: 'help', label: 'Help Me', icon: '🤝' },
  ];

  const filtered = experiences.filter(e => 
    (category === 'all' || e.category === category) &&
    (e.title.toLowerCase().includes(search.toLowerCase()) || e.guide.toLowerCase().includes(search.toLowerCase()))
  );

  const login = () => {
    setUser({ name: userType === 'traveler' ? "Alex" : "Pemba", avatar: userType === 'traveler' ? "🧑‍💼" : "👨‍🦱", earnings: 1247, level: 2, trustScore: 98 });
    setView(userType === 'traveler' ? 'home' : 'dashboard');
  };

  // SCREENS
  const Splash = () => (
    <div className="splash"><div className="splash-content"><div className="logo">🌏</div><h1>LocalLink</h1><p>Travel human. Travel safe.</p><div className="loader"><div className="bar"/></div></div></div>
  );

  const Onboarding = () => {
    const [step, setStep] = useState(0);
    const slides = [
      { icon: "🗺️", title: "Discover Authentic Experiences", text: "Connect with verified local guides who share real stories." },
      { icon: "🛡️", title: "Travel Safely", text: "GPS tracking, verified IDs, and 24/7 emergency support." },
      { icon: "💰", title: "Support Local Communities", text: "Your money goes directly to local people." }
    ];
    return (
      <div className="onboarding">
        <div className="slide"><div className="slide-icon">{slides[step].icon}</div><h2>{slides[step].title}</h2><p>{slides[step].text}</p></div>
        <div className="dots">{slides.map((_, i) => <span key={i} className={`dot ${i === step ? 'active' : ''}`} onClick={() => setStep(i)}/>)}</div>
        {step < 2 ? (
          <div className="actions"><button className="btn-sec" onClick={() => setStep(2)}>Skip</button><button className="btn-pri" onClick={() => setStep(step + 1)}>Next</button></div>
        ) : (
          <div className="type-btns">
            <button className="type-btn" onClick={() => { setUserType('traveler'); setView('auth'); }}><span>🎒</span><div><strong>I'm a Traveler</strong><small>Discover & book</small></div></button>
            <button className="type-btn" onClick={() => { setUserType('local'); setView('auth'); }}><span>🏠</span><div><strong>I'm a Local</strong><small>Offer & earn</small></div></button>
          </div>
        )}
      </div>
    );
  };

  const Auth = () => {
    const [mode, setMode] = useState('login');
    return (
      <div className="auth">
        <button className="back" onClick={() => setView('onboarding')}>←</button>
        <div className="auth-header"><span className="auth-icon">{userType === 'traveler' ? '🎒' : '🏠'}</span><h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1></div>
        <div className="form">
          {mode === 'signup' && <div className="field"><label>Full Name</label><input placeholder="Enter name"/></div>}
          <div className="field"><label>Email or Phone</label><input placeholder="Enter email or phone"/></div>
          <div className="field"><label>Password</label><input type="password" placeholder="Enter password"/></div>
          <button className="btn-pri full" onClick={login}>{mode === 'login' ? 'Sign In' : 'Create Account'}</button>
          <div className="divider"><span>or</span></div>
          <div className="social"><button>🔵 Google</button><button>📘 Facebook</button></div>
          <p className="switch">{mode === 'login' ? <>No account? <button onClick={() => setMode('signup')}>Sign Up</button></> : <>Have account? <button onClick={() => setMode('login')}>Sign In</button></>}</p>
        </div>
      </div>
    );
  };

  const Home = () => (
    <div className="home">
      <header className="home-header">
        <div className="loc-bar"><span>📍</span><div><small>Location</small><strong>Kathmandu, Nepal</strong></div></div>
        <button className="icon-btn" onClick={() => setShowPanel('notif')}>🔔<span className="badge">2</span></button>
      </header>
      <div className="search"><span>🔍</span><input placeholder="What do you want to experience?" value={search} onChange={e => setSearch(e.target.value)}/></div>
      <div className="cats">{categories.map(c => <button key={c.id} className={`cat ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}><span>{c.icon}</span><span>{c.label}</span></button>)}</div>
      
      {category === 'help' ? (
        <div className="section"><h2>Help Me Now</h2><div className="services">{services.map(s => <div key={s.id} className="service-card" onClick={() => { setSelected({ service: s }); setView('serviceDetail'); }}><span>{s.icon}</span><h4>{s.title}</h4><div className="meta"><span className="price">${s.price}</span><span>{s.time}</span></div></div>)}</div></div>
      ) : category === 'stays' ? (
        <div className="section"><h2>Places to Stay</h2><div className="stays">{stays.map(s => <div key={s.id} className="stay-card" onClick={() => { setSelected({ stay: s }); setView('stayDetail'); }}><div className="stay-img">{s.image}</div><div className="stay-info"><h4>{s.title}</h4><p>{s.type} • {s.location}</p><div className="badges">{s.badges.map((b,i) => <span key={i} className="badge-sm">{b}</span>)}</div><div className="stay-meta"><span>⭐ {s.rating}</span><span className="price">${s.price}/night</span></div></div></div>)}</div></div>
      ) : (
        <div className="section">
          <div className="sec-header"><h2>Experiences</h2><button className="map-btn" onClick={() => setView('map')}>🗺️ Map</button></div>
          <div className="exps">{filtered.map(e => <div key={e.id} className="exp-card" onClick={() => { setSelected({ exp: e }); setView('expDetail'); }}>
            <div className="exp-img"><span>{e.image}</span><div className="trust">✓ {e.trustScore}%</div></div>
            <div className="exp-content"><h3>{e.title}</h3><p className="guide">with {e.guide}</p><div className="badges">{e.badges.slice(0,2).map((b,i) => <span key={i} className="badge-sm">{b}</span>)}</div>
            <div className="exp-footer"><span>⭐ {e.rating} ({e.reviews})</span><span><strong className="price">${e.price}</strong> / {e.duration}</span></div></div>
          </div>)}</div>
        </div>
      )}
      {showPanel === 'notif' && <Panel title="Notifications" onClose={() => setShowPanel(null)}><div className="notifs"><div className="notif"><span>📅</span><div><strong>Booking Confirmed</strong><p>Temple walk tomorrow at 9 AM</p></div></div><div className="notif"><span>💬</span><div><strong>New Message</strong><p>Pemba sent you a message</p></div></div></div></Panel>}
    </div>
  );

  const ExpDetail = () => {
    const e = selected.exp;
    const g = guides.find(x => x.id === e?.guideId);
    if (!e) return null;
    return (
      <div className="detail">
        <header className="detail-header"><button className="back" onClick={() => setView('home')}>←</button><div><button className="icon-btn">♡</button><button className="icon-btn">↗</button></div></header>
        <div className="hero"><span className="hero-emoji">{e.image}</span><div className="trust-lg">✓ {e.trustScore}% Trust</div></div>
        <div className="detail-content">
          <h1>{e.title}</h1>
          <div className="meta-row"><span>⏱️ {e.duration}</span><span>📍 {e.meetingPoint}</span></div>
          <div className="badges">{e.badges.map((b,i) => <span key={i} className="badge">{b}</span>)}</div>
          <div className="rating-bar"><div><span className="stars">★★★★★</span><strong>{e.rating}</strong></div><span>{e.reviews} reviews</span></div>
          
          <div className="guide-card" onClick={() => { setSelected({ ...selected, guide: g }); setView('guideProfile'); }}>
            <span className="avatar">{g?.avatar}</span>
            <div><h4>{g?.name}</h4><p className="level">{g?.level} Guide</p><span>⭐ {g?.rating} • {g?.tours} tours</span></div>
            <span>→</span>
          </div>
          
          <div className="section-block"><h3>About</h3><p>{e.desc}</p></div>
          <div className="section-block"><h3>What's Included</h3><ul>{e.includes?.map((i,idx) => <li key={idx}>✓ {i}</li>)}</ul></div>
          
          <div className="section-block"><h3>Reviews</h3>
            <div className="review"><div className="review-header"><span>👩‍🦰</span><div><strong>Sarah M.</strong><span className="verified">✓ Verified</span></div><span className="stars-sm">★★★★★</span></div><p>"Absolutely incredible experience!"</p></div>
          </div>
          
          <div className="safety-box"><h3>🛡️ Safety Features</h3><div className="safety-grid"><span>📍 GPS Tracking</span><span>🆘 Emergency Button</span><span>✓ ID Verified</span><span>💳 Secure Payment</span></div></div>
        </div>
        <div className="book-footer"><div className="price-box"><strong>${e.price}</strong><span>per person</span></div><button className="btn-pri" onClick={() => setView('booking')}>Book Now</button></div>
      </div>
    );
  };

  const GuideProfile = () => {
    const g = selected.guide;
    if (!g) return null;
    const colors = { 1: '#4CAF50', 2: '#2196F3', 3: '#FFD700' };
    return (
      <div className="guide-profile">
        <header className="detail-header"><button className="back" onClick={() => setView('expDetail')}>←</button></header>
        <div className="guide-hero"><span className="avatar-lg">{g.avatar}</span><h1>{g.name}</h1><span className="level-badge" style={{background: colors[g.levelNum]}}>{g.level} Guide</span><span className="verified-text">✓ ID Verified</span></div>
        <div className="stats-row"><div><strong>{g.trustScore}%</strong><span>Trust</span></div><div><strong>⭐ {g.rating}</strong><span>{g.reviews} reviews</span></div><div><strong>{g.tours}</strong><span>Tours</span></div></div>
        <div className="guide-content">
          <div className="section-block"><h3>About</h3><p>{g.bio}</p></div>
          <div className="section-block"><h3>Badges</h3><div className="badges-grid">{g.badges.map((b,i) => <span key={i} className="badge-card">✓ {b}</span>)}</div></div>
          <div className="section-block"><h3>Languages</h3><div className="langs">{g.languages.map((l,i) => <span key={i} className="lang">{l}</span>)}</div></div>
          <div className="section-block"><h3>Response Time</h3><p className="response">{g.responseTime}</p></div>
        </div>
        <div className="guide-footer"><button className="btn-sec">💬 Message</button><button className="btn-pri">View Experiences</button></div>
      </div>
    );
  };

  const Booking = () => {
    const e = selected.exp;
    if (!e) return null;
    const total = e.price * booking.people + 5;
    return (
      <div className="booking-screen">
        <header className="detail-header"><button className="back" onClick={() => setView('expDetail')}>←</button><h2>Book Experience</h2><div/></header>
        <div className="booking-content">
          <div className="booking-summary"><span>{e.image}</span><div><h3>{e.title}</h3><p>with {e.guide}</p></div></div>
          
          <div className="book-section"><h3>Select Date</h3><div className="date-pick">{['Today', 'Tomorrow', 'Dec 26', 'Dec 27'].map(d => <button key={d} className={booking.date === d ? 'active' : ''} onClick={() => setBooking({...booking, date: d})}>{d}</button>)}</div></div>
          <div className="book-section"><h3>Select Time</h3><div className="time-pick">{['7:00 AM', '9:00 AM', '2:00 PM'].map(t => <button key={t} className={booking.time === t ? 'active' : ''} onClick={() => setBooking({...booking, time: t})}>{t}</button>)}</div></div>
          <div className="book-section"><h3>People</h3><div className="people-pick"><button onClick={() => setBooking({...booking, people: Math.max(1, booking.people - 1)})}>-</button><span>{booking.people}</span><button onClick={() => setBooking({...booking, people: booking.people + 1})}>+</button></div></div>
          
          <div className="price-breakdown"><div><span>Experience</span><span>${e.price} × {booking.people}</span></div><div><span>Service fee</span><span>$5</span></div><div className="total"><span>Total</span><span>${total}</span></div></div>
          <div className="safety-note">🛡️ Includes GPS tracking, secure payment, and 24/7 support.</div>
        </div>
        <div className="book-footer"><div className="price-box"><strong>${total}</strong><span>total</span></div><button className="btn-pri" onClick={() => setView('confirmation')}>Confirm & Pay</button></div>
      </div>
    );
  };

  const Confirmation = () => (
    <div className="confirmation">
      <div className="conf-content">
        <div className="conf-icon">✓</div>
        <h1>Booking Confirmed!</h1>
        <p>Your experience has been booked.</p>
        <div className="conf-card">
          <div className="conf-header"><span>{selected.exp?.image}</span><div><h3>{selected.exp?.title}</h3><p>with {selected.exp?.guide}</p></div></div>
          <div className="conf-details"><div>📅 {booking.date} at {booking.time}</div><div>👥 {booking.people} people</div><div>📍 {selected.exp?.meetingPoint}</div></div>
        </div>
        <div className="conf-actions"><button className="btn-pri full" onClick={() => setView('bookings')}>View Bookings</button><button className="btn-sec full" onClick={() => setView('home')}>Continue Exploring</button></div>
      </div>
    </div>
  );

  const Bookings = () => (
    <div className="bookings">
      <header className="screen-header"><h1>My Bookings</h1></header>
      <div className="tabs"><button className="tab active">Upcoming</button><button className="tab">Completed</button></div>
      <div className="booking-list">
        {bookings.filter(b => b.status === 'upcoming').map(b => {
          const e = experiences.find(x => x.id === b.expId);
          return (
            <div key={b.id} className="booking-card" onClick={() => { setSelected({ exp: e, booking: b }); setView('bookingDetail'); }}>
              <div className="booking-img">{e?.image}</div>
              <div className="booking-info"><h4>{e?.title}</h4><p>with {e?.guide}</p><div className="booking-meta"><span>📅 {b.date}</span><span>⏰ {b.time}</span></div><div className="booking-bottom"><span className="status">{b.status}</span><span className="total">${b.total}</span></div></div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const BookingDetail = () => {
    const b = selected.booking;
    const e = selected.exp;
    if (!b || !e) return null;
    return (
      <div className="booking-detail">
        <header className="detail-header"><button className="back" onClick={() => setView('bookings')}>←</button><h2>Booking Details</h2><div/></header>
        <div className="bd-content">
          <div className="bd-card">
            <div className="bd-header"><span>{e.image}</span><div><h3>{e.title}</h3><p>with {e.guide}</p><span className="status">{b.status}</span></div></div>
            <div className="bd-grid"><div><span>📅 Date</span><strong>{b.date}</strong></div><div><span>⏰ Time</span><strong>{b.time}</strong></div><div><span>👥 People</span><strong>{b.people}</strong></div><div><span>💰 Total</span><strong>${b.total}</strong></div></div>
          </div>
          {b.status === 'upcoming' && b.date === 'Today' && <button className="btn-pri full" onClick={() => setView('live')}>🎯 Start Experience</button>}
        </div>
      </div>
    );
  };

  const Live = () => (
    <div className="live-screen">
      <div className="live-map"><div className="map-placeholder"><div className="marker user">📍</div><div className="marker guide">👤</div></div></div>
      <div className="live-panel">
        <div className="live-header"><div className="live-ind"><span className="live-dot"/>Live Experience</div><span className="timer">1:23:45</span></div>
        <div className="guide-contact"><span>{selected.exp?.image}</span><div><h4>{selected.exp?.guide}</h4><p>Currently with you</p></div><div><button>📞</button><button>💬</button></div></div>
        <div className="next-stop"><h4>NEXT STOP</h4><div className="stop"><span>🏛️</span><div><strong>Swayambhunath</strong><span>5 min walk</span></div></div></div>
        <button className="emergency" onClick={() => setShowPanel('safety')}>🆘 Emergency</button>
      </div>
      {showPanel === 'safety' && <Panel title="🆘 Emergency" onClose={() => setShowPanel(null)}>
        <div className="emergency-opts"><button>📞 Call Emergency Services</button><button>📍 Share Location</button><button>👤 Contact Support</button><button className="danger">⚠️ Report Unsafe</button></div>
      </Panel>}
    </div>
  );

  const Messages = () => (
    <div className="messages">
      <header className="screen-header"><h1>Messages</h1></header>
      <div className="msg-list">{messages.map(m => <div key={m.id} className="msg-item" onClick={() => setView('chat')}><span className="msg-avatar">{m.avatar}{m.unread > 0 && <span className="unread-dot"/>}</span><div className="msg-content"><div className="msg-header"><h4>{m.name}</h4><span>{m.time}</span></div><p>{m.last}</p></div>{m.unread > 0 && <span className="unread-badge">{m.unread}</span>}</div>)}</div>
    </div>
  );

  const Chat = () => (
    <div className="chat">
      <header className="chat-header"><button className="back" onClick={() => setView('messages')}>←</button><div className="chat-user"><span>👨‍🦱</span><div><h4>Pemba Sherpa</h4><span className="online">Online</span></div></div><button>📞</button></header>
      <div className="chat-msgs"><div className="msg received"><p>Hi! Excited to meet you tomorrow!</p><span>8:00 PM</span></div><div className="msg sent"><p>Hi Pemba! Any tips for what to wear?</p><span>8:15 PM</span></div><div className="msg received"><p>Comfortable shoes and layers. It can be cool at temples.</p><span>8:20 PM</span></div></div>
      <div className="chat-input"><button>📎</button><input placeholder="Type a message..."/><button className="send">➤</button></div>
    </div>
  );

  const Profile = () => (
    <div className="profile">
      <header className="screen-header"><h1>Profile</h1><button onClick={() => setView('settings')}>⚙️</button></header>
      <div className="profile-header"><span className="avatar-lg">{user?.avatar}</span><h2>{user?.name}</h2><p>Member since 2024</p><button className="btn-sec" onClick={() => setView('editProfile')}>Edit Profile</button></div>
      <div className="profile-stats"><div><strong>5</strong><span>Trips</span></div><div><strong>3</strong><span>Countries</span></div><div><strong>12</strong><span>Reviews</span></div></div>
      <div className="menu"><div className="menu-section"><h4>Account</h4><button className="menu-item"><span>👤</span>Personal Info<span>→</span></button><button className="menu-item"><span>💳</span>Payment Methods<span>→</span></button><button className="menu-item"><span>🔔</span>Notifications<span>→</span></button></div><div className="menu-section"><h4>Support</h4><button className="menu-item"><span>❓</span>Help Center<span>→</span></button><button className="menu-item"><span>💬</span>Contact Support<span>→</span></button></div><button className="menu-item danger" onClick={() => { setUser(null); setView('onboarding'); }}><span>🚪</span>Log Out</button></div>
    </div>
  );

  const Map = () => {
    const [selectedExp, setSelectedExp] = useState(null);
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
      // Load Leaflet CSS dynamically
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS dynamically
      const loadLeaflet = () => {
        return new Promise((resolve) => {
          if (window.L) {
            resolve(window.L);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve(window.L);
          document.head.appendChild(script);
        });
      };

      loadLeaflet().then((L) => {
        if (mapInstanceRef.current || !mapContainerRef.current) return;

        // Initialize map centered on Kathmandu
        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
        }).setView([27.7172, 85.3240], 13);

        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Add markers for each experience
        experiences.forEach(exp => {
          // Create custom icon with emoji
          const customIcon = L.divIcon({
            className: 'leaflet-custom-marker',
            html: `<div class="marker-bubble"><span class="marker-emoji">${exp.image}</span><span class="marker-price">$${exp.price}</span></div>`,
            iconSize: [50, 60],
            iconAnchor: [25, 60],
            popupAnchor: [0, -60],
          });

          const marker = L.marker([exp.lat, exp.lng], { icon: customIcon }).addTo(map);

          // Add popup
          marker.bindPopup(`
            <div class="map-popup-content">
              <h4>${exp.title}</h4>
              <p>${exp.guide} • ⭐ ${exp.rating}</p>
              <p class="popup-price">$${exp.price} / ${exp.duration}</p>
              <p class="popup-location">📍 ${exp.meetingPoint}</p>
            </div>
          `);

          marker.on('click', () => {
            setSelectedExp(exp);
          });
        });

        // Add zoom controls position
        map.zoomControl.setPosition('bottomright');
      });

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, []);

    return (
      <div className="map-screen">
        <header className="map-header">
          <button className="back" onClick={() => setView('home')}>←</button>
          <div className="search-mini"><span>🔍</span><input placeholder="Search Kathmandu..."/></div>
          <button>⚙️</button>
        </header>
        <div className="full-map">
          <div ref={mapContainerRef} className="leaflet-map-container" />
        </div>
        <div className="map-cards">
          {(selectedExp ? [selectedExp] : experiences.slice(0,2)).map(e => (
            <div key={e.id} className="map-card" onClick={() => { setSelected({ exp: e }); setView('expDetail'); }}>
              <span>{e.image}</span>
              <div><h4>{e.title}</h4><p>{e.guide} • ⭐ {e.rating}</p></div>
              <span className="price">${e.price}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // LOCAL GUIDE SCREENS
  const Dashboard = () => (
    <div className="dashboard">
      <header className="dash-header"><div><h1>Welcome, {user?.name}!</h1><p>Level {user?.level} • Professional Guide</p></div><span className="avatar-sm">{user?.avatar}</span></header>
      <div className="earnings-card"><div className="earn-header"><span>This Month</span><button>Withdraw</button></div><div className="earn-amount">${user?.earnings?.toLocaleString()}</div><div className="earn-stats"><div><strong>23</strong><span>Bookings</span></div><div><strong>4.9</strong><span>Rating</span></div><div><strong>{user?.trustScore}%</strong><span>Trust</span></div></div></div>
      
      <div className="quick-actions"><button onClick={() => setView('addExp')}><span>➕</span>Add Experience</button><button onClick={() => setView('calendar')}><span>📅</span>Calendar</button><button onClick={() => setView('earnings')}><span>💰</span>Earnings</button><button onClick={() => setView('training')}><span>📚</span>Training</button></div>
      
      <div className="section"><div className="sec-header"><h3>Today's Bookings</h3></div>
        <div className="today-bookings"><div className="today-item"><div className="time-col"><span className="time">9:00 AM</span><span className="live-badge">LIVE</span></div><div><h4>Temple Walk</h4><p>Sarah M. • 2 people</p></div><button>View</button></div></div>
      </div>
      
      <div className="section"><div className="sec-header"><h3>Level Progress</h3><button className="link" onClick={() => setView('training')}>Training →</button></div>
        <div className="level-card"><div className="level-info"><span>Level 2</span><span>→ Level 3</span></div><div className="level-bar"><div className="fill" style={{width:'75%'}}/></div><p>Complete 2 more trainings to level up</p></div>
      </div>
      
      <div className="section"><div className="sec-header"><h3>Your Experiences</h3></div>
        <div className="my-exps">{experiences.filter(e => e.guideId === 1).slice(0,2).map(e => <div key={e.id} className="my-exp"><span>{e.image}</span><div><h4>{e.title}</h4><p>${e.price} • ⭐ {e.rating}</p></div><button>Edit</button></div>)}</div>
        <button className="add-exp-btn" onClick={() => setView('addExp')}>+ Add New Experience</button>
      </div>
    </div>
  );

  const Training = () => (
    <div className="training-screen">
      <header className="detail-header"><button className="back" onClick={() => setView('dashboard')}>←</button><h2>Training Center</h2><div/></header>
      <div className="training-hero"><div className="level-circle"><span>2</span><small>Level</small></div><div><h3>Professional Guide</h3><p>75% to Level 3</p><div className="level-bar"><div className="fill" style={{width:'75%'}}/></div></div></div>
      <div className="training-content">
        <h3>Required Training</h3>
        <div className="training-list">{training.map(t => <div key={t.id} className={`training-item ${t.done ? 'done' : ''}`}><span>{t.icon}</span><div><h4>{t.title}</h4></div>{t.done ? <span className="done-badge">✓ Done</span> : <button>Start</button>}</div>)}</div>
        <h3>Your Badges</h3>
        <div className="badges-earned"><span className="earned">✓ Platform Trained</span><span className="earned">✓ First Aid Ready</span><span className="locked">🔒 Heritage Expert</span></div>
      </div>
    </div>
  );

  const AddExp = () => (
    <div className="add-exp">
      <header className="detail-header"><button className="back" onClick={() => setView('dashboard')}>←</button><h2>Add Experience</h2><button className="save">Save</button></header>
      <div className="form-content">
        <div className="form-section"><h4>Basic Info</h4><div className="field"><label>Title</label><input placeholder="e.g., Hidden Temple Walk"/></div><div className="field"><label>Category</label><select><option>Culture</option><option>Food</option><option>Adventure</option></select></div><div className="field"><label>Description</label><textarea placeholder="Describe your experience..." rows={4}/></div></div>
        <div className="form-section"><h4>Photos</h4><div className="photo-grid"><button className="add-photo">📷 Main Photo</button><button className="add-photo">+</button><button className="add-photo">+</button></div></div>
        <div className="form-section"><h4>Details</h4><div className="row"><div className="field"><label>Price ($)</label><input type="number" placeholder="25"/></div><div className="field"><label>Duration</label><input placeholder="3 hours"/></div></div><div className="field"><label>Meeting Point</label><input placeholder="e.g., Durbar Square"/></div></div>
        <div className="form-actions"><button className="btn-sec">Save Draft</button><button className="btn-pri">Publish</button></div>
      </div>
    </div>
  );

  const Panel = ({ title, onClose, children }) => (
    <div className="panel-overlay" onClick={onClose}><div className="panel" onClick={e => e.stopPropagation()}><div className="panel-header"><h2>{title}</h2><button onClick={onClose}>×</button></div>{children}</div></div>
  );

  const Nav = () => {
    const travelerTabs = [{ id: 'home', icon: '🏠', label: 'Home' }, { id: 'map', icon: '🗺️', label: 'Explore' }, { id: 'bookings', icon: '📅', label: 'Bookings' }, { id: 'messages', icon: '💬', label: 'Messages' }, { id: 'profile', icon: '👤', label: 'Profile' }];
    const localTabs = [{ id: 'dashboard', icon: '🏠', label: 'Home' }, { id: 'calendar', icon: '📅', label: 'Calendar' }, { id: 'messages', icon: '💬', label: 'Messages' }, { id: 'earnings', icon: '💰', label: 'Earnings' }, { id: 'profile', icon: '👤', label: 'Profile' }];
    const tabs = userType === 'local' ? localTabs : travelerTabs;
    return <nav className="nav">{tabs.map(t => <button key={t.id} className={view === t.id ? 'active' : ''} onClick={() => setView(t.id)}><span>{t.icon}</span><span>{t.label}</span></button>)}</nav>;
  };

  const render = () => {
    switch(view) {
      case 'splash': return <Splash/>;
      case 'onboarding': return <Onboarding/>;
      case 'auth': return <Auth/>;
      case 'home': return <Home/>;
      case 'expDetail': return <ExpDetail/>;
      case 'guideProfile': return <GuideProfile/>;
      case 'booking': return <Booking/>;
      case 'confirmation': return <Confirmation/>;
      case 'bookings': return <Bookings/>;
      case 'bookingDetail': return <BookingDetail/>;
      case 'live': return <Live/>;
      case 'messages': return <Messages/>;
      case 'chat': return <Chat/>;
      case 'profile': return <Profile/>;
      case 'map': return <Map/>;
      case 'dashboard': return <Dashboard/>;
      case 'training': return <Training/>;
      case 'addExp': return <AddExp/>;
      default: return <Home/>;
    }
  };

  const hideNav = ['splash', 'onboarding', 'auth', 'expDetail', 'guideProfile', 'booking', 'confirmation', 'bookingDetail', 'live', 'chat', 'training', 'addExp', 'map'].includes(view);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@400;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--pri:#E07A5F;--pri-dark:#C4553D;--sec:#3D405B;--accent:#81B29A;--accent-light:#A8D5BA;--warm:#F2CC8F;--warm-light:#FFF8E7;--bg:#FFFCF7;--text:#2D3142;--text-light:#6B7280;--white:#FFF;--border:#E8E4DE;--shadow:rgba(45,49,66,.08);--danger:#EF4444;--success:#10B981;--r-sm:8px;--r-md:12px;--r-lg:20px;--r-xl:28px;--font:'DM Sans',sans-serif;--font-display:'Fraunces',serif}
        html,body{font-family:var(--font);background:#F0EDE8;color:var(--text);line-height:1.5;-webkit-font-smoothing:antialiased}
        .app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);position:relative;overflow-x:hidden}
        
        /* Splash */
        .splash{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--pri),var(--pri-dark));color:var(--white);text-align:center}
        .splash .logo{font-size:80px;animation:bounce 1s infinite}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
        .splash h1{font-family:var(--font-display);font-size:48px;margin:16px 0 8px}
        .splash p{font-size:18px;opacity:.9}
        .loader{width:200px;height:4px;background:rgba(255,255,255,.3);border-radius:100px;margin:32px auto 0;overflow:hidden}
        .bar{width:50%;height:100%;background:var(--white);border-radius:100px;animation:load 1.5s infinite}
        @keyframes load{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}
        
        /* Onboarding */
        .onboarding{min-height:100vh;padding:60px 24px 40px;display:flex;flex-direction:column;align-items:center}
        .slide{text-align:center;max-width:320px;flex:1;display:flex;flex-direction:column;justify-content:center}
        .slide-icon{font-size:80px;margin-bottom:24px}
        .slide h2{font-family:var(--font-display);font-size:28px;margin-bottom:12px;color:var(--sec)}
        .slide p{color:var(--text-light);font-size:16px}
        .dots{display:flex;gap:8px;margin:24px 0}
        .dot{width:10px;height:10px;border-radius:50%;background:var(--border);cursor:pointer}
        .dot.active{width:24px;background:var(--pri);border-radius:100px}
        .actions{display:flex;gap:12px;width:100%}
        .btn-pri,.btn-sec{flex:1;padding:16px 24px;border-radius:var(--r-xl);font-size:16px;font-weight:600;cursor:pointer;border:none;transition:all .2s}
        .btn-pri{background:var(--pri);color:var(--white)}
        .btn-pri:hover{background:var(--pri-dark)}
        .btn-sec{background:var(--bg);border:1px solid var(--border);color:var(--text)}
        .full{width:100%}
        .type-btns{width:100%}
        .type-btn{width:100%;display:flex;align-items:center;gap:16px;padding:20px;border:2px solid var(--border);border-radius:var(--r-lg);background:var(--white);cursor:pointer;margin-bottom:12px;text-align:left}
        .type-btn:hover{border-color:var(--pri);transform:translateY(-2px);box-shadow:0 8px 24px var(--shadow)}
        .type-btn span{font-size:32px}
        .type-btn strong{display:block;font-size:18px}
        .type-btn small{color:var(--text-light)}
        
        /* Auth */
        .auth{min-height:100vh;padding:24px}
        .auth .back{position:absolute;top:24px;left:24px}
        .auth-header{text-align:center;padding:60px 0 32px}
        .auth-icon{font-size:48px;display:block;margin-bottom:16px}
        .auth-header h1{font-family:var(--font-display);font-size:28px}
        .form{max-width:360px;margin:0 auto}
        .field{margin-bottom:20px}
        .field label{display:block;font-size:14px;font-weight:500;margin-bottom:8px}
        .field input,.field select,.field textarea{width:100%;padding:14px 16px;border:1px solid var(--border);border-radius:var(--r-md);font-size:16px;font-family:var(--font)}
        .field input:focus,.field textarea:focus{outline:none;border-color:var(--pri)}
        .divider{display:flex;align-items:center;gap:16px;margin:24px 0}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border)}
        .divider span{color:var(--text-light);font-size:14px}
        .social{display:flex;gap:12px}
        .social button{flex:1;padding:14px;border:1px solid var(--border);border-radius:var(--r-md);background:var(--white);cursor:pointer}
        .switch{text-align:center;margin-top:24px;color:var(--text-light)}
        .switch button{background:none;border:none;color:var(--pri);font-weight:600;cursor:pointer}
        
        /* Common */
        .back{width:44px;height:44px;background:var(--white);border:none;border-radius:50%;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px var(--shadow)}
        .icon-btn{width:44px;height:44px;background:var(--white);border:none;border-radius:50%;font-size:18px;cursor:pointer;position:relative}
        .badge{position:absolute;top:-2px;right:-2px;background:var(--danger);color:var(--white);font-size:10px;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center}
        
        /* Home */
        .home{padding-bottom:100px}
        .home-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:var(--white);border-bottom:1px solid var(--border)}
        .loc-bar{display:flex;align-items:center;gap:10px}
        .loc-bar small{font-size:12px;color:var(--text-light)}
        .loc-bar strong{font-size:15px}
        .search{display:flex;align-items:center;gap:12px;margin:16px 20px;background:var(--white);border:1px solid var(--border);border-radius:var(--r-xl);padding:12px 16px}
        .search input{flex:1;border:none;background:none;font-size:15px;outline:none}
        .cats{display:flex;gap:10px;padding:0 20px 16px;overflow-x:auto;scrollbar-width:none}
        .cats::-webkit-scrollbar{display:none}
        .cat{display:flex;align-items:center;gap:6px;padding:10px 16px;background:var(--white);border:1px solid var(--border);border-radius:var(--r-xl);font-size:14px;font-weight:500;cursor:pointer;white-space:nowrap}
        .cat.active{background:var(--sec);color:var(--white);border-color:var(--sec)}
        
        .section{padding:0 20px;margin-bottom:24px}
        .section h2{font-family:var(--font-display);font-size:22px;margin-bottom:16px}
        .sec-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
        .sec-header h2,.sec-header h3{font-family:var(--font-display);font-size:18px;margin:0}
        .map-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;background:var(--white);border:1px solid var(--border);border-radius:var(--r-xl);font-size:14px;cursor:pointer}
        
        .exps{display:grid;gap:16px}
        .exp-card{background:var(--white);border-radius:var(--r-lg);overflow:hidden;box-shadow:0 2px 12px var(--shadow);cursor:pointer;transition:all .3s}
        .exp-card:hover{transform:translateY(-4px);box-shadow:0 8px 32px rgba(45,49,66,.12)}
        .exp-img{height:140px;background:linear-gradient(135deg,var(--warm-light),var(--accent-light));display:flex;align-items:center;justify-content:center;position:relative}
        .exp-img span{font-size:56px}
        .trust{position:absolute;top:10px;right:10px;background:rgba(255,255,255,.95);padding:5px 8px;border-radius:var(--r-sm);font-size:11px;font-weight:600;color:var(--success)}
        .exp-content{padding:14px}
        .exp-content h3{font-size:16px;font-weight:600;margin-bottom:4px}
        .guide{font-size:13px;color:var(--text-light);margin-bottom:8px}
        .badges{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
        .badge-sm{font-size:10px;padding:4px 8px;background:var(--bg);border-radius:100px}
        .exp-footer{display:flex;justify-content:space-between;font-size:13px}
        .price{color:var(--pri);font-weight:700}
        
        .services{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
        .service-card{background:var(--white);border-radius:var(--r-md);padding:16px;text-align:center;border:1px solid var(--border);cursor:pointer;transition:all .2s}
        .service-card:hover{border-color:var(--pri);transform:translateY(-2px)}
        .service-card span{font-size:28px;display:block;margin-bottom:8px}
        .service-card h4{font-size:13px;margin-bottom:8px}
        .meta{display:flex;justify-content:center;gap:8px;font-size:12px;color:var(--text-light)}
        
        .stays{display:grid;gap:12px}
        .stay-card{display:flex;gap:14px;background:var(--white);border-radius:var(--r-md);padding:14px;border:1px solid var(--border);cursor:pointer}
        .stay-img{font-size:36px;width:64px;height:64px;background:var(--warm-light);border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center}
        .stay-info{flex:1}
        .stay-info h4{font-size:15px;margin-bottom:2px}
        .stay-info p{font-size:12px;color:var(--text-light);margin-bottom:6px}
        .stay-meta{display:flex;justify-content:space-between;font-size:13px}
        
        /* Detail */
        .detail{padding-bottom:100px}
        .detail-header{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:16px 20px;z-index:100}
        .detail-header h2{font-size:17px;font-weight:600}
        .hero{height:260px;background:linear-gradient(135deg,var(--warm-light),var(--accent-light));display:flex;align-items:center;justify-content:center;position:relative}
        .hero-emoji{font-size:100px}
        .trust-lg{position:absolute;bottom:16px;right:16px;background:rgba(255,255,255,.95);padding:10px 16px;border-radius:var(--r-md);font-weight:600;color:var(--success);box-shadow:0 2px 12px var(--shadow)}
        .detail-content{padding:20px;background:var(--white);border-radius:var(--r-xl) var(--r-xl) 0 0;margin-top:-20px;position:relative}
        .detail-content h1{font-family:var(--font-display);font-size:26px;margin-bottom:8px}
        .meta-row{display:flex;gap:16px;font-size:13px;color:var(--text-light);margin-bottom:12px}
        .badge{font-size:11px;padding:6px 12px;background:var(--accent-light);color:var(--sec);border-radius:100px}
        .rating-bar{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border);margin-bottom:16px}
        .stars{color:var(--warm);margin-right:8px}
        .stars-sm{color:var(--warm);font-size:12px}
        
        .guide-card{display:flex;align-items:center;gap:12px;background:var(--bg);border-radius:var(--r-md);padding:14px;margin-bottom:20px;cursor:pointer}
        .avatar{font-size:36px;width:52px;height:52px;background:var(--white);border-radius:50%;display:flex;align-items:center;justify-content:center}
        .avatar-lg{font-size:70px;width:110px;height:110px;background:var(--white);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:0 4px 20px var(--shadow)}
        .avatar-sm{font-size:32px}
        .guide-card h4{font-size:15px;font-weight:600}
        .level{font-size:12px;color:var(--pri);margin-bottom:2px}
        .guide-card span:last-child{font-size:12px;color:var(--text-light)}
        
        .section-block{margin-bottom:24px}
        .section-block h3{font-size:16px;font-weight:600;margin-bottom:10px;color:var(--sec)}
        .section-block p{font-size:14px;line-height:1.6}
        .section-block ul{list-style:none}
        .section-block li{padding:8px 0;font-size:14px;border-bottom:1px solid var(--border)}
        
        .review{background:var(--bg);border-radius:var(--r-md);padding:14px}
        .review-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
        .review-header span:first-child{font-size:28px}
        .verified{font-size:11px;color:var(--success);margin-left:8px}
        .review p{font-size:13px;line-height:1.5}
        
        .safety-box{background:linear-gradient(135deg,var(--accent-light),var(--warm-light));padding:20px;border-radius:var(--r-lg);margin-bottom:20px}
        .safety-box h3{margin-bottom:14px}
        .safety-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .safety-grid span{background:var(--white);padding:10px;border-radius:var(--r-sm);font-size:13px}
        
        .book-footer,.guide-footer{position:fixed;bottom:0;left:0;right:0;background:var(--white);padding:16px 20px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:12px;max-width:430px;margin:0 auto;z-index:200}
        .price-box strong{font-size:22px;display:block}
        .price-box span{font-size:13px;color:var(--text-light)}
        
        /* Guide Profile */
        .guide-profile{padding-bottom:100px}
        .guide-hero{text-align:center;padding:70px 20px 30px;background:linear-gradient(180deg,var(--warm-light),var(--bg))}
        .guide-hero h1{font-family:var(--font-display);font-size:26px;margin-bottom:8px}
        .level-badge{display:inline-block;padding:6px 16px;border-radius:var(--r-xl);color:var(--white);font-size:13px;font-weight:600;margin-bottom:6px}
        .verified-text{font-size:13px;color:var(--success);display:block}
        .stats-row{display:flex;justify-content:center;gap:20px;padding:18px;margin:-10px 20px 0;background:var(--white);border-radius:var(--r-lg);box-shadow:0 2px 12px var(--shadow);position:relative;z-index:10}
        .stats-row div{text-align:center}
        .stats-row strong{font-size:18px;display:block}
        .stats-row span{font-size:11px;color:var(--text-light)}
        .guide-content{padding:24px 20px}
        .badges-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .badge-card{background:var(--accent-light);padding:10px 12px;border-radius:var(--r-sm);font-size:12px}
        .langs{display:flex;gap:8px;flex-wrap:wrap}
        .lang{background:var(--bg);padding:8px 14px;border-radius:var(--r-xl);font-size:13px;border:1px solid var(--border)}
        .response{color:var(--success);font-weight:500}
        .guide-footer{gap:12px}
        .guide-footer .btn-sec{flex:1}
        .guide-footer .btn-pri{flex:2}
        
        /* Booking */
        .booking-screen{padding-bottom:100px}
        .booking-content{padding:20px}
        .booking-summary{display:flex;align-items:center;gap:14px;background:var(--warm-light);padding:14px;border-radius:var(--r-md);margin-bottom:24px}
        .booking-summary span{font-size:36px}
        .booking-summary h3{font-size:15px}
        .booking-summary p{font-size:13px;color:var(--text-light)}
        .book-section{margin-bottom:24px}
        .book-section h3{font-size:15px;font-weight:600;margin-bottom:12px}
        .date-pick,.time-pick{display:flex;gap:8px;overflow-x:auto}
        .date-pick button,.time-pick button{padding:10px 14px;background:var(--white);border:1px solid var(--border);border-radius:var(--r-md);font-size:13px;cursor:pointer}
        .date-pick button.active,.time-pick button.active{background:var(--sec);color:var(--white);border-color:var(--sec)}
        .people-pick{display:flex;align-items:center;justify-content:center;gap:20px}
        .people-pick button{width:44px;height:44px;border-radius:50%;background:var(--bg);border:1px solid var(--border);font-size:20px;cursor:pointer}
        .people-pick span{font-size:24px;font-weight:700;min-width:40px;text-align:center}
        .price-breakdown{background:var(--bg);padding:16px;border-radius:var(--r-md);margin-bottom:16px}
        .price-breakdown>div{display:flex;justify-content:space-between;font-size:14px;margin-bottom:10px}
        .price-breakdown .total{border-top:1px solid var(--border);padding-top:10px;font-weight:700;font-size:16px;margin-bottom:0}
        .safety-note{display:flex;gap:12px;background:var(--accent-light);padding:14px;border-radius:var(--r-md);font-size:12px}
        
        /* Confirmation */
        .confirmation{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
        .conf-content{text-align:center;max-width:360px}
        .conf-icon{width:80px;height:80px;background:var(--success);color:var(--white);font-size:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
        .conf-content h1{font-family:var(--font-display);font-size:28px;margin-bottom:8px}
        .conf-content>p{color:var(--text-light);margin-bottom:24px}
        .conf-card{background:var(--white);border-radius:var(--r-lg);padding:20px;text-align:left;margin-bottom:24px;box-shadow:0 2px 12px var(--shadow)}
        .conf-header{display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border)}
        .conf-header span{font-size:36px}
        .conf-header h3{font-size:16px}
        .conf-header p{font-size:13px;color:var(--text-light)}
        .conf-details{display:grid;gap:10px}
        .conf-details>div{display:flex;align-items:center;gap:10px;font-size:14px}
        .conf-actions{display:grid;gap:12px}
        
        /* Bookings List */
        .bookings,.messages,.profile{padding:20px;padding-bottom:100px}
        .screen-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
        .screen-header h1{font-family:var(--font-display);font-size:26px}
        .screen-header button{background:none;border:none;font-size:24px;cursor:pointer}
        .tabs{display:flex;gap:8px;margin-bottom:20px}
        .tab{flex:1;padding:12px;background:var(--bg);border:none;border-radius:var(--r-md);font-size:14px;font-weight:500;cursor:pointer}
        .tab.active{background:var(--sec);color:var(--white)}
        .booking-list{display:grid;gap:12px}
        .booking-card{display:flex;gap:14px;background:var(--white);border-radius:var(--r-md);padding:14px;box-shadow:0 2px 8px var(--shadow);cursor:pointer}
        .booking-img{font-size:32px;width:56px;height:56px;background:var(--warm-light);border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center}
        .booking-info{flex:1}
        .booking-info h4{font-size:15px;margin-bottom:2px}
        .booking-info p{font-size:13px;color:var(--text-light);margin-bottom:6px}
        .booking-meta{display:flex;gap:12px;font-size:12px;color:var(--text-light);margin-bottom:8px}
        .booking-bottom{display:flex;justify-content:space-between}
        .status{font-size:11px;padding:4px 10px;border-radius:100px;background:var(--accent-light);color:var(--accent)}
        .total{font-weight:600;color:var(--pri)}
        
        /* Booking Detail */
        .booking-detail{padding-bottom:40px}
        .bd-content{padding:20px}
        .bd-card{background:var(--white);border-radius:var(--r-lg);padding:20px;box-shadow:0 2px 12px var(--shadow);margin-bottom:20px}
        .bd-header{display:flex;align-items:center;gap:14px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border)}
        .bd-header span{font-size:42px}
        .bd-header h3{font-size:18px}
        .bd-header p{font-size:14px;color:var(--text-light)}
        .bd-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .bd-grid>div{display:flex;flex-direction:column;gap:4px}
        .bd-grid span{font-size:12px;color:var(--text-light)}
        .bd-grid strong{font-size:14px}
        
        /* Live */
        .live-screen{height:100vh;display:flex;flex-direction:column}
        .live-map{flex:1;position:relative}
        .map-placeholder{width:100%;height:100%;background:linear-gradient(180deg,#87CEEB,#98D8AA);position:relative}
        .map-placeholder.large{height:100%}
        .marker{position:absolute;font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))}
        .marker.user{top:40%;left:35%;animation:pulse 2s infinite}
        .marker.guide{top:35%;left:40%;font-size:24px;background:var(--white);border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
        .live-panel{background:var(--white);border-radius:var(--r-xl) var(--r-xl) 0 0;padding:20px;box-shadow:0 -4px 20px var(--shadow)}
        .live-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
        .live-ind{display:flex;align-items:center;gap:8px;font-weight:600}
        .live-dot{width:10px;height:10px;background:var(--danger);border-radius:50%;animation:blink 1s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.5}}
        .timer{font-size:18px;font-weight:600;color:var(--pri)}
        .guide-contact{display:flex;align-items:center;gap:12px;background:var(--bg);padding:12px;border-radius:var(--r-md);margin-bottom:14px}
        .guide-contact span:first-child{font-size:28px}
        .guide-contact h4{font-size:14px}
        .guide-contact p{font-size:12px;color:var(--success)}
        .guide-contact div:last-child{display:flex;gap:8px}
        .guide-contact button{width:40px;height:40px;background:var(--white);border:1px solid var(--border);border-radius:50%;font-size:16px;cursor:pointer}
        .next-stop{margin-bottom:14px}
        .next-stop h4{font-size:11px;color:var(--text-light);text-transform:uppercase;margin-bottom:8px}
        .stop{display:flex;align-items:center;gap:12px;background:var(--warm-light);padding:12px;border-radius:var(--r-md)}
        .stop span{font-size:24px}
        .stop strong{display:block;font-size:14px}
        .stop span:last-child{font-size:12px;color:var(--text-light)}
        .emergency{width:100%;background:var(--danger);color:var(--white);border:none;padding:14px;border-radius:var(--r-xl);font-size:16px;font-weight:600;cursor:pointer}
        
        /* Messages */
        .msg-list{display:grid;gap:12px}
        .msg-item{display:flex;align-items:center;gap:12px;background:var(--white);padding:14px;border-radius:var(--r-md);cursor:pointer}
        .msg-avatar{font-size:36px;position:relative}
        .unread-dot{position:absolute;top:0;right:0;width:10px;height:10px;background:var(--pri);border-radius:50%}
        .msg-content{flex:1}
        .msg-header{display:flex;justify-content:space-between;margin-bottom:4px}
        .msg-header h4{font-size:15px}
        .msg-header span{font-size:12px;color:var(--text-light)}
        .msg-content p{font-size:13px;color:var(--text-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .unread-badge{background:var(--pri);color:var(--white);font-size:12px;min-width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center}
        
        /* Chat */
        .chat{height:100vh;display:flex;flex-direction:column}
        .chat-header{display:flex;align-items:center;gap:12px;padding:16px 20px;background:var(--white);border-bottom:1px solid var(--border)}
        .chat-user{flex:1;display:flex;align-items:center;gap:10px}
        .chat-user span{font-size:32px}
        .chat-user h4{font-size:15px}
        .online{font-size:12px;color:var(--success)}
        .chat-header>button{width:44px;height:44px;background:var(--bg);border:none;border-radius:50%;font-size:18px;cursor:pointer}
        .chat-msgs{flex:1;padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:12px}
        .msg{max-width:80%}
        .msg.sent{align-self:flex-end}
        .msg.received{align-self:flex-start}
        .msg p{padding:12px 16px;border-radius:var(--r-lg);font-size:14px}
        .msg.sent p{background:var(--pri);color:var(--white);border-bottom-right-radius:4px}
        .msg.received p{background:var(--bg);border-bottom-left-radius:4px}
        .msg span{font-size:11px;color:var(--text-light);margin-top:4px;display:block}
        .msg.sent span{text-align:right}
        .chat-input{display:flex;align-items:center;gap:12px;padding:16px 20px;background:var(--white);border-top:1px solid var(--border)}
        .chat-input button{width:40px;height:40px;background:var(--bg);border:none;border-radius:50%;font-size:18px;cursor:pointer}
        .chat-input input{flex:1;padding:12px 16px;border:1px solid var(--border);border-radius:var(--r-xl);font-size:14px;outline:none}
        .chat-input .send{background:var(--pri);color:var(--white)}
        
        /* Profile */
        .profile-header{text-align:center;padding:20px 0;border-bottom:1px solid var(--border);margin-bottom:20px}
        .profile-header h2{font-family:var(--font-display);font-size:24px;margin:12px 0 4px}
        .profile-header p{color:var(--text-light);font-size:14px;margin-bottom:16px}
        .profile-stats{display:flex;justify-content:center;gap:32px;padding:20px 0;border-bottom:1px solid var(--border);margin-bottom:20px}
        .profile-stats div{text-align:center}
        .profile-stats strong{font-size:20px;display:block}
        .profile-stats span{font-size:12px;color:var(--text-light)}
        .menu-section{margin-bottom:24px}
        .menu-section h4{font-size:13px;color:var(--text-light);margin-bottom:12px;text-transform:uppercase}
        .menu-item{width:100%;display:flex;align-items:center;gap:12px;padding:14px;background:var(--white);border:none;border-radius:var(--r-md);font-size:15px;cursor:pointer;margin-bottom:8px;text-align:left}
        .menu-item span:first-child{font-size:20px}
        .menu-item span:last-child{margin-left:auto;color:var(--text-light)}
        .menu-item.danger{color:var(--danger)}
        
        /* Map */
        .map-screen{height:100vh;display:flex;flex-direction:column}
        .map-header{display:flex;gap:12px;padding:16px 20px;background:var(--white);position:absolute;top:0;left:0;right:0;z-index:100}
        .search-mini{flex:1;display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r-xl);padding:10px 14px}
        .search-mini input{flex:1;border:none;background:none;outline:none;font-size:14px}
        .map-header>button{width:44px;height:44px;background:var(--white);border:1px solid var(--border);border-radius:50%;font-size:18px;cursor:pointer}
        .full-map{flex:1}
        .pin{position:absolute;display:flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform .2s}
        .pin:hover{transform:scale(1.2);z-index:10}
        .pin-icon{font-size:28px;background:var(--white);padding:8px;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.2)}
        .pin-price{background:var(--sec);color:var(--white);font-size:11px;font-weight:600;padding:3px 8px;border-radius:100px;margin-top:-4px}
        .map-cards{position:absolute;bottom:20px;left:0;right:0;display:flex;gap:12px;padding:0 20px;overflow-x:auto}
        .map-card{display:flex;align-items:center;gap:12px;background:var(--white);padding:14px;border-radius:var(--r-md);min-width:280px;box-shadow:0 4px 16px var(--shadow);cursor:pointer}
        .map-card span:first-child{font-size:32px}
        .map-card h4{font-size:14px}
        .map-card p{font-size:12px;color:var(--text-light)}
        .map-card .price{font-size:16px;font-weight:700;color:var(--pri)}

        /* Leaflet Map Styles */
        .leaflet-map-container{width:100%;height:100%}
        .leaflet-custom-marker{background:none!important;border:none!important}
        .marker-bubble{display:flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform 0.2s ease}
        .marker-bubble:hover{transform:scale(1.15)}
        .marker-bubble .marker-emoji{font-size:22px;background:var(--white);padding:8px;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3)}
        .marker-bubble .marker-price{background:var(--sec);color:var(--white);font-size:10px;font-weight:600;padding:2px 8px;border-radius:100px;margin-top:-8px;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,.2)}
        .map-popup-content h4{font-size:14px;margin:0 0 4px 0;color:var(--sec)}
        .map-popup-content p{font-size:12px;color:var(--text-light);margin:2px 0}
        .map-popup-content .popup-price{font-weight:700;color:var(--pri)}
        .map-popup-content .popup-location{font-size:11px;color:var(--text-light)}
        .leaflet-popup-content-wrapper{border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.15)}
        .leaflet-popup-content{margin:12px 14px}
        .leaflet-popup-tip{display:none}
        .leaflet-control-zoom{border:none!important;box-shadow:0 2px 8px rgba(0,0,0,.15)!important}
        .leaflet-control-zoom a{background:var(--white)!important;color:var(--sec)!important;border:none!important;width:36px!important;height:36px!important;line-height:36px!important;font-size:18px!important}
        .leaflet-control-zoom a:hover{background:var(--bg)!important}

        /* Dashboard */
        .dashboard{padding:20px;padding-bottom:100px}
        .dash-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
        .dash-header h1{font-family:var(--font-display);font-size:24px}
        .dash-header p{font-size:14px;color:var(--pri)}
        .earnings-card{background:linear-gradient(135deg,var(--sec),#4A4E6D);color:var(--white);padding:24px;border-radius:var(--r-lg);margin-bottom:24px}
        .earn-header{display:flex;justify-content:space-between;margin-bottom:8px}
        .earn-header span{font-size:14px;opacity:.8}
        .earn-header button{background:rgba(255,255,255,.2);border:none;color:var(--white);padding:8px 16px;border-radius:var(--r-xl);font-size:13px;cursor:pointer}
        .earn-amount{font-size:42px;font-weight:700;margin-bottom:16px}
        .earn-stats{display:flex;gap:24px}
        .earn-stats div{text-align:center}
        .earn-stats strong{font-size:20px;display:block}
        .earn-stats span{font-size:12px;opacity:.7}
        .quick-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px}
        .quick-actions button{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 8px;background:var(--white);border:1px solid var(--border);border-radius:var(--r-md);font-size:12px;cursor:pointer}
        .quick-actions span{font-size:24px}
        .today-bookings{display:grid;gap:10px}
        .today-item{display:flex;align-items:center;gap:14px;background:var(--white);padding:14px;border-radius:var(--r-md);border:1px solid var(--border)}
        .time-col{text-align:center;min-width:60px}
        .time-col .time{font-size:14px;font-weight:600;display:block}
        .live-badge{font-size:10px;background:var(--danger);color:var(--white);padding:2px 6px;border-radius:100px}
        .today-item h4{font-size:15px}
        .today-item p{font-size:13px;color:var(--text-light)}
        .today-item button{margin-left:auto;padding:8px 16px;background:var(--pri);color:var(--white);border:none;border-radius:var(--r-xl);font-size:13px;cursor:pointer}
        .link{background:none;border:none;color:var(--pri);font-size:13px;cursor:pointer}
        .level-card{background:var(--white);padding:16px;border-radius:var(--r-md);border:1px solid var(--border)}
        .level-info{display:flex;justify-content:space-between;margin-bottom:8px;font-weight:600}
        .level-bar{height:8px;background:var(--bg);border-radius:100px;overflow:hidden;margin-bottom:10px}
        .fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--pri));border-radius:100px}
        .level-card p{font-size:13px;color:var(--text-light)}
        .my-exps{display:grid;gap:10px;margin-bottom:14px}
        .my-exp{display:flex;align-items:center;gap:12px;background:var(--white);padding:14px;border-radius:var(--r-md);border:1px solid var(--border)}
        .my-exp span{font-size:32px}
        .my-exp div{flex:1}
        .my-exp h4{font-size:15px}
        .my-exp p{font-size:13px;color:var(--text-light)}
        .my-exp button{padding:8px 16px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r-xl);font-size:13px;cursor:pointer}
        .add-exp-btn{width:100%;padding:16px;background:var(--bg);border:2px dashed var(--border);border-radius:var(--r-md);font-size:15px;cursor:pointer}
        
        /* Training */
        .training-screen{padding-bottom:40px}
        .training-hero{display:flex;align-items:center;gap:20px;padding:20px;background:var(--warm-light)}
        .level-circle{width:80px;height:80px;background:var(--pri);color:var(--white);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center}
        .level-circle span{font-size:32px;font-weight:700}
        .level-circle small{font-size:11px;opacity:.8}
        .training-hero div{flex:1}
        .training-hero h3{font-size:18px;margin-bottom:4px}
        .training-hero p{font-size:13px;color:var(--text-light);margin-bottom:8px}
        .training-content{padding:20px}
        .training-content h3{font-size:16px;font-weight:600;margin-bottom:14px}
        .training-list{display:grid;gap:10px;margin-bottom:24px}
        .training-item{display:flex;align-items:center;gap:12px;background:var(--white);padding:14px;border-radius:var(--r-md);border:1px solid var(--border)}
        .training-item.done{background:var(--accent-light);border-color:var(--accent)}
        .training-item span{font-size:24px}
        .training-item div{flex:1}
        .training-item h4{font-size:14px}
        .training-item button{padding:8px 16px;background:var(--pri);color:var(--white);border:none;border-radius:var(--r-xl);font-size:13px;cursor:pointer}
        .done-badge{color:var(--success);font-weight:600;font-size:13px}
        .badges-earned{display:flex;gap:10px;flex-wrap:wrap}
        .earned,.locked{padding:10px 16px;border-radius:var(--r-md);font-size:13px}
        .earned{background:var(--accent-light);color:var(--accent)}
        .locked{background:var(--bg);color:var(--text-light)}
        
        /* Add Experience */
        .add-exp{padding-bottom:40px}
        .form-content{padding:20px}
        .form-section{margin-bottom:24px}
        .form-section h4{font-size:15px;font-weight:600;margin-bottom:14px}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .photo-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px}
        .add-photo{padding:40px 20px;background:var(--bg);border:2px dashed var(--border);border-radius:var(--r-md);font-size:13px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px}
        .form-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .save{background:none;border:none;color:var(--pri);font-weight:600;font-size:16px;cursor:pointer}
        
        /* Panel */
        .panel-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center;z-index:1000}
        .panel{background:var(--white);width:100%;max-width:430px;padding:24px;border-radius:var(--r-xl) var(--r-xl) 0 0;max-height:80vh;overflow-y:auto}
        .panel-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
        .panel-header h2{font-size:20px}
        .panel-header button{width:36px;height:36px;background:var(--bg);border:none;border-radius:50%;font-size:20px;cursor:pointer}
        .notifs{display:grid;gap:12px}
        .notif{display:flex;gap:12px;padding:14px;background:var(--bg);border-radius:var(--r-md)}
        .notif span{font-size:24px}
        .notif strong{display:block;font-size:14px;margin-bottom:4px}
        .notif p{font-size:13px;color:var(--text-light)}
        .emergency-opts{display:grid;gap:10px}
        .emergency-opts button{width:100%;padding:16px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);font-size:15px;cursor:pointer;text-align:left}
        .emergency-opts button.danger{background:rgba(239,68,68,.1);border-color:var(--danger);color:var(--danger)}
        
        /* Nav */
        .nav{position:fixed;bottom:0;left:0;right:0;background:var(--white);border-top:1px solid var(--border);display:flex;justify-content:space-around;padding:10px 0 20px;max-width:430px;margin:0 auto;z-index:200}
        .nav button{display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:none;padding:8px 16px;cursor:pointer;color:var(--text-light);font-size:11px}
        .nav button span:first-child{font-size:22px}
        .nav button.active{color:var(--pri)}
        
        @media(min-width:768px){.app{box-shadow:0 0 60px rgba(0,0,0,.1);border-radius:24px;margin:20px auto;min-height:calc(100vh - 40px);overflow:hidden}}
      `}</style>
      <div className="app">{render()}{!hideNav && <Nav/>}</div>
    </>
  );
}