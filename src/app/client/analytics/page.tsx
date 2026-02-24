import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function ClientAnalytics() {
  return (
    <DashboardLayout userType="client">
      <div className="content-area">
        {/* Page Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Shipping Analytics</h1>
              <p className="page-subtitle">Track your logistics performance and shipping insights</p>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="stats-grid mb-8">
          <div className="stat-card">
            <div className="stat-value">$0</div>
            <div className="stat-label">Total Shipping Costs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">—</div>
            <div className="stat-label">On-Time Delivery</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Total Shipments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">—</div>
            <div className="stat-label">Avg Cost/Mile</div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Total Shipping Costs Over Time */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Total Shipping Costs Over Time</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">This Month: —</span>
                  <span className="text-sm text-gray-600">Monthly Avg: —</span>
                </div>
              </div>
              <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <p className="text-sm text-gray-400">Shipping cost data will appear after your first completed shipment.</p>
              </div>
            </div>
          </div>

          {/* On-Time Delivery Rate */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">On-Time Delivery Rate</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">This Month: —</span>
                  <span className="text-sm text-gray-600">Target: 95%</span>
                </div>
              </div>
              <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <p className="text-sm text-gray-400">Delivery rate data will appear as shipments are completed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analytics Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Shipment Volume by Route/Region */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Shipment Volume by Route/Region</h2>
            </div>
            <div className="p-6">
              <div className="h-48 flex items-center justify-center">
                <p className="text-sm text-gray-400">Route data will appear after your first shipments.</p>
              </div>
            </div>
          </div>

          {/* Average Cost per Mile/Load */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Average Cost per Mile / Load</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Average: —</span>
                  <span className="text-sm text-gray-600">Range: —</span>
                </div>
              </div>
              <div className="h-48 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <p className="text-sm text-gray-400">Cost data will populate as you complete shipments.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Monthly Performance Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">—</div>
                <div className="text-sm text-gray-600">Cost Savings vs Last Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">—</div>
                <div className="text-sm text-gray-600">Average Delivery Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">—</div>
                <div className="text-sm text-gray-600">Driver Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}