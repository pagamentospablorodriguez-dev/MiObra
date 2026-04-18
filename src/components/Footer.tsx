import { Mail, Phone, MapPin, Facebook, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-100 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
                AO
              </div>
              <span className="font-bold text-lg">AlaObra</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Gestão de obras inteligente. Monitore, controle e otimize suas construções em tempo real.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition">
                <Linkedin size={18} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-300 hover:text-blue-400 transition">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-blue-400 transition">
                  Preços
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-blue-400 transition">
                  Documentação
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-blue-400 transition">
                  Roadmap
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-300 hover:text-blue-400 transition">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-blue-400 transition">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-blue-400 transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-blue-400 transition">
                  Status do Sistema
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:contato@alaobra.com" className="text-slate-300 hover:text-blue-400 transition">
                  contato@alaobra.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <a href="tel:+351234567890" className="text-slate-300 hover:text-blue-400 transition">
                  +351 234 567 890
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">
                  Portugal
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div>
            © {currentYear} AlaObra. Todos os direitos reservados.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-400 transition">
              Termos de Serviço
            </a>
            <a href="#" className="hover:text-blue-400 transition">
              Privacidade
            </a>
            <a href="#" className="hover:text-blue-400 transition">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
