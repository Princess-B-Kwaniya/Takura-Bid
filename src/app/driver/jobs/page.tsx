import { DashboardLayout } from '@/components/layout/DashboardLayout'

interface Job {
  id: string
  origin: string
  destination: string
  loadType: string
  weight: string
  rate: number
  status: 'active' | 'completed' | 'pending' | 'in_transit'
  distance: string
  pickupDate: string
  deliveryDate: string
  client: string
  progress?: number
}

const mockJobs: Job[] = []

function getStatusBadge(status: Job['status']) {
  switch (status) {
    case 'active':
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Active</span>
    case 'in_transit':
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">In Transit</span>
    case 'completed':
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Completed</span>
    case 'pending':
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">Pending</span>
    default:
      return null
  }
}

function JobListItem({ job }: { job: Job }) {
  return (
    <div className="list-item p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {job.origin} → {job.destination}
            </h3>
            {getStatusBadge(job.status)}
          </div>
          <p className="text-sm text-gray-600 mb-3">{job.loadType} • {job.weight}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">${job.rate}</span>
          <p className="text-sm text-gray-500">Total Rate</p>
        </div>
      </div>
      
      {job.status === 'in_transit' && job.progress && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{job.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-900 h-2 rounded-full transition-all duration-300" 
              style={{width: `${job.progress}%`}}
            ></div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Distance</p>
          <p className="font-medium text-gray-900">{job.distance}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Client</p>
          <p className="font-medium text-gray-900">{job.client}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pickup</p>
          <p className="font-medium text-gray-900">{new Date(job.pickupDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery</p>
          <p className="font-medium text-gray-900">{new Date(job.deliveryDate).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">Job ID: {job.id}</span>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-ghost">
            View Details
          </button>
          {job.status === 'in_transit' && (
            <button className="btn-primary bg-green-900 hover:bg-green-800">
              Update Progress
            </button>
          )}
          {job.status === 'active' && (
            <button className="btn-primary">
              Start Job
            </button>
          )}
          {job.status === 'completed' && (
            <button className="btn-ghost">
              Download Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MyJobs() {
  // Sort jobs by date (pending/active first, then completed)
  const sortedJobs = [...mockJobs].sort((a, b) => {
    // Completed jobs go to bottom
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;
    
    // Then sort by pickup date
    return new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime();
  });

  const upcomingJobs = sortedJobs.filter(job => job.status !== 'completed');
  const completedJobs = sortedJobs.filter(job => job.status === 'completed');

  return (
    <DashboardLayout userType="driver">
      <div className="content-area">
        {/* Calendar and Map Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Calendar of Availability and Trips */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Schedule & Availability</h2>
            </div>
            <div className="p-6">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                <div className="text-center text-sm font-medium text-gray-600 py-2">Mon</div>
                <div className="text-center text-sm font-medium text-gray-600 py-2">Tue</div>
                <div className="text-center text-sm font-medium text-gray-600 py-2">Wed</div>
                <div className="text-center text-sm font-medium text-gray-600 py-2">Thu</div>
                <div className="text-center text-sm font-medium text-gray-600 py-2">Fri</div>
                <div className="text-center text-sm font-medium text-gray-600 py-2">Sat</div>
                <div className="text-center text-sm font-medium text-gray-600 py-2">Sun</div>
                
                {/* Calendar days with jobs */}
                {Array.from({length: 35}, (_, i) => {
                  const dayNum = i - 4; // Start from 25th of last month
                  const isToday = dayNum === 27;
                  const hasJob = [25, 26, 27, 28, 29].includes(dayNum);
                  const isCurrentMonth = dayNum > 0 && dayNum <= 31;
                  
                  return (
                    <div 
                      key={i} 
                      className={`relative text-center py-2 text-sm border rounded ${
                        isToday 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : isCurrentMonth
                            ? hasJob
                              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                              : 'hover:bg-gray-50 border-gray-200'
                            : 'text-gray-400 border-gray-100'
                      }`}
                    >
                      {dayNum > 0 ? dayNum : dayNum + 31}
                      {hasJob && isCurrentMonth && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Upcoming Jobs Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">Upcoming Jobs</h3>
                {upcomingJobs.length > 0 ? (
                  upcomingJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{job.origin} → {job.destination}</p>
                        <p className="text-xs text-gray-600">{new Date(job.pickupDate).toLocaleDateString()} • {job.distance}</p>
                        <p className="text-xs text-gray-500">Est. Duration: {Math.ceil(parseInt(job.distance) / 80)}h</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">${job.rate}</span>
                        {getStatusBadge(job.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg text-center">No upcoming jobs yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Routes Map */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Route Planning</h2>
            </div>
            <div className="p-6">
              <div className="h-80 bg-gray-50 rounded-lg relative overflow-hidden">
                {/* Simplified Zimbabwe Map */}
                <svg viewBox="0 0 400 300" className="w-full h-full">
                  {/* Map Background */}
                  <rect width="400" height="300" fill="#f8fafc"/>
                  
                  {/* Zimbabwe Border (simplified) */}
                  <path d="M50 80 L350 80 L350 250 L50 250 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2"/>
                  
                  {/* Cities */}
                  <circle cx="120" cy="120" r="4" fill="#3b82f6"/>
                  <text x="128" y="125" fontSize="10" fill="#374151">Harare</text>
                  
                  <circle cx="80" cy="180" r="4" fill="#3b82f6"/>
                  <text x="88" y="185" fontSize="10" fill="#374151">Bulawayo</text>
                  
                  <circle cx="150" cy="160" r="4" fill="#3b82f6"/>
                  <text x="158" y="165" fontSize="10" fill="#374151">Gweru</text>
                  
                  <circle cx="220" cy="140" r="4" fill="#3b82f6"/>
                  <text x="228" y="145" fontSize="10" fill="#374151">Mutare</text>
                  
                  <circle cx="120" cy="220" r="4" fill="#3b82f6"/>
                  <text x="128" y="225" fontSize="10" fill="#374151">Masvingo</text>
                  
                  <circle cx="60" cy="140" r="4" fill="#3b82f6"/>
                  <text x="68" y="145" fontSize="10" fill="#374151">Victoria Falls</text>
                  
                  {/* Routes */}
                  {/* Harare to Bulawayo */}
                  <line x1="120" y1="120" x2="80" y2="180" stroke="#ef4444" strokeWidth="3" strokeDasharray="5,5"/>
                  
                  {/* Gweru to Mutare */}
                  <line x1="150" y1="160" x2="220" y2="140" stroke="#f59e0b" strokeWidth="3"/>
                  
                  {/* Bulawayo to Victoria Falls */}
                  <line x1="80" y1="180" x2="60" y2="140" stroke="#10b981" strokeWidth="3"/>
                  
                  {/* Route indicators */}
                  <text x="100" y="155" fontSize="9" fill="#ef4444">Job 1</text>
                  <text x="180" y="145" fontSize="9" fill="#f59e0b">Job 2</text>
                  <text x="65" y="165" fontSize="9" fill="#10b981">Job 3</text>
                </svg>
              </div>
              
              {/* Route Optimization */}
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-gray-900">Optimized Route Suggestions</h3>
                <p className="text-sm text-gray-500">Route suggestions will appear when you have active jobs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Your Jobs Timeline</h2>
          </div>
          {sortedJobs.length > 0 ? (
            <div className="space-y-0">
              {sortedJobs.map((job) => (
                <JobListItem key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs yet</h3>
              <p className="text-gray-500 text-sm">Your accepted jobs will appear here. Start by bidding on loads from the Load Board.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}