import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Scissors } from 'lucide-react'

const Footer = () => (
  <footer className="border-t border-white/5 mt-20" style={{ background: '#0a0f1e' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              <Scissors size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              Salon<span className="text-gradient">Ease</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Premium salon booking platform. Find the best barbers, book appointments, and look your best.
          </p>
          <div className="flex gap-3 mt-4">
            {['IG', 'TW', 'FB'].map((icon) => (
              <button key={icon} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white border border-white/5 hover:border-white/20 transition-all text-xs font-bold">
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
          <ul className="space-y-2.5">
            {[['Home', '/'], ['Browse Salons', '/salons'], ['Login', '/login'], ['Register', '/register']].map(([label, path]) => (
              <li key={path}>
                <Link to={path} className="text-slate-500 hover:text-primary-400 text-sm transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* For Business */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">For Business</h4>
          <ul className="space-y-2.5">
            {[['Register Salon', '/register?role=OWNER'], ['Barber Login', '/login'], ['Owner Dashboard', '/dashboard/owner']].map(([label, path]) => (
              <li key={label}>
                <Link to={path} className="text-slate-500 hover:text-primary-400 text-sm transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-slate-500 text-sm">
              <Mail size={14} className="text-primary-500" /> support@salonease.com
            </li>
            <li className="flex items-center gap-2 text-slate-500 text-sm">
              <Phone size={14} className="text-primary-500" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin size={14} className="text-primary-500" /> Bangalore, India
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-slate-600 text-xs">© 2026 SalonEase. All rights reserved.</p>
        <p className="text-slate-600 text-xs">Built with ❤️ for premium salon experiences</p>
      </div>
    </div>
  </footer>
)

export default Footer
