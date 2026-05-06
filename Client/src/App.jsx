import { useState } from "react";
import InfiniteScrollGrid   from "./problems/P01_InfiniteScrollGrid";
import TrelloBoard          from "./problems/P02_BoardWithDnD";
import ProductSearch        from "./problems/P03_SearchWithFilters";
import FormBuilder          from "./problems/P04_FormBuilder";
import RealTimeDashboard    from "./problems/P05_RealTimeDashboard";
import AccessibleModal      from "./problems/P06_AccessibleModal";
import FileUploader         from "./problems/P07_FileUploader";
import EditableDataGrid     from "./problems/P08_DataGridEditable";
import NotificationCenter   from "./problems/P09_NotificationCenter";
import TimerStopwatch       from "./problems/P10_TimerStopwatch";
import MemoryGame           from "./problems/P11_MemoryGame";
import WorkflowBuilder      from "./problems/P12_WorkflowBuilder";
import ExpenseTracker       from "./problems/P13_ExpenseTracker";
import ApprovalWorkflow     from "./problems/P14_ApprovalWorkflow";
import StockWatchlist       from "./problems/P15_StockWatchlist";
import SupportTicketSystem  from "./problems/P16_SupportTicketSystem";
import RichTextEditor       from "./problems/P17_RichTextEditor";
import CalendarScheduler    from "./problems/P18_CalendarScheduler";
import NetworkDiagram       from "./problems/P19_NetworkDiagram";
import CodeReviewTool       from "./problems/P20_CodeReviewTool";
import ProductListingMeesho from "./problems/P21_ProductListingMeesho";
import PaymentCheckout      from "./problems/P22_PaymentCheckout";
import SocialFeed           from "./problems/P23_SocialFeed";
import PortfolioTracker     from "./problems/P24_PortfolioTracker";
import NetworkMonitor       from "./problems/P25_NetworkMonitor";
import AgileBoard           from "./problems/P26_AgileBoard";
import CustomerSupport      from "./problems/P27_CustomerSupport";
import SocialMediaScheduler from "./problems/P28_SocialMediaScheduler";
import InvoiceGenerator     from "./problems/P29_InvoiceGenerator";
import TransactionHistory   from "./problems/P30_TransactionHistory";
import DeviceManager        from "./problems/P31_DeviceManager";
import SurveyBuilder        from "./problems/P32_SurveyBuilder";
import CRMPipeline          from "./problems/P33_CRMPipeline";
import CodePlayground       from "./problems/P34_CodePlayground";
import RideBooking          from "./problems/P35_RideBooking";
import UPIPayment           from "./problems/P36_UPIPayment";
import TradingDashboard     from "./problems/P37_TradingDashboard";
import LinkedInProfile      from "./problems/P38_LinkedInProfile";
import Fantasy11            from "./problems/P39_Fantasy11";
import BrowserDevTools      from "./problems/P40_BrowserDevTools";
import DataBackupManager    from "./problems/P41_DataBackupManager";
import LoanCalculator       from "./problems/P42_LoanCalculator";
import JobBoard             from "./problems/P43_JobBoard";
import MutualFundSIP        from "./problems/P44_MutualFundSIP";
import APITester            from "./problems/P45_APITester";
import VideoStreaming        from "./problems/P46_VideoStreaming";
import CollaborativeDoc     from "./problems/P47_CollaborativeDoc";
import FoodDelivery         from "./problems/P48_FoodDelivery";

