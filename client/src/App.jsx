import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Plus, 
  CheckCircle, 
  Clock, 
  PhoneMissed,
  LayoutDashboard
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [business, setBusiness] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetchBusiness();
    fetchLeads();
  }, []);

  const fetchBusiness = async () => {
    try {
      const res = await axios.get(`${API_BASE}/business`);
      if (!res.data.name) {
        setShowOnboarding(true);
      } else {
        setBusiness(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${API_BASE}/leads`);
      setLeads(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOnboardingSubmit = async (data) => {
    try {
      await axios.post(`${API_BASE}/business`, data);
      setBusiness(data);
      setShowOnboarding(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (showOnboarding) {
    return <Onboarding onSubmit={handleOnboardingSubmit} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-indigo-800">
          AI Sales Pro
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="Leads" 
            active={activeTab === 'leads'} 
            onClick={() => setActiveTab('leads')} 
          />
          <SidebarItem 
            icon={<Calendar size={20} />} 
            label="Bookings" 
            active={activeTab === 'bookings'} 
            onClick={() => setActiveTab('bookings')} 
          />
          <SidebarItem 
            icon={<MessageSquare size={20} />} 
            label="Chat Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>
        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              {business?.name?.[0]}
            </div>
            <div className="text-sm">
              <div className="font-semibold">{business?.name}</div>
              <div className="text-indigo-300 text-xs capitalize">{business?.type}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus size={18} />
            <span>Add Lead</span>
          </button>
        </header>

        <main className="p-6">
          {activeTab === 'dashboard' && <Dashboard leads={leads} onSimulateMissedCall={fetchLeads} />}
          {activeTab === 'leads' && <LeadsList leads={leads} />}
          {activeTab === 'bookings' && <BookingsList leads={leads} />}
          {activeTab === 'settings' && <SettingsPage business={business} />}
        </main>
      </div>
      
      {/* Floating Chat Preview */}
      <ChatWidget business={business} onNewMessage={fetchLeads} />
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div 
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-indigo-800 text-white' : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'}`}
      onClick={onClick}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function Onboarding({ onSubmit }) {
  const [data, setData] = useState({
    name: '',
    type: 'contractor',
    google_review_link: '',
    phone: '',
    email: ''
  });

  return (
    <div className="min-h-screen bg-indigo-5 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-indigo-900 mb-2">Welcome!</h2>
        <p className="text-gray-600 mb-8">Let's set up your AI sales assistant in 60 seconds.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <input 
              type="text" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              placeholder="e.g. Joe's Plumbing"
              value={data.name}
              onChange={e => setData({...data, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Type</label>
            <select 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              value={data.type}
              onChange={e => setData({...data, type: e.target.value})}
            >
              <option value="contractor">Contractor (Plumbing, HVAC, etc.)</option>
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe / Coffee Shop</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number (for SMS notifications)</label>
            <input 
              type="tel" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              placeholder="+1 (555) 000-0000"
              value={data.phone}
              onChange={e => setData({...data, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Google Review Link</label>
            <input 
              type="url" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              placeholder="https://g.page/r/..."
              value={data.google_review_link}
              onChange={e => setData({...data, google_review_link: e.target.value})}
            />
          </div>
          <button 
            onClick={() => onSubmit(data)}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Launch My AI Assistant
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatWidget({ business, onNewMessage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [leadId, setLeadId] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message;
    setMessage('');
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, { leadId, message: userMsg });
      setLeadId(res.data.leadId);
      setChat(prev => [...prev, { role: 'assistant', content: res.data.message }]);
      onNewMessage();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all flex items-center space-x-2 animate-bounce"
        >
          <MessageSquare size={24} />
          <span className="font-semibold">Test AI Chat</span>
        </button>
      ) : (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div className="font-semibold text-sm">Chat with {business?.name}</div>
            <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50">
            {chat.length === 0 && (
              <div className="text-center text-gray-500 text-xs mt-4">
                Send a message to start testing your AI assistant!
              </div>
            )}
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border p-3 rounded-2xl rounded-bl-none shadow-sm flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={sendMessage} className="p-3 border-t bg-white">
            <div className="flex space-x-2">
              <input 
                type="text" 
                className="flex-1 bg-gray-100 border-none rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 shadow-inner"
                placeholder="Type a message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg">
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Dashboard({ leads, onSimulateMissedCall }) {
  const [simulating, setSimulating] = useState(false);

  const simulateMissedCall = async () => {
    setSimulating(true);
    try {
      await axios.post(`${API_BASE}/simulate-missed-call`, { phone: '+1 (555) 123-4567' });
      onSimulateMissedCall();
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: <Users className="text-blue-500" />, change: '+12%' },
    { label: 'Bookings', value: leads.filter(l => l.status === 'booked').length, icon: <Calendar className="text-green-500" />, change: '+5%' },
    { label: 'Missed Calls Repaired', value: leads.filter(l => l.source === 'missed_call').length, icon: <PhoneMissed className="text-red-500" />, change: '+100%' },
    { label: 'Conversion Rate', value: leads.length ? `${Math.round((leads.filter(l => l.status === 'booked').length / leads.length) * 100)}%` : '0%', icon: <BarChart3 className="text-purple-500" />, change: '+2%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Overview</h2>
        <button 
          onClick={simulateMissedCall}
          disabled={simulating}
          className="text-sm bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <PhoneMissed size={16} className="text-red-500" />
          <span>{simulating ? 'Simulating...' : 'Simulate Missed Call'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
              <span className="text-green-500 text-xs font-semibold">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {leads.length === 0 && <div className="text-center py-8 text-gray-500">No leads yet. Use the chat widget!</div>}
            {leads.slice(0, 5).map((lead, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {lead.name?.[0] || 'L'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{lead.name || 'Anonymous Lead'}</div>
                  <div className="text-xs text-gray-500 capitalize">{lead.source.replace('_', ' ')} • {new Date(lead.created_at).toLocaleTimeString()}</div>
                </div>
                <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                  lead.status === 'booked' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {lead.status}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">AI Performance</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Qualification Accuracy</span>
                <span className="font-semibold">94%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Instant Response Rate</span>
                <span className="font-semibold">100%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="text-xs text-gray-500 italic">"The AI assistant has saved approximately 12 hours of manual follow-up this week."</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadsList({ leads }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 font-semibold text-xs uppercase text-gray-500">Lead</th>
            <th className="p-4 font-semibold text-xs uppercase text-gray-500">Source</th>
            <th className="p-4 font-semibold text-xs uppercase text-gray-500">Status</th>
            <th className="p-4 font-semibold text-xs uppercase text-gray-500">Contact</th>
            <th className="p-4 font-semibold text-xs uppercase text-gray-500">Date</th>
            <th className="p-4 font-semibold text-xs uppercase text-gray-500">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y text-sm">
          {leads.map((lead, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="p-4">
                <div className="font-medium">{lead.name || 'Anonymous'}</div>
                <div className="text-xs text-gray-500">{lead.service_needed || 'Inquiry'}</div>
              </td>
              <td className="p-4 capitalize text-xs font-medium text-gray-600">{lead.source.replace('_', ' ')}</td>
              <td className="p-4">
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                  lead.status === 'booked' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {lead.status}
                </span>
              </td>
              <td className="p-4 text-xs">
                <div>{lead.phone || 'N/A'}</div>
                <div className="text-gray-500">{lead.email || ''}</div>
              </td>
              <td className="p-4 text-xs text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</td>
              <td className="p-4">
                <button className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs">View Chat</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingsList({ leads }) {
  const bookings = leads.filter(l => l.status === 'booked');
  return (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">No bookings yet. They'll appear here once AI converts them!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">CONFIRMED</div>
                <Clock size={18} className="text-gray-400" />
              </div>
              <h4 className="font-bold text-lg mb-1">{booking.name || 'New Client'}</h4>
              <p className="text-sm text-gray-500 mb-4">{booking.service_needed || 'In-person Appointment'}</p>
              <div className="border-t pt-4 text-xs text-gray-600 space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar size={14} className="text-indigo-500" />
                  <span className="font-medium">March 15, 2024 at 10:00 AM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneMissed size={14} className="text-indigo-500" />
                  <span>{booking.phone || 'No phone provided'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsPage({ business }) {
  return (
    <div className="bg-white p-8 rounded-xl border shadow-sm max-w-2xl">
      <h3 className="text-xl font-bold mb-6">AI Configuration</h3>
      
      <div className="space-y-8">
        <div>
          <h4 className="font-semibold mb-2 flex items-center space-x-2 text-gray-800">
            <MessageSquare size={18} className="text-indigo-600" />
            <span>Chat Widget Script</span>
          </h4>
          <p className="text-sm text-gray-500 mb-3">Copy this script into your website's &lt;head&gt; tag to enable the AI assistant.</p>
          <div className="relative group">
            <pre className="bg-gray-900 text-indigo-400 p-4 rounded-lg text-xs overflow-x-auto border border-gray-800 shadow-inner">
{`<script src="https://ai-sales-pro.com/widget.js" 
  data-business-id="${business?.id || '123'}" 
  async></script>`}
            </pre>
            <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white text-[10px] px-2 py-1 rounded uppercase font-bold">Copy</button>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gray-800">Missed Call Text Back</h4>
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <PhoneMissed size={20} />
              </div>
              <div>
                <div className="font-semibold text-indigo-900">Status: Active</div>
                <div className="text-xs text-indigo-700 font-medium">Auto-replying to missed calls with AI.</div>
              </div>
            </div>
            <div className="w-11 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-gray-800">Automated Follow-up Logic</h4>
          <div className="space-y-4">
            <FollowUpItem 
              label="Lead Re-engagement" 
              desc="Sends SMS if lead doesn't book within 24 hours" 
              enabled={true} 
            />
            <FollowUpItem 
              label="Appointment Reminders" 
              desc="Sends SMS 2 hours before scheduled booking" 
              enabled={true} 
            />
            <FollowUpItem 
              label="Google Review Request" 
              desc="Sends link 4 hours after service is completed" 
              enabled={true} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FollowUpItem({ label, desc, enabled }) {
  return (
    <div className="flex items-start justify-between border-b pb-4 last:border-0">
      <div>
        <div className="text-sm font-bold text-gray-800">{label}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>
      <div className={`w-10 h-5 rounded-full relative cursor-pointer ${enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}>
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${enabled ? 'right-1' : 'left-1'}`}></div>
      </div>
    </div>
  );
}

export default App;
