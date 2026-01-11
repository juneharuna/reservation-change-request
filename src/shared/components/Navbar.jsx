import React from 'react';
import { ROLES } from '../constants';
import { UserCircle, Building2, LayoutDashboard } from 'lucide-react';
import logo from '../../assets/logo.png';

const getIcon = (id) => {
    switch (id) {
        case 'carmaster': return <UserCircle size={18} />;
        case 'partner_carview':
        case 'partner_cts': return <Building2 size={18} />;
        case 'manager': return <LayoutDashboard size={18} />;
        default: return null;
    }
};

export default function Navbar({ activeRole, setActiveRole }) {
    return (
        <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src={logo} alt="Hyundai Logo" className="h-8" />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    {ROLES.map((role) => (
                        <button
                            key={role.id}
                            data-testid={`nav-button-${role.id}`}
                            onClick={() => setActiveRole(role.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeRole === role.id
                                ? 'bg-white text-hyundai-navy shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >

                            {getIcon(role.id)}
                            {role.name}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}