const SECTIONS = [
  {
    label: "FAANG / General",
    problems: [
      { id:"p01", label:"Infinite Scroll Grid",    tag:"Meta · Google",            component:InfiniteScrollGrid   },
      { id:"p02", label:"Trello Board (DnD)",       tag:"Atlassian · ServiceNow",   component:TrelloBoard          },
      { id:"p03", label:"Search + Filters",         tag:"Amazon · Flipkart",        component:ProductSearch        },
      { id:"p04", label:"Form Builder",             tag:"ServiceNow · Intuit",      component:FormBuilder          },
      { id:"p05", label:"Real-Time Dashboard",      tag:"ServiceNow · Datadog",     component:RealTimeDashboard    },
      { id:"p06", label:"Accessible Modal",         tag:"Google · Meta · WCAG",     component:AccessibleModal      },
      { id:"p07", label:"File Uploader",            tag:"Dropbox · Google",         component:FileUploader         },
      { id:"p08", label:"Editable Data Grid",       tag:"ServiceNow · Salesforce",  component:EditableDataGrid     },
      { id:"p09", label:"Notification Center",      tag:"Meta · Slack",             component:NotificationCenter   },
      { id:"p10", label:"Timer + Stopwatch",        tag:"Google · Amazon",          component:TimerStopwatch       },
      { id:"p11", label:"Memory Card Game",         tag:"Google · Meta",            component:MemoryGame           },
      { id:"p12", label:"Workflow Builder",         tag:"ServiceNow · Zapier",      component:WorkflowBuilder      },
    ]
  },
  {
    label: "Finance / Payments",
    problems: [
      { id:"p13", label:"Expense Tracker",          tag:"Intuit · JP Morgan · WF",  component:ExpenseTracker       },
      { id:"p14", label:"Approval Workflow",        tag:"ServiceNow · VMware · JPM",component:ApprovalWorkflow     },
      { id:"p15", label:"Stock Watchlist",          tag:"JP Morgan · Wells Fargo",  component:StockWatchlist       },
      { id:"p22", label:"Payment Checkout",         tag:"PayPal · Visa · Mastercard",component:PaymentCheckout     },
      { id:"p24", label:"Portfolio Tracker",        tag:"Fidelity · JP Morgan",     component:PortfolioTracker     },
      { id:"p29", label:"Invoice Generator",        tag:"Intuit · Zoho · Walmart",  component:InvoiceGenerator     },
      { id:"p30", label:"Transaction History",      tag:"Visa · Mastercard · PayPal",component:TransactionHistory  },
    ]
  },
  {
    label: "ServiceNow / VMware / Broadcom",
    problems: [
      { id:"p16", label:"Support Ticket System",    tag:"ServiceNow · VMware",      component:SupportTicketSystem  },
      { id:"p17", label:"Rich Text Editor",         tag:"Intuit · ServiceNow",      component:RichTextEditor       },
      { id:"p18", label:"Calendar Scheduler",       tag:"ServiceNow · VMware",      component:CalendarScheduler    },
      { id:"p19", label:"Network Diagram",          tag:"VMware · Broadcom",        component:NetworkDiagram       },
      { id:"p20", label:"Code Review / Diff",       tag:"VMware · Broadcom",        component:CodeReviewTool       },
      { id:"p25", label:"Network Monitor",          tag:"Cisco · Intel · VMware",   component:NetworkMonitor       },
      { id:"p31", label:"IoT Device Manager",       tag:"Cisco · Intel · Broadcom", component:DeviceManager        },
    ]
  },
  {
    label: "E-Commerce / Retail",
    problems: [
      { id:"p21", label:"Product Listing",          tag:"Meesho · Flipkart",        component:ProductListingMeesho },
    ]
  },
  {
    label: "Social / CRM / SaaS",
    problems: [
      { id:"p23", label:"Social Media Feed",        tag:"Sprinklr · Freshworks",    component:SocialFeed           },
      { id:"p26", label:"Agile Sprint Board",       tag:"Atlassian · Thoughtworks", component:AgileBoard           },
      { id:"p27", label:"Customer Support Chat",    tag:"Freshworks · Zoho",        component:CustomerSupport      },
      { id:"p28", label:"Social Media Scheduler",   tag:"Sprinklr · Hootsuite",     component:SocialMediaScheduler },
      { id:"p32", label:"Survey Builder",           tag:"Zoho · Freshworks",        component:SurveyBuilder        },
      { id:"p33", label:"CRM Sales Pipeline",       tag:"Freshworks · Zoho CRM",    component:CRMPipeline          },
    ]
  },
  {
    label: "Dev Tools",
    problems: [
      { id:"p34", label:"Live Code Playground",     tag:"Thoughtworks · Atlassian", component:CodePlayground       },
      { id:"p40", label:"Browser DevTools Clone",   tag:"BrowserStack · Atlassian", component:BrowserDevTools      },
      { id:"p45", label:"API Tester (Postman)",      tag:"BrowserStack · Thoughtworks",component:APITester          },
      { id:"p47", label:"Collaborative Doc Editor", tag:"Atlassian · Notion",       component:CollaborativeDoc     },
    ]
  },
  {
    label: "Mobility / Delivery",
    problems: [
      { id:"p35", label:"Ride Booking App",          tag:"Uber · Gojek · Ola",       component:RideBooking          },
      { id:"p48", label:"Food Delivery App",         tag:"Swiggy · Zomato · Gojek",  component:FoodDelivery         },
    ]
  },
  {
    label: "Fintech / Payments",
    problems: [
      { id:"p36", label:"UPI Payment Interface",     tag:"Paytm · PhonePe · Razorpay",component:UPIPayment          },
      { id:"p37", label:"Trading Dashboard",         tag:"Groww · DE Shaw · Arcesium",component:TradingDashboard    },
      { id:"p41", label:"Data Backup Manager",       tag:"Rubrik · Cohesity",         component:DataBackupManager   },
      { id:"p42", label:"Loan / EMI Calculator",     tag:"Citibank · Paytm Money",    component:LoanCalculator      },
      { id:"p44", label:"Mutual Fund SIP",           tag:"Groww · Zerodha · Fidelity",component:MutualFundSIP       },
    ]
  },
  {
    label: "Social / Career",
    problems: [
      { id:"p38", label:"LinkedIn Profile",          tag:"LinkedIn · Sprinklr",       component:LinkedInProfile      },
      { id:"p39", label:"Fantasy Team Builder",      tag:"Dream11 · MPL",             component:Fantasy11            },
      { id:"p43", label:"Job Board",                 tag:"LinkedIn · Codenation",     component:JobBoard             },
      { id:"p46", label:"Video Streaming",           tag:"Hotstar · Netflix India",   component:VideoStreaming        },
    ]
  },
];

const ALL_PROBLEMS = SECTIONS.flatMap(s => s.problems);

export default function App() {
  const [active,    setActive]    = useState("p01");
  const [collapsed, setCollapsed] = useState({});

  const current   = ALL_PROBLEMS.find(p => p.id === active);
  const Component = current.component;

  const toggle = (label) => setCollapsed(c => ({ ...c, [label]: !c[label] }));

  return (
    <div className="mc-root">

      {/* ── Sidebar ── */}
      <nav className="mc-sidebar">

        {/* Brand */}
        <div className="mc-brand">
          <div className="mc-brand-title">Machine Coding</div>
          <div className="mc-brand-sub">
            {ALL_PROBLEMS.length} problems · FAANG + Product Companies
          </div>
        </div>

      {/* Scrollable nav */}
      <div className="mc-nav-scroll">
        {SECTIONS.map(section => (
          <div key={section.label}>
            <button
              className="mc-section-btn"
              onClick={() => toggle(section.label)}
            >
              <span className="mc-section-label">{section.label}</span>
              <span className={`mc-section-arrow ${!collapsed[section.label] ? "open" : ""}`}>
                ▶
              </span>
            </button>

            {!collapsed[section.label] && section.problems.map(p => {
              const idx = ALL_PROBLEMS.findIndex(x => x.id === p.id);
              return (
                <button
                  key={p.id}
                  className={`mc-nav-btn ${active === p.id ? "active" : ""}`}
                  onClick={() => setActive(p.id)}
                >
                  <div className="mc-nav-row">
                    <span className="mc-nav-num">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="mc-nav-label">{p.label}</span>
                  </div>
                  <div className="mc-nav-tag">{p.tag}</div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      </nav>

      {/* ── Main content ── */}
      <main className="mc-main">
        <Component />
      </main>

    </div>
  );
}
